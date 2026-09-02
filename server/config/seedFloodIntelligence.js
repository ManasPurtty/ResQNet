import { FloodForecast } from '../models/FloodForecast.js';
import { InfrastructureAsset } from '../models/InfrastructureAsset.js';
import { RiverStation } from '../models/RiverStation.js';
import { createOrUpdateFloodForecast } from '../services/floodPredictionService.js';
import { geoPoint } from '../utils/geo.js';

const stationSeed = {
  stationId: 'RIV-NARAJ-001',
  name: 'Naraj River Gauge & Upstream Blockage Watch',
  riverName: 'Mahanadi–Daya System',
  basinName: 'Mahanadi Delta Basin',
  district: 'Cuttack',
  country: 'India',
  location: geoPoint(20.4619, 85.7626),
  currentLevelM: 26.18,
  warningLevelM: 26.41,
  dangerLevelM: 26.92,
  riseRateMetersPerHour: 0.24,
  rainfall24hMm: 118,
  trend: 'RISING',
  waveSpeedKmh: 24,
  source: 'DEMO_SENSOR',
  isSimulation: true,
  downstreamCommunities: [
    {
      zoneId: 'ZONE-BALIANTA',
      name: 'Balianta Low-Lying Settlements',
      district: 'Khordha',
      location: geoPoint(20.3302, 85.8937),
      distanceKm: 15,
      radiusKm: 7,
      population: 18400,
      households: 4100,
      priorityShelter: 'Balianta Government High School Relief Centre'
    },
    {
      zoneId: 'ZONE-PIPILI',
      name: 'Pipili–Daya Floodplain',
      district: 'Puri',
      location: geoPoint(20.1134, 85.8315),
      distanceKm: 32,
      radiusKm: 9,
      population: 26700,
      households: 5900,
      priorityShelter: 'Pipili Multipurpose Cyclone Shelter'
    },
    {
      zoneId: 'ZONE-NIMAPADA',
      name: 'Nimapada Rural Cluster',
      district: 'Puri',
      location: geoPoint(19.9848, 86.0045),
      distanceKm: 51,
      radiusKm: 11,
      population: 33100,
      households: 7200,
      priorityShelter: 'Nimapada Autonomous College Relief Camp'
    }
  ]
};

const infrastructureSeeds = [
  {
    assetId: 'INFRA-BRIDGE-DAYA-01',
    name: 'Daya Canal Emergency Bridge',
    type: 'BRIDGE',
    district: 'Khordha',
    location: geoPoint(20.282, 85.861),
    status: 'FLOODED',
    routeRadiusMeters: 650,
    description: 'Deck-level inundation reported by the EOC simulation feed. Automatically excluded from ambulance and relief routes.',
    verified: true,
    source: 'EOC_DEMO_FIELD_TEAM',
    lastVerifiedAt: new Date()
  },
  {
    assetId: 'INFRA-ROAD-NH16-01',
    name: 'NH-16 Khandagiri Underpass',
    type: 'ROAD',
    district: 'Khordha',
    location: geoPoint(20.257, 85.786),
    status: 'CLOSED',
    routeRadiusMeters: 500,
    description: 'Underpass closure after water and stranded vehicles blocked both carriageways.',
    verified: true,
    source: 'EOC_DEMO_FIELD_TEAM',
    lastVerifiedAt: new Date()
  },
  {
    assetId: 'INFRA-BRIDGE-PIPILI-01',
    name: 'Pipili Rural Access Bridge',
    type: 'BRIDGE',
    district: 'Puri',
    location: geoPoint(20.1058, 85.8462),
    status: 'AT_RISK',
    routeRadiusMeters: 550,
    description: 'Scour risk under rapid river rise. Heavy relief vehicles require verification before crossing.',
    verified: false,
    source: 'EOC_DEMO_FIELD_TEAM'
  },
  {
    assetId: 'INFRA-SHELTER-BALIANTA-01',
    name: 'Balianta Government High School Relief Centre',
    type: 'SHELTER',
    district: 'Khordha',
    location: geoPoint(20.3375, 85.8871),
    status: 'OPERATIONAL',
    routeRadiusMeters: 250,
    description: 'Priority downstream shelter with backup power and elevated access.',
    verified: true,
    source: 'EOC_DEMO_FIELD_TEAM',
    lastVerifiedAt: new Date()
  }
];

export const seedFloodIntelligence = async () => {
  const station = await RiverStation.findOneAndUpdate(
    { stationId: stationSeed.stationId },
    { $setOnInsert: stationSeed },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const asset of infrastructureSeeds) {
    await InfrastructureAsset.findOneAndUpdate(
      { assetId: asset.assetId },
      { $setOnInsert: asset },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  const hasActiveForecast = await FloodForecast.exists({
    stationId: station.stationId,
    active: true,
    expiresAt: { $gt: new Date() }
  });
  if (!hasActiveForecast) {
    await createOrUpdateFloodForecast({ station, publishAlert: false });
  }

  console.log('✅ Flood intelligence demo station and infrastructure seeded');
};
