import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const GeoPointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], required: true, default: 'Point' },
  coordinates: {
    type: [Number],
    required: true,
    validate: coordinates => coordinates.length === 2
  },
  accuracyMeters: { type: Number, default: null, min: 0 },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['CITIZEN', 'ADMIN', 'AUTHORITY', 'SHELTER_COORDINATOR', 'RESCUE_LEAD'],
    default: 'CITIZEN'
  },
  district: {
    type: String,
    default: 'Khordha'
  },
  badgeNumber: {
    type: String,
    default: null
  },
  lastKnownLocation: {
    type: GeoPointSchema,
    default: undefined
  },
  notificationPreferences: {
    alertRadiusKm: { type: Number, default: 15, min: 1, max: 50 },
    browserAlerts: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.index({ lastKnownLocation: '2dsphere' });

// Match entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
