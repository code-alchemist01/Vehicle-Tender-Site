import { Router, Request, Response, NextFunction } from 'express';
import { createAuthProxy } from '../middleware/proxy';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Health endpoint (public, no authentication required)
router.get('/health', generalLimiter, createAuthProxy());

// Apply rate limiting to auth routes
router.use('/login', authLimiter);
router.use('/register', authLimiter);
router.use('/forgot-password', authLimiter);
router.use('/reset-password', authLimiter);

// Public routes (no authentication required)
router.use('/login', generalLimiter, createAuthProxy());
router.use('/register', generalLimiter, createAuthProxy());
router.use('/forgot-password', generalLimiter, createAuthProxy());
router.use('/reset-password', generalLimiter, createAuthProxy());
router.use('/verify-email', generalLimiter, createAuthProxy());
router.use('/resend-verification', generalLimiter, createAuthProxy());

// Protected routes (authentication required)
router.use('/profile', authenticateToken, createAuthProxy());
router.use('/change-password', authenticateToken, createAuthProxy());
router.use('/logout', authenticateToken, createAuthProxy());
router.use('/refresh-token', authenticateToken, createAuthProxy());

// Optional auth routes (authentication optional)
router.use('/me', optionalAuth, createAuthProxy());

// Admin routes (admin authentication required)
router.use('/admin', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user || user.role !== 'admin') {
    logger.warn(`Unauthorized admin access attempt by user ${user?.id || 'unknown'}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  return next();
}, createAuthProxy());

// Catch-all for other auth routes
router.use('*', generalLimiter, createAuthProxy());

export default router;