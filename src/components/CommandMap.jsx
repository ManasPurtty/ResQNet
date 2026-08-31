import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useAppState } from '../context/StateContext';
import { HAZARD_ZONE_POLYGON } from '../data/mockData';
import { Layers, Eye, ShieldAlert, Navigation } from 'lucide-react';

export const CommandMap = ({ height = '100%', interactive = true }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layersGroupRef = useRef({
    incidents: L.layerGroup(),
    resources: L.layerGroup(),
    shelters: L.layerGroup(),
    supplies: L.layerGroup(),
    hazardZone: L.layerGroup(),
    roadHazards: L.layerGroup(),
    heatmap: L.layerGroup(),
    routes: L.layerGroup(),
    navigationMarker: L.layerGroup()
  });

  const {
    incidents,
    resources,
    shelters,
    supplyCenters,
    roadHazards,
    selectedIncidentId,
    setSelectedIncidentId,
    setRouteDestination,
    setRouteOrigin,
    optimizedRouteData,
    selectedRouteIndex,
    isNavigating,
    navigationProgress
  } = useAppState();

  const [layerVisibility, setLayerVisibility] = useState({
    incidents: true,
    resources: true,
    shelters: true,
    supplies: true,
    hazardZone: true,
    roadHazards: true,
    heatmap: true,
    routes: true
  });

  const [showControls, setShowControls] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Odisha (Bhubaneswar - Cuttack Disaster Command Zone)
    const map = L.map(mapContainerRef.current, {
      center: [20.2961, 85.8245],
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Free OpenStreetMap tiles - no API key needed. Dark look applied via CSS filter.
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Apply dark inversion filter to tile pane for dark-mode map look
    const pane = map.getPane('tilePane');
    if (pane) {
      pane.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.82) saturate(1.4) contrast(0.9)';
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add layer groups to map
    Object.values(layersGroupRef.current).forEach(group => group.addTo(map));

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map Layers whenever state updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const groups = layersGroupRef.current;
    Object.values(groups).forEach(g => g.clearLayers());

    // 1. Flood Vulnerability Risk Polygon
    if (layerVisibility.hazardZone) {
      const hazardPolygon = L.polygon(HAZARD_ZONE_POLYGON, {
        color: '#ef4444',
        fillColor: '#dc2626',
        fillOpacity: 0.2,
        weight: 2,
        dashArray: '6, 6'
      });
      hazardPolygon.bindTooltip('<b>ODISHA HIGH-RISK FLOOD ZONE</b><br/>Daya & Mahanadi River Spillway Area', {
        className: 'custom-tooltip',
        sticky: true
      });
      groups.hazardZone.addLayer(hazardPolygon);
    }

    // 2. Specific Road Hazards Layer (Flooded roads, Blocked roads, Landslides)
    if (layerVisibility.roadHazards && roadHazards) {
      roadHazards.forEach(hazard => {
        let iconHtml = '⚠️';
        let colorClass = 'bg-amber-600 border-amber-400';

        if (hazard.type === 'BLOCKED_ROAD') {
          iconHtml = '⛔';
          colorClass = 'bg-red-950 border-red-600 text-red-400 animate-pulse';
        } else if (hazard.type === 'FLOOD_ROAD') {
          iconHtml = '🌊';
          colorClass = 'bg-blue-900 border-cyan-400 text-cyan-300';
        } else if (hazard.type === 'LANDSLIDE_ROAD') {
          iconHtml = '⛰️';
          colorClass = 'bg-amber-900 border-amber-500 text-amber-300';
        }

        const hazardIcon = L.divIcon({
          className: 'custom-hazard-marker',
          html: `
            <div class="w-7 h-7 rounded-full ${colorClass} border flex items-center justify-center shadow-lg text-xs cursor-pointer">
              ${iconHtml}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([hazard.location.lat, hazard.location.lng], { icon: hazardIcon });
        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center gap-1.5 font-bold text-xs text-red-400">
              <span>${iconHtml}</span>
              <span>${hazard.name}</span>
            </div>
            <div class="text-[10px] text-gray-300 mt-1">${hazard.description}</div>
            <div class="text-[9px] text-gray-400 font-mono mt-1">Severity: <b>${hazard.severity}</b> | Radius: ${hazard.radiusMeters}m</div>
          </div>
        `);
        groups.roadHazards.addLayer(marker);

        // Draw hazard buffer circle
        const circle = L.circle([hazard.location.lat, hazard.location.lng], {
          radius: hazard.radiusMeters || 300,
          color: hazard.type === 'BLOCKED_ROAD' ? '#dc2626' : '#f59e0b',
          fillColor: hazard.type === 'BLOCKED_ROAD' ? '#ef4444' : '#f59e0b',
          fillOpacity: 0.15,
          weight: 1,
          dashArray: '4, 4'
        });
        groups.roadHazards.addLayer(circle);
      });
    }

    // 3. Heatmap Density Circles
    if (layerVisibility.heatmap) {
      incidents.forEach(inc => {
        if (inc.severity === 'CRITICAL' || inc.severity === 'HIGH') {
          const circle = L.circle([inc.location.lat, inc.location.lng], {
            radius: inc.severity === 'CRITICAL' ? 500 : 350,
            color: 'transparent',
            fillColor: inc.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
            fillOpacity: 0.3
          });
          groups.heatmap.addLayer(circle);
        }
      });
    }

    // 4. Incident Markers
    if (layerVisibility.incidents) {
      incidents.forEach(inc => {
        let colorClass = 'bg-yellow-500 border-yellow-300 text-yellow-950';
        let pingClass = 'marker-ping-high';

        if (inc.severity === 'CRITICAL') {
          colorClass = 'bg-red-600 border-red-300 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)]';
          pingClass = 'marker-ping-critical';
        } else if (inc.severity === 'HIGH') {
          colorClass = 'bg-orange-500 border-orange-300 text-white';
          pingClass = 'marker-ping-high';
        }

        const isSelected = inc.id === selectedIncidentId;
        const size = isSelected ? 'w-10 h-10' : 'w-8 h-8';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative flex items-center justify-center">
              ${inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? `<div class="absolute -inset-2 rounded-full ${pingClass}"></div>` : ''}
              <div class="${size} rounded-full border-2 ${colorClass} font-mono font-bold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-125 cursor-pointer ${isSelected ? 'ring-4 ring-blue-400 scale-110' : ''}">
                ${inc.priorityScore}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedIncidentId(inc.id);
          setRouteDestination({
            id: inc.id,
            name: `${inc.id}: ${inc.location.name}`,
            lat: inc.location.lat,
            lng: inc.location.lng,
            type: "INCIDENT"
          });
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="font-mono text-xs font-bold text-blue-400">${inc.id}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}">${inc.severity}</span>
            </div>
            <h4 class="font-bold text-xs text-gray-100">${inc.title}</h4>
            <p class="text-[11px] text-gray-300 mt-1">Priority: <b class="text-red-400">${inc.priorityScore}/100</b> | Trapped: <b class="text-amber-400">${inc.peopleTrapped}</b></p>
            <p class="text-[10px] text-gray-400 mt-1">📍 ${inc.location.name}</p>
          </div>
        `);

        groups.incidents.addLayer(marker);
      });
    }

    // 5. Rescue Resource Markers (ODRAF / Fire / Ambulance)
    if (layerVisibility.resources) {
      resources.forEach(res => {
        const isAssigned = res.status === 'ASSIGNED';
        const color = isAssigned ? 'bg-blue-600 border-blue-300' : 'bg-cyan-600 border-cyan-300';
        const iconEmoji = res.type === 'AMBULANCE' ? '🚑' : res.type === 'BOAT' ? '🚤' : '🚒';

        const teamIcon = L.divIcon({
          className: 'custom-team-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-8 h-8 rounded-lg ${color} text-white border flex items-center justify-center shadow-md font-mono text-[10px] font-bold">
                ${iconEmoji}
              </div>
              <div class="absolute -top-2 -right-2 bg-slate-900 text-blue-300 text-[9px] font-mono font-bold px-1 border border-blue-500/40 rounded">
                ${res.id.slice(0, 5)}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([res.location.lat, res.location.lng], { icon: teamIcon });
        
        marker.on('click', () => {
          setRouteOrigin({
            id: res.id,
            name: res.name,
            lat: res.location.lat,
            lng: res.location.lng,
            type: res.type
          });
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[180px]">
            <div class="font-bold text-xs text-blue-300">${res.name}</div>
            <div class="text-[11px] text-gray-300 mt-0.5">Status: <b class="${res.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-blue-400'}">${res.status}</b></div>
            <div class="text-[10px] text-gray-400 mt-1">District: ${res.district || 'Khordha'}</div>
          </div>
        `);

        groups.resources.addLayer(marker);
      });
    }

    // 6. Government School Shelter Markers
    if (layerVisibility.shelters) {
      shelters.forEach(sh => {
        const isFull = sh.status === 'FULL';
        const color = isFull ? 'bg-red-800 border-red-500' : 'bg-emerald-600 border-emerald-300';

        const shelterIcon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `
            <div class="w-8 h-8 rounded-lg ${color} text-white border flex items-center justify-center shadow-md text-xs">
              🏫
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([sh.location.lat, sh.location.lng], { icon: shelterIcon });
        marker.bindPopup(`
          <div class="p-2 min-w-[180px]">
            <div class="font-bold text-xs text-emerald-300">${sh.name}</div>
            <div class="text-[11px] text-gray-300 mt-0.5">Capacity: <b>${sh.occupied} / ${sh.capacity}</b> (${sh.available} free)</div>
            <div class="text-[10px] text-emerald-400 mt-1">${sh.status}</div>
          </div>
        `);
        groups.shelters.addLayer(marker);
      });
    }

    // 7. RENDER EMERGENCY OPTIMIZED ROUTES ON MAP
    if (layerVisibility.routes && optimizedRouteData?.alternative_routes) {
      optimizedRouteData.alternative_routes.forEach((route, idx) => {
        const isSelected = idx === selectedRouteIndex;
        let routeColor = isSelected ? '#10b981' : '#f59e0b'; // Emerald for selected safe, Amber for alternative
        if (idx === 0) routeColor = isSelected ? '#10b981' : '#059669';
        if (idx === 1) routeColor = isSelected ? '#3b82f6' : '#2563eb';
        if (idx === 2) routeColor = isSelected ? '#a855f7' : '#7c3aed';

        const polyline = L.polyline(route.geometry, {
          color: routeColor,
          weight: isSelected ? 6 : 3,
          opacity: isSelected ? 0.95 : 0.45,
          dashArray: isSelected ? null : '6, 6'
        });

        polyline.bindTooltip(`<b>${route.badgeText || route.title}</b><br/>${route.distance_km}km | ${route.duration_min}min | Safety: ${route.safety_score}%`, {
          sticky: true
        });

        groups.routes.addLayer(polyline);
      });
    }

    // 8. ANIMATED NAVIGATION VEHICLE MARKER ALONG ROUTE POLYLINE
    if (isNavigating && optimizedRouteData?.alternative_routes[selectedRouteIndex]) {
      const activeRoute = optimizedRouteData.alternative_routes[selectedRouteIndex];
      const coords = activeRoute.geometry;
      if (coords && coords.length > 1) {
        const totalSegments = coords.length - 1;
        const currentSegmentIndex = Math.min(totalSegments - 1, Math.floor(navigationProgress * totalSegments));
        const segProgress = (navigationProgress * totalSegments) - currentSegmentIndex;

        const p1 = coords[currentSegmentIndex];
        const p2 = coords[currentSegmentIndex + 1] || p1;

        const currentLat = p1[0] + (p2[0] - p1[0]) * segProgress;
        const currentLng = p1[1] + (p2[1] - p1[1]) * segProgress;

        const vehicleMarkerIcon = L.divIcon({
          className: 'custom-nav-vehicle',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute -inset-3 bg-emerald-500/40 rounded-full animate-ping"></div>
              <div class="w-9 h-9 rounded-full bg-emerald-600 text-white border-2 border-white flex items-center justify-center shadow-2xl text-base font-bold">
                🚑
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const navMarker = L.marker([currentLat, currentLng], { icon: vehicleMarkerIcon });
        navMarker.bindTooltip(`Emergency Vehicle En Route (${Math.round(navigationProgress * 100)}% complete)`, { permanent: false });
        groups.navigationMarker.addLayer(navMarker);
      }
    }

  }, [incidents, resources, shelters, roadHazards, layerVisibility, selectedIncidentId, optimizedRouteData, selectedRouteIndex, isNavigating, navigationProgress]);

  // Center map on selected incident when changed
  useEffect(() => {
    if (!mapRef.current || !selectedIncidentId) return;
    const selectedInc = incidents.find(i => i.id === selectedIncidentId);
    if (selectedInc) {
      mapRef.current.flyTo([selectedInc.location.lat, selectedInc.location.lng], 13, { duration: 1.2 });
    }
  }, [selectedIncidentId]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-800 bg-[#0b111e] shadow-2xl">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full dark-map z-0" />

      {/* Layer Control Toggle Button */}
      {interactive && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center gap-2 px-3 py-2 bg-[#151e32]/90 border border-gray-700/80 backdrop-blur-md rounded-xl text-xs font-semibold text-gray-200 shadow-xl hover:bg-gray-800 transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Map Layers</span>
          </button>

          {/* Layer Options Drawer */}
          {showControls && (
            <div className="mt-2 w-56 p-3 bg-[#151e32]/95 border border-gray-700 backdrop-blur-md rounded-xl shadow-2xl space-y-2 text-xs">
              <div className="font-heading font-bold text-gray-300 border-b border-gray-800 pb-1.5 uppercase text-[10px] tracking-wider">
                Display Layers
              </div>

              {[
                { key: 'incidents', label: 'Citizen Incidents', color: 'text-red-400' },
                { key: 'resources', label: 'ODRAF / Fire Teams', color: 'text-blue-400' },
                { key: 'shelters', label: 'School Shelters', color: 'text-emerald-400' },
                { key: 'routes', label: 'Safe Optimized Routes', color: 'text-emerald-400' },
                { key: 'roadHazards', label: 'Road Hazards & Blocks', color: 'text-amber-400' },
                { key: 'hazardZone', label: 'Flood Risk Polygon', color: 'text-rose-400' },
                { key: 'heatmap', label: 'Heatmap Density', color: 'text-orange-400' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between text-gray-300 hover:text-white cursor-pointer select-none">
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={layerVisibility[item.key]}
                    onChange={(e) => setLayerVisibility({ ...layerVisibility, [item.key]: e.target.checked })}
                    className="rounded bg-slate-900 border-gray-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Legend Overlay */}
      {interactive && (
        <div className="absolute bottom-4 left-4 z-10 bg-[#151e32]/90 backdrop-blur-md border border-gray-800/80 p-2.5 rounded-xl text-[11px] shadow-xl text-gray-300 hidden sm:block">
          <div className="font-mono font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">
            Command Map Legend
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>🟢 Safe Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span>🟡 Moderate Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span>🟠 High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>🔴 Critical Hazard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-950 border border-red-600 text-[8px] flex items-center justify-center">⛔</span>
              <span>⚫ Blocked Road</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-900 border border-cyan-400 text-[8px] flex items-center justify-center">🌊</span>
              <span>Flooded Road</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
