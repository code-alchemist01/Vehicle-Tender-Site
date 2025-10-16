import { Router } from 'express';
import { createBidProxy } from '../middleware/proxy';
import { generalLimiter } from '../middleware/rateLimiter';
import { authenticateToken, requireRole } from '../middleware/auth';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

const router = Router();

// Strict rate limiter for bid placement
const bidLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 bids per minute
  message: {
    error: 'Too many bid attempts',
    message: 'Too many bid attempts from this IP, please try again after 1 minute.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Bid rate limit exceeded:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(429).json({
      error: 'Too many bid attempts',
      message: 'Too many bid attempts from this IP, please try again after 1 minute.',
      retryAfter: 60,
    });
  },
});

// Public health endpoint (no authentication required)
router.get('/health', generalLimiter, createBidProxy());

// All other bid routes require authentication
router.use(authenticateToken);

// Bid placement (most critical - strict rate limiting)
router.post('/place', bidLimiter, createBidProxy()); // Place a bid
router.post('/auto', bidLimiter, createBidProxy()); // Set auto-bid

// Bid management
router.get('/my-bids', generalLimiter, createBidProxy()); // Get user's bids
router.get('/auction/:auctionId', generalLimiter, createBidProxy()); // Get bids for auction
router.get('/:id', generalLimiter, createBidProxy()); // Get specific bid details

// Auto-bid management
router.get('/auto/my-autobids', generalLimiter, createBidProxy()); // Get user's auto-bids
router.put('/auto/:id', generalLimiter, createBidProxy()); // Update auto-bid
router.delete('/auto/:id', generalLimiter, createBidProxy()); // Cancel auto-bid

// Bid history and analytics
router.get('/history/my-history', generalLimiter, createBidProxy()); // Get user's bid history
router.get('/history/auction/:auctionId', generalLimiter, createBidProxy()); // Get auction bid history

// Bid validation and preview
router.post('/validate', generalLimiter, createBidProxy()); // Validate bid before placing
router.post('/preview', generalLimiter, createBidProxy()); // Preview bid impact

// Bid notifications and alerts
router.get('/notifications', generalLimiter, createBidProxy()); // Get bid notifications
router.post('/alerts', generalLimiter, createBidProxy()); // Set bid alerts
router.put('/alerts/:id', generalLimiter, createBidProxy()); // Update bid alert
router.delete('/alerts/:id', generalLimiter, createBidProxy()); // Delete bid alert

// Admin routes
router.use('/admin', requireRole(['admin']));
router.get('/admin/all', generalLimiter, createBidProxy()); // Get all bids (admin)
router.get('/admin/suspicious', generalLimiter, createBidProxy()); // Get suspicious bids
router.post('/admin/:id/flag', generalLimiter, createBidProxy()); // Flag bid as suspicious
router.post('/admin/:id/approve', generalLimiter, createBidProxy()); // Approve flagged bid
router.delete('/admin/:id', generalLimiter, createBidProxy()); // Delete bid (admin)

// Statistics and analytics
router.get('/stats/user', generalLimiter, createBidProxy()); // User bid statistics
router.get('/stats/auction/:auctionId', generalLimiter, createBidProxy()); // Auction bid statistics

// Real-time bid updates (WebSocket proxy)
router.get('/realtime/:auctionId', generalLimiter, createBidProxy()); // WebSocket connection for real-time bids

// Catch-all for other bid routes
router.use('*', (req, res, next) => {
  logger.info(`Unmatched bid route: ${req.method} ${req.originalUrl}`);
  next();
}, generalLimiter, createBidProxy());

export default router;