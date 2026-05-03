"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Beaker, Search, RefreshCw, X, Plus, Copy, Check } from "lucide-react";

function generateId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ARUSH-${num}`;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New patient form state
  const [form, setForm] = useState({
    id: generateId(),
    patient_name: "",
    test_name: "",
    phlebotomist_name: "",
    status: "Booking Confirmed" as BookingStatus,
  });
  const [saving, setSaving] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Incorrect password. Use 'admin123'");
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    if (supabase) {
      const { data } = await supabase.from('bookings').select('*').order('date', { ascending: false });
      if (data) setBookings(data as BookingRecord[]);
    } else {
      const localData = localStorage.getItem('arush_mock_bookings');
      if (localData) {
        setBookings(JSON.parse(localData));
      } else {
        localStorage.setItem('arush_mock_bookings', JSON.stringify(DEMO_BOOKING_DB));
        setBookings(DEMO_BOOKING_DB);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated, fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (supabase) {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    } else {
      const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
      localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim() || !form.test_name.trim()) {
      alert("Please fill in Patient Name and Test Name.");
      return;
    }
    setSaving(true);
    const newRecord: BookingRecord = {
      ...form,
      date: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase.from('bookings').insert([newRecord]);
      if (error) { alert(`Error: ${error.message}`); setSaving(false); return; }
    } else {
      const updated = [newRecord, ...bookings];
      setBookings(updated);
      localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
    }

    await fetchBookings();
    setShowModal(false);
    setForm({ id: generateId(), patient_name: "", test_name: "", phlebotomist_name: "", status: "Booking Confirmed" });
    setSaving(false);
  };

  const copyTrackingLink = (id: string) => {
    const link = `${window.location.origin}/track?id=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex items-center justify-center gap-2 mb-8 text-[#1E3A8A]">
            <Beaker className="w-8 h-8" />
            <h1 className="text-2xl font-bold">ARUSH Admin</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter password..."
              />
            </div>
            <Button type="submit" className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white py-6 rounded-xl text-lg">
              Login to Dashboard
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const statuses: BookingStatus[] = ['Booking Confirmed', 'Phlebotomist Assigned', 'Sample Collected', 'Testing', 'Report Ready'];
  const filtered = bookings.filter(b =>
    b.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    b.test_name.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-teal-600" /> Add New Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Auto-Generated Booking ID</p>
                <p className="font-mono font-bold text-[#1E3A8A] text-lg">{form.id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Patient Name *</label>
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
                  className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Test Name *</label>
                <input
                  type="text"
                  value={form.test_name}
                  onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))}
                  className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Complete Blood Count"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Phlebotomist Name (optional)</label>
                <input
                  type="text"
                  value={form.phlebotomist_name}
                  onChange={e => setForm(f => ({ ...f, phlebotomist_name: e.target.value }))}
                  className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Rahul S."
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Initial Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as BookingStatus }))}
                  className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 py-5">Cancel</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-[#0D9488] hover:bg-teal-700 text-white py-5">
                  {saving ? "Saving..." : "Add Patient & Generate Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1E3A8A]">
          <Beaker className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Patient Test Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wide">
            {supabase ? "🟢 Live Supabase" : "🟡 Mock Mode"}
          </span>
          <button className="text-sm font-medium text-red-500 hover:text-red-700" onClick={() => setIsAuthenticated(false)}>Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Active Bookings ({filtered.length})</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search patients..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
              <Button variant="outline" className="gap-2" onClick={fetchBookings}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button className="bg-[#0D9488] hover:bg-teal-700 text-white gap-2" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" /> Add Patient
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" /> Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <p className="font-medium">No patients found.</p>
                <p className="text-sm mt-1">Click "Add Patient" to create your first booking.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Booking ID</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Test Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4 text-center">Tracking Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filtered.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{row.id}</td>
                      <td className="px-6 py-4 font-semibold">{row.patient_name}</td>
                      <td className="px-6 py-4 text-slate-600">{row.test_name}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={row.status}
                          onChange={(e) => handleUpdateStatus(row.id, e.target.value as BookingStatus)}
                          className="bg-white border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm min-w-[190px]"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.phlebotomist_name || "Unassigned"}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => copyTrackingLink(row.id)}
                          className="flex items-center gap-1.5 mx-auto text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          {copiedId === row.id ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
