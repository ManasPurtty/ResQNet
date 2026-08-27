import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useAppState } from '../context/StateContext';
import { HAZARD_ZONE_POLYGON } from '../data/mockData';
import { calculateDistanceKm } from '../services/recommendationEngine';
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
    heatmap: L.layerGroup(),
    routes: L.layerGroup()
  });

  const {
    incidents,
    resources,
    shelters,
    supplyCenters,
    selectedIncidentId,
    setSelectedIncidentId
  } = useAppState();

  const [layerVisibility, setLayerVisibility] = useState({
    incidents: true,
    resources: true,
    shelters: true,
    supplies: true,
    hazardZone: true,
    heatmap: true
  });

  const [showControls, setShowControls] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center near Chennai Adyar/Cooum river basin disaster zone
    const map = L.map(mapContainerRef.current, {
      center: [13.0300, 80.2250],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Add Dark Canvas CartoDB Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control on bottom right
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

  // Update Layers Content whenever state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const groups = layersGroupRef.current;

    // Clear existing
    Object.values(groups).forEach(g => g.clearLayers());

    // 1. Hazard Zone Polygon
    if (layerVisibility.hazardZone) {
      const hazardPolygon = L.polygon(HAZARD_ZONE_POLYGON, {
        color: '#ef4444',
        fillColor: '#dc2626',
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '6, 6'
      });
      hazardPolygon.bindTooltip('<b>HIGH RISK FLOOD ZONE</b><br/>Adyar & Cooum River Spillway', {
        className: 'custom-tooltip',
        sticky: true
      });
      groups.hazardZone.addLayer(hazardPolygon);
    }

    // 2. Heatmap Circles (Incident Density)
    if (layerVisibility.heatmap) {
      incidents.forEach(inc => {
        if (inc.severity === 'CRITICAL' || inc.severity === 'HIGH') {
          const circle = L.circle([inc.location.lat, inc.location.lng], {
            radius: inc.severity === 'CRITICAL' ? 600 : 400,
            color: 'transparent',
            fillColor: inc.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
            fillOpacity: 0.35
          });
          groups.heatmap.addLayer(circle);
        }
      });
    }

    // 3. Incidents Markers
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
        } else if (inc.severity === 'LOW') {
          colorClass = 'bg-emerald-500 border-emerald-300 text-white';
          pingClass = '';
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
        });

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="font-mono text-xs font-bold text-blue-400">${inc.id}</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}">${inc.severity}</span>
            </div>
            <h4 class="font-bold text-xs text-gray-100">${inc.title}</h4>
            <p class="text-[11px] text-gray-300 mt-1">Priority: <b class="text-red-400">${inc.priorityScore}/100</b> | Trapped: <b class="text-amber-400">${inc.peopleTrapped}</b></p>
            <p class="text-[10px] text-gray-400 mt-1">${inc.location.name}</p>
          </div>
        `;
        marker.bindPopup(popupContent);

        groups.incidents.addLayer(marker);
      });
    }

    // 4. Rescue Team Markers
    if (layerVisibility.resources) {
      resources.forEach(res => {
        const isAssigned = res.status === 'ASSIGNED';
        const color = isAssigned ? 'bg-blue-600 border-blue-300' : 'bg-cyan-600 border-cyan-300';

        const teamIcon = L.divIcon({
          className: 'custom-team-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-8 h-8 rounded-lg ${color} text-white border flex items-center justify-center shadow-md font-mono text-[10px] font-bold">
                🚑
              </div>
              <div class="absolute -top-2 -right-2 bg-slate-900 text-blue-300 text-[9px] font-mono font-bold px-1 border border-blue-500/40 rounded">
                ${res.id.replace('TEAM-', 'T')}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([res.location.lat, res.location.lng], { icon: teamIcon });
        marker.bindPopup(`
          <div class="p-2 min-w-[180px]">
            <div class="font-bold text-xs text-blue-300">${res.name}</div>
            <div class="text-[11px] text-gray-300 mt-0.5">Status: <b class="${res.status === 'AVAILABLE' ? 'text-emerald-400' : 'text-blue-400'}">${res.status}</b></div>
            <div class="text-[10px] text-gray-400 mt-1">Capacity: ${res.capacity} persons</div>
          </div>
        `);
        groups.resources.addLayer(marker);
      });
    }

    // 5. Shelter Markers
    if (layerVisibility.shelters) {
      shelters.forEach(sh => {
        const isFull = sh.status === 'FULL';
        const color = isFull ? 'bg-red-800 border-red-500' : 'bg-emerald-600 border-emerald-300';

        const shelterIcon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `
            <div class="w-8 h-8 rounded-lg ${color} text-white border flex items-center justify-center shadow-md text-xs">
              🏠
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

    // 6. Draw Route Lines for Assigned Incidents
    incidents.forEach(inc => {
      if (inc.assignedResourceId) {
        const team = resources.find(r => r.id === inc.assignedResourceId);
        if (team) {
          const latlngs = [
            [team.location.lat, team.location.lng],
            [inc.location.lat, inc.location.lng]
          ];
          const routeLine = L.polyline(latlngs, {
            color: '#3b82f6',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.85
          });

          routeLine.bindTooltip(`Rescue Route: ${team.id} → ${inc.id}`, { sticky: true });
          groups.routes.addLayer(routeLine);
        }
      }
    });

  }, [incidents, resources, shelters, layerVisibility, selectedIncidentId]);

  // Center map on selected incident when changed
  useEffect(() => {
    if (!mapRef.current || !selectedIncidentId) return;
    const selectedInc = incidents.find(i => i.id === selectedIncidentId);
    if (selectedInc) {
      mapRef.current.flyTo([selectedInc.location.lat, selectedInc.location.lng], 14, {
        duration: 1.2
      });
    }
  }, [selectedIncidentId]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-800 bg-[#0b111e] shadow-2xl">
      {/* Map Container */}
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
                { key: 'resources', label: 'Rescue Teams', color: 'text-blue-400' },
                { key: 'shelters', label: 'Shelters', color: 'text-emerald-400' },
                { key: 'supplies', label: 'Supply Centers', color: 'text-purple-400' },
                { key: 'hazardZone', label: 'Disaster Risk Zone', color: 'text-amber-400' },
                { key: 'heatmap', label: 'Heatmap Density', color: 'text-rose-400' }
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
            Command Legend
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-300"></span>
              <span>Critical Incidents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300"></span>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[8px]">🚑</span>
              <span>Rescue Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[8px]">🏠</span>
              <span>Evacuation Shelter</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
