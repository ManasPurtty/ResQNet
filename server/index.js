import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import apiRouter from './routes/api.js';
import routeOptimizationRouter from './routes/routeOptimization.js';

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Real-Time Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
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

// Register API and Route Optimization Routers
app.use('/api', apiRouter);
app.use('/api/routes', routeOptimizationRouter);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ResQNet — Odisha Disaster Response Backend Server`);
  console.log(`  API running on: http://localhost:${PORT}`);
  console.log(`  Route Optimizer: POST http://localhost:${PORT}/api/routes/optimize`);
  console.log(`  Real-time Socket.IO: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
