import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  district: { type: String, required: true, trim: true },
  address: { type: String, default: '', trim: true }
}, { _id: false });

const ReporterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true }
}, { _id: false });

const IncidentReportSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  clusterId: {
    type: String,
    required: true,
    index: true
  },
  isCorroboratingReport: { type: Boolean, default: false },
  title: { type: String, required: true, trim: true },
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
  confidenceScore: { type: Number, default: 94, min: 0, max: 100 },
  location: { type: LocationSchema, required: true },
  peopleAffected: { type: Number, default: 1, min: 0 },
  peopleTrapped: { type: Number, default: 0, min: 0 },
  vulnerablePeople: { type: Number, default: 0, min: 0 },
  waitingTimeMinutes: { type: Number, default: 1, min: 0 },
  reportCount: { type: Number, default: 1, min: 1 },
  status: {
    type: String,
    enum: ['UNASSIGNED', 'RESOURCE_ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESOLVED'],
    default: 'UNASSIGNED'
  },
  assignedResourceId: { type: String, default: null },
  assignedShelterId: { type: String, default: null },
  description: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  reporter: { type: ReporterSchema, required: true },
  reportedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.incidentId;
      delete value.incidentId;
      delete value._id;
      delete value.__v;
      delete value.reportedBy;
      return value;
    }
  }
});

IncidentReportSchema.index({ reportedBy: 1, reportedAt: -1 });

export const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);
