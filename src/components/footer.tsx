"use client";

import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-primary text-slate-100 pt-16 pb-8 border-t border-brand-primary/20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-white">ARUSH</span>
            <span className="text-xl font-medium text-blue-200">
              Lab &amp; Diagnostics
            </span>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            Your Path to Better Health Starts Here. Providing accurate, affordable, and fast diagnostic services since our inception.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold text-white mb-2 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-12 after:h-0.5 after:bg-brand-accent">Quick Links</h4>
          <Link href="#services" className="text-blue-200 hover:text-white transition-colors text-sm">Services</Link>
          <Link href="#pricing" className="text-blue-200 hover:text-white transition-colors text-sm">Test Pricing</Link>
          <Link href="#about" className="text-blue-200 hover:text-white transition-colors text-sm">About Us</Link>
          <Link href="#contact" className="text-blue-200 hover:text-white transition-colors text-sm">Contact Us</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold text-white mb-2 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-12 after:h-0.5 after:bg-brand-accent">Top Services</h4>
          <ul className="flex flex-col gap-2 text-sm text-blue-200">
            <li>Hematology</li>
            <li>Clinical Pathology</li>
            <li>Bio-Chemistry</li>
            <li>Hormone &amp; Enzyme Assay</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold text-white mb-2 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-12 after:h-0.5 after:bg-brand-accent">Contact Info</h4>
          <div className="flex items-start gap-3 text-sm text-blue-200">
            <MapPin className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <p>Beside Sangmeshwar Hospital, Canara Bank to KEB Road, Bidar - 585403</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-200">
            <Phone className="w-5 h-5 text-brand-accent shrink-0" />
            <p>9482724054 / 7483554790</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-200">
            <Clock className="w-5 h-5 text-brand-accent shrink-0" />
            <p>24/7 Home Sample Collection</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-blue-200">
        <p>&copy; {new Date().getFullYear()} ARUSH Lab &amp; Diagnostics. All rights reserved.</p>
        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-blue-300/50 border border-white/5">
          System Version: v1.0.29
        </div>
      </div>
    </footer>
  );
}
