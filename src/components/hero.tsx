"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, Clock, Home } from "lucide-react";
import { useRef } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ease: "easeOut", duration: 0.7 },
  },
};

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section ref={sectionRef} id="home" className="relative w-full min-h-[95vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ y: bgY, backgroundImage: "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')" }}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/95" />
      </motion.div>

      {/* Animated floating particles */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5 border border-white/10"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              top: `${10 + i * 15}%`,
              left: `${5 + i * 16}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-red-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div style={{ opacity }} className="container relative z-10 px-4 mx-auto pt-16 pb-20 sm:pt-24 sm:pb-32">
        <motion.div
          className="max-w-5xl mx-auto text-center flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* NABL Badge */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
            <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 px-5 py-2 text-sm font-medium shadow-2xl backdrop-blur-md rounded-full cursor-default">
              <ShieldCheck className="w-4 h-4 mr-2 text-green-400" /> NABL Certified Laboratory
            </Badge>
          </motion.div>

          {/* Lab Name Highlight */}
          <motion.div variants={itemVariants} className="mb-4">
            <motion.p
              className="text-sm font-bold uppercase tracking-[0.3em] text-teal-400 mb-2"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ARUSH Lab &amp; Diagnostics
            </motion.p>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]"
          >
            Your Path to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400">
                Better Health
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-400/20 blur-xl rounded-2xl z-0"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
            <br />
            <span className="text-slate-200">Starts Here</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl font-light tracking-wide leading-relaxed"
          >
            Accurate · Affordable · Fast Reports
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mb-24 justify-center"
          >
            <Button size="lg" className="bg-gradient-to-r from-[#0D9488] to-teal-500 hover:from-teal-500 hover:to-[#0D9488] text-white rounded-full px-10 py-7 text-lg group transition-all shadow-xl shadow-teal-900/40 hover:shadow-teal-500/30 hover:scale-105">
              <Link href="#pricing" className="flex items-center">
                View Test Prices
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/40 text-white backdrop-blur-md rounded-full px-10 py-7 text-lg transition-all hover:scale-105">
              <a href="tel:9482724054" className="flex items-center">
                <Phone className="w-5 h-5 mr-3" /> Call 9482724054
              </a>
            </Button>
          </motion.div>

          {/* Trust Badges — glassmorphism */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl mx-auto"
          >
            {[
              { icon: <ShieldCheck className="w-8 h-8" />, color: "text-blue-300", bg: "bg-blue-500/20", title: "NABL Certified", sub: "Quality assured results" },
              { icon: <Clock className="w-8 h-8" />, color: "text-teal-300", bg: "bg-teal-500/20", title: "24/7 Service", sub: "Always here for you" },
              { icon: <Home className="w-8 h-8" />, color: "text-red-400", bg: "bg-red-500/20", title: "Home Collection", sub: "Sample from your doorstep" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center p-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl hover:bg-white/10 hover:border-white/20 transition-colors duration-300"
              >
                <div className={`w-16 h-16 rounded-full ${badge.bg} ${badge.color} flex items-center justify-center mb-5 shadow-inner`}>
                  {badge.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{badge.title}</h3>
                <p className="text-sm text-slate-400">{badge.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
