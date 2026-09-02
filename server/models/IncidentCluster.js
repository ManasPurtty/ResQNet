import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: coordinates => coordinates.length === 2,
      message: 'GeoJSON coordinates must contain longitude and latitude'
    }
  }
}, { _id: false });

const IncidentClusterSchema = new mongoose.Schema({
  clusterId: { type: String, required: true, unique: true, index: true },
  type: {
    type: String,
    enum: ['FLOOD', 'CYCLONE', 'LANDSLIDE', 'BUILDING_DAMAGE', 'ROAD_BLOCKAGE', 'MEDICAL', 'FIRE', 'OTHER'],
    required: true
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    required: true
  },
  priorityScore: { type: Number, required: true, min: 0, max: 100 },
  confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  location: { type: GeoPointSchema, required: true },
  locationName: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  address: { type: String, default: '', trim: true },
  reportCount: { type: Number, default: 1, min: 1 },
  peopleAffected: { type: Number, default: 1, min: 0 },
  peopleTrapped: { type: Number, default: 0, min: 0 },
  vulnerablePeople: { type: Number, default: 0, min: 0 },
  reporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['UNASSIGNED', 'RESOURCE_ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESOLVED'],
    default: 'UNASSIGNED'
  },
  responderStatus: {
    type: String,
    enum: ['AWAITING_ASSIGNMENT', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'RESCUE_IN_PROGRESS', 'COMPLETED'],
    default: 'AWAITING_ASSIGNMENT'
  },
  assignedResourceId: { type: String, default: null },
  assignedResourceName: { type: String, default: null },
  assignedShelterId: { type: String, default: null },
  etaMinutes: { type: Number, default: null, min: 0 },
  responderLocation: { type: GeoPointSchema, default: undefined },
  firstReportedAt: { type: Date, default: Date.now },
  lastReportedAt: { type: Date, default: Date.now },
  communityAlert: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityAlert', default: null }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.clusterId;
      value.databaseBacked = true;
      value.location = {
        name: value.locationName,
        lng: value.location.coordinates[0],
        lat: value.location.coordinates[1],
        district: value.district,
        address: value.address
      };
      if (value.responderLocation) {
        value.responderLocation = {
          lng: value.responderLocation.coordinates[0],
          lat: value.responderLocation.coordinates[1]
        };
      }
      delete value.clusterId;
      delete value.locationName;
      delete value.district;
      delete value.address;
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

IncidentClusterSchema.index({ location: '2dsphere' });
IncidentClusterSchema.index({ type: 1, district: 1, lastReportedAt: -1 });

export const IncidentCluster = mongoose.model('IncidentCluster', IncidentClusterSchema);
