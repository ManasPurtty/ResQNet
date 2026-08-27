import React, { useState } from 'react';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { ShelterCard } from '../components/Cards';
import { useAppState } from '../context/StateContext';
import { Home, Activity, CheckCircle2 } from 'lucide-react';

export const SheltersPage = () => {
  const { shelters, updateShelterStatus } = useAppState();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const totalCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOcc = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalAvail = totalCap - totalOcc;

  const filtered = shelters.filter(sh => {
    if (filterStatus !== 'ALL' && sh.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              EVACUATION SHELTER COMMAND
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Real-time shelter capacity tracking, facility readiness, and occupant intake management.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-emerald-950 border border-emerald-800 p-2 rounded-xl text-emerald-300">
              Free Capacity: <b>{totalAvail}</b> / {totalCap} beds
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400 font-mono">Status Filter:</span>
            {['ALL', 'OPEN', 'NEAR_CAPACITY', 'FULL', 'CLOSED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Shelter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(sh => (
            <ShelterCard
              key={sh.id}
              shelter={sh}
              onStatusChange={updateShelterStatus}
            />
          ))}
        </div>
      </main>
    </div>
  );
};
