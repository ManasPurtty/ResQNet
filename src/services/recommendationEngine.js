/**
 * Resource & Shelter Recommendation Matching Engine for Odisha Platform
 * Evaluates available Fire Stations, ODRAF units, Hospital Ambulances, and Government Schools.
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
  FLOOD: ["Flood Rescue", "Boat", "First Aid", "Diving Equipment"],
  BUILDING_DAMAGE: ["Building Collapse", "Heavy Equipment", "Structural Search"],
  MEDICAL: ["Medical ICU", "Paramedic", "First Aid", "Triage Unit"],
  ROAD_BLOCKAGE: ["Chainsaw Clearance", "Heavy Equipment"],
  LANDSLIDE: ["Building Collapse", "Heavy Equipment", "First Aid"],
  FIRE: ["First Aid", "Search & Rescue"],
  CYCLONE: ["Evacuation Assistance", "First Aid", "Chainsaw Clearance"],
  OTHER: ["First Aid"]
};

// Automatic Allotment: Find Nearest Fire Station / Rescue Team
export function findNearestFireStationRescueTeam(incidentLocation, allResources) {
  if (!incidentLocation || !allResources || allResources.length === 0) return null;

  const rescueTeams = allResources.filter(r => 
    r.type === 'FIRE_STATION' || r.type === 'ODRAF' || r.type === 'RESCUE_TEAM' || r.category === 'RESCUE_TEAM' || r.vehicleType === 'RESCUE_TEAM'
  );

  const pool = rescueTeams.length > 0 ? rescueTeams : allResources;

  const scored = pool.map(team => {
    const distKm = calculateDistanceKm(
      team.location.lat,
      team.location.lng,
      incidentLocation.lat,
      incidentLocation.lng
    );
    const etaMinutes = Math.max(3, Math.round(distKm * 2.5 + 2));
    return {
      resource: team,
      distanceKm: distKm,
      etaMinutes
    };
  });

  scored.sort((a, b) => a.distanceKm - b.distanceKm);
  return scored[0] || null;
}

// Automatic Allotment: Find Nearest Hospital Ambulance
export function findNearestHospitalAmbulance(incidentLocation, allResources) {
  if (!incidentLocation || !allResources || allResources.length === 0) return null;

  const ambulances = allResources.filter(r => 
    r.type === 'AMBULANCE' || r.category === 'AMBULANCE' || r.vehicleType === 'AMBULANCE'
  );

  const pool = ambulances.length > 0 ? ambulances : allResources;

  const scored = pool.map(amb => {
    const distKm = calculateDistanceKm(
      amb.location.lat,
      amb.location.lng,
      incidentLocation.lat,
      incidentLocation.lng
    );
    const etaMinutes = Math.max(2, Math.round(distKm * 2.2 + 2));
    return {
      resource: amb,
      distanceKm: distKm,
      etaMinutes
    };
  });

  scored.sort((a, b) => a.distanceKm - b.distanceKm);
  return scored[0] || null;
}

// Automatic Allotment: Find Nearest Government School Shelter
export function findNearestGovernmentSchoolShelter(incidentLocation, allShelters) {
  if (!incidentLocation || !allShelters || allShelters.length === 0) return null;

  const validSchools = allShelters.filter(s => s.status !== 'FULL' && s.status !== 'CLOSED');
  const pool = validSchools.length > 0 ? validSchools : allShelters;

  const scored = pool.map(school => {
    const distKm = calculateDistanceKm(
      school.location.lat,
      school.location.lng,
      incidentLocation.lat,
      incidentLocation.lng
    );
    return {
      shelter: school,
      distanceKm: distKm,
      hasSufficientCapacity: school.available > 0
    };
  });

  scored.sort((a, b) => a.distanceKm - b.distanceKm);
  return scored[0] || null;
}

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

  let capabilityScoreRatio = 0.5;
  if (reqCapabilities.length > 0) {
    capabilityScoreRatio = matchingCapabilities.length / reqCapabilities.length;
    if (capabilityScoreRatio > 1) capabilityScoreRatio = 1;
  }
  if (incident.type === 'FLOOD' && resource.capabilities.includes('Boat')) {
    capabilityScoreRatio = 1.0;
  }
  const capabilityContrib = Math.round(capabilityScoreRatio * 25);

  // 3. Distance & Travel-Time ETA (20% max -> 20 points max)
  const distanceKm = calculateDistanceKm(
    resource.location.lat,
    resource.location.lng,
    incident.location.lat,
    incident.location.lng
  );
  const distanceScoreRatio = Math.max(0, 1 - distanceKm / 18);
  const distanceContrib = Math.round(distanceScoreRatio * 20);

  // 4. Availability & Capacity Contribution (10% max -> 10 points max)
  let availContrib = 0;
  if (resource.status === 'AVAILABLE') {
    availContrib = 10;
    if (incident.peopleTrapped > resource.capacity) {
      availContrib = 7;
    }
  } else if (resource.status === 'ASSIGNED') {
    availContrib = 4;
  } else {
    availContrib = 0;
  }

  const totalScore = Math.min(99, Math.max(25, priorityContrib + capabilityContrib + distanceContrib + availContrib));
  const etaMinutes = Math.max(3, Math.round(distanceKm * 2.8 + 2));

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
  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}

export function rankSheltersForIncident(incident, allShelters) {
  if (!incident || !allShelters) return [];

  const evacueesNeeded = incident.peopleAffected || 20;

  return allShelters
    .filter(s => s.status !== 'FULL' && s.status !== 'CLOSED')
    .map(shelter => {
      const distanceKm = calculateDistanceKm(
        shelter.location.lat,
        shelter.location.lng,
        incident.location.lat,
        incident.location.lng
      );

      const distanceScore = Math.max(0, 40 * (1 - distanceKm / 15));
      const capRatio = Math.min(1, shelter.available / (evacueesNeeded * 2));
      const capacityScore = 30 * capRatio;
      const facScore = Math.min(20, (shelter.facilities.length / 5) * 20);
      const statusScore = shelter.status === 'OPEN' ? 10 : 5;

      const totalScore = Math.round(distanceScore + capacityScore + facScore + statusScore);

      return {
        shelter,
        totalScore,
        distanceKm,
        hasSufficientCapacity: shelter.available >= evacueesNeeded
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}
