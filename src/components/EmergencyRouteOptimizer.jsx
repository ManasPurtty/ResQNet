import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import {
  findNearestFireStationRescueTeam,
  findNearestHospitalAmbulance,
  findNearestGovernmentSchoolShelter
} from '../services/recommendationEngine';
import {
  Navigation,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Play,
  Square,
  Info,
  Flame,
  Building2,
  School
} from 'lucide-react';

export const EmergencyRouteOptimizer = () => {
  const {
    incidents,
    resources,
    shelters,
    supplyCenters,
    roadHazards,
    routeOrigin,
    setRouteOrigin,
    routeDestination,
    setRouteDestination,
    routeVehicleType,
    setRouteVehicleType,
    optimizedRouteData,
    selectedRouteIndex,
    setSelectedRouteIndex,
    isOptimizingRoute,
    isNavigating,
    runRouteOptimization,
    startRouteNavigation,
    stopRouteNavigation
  } = useAppState();

  const [autoAllotmentInfo, setAutoAllotmentInfo] = useState(null);

  // Available Origin Locations (Fire Stations, Hospital Ambulances, ODRAF bases)
  const originOptions = [
    ...resources.map(r => ({
      id: r.id,
      name: `${r.type === 'AMBULANCE' ? '🚑 Hospital Ambulance' : '🚒 Fire Station / Rescue'}: ${r.name}`,
      lat: r.location.lat,
      lng: r.location.lng,
      type: r.type
    })),
    ...shelters.map(s => ({
      id: s.id,
      name: `🏫 Govt School Shelter: ${s.name}`,
      lat: s.location.lat,
      lng: s.location.lng,
      type: 'SHELTER'
    }))
  ];

  // Available Destination Locations (Incidents)
  const destinationOptions = [
    ...incidents.map(i => ({
      id: i.id,
      name: `🚨 ${i.id}: ${i.title.slice(0, 35)}...`,
      lat: i.location.lat,
      lng: i.location.lng,
      type: 'INCIDENT',
      incidentObj: i
    }))
  ];

  // Auto-allot nearest Fire Station, Hospital Ambulance, and School Shelter when destination changes
  useEffect(() => {
    if (!routeDestination) return;

    const targetIncident = incidents.find(i => i.id === routeDestination.id) || {
      location: { lat: routeDestination.lat, lng: routeDestination.lng }
    };

    if (targetIncident.location) {
      const nearestFire = findNearestFireStationRescueTeam(targetIncident.location, resources);
      const nearestAmb = findNearestHospitalAmbulance(targetIncident.location, resources);
      const nearestSchool = findNearestGovernmentSchoolShelter(targetIncident.location, shelters);

      setAutoAllotmentInfo({
        nearestFire,
        nearestAmb,
        nearestSchool
      });

      // Auto-set start origin to nearest Fire Station or Hospital Ambulance depending on vehicle type
      const targetUnit = (routeVehicleType === 'AMBULANCE' ? nearestAmb?.resource : nearestFire?.resource) || nearestFire?.resource || nearestAmb?.resource;
      if (targetUnit && targetUnit.id !== routeOrigin?.id) {
        setRouteOrigin({
          id: targetUnit.id,
          name: targetUnit.name,
          lat: targetUnit.location.lat,
          lng: targetUnit.location.lng,
          type: targetUnit.type
        });
      }
    }
  }, [routeDestination?.id, routeVehicleType]);

  const handleOriginChange = (e) => {
    const found = originOptions.find(o => o.id === e.target.value);
    if (found) {
      setRouteOrigin(found);
    }
  };

  const handleDestinationChange = (e) => {
    const found = destinationOptions.find(d => d.id === e.target.value);
    if (found) {
      setRouteDestination(found);
    }
  };

  const activeRoute = optimizedRouteData?.alternative_routes[selectedRouteIndex] || optimizedRouteData?.recommended_route;

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-4 border-b border-gray-800 bg-[#151e32] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-gray-100 uppercase tracking-wider">
              Emergency Route Optimization
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">
              Auto Allotment • Nearest Fire Station & Hospital Ambulance
            </p>
          </div>
        </div>

        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          AUTO ALLOTMENT ACTIVE
        </span>
      </div>

      {/* Scrollable Optimizer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AUTOMATIC NEAREST ALLOTMENT BADGES */}
        {autoAllotmentInfo && (
          <div className="bg-[#151e32] border border-blue-900/60 rounded-xl p-3 space-y-2 text-xs">
            <div className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
              <span>AUTOMATIC GEOSPATIAL ALLOTMENT</span>
              <span className="text-emerald-400 font-normal">Nearest Units Computed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Nearest Fire Station */}
              {autoAllotmentInfo.nearestFire && (
                <div
                  onClick={() => {
                    const f = autoAllotmentInfo.nearestFire.resource;
                    setRouteVehicleType('RESCUE_TEAM');
                    setRouteOrigin({ id: f.id, name: f.name, lat: f.location.lat, lng: f.location.lng, type: f.type });
                  }}
                  className="bg-[#0d1322] border border-orange-900/60 p-2 rounded-lg cursor-pointer hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-[11px] text-orange-300">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Nearest Fire Station</span>
                  </div>
                  <div className="text-[10px] text-gray-200 truncate mt-0.5">{autoAllotmentInfo.nearestFire.resource.name}</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                    📍 {autoAllotmentInfo.nearestFire.distanceKm} km | {autoAllotmentInfo.nearestFire.etaMinutes} min ETA
                  </div>
                </div>
              )}

              {/* Nearest Hospital Ambulance */}
              {autoAllotmentInfo.nearestAmb && (
                <div
                  onClick={() => {
                    const a = autoAllotmentInfo.nearestAmb.resource;
                    setRouteVehicleType('AMBULANCE');
                    setRouteOrigin({ id: a.id, name: a.name, lat: a.location.lat, lng: a.location.lng, type: a.type });
                  }}
                  className="bg-[#0d1322] border border-blue-900/60 p-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-[11px] text-blue-300">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Nearest Hospital Ambulance</span>
                  </div>
                  <div className="text-[10px] text-gray-200 truncate mt-0.5">{autoAllotmentInfo.nearestAmb.resource.name}</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                    📍 {autoAllotmentInfo.nearestAmb.distanceKm} km | {autoAllotmentInfo.nearestAmb.etaMinutes} min ETA
                  </div>
                </div>
              )}

              {/* Nearest School Shelter */}
              {autoAllotmentInfo.nearestSchool && (
                <div className="bg-[#0d1322] border border-emerald-900/60 p-2 rounded-lg">
                  <div className="flex items-center gap-1 font-bold text-[11px] text-emerald-300">
                    <School className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nearest School Shelter</span>
                  </div>
                  <div className="text-[10px] text-gray-200 truncate mt-0.5">{autoAllotmentInfo.nearestSchool.shelter.name}</div>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                    📍 {autoAllotmentInfo.nearestSchool.distanceKm} km away
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SELECTION CONTROLS PANEL */}
        <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3.5 space-y-3">
          <div className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Route Selection Configuration</span>
            <span className="text-gray-400 text-[10px]">Select Incident or Base</span>
          </div>

          {/* Destination Dropdown */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-medium">
              Selected Incident / Destination Site:
            </label>
            <select
              value={routeDestination?.id || ''}
              onChange={handleDestinationChange}
              className="w-full bg-[#0d1322] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              {destinationOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Origin Dropdown */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-medium">
              Start Location (Fire Station / Hospital Base):
            </label>
            <select
              value={routeOrigin?.id || ''}
              onChange={handleOriginChange}
              className="w-full bg-[#0d1322] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              {originOptions.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type Selector Grid */}
          <div>
            <label className="text-[11px] text-gray-400 block mb-1 font-medium">
              Vehicle Type & Priority Weight:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'AMBULANCE', label: 'Ambulance (Hospital)', icon: '🚑', desc: 'Hospital Base' },
                { id: 'RESCUE_TEAM', label: 'Rescue (Fire Station)', icon: '🚒', desc: 'Fire Station' },
                { id: 'RELIEF_VEHICLE', label: 'Relief Vehicle', icon: '🚚', desc: 'OSDMA Depot' }
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setRouteVehicleType(v.id)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    routeVehicleType === v.id
                      ? 'bg-blue-950 border-blue-500 text-white shadow-md'
                      : 'bg-[#0d1322] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[11px]">
                    <span>{v.icon}</span>
                    <span className="truncate">{v.label}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => runRouteOptimization()}
            disabled={isOptimizingRoute}
            className={`w-full py-3 rounded-xl font-heading font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              isOptimizingRoute
                ? 'bg-blue-900/50 text-blue-300 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isOptimizingRoute ? 'animate-spin' : ''}`} />
            <span>{isOptimizingRoute ? 'CALCULATING SAFEST ROUTE...' : 'FIND SAFEST ROUTE'}</span>
          </button>
        </div>

        {/* RECOMMENDED ROUTE SUMMARY DISPLAY */}
        {activeRoute && (
          <div className="space-y-3">
            {/* Main Score Banner */}
            <div className="bg-[#151e32] border border-emerald-900/80 rounded-xl p-3.5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-emerald-200">
                    {activeRoute.badgeText || 'RECOMMENDED ROUTE'}
                  </span>
                </div>

                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                    activeRoute.hazard_level === 'LOW'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : activeRoute.hazard_level === 'MODERATE'
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      : 'bg-red-950 text-red-300 border-red-800'
                  }`}
                >
                  HAZARD EXPOSURE: {activeRoute.hazard_level}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-400 font-mono uppercase">Safety Score</div>
                  <div className="font-mono font-black text-lg text-emerald-400 mt-0.5">
                    {activeRoute.safety_score}<span className="text-[10px] text-gray-400">/100</span>
                  </div>
                </div>

                <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-400 font-mono uppercase">Distance</div>
                  <div className="font-mono font-bold text-sm text-blue-300 mt-0.5">
                    {activeRoute.distance_km} km
                  </div>
                </div>

                <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-400 font-mono uppercase">Est. Travel Time</div>
                  <div className="font-mono font-bold text-sm text-gray-100 mt-0.5">
                    {activeRoute.duration_min} min
                  </div>
                </div>
              </div>

              {/* Vehicle Priority Policy */}
              {optimizedRouteData?.vehicle_policy && (
                <div className="bg-[#0d1322] p-2 rounded-lg border border-gray-800/80 text-[10px] text-gray-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{optimizedRouteData.vehicle_policy.priorityRule}</span>
                </div>
              )}

              {/* Start Navigation Action */}
              {isNavigating ? (
                <button
                  onClick={stopRouteNavigation}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  <span>STOP NAVIGATION</span>
                </button>
              ) : (
                <button
                  onClick={startRouteNavigation}
                  className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>START NAVIGATION</span>
                </button>
              )}
            </div>

            {/* ALTERNATIVE ROUTES SELECTION CARDS */}
            {optimizedRouteData?.alternative_routes && (
              <div className="bg-[#151e32] border border-gray-800 rounded-xl p-3.5 space-y-2.5">
                <div className="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-1.5">
                  Route Options & Comparisons
                </div>

                <div className="space-y-2">
                  {optimizedRouteData.alternative_routes.map((rt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedRouteIndex(idx)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedRouteIndex === idx
                          ? 'bg-blue-950/80 border-blue-500 text-white shadow-md'
                          : 'bg-[#0d1322] border-gray-800 text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{rt.tag === 'RECOMMENDED' ? '🟢' : rt.tag === 'FASTEST' ? '⚡' : '🔄'}</span>
                          <span>{rt.title || `Route option #${idx + 1}`}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {rt.distance_km} km | {rt.duration_min} min | Safety: <b className="text-emerald-400">{rt.safety_score}%</b>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          selectedRouteIndex === idx ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {selectedRouteIndex === idx ? 'ACTIVE' : 'SELECT'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
