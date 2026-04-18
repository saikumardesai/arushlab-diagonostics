"use client";

import { motion } from "framer-motion";
import { Zap, IndianRupee, Home, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Fast Reports",
    description: "Get accurate results delivered to you quickly, often within 24 hours.",
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
  },
  {
    title: "Affordable Prices",
    description: "High-quality diagnostics at transparent and reasonable prices.",
    icon: <IndianRupee className="w-8 h-8 text-green-400" />,
  },
  {
    title: "Home Collection",
    description: "Convenient 24/7 sample collection right from your doorstep.",
    icon: <Home className="w-8 h-8 text-blue-400" />,
  },
  {
    title: "Expert Team",
    description: "Highly qualified pathologists and technicians you can trust.",
    icon: <Users className="w-8 h-8 text-purple-400" />,
  },
];

export function WhyChooseUs() {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-gradient-to-br from-brand-primary to-teal-900 border-t-8 border-brand-accent">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=2070&auto=format&fit=crop')] mix-blend-overlay opacity-10 bg-cover bg-center"></div>
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-teal-300 uppercase tracking-wider mb-2">Our Advantage</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Why Choose ARUSH Lab?</h3>
          <p className="text-lg text-blue-100">
            We combine state-of-the-art technology with compassionate care to deliver the best diagnostic experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20 transition-all duration-300 h-full hover:-translate-y-2 group shadow-lg">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-900/40 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-blue-100 opacity-90 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
