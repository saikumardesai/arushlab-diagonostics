"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled 
        ? "bg-white/90 backdrop-blur-xl shadow-lg border-slate-200/80" 
        : "bg-white/60 backdrop-blur-md border-slate-200/40"
    }`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Animated Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-2"
          >
            {/* Glow behind ARUSH */}
            <span className="relative">
              <span className="absolute inset-0 blur-md bg-gradient-to-r from-red-500 to-red-600 opacity-50 group-hover:opacity-80 transition-opacity duration-300 rounded-md scale-x-110"></span>
              <span className="relative text-2xl font-black tracking-tight bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-sm">
                ARUSH
              </span>
            </span>
            <span className="text-base font-semibold text-[#1E3A8A] tracking-wide hidden sm:inline-block">
              Lab &amp; Diagnostics
            </span>
            {/* Animated underline */}
            <motion.span
              className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-red-500 to-blue-700 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {["Home", "Services", "Test Pricing", "About Us", "Contact"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
            >
              <Link
                href={item === "Home" ? "/" : `#${item.toLowerCase().replace(" ", "")}`}
                className="relative text-slate-600 hover:text-[#1E3A8A] transition-colors group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#0D9488] group-hover:w-full transition-all duration-300 rounded-full" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button className="bg-gradient-to-r from-[#0D9488] to-teal-600 hover:from-teal-600 hover:to-[#0D9488] text-white rounded-full px-6 shadow-md shadow-teal-500/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-teal-500/40 active:scale-95 hidden sm:flex font-semibold">
            <Link href="#pricing">Book Now</Link>
          </Button>
        </motion.div>
      </div>
    </nav>
  );
}
