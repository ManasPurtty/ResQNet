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
  LocateFixed,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const CitizenNearbyLocator = () => {
  const navigate = useNavigate();
  const { resources, shelters, roadHazards, setRouteOrigin, setRouteDestination, setActiveTab } = useAppState();

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const layersGroupRef = useRef({
    shelters: L.layerGroup(),
    hospitals: L.layerGroup(),
    fireStations: L.layerGroup(),
    hazards: L.layerGroup()
  });

  // User's own detected location
  const [userLocation, setUserLocation] = useState({
    lat: 20.2961,
    lng: 85.8245,
    name: 'Bhubaneswar Capital Hub, Odisha'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState('Detecting your GPS location in Odisha...');
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
            name: `Live GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          });
          setLocationStatus('📍 Live GPS Detected');
        },
        () => {
          setLocationStatus('📍 Default Odisha Location Selected');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Preset location quick-switcher
  const presetLocations = [
    { name: 'Bhubaneswar (Capital)', lat: 20.2961, lng: 85.8245 },
    { name: 'Rourkela (Sundargarh)', lat: 22.2530, lng: 84.8980 },
    { name: 'Cuttack (City)', lat: 20.4670, lng: 85.8720 },
    { name: 'Puri (Coastal)', lat: 19.8110, lng: 85.8340 }
  ];

  // Calculate distance for all facilities
  const nearbyShelters = shelters.map(s => {
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, s.location.lat, s.location.lng);
    return {
      ...s,
      facilityType: 'SHELTER',
      distanceKm: dist,
      etaMin: Math.max(3, Math.round(dist * 2.5 + 2))
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyHospitals = resources.filter(r => r.type === 'AMBULANCE' || r.category === 'AMBULANCE').map(h => {
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, h.location.lat, h.location.lng);
    return {
      ...h,
      facilityType: 'HOSPITAL',
      distanceKm: dist,
      etaMin: Math.max(2, Math.round(dist * 2.2 + 2))
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyFireStations = resources.filter(r => r.type === 'FIRE_STATION' || r.type === 'ODRAF' || r.category === 'RESCUE_TEAM').map(f => {
    const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, f.location.lat, f.location.lng);
    return {
      ...f,
      facilityType: 'FIRE_STATION',
      distanceKm: dist,
      etaMin: Math.max(3, Math.round(dist * 2.5 + 2))
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc'
    }).addTo(map);

    const pane = map.getPane('tilePane');
    if (pane) {
      pane.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.82) saturate(1.4) contrast(0.9)';
    }

    Object.values(layersGroupRef.current).forEach(g => g.addTo(map));

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

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.8 });

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
          <div class="absolute -bottom-6 bg-slate-900/95 text-blue-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/60 shadow whitespace-nowrap">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

    const groups = layersGroupRef.current;
    Object.values(groups).forEach(g => g.clearLayers());

    // School Shelters
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
            🏫 GOVERNMENT SCHOOL SHELTER
          </span>
          <h4 class="font-bold text-xs text-white mt-1">${sh.name}</h4>
          <p class="text-[11px] text-gray-300">📍 ${sh.distanceKm} km away (~${sh.etaMin} mins)</p>
          <p class="text-[10px] text-emerald-400 mt-1 font-mono">Available Beds: ${sh.available} free</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(sh));
      groups.shelters.addLayer(marker);
    });

    // Hospitals
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
            🚑 HOSPITAL AMBULANCE
          </span>
          <h4 class="font-bold text-xs text-white mt-1">${h.name}</h4>
          <p class="text-[11px] text-gray-300">📍 ${h.distanceKm} km away (~${h.etaMin} mins)</p>
          <p class="text-[10px] text-blue-300 mt-1 font-mono">Emergency: ${h.phone || '108'}</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(h));
      groups.hospitals.addLayer(marker);
    });

    // Fire Stations
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
          <p class="text-[11px] text-gray-300">📍 ${f.distanceKm} km away (~${f.etaMin} mins)</p>
          <p class="text-[10px] text-orange-300 mt-1 font-mono">Helpline: ${f.phone || '101'}</p>
        </div>
      `);
      marker.on('click', () => setSelectedFacility(f));
      groups.fireStations.addLayer(marker);
    });

  }, [userLocation, resources, shelters]);

  // Filtered List
  let facilityList = [];
  if (activeCategory === 'ALL' || activeCategory === 'SHELTER') facilityList.push(...nearbyShelters.slice(0, 4));
  if (activeCategory === 'ALL' || activeCategory === 'HOSPITAL') facilityList.push(...nearbyHospitals.slice(0, 3));
  if (activeCategory === 'ALL' || activeCategory === 'FIRE_STATION') facilityList.push(...nearbyFireStations.slice(0, 3));
  facilityList.sort((a, b) => a.distanceKm - b.distanceKm);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    facilityList = facilityList.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.location?.name && f.location.name.toLowerCase().includes(q)) ||
      (f.district && f.district.toLowerCase().includes(q))
    );
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Banner with GPS Status & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="max-w-full bg-blue-950 text-blue-400 border border-blue-800 text-[9px] sm:text-[10px] leading-relaxed font-mono font-bold px-2.5 py-1 rounded-xl sm:rounded-full uppercase flex items-center gap-1.5">
              <LocateFixed className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              CITIZEN PROXIMITY RADAR & EVACUATION FINDER
            </span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-3xl text-white">
            Emergency Facilities at Your Location
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Live interactive map centered on your GPS position. Tap any school shelter, hospital, or fire station for details.
          </p>
        </div>

        <Link
          to="/report"
          state={{ defaultLat: userLocation.lat, defaultLng: userLocation.lng, defaultLocationName: userLocation.name }}
          className="px-6 py-3.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-xl shadow-red-600/30 border border-red-400/30 transition-all flex items-center justify-center gap-2 shrink-0 transform hover:-translate-y-0.5"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>REPORT EMERGENCY AT THIS SPOT</span>
        </Link>
      </div>

      {/* Location Bar & Quick Area Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#151e32] p-3.5 rounded-2xl border border-gray-800">
        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-mono font-semibold leading-relaxed text-gray-300">{locationStatus}:</span>
          <span className="max-w-full break-words font-mono font-bold text-blue-400 bg-blue-950/90 px-2.5 py-1 rounded-lg border border-blue-900">
            {userLocation.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-gray-400 font-mono text-[11px]">Select District:</span>
          {presetLocations.map(loc => (
            <button
              key={loc.name}
              onClick={() => {
                setUserLocation({ lat: loc.lat, lng: loc.lng, name: loc.name });
                setLocationStatus(`📍 Switched to ${loc.name}`);
              }}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-[#0d1322] hover:bg-blue-950 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Map (7 Cols) */}
        <div className="lg:col-span-7 h-[340px] sm:h-[460px] rounded-2xl overflow-hidden border border-gray-800 relative shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full dark-map z-0" />
          <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 bg-[#151e32]/90 backdrop-blur-md border border-gray-700 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono text-gray-200 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Click anywhere to move your location pin</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-[#151e32]/90 backdrop-blur-md border border-gray-700 px-2.5 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[11px] font-mono text-gray-300 shadow-lg flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">🏫 Shelter</span>
            <span className="flex items-center gap-1">🚑 Hospital</span>
            <span className="flex items-center gap-1">🚒 Fire Station</span>
          </div>
        </div>

        {/* Right Facility Drawer (5 Cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search school, hospital, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#151e32] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'All Nearby' },
              { id: 'SHELTER', label: `🏫 Shelters (${nearbyShelters.length})` },
              { id: 'HOSPITAL', label: `🚑 Hospitals (${nearbyHospitals.length})` },
              { id: 'FIRE_STATION', label: `🚒 Fire (${nearbyFireStations.length})` }
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

          {/* Facility Cards List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {facilityList.length === 0 ? (
              <div className="bg-[#151e32] p-6 rounded-2xl text-center text-xs text-gray-400 border border-gray-800">
                No matching facility found in this area.
              </div>
            ) : (
              facilityList.map((item, idx) => {
                const isShelter = item.facilityType === 'SHELTER';
                const isHospital = item.facilityType === 'HOSPITAL';
                const isFire = item.facilityType === 'FIRE_STATION';

                return (
                  <div
                    key={item.id || idx}
                    className={`bg-[#151e32] border rounded-2xl p-4 space-y-2 transition-all hover:border-blue-500 shadow-md ${
                      isShelter
                        ? 'border-emerald-900/80 hover:border-emerald-500'
                        : isHospital
                        ? 'border-blue-900/80 hover:border-blue-500'
                        : 'border-orange-900/80 hover:border-orange-500'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isShelter
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : isHospital
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-orange-950 text-orange-300 border-orange-800'
                        }`}
                      >
                        {isShelter ? '🏫 GOVERNMENT SCHOOL SHELTER' : isHospital ? '🚑 HOSPITAL & AMBULANCE' : '🚒 FIRE STATION'}
                      </span>

                      <span className="text-xs font-mono font-black text-gray-100 bg-[#0d1322] px-2.5 py-0.5 rounded-lg border border-gray-800">
                        📍 {item.distanceKm} km
                      </span>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        📍 {item.location.name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 border-t border-gray-800/80 pt-2 font-mono">
                      <span className="text-emerald-400">⏱️ ~{item.etaMin} mins away</span>
                      {isShelter && (
                        <span className="text-gray-200"><b>{item.available}</b> beds free</span>
                      )}
                      {(isHospital || isFire) && (
                        <span className="text-blue-300 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.phone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
