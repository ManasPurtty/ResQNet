import express from 'express';
import { getDbStatus } from '../config/db.js';
import { CommunityAlert } from '../models/CommunityAlert.js';
import { UserNotification } from '../models/UserNotification.js';
import { publishAuthorityAlert } from '../services/communityAlertService.js';
import { haversineDistanceKm, isValidCoordinate } from '../utils/geo.js';
import { protect } from './auth.js';

const router = express.Router();
const AUTHORITY_ROLES = new Set(['ADMIN', 'AUTHORITY', 'RESCUE_LEAD']);

const requireMongoDB = (_req, res, next) => {
  if (!getDbStatus()) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is required for persistent community alerts.'
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

const serializeNotification = notification => ({
  id: String(notification._id),
  entityId: notification.entityId,
  category: notification.category,
  title: notification.title,
  message: notification.message,
  severity: notification.severity,
  distanceKm: notification.distanceKm,
  readAt: notification.readAt,
  deliveredAt: notification.deliveredAt,
  createdAt: notification.createdAt,
  alert: notification.communityAlert?.toJSON
    ? notification.communityAlert.toJSON()
    : notification.communityAlert
});

router.use(protect, requireMongoDB);

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
    const notifications = await UserNotification.find({ user: req.user._id })
      .populate('communityAlert')
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await UserNotification.countDocuments({
      user: req.user._id,
      readAt: null
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications: notifications.map(serializeNotification)
    });
  } catch (error) {
    console.error('Load notifications error:', error);
    res.status(500).json({ success: false, message: 'Unable to load nearby alerts' });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const storedCoordinates = req.user.lastKnownLocation?.coordinates;
    const latitude = req.query.lat === undefined
      ? storedCoordinates?.[1]
      : Number(req.query.lat);
    const longitude = req.query.lng === undefined
      ? storedCoordinates?.[0]
      : Number(req.query.lng);

    if (!isValidCoordinate(Number(latitude), Number(longitude))) {
      return res.status(400).json({
        success: false,
        message: 'Share your location to find emergency warnings near you.'
      });
    }

    const alerts = await CommunityAlert.find({
      active: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    const userPoint = { lat: Number(latitude), lng: Number(longitude) };
    const nearbyAlerts = alerts
      .map(alert => {
        const alertJson = alert.toJSON();
        const distanceKm = haversineDistanceKm(userPoint, {
          lat: alertJson.location.lat,
          lng: alertJson.location.lng
        });
        return { ...alertJson, distanceKm: Number(distanceKm.toFixed(2)) };
      })
      .filter(alert => alert.distanceKm <= alert.radiusKm);

    res.json({ success: true, count: nearbyAlerts.length, alerts: nearbyAlerts });
  } catch (error) {
    console.error('Load nearby alerts error:', error);
    res.status(500).json({ success: false, message: 'Unable to calculate nearby alerts' });
  }
});

router.patch('/notifications/read-all', async (req, res) => {
  try {
    const result = await UserNotification.updateMany(
      { user: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Unable to update alerts' });
  }
});

router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    ).populate('communityAlert');

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Alert notification not found' });
    }

    res.json({ success: true, notification: serializeNotification(notification) });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Unable to update this alert' });
  }
});

router.get('/', requireAuthority, async (_req, res) => {
  try {
    const alerts = await CommunityAlert.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    console.error('Load authority alerts error:', error);
    res.status(500).json({ success: false, message: 'Unable to load community alerts' });
  }
});

router.post('/publish', requireAuthority, async (req, res) => {
  try {
    const latitude = Number(req.body.lat);
    const longitude = Number(req.body.lng);
    if (!req.body.locationName || !isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Location name, latitude and longitude are required'
      });
    }

    const alert = await publishAuthorityAlert({
      data: req.body,
      createdBy: req.user._id,
      io: req.io
    });

    res.status(201).json({
      success: true,
      alert,
      recipientsNotified: alert.recipientCount
    });
  } catch (error) {
    console.error('Publish authority alert error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Unable to publish the community alert' });
  }
});

export default router;
