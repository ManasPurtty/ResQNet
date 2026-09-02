import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDB, getDbStatus, inMemoryUsers } from './config/db.js';
import { seedDemoAdmin } from './config/seedDemoAdmin.js';
import { User } from './models/User.js';
import apiRouter from './routes/api.js';
import routeOptimizationRouter from './routes/routeOptimization.js';
import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import communityAlertsRouter from './routes/communityAlerts.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://resqnet-1-kaxz.onrender.com',
  ...(process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
];

const corsOptions = {
  origin(origin, callback) {
    // Non-browser clients do not send an Origin header.
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Cross-Origin Resource Sharing configuration
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Real-Time Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const socketJwtSecret = process.env.JWT_SECRET || 'resqnet_super_secret_jwt_key_2026_odisha';

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, socketJwtSecret);
    const user = getDbStatus()
      ? await User.findById(decoded.id).select('_id role')
      : inMemoryUsers.find(candidate => String(candidate._id) === String(decoded.id));

    if (!user) return next(new Error('User not found'));
    socket.userId = String(user._id);
    socket.userRole = user.role;
    next();
  } catch {
    next(new Error('Invalid or expired authentication token'));
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  socket.join(`role:${socket.userRole}`);
  console.log(`[ResQNet Real-Time] Command Center client connected: ${socket.id}`);

  socket.on('join-eoc', (room) => {
    socket.join(room || 'odisha-eoc');
    console.log(`[ResQNet] Client joined room: ${room}`);
  });

  socket.on('dispatch-rescue', (data) => {
    console.log(`[ResQNet] Live dispatch event:`, data);
    io.emit('rescue-dispatched', data);
  });

  socket.on('activate-shelter', (data) => {
    console.log(`[ResQNet] Shelter activated:`, data);
    io.emit('shelter-status-changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`[ResQNet] Client disconnected: ${socket.id}`);
  });
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ResQNet Odisha Disaster Response Command Layer',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Register API, Auth, and Route Optimization Routers
app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/community-alerts', communityAlertsRouter);
app.use('/api', apiRouter);
app.use('/api/routes', routeOptimizationRouter);

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  const connection = await connectDB();

  if (connection) {
    try {
      await seedDemoAdmin();
    } catch (error) {
      console.error(`Demo admin seed failed: ${error.message}`);
    }
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  ResQNet — Odisha Disaster Response Backend Server`);
    console.log(`  API running on: http://localhost:${PORT}`);
    console.log(`  Route Optimizer: POST http://localhost:${PORT}/api/routes/optimize`);
    console.log(`  Real-time Socket.IO: ws://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
};

startServer().catch((error) => {
  console.error(`ResQNet server startup failed: ${error.message}`);
  process.exit(1);
});
