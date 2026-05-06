"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, MessageCircle, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";

// Prices will now be fetched from Supabase 'tests' table
interface TestPrice {
  name: string;
  price: number;
  category?: string;
}

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { supabase, BookingStatus, BookingRecord } from "@/lib/supabase";
import { CheckCircle2, ChevronRight, X as XIcon, MapPin, Phone, User, Info } from "lucide-react";

function generateId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ARUSH-${num}`;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function Pricing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Booking Modal State
  const [bookingTest, setBookingTest] = useState<{name: string, price: number} | null>(null);
  const [bookingStep, setBookingStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [newBookingId, setNewBookingId] = useState("");
  const [tests, setTests] = useState<TestPrice[]>([]);
  const [fetchingTests, setFetchingTests] = useState(true);
  
  // Fetch tests from Supabase
  const fetchTests = useCallback(async () => {
    setFetchingTests(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('tests')
          .select('name, price, category')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setTests(data || []);
      } else {
        // Fallback for mock mode
        setTests([
          { name: "CBC (Mock)", price: 300 },
          { name: "CBP (Mock)", price: 400 },
          { name: "LFT (Mock)", price: 500 }
        ]);
      }
    } catch (e) {
      console.error("Failed to fetch tests:", e);
    } finally {
      setFetchingTests(false);
    }
  }, []);

  useEffect(() => {
    void fetchTests();
  }, [fetchTests]);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const filteredData = tests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      window.alert("Generating Test Price List PDF...");
      const doc = new jsPDF("p", "pt", "a4");
      const margin = 40;
      let yPos = 50;

      doc.setTextColor(239, 68, 68);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("ARUSH", margin, yPos);
      
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(20);
      doc.text("Lab & Diagnostics", margin + 105, yPos);
      
      yPos += 25;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Beside Sangmeshwar Hospital, Canara Bank to KEB Road, Bidar - 585403", margin, yPos);
      
      yPos += 15;
      doc.text("Ph: 9482724054 / 7483554790", margin, yPos);

      yPos += 30;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(2);
      doc.line(margin, yPos, 555, yPos);

      yPos += 40;
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Complete Test Price List", margin, yPos);
      
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 450, yPos);

      yPos += 30;
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, 515, 30, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 138);
      doc.text("Test Name", margin + 10, yPos + 20);
      doc.text("Price (INR)", 480, yPos + 20);

      yPos += 45;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      
      filteredData.forEach((test) => {
        if (yPos > 780) {
          doc.addPage();
          yPos = 50;
        }
        doc.text(test.name, margin + 10, yPos);
        doc.text(`Rs. ${test.price}/-`, 480, yPos);
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(1);
        doc.line(margin, yPos + 8, 555, yPos + 8);
        yPos += 25;
      });

      doc.save("ARUSH_Lab_Price_List.pdf");
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTest) return;
    
    setLoading(true);
    const bookingId = generateId();
    const newRecord: BookingRecord = {
      id: bookingId,
      patient_name: form.name,
      test_name: bookingTest.name,
      phone: form.phone,
      address: form.address,
      date: new Date().toISOString(),
      status: 'Booking Confirmed'
    };

    if (supabase) {
      const { error } = await supabase.from('bookings').insert([newRecord]);
      if (error) {
        alert("Booking failed: " + error.message);
        setLoading(false);
        return;
      }
    } else {
      // Mock logic
      const localData = localStorage.getItem('arush_mock_bookings');
      const db = localData ? JSON.parse(localData) : [];
      localStorage.setItem('arush_mock_bookings', JSON.stringify([newRecord, ...db]));
    }

    setNewBookingId(bookingId);
    setBookingStep('success');
    setLoading(false);
  };

  const resetBooking = () => {
    setBookingTest(null);
    setBookingStep('form');
    setForm({ name: "", phone: "", address: "" });
  };

  return (
    <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden relative">
      {/* Booking Modal */}
      <AnimatePresence>
        {bookingTest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetBooking}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-slate-200"
            >
              {bookingStep === 'form' ? (
                <>
                  <div className="bg-[#1E3A8A] p-8 text-white relative">
                    <button onClick={resetBooking} className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                      <XIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                        <Info className="w-5 h-5 text-blue-200" />
                      </div>
                      <span className="text-blue-200 font-bold uppercase tracking-widest text-xs">Confirm Booking</span>
                    </div>
                    <h2 className="text-2xl font-black">{bookingTest.name}</h2>
                    <p className="text-blue-100/80 font-medium text-sm mt-1">Diagnostic Test Package • ₹{bookingTest.price}</p>
                  </div>
                  
                  <form onSubmit={handleBookingSubmit} className="p-8 space-y-5">
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          placeholder="Your Full Name"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({...f, name: e.target.value}))}
                          className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          placeholder="Phone Number"
                          type="tel"
                          required
                          value={form.phone}
                          onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                          className="pl-12 h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl transition-all"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea 
                          placeholder="Home Address / Collection Location"
                          required
                          value={form.address}
                          onChange={e => setForm(f => ({...f, address: e.target.value}))}
                          className="w-full pl-12 pt-4 min-h-[100px] bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-16 bg-[#0D9488] hover:bg-teal-700 text-white rounded-2xl font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-teal-200"
                    >
                      {loading ? "Processing..." : "Confirm & Book Test"}
                    </Button>
                    <p className="text-center text-slate-400 text-xs font-medium">
                      By clicking, you agree to our terms of service
                    </p>
                  </form>
                </>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Success!</h2>
                  <p className="text-slate-500 font-medium mb-8">Your test has been scheduled. Use the ID below to track the status.</p>
                  
                  <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 mb-8">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Your Tracking ID</p>
                    <p className="text-4xl font-black text-[#1E3A8A] tracking-tighter">{newBookingId}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.href = `/track?id=${newBookingId}`}
                      className="w-full h-14 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-100"
                    >
                      Track My Test <ChevronRight className="w-5 h-5" />
                    </Button>
                    <button 
                      onClick={resetBooking}
                      className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-sm font-bold text-brand-cta uppercase tracking-wider mb-2">Transparent Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Diagnostic Test Prices</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We believe in complete transparency. Find the exact cost of your tests below, with zero hidden charges.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col pt-2 relative z-10 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/95 backdrop-blur z-20">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search for a test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base rounded-full bg-slate-50 border-slate-200 focus-visible:ring-brand-cta focus-visible:ring-offset-0"
              />
            </div>
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating List..." : "Download Price PDF"}
            </Button>
          </div>

          <div className="overflow-x-auto w-full p-6 text-left">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2 border-slate-100">
                  <TableHead className="text-brand-primary font-bold text-base py-4 text-left">Test Name</TableHead>
                  <TableHead className="text-brand-primary font-bold text-base py-4 w-24 sm:w-32 text-left">Price</TableHead>
                  <TableHead className="text-brand-primary font-bold text-base py-4 text-center w-32 action-col hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-brand-primary font-bold text-base py-4 text-right w-32 sm:w-40 action-col">Easy Booking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchingTests ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <p className="font-medium">Loading live prices...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-slate-500 text-lg">
                      No tests found matching &quot;{searchTerm}&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((test, index) => (
                    <TableRow key={index} className="hover:bg-blue-50/50 transition-colors border-b border-slate-50">
                      <TableCell className="font-semibold text-slate-800 text-sm sm:text-base py-4 align-middle text-left">{test.name}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm sm:text-base align-middle text-left">₹{test.price}</TableCell>
                      <TableCell className="text-center action-col align-middle hidden sm:table-cell">
                        {test.price <= 100 && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold px-3 py-1 rounded-full inline-flex tracking-tight text-[10px]">
                            Best Value
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right action-col align-middle">
                        <Button 
                          size="sm" 
                          onClick={() => setBookingTest(test)}
                          className="bg-[#1E3A8A] hover:bg-blue-800 text-white transition-all shadow-md active:scale-95 rounded-full px-4 sm:px-6 font-bold text-xs sm:text-sm"
                        >
                          Book <span className="hidden sm:inline ml-1">Now</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
