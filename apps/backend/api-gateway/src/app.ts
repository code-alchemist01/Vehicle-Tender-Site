import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

import config from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

// ✅ YÖNTEM 3: Express routing sistemini tamamen bypass et
// Socket.IO için özel handler ekle (tüm routing'den önce)
app.use((req, res, next) => {
  if (req.url.startsWith('/ws/')) {
    console.log('🔌 BYPASS: Socket.IO request detected, skipping Express routing');
    // Socket.IO'nun kendi handler'ını kullanması için request'i pas geç
    return next('route');
  }
  next();
});

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"], // ✅ WebSocket support
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Correlation-ID',
    'X-User-ID',
    'X-User-Role'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Add correlation ID to requests
app.use((req, res, next) => {
  if (!req.headers['x-correlation-id']) {
    req.headers['x-correlation-id'] = `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  res.setHeader('X-Correlation-ID', req.headers['x-correlation-id'] as string);
  next();
});

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.env,
  });
});

// Apply rate limiting to all routes except health checks and Socket.IO
app.use((req, res, next) => {
  // Skip rate limiting for health checks and Socket.IO endpoints
  if (req.path.startsWith('/health') || req.path.startsWith('/socket.io/')) {
    return next();
  }
  return generalLimiter(req, res, next);
});

// Serve test-websocket.html as static file
app.get('/test-websocket.html', (req, res) => {
  const filePath = path.join(__dirname, '..', 'test-websocket.html');
  res.sendFile(filePath);
});

// ✅ CRITICAL FIX: Socket.IO endpoint handler - MUST be before other routes
app.all('/socket.io/*', (req, res, next) => {
  console.log('🔌 Socket.IO request intercepted:', req.method, req.url);
  const io = app.get('socketio');
  if (io && io.engine) {
    console.log('✅ Forwarding to Socket.IO engine');
    // Let Socket.IO handle the request
    io.engine.handleRequest(req, res);
  } else {
    console.log('❌ Socket.IO not found on app');
    next();
  }
});

// API routes
app.use('/', routes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;