import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { PasswordService } from '../common/utils/password';
import { JWTService } from '../common/utils/jwt';
import { CustomError, asyncHandler } from '../common/middleware/error.middleware';
import { AuthenticatedRequest } from '../common/middleware/auth.middleware';
import { logger } from '../common/utils/logger';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new CustomError('Email, password, first name, and last name are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new CustomError('Invalid email format', 400);
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new CustomError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Verify password
    const isPasswordValid = await PasswordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('Invalid email or password', 401);
    }

    // Create session
    const sessionExpiry = JWTService.getTokenExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: '', // Will be updated with refresh token
        expiresAt: sessionExpiry,
        userAgent: req.get('User-Agent') || null,
        ipAddress: req.ip || null
      }
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id
    };

    const tokens = JWTService.generateTokenPair(tokenPayload);

    // Update session with refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { 
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

    // Set HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: tokens.expiresIn * 1000
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: tokens.refreshExpiresIn * 1000
    });

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new CustomError('Refresh token required', 401);
    }

    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Find active session
    const session = await prisma.session.findFirst({
      where: {
        id: decoded.sessionId,
        userId: decoded.userId,
        refreshToken: refreshToken,
        isActive: true,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!session) {
      throw new CustomError('Invalid or expired refresh token', 401);
    }

    if (!session.user.isActive) {
      throw new CustomError('Account is deactivated', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id
    };

    const tokens = JWTService.generateTokenPair(tokenPayload);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        updatedAt: new Date()
      }
    });

    // Update cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: tokens.expiresIn * 1000
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: tokens.refreshExpiresIn * 1000
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (refreshToken) {
      // Deactivate session
      await prisma.session.updateMany({
        where: {
          refreshToken: refreshToken,
          isActive: true
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });

  static logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Deactivate all user sessions
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

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    logger.info(`User logged out from all devices: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  });

  static verifyToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  });
}