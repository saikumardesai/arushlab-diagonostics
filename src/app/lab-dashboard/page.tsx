"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Beaker, Search, RefreshCw, X, Plus, Copy, Check, Trash2, ExternalLink, Clock, Phone, MapPin, UploadCloud, FileX, ShieldCheck, Lock, ArrowRight, LayoutDashboard, IndianRupee, PlusCircle } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'pricing'>('bookings');
  
  // Pricing state
  const [tests, setTests] = useState<{id: number, name: string, price: number}[]>([]);
  const [fetchingTests, setFetchingTests] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({ name: "", price: "" });

  const fetchTests = useCallback(async () => {
    if (!supabase) return;
    setFetchingTests(true);
    try {
      const { data, error } = await supabase.from('tests').select('*').order('name');
      if (error) throw error;
      setTests(data || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setFetchingTests(false);
    }
  }, []);

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

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('tests').insert([{ 
        name: testForm.name, 
        price: parseFloat(testForm.price) 
      }]);
      if (error) throw error;
      alert("Test added successfully!");
      setTestForm({ name: "", price: "" });
      setShowTestModal(false);
      await fetchTests();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (id: number) => {
    if (!supabase || !confirm("Delete this test from the price list?")) return;
    try {
      const { error } = await supabase.from('tests').delete().eq('id', id);
      if (error) throw error;
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      alert("Error: " + e.message);
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
      void fetchTests();
    }
  }, [isAuthenticated, fetchBookings, fetchTests]);

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
      </AnimatePresence>      {/* Responsive Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#1E3A8A]">
            <Beaker className="w-5 h-5 sm:w-6 sm:h-6" />
            <h1 className="text-base sm:text-xl font-bold tracking-tight">Admin Portal</h1>
          </div>
          
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
             >
                <LayoutDashboard className="w-3.5 h-3.5" /> Bookings
             </button>
             <button 
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'pricing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
             >
                <IndianRupee className="w-3.5 h-3.5" /> Pricing
             </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-sm font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors" onClick={() => setIsAuthenticated(false)}>Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 mt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' ? (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Responsive Toolbar */}
              <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800 uppercase tracking-tight">Patient Bookings ({filtered.length})</h2>
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
                    <button className="gap-2 px-3 py-2 bg-blue-600 text-white border border-blue-700 rounded-xl sm:rounded-lg hover:bg-blue-700 flex items-center text-sm font-bold transition-all flex-shrink-0 active:scale-95" onClick={() => setShowModal(true)}>
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Patient</span>
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
                            {booking.report_url ? (
                              <button 
                                onClick={() => void handleDeleteSingleReport(booking.id)}
                                disabled={uploadingId === booking.id}
                                className="p-2 text-red-600 bg-red-50 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-all"
                                title="Delete Report"
                              >
                                 {uploadingId === booking.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileX className="w-4 h-4" />}
                              </button>
                            ) : (
                              <label className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 cursor-pointer" title="Upload PDF Report">
                                 {uploadingId === booking.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                 <input type="file" accept=".pdf" className="hidden" disabled={uploadingId === booking.id} onChange={(e) => void handleUploadReport(booking.id, e)} />
                              </label>
                            )}
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
                          <th className="px-6 py-4 font-bold text-[#1E3A8A] text-center">Report</th>
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
                               {booking.report_url ? (
                                <button 
                                  onClick={() => void handleDeleteSingleReport(booking.id)}
                                  disabled={uploadingId === booking.id}
                                  className="inline-flex items-center justify-center p-2.5 px-3 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all"
                                  title="Delete This Report"
                                >
                                   {uploadingId === booking.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><FileX className="w-4 h-4 mr-1" /> <span className="text-[10px] font-bold uppercase tracking-tight">Delete</span></>}
                                </button>
                               ) : (
                                <label className="inline-flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 cursor-pointer" title="Upload PDF Report">
                                  {uploadingId === booking.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                  <input type="file" accept=".pdf" className="hidden" disabled={uploadingId === booking.id} onChange={(e) => void handleUploadReport(booking.id, e)} />
                                </label>
                               )}
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
            </motion.div>
          ) : (
            <motion.div 
              key="pricing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
               <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Test Pricing Management</h2>
                    <p className="text-sm text-slate-500">Add or remove tests from your public website list.</p>
                  </div>
                  <button 
                    onClick={() => setShowTestModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                  >
                    <PlusCircle className="w-5 h-5" /> Add New Test
                  </button>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50/80 text-slate-600">
                     <tr>
                       <th className="px-6 py-4 font-bold">Test Name</th>
                       <th className="px-6 py-4 font-bold">Category</th>
                       <th className="px-6 py-4 font-bold">Price (₹)</th>
                       <th className="px-6 py-4 font-bold text-center">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {fetchingTests ? (
                       <tr>
                         <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                           <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                           Fetching live price list...
                         </td>
                       </tr>
                     ) : tests.length === 0 ? (
                       <tr>
                         <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                           No tests found in database. Click &quot;Add New Test&quot; to start.
                         </td>
                       </tr>
                     ) : tests.map(test => (
                       <tr key={test.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4 font-bold text-slate-800">{test.name}</td>
                         <td className="px-6 py-4 text-slate-500 font-medium text-xs">General</td>
                         <td className="px-6 py-4 font-black text-blue-600 text-base">₹{test.price}</td>
                         <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => void handleDeleteTest(test.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Test Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTestModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200">
               <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold">Add New Diagnostic Test</h3>
                  <button onClick={() => setShowTestModal(false)}><X className="w-6 h-6" /></button>
               </div>
               <form onSubmit={handleAddTest} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Test Title</label>
                    <input 
                      type="text" 
                      required 
                      value={testForm.name}
                      onChange={e => setTestForm(prev => ({...prev, name: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                      placeholder="e.g. Liver Function Test (LFT)"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Price (INR)</label>
                    <input 
                      type="number" 
                      required 
                      value={testForm.price}
                      onChange={e => setTestForm(prev => ({...prev, price: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-emerald-700"
                      placeholder="0.00"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    {saving ? "Saving..." : "Publish Test to Site"}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

