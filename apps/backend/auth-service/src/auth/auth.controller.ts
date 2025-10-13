import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiResponseDto } from '../common/dto/response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Kullanıcı kaydı' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla kaydedildi' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kullanılıyor' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return new ApiResponseDto(true, 'Kullanıcı başarıyla kaydedildi', result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz kimlik bilgileri' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(true, 'Giriş başarılı', result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Token yenileme' })
  @ApiResponse({ status: 200, description: 'Token başarıyla yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return new ApiResponseDto(true, 'Token başarıyla yenilendi', result);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcı profili' })
  @ApiResponse({ status: 200, description: 'Profil başarıyla getirildi' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.authService.getProfile(user.id);
    return new ApiResponseDto(true, 'Profil başarıyla getirildi', profile);
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Servis sağlık kontrolü' })
  @ApiResponse({ status: 200, description: 'Servis çalışıyor' })
  async healthCheck() {
    return new ApiResponseDto(true, 'Auth Service çalışıyor', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
    });
  }
}