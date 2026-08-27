/**
 * Resource Recommendation Matching Engine
 * Evaluates all available rescue teams against a target incident using 4-factor scoring formula:
 * 45% Incident Priority + 25% Capability Match + 20% Distance + 10% Availability
 */

// Haversine formula to compute distance in km between two lat/lng points
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 3.0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

// Required capability lookup based on incident type
const REQUIRED_CAPABILITIES = {
  FLOOD: ["Flood Rescue", "Boat", "First Aid"],
  BUILDING_DAMAGE: ["Building Collapse", "Heavy Equipment", "Structural Search"],
  MEDICAL: ["Medical ICU", "Paramedic", "First Aid", "Triage Unit"],
  ROAD_BLOCKAGE: ["Chainsaw Clearance", "Heavy Equipment"],
  LANDSLIDE: ["Building Collapse", "Heavy Equipment", "First Aid"],
  FIRE: ["First Aid", "Search & Rescue"],
  CYCLONE: ["Evacuation Assistance", "First Aid"],
  OTHER: ["First Aid"]
};

export function scoreResourceForIncident(resource, incident) {
  const incidentPriority = incident.priorityScore || 80;
  const reqCapabilities = REQUIRED_CAPABILITIES[incident.type] || ["First Aid"];

  // 1. Priority Contribution (45% max -> 45 points max)
  const priorityContrib = Math.round((incidentPriority / 100) * 45);

  // 2. Capability Contribution (25% max -> 25 points max)
  const matchingCapabilities = reqCapabilities.filter(reqCap =>
    resource.capabilities.some(resCap =>
      resCap.toLowerCase().includes(reqCap.toLowerCase()) || reqCap.toLowerCase().includes(resCap.toLowerCase())
    )
  );

  let capabilityScoreRatio = 0.5; // base score if partial
  if (reqCapabilities.length > 0) {
    capabilityScoreRatio = matchingCapabilities.length / reqCapabilities.length;
    if (capabilityScoreRatio > 1) capabilityScoreRatio = 1;
  }
  // If team has explicitly matching high capability
  if (incident.type === 'FLOOD' && resource.capabilities.includes('Boat')) {
    capabilityScoreRatio = 1.0;
  }
  const capabilityContrib = Math.round(capabilityScoreRatio * 25);

  // 3. Distance & ETA (20% max -> 20 points max)
  const distanceKm = calculateDistanceKm(
    resource.location.lat,
    resource.location.lng,
    incident.location.lat,
    incident.location.lng
  );
  // Max distance considered 15km
  const distanceScoreRatio = Math.max(0, 1 - distanceKm / 12);
  const distanceContrib = Math.round(distanceScoreRatio * 20);

  // 4. Availability & Capacity Contribution (10% max -> 10 points max)
  let availContrib = 0;
  if (resource.status === 'AVAILABLE') {
    availContrib = 10;
    // Penalty if capacity is way smaller than trapped people
    if (incident.peopleTrapped > resource.capacity) {
      availContrib = 6;
    }
  } else if (resource.status === 'ASSIGNED') {
    availContrib = 3;
  } else {
    availContrib = 0;
  }

  const totalScore = Math.min(99, Math.max(20, priorityContrib + capabilityContrib + distanceContrib + availContrib));
  const etaMinutes = Math.max(3, Math.round(distanceKm * 3.2 + 2)); // approx 20km/h speed in flood conditions

  return {
    resource,
    totalScore,
    distanceKm,
    etaMinutes,
    matchingCapabilities,
    breakdown: {
      priorityContrib,
      capabilityContrib,
      distanceContrib,
      availContrib
    }
  };
}

export function getRankedRecommendations(incident, allResources) {
  if (!incident || !allResources) return [];

  const scored = allResources.map(res => scoreResourceForIncident(res, incident));

  // Sort descending by total score
  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored;
}
