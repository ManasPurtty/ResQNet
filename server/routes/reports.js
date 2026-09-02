import express from 'express';
import { getDbStatus } from '../config/db.js';
import { IncidentCluster } from '../models/IncidentCluster.js';
import { IncidentReport } from '../models/IncidentReport.js';
import { User } from '../models/User.js';
import { UserNotification } from '../models/UserNotification.js';
import { createOrRefreshClusterAlert } from '../services/communityAlertService.js';
import { geoPoint, haversineDistanceKm, isValidCoordinate } from '../utils/geo.js';
import { protect } from './auth.js';

const router = express.Router();
const FUSION_WINDOW_MS = 3 * 60 * 60 * 1000;
const FUSION_DISTANCE_KM = 2.5;
const AUTHORITY_ROLES = new Set(['ADMIN', 'AUTHORITY', 'RESCUE_LEAD']);

const severityRanks = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

const requireMongoDB = (_req, res, next) => {
  if (!getDbStatus()) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is unavailable. Reports cannot be stored safely right now.'
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

const toNonNegativeInteger = (value, fallback = 0) => {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
};

const calculatePriorityScore = data => {
  const severityScores = { CRITICAL: 35, HIGH: 26, MEDIUM: 18, LOW: 8 };
  const severityScore = severityScores[data.severity] ?? 15;
  const trappedScore = Math.min(25, Math.round(toNonNegativeInteger(data.peopleTrapped) * 6.5));
  const vulnerableScore = Math.min(20, Math.round(toNonNegativeInteger(data.vulnerablePeople) * 7));
  const affectedScore = Math.min(10, Math.round(toNonNegativeInteger(data.peopleAffected, 1) * 0.4));

  return Math.min(100, Math.max(10, severityScore + trappedScore + vulnerableScore + affectedScore + 10));
};

const strongestSeverity = (first, second) => (
  severityRanks[second] > severityRanks[first] ? second : first
);

const findMatchingCluster = async ({ type, district, lat, lng }) => {
  const candidates = await IncidentCluster.find({
    type,
    district,
    status: { $ne: 'RESOLVED' },
    lastReportedAt: { $gte: new Date(Date.now() - FUSION_WINDOW_MS) }
  }).limit(100);

  return candidates
    .map(cluster => ({
      cluster,
      distanceKm: haversineDistanceKm(
        { lat, lng },
        { lat: cluster.location.coordinates[1], lng: cluster.location.coordinates[0] }
      )
    }))
    .filter(candidate => candidate.distanceKm <= FUSION_DISTANCE_KM)
    .sort((first, second) => first.distanceKm - second.distanceKm)[0] || null;
};

const mergeReportIntoCluster = async ({ cluster, reportData, reporterId, priorityScore, lat, lng }) => {
  const previousCount = cluster.reportCount;
  const reportCount = previousCount + 1;
  const previousLat = cluster.location.coordinates[1];
  const previousLng = cluster.location.coordinates[0];

  cluster.location = geoPoint(
    ((previousLat * previousCount) + lat) / reportCount,
    ((previousLng * previousCount) + lng) / reportCount
  );
  cluster.reportCount = reportCount;
  cluster.severity = strongestSeverity(cluster.severity, reportData.severity);
  cluster.priorityScore = Math.min(100, Math.max(cluster.priorityScore, priorityScore) + Math.min(8, reportCount - 1));
  cluster.confidenceScore = Math.min(99, 72 + reportCount * 7);
  cluster.peopleAffected = Math.max(cluster.peopleAffected, reportData.peopleAffected);
  cluster.peopleTrapped = Math.max(cluster.peopleTrapped, reportData.peopleTrapped);
  cluster.vulnerablePeople = Math.max(cluster.vulnerablePeople, reportData.vulnerablePeople);
  cluster.lastReportedAt = new Date();
  cluster.reporters.addToSet(reporterId);
  await cluster.save();
  return cluster;
};

const reportWithCluster = (report, cluster, communityAlert = null) => {
  const reportJson = report.toJSON();
  if (!cluster) return reportJson;

  return {
    ...reportJson,
    clusterId: cluster.clusterId,
    reportCount: cluster.reportCount,
    confidenceScore: cluster.confidenceScore,
    priorityScore: cluster.priorityScore,
    status: cluster.status,
    responderStatus: cluster.responderStatus,
    assignedResourceId: cluster.assignedResourceId,
    assignedResourceName: cluster.assignedResourceName,
    assignedShelterId: cluster.assignedShelterId,
    etaMinutes: cluster.etaMinutes,
    communityAlert: communityAlert?.toJSON ? communityAlert.toJSON() : communityAlert
  };
};

router.use(protect, requireMongoDB);

// Return reports belonging only to the authenticated user, enriched with live response state.
router.get('/mine', async (req, res) => {
  try {
    const reports = await IncidentReport.find({ reportedBy: req.user._id })
      .sort({ reportedAt: -1 });
    const clusterIds = [...new Set(reports.map(report => report.clusterId).filter(Boolean))];
    const clusters = await IncidentCluster.find({ clusterId: { $in: clusterIds } })
      .populate('communityAlert');
    const clustersById = new Map(clusters.map(cluster => [cluster.clusterId, cluster]));

    const enrichedReports = reports.map(report => {
      const cluster = clustersById.get(report.clusterId);
      return reportWithCluster(report, cluster, cluster?.communityAlert);
    });

    res.json({ success: true, count: enrichedReports.length, reports: enrichedReports });
  } catch (error) {
    console.error('Load user reports error:', error);
    res.status(500).json({ success: false, message: 'Unable to load your reports' });
  }
});

// MongoDB-backed incident feed for authority dashboards.
router.get('/clusters', requireAuthority, async (_req, res) => {
  try {
    const clusters = await IncidentCluster.find()
      .populate('communityAlert')
      .sort({ priorityScore: -1, lastReportedAt: -1 })
      .limit(200);
    res.json({ success: true, count: clusters.length, incidents: clusters });
  } catch (error) {
    console.error('Load incident clusters error:', error);
    res.status(500).json({ success: false, message: 'Unable to load incident clusters' });
  }
});

// Store a report, fuse duplicates, and broadcast a persistent nearby warning.
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ['type', 'severity', 'locationName', 'description'];
    const missingField = requiredFields.find(field => !String(data[field] ?? '').trim());

    if (missingField) {
      return res.status(400).json({ success: false, message: `${missingField} is required` });
    }

    const latitude = Number(data.lat);
    const longitude = Number(data.lng);
    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({ success: false, message: 'A valid report location is required' });
    }

    const type = String(data.type).toUpperCase();
    const severity = String(data.severity).toUpperCase();
    const district = String(data.district || req.user.district || 'Khordha').trim();
    const peopleAffected = toNonNegativeInteger(data.peopleAffected, 1);
    const peopleTrapped = toNonNegativeInteger(data.peopleTrapped);
    const vulnerablePeople = toNonNegativeInteger(data.vulnerablePeople);
    const priorityScore = calculatePriorityScore({
      ...data,
      severity,
      peopleAffected,
      peopleTrapped,
      vulnerablePeople
    });

    const matching = await findMatchingCluster({
      type,
      district,
      lat: latitude,
      lng: longitude
    });

    let cluster;
    let isCorroboratingReport = false;

    if (matching) {
      cluster = await mergeReportIntoCluster({
        cluster: matching.cluster,
        reportData: { severity, peopleAffected, peopleTrapped, vulnerablePeople },
        reporterId: req.user._id,
        priorityScore,
        lat: latitude,
        lng: longitude
      });
      isCorroboratingReport = true;
    } else {
      cluster = await IncidentCluster.create({
        clusterId: `INC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        type,
        severity,
        priorityScore,
        confidenceScore: 79,
        location: geoPoint(latitude, longitude),
        locationName: String(data.locationName).trim(),
        district,
        address: String(data.address || 'Reported via ResQNet Citizen Portal').trim(),
        peopleAffected,
        peopleTrapped,
        vulnerablePeople,
        reporters: [req.user._id]
      });
    }

    const report = await IncidentReport.create({
      incidentId: `RPT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      clusterId: cluster.clusterId,
      isCorroboratingReport,
      reportedBy: req.user._id,
      title: `${type} in ${String(data.locationName).trim()}`,
      type,
      severity,
      priorityScore,
      confidenceScore: cluster.confidenceScore,
      location: {
        name: String(data.locationName).trim(),
        lat: latitude,
        lng: longitude,
        district,
        address: String(data.address || 'Reported via ResQNet Citizen Portal').trim()
      },
      peopleAffected,
      peopleTrapped,
      vulnerablePeople,
      reportCount: cluster.reportCount,
      description: String(data.description).trim(),
      image: typeof data.image === 'string' ? data.image : '',
      reporter: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });

    // Reporting an incident also opts this exact emergency location into nearby alerts.
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        lastKnownLocation: {
          ...geoPoint(latitude, longitude),
          accuracyMeters: null,
          updatedAt: new Date()
        }
      }
    });

    const communityAlert = await createOrRefreshClusterAlert({
      cluster,
      createdBy: req.user._id,
      io: req.io
    });

    if (!cluster.communityAlert) {
      cluster.communityAlert = communityAlert._id;
      await cluster.save();
    }

    const incident = reportWithCluster(report, cluster, communityAlert);
    ['ADMIN', 'AUTHORITY', 'RESCUE_LEAD'].forEach(role => {
      req.io?.to(`role:${role}`).emit('incident-created', cluster.toJSON());
    });

    res.status(201).json({
      success: true,
      incident,
      fusion: {
        mergedWithExistingIncident: isCorroboratingReport,
        clusterId: cluster.clusterId,
        reportCount: cluster.reportCount,
        confidenceScore: cluster.confidenceScore
      },
      communityWarning: {
        alert: communityAlert,
        radiusKm: communityAlert.radiusKm,
        recipientsNotified: communityAlert.recipientCount
      }
    });
  } catch (error) {
    console.error('Create incident report error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Unable to store the incident report' });
  }
});

// Persist responder assignment, ETA, GPS and progress for citizens to track.
router.patch('/clusters/:clusterId/response', requireAuthority, async (req, res) => {
  try {
    const allowedStatuses = new Set([
      'ASSIGNED',
      'EN_ROUTE',
      'ARRIVED',
      'RESCUE_IN_PROGRESS',
      'COMPLETED'
    ]);
    const responderStatus = String(req.body.responderStatus || '').toUpperCase();

    if (!allowedStatuses.has(responderStatus)) {
      return res.status(400).json({ success: false, message: 'A valid responder status is required' });
    }

    const cluster = await IncidentCluster.findOne({ clusterId: req.params.clusterId });
    if (!cluster) {
      return res.status(404).json({ success: false, message: 'Incident cluster not found' });
    }

    const statusMap = {
      ASSIGNED: 'RESOURCE_ASSIGNED',
      EN_ROUTE: 'RESOURCE_ASSIGNED',
      ARRIVED: 'RESCUE_IN_PROGRESS',
      RESCUE_IN_PROGRESS: 'RESCUE_IN_PROGRESS',
      COMPLETED: 'RESOLVED'
    };

    cluster.responderStatus = responderStatus;
    cluster.status = statusMap[responderStatus];
    if (req.body.resourceId !== undefined) cluster.assignedResourceId = req.body.resourceId || null;
    if (req.body.resourceName !== undefined) cluster.assignedResourceName = req.body.resourceName || null;
    if (req.body.shelterId !== undefined) cluster.assignedShelterId = req.body.shelterId || null;

    const etaMinutes = Number(req.body.etaMinutes);
    if (Number.isFinite(etaMinutes)) cluster.etaMinutes = Math.max(0, etaMinutes);

    const responderLat = Number(req.body.lat);
    const responderLng = Number(req.body.lng);
    if (isValidCoordinate(responderLat, responderLng)) {
      cluster.responderLocation = geoPoint(responderLat, responderLng);
    }

    await cluster.save();
    await IncidentReport.updateMany({ clusterId: cluster.clusterId }, {
      $set: {
        status: cluster.status,
        assignedResourceId: cluster.assignedResourceId,
        assignedShelterId: cluster.assignedShelterId
      }
    });

    const reporterIds = await IncidentReport.distinct('reportedBy', { clusterId: cluster.clusterId });
    const statusLabel = responderStatus.replaceAll('_', ' ').toLowerCase();
    if (reporterIds.length > 0) {
      await UserNotification.bulkWrite(reporterIds.map(userId => ({
        updateOne: {
          filter: {
            user: userId,
            entityId: `${cluster.clusterId}:${responderStatus}`,
            category: 'RESPONSE_UPDATE'
          },
          update: {
            $set: {
              title: `Rescue update for ${cluster.clusterId}`,
              message: `Your response team is ${statusLabel}.${cluster.etaMinutes !== null ? ` ETA: ${cluster.etaMinutes} minutes.` : ''}`,
              severity: 'INFO',
              deliveredAt: new Date(),
              readAt: null
            }
          },
          upsert: true
        }
      })));
    }

    const incident = cluster.toJSON();
    reporterIds.forEach(userId => {
      req.io?.to(`user:${userId}`).emit('incident-response-updated', incident);
    });
    ['ADMIN', 'AUTHORITY', 'RESCUE_LEAD'].forEach(role => {
      req.io?.to(`role:${role}`).emit('incident-response-updated', incident);
    });
    res.json({ success: true, incident, reportersNotified: reporterIds.length });
  } catch (error) {
    console.error('Update incident response error:', error);
    res.status(500).json({ success: false, message: 'Unable to update responder progress' });
  }
});

export default router;
