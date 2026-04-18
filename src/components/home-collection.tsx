"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone } from "lucide-react";

export function HomeCollection() {
  return (
    <section className="py-16 bg-brand-accent text-white relative overflow-hidden shadow-inner">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="container relative z-10 mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl text-center md:text-left">
          <Badge className="bg-white text-brand-accent hover:bg-slate-100 mb-6 font-bold px-3 py-1 shadow-sm">
            <Clock className="w-4 h-4 mr-2" /> 24/7 Service Available
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-sm">
            Can&apos;t visit us? <span className="text-[#FFE6E6]">We come to you!</span>
          </h2>
          <p className="text-lg md:text-xl text-red-50 font-medium max-w-xl mx-auto md:mx-0">
            Book our highly trained phlebotomists for a safe and hygienic home sample collection at your convenience.
          </p>
        </div>
        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
          <Button 
            size="lg" 
            className="bg-white hover:bg-slate-100 text-brand-accent text-xl py-8 px-10 rounded-full shadow-2xl hover:scale-105 transition-all w-full md:w-auto font-bold"
            onClick={() => window.open('https://wa.me/919482724054?text=Hello%20ARUSH%20Lab%2C%20I%20want%20to%20book%20a%20home%20sample%20collection.', '_blank')}
          >
            Book Home Collection
          </Button>
          <p className="text-base text-center md:text-right text-red-50 mt-2 font-medium">Or call us: <a href="tel:9482724054" className="underline hover:text-white transition-colors font-bold"><Phone className="w-4 h-4 inline mb-0.5" /> 9482724054</a></p>
        </div>
      </div>
    </section>
  );
}
