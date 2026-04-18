"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Droplet, Activity, FlaskConical, HeartPulse, Microscope, Target, Sparkles, TestTube } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const SERVICES = [
  {
    title: "Hematology",
    description: "Comprehensive blood cell analysis for detecting various conditions.",
    icon: <Droplet className="w-8 h-8 text-brand-accent" />,
  },
  {
    title: "Clinical Pathology",
    description: "Detailed examination of bodily fluids and tissues for accurate diagnosis.",
    icon: <Microscope className="w-8 h-8 text-brand-cta" />,
  },
  {
    title: "Bio-Chemistry",
    description: "Chemical analysis of body fluids like blood plasma and serum.",
    icon: <FlaskConical className="w-8 h-8 text-brand-primary" />,
  },
  {
    title: "Hormone & Enzyme Assay",
    description: "Testing hormonal balance and enzyme levels for specialized care.",
    icon: <Activity className="w-8 h-8 text-purple-600" />,
  },
  {
    title: "FNAC",
    description: "Fine Needle Aspiration Cytology for safe and quick lump diagnosis.",
    icon: <Target className="w-8 h-8 text-orange-600" />,
  },
  {
    title: "Histopathology",
    description: "Microscopic study of tissues to identify disease origins.",
    icon: <HeartPulse className="w-8 h-8 text-rose-600" />,
  },
  {
    title: "PAP Smear",
    description: "Screening procedure for cervical cancer testing.",
    icon: <Sparkles className="w-8 h-8 text-pink-600" />,
  },
  {
    title: "ELISA (HIV, HBsAg, Pregnancy)",
    description: "Enzyme-Linked Immunosorbent Assay for precise medical testing.",
    icon: <TestTube className="w-8 h-8 text-teal-600" />,
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-teal-600 font-bold uppercase tracking-widest text-sm mb-4">What We Offer</p>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">World-Class Diagnostic Solutions</h2>
          <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full" />
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="h-full border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="mb-4 p-3 w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
