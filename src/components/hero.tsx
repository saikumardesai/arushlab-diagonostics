"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, Clock, Home } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { ease: "easeOut", duration: 0.6 }
  }
};

export function Hero() {
  return (
    <section id="home" className="relative w-full min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Elegant Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/30 to-slate-900/95"></div>
        
        {/* Soft glowing orb behind the main text for contrast */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-brand-cta/20 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div className="container relative z-10 px-4 mx-auto pt-16 pb-20 sm:pt-24 sm:pb-32">
        <motion.div 
          className="max-w-5xl mx-auto text-center flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
            <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 px-5 py-2 text-sm font-medium shadow-2xl backdrop-blur-md transition-all cursor-default rounded-full">
              <ShieldCheck className="w-4 h-4 mr-2 text-green-400" /> NABL Certified Laboratory
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-[5rem] font-extrabold text-white tracking-tight mb-8 leading-[1.1] drop-shadow-2xl"
          >
            Your Path to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              Better Health
            </span> Starts Here
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light tracking-wide leading-relaxed drop-shadow-md"
          >
            Accurate, Affordable, and Fast Diagnostic Reports backed by advanced medical technology.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-24 justify-center"
          >
            <Button size="lg" className="bg-brand-cta hover:bg-teal-600 outline-none hover:shadow-[0_0_30px_rgba(13,148,136,0.4)] hover:scale-105 text-white rounded-full px-10 py-7 text-lg group transition-all">
              <Link href="#pricing" className="flex items-center">
                View Test Prices <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/10 hover:shadow-2xl hover:scale-105 border-white/20 text-white backdrop-blur-md rounded-full px-10 py-7 text-lg transition-all">
              <a href="tel:9482724054" className="flex items-center tracking-wide">
                <Phone className="w-5 h-5 mr-3" /> Call 9482724054
              </a>
            </Button>
          </motion.div>

          {/* Trust Badges - elegant glassmorphism style */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center mb-5 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">NABL Certified</h3>
              <p className="text-sm text-slate-400 font-medium">Quality assured results</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mb-5 shadow-inner">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">24/7 Service</h3>
              <p className="text-sm text-slate-400 font-medium">Always here for you</p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-5 shadow-inner">
                <Home className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white text-xl mb-2">Home Collection</h3>
              <p className="text-sm text-slate-400 font-medium">Sample from your doorstep</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
