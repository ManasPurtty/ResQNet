import express from 'express';
import { getDbStatus } from '../config/db.js';
import { FloodForecast } from '../models/FloodForecast.js';
import { InfrastructureAsset } from '../models/InfrastructureAsset.js';
import { RiverStation } from '../models/RiverStation.js';
import { SafetyCheckIn } from '../models/SafetyCheckIn.js';
import { createOrUpdateFloodForecast } from '../services/floodPredictionService.js';
import { geoPoint, isValidCoordinate } from '../utils/geo.js';
import { protect } from './auth.js';

const router = express.Router();
const AUTHORITY_ROLES = new Set(['ADMIN', 'AUTHORITY', 'RESCUE_LEAD']);

const requireMongoDB = (_req, res, next) => {
  if (!getDbStatus()) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is required for persistent flood intelligence and safety check-ins.'
    });
  }
  next();
};

const requireAuthority = (req, res, next) => {
  if (!AUTHORITY_ROLES.has(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Authority access is required' });
  }
  next();
};

const summarizeCheckIns = checkIns => checkIns.reduce((summary, checkIn) => {
  const key = checkIn.status === 'NEED_RESCUE' ? 'needRescue' : 'safe';
  summary[key].households += 1;
  summary[key].people += Number(checkIn.peopleCount || 1);
  summary[key].vulnerablePeople += Number(checkIn.vulnerablePeople || 0);
  return summary;
}, {
  safe: { households: 0, people: 0, vulnerablePeople: 0 },
  needRescue: { households: 0, people: 0, vulnerablePeople: 0 }
});

router.use(protect, requireMongoDB);

router.get('/active', async (_req, res) => {
  try {
    const now = new Date();
    const [forecasts, stations] = await Promise.all([
      FloodForecast.find({ active: true, expiresAt: { $gt: now } }).sort({ issuedAt: -1 }),
      RiverStation.find().sort({ lastObservedAt: -1 })
    ]);
    res.json({ success: true, forecasts, stations });
  } catch (error) {
    console.error('Load active flood forecasts error:', error);
    res.status(500).json({ success: false, message: 'Unable to load active flood forecasts' });
  }
});

router.get('/dashboard', requireAuthority, async (_req, res) => {
  try {
    const now = new Date();
    const [stations, forecasts, infrastructure, checkIns] = await Promise.all([
      RiverStation.find().sort({ lastObservedAt: -1 }),
      FloodForecast.find({ active: true, expiresAt: { $gt: now } }).sort({ issuedAt: -1 }),
      InfrastructureAsset.find().sort({ status: 1, updatedAt: -1 }),
      SafetyCheckIn.find({ updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .populate('user', 'name email phone district')
        .sort({ updatedAt: -1 })
    ]);

    const checkInSummary = summarizeCheckIns(checkIns);
    res.json({
      success: true,
      storageMode: 'MONGODB',
      stations,
      forecasts,
      infrastructure,
      checkIns,
      checkInSummary,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Load flood intelligence dashboard error:', error);
    res.status(500).json({ success: false, message: 'Unable to load flood intelligence dashboard' });
  }
});

router.post('/stations/:stationId/observation', requireAuthority, async (req, res) => {
  try {
    const station = await RiverStation.findOne({ stationId: req.params.stationId });
    if (!station) {
      return res.status(404).json({ success: false, message: 'River station not found' });
    }

    const currentLevelM = Number(req.body.currentLevelM);
    const riseRateMetersPerHour = Number(req.body.riseRateMetersPerHour);
    if (!Number.isFinite(currentLevelM) || !Number.isFinite(riseRateMetersPerHour)) {
      return res.status(400).json({
        success: false,
        message: 'Current level and rise rate must be valid numbers'
      });
    }

    station.currentLevelM = currentLevelM;
    station.riseRateMetersPerHour = riseRateMetersPerHour;
    station.rainfall24hMm = Number(req.body.rainfall24hMm ?? station.rainfall24hMm);
    station.trend = req.body.trend || station.trend;
    station.source = req.body.source || station.source;
    station.isSimulation = req.body.isSimulation ?? station.isSimulation;
    station.lastObservedAt = new Date();
    await station.save();

    const forecast = await createOrUpdateFloodForecast({
      station,
      createdBy: req.user._id,
      io: req.io,
      publishAlert: req.body.publishAlert !== false
    });
    res.json({ success: true, station, forecast });
  } catch (error) {
    console.error('Record river observation error:', error);
    res.status(500).json({ success: false, message: 'Unable to record the river observation' });
  }
});

router.post('/simulate', requireAuthority, async (req, res) => {
  try {
    const station = await RiverStation.findOne({ stationId: req.body.stationId || 'RIV-NARAJ-001' });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Demo river station not found' });
    }

    station.currentLevelM = Math.min(
      station.dangerLevelM + 0.2,
      Math.max(station.currentLevelM + 0.28, station.warningLevelM + 0.17)
    );
    station.riseRateMetersPerHour = 0.52;
    station.rainfall24hMm = Math.max(176, station.rainfall24hMm + 25);
    station.trend = 'RISING_RAPIDLY';
    station.source = 'DEMO_SENSOR';
    station.isSimulation = true;
    station.lastObservedAt = new Date();
    await station.save();

    const forecast = await createOrUpdateFloodForecast({
      station,
      createdBy: req.user._id,
      io: req.io,
      publishAlert: true
    });
    res.json({
      success: true,
      station,
      forecast,
      message: 'Simulation stored in MongoDB and downstream warning delivered to nearby users.'
    });
  } catch (error) {
    console.error('Simulate river rise error:', error);
    res.status(500).json({ success: false, message: 'Unable to run the flood simulation' });
  }
});

router.patch('/infrastructure/:assetId/status', requireAuthority, async (req, res) => {
  try {
    const allowedStatuses = ['OPERATIONAL', 'AT_RISK', 'FLOODED', 'WASHED_OUT', 'CLOSED', 'UNKNOWN'];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid infrastructure status' });
    }

    const asset = await InfrastructureAsset.findOneAndUpdate(
      { assetId: req.params.assetId },
      {
        $set: {
          status: req.body.status,
          description: req.body.description || undefined,
          verified: Boolean(req.body.verified),
          lastVerifiedAt: req.body.verified ? new Date() : null,
          lastUpdatedBy: req.user._id
        }
      },
      { new: true, runValidators: true }
    );
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Infrastructure asset not found' });
    }

    ['ADMIN', 'AUTHORITY', 'RESCUE_LEAD'].forEach(role => {
      req.io?.to(`role:${role}`).emit('flood-intelligence-updated', asset.toJSON());
    });
    res.json({
      success: true,
      asset,
      routingUpdated: ['FLOODED', 'WASHED_OUT', 'CLOSED', 'AT_RISK'].includes(asset.status)
    });
  } catch (error) {
    console.error('Update infrastructure status error:', error);
    res.status(500).json({ success: false, message: 'Unable to update infrastructure status' });
  }
});

router.post('/check-ins', async (req, res) => {
  try {
    const allowedStatuses = ['SAFE', 'NEED_RESCUE'];
    const allowedEntityTypes = ['FORECAST', 'ALERT', 'INCIDENT'];
    if (!allowedStatuses.includes(req.body.status) || !allowedEntityTypes.includes(req.body.entityType) || !req.body.entityId) {
      return res.status(400).json({
        success: false,
        message: 'A valid alert or forecast and Safe / Need Rescue status are required'
      });
    }

    let location;
    const latitude = Number(req.body.location?.lat);
    const longitude = Number(req.body.location?.lng);
    if (isValidCoordinate(latitude, longitude)) {
      location = {
        ...geoPoint(latitude, longitude),
        accuracyMeters: Number(req.body.location?.accuracyMeters) || null
      };
    } else if (req.user.lastKnownLocation?.coordinates?.length === 2) {
      location = req.user.lastKnownLocation;
    }

    const checkIn = await SafetyCheckIn.findOneAndUpdate(
      {
        user: req.user._id,
        entityType: req.body.entityType,
        entityId: String(req.body.entityId)
      },
      {
        $set: {
          status: req.body.status,
          location,
          peopleCount: Math.min(100, Math.max(1, Number(req.body.peopleCount) || 1)),
          vulnerablePeople: Math.min(100, Math.max(0, Number(req.body.vulnerablePeople) || 0)),
          note: String(req.body.note || '').trim(),
          acknowledgedAt: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate('user', 'name email phone district');

    ['ADMIN', 'AUTHORITY', 'RESCUE_LEAD'].forEach(role => {
      req.io?.to(`role:${role}`).emit('safety-check-in-updated', checkIn.toJSON());
    });
    res.status(201).json({ success: true, checkIn });
  } catch (error) {
    console.error('Safety check-in error:', error);
    res.status(500).json({ success: false, message: 'Unable to save the safety check-in' });
  }
});

router.get('/check-ins/mine', async (req, res) => {
  try {
    const checkIns = await SafetyCheckIn.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, checkIns });
  } catch (error) {
    console.error('Load personal safety check-ins error:', error);
    res.status(500).json({ success: false, message: 'Unable to load your safety check-ins' });
  }
});

router.get('/check-ins/summary', requireAuthority, async (req, res) => {
  try {
    const query = req.query.entityId ? { entityId: String(req.query.entityId) } : {};
    const checkIns = await SafetyCheckIn.find(query)
      .populate('user', 'name email phone district')
      .sort({ updatedAt: -1 });
    res.json({ success: true, summary: summarizeCheckIns(checkIns), checkIns });
  } catch (error) {
    console.error('Load safety check-in summary error:', error);
    res.status(500).json({ success: false, message: 'Unable to load safety check-in summary' });
  }
});

export default router;
