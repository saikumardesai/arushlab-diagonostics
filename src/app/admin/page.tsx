"use client";

import { useEffect } from "react";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = "/portal-v10";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading Secure Admin Portal...</p>
        <p className="text-xs text-slate-400 mt-2 italic">If not redirected, visit /portal-v10 manually</p>
      </div>
    </div>
  );
}
