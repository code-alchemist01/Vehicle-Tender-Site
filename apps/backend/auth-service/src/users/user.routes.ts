import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticateToken, requireRole } from '../common/middleware/auth.middleware';
import { validateRequest } from '../auth/auth.validation';

const router = Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticateToken, 
  validateRequest('updateProfile'), 
  UserController.updateProfile
);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', 
  authenticateToken, 
  validateRequest('changePassword'), 
  UserController.changePassword
);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', 
  authenticateToken, 
  UserController.deleteAccount
);

/**
 * @route   GET /api/users/sessions
 * @desc    Get user active sessions
 * @access  Private
 */
router.get('/sessions', 
  authenticateToken, 
  UserController.getUserSessions
);

/**
 * @route   DELETE /api/users/sessions/:sessionId
 * @desc    Revoke a specific session
 * @access  Private
 */
router.delete('/sessions/:sessionId', 
  authenticateToken, 
  UserController.revokeSession
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', 
  authenticateToken, 
  UserController.getUserStats
);

export { router as userRoutes };