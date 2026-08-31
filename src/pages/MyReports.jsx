import React from 'react';
import { Link } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { useAppState } from '../context/StateContext';
import { CitizenNearbyLocator } from '../components/CitizenNearbyLocator';
import {
  CheckCircle2,
  Clock,
  Truck,
  Shield,
  AlertCircle,
  School,
  Building2,
  Flame,
  MapPin,
  PlusCircle,
  ArrowRight,
  Phone
} from 'lucide-react';

export const MyReports = () => {
  const { myIncidents, resources, shelters } = useAppState();

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                CITIZEN PERSONAL EMERGENCY DASHBOARD
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              TRACK MY EMERGENCY REPORTS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Live tracking of your own submitted incident reports and rescue team allocation progress.
            </p>
          </div>

          <Link
            to="/report"
            className="px-5 py-2.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 border border-red-400/30 transition-all flex items-center justify-center gap-2 shrink-0 transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>REPORT NEW EMERGENCY</span>
          </Link>
        </div>

        {/* Section 1: User's Own Submitted Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-gray-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>My Active Emergency Reports ({myIncidents.length})</span>
            </h2>
            <span className="text-xs font-mono text-gray-400">
              Only your submitted reports are shown here
            </span>
          </div>

          {myIncidents.length === 0 ? (
            <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-gray-400 flex items-center justify-center mx-auto text-2xl">
                📋
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                No Emergency Reports Logged by You Yet
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                If you are facing flooding, structural hazard, or require medical/evacuation assistance, report an incident to trigger immediate state dispatch.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                <span>File Emergency Report Now</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {myIncidents.map(inc => {
                const assignedTeam = resources.find(r => r.id === inc.assignedResourceId);
                const assignedShelter = shelters.find(s => s.id === inc.assignedShelterId);

                // Determine timeline steps progress
                let currentStep = 2; // Report received + Authority notified
                if (inc.status === 'RESOURCE_ASSIGNED') currentStep = 3;
                if (inc.status === 'RESCUE_IN_PROGRESS') currentStep = 4;
                if (inc.status === 'RESOLVED') currentStep = 5;

                const steps = [
                  { label: 'Report Received', status: 'completed' },
                  { label: 'State EOC Notified', status: 'completed' },
                  { label: 'Rescue Team Assigned', status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'active' : 'pending' },
                  { label: 'Rescue in Progress', status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'active' : 'pending' },
                  { label: 'Safe Evacuation', status: currentStep === 5 ? 'completed' : 'pending' }
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
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            <span>{inc.location.name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                          {inc.severity}
                        </span>
                        <span className="bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                          PRIORITY SCORE {inc.priorityScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Assigned Rescue Team & Shelter Banners */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {assignedTeam ? (
                        <div className="bg-blue-950/40 border border-blue-800/60 rounded-2xl p-3 flex items-center justify-between text-xs text-blue-200">
                          <div className="space-y-0.5">
                            <div className="text-[10px] text-blue-400 font-mono font-bold uppercase">
                              🚒 ASSIGNED RESCUE TEAM
                            </div>
                            <div className="font-bold text-white truncate">{assignedTeam.name}</div>
                            <div className="text-[11px] text-gray-300 font-mono">
                              📍 {assignedTeam.location.name}
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                            EN ROUTE
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-3 text-xs text-gray-400 flex items-center justify-between">
                          <span>🚒 Nearest Fire Station / ODRAF matching in progress...</span>
                          <span className="text-[10px] font-mono text-amber-400">DISPATCH QUEUED</span>
                        </div>
                      )}

                      {assignedShelter ? (
                        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-200">
                          <div className="space-y-0.5">
                            <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                              🏫 DESIGNATED SCHOOL SHELTER
                            </div>
                            <div className="font-bold text-white truncate">{assignedShelter.name}</div>
                            <div className="text-[11px] text-gray-300 font-mono">
                              Beds Available: {assignedShelter.available} free
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-900 px-2 py-0.5 rounded border border-emerald-700 shrink-0">
                            READY
                          </span>
                        </div>
                      ) : (
                        <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-3 text-xs text-gray-400 flex items-center justify-between">
                          <span>🏫 Local School Shelter allocation in progress...</span>
                          <span className="text-[10px] font-mono text-emerald-400">STANDBY</span>
                        </div>
                      )}
                    </div>

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
          )}
        </div>

        {/* Section 2: Live Proximity Locator for Citizen's Location */}
        <div className="pt-4">
          <CitizenNearbyLocator />
        </div>
      </main>
    </div>
  );
};
