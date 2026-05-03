"use client";

import { useState, useEffect } from "react";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Beaker, Search, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Simplified auth for demo
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Incorrect password. Use 'admin123'");
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchBookings = async () => {
      setLoading(true);
      if (supabase) {
        // Future Supabase logic
        const { data } = await supabase.from('bookings').select('*').order('date', { ascending: false });
        if (data) setBookings(data as BookingRecord[]);
      } else {
        // Fallback to localStorage for mock persistence across tabs
        const localData = localStorage.getItem('arush_mock_bookings');
        if (localData) {
          setBookings(JSON.parse(localData));
        } else {
          localStorage.setItem('arush_mock_bookings', JSON.stringify(DEMO_BOOKING_DB));
          setBookings(DEMO_BOOKING_DB);
        }
      }
      setLoading(false);
    };
    
    fetchBookings();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    if (supabase) {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    } else {
      const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
      setBookings(updated);
      localStorage.setItem('arush_mock_bookings', JSON.stringify(updated));
    }
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1E3A8A]">
          <Beaker className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Patient Test Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wide">
            {supabase ? "Live Supabase Mode" : "Local Mock Mode"}
          </span>
          <button className="text-sm font-medium text-red-500 hover:text-red-700" onClick={() => setIsAuthenticated(false)}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Active Bookings</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search Patients..." className="pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              </div>
              <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
              <Button className="bg-[#0D9488] hover:bg-teal-700 text-white">Add New Patient</Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Test Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Tracking Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bookings.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                    <td className="px-6 py-4 font-semibold">{row.patient_name}</td>
                    <td className="px-6 py-4 text-slate-600">{row.test_name}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={row.status} 
                        onChange={(e) => handleUpdateStatus(row.id, e.target.value as BookingStatus)}
                        className="bg-white border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm w-full min-w-[200px]"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.phlebotomist_name || "Unassigned"}</td>
                    <td className="px-6 py-4 text-center">
                      <a href={`/track?id=${row.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        Open Track
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
