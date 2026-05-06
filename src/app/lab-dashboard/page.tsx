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

      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Beaker className="w-5 h-5 text-white" />
            </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all active:scale-95 border border-red-100" 
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
          {/* Dashboard Toolbar */}
          <div className="p-6 sm:p-8 border-b border-slate-50 bg-slate-50/30">
            <div className="flex flex-col lg:row sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Bookings</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{filtered.length} records found</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="w-full sm:w-72 pl-11 pr-4 py-3 bg-slate-100/50 border border-transparent rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500/20 transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-bold tracking-widest uppercase text-xs">Synchronizing Data...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400 px-4 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                   <Search className="w-12 h-12 text-slate-200" />
                </div>
                <p className="font-bold text-slate-800 text-lg">No records matched your search</p>
                <p className="text-sm mt-1 font-medium">Try searching for a different patient name or ID.</p>
              </div>
            ) : (
              <>
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-slate-50">
                  {filtered.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-blue-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-slate-800 text-lg leading-tight">{booking.patient_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.id}</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">{booking.test_name}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(booking.status)}`}>{booking.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 cursor-pointer">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report</span>
                           <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              {booking.report_url ? <Check className="w-4 h-4 text-emerald-500" /> : <UploadCloud className="w-4 h-4 text-blue-500" />}
                              <span className="text-xs font-bold text-slate-700">{booking.report_url ? "Uploaded" : "Upload"}</span>
                              <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                           </div>
                        </label>
                        <Link href={`/track?id=${booking.id}`} className="flex flex-col gap-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking</span>
                           <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <ExternalLink className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-bold text-slate-700">Open</span>
                           </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                        <th className="px-8 py-5">Patient & Details</th>
                        <th className="px-8 py-5">Assigned Test</th>
                        <th className="px-8 py-5">Status Tracking</th>
                        <th className="px-8 py-5">Report Access</th>
                        <th className="px-8 py-5 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((booking) => (
                        <tr key={booking.id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-base group-hover:text-blue-700 transition-colors">{booking.patient_name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.id}</span>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              {booking.test_name}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={booking.status}
                              onChange={(e) => void handleUpdateStatus(booking.id, e.target.value as BookingStatus)}
                              className={`border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer ${getStatusColor(booking.status)}`}
                            >
                              <option value="Booking Confirmed">Booking Confirmed</option>
                              <option value="Phlebotomist Assigned">Phlebotomist Assigned</option>
                              <option value="Sample Collected">Sample Collected</option>
                              <option value="Testing">Testing</option>
                              <option value="Report Ready">Report Ready</option>
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {booking.report_url ? (
                                <button onClick={() => void handleDeleteSingleReport(booking.id)} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                   <FileX className="w-3.5 h-3.5" /> Delete Report
                                </button>
                              ) : (
                                <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-100">
                                   <UploadCloud className="w-3.5 h-3.5" /> Upload PDF
                                   <input type="file" accept=".pdf" className="hidden" onChange={(e) => void handleUploadReport(booking.id, e)} />
                                </label>
                              )}
                              <Link href={`/track?id=${booking.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button onClick={() => setDeleteConfirm({ id: booking.id, name: booking.patient_name })} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
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
        </div>
      </main>

      {/* Re-use existing modal code but with premium styling */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative z-10 border border-slate-100">
              <div className="bg-[#1E3A8A] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight uppercase">New Patient Entry</h3>
                  <p className="text-blue-200 text-sm font-medium mt-1 uppercase tracking-widest">Fill in the details for manual booking</p>
                </div>
                <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); void handleAddBooking(); }} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Name</label>
                    <input type="text" required value={form.patient_name} onChange={e => setForm(f => ({...f, patient_name: e.target.value}))} className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Name</label>
                    <input type="text" required value={form.test_name} onChange={e => setForm(f => ({...f, test_name: e.target.value}))} className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="e.g. CBC, LFT" />
                  </div>
                </div>
                <div className="space-y-2 text-center pt-4">
                  <button type="submit" disabled={saving} className="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50">
                    {saving ? "Processing..." : "Confirm Booking"}
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter pt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Secure Patient Data Management
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

