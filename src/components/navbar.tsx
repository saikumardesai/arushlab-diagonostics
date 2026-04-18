"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-brand-accent">ARUSH</span>
          <span className="text-xl font-semibold text-brand-primary hidden sm:inline-block">
            Lab &amp; Diagnostics
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground hover:text-brand-cta transition-colors">Home</Link>
          <Link href="#services" className="text-foreground hover:text-brand-cta transition-colors">Services</Link>
          <Link href="#pricing" className="text-foreground hover:text-brand-cta transition-colors">Test Pricing</Link>
          <Link href="#about" className="text-foreground hover:text-brand-cta transition-colors">About Us</Link>
          <Link href="#contact" className="text-foreground hover:text-brand-cta transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-brand-cta hover:bg-teal-700 text-white rounded-full px-6 shadow-md transition-transform hover:scale-105 active:scale-95 hidden sm:flex">
            <Link href="#pricing">Book Now</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
