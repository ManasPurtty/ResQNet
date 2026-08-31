import React from 'react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { CommandMap } from '../components/CommandMap';
import { IncidentFeed } from '../components/IncidentFeed';
import { IncidentDetailPanel } from '../components/IncidentDetailPanel';
import { EmergencyRouteOptimizer } from '../components/EmergencyRouteOptimizer';
import { SmsIvrWidget } from '../components/SmsIvrWidget';
import { useAppState } from '../context/StateContext';
import { ShieldAlert, Truck, Home, Activity, Navigation, Layers } from 'lucide-react';

export const AuthorityDashboard = () => {
  const { incidents, resources, shelters, activeTab, setActiveTab } = useAppState();

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;
  const assignedTeamsCount = resources.filter(r => r.status === 'ASSIGNED').length;
  const totalShelterCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOcc = shelters.reduce((acc, s) => acc + s.occupied, 0);

  return (
    <div className="min-h-screen h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans overflow-hidden">
      {/* Top Command Center Header */}
      <AuthorityHeader />

      {/* Main EOC Command Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 min-h-0 overflow-hidden">
        {/* Left Column (3 cols): Incident Feed & Low Connectivity Fallback */}
        <div className="lg:col-span-3 flex flex-col gap-3 h-full min-h-0 overflow-hidden">
          {/* Quick Counter Summary Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#111827] p-2 rounded-xl border border-red-900/60 text-red-400">
              <div className="text-[10px] font-mono text-gray-400">CRITICAL</div>
              <div className="font-heading font-black text-lg text-red-400">{criticalCount}</div>
            </div>
            <div className="bg-[#111827] p-2 rounded-xl border border-orange-900/60 text-orange-400">
              <div className="text-[10px] font-mono text-gray-400">HIGH</div>
              <div className="font-heading font-black text-lg text-orange-400">{highCount}</div>
            </div>
            <div className="bg-[#111827] p-2 rounded-xl border border-blue-900/60 text-blue-400">
              <div className="text-[10px] font-mono text-gray-400">DEPLOYED</div>
              <div className="font-heading font-black text-lg text-blue-400">{assignedTeamsCount}</div>
            </div>
          </div>

          {/* Live Incident Feed Container */}
          <div className="flex-1 min-h-0">
            <IncidentFeed />
          </div>

          {/* SMS / IVR Fallback Widget */}
          <div className="h-44 shrink-0">
            <SmsIvrWidget />
          </div>
        </div>

        {/* Center Column (5 cols): DOMINANT LIVE MAP VIEWPORT */}
        <div className="lg:col-span-5 flex flex-col h-full min-h-0 space-y-2">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <CommandMap height="100%" interactive={true} />
          </div>

          {/* Bottom EOC Status Ticker Bar */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl px-4 py-2 text-xs flex items-center justify-between font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>ODISHA SHELTER OCCUPANCY: <b>{totalShelterOcc} / {totalShelterCap}</b> ({Math.round((totalShelterOcc / totalShelterCap) * 100)}%)</span>
            </div>
            <div className="text-gray-400 hidden sm:block">
              RESCUE UNITS: <b>{resources.filter(r => r.status === 'AVAILABLE').length} ODRAF/FIRE AVAILABLE</b>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): TABBED PANELS (INCIDENT DETAILS vs EMERGENCY ROUTE OPTIMIZATION) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 overflow-hidden space-y-2">
          {/* Tab Switcher */}
          <div className="bg-[#111827] border border-gray-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('INCIDENT_DETAILS')}
              className={`flex-1 py-1.5 rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'INCIDENT_DETAILS'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Incident Details</span>
            </button>

            <button
              onClick={() => setActiveTab('ROUTE_OPTIMIZER')}
              className={`flex-1 py-1.5 rounded-lg font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ROUTE_OPTIMIZER'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Route Optimizer</span>
            </button>
          </div>

          {/* Active Panel Viewport */}
          <div className="flex-1 min-h-0">
            {activeTab === 'ROUTE_OPTIMIZER' ? (
              <EmergencyRouteOptimizer />
            ) : (
              <IncidentDetailPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
