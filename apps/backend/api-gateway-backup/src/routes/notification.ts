import { Router } from 'express';
import { createNotificationProxy } from '../middleware/proxy';
import { generalLimiter } from '../middleware/rateLimiter';
import { authenticateToken, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Public health endpoint (no authentication required)
router.get('/health', generalLimiter, createNotificationProxy());

// All notification routes require authentication
router.use(authenticateToken);

// User notifications
router.get('/', generalLimiter, createNotificationProxy()); // Get user notifications
router.get('/unread', generalLimiter, createNotificationProxy()); // Get unread notifications
router.get('/count', generalLimiter, createNotificationProxy()); // Get notification count
router.get('/:id', generalLimiter, createNotificationProxy()); // Get specific notification

// Notification actions
router.post('/:id/read', generalLimiter, createNotificationProxy()); // Mark notification as read
router.post('/mark-all-read', generalLimiter, createNotificationProxy()); // Mark all as read
router.delete('/:id', generalLimiter, createNotificationProxy()); // Delete notification
router.delete('/clear-all', generalLimiter, createNotificationProxy()); // Clear all notifications

// Notification preferences
router.get('/preferences', generalLimiter, createNotificationProxy()); // Get notification preferences
router.put('/preferences', generalLimiter, createNotificationProxy()); // Update notification preferences
router.post('/preferences/reset', generalLimiter, createNotificationProxy()); // Reset to default preferences

// Push notification management
router.post('/push/subscribe', generalLimiter, createNotificationProxy()); // Subscribe to push notifications
router.post('/push/unsubscribe', generalLimiter, createNotificationProxy()); // Unsubscribe from push notifications
router.get('/push/status', generalLimiter, createNotificationProxy()); // Get push notification status

// Email notification management
router.post('/email/subscribe', generalLimiter, createNotificationProxy()); // Subscribe to email notifications
router.post('/email/unsubscribe', generalLimiter, createNotificationProxy()); // Unsubscribe from email notifications
router.get('/email/status', generalLimiter, createNotificationProxy()); // Get email notification status

// SMS notification management
router.post('/sms/subscribe', generalLimiter, createNotificationProxy()); // Subscribe to SMS notifications
router.post('/sms/unsubscribe', generalLimiter, createNotificationProxy()); // Unsubscribe from SMS notifications
router.get('/sms/status', generalLimiter, createNotificationProxy()); // Get SMS notification status
router.post('/sms/verify-phone', generalLimiter, createNotificationProxy()); // Verify phone number

// Real-time notifications (WebSocket)
router.get('/realtime', generalLimiter, createNotificationProxy()); // WebSocket connection for real-time notifications

// Notification templates (for sellers and admins)
router.use('/templates', requireRole(['seller', 'admin']));
router.get('/templates', generalLimiter, createNotificationProxy()); // Get notification templates
router.get('/templates/:id', generalLimiter, createNotificationProxy()); // Get specific template

// Custom notifications (for sellers)
router.use('/custom', requireRole(['seller', 'admin']));
router.post('/custom/send', generalLimiter, createNotificationProxy()); // Send custom notification
router.get('/custom/history', generalLimiter, createNotificationProxy()); // Get custom notification history

// Admin routes
router.use('/admin', requireRole(['admin']));
router.get('/admin/all', generalLimiter, createNotificationProxy()); // Get all notifications (admin)
router.get('/admin/stats', generalLimiter, createNotificationProxy()); // Get notification statistics
router.post('/admin/broadcast', generalLimiter, createNotificationProxy()); // Broadcast notification to all users
router.post('/admin/send-to-users', generalLimiter, createNotificationProxy()); // Send notification to specific users
router.get('/admin/templates', generalLimiter, createNotificationProxy()); // Get all templates (admin)
router.post('/admin/templates', generalLimiter, createNotificationProxy()); // Create notification template
router.put('/admin/templates/:id', generalLimiter, createNotificationProxy()); // Update notification template
router.delete('/admin/templates/:id', generalLimiter, createNotificationProxy()); // Delete notification template

// Notification analytics
router.get('/analytics/delivery-stats', generalLimiter, createNotificationProxy()); // Get delivery statistics
router.get('/analytics/engagement', generalLimiter, createNotificationProxy()); // Get engagement statistics

// Webhook endpoints for external services
router.post('/webhooks/email-status', (req, res, next) => {
  // Remove authentication for webhooks
  req.url = req.url.replace('/webhooks', '');
  next();
}, createNotificationProxy());

router.post('/webhooks/sms-status', (req, res, next) => {
  // Remove authentication for webhooks
  req.url = req.url.replace('/webhooks', '');
  next();
}, createNotificationProxy());

// Catch-all for other notification routes
router.use('*', (req, res, next) => {
  logger.info(`Unmatched notification route: ${req.method} ${req.originalUrl}`);
  next();
}, generalLimiter, createNotificationProxy());

export default router;