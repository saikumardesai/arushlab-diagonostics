"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Send } from "lucide-react";

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you! Your inquiry has been submitted. We will contact you shortly.");
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-brand-cta uppercase tracking-wider mb-2">Get in Touch</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Contact &amp; Location</h3>
          <p className="text-lg text-slate-600">
            Visit our lab, give us a call, or send us a message. We're here to help you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info & Map */}
          <div className="flex flex-col gap-6">
            <Card className="border-slate-100 shadow-xl overflow-hidden rounded-2xl group border-2 border-transparent hover:border-brand-primary/10 transition-colors">
              <CardContent className="p-6 sm:p-8 flex flex-col gap-8 bg-slate-50/50">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-blue-100 shadow-sm flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Our Location</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Beside Sangmeshwar Hospital, <br />
                      Canara Bank to KEB Road, <br />
                      Bidar - 585403
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-red-100 shadow-sm flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Call Us 24/7</h4>
                    <div className="flex flex-col gap-1.5">
                      <a href="tel:9482724054" className="text-brand-primary font-bold hover:underline text-lg">9482724054</a>
                      <a href="tel:7483554790" className="text-brand-primary font-bold hover:underline text-lg">7483554790</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-teal-100 shadow-sm flex flex-shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-brand-cta" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Working Hours</h4>
                    <p className="text-slate-700 font-bold text-lg">Open 24 Hours, 7 Days a week</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Home Collection available anytime.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl overflow-hidden shadow-xl h-64 border border-slate-100 group">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.9142750601337!2d77.52554731487823!3d17.915227187783457!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bce7dc8e35c24eb%3A0xe7261afcc1e8ff11!2sSangmeshwar%20Hospital!5e0!3m2!1sen!2sin!4v1689255013000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="ARUSH Lab Location"
                className="grayscale group-hover:grayscale-0 transition-all duration-700"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-slate-100 shadow-xl rounded-2xl">
            <CardContent className="p-6 sm:p-10">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-8 border-b pb-4">Send an Inquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</label>
                  <Input id="name" placeholder="John Doe" required className="h-14 font-medium bg-slate-50 border-slate-200 focus-visible:ring-brand-primary" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-700">Phone Number</label>
                  <Input id="phone" type="tel" placeholder="+91 9876543210" required className="h-14 font-medium bg-slate-50 border-slate-200 focus-visible:ring-brand-primary" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="test" className="text-sm font-bold text-slate-700">Test Required (Optional)</label>
                  <Input id="test" placeholder="e.g. Complete Blood Count" className="h-14 font-medium bg-slate-50 border-slate-200 focus-visible:ring-brand-primary" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold bg-brand-primary hover:bg-blue-900 text-white shadow-xl hover:-translate-y-1 transition-all rounded-xl">
                  <Send className="w-5 h-5 mr-3" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
