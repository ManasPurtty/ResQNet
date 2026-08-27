import React from 'react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { AlertCard } from '../components/Cards';
import { CommandMap } from '../components/CommandMap';
import { useAppState } from '../context/StateContext';
import { AlertTriangle, PlusCircle, Radio, ShieldAlert } from 'lucide-react';

export const AlertsPage = () => {
  const { alerts, simulateNewAlert } = useAppState();

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              OFFICIAL WEATHER & HAZARD ALERTS
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Integrated feed from IMD, SDMA, and Water Resources Department emergency radars.
            </p>
          </div>

          <button
            onClick={simulateNewAlert}
            className="px-4 py-2.5 rounded-xl font-heading font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 border border-red-400/30 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 animate-bounce" />
            <span>SIMULATE NEW ALERT</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Alerts Cards List */}
          <div className="lg:col-span-5 space-y-4">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>

          {/* Right Column (7 cols): Map Hazard Viewport */}
          <div className="lg:col-span-7 h-[520px] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
            <CommandMap height="100%" interactive={true} />
            <div className="absolute top-4 left-4 z-10 bg-[#151e32]/90 backdrop-blur-md border border-gray-700/80 p-2.5 rounded-xl text-xs flex items-center gap-2 text-gray-200">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="font-mono font-bold">HAZARD RISK ZONE MAP VIEW</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
