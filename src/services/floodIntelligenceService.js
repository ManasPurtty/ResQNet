import { API_BASE_URL } from '../config/api';
import { authService } from './authService';

const FLOOD_API_URL = `${API_BASE_URL}/flood-intelligence`;

const authenticatedRequest = async (path = '', options = {}) => {
  const token = authService.getToken();
  if (!token) {
    const error = new Error('Please log in to access flood intelligence.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${FLOOD_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Flood intelligence request failed');
    error.status = response.status;
    throw error;
  }
  return data;
};

const demoNow = new Date();
const demoArrival = minutes => new Date(demoNow.getTime() + minutes * 60 * 1000).toISOString();

export const DEMO_FLOOD_DASHBOARD = {
  storageMode: 'DEMO_PREVIEW',
  stations: [{
    id: 'RIV-NARAJ-001',
    name: 'Naraj River Gauge & Upstream Blockage Watch',
    riverName: 'Mahanadi–Daya System',
    basinName: 'Mahanadi Delta Basin',
    district: 'Cuttack',
    location: { lat: 20.4619, lng: 85.7626 },
    currentLevelM: 26.58,
    warningLevelM: 26.41,
    dangerLevelM: 26.92,
    riseRateMetersPerHour: 0.52,
    rainfall24hMm: 176,
    trend: 'RISING_RAPIDLY',
    source: 'DEMO_SENSOR',
    isSimulation: true,
    lastObservedAt: demoNow.toISOString()
  }],
  forecasts: [{
    id: 'FCAST-DEMO-NARAJ',
    stationId: 'RIV-NARAJ-001',
    stationName: 'Naraj River Gauge & Upstream Blockage Watch',
    riverName: 'Mahanadi–Daya System',
    location: { lat: 20.4619, lng: 85.7626 },
    currentLevelM: 26.58,
    warningLevelM: 26.41,
    dangerLevelM: 26.92,
    riseRateMetersPerHour: 0.52,
    risk: 'CRITICAL',
    stage: 'WARNING',
    confidenceScore: 94,
    dangerLeadMinutes: 40,
    predictedDangerAt: demoArrival(40),
    atRiskPopulation: 78200,
    atRiskHouseholds: 17200,
    source: 'DEMO_SENSOR',
    isSimulation: true,
    issuedAt: demoNow.toISOString(),
    arrivalZones: [
      { zoneId: 'ZONE-BALIANTA', name: 'Balianta Low-Lying Settlements', district: 'Khordha', location: { lat: 20.3302, lng: 85.8937 }, distanceKm: 15, radiusKm: 7, arrivalMinutes: 78, predictedArrivalAt: demoArrival(78), population: 18400, households: 4100, priorityShelter: 'Balianta Government High School Relief Centre' },
      { zoneId: 'ZONE-PIPILI', name: 'Pipili–Daya Floodplain', district: 'Puri', location: { lat: 20.1134, lng: 85.8315 }, distanceKm: 32, radiusKm: 9, arrivalMinutes: 120, predictedArrivalAt: demoArrival(120), population: 26700, households: 5900, priorityShelter: 'Pipili Multipurpose Cyclone Shelter' },
      { zoneId: 'ZONE-NIMAPADA', name: 'Nimapada Rural Cluster', district: 'Puri', location: { lat: 19.9848, lng: 86.0045 }, distanceKm: 51, radiusKm: 11, arrivalMinutes: 168, predictedArrivalAt: demoArrival(168), population: 33100, households: 7200, priorityShelter: 'Nimapada Autonomous College Relief Camp' }
    ]
  }],
  infrastructure: [
    { id: 'INFRA-BRIDGE-DAYA-01', name: 'Daya Canal Emergency Bridge', type: 'BRIDGE', district: 'Khordha', location: { lat: 20.282, lng: 85.861 }, status: 'FLOODED', verified: true, description: 'Deck-level inundation. Automatically excluded from ambulance and relief routes.' },
    { id: 'INFRA-ROAD-NH16-01', name: 'NH-16 Khandagiri Underpass', type: 'ROAD', district: 'Khordha', location: { lat: 20.257, lng: 85.786 }, status: 'CLOSED', verified: true, description: 'Water and stranded vehicles block both carriageways.' },
    { id: 'INFRA-BRIDGE-PIPILI-01', name: 'Pipili Rural Access Bridge', type: 'BRIDGE', district: 'Puri', location: { lat: 20.1058, lng: 85.8462 }, status: 'AT_RISK', verified: false, description: 'Scour risk under rapid river rise.' },
    { id: 'INFRA-SHELTER-BALIANTA-01', name: 'Balianta Government High School Relief Centre', type: 'SHELTER', district: 'Khordha', location: { lat: 20.3375, lng: 85.8871 }, status: 'OPERATIONAL', verified: true, description: 'Priority downstream shelter with elevated access.' }
  ],
  checkIns: [],
  checkInSummary: {
    safe: { households: 0, people: 0, vulnerablePeople: 0 },
    needRescue: { households: 0, people: 0, vulnerablePeople: 0 }
  },
  generatedAt: demoNow.toISOString()
};

export const floodIntelligenceService = {
  getDashboard() {
    return authenticatedRequest('/dashboard');
  },
  getActiveForecasts() {
    return authenticatedRequest('/active');
  },
  simulate(stationId = 'RIV-NARAJ-001') {
    return authenticatedRequest('/simulate', {
      method: 'POST',
      body: JSON.stringify({ stationId })
    });
  },
  updateInfrastructure(assetId, status, verified = true) {
    return authenticatedRequest(`/infrastructure/${encodeURIComponent(assetId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, verified })
    });
  },
  checkIn(payload) {
    return authenticatedRequest('/check-ins', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getMyCheckIns() {
    return authenticatedRequest('/check-ins/mine');
  }
};
