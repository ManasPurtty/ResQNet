import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: { type: [Number], required: true },
  accuracyMeters: { type: Number, default: null, min: 0 }
}, { _id: false });

const SafetyCheckInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: { type: String, enum: ['FORECAST', 'ALERT', 'INCIDENT'], required: true },
  entityId: { type: String, required: true, index: true },
  status: { type: String, enum: ['SAFE', 'NEED_RESCUE'], required: true, index: true },
  location: { type: GeoPointSchema, default: undefined },
  peopleCount: { type: Number, default: 1, min: 1, max: 100 },
  vulnerablePeople: { type: Number, default: 0, min: 0, max: 100 },
  note: { type: String, default: '', trim: true, maxlength: 500 },
  acknowledgedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = String(value._id);
      if (value.location) {
        value.location = {
          lat: value.location.coordinates[1],
          lng: value.location.coordinates[0],
          accuracyMeters: value.location.accuracyMeters
        };
      }
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

SafetyCheckInSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });
SafetyCheckInSchema.index({ location: '2dsphere' });

export const SafetyCheckIn = mongoose.model('SafetyCheckIn', SafetyCheckInSchema);
