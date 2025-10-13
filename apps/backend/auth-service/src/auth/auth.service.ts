import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordValidator } from '../common/utils/password-validator';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Hesabınız devre dışı bırakılmış');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      // Update last login
      await this.usersService.updateLastLogin(user.id);

      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };

      const accessToken = this.jwtService.sign(payload);
      
      // Generate secure refresh token
      const refreshTokenValue = crypto.randomBytes(64).toString('hex');
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

      // Store refresh token in database
      await this.prisma.refreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: user.id,
          expiresAt: refreshTokenExpiry,
        },
      });

      // Log successful login
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          success: true,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken: refreshTokenValue,
        },
      };
    } catch (error) {
      // Log failed login attempt
      if (loginDto.email) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (user) {
          await this.prisma.loginHistory.create({
            data: {
              userId: user.id,
              ipAddress,
              userAgent,
              success: false,
            },
          });
        }
      }
      throw error;
    }
  }

  async register(registerDto: RegisterDto, ipAddress?: string, userAgent?: string) {
    // Validate password strength
    const passwordValidation = PasswordValidator.validate(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Şifre güvenlik gereksinimlerini karşılamıyor',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
    }

    const user = await this.usersService.create(registerDto);

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);
    
    // Generate secure refresh token
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Log successful registration/login
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        success: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken: refreshTokenValue,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    // Find the refresh token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Geçersiz refresh token');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedException('Token iptal edilmiş');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Token süresi dolmuş');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Hesap devre dışı');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Generate new tokens
    const payload = { 
      email: storedToken.user.email, 
      sub: storedToken.user.id, 
      role: storedToken.user.role 
    };

    const newAccessToken = this.jwtService.sign(payload);
    
    // Generate new refresh token
    const newRefreshTokenValue = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    // Store new refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: newRefreshTokenValue,
        userId: storedToken.user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    return {
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        firstName: storedToken.user.firstName,
        lastName: storedToken.user.lastName,
        role: storedToken.user.role,
      },
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenValue,
      },
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.userId !== userId) {
        return null;
      }

      if (storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        return null;
      }

      if (!storedToken.user.isActive) {
        return null;
      }

      return storedToken.user;
    } catch (error) {
      return null;
    }
  }

  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      // If refresh token is provided, revoke that specific token
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (storedToken) {
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { isRevoked: true },
        });
      }
    } else if (userId) {
      // If only userId is provided, revoke all active tokens for the user
      await this.prisma.refreshToken.updateMany({
        where: { 
          userId,
          isRevoked: false,
        },
        data: { isRevoked: true },
      });
    }

    return { message: 'Başarıyla çıkış yapıldı' };
  }

  async logoutAllDevices(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    return { message: 'Tüm cihazlardan çıkış yapıldı' };
  }

  async getActiveTokens(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLoginHistory(userId: string, limit = 10) {
    return this.prisma.loginHistory.findMany({
      where: { userId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deletedCount: result.count };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Get user
    const user = await this.usersService.findOne(userId, true);
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      // Log failed password change attempt
      await this.prisma.loginHistory.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          success: false,
          action: 'PASSWORD_CHANGE',
        },
      });
      throw new UnauthorizedException('Mevcut şifre yanlış');
    }

    // Validate new password strength
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Yeni şifre güvenlik gereksinimlerini karşılamıyor',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Yeni şifre mevcut şifreden farklı olmalıdır');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.usersService.updatePassword(userId, hashedNewPassword);

    // Revoke all existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    // Log successful password change
    await this.prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success: true,
        action: 'PASSWORD_CHANGE',
      },
    });

    return { message: 'Şifre başarıyla değiştirildi. Tüm cihazlardan çıkış yapıldı.' };
  }

  async validatePasswordStrength(password: string) {
    return PasswordValidator.validate(password);
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}