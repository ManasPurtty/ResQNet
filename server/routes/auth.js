import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { inMemoryUsers, getDbStatus } from '../config/db.js';
import { syncNotificationsForUser } from '../services/communityAlertService.js';
import { geoPoint, isValidCoordinate } from '../utils/geo.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'resqnet_super_secret_jwt_key_2026_odisha';
const JWT_EXPIRES_IN = '7d';

// Generate JWT Token helper
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Middleware to protect routes & extract user from token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route (No token)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getDbStatus()) {
      req.user = await User.findById(decoded.id).select('-password');
    } else {
      req.user = inMemoryUsers.find(u => u._id === decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

// ===================================================
// @route   POST /api/auth/register
// @desc    Register a new Citizen or Authority User
// @access  Public
// ===================================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'CITIZEN', district = 'Khordha', badgeNumber } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone number, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (getDbStatus()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        phone,
        password,
        role: role.toUpperCase(),
        district,
        badgeNumber: badgeNumber || null
      });

      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          badgeNumber: user.badgeNumber
        }
      });
    } else {
      // In-Memory Fallback Mode
      const existingUser = inMemoryUsers.find(u => u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
        phone,
        passwordHash: bcrypt.hashSync(password, 10),
        role: role.toUpperCase(),
        district,
        badgeNumber: badgeNumber || null,
        createdAt: new Date().toISOString()
      };

      inMemoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.role);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully (Memory storage)',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          district: newUser.district,
          badgeNumber: newUser.badgeNumber
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server registration error' });
  }
});

// ===================================================
// @route   POST /api/auth/login
// @desc    Authenticate User/Admin & return JWT token
// @access  Public
// ===================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (getDbStatus()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password. Authentication failed.' });
      }

      // Check role constraint if specified
      if (role && user.role !== role && role === 'ADMIN' && user.role === 'CITIZEN') {
        return res.status(403).json({ success: false, message: 'Access denied: Requires Authority or Admin privileges' });
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          badgeNumber: user.badgeNumber
        }
      });
    } else {
      // In-Memory Fallback Login
      const user = inMemoryUsers.find(u => u.email === normalizedEmail);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Account not found.' });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password. Authentication failed.' });
      }

      if (role && user.role !== role && role === 'ADMIN' && user.role === 'CITIZEN') {
        return res.status(403).json({ success: false, message: 'Access denied: Requires Authority or Admin privileges' });
      }

      const token = generateToken(user._id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          district: user.district,
          badgeNumber: user.badgeNumber
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server login error' });
  }
});

// ===================================================
// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private (JWT protected)
// ===================================================
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      district: req.user.district,
      badgeNumber: req.user.badgeNumber,
      lastKnownLocation: req.user.lastKnownLocation
        ? {
            lat: req.user.lastKnownLocation.coordinates[1],
            lng: req.user.lastKnownLocation.coordinates[0],
            accuracyMeters: req.user.lastKnownLocation.accuracyMeters,
            updatedAt: req.user.lastKnownLocation.updatedAt
          }
        : null,
      notificationPreferences: req.user.notificationPreferences
    }
  });
});

// Store the user's opt-in location so active nearby warnings can be delivered.
router.patch('/location', protect, async (req, res) => {
  try {
    const latitude = Number(req.body.lat);
    const longitude = Number(req.body.lng);
    const accuracyMeters = Number(req.body.accuracyMeters);
    const alertRadiusKm = Number(req.body.alertRadiusKm);

    if (!isValidCoordinate(latitude, longitude)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
    }

    if (!getDbStatus()) {
      req.user.lastKnownLocation = {
        ...geoPoint(latitude, longitude),
        accuracyMeters: Number.isFinite(accuracyMeters) ? Math.max(0, accuracyMeters) : null,
        updatedAt: new Date()
      };
      return res.json({ success: true, location: req.user.lastKnownLocation, notificationsSynced: 0 });
    }

    const user = await User.findById(req.user._id);
    user.lastKnownLocation = {
      ...geoPoint(latitude, longitude),
      accuracyMeters: Number.isFinite(accuracyMeters) ? Math.max(0, accuracyMeters) : null,
      updatedAt: new Date()
    };

    if (Number.isFinite(alertRadiusKm)) {
      user.notificationPreferences.alertRadiusKm = Math.min(50, Math.max(1, alertRadiusKm));
    }

    await user.save();
    const notificationsSynced = await syncNotificationsForUser(user, req.io);

    res.json({
      success: true,
      location: {
        lat: latitude,
        lng: longitude,
        accuracyMeters: user.lastKnownLocation.accuracyMeters,
        updatedAt: user.lastKnownLocation.updatedAt
      },
      notificationPreferences: user.notificationPreferences,
      notificationsSynced
    });
  } catch (error) {
    console.error('Update user location error:', error);
    res.status(500).json({ success: false, message: 'Unable to save your alert location' });
  }
});

// ===================================================
// @route   GET /api/auth/status
// @desc    Check database and auth engine health
// @access  Public
// ===================================================
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    dbEngine: getDbStatus() ? 'MongoDB' : 'In-Memory (Seeded)',
    registeredUsersCount: getDbStatus() ? 'MongoDB Live' : inMemoryUsers.length,
    jwtSecurity: 'Active (HMAC-SHA256)'
  });
});

export default router;
