import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommunityWarning, getAlertRadiusKm, getSafetyInstructions } from '../services/communityAlertService.js';
import { geoPoint, haversineDistanceKm, isValidCoordinate } from '../utils/geo.js';
import { IncidentCluster } from '../models/IncidentCluster.js';
import {
  buildDownstreamArrivalZones,
  calculateFloodRisk,
  estimateDangerLeadMinutes
} from '../services/floodPredictionService.js';
import { evaluateRouteHazards, infrastructureAssetToHazard } from '../routes/routeOptimization.js';

test('calculates nearby distance accurately enough for alert matching', () => {
  const distance = haversineDistanceKm(
    { lat: 20.2961, lng: 85.8245 },
    { lat: 20.3549, lng: 85.8172 }
  );

  assert.ok(distance > 6 && distance < 7);
});

test('validates geographic coordinates and creates longitude-first GeoJSON', () => {
  assert.equal(isValidCoordinate(20.2961, 85.8245), true);
  assert.equal(isValidCoordinate(120, 85.8245), false);
  assert.deepEqual(geoPoint(20.2961, 85.8245), {
    type: 'Point',
    coordinates: [85.8245, 20.2961]
  });
});

test('expands critical flood alerts and includes actionable safety guidance', () => {
  assert.equal(getAlertRadiusKm('FLOOD', 'CRITICAL'), 12);
  assert.match(
    buildCommunityWarning({ type: 'FLOOD', locationName: 'Rasulgarh', reportCount: 3 }),
    /Verified by 3 nearby reports/
  );
  assert.match(getSafetyInstructions('FLOOD')[0], /higher ground/i);
});

test('serializes MongoDB incident clusters for the existing frontend map', () => {
  const cluster = new IncidentCluster({
    clusterId: 'INC-TEST-001',
    type: 'FLOOD',
    severity: 'HIGH',
    priorityScore: 80,
    confidenceScore: 86,
    location: geoPoint(20.2961, 85.8245),
    locationName: 'Bhubaneswar',
    district: 'Khordha',
    reporters: []
  }).toJSON();

  assert.equal(cluster.id, 'INC-TEST-001');
  assert.equal(cluster.databaseBacked, true);
  assert.deepEqual(cluster.location, {
    name: 'Bhubaneswar',
    lng: 85.8245,
    lat: 20.2961,
    district: 'Khordha',
    address: ''
  });
});

test('predicts a critical rising river and downstream arrival windows', () => {
  const station = {
    currentLevelM: 26.58,
    warningLevelM: 26.41,
    dangerLevelM: 26.92,
    riseRateMetersPerHour: 0.52,
    rainfall24hMm: 176,
    trend: 'RISING_RAPIDLY',
    waveSpeedKmh: 24,
    downstreamCommunities: [{
      zoneId: 'ZONE-1',
      name: 'Downstream village',
      district: 'Khordha',
      location: geoPoint(20.33, 85.89),
      distanceKm: 15,
      radiusKm: 7,
      population: 18000,
      households: 4000
    }]
  };

  assert.deepEqual(calculateFloodRisk(station), {
    risk: 'CRITICAL',
    stage: 'WARNING',
    confidenceScore: 98
  });
  assert.equal(estimateDangerLeadMinutes(station), 40);
  assert.equal(buildDownstreamArrivalZones(station, new Date('2026-09-02T00:00:00Z'))[0].arrivalMinutes, 78);
});

test('turns a flooded bridge into a vehicle-aware routing closure', () => {
  const hazard = infrastructureAssetToHazard({
    assetId: 'BRIDGE-1',
    name: 'Flooded bridge',
    type: 'BRIDGE',
    status: 'FLOODED',
    routeRadiusMeters: 600,
    location: geoPoint(20.28, 85.86),
    description: 'Deck inundated'
  });
  const geometry = [[85.85, 20.27], [85.87, 20.29]];

  assert.equal(hazard.dynamicInfrastructure, true);
  assert.equal(evaluateRouteHazards(geometry, 'AMBULANCE', 350, [hazard]).isBlocked, true);
  assert.equal(evaluateRouteHazards(geometry, 'RESCUE_TEAM', 350, [hazard]).isBlocked, false);
});
