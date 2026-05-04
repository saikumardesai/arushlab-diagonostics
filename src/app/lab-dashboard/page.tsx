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
    try {
      if (supabase) {
        const { data, error } = await supabase.from('bookings').select('*').order('date', { ascending: false });
        if (error) {
          console.error('Supabase fetch error:', error.message);
          setBookings([]);
        } else {
          setBookings((data || []) as BookingRecord[]);
        }
      } else {
        try {
          const localData = localStorage.getItem('arush_mock_bookings');
          if (localData) {
            setBookings(JSON.parse(localData));
          } else {
            localStorage.setItem('arush_mock_bookings', JSON.stringify(DEMO_BOOKING_DB));
            setBookings(DEMO_BOOKING_DB);
          }
        } catch (storageError) {
          console.error('localStorage is unavailable', storageError);
          setBookings(DEMO_BOOKING_DB);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
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
      try {
        const localData = localStorage.getItem('arush_mock_bookings');
        if (localData) {
          const db = JSON.parse(localData) as BookingRecord[];
          const updated = db.map(b => b.id === id ? { ...b, status: newStatus } : b);
          localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('localStorage is unavailable', error);
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
      try {
        const localData = localStorage.getItem('arush_mock_bookings');
        if (localData) {
          const db = JSON.parse(localData) as BookingRecord[];
          const updated = db.filter(b => b.id !== id);
          localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
        }
      } catch (error) {
        console.error('localStorage is unavailable', error);
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
    b.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.test_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.id?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Booking Confirmed': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Phlebotomist Assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sample Collected': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Testing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Report Ready': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

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
              className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden relative z-10"
            >
              <div className="p-6 sm:p-10 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 text-red-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform rotate-12">
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2 sm:mb-3 tracking-tight">Confirm Delete</h3>
                <p className="text-slate-500 text-sm sm:text-base mb-6 sm:mb-10 leading-relaxed">
                  Are you sure you want to delete patient <span className="font-bold text-red-600 underline underline-offset-4">{deleteConfirm.name}</span>?
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete} 
                    disabled={saving}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-200"
                  >
                    {saving ? "Deleting..." : "Yes, Delete Record"}
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="w-full py-3 sm:py-4 px-4 text-slate-500 hover:text-slate-800 font-bold transition-colors"
                  >
                    Keep Patient
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Beaker className="w-5 h-5 sm:w-6 sm:h-6" />
            <h1 className="text-base sm:text-xl font-bold tracking-tight">Patient Management</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wide">
              {supabase ? "🟢 Live" : "🟡 Mock"}
            </span>
            <button className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg" onClick={() => setIsAuthenticated(false)}>Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 mt-2 sm:mt-4 lg:mt-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Responsive Toolbar */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Active Bookings ({filtered.length})</h2>
              <div className="flex gap-2 sm:gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search patients..."
                    className="w-full sm:w-56 pl-9 pr-4 py-2.5 sm:py-2 border rounded-xl sm:rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="gap-2 px-3 py-2 border rounded-xl sm:rounded-lg hover:bg-slate-50 flex items-center text-sm font-medium transition-colors flex-shrink-0" onClick={() => void fetchBookings()}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 px-4">
              <p className="font-medium text-center">No patients found.</p>
              <p className="text-sm mt-1 text-center">Customers can book tests directly on the website.</p>
            </div>
          ) : (
            <>
              {/* ===== MOBILE & TABLET: Card Layout (shown below lg) ===== */}
              <div className="lg:hidden divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <div key={booking.id} className="p-4 sm:p-5 hover:bg-blue-50/20 transition-colors">
                    {/* Card Header: Patient name + actions */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-base truncate">{booking.patient_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{booking.id}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link 
                          href={`/track?id=${booking.id}`}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                          title="Track"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })}
                          className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Test Name Badge */}
                    <div className="mb-3">
                      <span className="font-bold text-slate-700 bg-blue-50 px-2.5 py-1 rounded-lg text-xs inline-block border border-blue-100">
                        {booking.test_name}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <span className="bg-slate-100 p-1 rounded-md"><Phone className="w-3 h-3" /></span>
                        <span>{booking.phone || "No Phone"}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-500 font-medium">
                        <span className="bg-slate-100 p-1 rounded-md flex-shrink-0"><MapPin className="w-3 h-3" /></span>
                        <span className="break-words leading-relaxed line-clamp-2">{booking.address || "No Address"}</span>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                      <select
                        value={booking.status}
                        onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                        disabled={saving}
                        className={`flex-1 border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${getStatusColor(booking.status)}`}
                      >
                        <option value="Booking Confirmed">Booking Confirmed</option>
                        <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                        <option value="Sample Collected">Sample Collected</option>
                        <option value="Testing">Testing</option>
                        <option value="Report Ready">Report Ready</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== DESKTOP: Table Layout (shown at lg and above) ===== */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-6 py-4 font-bold text-[#1E3A8A]">Patient Details</th>
                      <th className="px-6 py-4 font-bold text-[#1E3A8A]">Test Details</th>
                      <th className="px-6 py-4 font-bold text-[#1E3A8A]">Contact & Location</th>
                      <th className="px-6 py-4 font-bold text-[#1E3A8A]">Status</th>
                      <th className="px-6 py-4 font-bold text-[#1E3A8A] text-center">Track</th>
                      <th className="px-6 py-4 font-bold text-red-600 text-center">Action</th>
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
                          <span className="font-bold text-slate-700 bg-blue-50 px-2 py-1 rounded-md text-[13px] inline-block">
                            {booking.test_name}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 max-w-[220px]">
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
                            className={`border rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${getStatusColor(booking.status)}`}
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
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

