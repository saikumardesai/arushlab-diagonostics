"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, MessageCircle } from "lucide-react";
import { jsPDF } from "jspdf";

const PRICING_DATA = [
  { name: "CBC", price: 300 },
  { name: "CBP", price: 400 },
  { name: "Blood Group", price: 50 },
  { name: "BT CT", price: 100 },
  { name: "PS for MP", price: 200 },
  { name: "AEC/Reticount", price: 150 },
  { name: "PTINR", price: 400 },
  { name: "APTT", price: 500 },
  { name: "Urine Routine", price: 100 },
  { name: "Urine Complete", price: 150 },
  { name: "Urine Keton", price: 200 },
  { name: "FBS PPBS", price: 100 },
  { name: "RBS", price: 50 },
  { name: "Widal", price: 100 },
  { name: "Urea", price: 100 },
  { name: "Creatinine", price: 100 },
  { name: "Uric Acid", price: 250 },
  { name: "RFT", price: 400 },
  { name: "LFT", price: 400 },
  { name: "Lipid Profile", price: 400 },
];

import { motion, type Variants } from "framer-motion";

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
  // tableRef no longer needed for manual PDF generation

  const filteredData = PRICING_DATA.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async () => {
    setIsGenerating(true);

    try {
      window.alert("Latest Pricing List System Active - Generating PDF...");
      console.log("Starting ARUSH PDF Generation (Manual Mode)...");
      const doc = new jsPDF("p", "pt", "a4");
      const margin = 40;
      let yPos = 50;

      // Header
      doc.setTextColor(239, 68, 68); // Brand Red
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("ARUSH", margin, yPos);
      
      doc.setTextColor(30, 58, 138); // Brand Navy
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
      // Table Header
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
      
      filteredData.forEach((test, index) => {
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

  const bookOnWhatsApp = (testName: string) => {
    const text = encodeURIComponent(`Hello ARUSH Lab, I want to book the ${testName} test.`);
    window.open(`https://wa.me/919482724054?text=${text}`, "_blank");
  };

  return (
    <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200 overflow-hidden">
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
              {isGenerating ? "Generating..." : "Download as PDF"}
            </Button>
          </div>

          <div className="overflow-x-auto w-full p-6 text-left">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2 border-slate-100">
                  <TableHead className="text-brand-primary font-semibold text-base py-4 text-left">Test Name</TableHead>
                  <TableHead className="text-brand-primary font-semibold text-base py-4 w-32 text-left">Price</TableHead>
                  <TableHead className="text-brand-primary font-semibold text-base py-4 text-center w-32 action-col">Status</TableHead>
                  <TableHead className="text-brand-primary font-semibold text-base py-4 text-right w-40 action-col">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-slate-500 text-lg">
                      No tests found matching &quot;{searchTerm}&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((test, index) => (
                    <TableRow key={index} className="hover:bg-blue-50/50 transition-colors border-b border-slate-50">
                      <TableCell className="font-medium text-slate-800 text-base py-4 align-middle text-left">{test.name}</TableCell>
                      <TableCell className="font-bold text-slate-900 text-base align-middle text-left">₹{test.price}</TableCell>
                      <TableCell className="text-center action-col align-middle">
                        {test.price <= 100 && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none font-medium px-2.5 py-0.5 rounded-full inline-flex tracking-tight">
                            Best Value
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right action-col align-middle">
                        <Button 
                          size="sm" 
                          onClick={() => bookOnWhatsApp(test.name)}
                          className="bg-white border border-slate-200 hover:bg-brand-whatsapp hover:text-white hover:border-transparent text-slate-700 transition-all shadow-sm rounded-full"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Book
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
