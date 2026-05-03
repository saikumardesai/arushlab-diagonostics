"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Beaker, Search, RefreshCw, X, Plus, Copy, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New patient form state
  const [form, setForm] = useState(() => ({
    id: generateId(),
    patient_name: "",
    test_name: "",
    phlebotomist_name: "",
    status: "Booking Confirmed" as BookingStatus,
  }));
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
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchBookings();
    }
  }, [isAuthenticated, fetchBookings]);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (supabase) {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    } else {
      const localData = localStorage.getItem('arush_mock_bookings');
      if (localData) {
        const db = JSON.parse(localData) as BookingRecord[];
        const updated = db.map(b => b.id === id ? { ...b, status: newStatus } : b);
        localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setSaving(true);

    if (supabase) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) {
        alert(`Error deleting: ${error.message}`);
        setSaving(false);
        setDeleteConfirm(null);
        return;
      }
    } else {
      const localData = localStorage.getItem('arush_mock_bookings');
      if (localData) {
        const db = JSON.parse(localData) as BookingRecord[];
        const updated = db.filter(b => b.id !== id);
        localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
      }
    }
    
    await fetchBookings();
    setDeleteConfirm(null);
    setSaving(false);
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
    void navigator.clipboard.writeText(link);
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
            <button type="submit" className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white py-4 rounded-xl text-lg font-bold transition-all active:scale-95 shadow-lg">
              Login to Dashboard
            </button>
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
    <div className="min-h-screen bg-slate-50 relative">
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden relative z-10"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-xl">
                    <Plus className="w-6 h-6 text-teal-600" /> 
                  </div>
                  New Patient
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddPatient} className="p-8 space-y-6">
                <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="font-mono font-black text-[#1E3A8A] text-xl">{form.id}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 ml-1">Patient Name *</label>
                    <input
                      type="text"
                      value={form.patient_name}
                      onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
                      className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 ml-1">Test Name *</label>
                    <input
                      type="text"
                      value={form.test_name}
                      onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))}
                      className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all"
                      placeholder="e.g. Complete Blood Count"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 ml-1">Phlebotomist (optional)</label>
                    <input
                      type="text"
                      value={form.phlebotomist_name}
                      onChange={e => setForm(f => ({ ...f, phlebotomist_name: e.target.value }))}
                      className="w-full mt-1.5 p-4 bg-slate-50 border-2 border-transparent focus:border-teal-500 focus:bg-white rounded-2xl outline-none transition-all"
                      placeholder="e.g. Rahul S."
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-teal-200 disabled:opacity-50">
                    {saving ? "Saving..." : "Add Patient"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden relative z-10"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                  <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">Confirm Delete</h3>
                <p className="text-slate-500 text-base mb-10 leading-relaxed">
                  Are you sure you want to delete patient <span className="font-bold text-red-600 underline underline-offset-4">{deleteConfirm.name}</span>?
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete} 
                    disabled={saving}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-200"
                  >
                    {saving ? "Deleting..." : "Yes, Delete Record"}
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="w-full py-4 px-4 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                  >
                    Keep Patient
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <button className="gap-2 px-3 py-2 border rounded-lg hover:bg-slate-50 flex items-center text-sm font-medium transition-colors" onClick={() => void fetchBookings()}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button 
                className="bg-[#0D9488] hover:bg-teal-700 text-white gap-2 px-6 py-2.5 rounded-xl font-bold flex items-center transition-all shadow-md active:scale-95 hover:shadow-teal-200/50" 
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-5 h-5" /> Add Patient
              </button>
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
                <p className="text-sm mt-1">Click &quot;Add Patient&quot; to create your first booking.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A]">Patient Details</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A]">Test Details</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A]">Status</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] text-center">Tracking Link</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filtered.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{row.patient_name}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{row.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0D9488]">{row.test_name}</div>
                        <div className="text-[11px] text-slate-400">{new Date(row.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={row.status}
                          onChange={(e) => void handleUpdateStatus(row.id, e.target.value as BookingStatus)}
                          className="bg-white border rounded-xl px-3 py-1.5 focus:border-blue-500 outline-none text-xs font-bold shadow-sm"
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => copyTrackingLink(row.id)}
                          className="flex items-center gap-1.5 mx-auto bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold text-[11px] transition-all"
                        >
                          {copiedId === row.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(row.id, row.patient_name)}
                          className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Patient"
                        >
                          <Trash2 className="w-5 h-5" />
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

