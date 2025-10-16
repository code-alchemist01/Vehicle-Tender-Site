import { Router } from 'express';
import { createAuctionProxy } from '../middleware/proxy';
import { generalLimiter, publicLimiter } from '../middleware/rateLimiter';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';
import logger from '../utils/logger';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config';

const router = Router();

// Health endpoint (public, no authentication required) - special handling
router.get('/health', generalLimiter, createProxyMiddleware({
  target: config.services.auction.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/auctions/health': '/health'
  },
  timeout: 60000,
  proxyTimeout: 60000,
  onProxyReq: (proxyReq, req) => {
    logger.info('Proxying health request to auction service:', {
      originalPath: req.path,
      rewrittenPath: '/health',
      target: config.services.auction.url
    });
  }
}));

// Public routes (no authentication required)
router.get('/', publicLimiter, createAuctionProxy()); // List auctions
router.get('/search', publicLimiter, createAuctionProxy()); // Search auctions
router.get('/featured', publicLimiter, createAuctionProxy()); // Featured auctions
router.get('/categories', publicLimiter, createAuctionProxy()); // Auction categories
router.get('/:id', publicLimiter, createAuctionProxy()); // Get auction details

// Optional auth routes (better experience with auth)
router.get('/:id/bids', optionalAuth, generalLimiter, createAuctionProxy()); // Get auction bids
router.get('/:id/history', optionalAuth, generalLimiter, createAuctionProxy()); // Get auction history

// Protected routes (authentication required)
router.use('/create', authenticateToken, requireRole(['seller', 'admin']));
router.post('/create', generalLimiter, createAuctionProxy()); // Create auction

router.use('/:id/update', authenticateToken, requireRole(['seller', 'admin']));
router.put('/:id/update', generalLimiter, createAuctionProxy()); // Update auction

router.use('/:id/delete', authenticateToken, requireRole(['seller', 'admin']));
router.delete('/:id/delete', generalLimiter, createAuctionProxy()); // Delete auction

// Seller-specific routes
router.use('/my-auctions', authenticateToken, requireRole(['seller', 'admin']));
router.get('/my-auctions', generalLimiter, createAuctionProxy()); // Get seller's auctions

router.use('/:id/end', authenticateToken, requireRole(['seller', 'admin']));
router.post('/:id/end', generalLimiter, createAuctionProxy()); // End auction early

router.use('/:id/extend', authenticateToken, requireRole(['seller', 'admin']));
router.post('/:id/extend', generalLimiter, createAuctionProxy()); // Extend auction

// Bidder-specific routes
router.use('/participated', authenticateToken);
router.get('/participated', generalLimiter, createAuctionProxy()); // Get auctions user participated in

router.use('/won', authenticateToken);
router.get('/won', generalLimiter, createAuctionProxy()); // Get auctions user won

router.use('/watching', authenticateToken);
router.get('/watching', generalLimiter, createAuctionProxy()); // Get watched auctions
router.post('/:id/watch', generalLimiter, createAuctionProxy()); // Watch auction
router.delete('/:id/watch', generalLimiter, createAuctionProxy()); // Unwatch auction

// Admin routes
router.use('/admin', authenticateToken, requireRole(['admin']));
router.get('/admin/all', generalLimiter, createAuctionProxy()); // Get all auctions (admin)
router.post('/admin/:id/approve', generalLimiter, createAuctionProxy()); // Approve auction
router.post('/admin/:id/reject', generalLimiter, createAuctionProxy()); // Reject auction
router.post('/admin/:id/suspend', generalLimiter, createAuctionProxy()); // Suspend auction
router.post('/admin/:id/restore', generalLimiter, createAuctionProxy()); // Restore auction

// Statistics routes
router.get('/stats/overview', optionalAuth, publicLimiter, createAuctionProxy()); // General stats
router.get('/stats/trending', publicLimiter, createAuctionProxy()); // Trending auctions

// Catch-all for other auction routes
router.use('*', (req, res, next) => {
  // Log unmatched routes for debugging
  logger.info(`Unmatched auction route: ${req.method} ${req.originalUrl}`);
  next();
}, generalLimiter, createAuctionProxy());

export default router;