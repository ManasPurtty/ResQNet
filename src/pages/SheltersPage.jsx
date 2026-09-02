import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthorityHeader } from '../components/AuthorityHeader';
import { useAppState } from '../context/StateContext';
import { calculateDistanceKm } from '../services/recommendationEngine';
import {
  Home,
  MapPin,
  Users,
  CheckCircle2,
  Navigation,
  Send,
  Sparkles,
  AlertCircle,
  Building2,
  Phone,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

export const SheltersPage = () => {
  const navigate = useNavigate();
  const {
    shelters,
    incidents,
    selectedIncidentId,
    setSelectedIncidentId,
    activateSchoolShelter,
    updateShelterStatus,
    setRouteOrigin,
    setRouteDestination,
    setActiveTab
  } = useAppState();

  const [activeIncidentId, setActiveIncidentId] = useState(selectedIncidentId || incidents[0]?.id || "INC-1024");
  const [viewMode, setViewMode] = useState('NEARBY_INCIDENT'); // 'NEARBY_INCIDENT' or 'ALL_SHELTERS'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activatingId, setActivatingId] = useState(null);

  const activeIncident = incidents.find(i => i.id === activeIncidentId) || incidents[0];

  // Calculate distance from active incident for each shelter and rank them
  const sheltersWithDistance = shelters.map(sh => {
    let distanceKm = 3.0;
    if (activeIncident && activeIncident.location && sh.location) {
      distanceKm = calculateDistanceKm(
        activeIncident.location.lat,
        activeIncident.location.lng,
        sh.location.lat,
        sh.location.lng
      );
    }
    const etaMin = Math.max(3, Math.round(distanceKm * 2.5 + 2));
    const isAssigned = activeIncident?.assignedShelterId === sh.id;

    return {
      ...sh,
      distanceKm,
      etaMin,
      isAssigned
    };
  });

  // Sort by nearest distance first
  const sortedByDistance = [...sheltersWithDistance].sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter based on view mode and status
  let displayedShelters = viewMode === 'NEARBY_INCIDENT'
    ? sortedByDistance.slice(0, 5) // Top 5 nearby schools
    : sortedByDistance;

  if (filterStatus !== 'ALL') {
    displayedShelters = displayedShelters.filter(sh => sh.status === filterStatus);
  }

  const totalCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOcc = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalAvail = totalCap - totalOcc;

  const handleAssignShelter = (shelterId) => {
    setActivatingId(shelterId);
    setTimeout(() => {
      activateSchoolShelter(activeIncident.id, shelterId, activeIncident.peopleAffected || 35);
      setActivatingId(null);
    }, 500);
  };

  const handleRouteToShelter = (shelter) => {
    if (activeIncident) {
      setRouteOrigin({
        id: shelter.id,
        name: shelter.name,
        lat: shelter.location.lat,
        lng: shelter.location.lng,
        type: 'SHELTER'
      });
      setRouteDestination({
        id: activeIncident.id,
        name: `${activeIncident.id}: ${activeIncident.location.name}`,
        lat: activeIncident.location.lat,
        lng: activeIncident.location.lng,
        type: 'INCIDENT'
      });
      setActiveTab('ROUTE_OPTIMIZER');
      navigate('/authority/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <AuthorityHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                ODISHA GOVERNMENT HIGH SCHOOL NETWORK
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              INCIDENT SHELTER ALLOCATION & COMMAND
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">
              Find, evaluate and assign the nearest Government School Shelters ranked by real-time distance to disaster incidents.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-emerald-950 border border-emerald-800 p-2.5 rounded-xl text-emerald-300 shadow-lg">
              <div className="text-[10px] text-gray-400">TOTAL STATE SHELTER CAPACITY</div>
              <div className="font-bold text-sm">
                <b>{totalAvail}</b> free / {totalCap} beds ({Math.round((totalOcc / totalCap) * 100)}% occupied)
              </div>
            </div>
          </div>
        </div>

        {/* INCIDENT SELECTOR & VIEW MODE FILTER BAR */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-3">
            {/* Incident Selection Dropdown */}
            <div className="flex-1 space-y-1">
              <label className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5 uppercase">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                Select Disaster Incident to Find Nearest School Shelters:
              </label>
              <select
                value={activeIncidentId}
                onChange={(e) => {
                  setActiveIncidentId(e.target.value);
                  setSelectedIncidentId(e.target.value);
                }}
                className="w-full bg-[#151e32] border border-blue-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    🚨 {inc.id}: {inc.title} ({inc.location.district} - {inc.severity})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle: Nearest Top 3-5 vs All Shelters */}
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2 lg:flex lg:items-center lg:shrink-0">
              <button
                onClick={() => setViewMode('NEARBY_INCIDENT')}
                className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'NEARBY_INCIDENT'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border border-emerald-400/40'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>TOP 5 NEARBY SCHOOLS</span>
              </button>

              <button
                onClick={() => setViewMode('ALL_SHELTERS')}
                className={`min-h-11 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'ALL_SHELTERS'
                    ? 'bg-blue-600 text-white shadow-lg border border-blue-400/40'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ALL ODISHA SHELTERS</span>
              </button>
            </div>
          </div>

          {/* Active Incident Context Banner */}
          {activeIncident && (
            <div className="bg-[#151e32] border border-blue-900/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  {activeIncident.id}
                </span>
                <span className="font-semibold text-gray-200">
                  {activeIncident.title}
                </span>
              </div>
              <div className="text-gray-400 font-mono text-[11px] flex items-center gap-3">
                <span>📍 {activeIncident.location.name}</span>
                <span>👥 {activeIncident.peopleAffected || 35} evacuees needed</span>
              </div>
            </div>
          )}

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 font-mono text-[11px]">Filter Status:</span>
              {['ALL', 'OPEN', 'NEAR_CAPACITY', 'FULL', 'CLOSED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-gray-400 font-mono text-[11px]">
              Showing <b>{displayedShelters.length}</b> Government School Shelters
            </span>
          </div>
        </div>

        {/* SHELTER CARDS GRID (RANKED BY DISTANCE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedShelters.map((sh, index) => {
            const occupancyPercent = Math.round((sh.occupied / sh.capacity) * 100);
            const isTopRanked = index === 0;

            return (
              <div
                key={sh.id}
                className={`bg-[#111827] border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                  sh.isAssigned
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-gradient-to-b from-[#111827] to-emerald-950/20'
                    : isTopRanked && viewMode === 'NEARBY_INCIDENT'
                    ? 'border-blue-500/80 hover:border-blue-400'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Top Badge Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                      #{index + 1}
                    </span>
                    {isTopRanked && viewMode === 'NEARBY_INCIDENT' && (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        CLOSEST MATCH
                      </span>
                    )}
                    {sh.isAssigned && (
                      <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        ✓ CURRENTLY ASSIGNED
                      </span>
                    )}
                  </div>

                  <select
                    value={sh.status}
                    onChange={(e) => updateShelterStatus(sh.id, e.target.value)}
                    className={`font-mono text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                      sh.status === 'OPEN'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : sh.status === 'NEAR_CAPACITY'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : sh.status === 'FULL'
                        ? 'bg-red-950 text-red-300 border-red-800'
                        : 'bg-gray-900 text-gray-400 border-gray-700'
                    }`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="NEAR_CAPACITY">NEAR CAPACITY</option>
                    <option value="FULL">FULL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* School Name & Real-World Odisha Location */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900">
                      {sh.district} District
                    </span>
                    {sh.distanceKm > 40 && (
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                        ⚠ Outside Local Block ({sh.distanceKm} km)
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-base text-gray-100 leading-snug">
                    🏫 {sh.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{sh.location.name}</span>
                  </p>
                </div>

                {/* Distance & Travel Time Metric */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#151e32] p-2.5 rounded-xl border border-gray-800/80">
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">DISTANCE FROM INCIDENT</span>
                    <span className="font-mono font-bold text-blue-300 text-sm">
                      📍 {sh.distanceKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">EVACUATION TRAVEL ETA</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ⏱️ ~{sh.etaMin} mins
                    </span>
                  </div>
                </div>

                {/* Occupancy Meter */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-gray-300">
                    <span>Bed Availability:</span>
                    <span>
                      <b>{sh.occupied}</b> / {sh.capacity} (<b>{sh.available}</b> free)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPercent >= 90
                          ? 'bg-red-500'
                          : occupancyPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Demographic Breakdown */}
                {sh.demographics && (
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] bg-[#0d1322] p-1.5 rounded-lg border border-gray-800">
                    <div><span className="text-gray-400 block">Men</span><b>{sh.demographics.men}</b></div>
                    <div><span className="text-gray-400 block">Women</span><b>{sh.demographics.women}</b></div>
                    <div><span className="text-gray-400 block">Child</span><b className="text-blue-300">{sh.demographics.children}</b></div>
                    <div><span className="text-gray-400 block">Elderly</span><b className="text-amber-300">{sh.demographics.elderly}</b></div>
                  </div>
                )}

                {/* Facility Tags */}
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-mono mb-1">Active Facilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {sh.facilities.map((fac, i) => (
                      <span key={i} className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 text-[10px] px-2 py-0.5 rounded font-mono">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Authorized Emergency Contact */}
                {sh.authorizedEmergencyContact && (
                  <div className="text-[11px] text-gray-300 bg-[#151e32] p-2 rounded-lg border border-gray-800 flex flex-col items-start gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-200">{sh.authorizedEmergencyContact.name}</div>
                      <div className="text-[9px] text-gray-400 font-mono">{sh.authorizedEmergencyContact.role}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
                      {sh.authorizedEmergencyContact.phone}
                    </span>
                  </div>
                )}

                {/* ADMIN ACTION BUTTONS: ASSIGN SHELTER & ROUTE OPTIMIZE */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-800 min-[380px]:grid-cols-2">
                  <button
                    onClick={() => handleAssignShelter(sh.id)}
                    disabled={sh.isAssigned || activatingId === sh.id}
                    className={`py-2.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      sh.isAssigned
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg border border-emerald-400/30'
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${activatingId === sh.id ? 'animate-spin' : ''}`} />
                    <span>{sh.isAssigned ? 'ASSIGNED' : activatingId === sh.id ? 'ASSIGNING...' : 'ASSIGN SHELTER'}</span>
                  </button>

                  <button
                    onClick={() => handleRouteToShelter(sh)}
                    className="py-2.5 rounded-xl font-heading font-bold text-xs bg-[#151e32] hover:bg-gray-800 text-blue-300 border border-blue-800/80 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-400" />
                    <span>SAFE ROUTE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
