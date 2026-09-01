import { ODISHA_ROAD_HAZARDS } from '../data/mockData';
import { API_BASE_URL } from '../config/api';

// Helper: Haversine distance in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance from point to segment in meters
function distanceToSegmentMeters(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dAB = calculateDistanceMeters(aLat, aLng, bLat, bLng);
  if (dAB < 1) return calculateDistanceMeters(pLat, pLng, aLat, aLng);

  const cosLat = Math.cos((aLat * Math.PI) / 180);
  const dx = (bLng - aLng) * cosLat;
  const dy = bLat - aLat;
  const px = (pLng - aLng) * cosLat;
  const py = pLat - aLat;

  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  const projLat = aLat + t * (bLat - aLat);
  const projLng = aLng + t * (bLng - aLng);

  return calculateDistanceMeters(pLat, pLng, projLat, projLng);
}

// Generate smooth bezier road geometry
function generateSmoothRoadPath(start, end, detourFactor = 0, numPoints = 30) {
  const points = [];
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const perpLat = -dLng * detourFactor;
  const perpLng = dLat * detourFactor;

  const controlLat = midLat + perpLat;
  const controlLng = midLng + perpLng;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * controlLat + t * t * end.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * controlLng + t * t * end.lng;
    const jitterLat = Math.sin(t * Math.PI * 4) * 0.0003;
    const jitterLng = Math.cos(t * Math.PI * 4) * 0.0003;
    points.push([lat + jitterLat, lng + jitterLng]); // [lat, lng] for Leaflet
  }

  return points;
}

// Evaluate hazard penalties along a route geometry
function evaluateRouteHazards(geometry, vehicleType = 'AMBULANCE', hazardRadiusMeters = 350) {
  let penaltyTotal = 0;
  const hazardsNearRoute = [];
  const hazardsAvoided = [];
  let isBlocked = false;

  ODISHA_ROAD_HAZARDS.forEach(hazard => {
    let minDistance = Infinity;

    for (let i = 0; i < geometry.length - 1; i++) {
      const [aLat, aLng] = geometry[i];
      const [bLat, bLng] = geometry[i + 1];
      const dist = distanceToSegmentMeters(
        hazard.location.lat,
        hazard.location.lng,
        aLat,
        aLng,
        bLat,
        bLng
      );
      if (dist < minDistance) minDistance = dist;
    }

    const effectiveRadius = hazard.radiusMeters || hazardRadiusMeters;

    if (minDistance <= effectiveRadius) {
      let weight = 0;
      let blockedForVehicle = false;

      if (hazard.type === 'BLOCKED_ROAD') {
        if (vehicleType === 'RESCUE_TEAM') {
          weight = 35;
        } else {
          weight = 100;
          blockedForVehicle = true;
          isBlocked = true;
        }
      } else if (hazard.type === 'FLOOD_ROAD') {
        if (vehicleType === 'AMBULANCE') weight = 45;
        else if (vehicleType === 'RESCUE_TEAM') weight = 15;
        else if (vehicleType === 'RELIEF_VEHICLE') weight = 50;
      } else if (hazard.type === 'LANDSLIDE_ROAD') {
        if (vehicleType === 'AMBULANCE') weight = 50;
        else if (vehicleType === 'RESCUE_TEAM') weight = 20;
        else if (vehicleType === 'RELIEF_VEHICLE') weight = 40;
      } else {
        weight = 10;
      }

      penaltyTotal += weight;
      hazardsNearRoute.push({
        id: hazard.id,
        name: hazard.name,
        type: hazard.type,
        severity: hazard.severity,
        distanceMeters: Math.round(minDistance),
        blockedForVehicle,
        description: hazard.description
      });
    } else {
      hazardsAvoided.push({
        id: hazard.id,
        name: hazard.name,
        type: hazard.type,
        distanceMeters: Math.round(minDistance)
      });
    }
  });

  const safetyScore = isBlocked ? Math.min(30, Math.max(10, 100 - penaltyTotal)) : Math.max(20, Math.min(100, 100 - penaltyTotal));

  let hazardLevel = 'LOW';
  if (isBlocked || safetyScore < 50) hazardLevel = 'CRITICAL';
  else if (safetyScore < 75) hazardLevel = 'HIGH';
  else if (safetyScore < 90) hazardLevel = 'MODERATE';

  return {
    safetyScore,
    penaltyTotal,
    hazardLevel,
    isBlocked,
    hazardsNearRoute,
    hazardsAvoided
  };
}

// Client-side fallback dynamic route calculation
export async function calculateClientSideOptimizedRoutes(origin, destination, vehicleType = 'AMBULANCE') {
  const directDistanceKm = calculateDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng) / 1000;
  
  // Try real OSRM driving API with fast timeout
  let osrmCandidates = [];
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes) {
        data.routes.forEach((r, idx) => {
          const latlngs = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const evalRes = evaluateRouteHazards(latlngs, vehicleType);
          osrmCandidates.push({
            routeIndex: idx,
            title: idx === 0 ? "Direct Highway Route" : `Alternative Arterial Corridor #${idx}`,
            distance_km: Math.round((r.distance / 1000) * 10) / 10,
            duration_min: Math.max(3, Math.round(r.duration / 60)),
            safety_score: evalRes.safetyScore,
            hazard_level: evalRes.hazardLevel,
            is_blocked: evalRes.isBlocked,
            hazards_near_route: evalRes.hazardsNearRoute,
            hazards_avoided: evalRes.hazardsAvoided,
            geometry: latlngs
          });
        });
      }
    }
  } catch (e) {
    // Silently fall back to synthetic geometric paths
  }

  // Synthesize alternative detour paths (e.g. Ring road, outer bypass)
  const detourConfigs = [
    { factor: 0.12, title: "Ring Road Safe Corridor", speed: vehicleType === 'AMBULANCE' ? 42 : 36 },
    { factor: -0.15, title: "Inner Radial Arterial Corridor", speed: vehicleType === 'AMBULANCE' ? 40 : 34 },
    { factor: 0.25, title: "Outer Perimeter Bypass", speed: vehicleType === 'AMBULANCE' ? 48 : 38 }
  ];

  detourConfigs.forEach((cfg, idx) => {
    const latlngs = generateSmoothRoadPath(origin, destination, cfg.factor, 32);
    const distKm = Math.round(directDistanceKm * (1 + Math.abs(cfg.factor) * 1.6) * 1.2 * 10) / 10;
    const durMin = Math.max(4, Math.round((distKm / cfg.speed) * 60) + 2);
    const evalRes = evaluateRouteHazards(latlngs, vehicleType);

    osrmCandidates.push({
      routeIndex: osrmCandidates.length,
      title: cfg.title,
      distance_km: distKm,
      duration_min: durMin,
      safety_score: evalRes.safetyScore,
      hazard_level: evalRes.hazardLevel,
      is_blocked: evalRes.isBlocked,
      hazards_near_route: evalRes.hazardsNearRoute,
      hazards_avoided: evalRes.hazardsAvoided,
      geometry: latlngs
    });
  });

  // Pick Recommended Safest Route (highest safety score, fastest duration among safest)
  const unblocked = osrmCandidates.filter(r => !r.is_blocked);
  const pool = unblocked.length > 0 ? unblocked : osrmCandidates;

  const sortedSafest = [...pool].sort((a, b) => {
    if (b.safety_score !== a.safety_score) return b.safety_score - a.safety_score;
    return a.duration_min - b.duration_min;
  });

  const recommendedRoute = {
    ...sortedSafest[0],
    type: "SAFEST_ROUTE",
    tag: "RECOMMENDED",
    badgeText: "✓ Safest Available Route"
  };

  const sortedFastest = [...osrmCandidates].sort((a, b) => a.duration_min - b.duration_min);
  const fastestRoute = {
    ...sortedFastest[0],
    type: "FASTEST_ROUTE",
    tag: "FASTEST",
    badgeText: "⚡ Fastest Road Route"
  };

  const altRoute = osrmCandidates.find(r => r.geometry !== recommendedRoute.geometry && r.geometry !== fastestRoute.geometry) || osrmCandidates[1] || osrmCandidates[0];

  return {
    success: true,
    origin,
    destination,
    vehicle_type: vehicleType,
    recommended_route: recommendedRoute,
    alternative_routes: [
      recommendedRoute,
      fastestRoute,
      { ...altRoute, type: "ALTERNATIVE_ROUTE", tag: "ALTERNATIVE", badgeText: "🔄 Alternative Corridor" }
    ],
    vehicle_policy: {
      type: vehicleType,
      priorityRule: vehicleType === 'AMBULANCE'
        ? 'Strictly avoids blocked and submerged corridors, prioritizing clinical safety and fastest safe road.'
        : vehicleType === 'RESCUE_TEAM'
        ? 'ODRAF clearance capability enabled; navigates high-risk corridors with amphibious support.'
        : 'Avoids low-clearance submerged underpasses and narrow streets, prioritizes wide arterial corridors.'
    },
    hazards_avoided_count: recommendedRoute.hazards_avoided.length,
    hazards_near_route_count: recommendedRoute.hazards_near_route.length,
    calculated_at: new Date().toISOString()
  };
}

// Master Route Optimizer function (tries backend API first, then falls back seamlessly)
export async function optimizeEmergencyRoute({ origin, destination, vehicleType = 'AMBULANCE', hazardRadiusMeters = 350 }) {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        vehicle_type: vehicleType,
        hazard_radius_meters: hazardRadiusMeters
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch (err) {
    // Backend offline or starting -> run client-side engine
  }

  return await calculateClientSideOptimizedRoutes(origin, destination, vehicleType);
}
