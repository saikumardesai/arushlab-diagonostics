"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "#services" },
  { label: "Test Pricing", href: "#pricing" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-md border-slate-200"
          : "bg-white/80 backdrop-blur-md border-slate-200/60"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setMobileOpen(false)}>
            <span className="flex items-baseline gap-1 sm:gap-1.5 flex-nowrap whitespace-nowrap">
              <span className="text-lg sm:text-2xl font-black tracking-tighter sm:tracking-tight text-red-600">ARUSH</span>
              <span className="text-[10px] sm:text-base font-bold text-[#1E3A8A] tracking-normal sm:tracking-wide">
                Lab &amp; Diagnostics
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-slate-600 hover:text-[#1E3A8A] transition-colors group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#0D9488] group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a href="tel:9482724054" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors">
              <Phone className="w-4 h-4" /> 9482724054
            </a>
            <Button className="bg-[#0D9488] hover:bg-teal-700 text-white rounded-full px-5 py-2 ml-2 text-sm font-semibold shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Link href="#pricing">Book Now</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 z-40 bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-xl md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-[#1E3A8A] hover:bg-slate-50 py-3 px-4 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-slate-100" />
              <a href="tel:9482724054" className="flex items-center gap-2 text-base font-semibold text-[#1E3A8A] py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors">
                <Phone className="w-5 h-5" /> Call: 9482724054
              </a>
              <Button className="mt-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-xl py-5 text-base font-bold">
                <Link href="#pricing" onClick={() => setMobileOpen(false)} className="w-full">
                  Book a Test
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
