import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: { type: [Number], required: true }
}, { _id: false });

const InfrastructureAssetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['BRIDGE', 'ROAD', 'HOSPITAL', 'COMMUNICATION_TOWER', 'POWER_SUBSTATION', 'SHELTER'],
    required: true
  },
  district: { type: String, required: true, trim: true },
  location: { type: GeoPointSchema, required: true },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'AT_RISK', 'FLOODED', 'WASHED_OUT', 'CLOSED', 'UNKNOWN'],
    default: 'OPERATIONAL',
    index: true
  },
  routeRadiusMeters: { type: Number, default: 450, min: 50, max: 5000 },
  description: { type: String, default: '', trim: true },
  verified: { type: Boolean, default: false },
  source: { type: String, default: 'EOC_FIELD_TEAM', trim: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lastVerifiedAt: { type: Date, default: null }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.assetId;
      value.location = {
        lat: value.location.coordinates[1],
        lng: value.location.coordinates[0]
      };
      delete value.assetId;
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

InfrastructureAssetSchema.index({ location: '2dsphere' });

export const InfrastructureAsset = mongoose.model('InfrastructureAsset', InfrastructureAssetSchema);
