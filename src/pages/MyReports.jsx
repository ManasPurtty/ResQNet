import React from 'react';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { useAppState } from '../context/StateContext';
import { CheckCircle2, Clock, Truck, Shield, AlertCircle, ChevronRight } from 'lucide-react';

export const MyReports = () => {
  const { incidents, resources } = useAppState();

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading font-black text-3xl text-white">
            TRACK MY EMERGENCY REPORTS
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Live tracking of submitted incident reports and rescue team allocation progress.
          </p>
        </div>

        <div className="space-y-6">
          {incidents.slice(0, 4).map(inc => {
            const assignedTeam = resources.find(r => r.id === inc.assignedResourceId);

            // Determine timeline steps progress
            let currentStep = 2; // Report received + Authority notified
            if (inc.status === 'RESOURCE_ASSIGNED') currentStep = 3;
            if (inc.status === 'RESCUE_IN_PROGRESS') currentStep = 4;
            if (inc.status === 'RESOLVED') currentStep = 5;

            const steps = [
              { label: 'Report received', status: 'completed' },
              { label: 'Authority notified', status: 'completed' },
              { label: 'Rescue team assigned', status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
              { label: 'Rescue in progress', status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'active' : 'pending' },
              { label: 'Completed / Evacuated', status: currentStep === 5 ? 'completed' : 'pending' }
            ];

            return (
              <div
                key={inc.id}
                className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-5 shadow-xl hover:border-gray-700 transition-colors"
              >
                {/* Incident Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-base text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-800">
                      {inc.id}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-base text-white">{inc.title}</h3>
                      <p className="text-xs text-gray-400">📍 {inc.location.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                      {inc.severity}
                    </span>
                    <span className="bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                      PRIORITY {inc.priorityScore}
                    </span>
                  </div>
                </div>

                {/* Assigned Team Banner if available */}
                {assignedTeam && (
                  <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-3 flex items-center justify-between text-xs text-blue-200">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>
                        Assigned Unit: <b>{assignedTeam.name}</b> (ETA ~7 mins)
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">
                      EN ROUTE
                    </span>
                  </div>
                )}

                {/* Timeline Visualization */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    Response Progress Timeline
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {steps.map((st, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all ${
                          st.status === 'completed'
                            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                            : st.status === 'active'
                            ? 'bg-blue-950/60 border-blue-500 text-blue-100 animate-pulse'
                            : 'bg-slate-900/60 border-gray-800 text-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold font-mono text-[11px]">
                          {st.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {st.status === 'active' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                          {st.status === 'pending' && <span className="w-3.5 h-3.5 rounded-full border border-gray-700 block"></span>}
                          <span>Step 0{i + 1}</span>
                        </div>
                        <span className="font-heading font-medium text-xs mt-0.5">{st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
