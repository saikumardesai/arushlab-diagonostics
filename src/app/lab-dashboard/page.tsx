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
    <div className="min-h-screen bg-[#F8FAFC] relative selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] w-full max-w-md border border-slate-100 overflow-hidden relative z-10"
            >
              <div className="p-8 sm:p-12 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-12 transition-transform hover:rotate-0">
                  <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Delete Booking?</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                  You are about to remove <span className="text-slate-900 font-bold underline underline-offset-4 decoration-red-200">{deleteConfirm.name}</span> from the system. This action is permanent.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete} 
                    disabled={saving}
                    className="w-full bg-slate-900 hover:bg-red-600 text-white py-5 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-200"
                  >
                    {saving ? "Processing..." : "Confirm Deletion"}
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(null)} 
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Glass Header */}
      <header className="sticky top-0 z-[100] px-4 sm:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] px-6 sm:px-10 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
               {/* Icon removed as requested */}
               <div className="flex flex-col">
                 <span className="text-slate-900 font-black text-xl tracking-tighter uppercase leading-none">ARUSH</span>
                 <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase mt-1">Management</span>
               </div>
            </div>
            
            <button 
              className="group flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all duration-300 font-bold text-sm active:scale-95 border border-red-100/50" 
              onClick={() => setIsAuthenticated(false)}
            >
              <span>Logout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        {/* Statistics or Quick Info Row could go here */}
        
        <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] border border-slate-100/50 overflow-hidden">
          {/* Enhanced Toolbar */}
          <div className="px-8 sm:px-12 py-10 sm:py-14 border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-transparent">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Live Database</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Active Bookings</h2>
                <p className="text-slate-400 font-medium text-lg">Managing {filtered.length} total laboratory entries</p>
              </div>
              
              <div className="w-full lg:w-auto">
                <div className="relative group max-w-md ml-auto">
                  <div className="absolute inset-0 bg-blue-600/5 rounded-2xl blur-xl group-focus-within:bg-blue-600/10 transition-all" />
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 absolute left-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search patient, test or ID..."
                      className="w-full lg:w-96 pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all placeholder:text-slate-400 font-bold shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Content Area */}
          <div className="px-6 sm:px-10 pb-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 text-slate-300 gap-6">
                <div className="relative">
                  <RefreshCw className="w-16 h-16 animate-spin text-blue-500" />
                  <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse" />
                </div>
                <p className="font-black tracking-[0.3em] uppercase text-xs text-slate-400">Decrypting Records...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                   <Search className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Matching Records</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Adjust your search parameters or check the global database.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop View - High End Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-6 py-4">Patient Information</th>
                        <th className="px-6 py-4">Laboratory Test</th>
                        <th className="px-6 py-4">Internal Status</th>
                        <th className="px-6 py-4">Deliverables</th>
                        <th className="px-6 py-4 text-center">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {filtered.map((booking) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={booking.id} 
                          className="group hover:scale-[1.01] transition-all duration-300"
                        >
                          <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-blue-50/30 rounded-l-[1.5rem] transition-colors border-y border-l border-slate-50/50">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{booking.patient_name}</span>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.id}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors border-y border-slate-50/50">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                {booking.test_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors border-y border-slate-50/50">
                            <div className="relative">
                              <select
                                value={booking.status}
                                onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                                className={`appearance-none border-0 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm w-full ${getStatusColor(booking.status)}`}
                              >
                                <option value="Booking Confirmed">Booking Confirmed</option>
                                <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                                <option value="Sample Collected">Sample Collected</option>
                                <option value="Testing">Testing</option>
                                <option value="Report Ready">Report Ready</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-blue-50/30 transition-colors border-y border-slate-50/50">
                            <div className="flex items-center gap-3">
                              {booking.report_url ? (
                                <button 
                                  onClick={() => void handleDeleteSingleReport(booking.id)} 
                                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100/50 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
                                >
                                   <FileX className="w-3.5 h-3.5" /> Remove Report
                                </button>
                              ) : (
                                <label className="flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl hover:bg-blue-800 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-900/10 active:scale-95">
                                   <UploadCloud className="w-3.5 h-3.5" /> Upload Results
                                   <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                                </label>
                              )}
                              <Link href={`/track?id=${booking.id}`} target="_blank" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-6 bg-slate-50/50 group-hover:bg-blue-50/30 rounded-r-[1.5rem] transition-colors border-y border-r border-slate-50/50 text-center">
                            <button 
                              onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} 
                              className="p-3 text-slate-300 hover:text-red-500 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View - Polished Card View */}
                <div className="lg:hidden space-y-4 pt-4">
                  {filtered.map((booking) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={booking.id} 
                      className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100/50 space-y-6"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-900 text-xl tracking-tight">{booking.patient_name}</h3>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.id}</span>
                             <span className="text-[10px] font-bold text-slate-300">•</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-3 bg-white text-red-400 rounded-2xl shadow-sm border border-slate-100"><Trash2 className="w-5 h-5" /></button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned Test</p>
                           <p className="text-xs font-black text-blue-600 truncate uppercase">{booking.test_name}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Status</p>
                           <div className={`text-[9px] font-black uppercase tracking-widest py-1 px-2 rounded-lg inline-block ${getStatusColor(booking.status)}`}>
                             {booking.status}
                           </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex gap-3">
                            {booking.report_url ? (
                              <button onClick={() => void handleDeleteSingleReport(booking.id)} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 active:scale-95 transition-all">
                                 Delete Report
                              </button>
                            ) : (
                              <label className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer">
                                 <UploadCloud className="w-4 h-4" /> Upload PDF
                                 <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                              </label>
                            )}
                            <Link href={`/track?id=${booking.id}`} className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center aspect-square">
                               <ExternalLink className="w-5 h-5" />
                            </Link>
                         </div>
                         <select
                            value={booking.status}
                            onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-sm appearance-none outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${getStatusColor(booking.status)}`}
                          >
                            <option value="Booking Confirmed">Booking Confirmed</option>
                            <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                            <option value="Sample Collected">Sample Collected</option>
                            <option value="Testing">Testing</option>
                            <option value="Report Ready">Report Ready</option>
                          </select>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Decorative footer text */}
      <div className="text-center pb-10 text-slate-300 font-bold text-[10px] uppercase tracking-[0.5em]">
        Arush Diagnostics Cloud Infrastructure • Secure Access
      </div>
    </div>
  );
}

