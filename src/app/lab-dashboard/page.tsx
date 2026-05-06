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
    <div className="min-h-screen bg-[#F1F5F9] relative selection:bg-blue-100 selection:text-blue-900">
      {/* Sophisticated Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-lg border border-slate-100 overflow-hidden relative z-10"
            >
              <div className="p-10 sm:p-14 text-center">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <Trash2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Remove Booking?</h3>
                <p className="text-slate-500 font-medium mb-12 leading-relaxed text-lg">
                  Confirm deletion for patient <span className="text-slate-900 font-extrabold decoration-red-300 underline underline-offset-4">{deleteConfirm.name}</span>. This data will be purged.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete} 
                    disabled={saving}
                    className="py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-red-200"
                  >
                    {saving ? "Deleting..." : "Delete Now"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* High-End Navigation Bar */}
      <nav className="sticky top-0 z-[100] px-4 sm:px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] px-8 sm:px-12 py-5 flex items-center justify-between shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#1E293B] tracking-tighter leading-none">ARUSH <span className="text-blue-600">LAB</span></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 ml-0.5">Admin Control Center</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Secured</span>
              </div>
              <button 
                className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all duration-300 font-bold text-sm shadow-xl shadow-slate-200 active:scale-95" 
                onClick={() => setIsAuthenticated(false)}
              >
                Sign Out
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-32">
        <div className="grid grid-cols-1 gap-10">
          {/* Main Dashboard Section */}
          <section className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
            {/* Glossy Header Overlay */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 opacity-50" />
            
            <div className="px-10 sm:px-16 py-14 sm:py-20 border-b border-slate-50 flex flex-col xl:flex-row xl:items-end justify-between gap-12">
              <div className="space-y-4">
                <h2 className="text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight">Active Bookings</h2>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                  </div>
                  <p className="text-slate-400 font-bold text-xl">{filtered.length} patients currently in system</p>
                </div>
              </div>

              <div className="w-full xl:w-auto">
                <div className="relative group max-w-lg ml-auto">
                  <div className="absolute inset-0 bg-blue-600/5 rounded-[2rem] blur-2xl group-focus-within:bg-blue-600/10 transition-all" />
                  <div className="relative flex items-center">
                    <Search className="w-6 h-6 absolute left-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search name, test or unique ID..."
                      className="w-full xl:w-[450px] pl-16 pr-8 py-6 bg-slate-50/50 border border-transparent rounded-[2rem] text-lg outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500/10 transition-all placeholder:text-slate-300 font-semibold shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-12 pb-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-48 text-slate-200 gap-8">
                  <RefreshCw className="w-20 h-20 animate-spin text-blue-600" />
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase text-slate-400 animate-pulse">Syncing Lab Cloud...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-48 text-center">
                  <div className="w-32 h-32 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
                    <Search className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No Results Found</h3>
                  <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto leading-relaxed">We couldn&apos;t find any records matching your specific search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-10">
                  {/* Desktop Table - Ultra Premium */}
                  <div className="hidden lg:block min-w-[1000px]">
                    <table className="w-full border-separate border-spacing-y-6">
                      <thead>
                        <tr className="text-slate-500 text-sm font-black uppercase tracking-[0.25em]">
                          <th className="px-8 pb-4 font-black">Patient Information</th>
                          <th className="px-8 pb-4 font-black">Laboratory Test</th>
                          <th className="px-8 pb-4 font-black">Internal Status</th>
                          <th className="px-8 pb-4 font-black">Deliverables</th>
                          <th className="px-8 pb-4 text-center font-black">Control</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((booking) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            key={booking.id} 
                            className="group"
                          >
                            <td className="px-8 py-10 bg-slate-50/40 group-hover:bg-white rounded-l-[2.5rem] border-y border-l border-slate-50 transition-all duration-300 group-hover:shadow-[20px_0_40px_rgba(0,0,0,0.02)] group-hover:border-blue-100">
                              <div className="flex flex-col gap-2">
                                <span className="font-black text-slate-900 text-3xl tracking-tight group-hover:text-blue-600 transition-colors leading-none">{booking.patient_name}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-black text-blue-500 uppercase tracking-widest leading-none">{booking.id}</span>
                                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">{new Date(booking.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-10 bg-slate-50/40 group-hover:bg-white border-y border-slate-50 transition-all duration-300 group-hover:border-blue-100">
                              <div className="inline-flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-blue-200">
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                <span className="text-lg font-black text-slate-800 uppercase tracking-tight">{booking.test_name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-10 bg-slate-50/40 group-hover:bg-white border-y border-slate-50 transition-all duration-300 group-hover:border-blue-100">
                              <div className="relative w-full max-w-[240px]">
                                <select
                                  value={booking.status}
                                  onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                                  className={`appearance-none w-full border-2 border-transparent rounded-[1.25rem] px-6 py-4 text-sm font-black uppercase tracking-widest outline-none focus:ring-8 focus:ring-blue-500/5 transition-all cursor-pointer shadow-md group-hover:shadow-lg ${getStatusColor(booking.status)}`}
                                >
                                  <option value="Booking Confirmed">Booking Confirmed</option>
                                  <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                                  <option value="Sample Collected">Sample Collected</option>
                                  <option value="Testing">Testing</option>
                                  <option value="Report Ready">Report Ready</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-8 py-10 bg-slate-50/40 group-hover:bg-white border-y border-slate-50 transition-all duration-300 group-hover:border-blue-100">
                              <div className="flex items-center gap-4">
                                {booking.report_url ? (
                                  <button onClick={() => void handleDeleteSingleReport(booking.id)} className="flex items-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-600 hover:text-white transition-all text-sm font-black uppercase tracking-widest active:scale-95 shadow-sm">
                                     <FileX className="w-5 h-5" /> Purge Report
                                  </button>
                                ) : (
                                  <label className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-700 transition-all text-sm font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-slate-200 active:scale-95">
                                     <UploadCloud className="w-5 h-5" /> Final Results
                                     <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                                  </label>
                                )}
                                <Link href={`/track?id=${booking.id}`} target="_blank" className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                                  <ExternalLink className="w-6 h-6" />
                                </Link>
                              </div>
                            </td>
                            <td className="px-8 py-10 bg-slate-50/40 group-hover:bg-white rounded-r-[2.5rem] border-y border-r border-slate-50 transition-all duration-300 text-center group-hover:border-blue-100">
                              <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all">
                                <Trash2 className="w-7 h-7" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile - Professional Cards */}
                  <div className="lg:hidden space-y-8 pt-6">
                    {filtered.map((booking) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        key={booking.id} 
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] space-y-8"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-black text-[#0F172A] text-2xl tracking-tight leading-none">{booking.patient_name}</h3>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{booking.id}</span>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-4 bg-slate-50 text-red-500 rounded-2xl"><Trash2 className="w-6 h-6" /></button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Test</span>
                             <span className="text-xs font-black text-slate-800 uppercase">{booking.test_name}</span>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</span>
                             <div className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg ${getStatusColor(booking.status)}`}>
                               {booking.status}
                             </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          {booking.report_url ? (
                            <button onClick={() => void handleDeleteSingleReport(booking.id)} className="flex-1 py-5 bg-red-50 text-red-600 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border border-red-100">
                               Purge PDF
                            </button>
                          ) : (
                            <label className="flex-1 py-5 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer">
                               <UploadCloud className="w-5 h-5" /> Add Report
                               <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                            </label>
                          )}
                          <Link href={`/track?id=${booking.id}`} className="p-5 bg-white text-slate-400 rounded-[1.25rem] shadow-sm border border-slate-100 flex items-center justify-center">
                             <ExternalLink className="w-6 h-6" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Corporate Footnote */}
      <footer className="text-center pb-20 opacity-30">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.8em]">ARUSH DIAGNOSTICS • GLOBAL CLOUD INFRASTRUCTURE • SECURED V2.0</p>
      </footer>
    </div>
  );
}

