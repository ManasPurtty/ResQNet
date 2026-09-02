import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { useAppState } from '../context/StateContext';
import { Search, Filter, ShieldAlert, Layers, ExternalLink, ArrowRight } from 'lucide-react';

export const IncidentsPage = () => {
  const { incidents, setSelectedIncidentId } = useAppState();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
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
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              ACTIVE INCIDENTS DIRECTORY
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Monitor, filter, and review all reported disaster incidents across the region.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-red-950 text-red-400 border border-red-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
              TOTAL: {filtered.length} INCIDENTS
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search incident ID, type, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
            <span className="text-gray-400 font-mono">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`shrink-0 px-3 py-1.5 sm:py-1 rounded-lg font-mono font-bold transition-all ${
                  filterSeverity === sev
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {filtered.map(inc => (
            <article key={inc.id} className="rounded-2xl border border-gray-800 bg-[#111827] p-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-blue-400">{inc.id}</span>
                    <span className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 text-[9px] font-bold text-gray-300">{inc.type}</span>
                  </div>
                  <h2 className="mt-2 text-sm font-bold leading-snug text-white">{inc.title}</h2>
                  <p className="mt-1 text-[11px] leading-relaxed text-gray-400">📍 {inc.location.name}</p>
                </div>
                <div className="shrink-0 rounded-xl border border-red-800 bg-red-950/60 px-3 py-2 text-center">
                  <div className="text-[8px] font-bold uppercase text-red-300">Priority</div>
                  <div className="font-mono text-lg font-black text-red-400">{inc.priorityScore}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-lg bg-gray-950/60 p-2"><div className="text-gray-500">Severity</div><div className="mt-1 font-black text-orange-300">{inc.severity}</div></div>
                <div className="rounded-lg bg-gray-950/60 p-2"><div className="text-gray-500">Trapped</div><div className="mt-1 font-black text-red-300">{inc.peopleTrapped || 0}</div></div>
                <div className="rounded-lg bg-gray-950/60 p-2"><div className="text-gray-500">Status</div><div className="mt-1 truncate font-black text-blue-300">{inc.status.replaceAll('_', ' ')}</div></div>
              </div>
              <Link to={`/authority/incidents/${inc.id}`} onClick={() => setSelectedIncidentId(inc.id)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600/20 text-xs font-black text-blue-200">
                Open incident <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>

        {/* Incidents Table */}
        <div className="hidden bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#151e32] text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">ID / Type</th>
                  <th className="py-3.5 px-4">Title & Location</th>
                  <th className="py-3.5 px-4 text-center">Severity</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">People Trapped</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(inc => (
                  <tr key={inc.id} className="hover:bg-[#151e32]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-blue-400 block">{inc.id}</span>
                      <span className="text-[10px] text-gray-400">{inc.type}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-heading font-semibold text-gray-100">{inc.title}</div>
                      <div className="text-[11px] text-gray-400 truncate">📍 {inc.location.name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : inc.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-red-400">
                      {inc.priorityScore}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-200">
                      {inc.peopleTrapped > 0 ? (
                        <span className="text-red-400">⚠️ {inc.peopleTrapped} trapped</span>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-gray-300 border border-gray-800">
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/authority/incidents/${inc.id}`}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export const IncidentDetailPage = () => {
  const { incidents } = useAppState();
  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8">
        <IncidentsPage />
      </main>
    </div>
  );
};
