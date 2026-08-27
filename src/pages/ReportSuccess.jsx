import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { CheckCircle2, ShieldAlert, ArrowRight, FileText, PlusCircle } from 'lucide-react';

export const ReportSuccess = () => {
  const location = useLocation();
  const incident = location.state?.incident || {
    id: 'INC-1024',
    location: { name: 'Saidapet Riverbank Area' },
    priorityScore: 94,
    status: 'Awaiting Rescue'
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
              REPORT RECEIVED
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              EMERGENCY REPORT CONFIRMED
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Our response coordination system has notified the relevant emergency command authority.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-gray-400">Incident Reference:</span>
              <span className="font-black text-lg text-blue-400">{incident.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Location:</span>
              <span className="text-gray-200">{incident.location.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Computed Priority Score:</span>
              <span className="text-red-400 font-bold text-sm">{incident.priorityScore} / 100</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Initial Status:</span>
              <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded font-bold">
                {incident.status}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/my-reports"
              className="flex-1 py-3.5 rounded-xl font-heading font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Track My Report</span>
            </Link>

            <Link
              to="/report"
              className="flex-1 py-3.5 rounded-xl font-heading font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-orange-400" />
              <span>Report Another Emergency</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
