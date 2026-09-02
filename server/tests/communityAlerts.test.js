import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommunityWarning, getAlertRadiusKm, getSafetyInstructions } from '../services/communityAlertService.js';
import { geoPoint, haversineDistanceKm, isValidCoordinate } from '../utils/geo.js';
import { IncidentCluster } from '../models/IncidentCluster.js';

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
