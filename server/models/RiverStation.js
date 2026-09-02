import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: {
    type: [Number],
    required: true,
    validate: coordinates => coordinates.length === 2
  }
}, { _id: false });

const DownstreamCommunitySchema = new mongoose.Schema({
  zoneId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  location: { type: GeoPointSchema, required: true },
  distanceKm: { type: Number, required: true, min: 0 },
  radiusKm: { type: Number, required: true, min: 0.5, max: 50 },
  population: { type: Number, default: 0, min: 0 },
  households: { type: Number, default: 0, min: 0 },
  priorityShelter: { type: String, default: '', trim: true }
}, { _id: false });

const RiverStationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  riverName: { type: String, required: true, trim: true },
  basinName: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  country: { type: String, default: 'India', trim: true },
  location: { type: GeoPointSchema, required: true },
  currentLevelM: { type: Number, required: true, min: 0 },
  warningLevelM: { type: Number, required: true, min: 0 },
  dangerLevelM: { type: Number, required: true, min: 0 },
  riseRateMetersPerHour: { type: Number, default: 0 },
  rainfall24hMm: { type: Number, default: 0, min: 0 },
  trend: {
    type: String,
    enum: ['RISING_RAPIDLY', 'RISING', 'STEADY', 'FALLING'],
    default: 'STEADY'
  },
  waveSpeedKmh: { type: Number, default: 24, min: 1, max: 100 },
  source: { type: String, default: 'DEMO_SENSOR', trim: true },
  sourceUrl: { type: String, default: '', trim: true },
  isSimulation: { type: Boolean, default: true },
  lastObservedAt: { type: Date, default: Date.now },
  downstreamCommunities: [DownstreamCommunitySchema]
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.stationId;
      value.location = {
        lat: value.location.coordinates[1],
        lng: value.location.coordinates[0]
      };
      value.downstreamCommunities = (value.downstreamCommunities || []).map(zone => ({
        ...zone,
        location: {
          lat: zone.location.coordinates[1],
          lng: zone.location.coordinates[0]
        }
      }));
      delete value.stationId;
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

RiverStationSchema.index({ location: '2dsphere' });

export const RiverStation = mongoose.model('RiverStation', RiverStationSchema);
