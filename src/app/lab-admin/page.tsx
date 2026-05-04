"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LabAdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/lab-dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-slate-500 font-medium">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
