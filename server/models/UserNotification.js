import mongoose from 'mongoose';

const UserNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  communityAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityAlert', default: null },
  entityId: { type: String, required: true },
  category: {
    type: String,
    enum: ['COMMUNITY_WARNING', 'RESPONSE_UPDATE', 'OFFICIAL_ALERT'],
    default: 'COMMUNITY_WARNING'
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'], default: 'INFO' },
  distanceKm: { type: Number, default: null, min: 0 },
  readAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserNotificationSchema.index({ user: 1, entityId: 1, category: 1 }, { unique: true });
UserNotificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

export const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);
