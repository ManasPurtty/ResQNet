import React, { useState } from 'react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { ResourceCard } from '../components/Cards';
import { useAppState } from '../context/StateContext';
import { Truck, Filter, Plus } from 'lucide-react';

export const ResourcesPage = () => {
  const { resources, updateResourceStatus } = useAppState();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = resources.filter(res => {
    if (filterStatus !== 'ALL' && res.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              RESOURCE MANAGEMENT CENTER
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Monitor, deploy, and update statuses for rescue teams, boats, medical ICUs, and supply fleets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
              TOTAL UNITS: {resources.length}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-mono">Status Filter:</span>
            {['ALL', 'AVAILABLE', 'ASSIGNED', 'BUSY', 'UNAVAILABLE'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(res => (
            <ResourceCard
              key={res.id}
              resource={res}
              onStatusChange={updateResourceStatus}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
