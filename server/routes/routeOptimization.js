import express from 'express';
import { ODISHA_ROAD_HAZARDS, ODISHA_HAZARD_ZONE_POLYGON } from '../data/odishaData.js';
import { getDbStatus } from '../config/db.js';
import { InfrastructureAsset } from '../models/InfrastructureAsset.js';

const router = express.Router();

// Helper: Haversine distance in meters between two lat/lng points
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371000; // Earth radius in meters
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

// Helper: Point to line segment minimum distance in meters
function distanceToSegmentMeters(pLat, pLng, aLat, aLng, bLat, bLng) {
  const dAB = calculateDistanceMeters(aLat, aLng, bLat, bLng);
  if (dAB < 1) return calculateDistanceMeters(pLat, pLng, aLat, aLng);

  // Approximate projection in Cartesian space for small distances
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

// Generate realistic road waypoint geometry between start and end with offset detour
function generateSyntheticRoadPath(start, end, detourFactor = 0, numPoints = 25) {
  const points = [];
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  // Perpendicular offset vector
  const dLat = end.lat - start.lat;
  const dLng = end.lng - start.lng;
  const perpLat = -dLng * detourFactor;
  const perpLng = dLat * detourFactor;

  const controlLat = midLat + perpLat;
  const controlLng = midLng + perpLng;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic bezier curve
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * controlLat + t * t * end.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * controlLng + t * t * end.lng;
    // Add micro jitter to simulate realistic road geometry
    const jitterLat = Math.sin(t * Math.PI * 4) * 0.0004;
    const jitterLng = Math.cos(t * Math.PI * 4) * 0.0004;
    points.push([lng + jitterLng, lat + jitterLat]); // GeoJSON [lng, lat]
  }

  return points;
}

// Fetch dynamic route from public OSRM service with safety timeout
async function fetchOsrmRoute(origin, destination) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      return data.routes;
    }
    return null;
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
}

// Evaluate hazard proximity and score a given route geometry
export function evaluateRouteHazards(
  geometryCoordinates,
  vehicleType = 'AMBULANCE',
  hazardRadiusMeters = 350,
  roadHazards = ODISHA_ROAD_HAZARDS
) {
  let penaltyTotal = 0;
  const hazardsNearRoute = [];
  const hazardsAvoided = [];
  let isBlocked = false;

  roadHazards.forEach(hazard => {
    let minDistance = Infinity;

    // Check distance between hazard point and each segment of the route
    for (let i = 0; i < geometryCoordinates.length - 1; i++) {
      const [aLng, aLat] = geometryCoordinates[i];
      const [bLng, bLat] = geometryCoordinates[i + 1];
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
      // Route is exposed to this hazard
      let weight = 0;
      let blockedForVehicle = false;

      if (hazard.blocksRoute && !hazard.passableForVehicles?.includes(vehicleType)) {
        weight = 100;
        blockedForVehicle = true;
        isBlocked = true;
      } else if (hazard.type === 'BLOCKED_ROAD') {
        if (vehicleType === 'RESCUE_TEAM') {
          weight = 35; // Rescue teams have hydraulic extrication/chainsaws
        } else {
          weight = 100;
          blockedForVehicle = true;
          isBlocked = true;
        }
      } else if (hazard.type === 'FLOOD_ROAD') {
        if (vehicleType === 'AMBULANCE') weight = 45; // Ambulance strongly avoids flood
        else if (vehicleType === 'RESCUE_TEAM') weight = 15; // Boat/ODRAF team can traverse
        else if (['RELIEF_TRUCK', 'RELIEF_VEHICLE'].includes(vehicleType)) weight = 50; // Heavy truck risks stall
      } else if (hazard.type === 'LANDSLIDE_ROAD') {
        if (vehicleType === 'AMBULANCE') weight = 50;
        else if (vehicleType === 'RESCUE_TEAM') weight = 20;
        else if (['RELIEF_TRUCK', 'RELIEF_VEHICLE'].includes(vehicleType)) weight = 40;
      } else {
        weight = 10; // High risk zone
      }

      penaltyTotal += weight;
      hazardsNearRoute.push({
        id: hazard.id,
        name: hazard.name,
        type: hazard.type,
        severity: hazard.severity,
        distanceMeters: Math.round(minDistance),
        blockedForVehicle,
        dynamicInfrastructure: Boolean(hazard.dynamicInfrastructure),
        infrastructureStatus: hazard.infrastructureStatus || null,
        description: hazard.description
      });
    } else {
      hazardsAvoided.push({
        id: hazard.id,
        name: hazard.name,
        type: hazard.type,
        dynamicInfrastructure: Boolean(hazard.dynamicInfrastructure),
        infrastructureStatus: hazard.infrastructureStatus || null,
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

export const infrastructureAssetToHazard = asset => {
  if (!asset || asset.status === 'OPERATIONAL') return null;
  const coordinates = asset.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

  const fullyClosed = ['WASHED_OUT', 'CLOSED'].includes(asset.status);
  const flooded = asset.status === 'FLOODED';
  return {
    id: asset.assetId,
    name: asset.name,
    type: fullyClosed ? 'BLOCKED_ROAD' : flooded ? 'FLOOD_ROAD' : 'HIGH_RISK_ZONE',
    severity: fullyClosed || flooded ? 'CRITICAL' : 'HIGH',
    radiusMeters: asset.routeRadiusMeters || 450,
    location: {
      lat: coordinates[1],
      lng: coordinates[0],
      name: asset.name
    },
    description: `${asset.description || 'Infrastructure disruption'} Current status: ${asset.status}.`,
    blocksRoute: fullyClosed || flooded,
    passableForVehicles: flooded ? ['RESCUE_TEAM'] : [],
    dynamicInfrastructure: true,
    infrastructureStatus: asset.status
  };
};

const loadRoadHazards = async () => {
  if (!getDbStatus()) return ODISHA_ROAD_HAZARDS;
  try {
    const assets = await InfrastructureAsset.find({ status: { $ne: 'OPERATIONAL' } });
    const infrastructureHazards = assets.map(infrastructureAssetToHazard).filter(Boolean);
    const dynamicIds = new Set(infrastructureHazards.map(hazard => hazard.id));
    return [
      ...ODISHA_ROAD_HAZARDS.filter(hazard => !dynamicIds.has(hazard.id)),
      ...infrastructureHazards
    ];
  } catch (error) {
    console.error('Load dynamic infrastructure hazards error:', error);
    return ODISHA_ROAD_HAZARDS;
  }
};

// POST /api/routes/optimize
router.post('/optimize', async (req, res) => {
  try {
    const {
      origin,
      destination,
      vehicle_type = 'AMBULANCE',
      avoid_hazards = true,
      hazard_radius_meters = 350
    } = req.body;

    if (!origin || !destination || origin.lat == null || origin.lng == null || destination.lat == null || destination.lng == null) {
      return res.status(400).json({
        success: false,
        error: "Invalid coordinates provided. Origin and destination { lat, lng } are required."
      });
    }

    // Straight-line distance in km
    const directDistanceKm = calculateDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng) / 1000;
    const activeRoadHazards = avoid_hazards ? await loadRoadHazards() : [];

    // Try fetching from real OSRM driving engine
    let osrmRoutes = await fetchOsrmRoute(origin, destination);
    let candidateRoutes = [];

    if (osrmRoutes && osrmRoutes.length > 0) {
      // We got real routes from OSRM
      osrmRoutes.forEach((osrmRoute, index) => {
        const coords = osrmRoute.geometry.coordinates; // [[lng, lat], ...]
        const distanceKm = Math.round((osrmRoute.distance / 1000) * 10) / 10;
        const durationMin = Math.max(3, Math.round(osrmRoute.duration / 60));
        
        const evaluation = evaluateRouteHazards(coords, vehicle_type, hazard_radius_meters, activeRoadHazards);

        candidateRoutes.push({
          routeIndex: index,
          title: index === 0 ? "Direct Highway Route" : `Alternative Arterial Corridor #${index}`,
          distance_km: distanceKm,
          duration_min: durationMin,
          safety_score: evaluation.safetyScore,
          hazard_level: evaluation.hazardLevel,
          is_blocked: evaluation.isBlocked,
          hazards_near_route: evaluation.hazardsNearRoute,
          hazards_avoided: evaluation.hazardsAvoided,
          geometry: coords.map(([lng, lat]) => [lat, lng]) // Convert to [lat, lng] for Leaflet
        });
      });
    }

    // Ensure we always have 3 distinct alternative routes for the user to compare
    if (candidateRoutes.length < 3) {
      // Synthesize safe bypass and alternate detours around hazard hotspots
      const detourFactors = [0.08, -0.12, 0.22];
      const titles = ["Ring Road Highway Corridor", "Inner City Radial Corridor", "Outer Perimeter Safe Bypass"];

      detourFactors.forEach((factor, idx) => {
        const synthGeo = generateSyntheticRoadPath(origin, destination, factor, 30);
        const distanceMultiplier = 1 + Math.abs(factor) * 1.5;
        const distanceKm = Math.round(directDistanceKm * distanceMultiplier * 1.25 * 10) / 10;
        // Speeds: Ambulance ~ 40 km/h in city, Rescue ~ 35 km/h, Relief ~ 30 km/h
        const speedKmh = vehicle_type === 'AMBULANCE' ? 42 : vehicle_type === 'RESCUE_TEAM' ? 36 : 30;
        const durationMin = Math.max(4, Math.round((distanceKm / speedKmh) * 60) + 3);

        const evaluation = evaluateRouteHazards(synthGeo, vehicle_type, hazard_radius_meters, activeRoadHazards);

        candidateRoutes.push({
          routeIndex: candidateRoutes.length,
          title: titles[idx] || `Corridor #${candidateRoutes.length + 1}`,
          distance_km: distanceKm,
          duration_min: durationMin,
          safety_score: evaluation.safetyScore,
          hazard_level: evaluation.hazardLevel,
          is_blocked: evaluation.isBlocked,
          hazards_near_route: evaluation.hazardsNearRoute,
          hazards_avoided: evaluation.hazardsAvoided,
          geometry: synthGeo.map(([lng, lat]) => [lat, lng])
        });
      });
    }

    // Rank routes to find Recommended (Safest Safe Route), Fastest, and Alternative
    // Cost formula: travel_time + hazard_penalty
    candidateRoutes.forEach(r => {
      const hazardPenaltyCost = (100 - r.safety_score) * 0.8;
      const timeCost = r.duration_min * 1.0;
      r.total_cost = timeCost + hazardPenaltyCost + (r.is_blocked ? 999 : 0);
    });

    // 1. Recommended Route = Unblocked route with best balance of highest safety score & low cost
    const unblockedRoutes = candidateRoutes.filter(r => !r.is_blocked);
    const validRoutes = unblockedRoutes.length > 0 ? unblockedRoutes : candidateRoutes;

    // Sort by safety score descending, then by duration ascending
    const sortedBySafety = [...validRoutes].sort((a, b) => {
      if (b.safety_score !== a.safety_score) return b.safety_score - a.safety_score;
      return a.duration_min - b.duration_min;
    });

    const recommendedRoute = {
      ...sortedBySafety[0],
      type: "SAFEST_ROUTE",
      tag: "RECOMMENDED",
      badgeText: "✓ Safest Available Route"
    };

    // Sort by duration ascending for fastest route
    const sortedByTime = [...candidateRoutes].sort((a, b) => a.duration_min - b.duration_min);
    const fastestRoute = {
      ...sortedByTime[0],
      type: "FASTEST_ROUTE",
      tag: "FASTEST",
      badgeText: "⚡ Fastest Road Route"
    };

    // Alternative route (distinct from recommended)
    const alternativeRoute = candidateRoutes.find(r => r.geometry !== recommendedRoute.geometry && r.geometry !== fastestRoute.geometry) || candidateRoutes[1] || candidateRoutes[0];
    alternativeRoute.type = "ALTERNATIVE_ROUTE";
    alternativeRoute.tag = "ALTERNATIVE";
    alternativeRoute.badgeText = "🔄 Alternative Corridor";

    return res.json({
      success: true,
      origin,
      destination,
      vehicle_type,
      recommended_route: recommendedRoute,
      alternative_routes: [
        recommendedRoute,
        fastestRoute,
        { ...alternativeRoute, type: "ALTERNATIVE_ROUTE", tag: "ALTERNATIVE", badgeText: "🔄 Alternative Corridor" }
      ],
      vehicle_policy: {
        type: vehicle_type,
        priorityRule: vehicle_type === 'AMBULANCE'
          ? 'Strictly avoids blocked and submerged road corridors, prioritizing speed and clinical safety.'
          : vehicle_type === 'RESCUE_TEAM'
          ? 'Equipped for waterlogging traversal with boat/heavy cutters, bypasses roadblocks with clearance units.'
          : 'Strictly avoids flooded underpasses and narrow streets, prioritizes wide arterial corridors for supply trucks.'
      },
      hazards_avoided_count: recommendedRoute.hazards_avoided.length,
      hazards_near_route_count: recommendedRoute.hazards_near_route.length,
      infrastructure_closures_avoided: recommendedRoute.hazards_avoided.filter(hazard => hazard.dynamicInfrastructure),
      infrastructure_closures_near_route: recommendedRoute.hazards_near_route.filter(hazard => hazard.dynamicInfrastructure),
      calculated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error optimizing emergency route:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to calculate safe route. Please select an alternative origin or destination."
    });
  }
});

// GET /api/routes/hazards - Return all active road hazards
router.get('/hazards', async (req, res) => {
  const hazards = await loadRoadHazards();
  return res.json({
    success: true,
    count: hazards.length,
    hazards,
    hazard_zone_polygon: ODISHA_HAZARD_ZONE_POLYGON
  });
});

export default router;
