"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, MessageCircle } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

export function Pricing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredData = PRICING_DATA.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const element = tableRef.current;
    if (!element) return;

    try {
      // Temporarily hide actions column for PDF by duplicating the table node
      const pdfNode = element.cloneNode(true) as HTMLDivElement;
      document.body.appendChild(pdfNode);
      pdfNode.style.width = "800px";
      pdfNode.style.padding = "40px";
      pdfNode.style.background = "white";
      pdfNode.style.position = "absolute";
      pdfNode.style.left = "-9999px";
      pdfNode.style.pointerEvents = "none";

      // Add a header specially for PDF
      const headerHtml = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px;">
          <h1 style="color: #EF4444; font-size: 32px; margin: 0; font-weight: bold;">ARUSH <span style="color: #1E3A8A;">Lab & Diagnostics</span></h1>
          <p style="color: #64748b; margin: 10px 0 0 0;">Beside Sangmeshwar Hospital, Canara Bank to KEB Road, Bidar - 585403</p>
          <p style="color: #64748b; margin: 5px 0 0 0;">Ph: 9482724054 / 7483554790</p>
          <h2 style="color: #0f172a; margin-top: 20px; font-weight: bold;">Complete Test Price List</h2>
          <p style="color: #64748b; font-size: 12px;">Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      pdfNode.insertAdjacentHTML('afterbegin', headerHtml);

      // Remove actions columns inside the duplicated node
      const actionCells = pdfNode.querySelectorAll('.action-col');
      actionCells.forEach(cell => cell.remove());

      const canvas = await html2canvas(pdfNode, { scale: 2 });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("ARUSH_Lab_Price_List.pdf");
      
      document.body.removeChild(pdfNode);
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
    <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold text-brand-cta uppercase tracking-wider mb-2">Transparent Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Diagnostic Test Prices</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We believe in complete transparency. Find the exact cost of your tests below, with zero hidden charges.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col pt-2 relative z-10 overflow-hidden">
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

          <div className="overflow-x-auto w-full p-6 text-left" ref={tableRef}>
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
                      No tests found matching "{searchTerm}"
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
        </div>
      </div>
    </section>
  );
}
