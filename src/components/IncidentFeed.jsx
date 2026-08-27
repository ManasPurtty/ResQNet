import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { AlertCircle, Search, Filter, ShieldAlert, Clock, Users, ArrowUpRight } from 'lucide-react';

export const IncidentFeed = () => {
  const { incidents, selectedIncidentId, setSelectedIncidentId } = useAppState();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.location.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="p-3.5 border-b border-gray-800 bg-[#151e32] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="font-heading font-bold text-sm tracking-wide text-gray-100">
            Live Incident Feed
          </h3>
          <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
            LIVE ({filtered.length})
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px]">
          {['ALL', 'CRITICAL', 'HIGH'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded-md font-semibold font-mono transition-colors ${
                filterSeverity === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : sev === 'HIGH'
                    ? 'bg-orange-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-gray-800/60 bg-[#0d1322]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search incident ID, type, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#151e32] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Incidents List Scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60 p-2 space-y-2">
        {filtered.map(inc => {
          const isSelected = inc.id === selectedIncidentId;
          const isCritical = inc.severity === 'CRITICAL';
          const isHigh = inc.severity === 'HIGH';

          let borderClass = 'border-gray-800 bg-[#151e32]/60 hover:bg-[#151e32]';
          let priorityBadgeClass = 'bg-gray-800 text-gray-300';

          if (isCritical) {
            borderClass = isSelected
              ? 'border-red-500 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              : 'border-red-900/60 bg-[#151e32]/80 hover:bg-red-950/20';
            priorityBadgeClass = 'bg-red-600 text-white';
          } else if (isHigh) {
            borderClass = isSelected
              ? 'border-orange-500 bg-orange-950/40'
              : 'border-orange-900/40 bg-[#151e32]/80 hover:bg-orange-950/20';
            priorityBadgeClass = 'bg-orange-600 text-white';
          } else if (isSelected) {
            borderClass = 'border-blue-500 bg-blue-950/40';
          }

          return (
            <div
              key={inc.id}
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${borderClass}`}
            >
              {/* Header line */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-blue-400 tracking-wider">
                    🚨 {inc.id}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${priorityBadgeClass}`}>
                    {inc.type} — {inc.severity}
                  </span>
                </div>

                {/* Priority Gauge */}
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-[10px] text-gray-400">PRIORITY</span>
                  <span className={`font-black ${isCritical ? 'text-red-400 text-sm' : 'text-amber-400'}`}>
                    {inc.priorityScore}
                  </span>
                </div>
              </div>

              {/* Title & Location */}
              <h4 className="font-heading font-semibold text-xs text-gray-100 mt-1.5 group-hover:text-blue-300 transition-colors">
                {inc.title}
              </h4>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                📍 {inc.location.name}
              </p>

              {/* Status / Trapped Row */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-800/60">
                <div className="flex items-center gap-3">
                  {inc.peopleTrapped > 0 && (
                    <span className="text-red-400 font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-red-500" />
                      <b>{inc.peopleTrapped}</b> trapped
                    </span>
                  )}
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inc.waitingTimeMinutes}m ago
                  </span>
                </div>

                {/* Status pill */}
                <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                  inc.status === 'UNASSIGNED'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : inc.status === 'RESOURCE_ASSIGNED'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {inc.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
