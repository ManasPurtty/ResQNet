import mongoose from 'mongoose';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: { type: [Number], required: true }
}, { _id: false });

const ArrivalZoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  location: { type: GeoPointSchema, required: true },
  distanceKm: { type: Number, required: true, min: 0 },
  radiusKm: { type: Number, required: true, min: 0.5 },
  arrivalMinutes: { type: Number, required: true, min: 0 },
  predictedArrivalAt: { type: Date, required: true },
  population: { type: Number, default: 0, min: 0 },
  households: { type: Number, default: 0, min: 0 },
  priorityShelter: { type: String, default: '', trim: true }
}, { _id: false });

const FloodForecastSchema = new mongoose.Schema({
  forecastId: { type: String, required: true, unique: true, index: true },
  stationId: { type: String, required: true, index: true },
  stationName: { type: String, required: true },
  riverName: { type: String, required: true },
  location: { type: GeoPointSchema, required: true },
  currentLevelM: { type: Number, required: true },
  warningLevelM: { type: Number, required: true },
  dangerLevelM: { type: Number, required: true },
  riseRateMetersPerHour: { type: Number, default: 0 },
  risk: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true },
  stage: { type: String, enum: ['DANGER', 'WARNING', 'WATCH', 'NORMAL'], required: true },
  confidenceScore: { type: Number, required: true, min: 0, max: 100 },
  dangerLeadMinutes: { type: Number, default: null, min: 0 },
  predictedDangerAt: { type: Date, default: null },
  arrivalZones: [ArrivalZoneSchema],
  atRiskPopulation: { type: Number, default: 0, min: 0 },
  atRiskHouseholds: { type: Number, default: 0, min: 0 },
  source: { type: String, default: 'DEMO_SENSOR' },
  isSimulation: { type: Boolean, default: true },
  alertId: { type: String, default: null },
  active: { type: Boolean, default: true, index: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true,
  id: false,
  toJSON: {
    virtuals: true,
    transform: (_document, value) => {
      value.id = value.forecastId;
      value.location = {
        lat: value.location.coordinates[1],
        lng: value.location.coordinates[0]
      };
      value.arrivalZones = (value.arrivalZones || []).map(zone => ({
        ...zone,
        location: {
          lat: zone.location.coordinates[1],
          lng: zone.location.coordinates[0]
        }
      }));
      delete value.forecastId;
      delete value._id;
      delete value.__v;
      return value;
    }
  }
});

FloodForecastSchema.index({ active: 1, expiresAt: 1, issuedAt: -1 });
FloodForecastSchema.index({ location: '2dsphere' });

export const FloodForecast = mongoose.model('FloodForecast', FloodForecastSchema);
