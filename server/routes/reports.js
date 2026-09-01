import express from 'express';
import { getDbStatus } from '../config/db.js';
import { IncidentReport } from '../models/IncidentReport.js';
import { protect } from './auth.js';

const router = express.Router();

const requireMongoDB = (_req, res, next) => {
  if (!getDbStatus()) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is unavailable. Reports cannot be stored safely right now.'
    });
  }

  next();
};

const toNonNegativeInteger = (value, fallback = 0) => {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
};

const calculatePriorityScore = (data) => {
  const severityScores = { CRITICAL: 35, HIGH: 26, MEDIUM: 18, LOW: 8 };
  const severityScore = severityScores[data.severity] ?? 15;
  const trappedScore = Math.min(25, Math.round(toNonNegativeInteger(data.peopleTrapped) * 6.5));
  const vulnerableScore = Math.min(20, Math.round(toNonNegativeInteger(data.vulnerablePeople) * 7));
  const affectedScore = Math.min(10, Math.round(toNonNegativeInteger(data.peopleAffected, 1) * 0.4));

  return Math.min(100, Math.max(10, severityScore + trappedScore + vulnerableScore + affectedScore + 10));
};

router.use(protect, requireMongoDB);

// Return reports belonging only to the authenticated user.
router.get('/mine', async (req, res) => {
  try {
    const reports = await IncidentReport.find({ reportedBy: req.user._id })
      .sort({ reportedAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    console.error('Load user reports error:', error);
    res.status(500).json({ success: false, message: 'Unable to load your reports' });
  }
});

// Store a new report under the authenticated user's MongoDB account.
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ['type', 'severity', 'locationName', 'description'];
    const missingField = requiredFields.find(field => !String(data[field] ?? '').trim());

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `${missingField} is required`
      });
    }

    const latitude = Number(data.lat);
    const longitude = Number(data.lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ success: false, message: 'A valid report location is required' });
    }

    const incidentId = `INC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const type = String(data.type).toUpperCase();
    const severity = String(data.severity).toUpperCase();

    const report = await IncidentReport.create({
      incidentId,
      reportedBy: req.user._id,
      title: `${type} in ${String(data.locationName).trim()}`,
      type,
      severity,
      priorityScore: calculatePriorityScore({ ...data, severity }),
      confidenceScore: 94,
      location: {
        name: String(data.locationName).trim(),
        lat: latitude,
        lng: longitude,
        district: String(data.district || req.user.district || 'Khordha').trim(),
        address: String(data.address || 'Reported via ResQNet Citizen Portal').trim()
      },
      peopleAffected: toNonNegativeInteger(data.peopleAffected, 1),
      peopleTrapped: toNonNegativeInteger(data.peopleTrapped),
      vulnerablePeople: toNonNegativeInteger(data.vulnerablePeople),
      description: String(data.description).trim(),
      image: typeof data.image === 'string' ? data.image : '',
      reporter: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });

    req.io?.emit('incident-created', report.toJSON());
    res.status(201).json({ success: true, incident: report });
  } catch (error) {
    console.error('Create incident report error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Unable to store the incident report' });
  }
});

export default router;
