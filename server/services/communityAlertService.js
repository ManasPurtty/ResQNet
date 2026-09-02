import { CommunityAlert } from '../models/CommunityAlert.js';
import { User } from '../models/User.js';
import { UserNotification } from '../models/UserNotification.js';
import { geoPoint, haversineDistanceKm } from '../utils/geo.js';

const SAFETY_GUIDANCE = {
  FLOOD: [
    'Move immediately to higher ground or the nearest designated shelter.',
    'Do not walk or drive through moving flood water.',
    'Switch off electricity only if it is safe to do so.'
  ],
  CYCLONE: [
    'Move indoors or to the nearest cyclone shelter.',
    'Stay away from windows, trees, poles and loose structures.',
    'Keep phones charged and follow official evacuation instructions.'
  ],
  LANDSLIDE: [
    'Move away from slopes, retaining walls and flowing debris.',
    'Use an alternate route and warn people downhill.',
    'Do not return until authorities mark the area safe.'
  ],
  FIRE: [
    'Leave the affected building or area immediately.',
    'Do not use lifts and stay upwind of smoke.',
    'Call emergency services and keep access roads clear.'
  ],
  BUILDING_DAMAGE: [
    'Move away from damaged buildings and falling debris.',
    'Do not re-enter the structure.',
    'Keep roads clear for fire and rescue teams.'
  ],
  ROAD_BLOCKAGE: [
    'Avoid the affected road and use an alternate route.',
    'Slow down and follow police or responder directions.',
    'Keep emergency access lanes clear.'
  ],
  MEDICAL: [
    'Keep the area accessible for the ambulance.',
    'Do not move an injured person unless they face immediate danger.',
    'Follow instructions from emergency personnel.'
  ],
  OTHER: [
    'Move away from the immediate danger area.',
    'Follow official instructions and assist vulnerable people nearby.',
    'Keep emergency access routes clear.'
  ]
};

const BASE_RADIUS_BY_SEVERITY = {
  CRITICAL: 10,
  HIGH: 7,
  MEDIUM: 4,
  LOW: 2
};

const TYPE_RADIUS_BONUS = {
  CYCLONE: 5,
  FLOOD: 2,
  LANDSLIDE: 1,
  FIRE: 1
};

const HAZARD_LABELS = {
  FLOOD: 'Flood',
  CYCLONE: 'Cyclone',
  LANDSLIDE: 'Landslide',
  BUILDING_DAMAGE: 'Building damage',
  ROAD_BLOCKAGE: 'Road blockage',
  MEDICAL: 'Medical emergency',
  FIRE: 'Fire',
  OTHER: 'Emergency'
};

export const getAlertRadiusKm = (type, severity) => Math.min(
  20,
  (BASE_RADIUS_BY_SEVERITY[severity] || 4) + (TYPE_RADIUS_BONUS[type] || 0)
);

export const getSafetyInstructions = type => (
  SAFETY_GUIDANCE[type] || SAFETY_GUIDANCE.OTHER
);

export const buildCommunityWarning = ({ type, locationName, reportCount = 1 }) => {
  const label = HAZARD_LABELS[type] || HAZARD_LABELS.OTHER;
  const verification = reportCount > 1
    ? ` Verified by ${reportCount} nearby reports.`
    : '';
  const firstInstruction = getSafetyInstructions(type)[0];

  return `Warning: ${label} reported near ${locationName}.${verification} ${firstInstruction}`;
};

const userCoordinates = user => ({
  lat: user.lastKnownLocation.coordinates[1],
  lng: user.lastKnownLocation.coordinates[0]
});

const alertCoordinates = alert => ({
  lat: alert.location.coordinates[1],
  lng: alert.location.coordinates[0]
});

const findNearbyUsers = async alert => {
  const users = await User.find({
    'lastKnownLocation.coordinates.0': { $exists: true },
    'lastKnownLocation.coordinates.1': { $exists: true }
  }).select('_id lastKnownLocation notificationPreferences');

  const source = alertCoordinates(alert);
  return users
    .map(user => ({
      user,
      distanceKm: haversineDistanceKm(source, userCoordinates(user))
    }))
    .filter(({ user, distanceKm }) => {
      const preferredRadius = user.notificationPreferences?.alertRadiusKm || alert.radiusKm;
      return distanceKm <= Math.min(alert.radiusKm, preferredRadius);
    });
};

export const deliverCommunityAlert = async (alert, io) => {
  const nearbyUsers = await findNearbyUsers(alert);

  if (nearbyUsers.length > 0) {
    await UserNotification.bulkWrite(nearbyUsers.map(({ user, distanceKm }) => ({
      updateOne: {
        filter: {
          user: user._id,
          entityId: alert.alertId,
          category: alert.source === 'CITIZEN_REPORT' ? 'COMMUNITY_WARNING' : 'OFFICIAL_ALERT'
        },
        update: {
          $set: {
            communityAlert: alert._id,
            title: alert.title,
            message: alert.message,
            severity: alert.severity,
            distanceKm: Number(distanceKm.toFixed(2)),
            deliveredAt: new Date()
          },
          $setOnInsert: { readAt: null }
        },
        upsert: true
      }
    })));
  }

  const recipientCount = await UserNotification.countDocuments({
    entityId: alert.alertId,
    category: alert.source === 'CITIZEN_REPORT' ? 'COMMUNITY_WARNING' : 'OFFICIAL_ALERT'
  });

  alert.recipientCount = recipientCount;
  await alert.save();

  const alertPayload = alert.toJSON();
  nearbyUsers.forEach(({ user }) => {
    io?.to(`user:${user._id}`).emit('community-alert-created', alertPayload);
  });
  return recipientCount;
};

export const createOrRefreshClusterAlert = async ({ cluster, createdBy, io }) => {
  const radiusKm = getAlertRadiusKm(cluster.type, cluster.severity);
  const title = `${cluster.severity} ${HAZARD_LABELS[cluster.type] || 'Emergency'} warning`;
  const message = buildCommunityWarning(cluster);
  const expiresAt = new Date(Date.now() + (cluster.type === 'CYCLONE' ? 12 : 6) * 60 * 60 * 1000);

  let alert = await CommunityAlert.findOne({ clusterId: cluster.clusterId });

  if (!alert) {
    alert = new CommunityAlert({
      alertId: `ALT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      clusterId: cluster.clusterId,
      source: 'CITIZEN_REPORT',
      type: cluster.type,
      severity: cluster.severity,
      title,
      message,
      safetyInstructions: getSafetyInstructions(cluster.type),
      location: cluster.location,
      locationName: cluster.locationName,
      district: cluster.district,
      radiusKm,
      reportCount: cluster.reportCount,
      expiresAt,
      createdBy
    });
  } else {
    alert.severity = cluster.severity;
    alert.title = title;
    alert.message = message;
    alert.location = cluster.location;
    alert.locationName = cluster.locationName;
    alert.district = cluster.district;
    alert.radiusKm = radiusKm;
    alert.reportCount = cluster.reportCount;
    alert.expiresAt = expiresAt;
    alert.active = true;
  }

  await alert.save();
  await deliverCommunityAlert(alert, io);
  return alert;
};

export const publishAuthorityAlert = async ({ data, createdBy, io }) => {
  const latitude = Number(data.lat);
  const longitude = Number(data.lng);
  const type = String(data.type || 'OTHER').toUpperCase();
  const severity = String(data.severity || 'HIGH').toUpperCase();

  const alert = await CommunityAlert.create({
    alertId: `ALT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    source: data.source || 'AUTHORITY',
    type,
    severity,
    title: String(data.title || `${severity} ${HAZARD_LABELS[type] || 'Emergency'} warning`).trim(),
    message: String(data.message || buildCommunityWarning({
      type,
      locationName: data.locationName,
      reportCount: 1
    })).trim(),
    safetyInstructions: Array.isArray(data.safetyInstructions)
      ? data.safetyInstructions
      : getSafetyInstructions(type),
    location: geoPoint(latitude, longitude),
    locationName: String(data.locationName).trim(),
    district: String(data.district || 'Khordha').trim(),
    radiusKm: Number(data.radiusKm) || getAlertRadiusKm(type, severity),
    reportCount: 1,
    expiresAt: data.expiresAt || new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdBy
  });

  await deliverCommunityAlert(alert, io);
  return alert;
};

export const syncNotificationsForUser = async (user, io) => {
  if (!user.lastKnownLocation?.coordinates?.length) return 0;

  const alerts = await CommunityAlert.find({
    active: true,
    expiresAt: { $gt: new Date() }
  });

  let delivered = 0;
  for (const alert of alerts) {
    const distanceKm = haversineDistanceKm(alertCoordinates(alert), userCoordinates(user));
    const preferredRadius = user.notificationPreferences?.alertRadiusKm || alert.radiusKm;
    if (distanceKm > Math.min(alert.radiusKm, preferredRadius)) continue;

    await UserNotification.findOneAndUpdate({
      user: user._id,
      entityId: alert.alertId,
      category: alert.source === 'CITIZEN_REPORT' ? 'COMMUNITY_WARNING' : 'OFFICIAL_ALERT'
    }, {
      $set: {
        communityAlert: alert._id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        distanceKm: Number(distanceKm.toFixed(2)),
        deliveredAt: new Date()
      },
      $setOnInsert: { readAt: null }
    }, { upsert: true, new: true });
    delivered += 1;
  }

  if (delivered > 0) io?.to(`user:${user._id}`).emit('notifications-synced');
  return delivered;
};
