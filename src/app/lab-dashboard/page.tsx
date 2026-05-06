"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Beaker, Search, RefreshCw, X, Plus, Copy, Check, Trash2, ExternalLink, Clock, Phone, MapPin, UploadCloud, FileX, ShieldCheck, Lock, ArrowRight } from "lucide-react";
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
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUploadReport = async (bookingId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file limit & extension
    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file.");
      return;
    }
    if (!supabase) {
      alert("Cannot upload in mock mode.");
      return;
    }

    setUploadingId(bookingId);
    try {
      const fileName = `${bookingId}.pdf`;
      const { data, error } = await supabase.storage
        .from('lab-reports')
        .upload(fileName, file, { upsert: true });
        
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage
        .from('lab-reports')
        .getPublicUrl(fileName);
        
      const report_url = publicUrlData.publicUrl;
      const report_uploaded_at = new Date().toISOString();
      const newStatus = 'Report Ready' as BookingStatus;
      
      const { error: dbError } = await supabase.from('bookings').update({ 
        report_url, 
        report_uploaded_at,
        status: newStatus 
      }).eq('id', bookingId);
      
      if (dbError) throw dbError;
      
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, report_url, report_uploaded_at, status: newStatus } : b));
      alert("Report uploaded successfully and status changed to Report Ready!");
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploadingId(null);
    }
  };



  const handleDeleteSingleReport = async (bookingId: string) => {
    if (!supabase) return;
    if (!confirm("Are you sure you want to delete this specific report? This cannot be undone.")) return;

    setUploadingId(bookingId);
    try {
      const fileName = `${bookingId}.pdf`;
      const { error: storageError } = await supabase.storage.from('lab-reports').remove([fileName]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('bookings').update({ 
        report_url: null, 
        report_uploaded_at: null 
      }).eq('id', bookingId);
      
      if (dbError) throw dbError;

      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, report_url: undefined, report_uploaded_at: undefined } : b));
      alert("Report deleted successfully.");
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    } finally {
      setUploadingId(null);
    }
  };

  // New patient form state
  const [form, setForm] = useState(() => ({
    id: generateId(),
    patient_name: "",
    test_name: "",
    phlebotomist_name: "",
    status: "Booking Confirmed" as BookingStatus,
  }));
  const [saving, setSaving] = useState(false);

  const handleAddBooking = async () => {
    setSaving(true);
    try {
      if (supabase) {
        const { error } = await supabase.from('bookings').insert([{
          ...form,
          date: new Date().toISOString()
        }]);
        if (error) throw error;
      } else {
        const localData = localStorage.getItem('arush_mock_bookings');
        const db = localData ? JSON.parse(localData) : DEMO_BOOKING_DB;
        const newRecord = { ...form, date: new Date().toISOString() };
        localStorage.setItem('arush_mock_bookings', JSON.stringify([newRecord, ...db]));
      }
      alert("Patient added successfully!");
      setShowModal(false);
      setForm({
        id: generateId(),
        patient_name: "",
        test_name: "",
        phlebotomist_name: "",
        status: "Booking Confirmed" as BookingStatus,
      });
      await fetchBookings();
    } catch (e: any) {
      alert("Failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

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
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Brand Logo */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white/10 p-4 rounded-3xl backdrop-blur-xl border border-white/20 mb-4 shadow-2xl"
            >
              <Beaker className="w-12 h-12 text-blue-400" />
            </motion.div>
            <h1 className="text-white text-3xl font-black tracking-tighter flex items-center gap-2">
              ARUSH <span className="text-blue-400">ADMIN</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm mt-2 tracking-widest uppercase">Security Portal</p>
          </div>

          <form 
            onSubmit={handleLogin} 
            className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group"
          >
            {/* Subtle light streak */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Confidential Access
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 text-white p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
                    placeholder="Master Password"
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white py-4 rounded-2xl text-lg font-black transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group/btn"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 py-4 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                End-to-End Encrypted
              </div>
            </div>
          </form>

          <p className="text-center mt-8 text-slate-600 text-xs font-medium">
            Authorized Personnel Only • &copy; 2026 ARUSH Lab
          </p>
        </motion.div>
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                  </div>
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Are you sure you want to delete the booking for <span className="font-semibold text-slate-900">{deleteConfirm.name}</span>? All associated medical data will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete} 
                    disabled={saving}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Deleting..." : "Delete Record"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <span className="font-bold text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">Arush Lab</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">Diagnostic Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">System Operational</span>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all font-semibold text-sm border border-slate-200 shadow-sm" 
              onClick={() => setIsAuthenticated(false)}
            >
              Sign Out
              <ArrowRight className="w-4 h-4 opacity-40" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Active Bookings</h1>
            <p className="text-slate-500 text-lg">Manage patient registrations and diagnostic deliverables.</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, ID, or test..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 outline-none transition-all shadow-sm placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Loading Records</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Matching Records</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Try refining your search terms or clearing filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Professional Table */}
              <table className="w-full text-left hidden lg:table border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Test Ordered</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Internal Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Deliverables</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-slate-900 mb-1">{booking.patient_name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{booking.id}</span>
                            <span className="text-[11px] font-medium text-slate-400">• {new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-semibold text-slate-700">{booking.test_name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="relative">
                          <select
                            value={booking.status}
                            onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                            className={`appearance-none border rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer w-48 ${getStatusColor(booking.status)}`}
                          >
                            <option value="Booking Confirmed">Booking Confirmed</option>
                            <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Testing">Testing</option>
                            <option value="Report Ready">Report Ready</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {booking.report_url ? (
                            <button 
                              onClick={() => void handleDeleteSingleReport(booking.id)} 
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
                            >
                               <FileX className="w-3.5 h-3.5" /> Purge
                            </button>
                          ) : (
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm">
                               <UploadCloud className="w-3.5 h-3.5" /> Finalize
                               <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                            </label>
                          )}
                          <Link href={`/track?id=${booking.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} 
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Professional View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <div key={booking.id} className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{booking.patient_name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{booking.id}</span>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test Ordered</span>
                        <span className="text-sm font-semibold text-slate-700">{booking.test_name}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</span>
                        <div className={`text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-md border inline-block text-center ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {booking.report_url ? (
                        <button onClick={() => void handleDeleteSingleReport(booking.id)} className="flex-1 py-3 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-red-100">
                           Purge Report
                        </button>
                      ) : (
                        <label className="flex-1 py-3 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md">
                           <UploadCloud className="w-4 h-4" /> Upload Report
                           <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                        </label>
                      )}
                      <Link href={`/track?id=${booking.id}`} className="p-3 border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center aspect-square shadow-sm">
                         <ExternalLink className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 py-12 border-t border-slate-200 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.4em]">Arush Diagnostics • Enterprise Control Center • v2.1.0</p>
      </footer>
    </div>
  );
}

