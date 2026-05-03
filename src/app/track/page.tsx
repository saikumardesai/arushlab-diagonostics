"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, DEMO_BOOKING_DB, BookingRecord, BookingStatus } from "@/lib/supabase";
import { CheckCircle2, Circle, Clock, Phone, Beaker, MapPin, RefreshCw, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIMELINE_STEPS: BookingStatus[] = [
  'Booking Confirmed', 
  'Phlebotomist Assigned', 
  'Sample Collected', 
  'Testing', 
  'Report Ready'
];

function TrackContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [searchInput, setSearchInput] = useState("");

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  const fetchBooking = useCallback(async (trackingId: string) => {
    if (!trackingId) return;
    setLoading(true);
    if (supabase) {
      const { data } = await supabase.from('bookings').select('*').eq('id', trackingId).single();
      if (data) {
        setBooking(data as BookingRecord);
        setErrorVisible(false);
      } else {
        setBooking(null);
        setErrorVisible(true);
      }
    } else {
      const localData = localStorage.getItem('arush_mock_bookings');
      const db = localData ? JSON.parse(localData) as BookingRecord[] : DEMO_BOOKING_DB;
      const record = db.find(b => b.id === trackingId);
      if (record) {
        setBooking(record);
        setErrorVisible(false);
      } else {
        setBooking(null);
        setErrorVisible(true);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      void fetchBooking(id);
      const interval = setInterval(() => void fetchBooking(id), 5000);
      return () => clearInterval(interval);
    }
  }, [id, fetchBooking]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/track?id=${searchInput.trim()}`;
    }
  };

  if (loading && !booking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-blue-600"><RefreshCw className="w-8 h-8" /></div></div>;
  }

  if (!id || (!booking && !loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md">
          <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <Beaker className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Track Your Test</h1>
          <p className="text-slate-500 mb-8 font-medium">Enter your ARUSH Tracking ID below to see live updates.</p>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. ARUSH-1234"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <Button type="submit" className="w-full py-7 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 transition-all active:scale-95">
              Track Status
            </Button>
          </form>

          {errorVisible && id && (
            <p className="mt-4 text-red-500 font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-100 animate-shake">
              Record not found for {id}
            </p>
          )}

          <Link href="/" className="mt-8 block text-slate-400 font-bold hover:text-slate-600 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const currentStepIndex = TIMELINE_STEPS.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-blue-700 text-white pt-12 pb-24 px-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <Beaker className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Live Tracking</h1>
        <p className="text-blue-100 font-medium mt-1 uppercase tracking-widest text-sm opacity-80">{booking.id}</p>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto px-4 -mt-16 pb-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 border border-slate-100 mb-6">
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500 font-medium">Patient</p>
              <p className="text-lg font-bold text-slate-800">{booking.patient_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium">Test Type</p>
              <p className="text-sm font-bold text-slate-800">{booking.test_name}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' : ''}
                    ${isPending ? 'bg-slate-100 text-slate-400' : ''}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (isCurrent ? <Clock className="w-5 h-5 animate-pulse" /> : <Circle className="w-3 h-3" />)}
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0">
                    <div className={`p-4 rounded-xl border transition-all
                      ${isCurrent ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-transparent border-transparent'}
                    `}>
                      <h3 className={`font-bold ${isCurrent ? 'text-blue-900' : (isPending ? 'text-slate-400' : 'text-slate-800')}`}>{step}</h3>
                      
                      {/* Supplemental info based on step */}
                      {isCurrent && step === 'Phlebotomist Assigned' && booking.phlebotomist_name && (
                        <p className="text-sm text-blue-700 mt-1 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.phlebotomist_name} is arriving shortly.
                        </p>
                      )}
                      
                      {isCurrent && step === 'Testing' && (
                        <p className="text-sm text-blue-700 mt-1 font-medium">
                          Samples are currently in the laboratory.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          onClick={() => window.location.href = 'tel:+919482724054'}
          className="w-full bg-white text-[#1E3A8A] border-[#1E3A8A]/20 hover:bg-blue-50 py-6 rounded-2xl text-base font-bold shadow-sm flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Call Lab for Assistance
        </Button>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <TrackContent />
    </Suspense>
  );
}
