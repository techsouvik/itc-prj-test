/**
 * Main Server Entry Point
 * Initializes Express server, Socket.io, and API routes
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { createServer, Server as HTTPServer } from 'http';
import { config } from './config';
import routes from './routes';

/**
 * Express application instance
 */
const app: Application = express();

/**
 * HTTP server for Express and Socket.io
 */
const httpServer: HTTPServer = createServer(app);

/**
 * Socket.io server for real-time updates
 */
const io: SocketIOServer = new SocketIOServer(httpServer, {
  cors: {
    origin: '*', // Configure appropriately for production
    methods: ['GET', 'POST'],
  },
});

// ============ Middleware ============

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============ Routes ============

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: Date.now(),
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: Date.now(),
  });
});

// ============ Socket.io Events ============

/**
 * Socket.io connection handler
 * Manages real-time communication with clients
 */
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle sprint update events
  socket.on('sprint:update', (data) => {
    console.log('Sprint update received:', data);
    // Broadcast to all clients
    io.emit('sprint:updated', data);
  });

  // Handle work item update events
  socket.on('workitem:update', (data) => {
    console.log('Work item update received:', data);
    // Broadcast to all clients
    io.emit('workitem:updated', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ============ Server Startup ============

/**
 * Starts the HTTP server
 */
function startServer(): void {
  const port = config.server.port;

  httpServer.listen(port, () => {
    console.log('='.repeat(50));
    console.log('Azure DevOps Sprint Manager - Backend Server');
    console.log('='.repeat(50));
    console.log(`Environment: ${config.server.nodeEnv}`);
    console.log(`Server running on port: ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`API base URL: http://localhost:${port}/api`);
    console.log(`Socket.io enabled for real-time updates`);
    console.log('='.repeat(50));
  });
}

// Start the server
startServer();

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io };
