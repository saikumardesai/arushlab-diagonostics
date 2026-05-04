export default function AdminRedirect() {
  return (
    <>
      <head>
        <meta httpEquiv="refresh" content="0; url=/lab-dashboard" />
      </head>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 mb-4">Dashboard Moved</h1>
          <p className="text-slate-600 mb-6 font-medium">
            The lab admin page has been moved to <strong className="text-blue-600">/lab-dashboard</strong> to prevent Ad-Blockers and privacy extensions from accidentally blocking it.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            If you are not redirected automatically, please click below.
          </p>
          <a href="/lab-dashboard" className="w-full inline-block bg-[#1E3A8A] hover:bg-blue-800 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-lg active:scale-95">
            Go to Lab Dashboard
          </a>
        </div>
      </div>
    </>
  );
}
