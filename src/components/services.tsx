"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Droplet, Activity, FlaskConical, Stethoscope, HeartPulse, Microscope, Target, Sparkles, TestTube } from "lucide-react";

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
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-brand-cta uppercase tracking-wider mb-2">Our Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Complete Diagnostic Services</h3>
          <p className="text-lg text-slate-600">
            We offer a comprehensive range of advanced pathological and diagnostic services to cater to all your health needs with precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
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
        </div>
      </div>
    </section>
  );
}
