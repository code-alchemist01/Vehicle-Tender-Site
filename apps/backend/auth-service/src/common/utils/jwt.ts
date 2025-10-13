const jwt = require('jsonwebtoken');
import { CustomError } from '../middleware/error.middleware';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export class JWTService {
  private static getSecrets() {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !refreshSecret) {
      throw new CustomError('JWT secrets not configured', 500);
    }
    
    return { jwtSecret, refreshSecret };
  }

  static generateTokenPair(payload: TokenPayload): TokenPair {
    const { jwtSecret, refreshSecret } = this.getSecrets();
    
    const accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: accessTokenExpiry,
      issuer: 'vehicle-auction-auth',
      audience: 'vehicle-auction-platform'
    });
    
    const refreshToken = jwt.sign(
      { userId: payload.userId, sessionId: payload.sessionId },
      refreshSecret,
      {
        expiresIn: refreshTokenExpiry,
        issuer: 'vehicle-auction-auth',
        audience: 'vehicle-auction-platform'
      }
    );
    
    // Calculate expiry times in seconds
    const accessExpiresIn = this.parseExpiry(accessTokenExpiry);
    const refreshExpiresIn = this.parseExpiry(refreshTokenExpiry);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: refreshExpiresIn
    };
  }

  static verifyAccessToken(token: string): TokenPayload {
    const { jwtSecret } = this.getSecrets();
    
    try {
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'vehicle-auction-auth',
        audience: 'vehicle-auction-platform'
      }) as any;
      
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Access token expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid access token', 401);
      }
      throw error;
    }
  }

  static verifyRefreshToken(token: string): { userId: string; sessionId: string } {
    const { refreshSecret } = this.getSecrets();
    
    try {
      const decoded = jwt.verify(token, refreshSecret, {
        issuer: 'vehicle-auction-auth',
        audience: 'vehicle-auction-platform'
      }) as any;
      
      return {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new CustomError('Refresh token expired', 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  static getTokenExpiry(expiresIn: string): Date {
    const seconds = this.parseExpiry(expiresIn);
    return new Date(Date.now() + seconds * 1000);
  }

  private static parseExpiry(expiry: string): number {
    // Parse expiry string like "15m", "7d", "1h" to seconds
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new CustomError('Invalid expiry format', 500);
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: throw new CustomError('Invalid expiry unit', 500);
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}