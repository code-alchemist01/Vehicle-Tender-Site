import { Router } from 'express';
import authRoutes from './auth';
import auctionRoutes from './auction';
import bidRoutes from './bid';
import paymentRoutes from './payment';
import vehicleRoutes from './vehicle';
import notificationRoutes from './notification';
import healthRoutes from './health';
import websocketRoutes from './websocket';

const router = Router();

// API versioning
const API_VERSION = '/api/v1';

// Health check routes (no versioning)
router.use('/health', healthRoutes);
router.use('/api/health', healthRoutes);

// WebSocket routes
router.use('/websocket', websocketRoutes);

// Versioned API routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/auctions`, auctionRoutes);
router.use(`${API_VERSION}/bids`, bidRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/vehicles`, vehicleRoutes);
router.use(`${API_VERSION}/notifications`, notificationRoutes);

// API documentation route
router.get('/api', (req, res) => {
  res.json({
    name: 'Vehicle Auction Platform API Gateway',
    version: '1.0.0',
    description: 'API Gateway for Vehicle Auction Platform microservices',
    endpoints: {
      health: '/health',
      auth: `${API_VERSION}/auth`,
      auctions: `${API_VERSION}/auctions`,
      bids: `${API_VERSION}/bids`,
      payments: `${API_VERSION}/payments`,
      vehicles: `${API_VERSION}/vehicles`,
      notifications: `${API_VERSION}/notifications`,
    },
    documentation: {
      swagger: '/api/docs',
      postman: '/api/postman',
    },
    timestamp: new Date().toISOString(),
  });
});

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'Vehicle Auction Platform API Gateway',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/health',
    },
  });
});

export default router;