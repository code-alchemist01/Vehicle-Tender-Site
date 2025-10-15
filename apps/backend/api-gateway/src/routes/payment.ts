import { Router } from 'express';
import { createPaymentProxy } from '../middleware/proxy';
import { generalLimiter, paymentLimiter } from '../middleware/rateLimiter';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Health endpoint (public, no authentication required)
router.get('/health', generalLimiter, createPaymentProxy());

// All other payment routes require authentication
router.use(authenticateToken);

// Payment processing (strict rate limiting)
router.post('/create', paymentLimiter, createPaymentProxy()); // Create payment
router.post('/process', paymentLimiter, createPaymentProxy()); // Process payment
router.post('/confirm', paymentLimiter, createPaymentProxy()); // Confirm payment

// Payment methods management
router.get('/methods', generalLimiter, createPaymentProxy()); // Get user's payment methods
router.post('/methods', generalLimiter, createPaymentProxy()); // Add payment method
router.put('/methods/:id', generalLimiter, createPaymentProxy()); // Update payment method
router.delete('/methods/:id', generalLimiter, createPaymentProxy()); // Delete payment method
router.post('/methods/:id/set-default', generalLimiter, createPaymentProxy()); // Set default payment method

// Payment history and details
router.get('/history', generalLimiter, createPaymentProxy()); // Get payment history
router.get('/:id', generalLimiter, createPaymentProxy()); // Get payment details
router.get('/:id/receipt', generalLimiter, createPaymentProxy()); // Get payment receipt

// Refunds
router.post('/:id/refund', paymentLimiter, createPaymentProxy()); // Request refund
router.get('/refunds', generalLimiter, createPaymentProxy()); // Get refund history
router.get('/refunds/:id', generalLimiter, createPaymentProxy()); // Get refund details

// Payment disputes
router.post('/:id/dispute', generalLimiter, createPaymentProxy()); // Create dispute
router.get('/disputes', generalLimiter, createPaymentProxy()); // Get user's disputes
router.get('/disputes/:id', generalLimiter, createPaymentProxy()); // Get dispute details
router.post('/disputes/:id/evidence', generalLimiter, createPaymentProxy()); // Submit dispute evidence

// Webhooks (no authentication - handled by payment service)
router.post('/webhooks/stripe', (req, res, next) => {
  // Remove authentication for webhooks
  req.url = req.url.replace('/webhooks', '');
  next();
}, createPaymentProxy());

// Seller-specific routes
router.use('/seller', requireRole(['seller', 'admin']));
router.get('/seller/earnings', generalLimiter, createPaymentProxy()); // Get seller earnings
router.get('/seller/payouts', generalLimiter, createPaymentProxy()); // Get seller payouts
router.post('/seller/payout', paymentLimiter, createPaymentProxy()); // Request payout
router.get('/seller/transactions', generalLimiter, createPaymentProxy()); // Get seller transactions

// Admin routes
router.use('/admin', requireRole(['admin']));
router.get('/admin/all', generalLimiter, createPaymentProxy()); // Get all payments (admin)
router.get('/admin/pending', generalLimiter, createPaymentProxy()); // Get pending payments
router.get('/admin/failed', generalLimiter, createPaymentProxy()); // Get failed payments
router.post('/admin/:id/approve', generalLimiter, createPaymentProxy()); // Approve payment
router.post('/admin/:id/reject', generalLimiter, createPaymentProxy()); // Reject payment
router.get('/admin/refunds', generalLimiter, createPaymentProxy()); // Get all refunds
router.post('/admin/refunds/:id/approve', generalLimiter, createPaymentProxy()); // Approve refund
router.post('/admin/refunds/:id/reject', generalLimiter, createPaymentProxy()); // Reject refund
router.get('/admin/disputes', generalLimiter, createPaymentProxy()); // Get all disputes
router.post('/admin/disputes/:id/resolve', generalLimiter, createPaymentProxy()); // Resolve dispute

// Statistics and analytics
router.get('/stats/overview', generalLimiter, createPaymentProxy()); // Payment statistics overview
router.get('/stats/monthly', generalLimiter, createPaymentProxy()); // Monthly payment stats

// Payment validation and preview
router.post('/validate', generalLimiter, createPaymentProxy()); // Validate payment data
router.post('/calculate-fees', generalLimiter, createPaymentProxy()); // Calculate payment fees

// Catch-all for other payment routes
router.use('*', (req, res, next) => {
  logger.info(`Unmatched payment route: ${req.method} ${req.originalUrl}`);
  next();
}, generalLimiter, createPaymentProxy());

export default router;