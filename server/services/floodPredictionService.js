import { FloodForecast } from '../models/FloodForecast.js';
import { publishAuthorityAlert } from './communityAlertService.js';

const TREND_CONFIDENCE = {
  RISING_RAPIDLY: 10,
  RISING: 7,
  STEADY: 3,
  FALLING: 1
};

export const calculateFloodRisk = station => {
  const current = Number(station.currentLevelM);
  const warning = Number(station.warningLevelM);
  const danger = Number(station.dangerLevelM);
  const rainfall = Number(station.rainfall24hMm || 0);
  const riseRate = Number(station.riseRateMetersPerHour || 0);
  const trend = station.trend || 'STEADY';

  let stage = 'NORMAL';
  let risk = 'LOW';

  if (current >= danger) {
    stage = 'DANGER';
    risk = 'CRITICAL';
  } else if (current >= warning) {
    stage = 'WARNING';
    risk = riseRate >= 0.35 || trend === 'RISING_RAPIDLY' ? 'CRITICAL' : 'HIGH';
  } else if (current >= warning * 0.9 || rainfall >= 100 || riseRate >= 0.3) {
    stage = 'WATCH';
    risk = trend === 'RISING_RAPIDLY' || rainfall >= 150 ? 'HIGH' : 'MEDIUM';
  }

  const levelConfidence = Math.min(15, Math.max(0, ((current / danger) - 0.75) * 60));
  const confidenceScore = Math.round(Math.min(
    98,
    70 + levelConfidence + (TREND_CONFIDENCE[trend] || 0) + Math.min(5, rainfall / 40)
  ));

  return { risk, stage, confidenceScore };
};

export const estimateDangerLeadMinutes = station => {
  const current = Number(station.currentLevelM);
  const danger = Number(station.dangerLevelM);
  const riseRate = Number(station.riseRateMetersPerHour || 0);

  if (current >= danger) return 0;
  if (riseRate <= 0) return null;
  return Math.max(1, Math.ceil(((danger - current) / riseRate) * 60));
};

export const buildDownstreamArrivalZones = (station, issuedAt = new Date()) => {
  const dangerLeadMinutes = estimateDangerLeadMinutes(station) ?? 0;
  const waveSpeedKmh = Math.max(1, Number(station.waveSpeedKmh || 24));

  return (station.downstreamCommunities || []).map(zone => {
    const travelMinutes = Math.ceil((Number(zone.distanceKm) / waveSpeedKmh) * 60);
    const arrivalMinutes = dangerLeadMinutes + travelMinutes;
    return {
      zoneId: zone.zoneId,
      name: zone.name,
      district: zone.district,
      location: zone.location,
      distanceKm: zone.distanceKm,
      radiusKm: zone.radiusKm,
      arrivalMinutes,
      predictedArrivalAt: new Date(issuedAt.getTime() + arrivalMinutes * 60 * 1000),
      population: zone.population || 0,
      households: zone.households || 0,
      priorityShelter: zone.priorityShelter || ''
    };
  });
};

const warningMessage = (station, forecast) => {
  const firstZone = forecast.arrivalZones[0];
  const lead = forecast.dangerLeadMinutes === null
    ? 'Danger threshold timing is uncertain'
    : forecast.dangerLeadMinutes === 0
      ? 'Danger threshold has been reached'
      : `Danger threshold is predicted in ${forecast.dangerLeadMinutes} minutes`;
  const arrival = firstZone
    ? ` First downstream impact near ${firstZone.name} is estimated in ${firstZone.arrivalMinutes} minutes.`
    : '';
  return `${station.riverName} warning: ${lead}.${arrival} Move to higher ground and follow verified evacuation routes.`;
};

export const createOrUpdateFloodForecast = async ({
  station,
  createdBy = null,
  io,
  publishAlert = false
}) => {
  const issuedAt = new Date();
  const assessment = calculateFloodRisk(station);
  const dangerLeadMinutes = estimateDangerLeadMinutes(station);
  const arrivalZones = buildDownstreamArrivalZones(station, issuedAt);
  const atRiskPopulation = arrivalZones.reduce((total, zone) => total + Number(zone.population || 0), 0);
  const atRiskHouseholds = arrivalZones.reduce((total, zone) => total + Number(zone.households || 0), 0);

  const payload = {
    stationId: station.stationId,
    stationName: station.name,
    riverName: station.riverName,
    location: station.location,
    currentLevelM: station.currentLevelM,
    warningLevelM: station.warningLevelM,
    dangerLevelM: station.dangerLevelM,
    riseRateMetersPerHour: station.riseRateMetersPerHour,
    ...assessment,
    dangerLeadMinutes,
    predictedDangerAt: dangerLeadMinutes === null
      ? null
      : new Date(issuedAt.getTime() + dangerLeadMinutes * 60 * 1000),
    arrivalZones,
    atRiskPopulation,
    atRiskHouseholds,
    source: station.source,
    isSimulation: station.isSimulation,
    active: assessment.risk !== 'LOW',
    issuedAt,
    expiresAt: new Date(issuedAt.getTime() + 6 * 60 * 60 * 1000)
  };

  const forecast = await FloodForecast.findOneAndUpdate(
    { stationId: station.stationId, active: true },
    {
      $set: payload,
      $setOnInsert: { forecastId: `FCAST-${station.stationId}-${Date.now()}` }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (publishAlert && ['CRITICAL', 'HIGH'].includes(forecast.risk)) {
    const firstZone = arrivalZones[0];
    const alert = await publishAuthorityAlert({
      data: {
        source: 'RIVER_SENSOR',
        type: 'FLOOD',
        severity: forecast.risk,
        title: `${forecast.risk} downstream flood arrival warning`,
        message: warningMessage(station, forecast),
        safetyInstructions: [
          'Move to higher ground or the named priority shelter immediately.',
          'Do not cross flooded roads, culverts or bridges marked closed.',
          'Use the Safe / Need Rescue check-in so responders can account for your household.'
        ],
        lat: firstZone?.location?.coordinates?.[1] ?? station.location.coordinates[1],
        lng: firstZone?.location?.coordinates?.[0] ?? station.location.coordinates[0],
        locationName: firstZone?.name || station.name,
        district: firstZone?.district || station.district,
        radiusKm: Math.min(40, Math.max(12, firstZone?.radiusKm || 12)),
        expiresAt: forecast.expiresAt
      },
      createdBy,
      io
    });
    forecast.alertId = alert.alertId;
    await forecast.save();
  }

  io?.to('role:ADMIN').emit('flood-intelligence-updated', forecast.toJSON());
  io?.to('role:AUTHORITY').emit('flood-intelligence-updated', forecast.toJSON());
  io?.to('role:RESCUE_LEAD').emit('flood-intelligence-updated', forecast.toJSON());
  return forecast;
};
