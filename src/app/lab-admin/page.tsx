"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Beaker, Search, RefreshCw, X, Plus, Copy, Check, Trash2, ExternalLink, Clock, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
                <p className="text-sm mt-1">Customers can book tests directly on the website.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm min-w-[900px]">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] w-1/4">Patient Details</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] w-1/4">Test Details</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] w-1/4">Contact & Location</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] w-40">Status</th>
                    <th className="px-6 py-4 font-bold text-[#1E3A8A] text-center w-32">Track</th>
                    <th className="px-6 py-4 font-bold text-red-600 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-base">{booking.patient_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{booking.id}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 bg-blue-50 px-2 py-1 rounded-md text-[13px] inline-block w-fit">
                            {booking.test_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                          <div className="flex items-center gap-2 text-slate-600 font-semibold group-hover:text-blue-700 transition-colors">
                            <span className="bg-slate-100 p-1 rounded-md"><Phone className="w-3 h-3" /></span>
                            <span className="text-xs">{booking.phone || "No Phone"}</span>
                          </div>
                          <div className="flex items-start gap-2 text-slate-500 font-medium">
                            <span className="bg-slate-100 p-1 rounded-md flex-shrink-0 mt-0.5"><MapPin className="w-3 h-3" /></span>
                            <span className="text-xs break-words leading-relaxed">{booking.address || "No Address"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={booking.status}
                          onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                          disabled={saving}
                          className="bg-white border rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                          <option value="Booking Confirmed">Booking Confirmed</option>
                          <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                          <option value="Sample Collected">Sample Collected</option>
                          <option value="Testing">Testing</option>
                          <option value="Report Ready">Report Ready</option>
                        </select>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Link 
                          href={`/track?id=${booking.id}`}
                          className="inline-flex items-center justify-center p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                          title="Open Tracking Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })}
                          className="p-2.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Booking"
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

