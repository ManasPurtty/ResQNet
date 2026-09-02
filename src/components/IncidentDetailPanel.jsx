import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { calculatePriorityScore } from '../services/priorityEngine';
import {
  getRankedRecommendations,
  findNearestFireStationRescueTeam,
  findNearestHospitalAmbulance,
  findNearestGovernmentSchoolShelter
} from '../services/recommendationEngine';
import {
  ShieldAlert,
  Users,
  Clock,
  MapPin,
  Truck,
  Home,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Phone,
  UserCheck,
  PackageCheck,
  Send,
  Navigation,
  Flame,
  Building2,
  School,
  Radio,
  Loader2
} from 'lucide-react';

export const IncidentDetailPanel = () => {
  const {
    incidents,
    resources,
    shelters,
    selectedIncidentId,
    assignResourceToIncident,
    updateIncidentResponse,
    activateSchoolShelter,
    updateStaffDutyStatus,
    allocateReliefSupplies,
    setRouteOrigin,
    setRouteDestination,
    setActiveTab,
    runRouteOptimization
  } = useAppState();

  const [showReliefDrawer, setShowReliefDrawer] = useState(false);
  const [isNotifyingStaff, setIsNotifyingStaff] = useState(false);
  const [responseUpdating, setResponseUpdating] = useState('');

  const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-gray-500 bg-[#111827] border border-gray-800 rounded-2xl">
        Select an incident from the feed or map to view details.
      </div>
    );
  }

  // Priority Score Calculation
  const priorityCalc = calculatePriorityScore(incident);
  const priorityScore = incident.priorityScore || priorityCalc.score;
  const breakdown = priorityCalc.breakdown;

  // AUTOMATIC ALLOTMENT: Compute Nearest Units
  const nearestFire = findNearestFireStationRescueTeam(incident.location, resources);
  const nearestAmb = findNearestHospitalAmbulance(incident.location, resources);
  const nearestSchool = findNearestGovernmentSchoolShelter(incident.location, shelters);

  const assignedTeam = resources.find(r => r.id === incident.assignedResourceId);
  const assignedShelter = shelters.find(s => s.id === incident.assignedShelterId);

  // Handle Route Optimization Trigger
  const handleOptimizeRouteClick = (teamToUse) => {
    const originTeam = teamToUse || nearestFire?.resource || nearestAmb?.resource || resources[0];
    setRouteOrigin({
      id: originTeam.id,
      name: originTeam.name,
      lat: originTeam.location.lat,
      lng: originTeam.location.lng,
      type: originTeam.type
    });
    setRouteDestination({
      id: incident.id,
      name: `${incident.id}: ${incident.location.name}`,
      lat: incident.location.lat,
      lng: incident.location.lng,
      type: "INCIDENT"
    });
    setActiveTab('ROUTE_OPTIMIZER');
    runRouteOptimization(
      { lat: originTeam.location.lat, lng: originTeam.location.lng, name: originTeam.name },
      { lat: incident.location.lat, lng: incident.location.lng, name: incident.id },
      'AMBULANCE'
    );
  };

  const handleActivateShelterClick = (shelterId) => {
    setIsNotifyingStaff(true);
    setTimeout(() => {
      setIsNotifyingStaff(false);
      activateSchoolShelter(incident.id, shelterId, incident.peopleAffected || 35);
    }, 600);
  };

  const handleResponseStatus = async responderStatus => {
    setResponseUpdating(responderStatus);
    try {
      await updateIncidentResponse(incident.id, {
        responderStatus,
        resourceId: incident.assignedResourceId,
        resourceName: assignedTeam?.name || incident.assignedResourceName,
        shelterId: incident.assignedShelterId,
        etaMinutes: responderStatus === 'EN_ROUTE' ? 6 : responderStatus === 'ARRIVED' ? 0 : incident.etaMinutes
      });
    } catch {
      // The shared state already displays the API error as a toast.
    } finally {
      setResponseUpdating('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-800 bg-[#151e32] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-black text-sm text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
            {incident.id}
          </span>
          <h3 className="font-heading font-bold text-sm text-gray-100 truncate max-w-[220px]">
            {incident.title}
          </h3>
        </div>

        <span
          className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
            incident.severity === 'CRITICAL'
              ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
              : incident.severity === 'HIGH'
              ? 'bg-orange-950 text-orange-300 border-orange-800'
              : 'bg-yellow-950 text-yellow-300 border-yellow-800'
          }`}
        >
          {incident.severity}
        </span>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AUTOMATIC ALLOTMENT SUMMARY CARD */}
        <div className="bg-[#151e32] border border-blue-900/80 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AUTOMATIC GEOSPATIAL ALLOTMENT
            </span>
            <span className="text-emerald-400">Nearest Station Match</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Nearest Fire Station */}
            {nearestFire && (
              <div className="bg-[#0d1322] border border-orange-900/60 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-orange-300">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Nearest Fire Station / Rescue</span>
                  </div>
                  <div className="font-semibold text-gray-200 text-xs mt-0.5">{nearestFire.resource.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">📍 {nearestFire.distanceKm} km away | ETA {nearestFire.etaMinutes} min</div>
                </div>

                <button
                  onClick={() => assignResourceToIncident(incident.id, nearestFire.resource.id)}
                  disabled={incident.assignedResourceId === nearestFire.resource.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors font-mono ${
                    incident.assignedResourceId === nearestFire.resource.id
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md'
                  }`}
                >
                  {incident.assignedResourceId === nearestFire.resource.id ? 'ASSIGNED' : 'ASSIGN FIRE STATION'}
                </button>
              </div>
            )}

            {/* Nearest Hospital Ambulance */}
            {nearestAmb && (
              <div className="bg-[#0d1322] border border-blue-900/60 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-blue-300">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Nearest Hospital Ambulance Base</span>
                  </div>
                  <div className="font-semibold text-gray-200 text-xs mt-0.5">{nearestAmb.resource.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">📍 {nearestAmb.distanceKm} km away | ETA {nearestAmb.etaMinutes} min</div>
                </div>

                <button
                  onClick={() => handleOptimizeRouteClick(nearestAmb.resource)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold font-mono transition-colors"
                >
                  ROUTE AMBULANCE
                </button>
              </div>
            )}

            {/* Nearest School Shelter */}
            {nearestSchool && (
              <div className="bg-[#0d1322] border border-emerald-900/60 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <School className="w-4 h-4 text-emerald-400" />
                    <span>Nearest School Shelter</span>
                  </div>
                  <div className="font-semibold text-gray-200 text-xs mt-0.5">{nearestSchool.shelter.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">📍 {nearestSchool.distanceKm} km away | {nearestSchool.shelter.available} free beds</div>
                </div>

                <button
                  onClick={() => handleActivateShelterClick(nearestSchool.shelter.id)}
                  disabled={incident.assignedShelterId === nearestSchool.shelter.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors font-mono ${
                    incident.assignedShelterId === nearestSchool.shelter.id
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md'
                  }`}
                >
                  {incident.assignedShelterId === nearestSchool.shelter.id ? 'ACTIVATED' : 'ACTIVATE SHELTER'}
                </button>
              </div>
            )}
          </div>
        </div>

        {incident.databaseBacked && (
          <div className="space-y-3 rounded-xl border border-violet-800/80 bg-violet-950/25 p-3.5">
            <div className="flex items-center justify-between border-b border-violet-900/60 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-200">
                <Radio className="h-4 w-4 animate-pulse text-violet-400" /> Live MongoDB responder tracking
              </div>
              <span className="rounded bg-violet-950 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300">
                {(incident.responderStatus || 'AWAITING_ASSIGNMENT').replaceAll('_', ' ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {['ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'RESCUE_IN_PROGRESS', 'COMPLETED'].map(status => (
                <button
                  type="button"
                  key={status}
                  onClick={() => handleResponseStatus(status)}
                  disabled={Boolean(responseUpdating) || incident.responderStatus === status}
                  className={`rounded-lg border px-2 py-2 text-[10px] font-bold transition-colors ${
                    incident.responderStatus === status
                      ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
                      : 'border-violet-800 bg-[#151e32] text-violet-200 hover:bg-violet-900/60 disabled:cursor-wait disabled:opacity-50'
                  }`}
                >
                  {responseUpdating === status
                    ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
                    : status.replaceAll('_', ' ')}
                </button>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-gray-400">
              Every update is saved in MongoDB, sent to all reporters, and appears live in their My Reports timeline.
            </p>
          </div>
        )}

        {/* Incident Summary Metadata & Image */}
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3 space-y-3">
          {incident.image && (
            <div className="relative h-32 rounded-lg overflow-hidden border border-gray-800">
              <img
                src={incident.image}
                alt={incident.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                <span className="text-[11px] text-gray-300 font-mono">
                  📍 {incident.location.name}
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-300 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-gray-800">
            "{incident.description}"
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">People Affected</div>
              <div className="font-bold text-sm text-gray-100 mt-0.5">{incident.peopleAffected}</div>
            </div>
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">People Trapped</div>
              <div className="font-bold text-sm text-red-400 mt-0.5">{incident.peopleTrapped}</div>
            </div>
            <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
              <div className="text-[10px] text-gray-400 font-mono uppercase">Vulnerable</div>
              <div className="font-bold text-sm text-amber-400 mt-0.5">{incident.vulnerablePeople}</div>
            </div>
          </div>
        </div>

        {/* PRIORITY SCORE */}
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-200">
                Rule-Based Priority Score
              </h4>
            </div>
            <div className="flex items-center gap-1 font-mono font-black text-base text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
              <span>{priorityScore}</span>
              <span className="text-[10px] text-gray-400">/ 100</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>Severity Level</span>
                <span className="font-mono text-red-400 font-bold">{breakdown.severity}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${breakdown.severity}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-gray-300 mb-1">
                <span>People Affected</span>
                <span className="font-mono text-orange-400 font-bold">{breakdown.peopleAffected}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${breakdown.peopleAffected}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
