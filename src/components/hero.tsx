"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Phone, ChevronRight, ShieldCheck, Clock, Home, FileText } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } },
};

const TRUST_BADGES = [
  { icon: ShieldCheck, color: "text-blue-300", bg: "bg-blue-500/20", title: "Trusted Diagnostics", sub: "Quality assured" },
  { icon: Clock, color: "text-teal-300", bg: "bg-teal-500/20", title: "24/7 Service", sub: "Always available" },
  { icon: Home, color: "text-red-400", bg: "bg-red-500/20", title: "Home Collection", sub: "At your doorstep" },
];

export function Hero() {
  return (
    <section id="home" className="relative w-full min-h-[90vh] flex items-start justify-center pt-28 sm:pt-44 lg:pt-52 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/95" />
      </div>

      {/* Subtle glow orbs - hidden on mobile for perf */}
      <div className="absolute inset-0 z-[1] pointer-events-none hidden sm:block">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-teal-500/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-red-500/10 blur-[80px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top label */}
          <motion.div variants={itemVariants} className="mb-6">
            <Badge className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2 text-xs sm:text-sm font-medium backdrop-blur-md rounded-full cursor-default shadow-xl transition-colors">
              <ShieldCheck className="w-4 h-4 mr-2 text-teal-400 inline" />
              Trusted Diagnostics
            </Badge>
          </motion.div>

          {/* Lab name Highlighted */}
          <motion.div
            variants={itemVariants}
            className="relative mb-8 group"
          >
            {/* Animated glowing background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/40 via-teal-500/40 to-blue-600/40 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* The Lab Name Pill */}
            <div className="relative px-6 py-2.5 bg-slate-900/80 border border-white/10 rounded-full backdrop-blur-xl shadow-2xl flex items-center justify-center gap-3">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500"></span>
              </span>
              
              <span className="bg-gradient-to-r from-red-400 via-white to-teal-300 bg-clip-text text-transparent font-black tracking-[0.25em] text-xs sm:text-sm md:text-base uppercase drop-shadow-sm">
                ARUSH Lab &amp; Diagnostics
              </span>

              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-teal-500"></span>
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-5"
          >
            Your Path to{" "}
            <span className="relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Better Health
              </span>
              <motion.span
                className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full z-0"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </span>{" "}
            Starts Here
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-slate-300 mb-10 max-w-xl font-light leading-relaxed"
          >
            Accurate · Affordable · Fast Reports
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 w-full sm:w-auto mb-16"
          >
            <Button
              size="lg"
              onClick={() => {
                const msg = `Hello ARUSH Lab & Diagnostics,\nI have a doctor's prescription. Please check the uploaded photo and let me know the pricing and next steps.`;
                window.open(`https://wa.me/919482724054?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full px-8 py-6 text-base sm:text-lg font-bold group shadow-lg shadow-green-900/40 hover:shadow-green-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5 animate-pulse" />
              Upload Prescription
            </Button>
            
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#0D9488] hover:bg-teal-600 text-white rounded-full px-8 py-6 text-base sm:text-lg font-semibold group shadow-lg shadow-teal-900/40 hover:shadow-teal-500/30 hover:scale-105 transition-all"
            >
              <Link href="#pricing" className="flex items-center justify-center gap-2 w-full">
                View Test Prices
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/15 border border-white/25 text-white backdrop-blur-sm rounded-full px-8 py-6 text-base sm:text-lg font-semibold transition-all hover:scale-105"
            >
              <a href="tel:+919482724054" className="flex items-center justify-center gap-2 w-full">
                <Phone className="w-5 h-5" /> Call Now
              </a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-4 w-full max-w-3xl"
          >
            {TRUST_BADGES.map((b, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex flex-col items-center gap-3 px-4 py-6 bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full ${b.bg} ${b.color} flex items-center justify-center`}>
                  <b.icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-sm sm:text-base">{b.title}</p>
                  <p className="text-slate-400 text-xs sm:text-sm">{b.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
