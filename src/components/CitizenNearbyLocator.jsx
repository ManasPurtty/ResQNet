import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { useAppState } from '../context/StateContext';
import { calculateDistanceKm } from '../services/recommendationEngine';
import {
  MapPin,
  Navigation,
  School,
  Building2,
  Flame,
  AlertTriangle,
  Phone,
  Shield,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  LocateFixed
} from 'lucide-react';

export const CitizenNearbyLocator = () => {
  const navigate = useNavigate();
  const { resources, shelters, roadHazards } = useAppState();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const layersGroupRef = useRef({
    shelters: L.layerGroup(),
    hospitals: L.layerGroup(),
    fireStations: L.layerGroup(),
    hazards: L.layerGroup()
  });

  // User's own detected location (default to Bhubaneswar or detected via Geolocation)
  const [userLocation, setUserLocation] = useState({
    lat: 20.2961,
    lng: 85.8245,
    name: 'Bhubaneswar Capital Area, Odisha'
  });

  const [locationStatus, setLocationStatus] = useState('Detecting your GPS location...');
  const [activeCategory, setActiveCategory] = useState('ALL'); // 'ALL', 'SHELTER', 'HOSPITAL', 'FIRE_STATION'
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Auto Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({
            lat,
            lng,
            name: `My GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          });
          setLocationStatus('📍 Live GPS Detected');
        },
        (err) => {
          setLocationStatus('📍 Default Odisha Location Selected');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Quick preset locations for Odisha citizens
  const presetLocations = [
    { name: 'Bhubaneswar (Capital)', lat: 20.2961, lng: 85.8245 },
    { name: 'Rourkela (Sundargarh)', lat: 22.2530, lng: 84.8980 },
    { name: 'Cuttack (City)', lat: 20.4670, lng: 85.8720 },
    { name: 'Puri (Coastal)', lat: 19.8110, lng: 85.8340 }
  ];

  // Calculate distances for all facilities relative to citizen location
  const nearbyShelters = shelters.map(s => ({
    ...s,
    facilityType: 'SHELTER',
    distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, s.location.lat, s.location.lng),
    etaMin: Math.max(3, Math.round(calculateDistanceKm(userLocation.lat, userLocation.lng, s.location.lat, s.location.lng) * 2.5 + 2))
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyHospitals = resources.filter(r => r.type === 'AMBULANCE' || r.category === 'AMBULANCE').map(h => ({
    ...h,
    facilityType: 'HOSPITAL',
    distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng),
    etaMin: Math.max(2, Math.round(calculateDistanceKm(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng) * 2.2 + 2))
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyFireStations = resources.filter(r => r.type === 'FIRE_STATION' || r.type === 'ODRAF' || r.category === 'RESCUE_TEAM').map(f => ({
    ...f,
    facilityType: 'FIRE_STATION',
    distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, f.location.lat, f.location.lng),
    etaMin: Math.max(3, Math.round(calculateDistanceKm(userLocation.lat, userLocation.lng, f.location.lat, f.location.lng) * 2.5 + 2))
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    // Clean OpenStreetMap tiles with dark CSS filter
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(map);

    const pane = map.getPane('tilePane');
    if (pane) {
      pane.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.82) saturate(1.4) contrast(0.9)';
    }

    Object.values(layersGroupRef.current).forEach(g => g.addTo(map));

    // Allow user to click anywhere on map to reposition their location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setUserLocation({
        lat,
        lng,
        name: `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      });
      setLocationStatus('📍 Location Pinned on Map');
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map markers whenever userLocation or facilities change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Center map on citizen
    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.0 });

    // 1. Citizen's Own Marker (Glowing pulsing radar ring)
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: 'citizen-location-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-4 bg-blue-500/40 rounded-full animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-2xl text-lg font-bold">
            📍
          </div>
          <div class="absolute -bottom-6 bg-slate-900/90 text-blue-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/60 shadow whitespace-nowrap">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    userMarkerRef.current.bindPopup(`
      <div class="p-2 min-w-[180px] font-sans">
        <div class="font-bold text-xs text-blue-400">📍 YOUR CURRENT LOCATION</div>
        <div class="text-[11px] text-gray-300 mt-1">${userLocation.name}</div>
        <div class="text-[10px] text-emerald-400 font-mono mt-1">Tap facilities nearby to view details</div>
      </div>
    `);

    // Clear facility layer groups
    const groups = layersGroupRef.current;
    Object.values(groups).forEach(g => g.clearLayers());

    // 2. Add School Shelter Markers
    nearbyShelters.slice(0, 8).forEach(sh => {
      const shelterIcon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div class="w-8 h-8 rounded-xl bg-emerald-700 text-white border border-emerald-400 flex items-center justify-center shadow-lg text-sm cursor-pointer hover:scale-110 transition-transform">
            🏫
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([sh.location.lat, sh.location.lng], { icon: shelterIcon });
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <span class="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
            🏫 SCHOOL SHELTER
          </span>
          <h4 class="font-bold text-xs text-white mt-1">${sh.name}</h4>
          <p class="text-[11px] text-gray-300">📍 ${sh.distanceKm} km from you (~${sh.etaMin} mins)</p>
          <p class="text-[10px] text-emerald-400 mt-1 font-mono">Capacity: ${sh.available} beds free</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(sh));
      groups.shelters.addLayer(marker);
    });

    // 3. Add Hospital Ambulance Markers
    nearbyHospitals.slice(0, 6).forEach(h => {
      const hospIcon = L.divIcon({
        className: 'custom-hosp-marker',
        html: `
          <div class="w-8 h-8 rounded-xl bg-blue-700 text-white border border-blue-400 flex items-center justify-center shadow-lg text-sm cursor-pointer hover:scale-110 transition-transform">
            🚑
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([h.location.lat, h.location.lng], { icon: hospIcon });
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <span class="text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
            🚑 HOSPITAL & AMBULANCE
          </span>
          <h4 class="font-bold text-xs text-white mt-1">${h.name}</h4>
          <p class="text-[11px] text-gray-300">📍 ${h.distanceKm} km from you (~${h.etaMin} mins)</p>
          <p class="text-[10px] text-blue-300 mt-1 font-mono">Emergency: ${h.phone || '108'}</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(h));
      groups.hospitals.addLayer(marker);
    });

    // 4. Add Fire Station Markers
    nearbyFireStations.slice(0, 6).forEach(f => {
      const fireIcon = L.divIcon({
        className: 'custom-fire-marker',
        html: `
          <div class="w-8 h-8 rounded-xl bg-orange-700 text-white border border-orange-400 flex items-center justify-center shadow-lg text-sm cursor-pointer hover:scale-110 transition-transform">
            🚒
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([f.location.lat, f.location.lng], { icon: fireIcon });
      marker.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <span class="text-[9px] font-mono font-bold bg-orange-950 text-orange-300 border border-orange-800 px-1.5 py-0.5 rounded">
            🚒 FIRE & RESCUE STATION
          </span>
          <h4 class="font-bold text-xs text-white mt-1">${f.name}</h4>
          <p class="text-[11px] text-gray-300">📍 ${f.distanceKm} km from you (~${f.etaMin} mins)</p>
          <p class="text-[10px] text-orange-300 mt-1 font-mono">Helpline: ${f.phone || '101'}</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(f));
      groups.fireStations.addLayer(marker);
    });

  }, [userLocation, resources, shelters]);

  // Combined facilities list filtered by activeCategory
  let facilityList = [];
  if (activeCategory === 'ALL' || activeCategory === 'SHELTER') facilityList.push(...nearbyShelters.slice(0, 3));
  if (activeCategory === 'ALL' || activeCategory === 'HOSPITAL') facilityList.push(...nearbyHospitals.slice(0, 2));
  if (activeCategory === 'ALL' || activeCategory === 'FIRE_STATION') facilityList.push(...nearbyFireStations.slice(0, 2));
  facilityList.sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
              <LocateFixed className="w-3 h-3 text-blue-400 animate-pulse" />
              LIVE CITIZEN PROXIMITY RADAR
            </span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white mt-1">
            NEARBY EMERGENCY SHELTERS & HOSPITALS AT YOUR LOCATION
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Interactive map centered at your exact location showing nearest government school shelters, hospitals, and fire stations.
          </p>
        </div>

        <Link
          to="/report"
          state={{ defaultLat: userLocation.lat, defaultLng: userLocation.lng, defaultLocationName: userLocation.name }}
          className="px-5 py-3 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 border border-red-400/30 transition-all flex items-center justify-center gap-2 shrink-0 transform hover:-translate-y-0.5"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>REPORT AT MY LOCATION</span>
        </Link>
      </div>

      {/* Location Selector Chips & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#151e32] p-3 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-mono font-semibold text-gray-200">{locationStatus}:</span>
          <span className="font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900">
            {userLocation.name}
          </span>
        </div>

        {/* Quick Odisha Location Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-400 font-mono text-[11px]">Jump to Area:</span>
          {presetLocations.map(loc => (
            <button
              key={loc.name}
              onClick={() => {
                setUserLocation({ lat: loc.lat, lng: loc.lng, name: loc.name });
                setLocationStatus(`📍 Switched to ${loc.name}`);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#0d1322] hover:bg-blue-950 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map & Facility Viewer Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map Viewport (7 Cols) */}
        <div className="lg:col-span-7 h-[420px] rounded-2xl overflow-hidden border border-gray-800 relative shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full dark-map z-0" />
          <div className="absolute top-3 left-3 z-10 bg-[#151e32]/90 backdrop-blur-md border border-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-mono text-gray-300">
            Click anywhere on map to pinpoint your location
          </div>
        </div>

        {/* Right Nearby Results Drawer (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Nearby' },
              { id: 'SHELTER', label: '🏫 School Shelters' },
              { id: 'HOSPITAL', label: '🚑 Hospitals' },
              { id: 'FIRE_STATION', label: '🚒 Fire Stations' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#151e32] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {facilityList.map((item, idx) => {
              const isShelter = item.facilityType === 'SHELTER';
              const isHospital = item.facilityType === 'HOSPITAL';
              const isFire = item.facilityType === 'FIRE_STATION';

              return (
                <div
                  key={item.id || idx}
                  className={`bg-[#151e32] border rounded-2xl p-3.5 space-y-2 transition-all hover:border-blue-500 shadow-md ${
                    isShelter
                      ? 'border-emerald-900/80 hover:border-emerald-500'
                      : isHospital
                      ? 'border-blue-900/80 hover:border-blue-500'
                      : 'border-orange-900/80 hover:border-orange-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isShelter
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : isHospital
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-orange-950 text-orange-300 border-orange-800'
                      }`}
                    >
                      {isShelter ? '🏫 GOVERNMENT SCHOOL SHELTER' : isHospital ? '🚑 HOSPITAL AMBULANCE' : '🚒 FIRE & RESCUE STATION'}
                    </span>

                    <span className="text-xs font-mono font-black text-gray-100 bg-[#0d1322] px-2 py-0.5 rounded border border-gray-800">
                      📍 {item.distanceKm} km
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-white">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      📍 {item.location.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-300 border-t border-gray-800/80 pt-2 font-mono">
                    <span className="text-emerald-400">⏱️ ~{item.etaMin} mins away</span>
                    {isShelter && <span>{item.available} beds free</span>}
                    {(isHospital || isFire) && (
                      <span className="text-blue-300 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {item.phone}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
