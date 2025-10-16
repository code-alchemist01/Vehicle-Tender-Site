import { Router } from 'express';
import { createVehicleProxy } from '../middleware/proxy';
import { generalLimiter, publicLimiter } from '../middleware/rateLimiter';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';
import logger from '../utils/logger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config';

const router = Router();

// Health endpoint (public, no authentication required) - special handling
router.get('/health', generalLimiter, createProxyMiddleware({
  target: config.services.vehicle.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/vehicles/health': '/api/v1/health'
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req) => {
    logger.info('Proxying health request to vehicle service:', {
      originalPath: req.path,
      rewrittenPath: '/api/v1/health',
      target: config.services.vehicle.url
    });
  }
}));

// Public routes (no authentication required)
router.get('/', publicLimiter, createVehicleProxy()); // List vehicles
router.get('/search', publicLimiter, createVehicleProxy()); // Search vehicles
router.get('/featured', publicLimiter, createVehicleProxy()); // Featured vehicles
router.get('/categories', publicLimiter, createVehicleProxy()); // Vehicle categories
router.get('/makes', publicLimiter, createVehicleProxy()); // Vehicle makes
router.get('/models/:make', publicLimiter, createVehicleProxy()); // Vehicle models by make
router.get('/:id', publicLimiter, createVehicleProxy()); // Get vehicle details
router.get('/:id/images', publicLimiter, createVehicleProxy()); // Get vehicle images
router.get('/:id/specifications', publicLimiter, createVehicleProxy()); // Get vehicle specs

// Optional auth routes (better experience with auth)
router.get('/:id/similar', optionalAuth, publicLimiter, createVehicleProxy()); // Get similar vehicles
router.get('/:id/history', optionalAuth, generalLimiter, createVehicleProxy()); // Get vehicle history

// Protected routes (authentication required)
router.use('/create', authenticateToken, requireRole(['seller', 'admin']));
router.post('/create', generalLimiter, createVehicleProxy()); // Create vehicle

router.use('/:id/update', authenticateToken, requireRole(['seller', 'admin']));
router.put('/:id/update', generalLimiter, createVehicleProxy()); // Update vehicle

router.use('/:id/delete', authenticateToken, requireRole(['seller', 'admin']));
router.delete('/:id/delete', generalLimiter, createVehicleProxy()); // Delete vehicle

// Image management (seller/admin only)
router.use('/:id/images/upload', authenticateToken, requireRole(['seller', 'admin']));
router.post('/:id/images/upload', generalLimiter, createVehicleProxy()); // Upload vehicle images

router.use('/:id/images/:imageId/delete', authenticateToken, requireRole(['seller', 'admin']));
router.delete('/:id/images/:imageId/delete', generalLimiter, createVehicleProxy()); // Delete vehicle image

router.use('/:id/images/reorder', authenticateToken, requireRole(['seller', 'admin']));
router.put('/:id/images/reorder', generalLimiter, createVehicleProxy()); // Reorder vehicle images

// Seller-specific routes
router.use('/my-vehicles', authenticateToken, requireRole(['seller', 'admin']));
router.get('/my-vehicles', generalLimiter, createVehicleProxy()); // Get seller's vehicles

router.use('/:id/publish', authenticateToken, requireRole(['seller', 'admin']));
router.post('/:id/publish', generalLimiter, createVehicleProxy()); // Publish vehicle

router.use('/:id/unpublish', authenticateToken, requireRole(['seller', 'admin']));
router.post('/:id/unpublish', generalLimiter, createVehicleProxy()); // Unpublish vehicle

// User favorites and watchlist
router.use('/favorites', authenticateToken);
router.get('/favorites', generalLimiter, createVehicleProxy()); // Get user's favorite vehicles
router.post('/:id/favorite', generalLimiter, createVehicleProxy()); // Add to favorites
router.delete('/:id/favorite', generalLimiter, createVehicleProxy()); // Remove from favorites

// Vehicle valuation and pricing
router.post('/valuation', optionalAuth, generalLimiter, createVehicleProxy()); // Get vehicle valuation
router.get('/pricing/market-analysis', publicLimiter, createVehicleProxy()); // Market price analysis

// Vehicle reports and inspections
router.get('/:id/report', optionalAuth, generalLimiter, createVehicleProxy()); // Get vehicle report
router.post('/:id/inspection', authenticateToken, requireRole(['seller', 'admin']), generalLimiter, createVehicleProxy()); // Schedule inspection

// Admin routes
router.use('/admin', authenticateToken, requireRole(['admin']));
router.get('/admin/all', generalLimiter, createVehicleProxy()); // Get all vehicles (admin)
router.get('/admin/pending', generalLimiter, createVehicleProxy()); // Get pending vehicles
router.post('/admin/:id/approve', generalLimiter, createVehicleProxy()); // Approve vehicle
router.post('/admin/:id/reject', generalLimiter, createVehicleProxy()); // Reject vehicle
router.post('/admin/:id/feature', generalLimiter, createVehicleProxy()); // Feature vehicle
router.post('/admin/:id/unfeature', generalLimiter, createVehicleProxy()); // Unfeature vehicle

// Statistics and analytics
router.get('/stats/overview', optionalAuth, publicLimiter, createVehicleProxy()); // Vehicle statistics
router.get('/stats/popular', publicLimiter, createVehicleProxy()); // Popular vehicles
router.get('/stats/trending', publicLimiter, createVehicleProxy()); // Trending vehicles

// Vehicle comparison
router.post('/compare', optionalAuth, generalLimiter, createVehicleProxy()); // Compare vehicles

// Catch-all for other vehicle routes
router.use('*', (req, res, next) => {
  logger.info(`Unmatched vehicle route: ${req.method} ${req.originalUrl}`);
  next();
}, generalLimiter, createVehicleProxy());

export default router;