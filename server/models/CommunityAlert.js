import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: {
    type: [Number],
    required: true,
    validate: coordinates => coordinates.length === 2
  }
}, { _id: false });

const CommunityAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true, index: true },
  clusterId: { type: String, default: null, index: true },
  source: {
    type: String,
    enum: ['CITIZEN_REPORT', 'IMD', 'NDMA_SACHET', 'OSDMA', 'AUTHORITY', 'RIVER_SENSOR'],
    default: 'CITIZEN_REPORT'
  },
  type: { type: String, required: true },
  severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  safetyInstructions: [{ type: String, trim: true }],
  location: { type: GeoPointSchema, required: true },
  locationName: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  radiusKm: { type: Number, required: true, min: 0.5, max: 100 },
  reportCount: { type: Number, default: 1, min: 1 },
  recipientCount: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.alertId;
      value.location = {
        name: value.locationName,
        lng: value.location.coordinates[0],
        lat: value.location.coordinates[1],
        district: value.district
      };
      delete value.alertId;
      delete value.locationName;
      delete value.district;
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

CommunityAlertSchema.index({ location: '2dsphere' });
CommunityAlertSchema.index({ active: 1, expiresAt: 1, createdAt: -1 });

export const CommunityAlert = mongoose.model('CommunityAlert', CommunityAlertSchema);
