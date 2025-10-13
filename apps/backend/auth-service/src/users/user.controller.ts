import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { PasswordService } from '../common/utils/password';
import { CustomError, asyncHandler } from '../common/middleware/error.middleware';
import { AuthenticatedRequest } from '../common/middleware/auth.middleware';
import { logger } from '../common/utils/logger';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class UserController {
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { firstName, lastName, phone, bio, location, avatar }: UpdateProfileRequest = req.body;

    // Validate at least one field is provided
    if (!firstName && !lastName && !phone && !bio && !location && !avatar) {
      throw new CustomError('At least one field must be provided for update', 400);
    }

    // Check if phone number is already taken by another user
    if (phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone,
          id: {
            not: req.user.id
          }
        }
      });

      if (existingUser) {
        throw new CustomError('Phone number is already in use', 409);
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(avatar !== undefined && { avatar: avatar?.trim() || null }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  });

  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { currentPassword, newPassword, confirmPassword }: ChangePasswordRequest = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new CustomError('Current password, new password, and confirmation are required', 400);
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      throw new CustomError('New password and confirmation do not match', 400);
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordService.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Current password is incorrect', 400);
    }

    // Validate new password strength
    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new CustomError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Check if new password is different from current
    const isSamePassword = await PasswordService.verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw new CustomError('New password must be different from current password', 400);
    }

    // Hash new password
    const hashedNewPassword = await PasswordService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Invalidate all sessions except current one (optional - for security)
    await prisma.session.updateMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  });

  static deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { password } = req.body;

    if (!password) {
      throw new CustomError('Password is required to delete account', 400);
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Verify password
    const isPasswordValid = await PasswordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Incorrect password', 400);
    }

    // Soft delete - deactivate account instead of hard delete
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Deactivate all sessions
    await prisma.session.updateMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    logger.info(`Account deleted for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  });

  static getUserSessions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session.id,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          lastActive: session.updatedAt,
          expiresAt: session.expiresAt
        }))
      }
    });
  });

  static revokeSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      throw new CustomError('Session ID is required', 400);
    }

    // Find and deactivate the session
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: req.user.id,
        isActive: true
      }
    });

    if (!session) {
      throw new CustomError('Session not found', 404);
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    logger.info(`Session revoked for user: ${req.user.email}, sessionId: ${sessionId}`);

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  });

  static getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Get user statistics
    const [vehicleCount, auctionCount, bidCount] = await Promise.all([
      prisma.vehicle.count({
        where: { userId: req.user.id }
      }),
      prisma.auction.count({
        where: { userId: req.user.id }
      }),
      prisma.bid.count({
        where: { bidderId: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          vehiclesListed: vehicleCount,
          auctionsCreated: auctionCount,
          bidsPlaced: bidCount
        }
      }
    });
  });
}