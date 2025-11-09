import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { BidsModule } from './bids/bids.module';
import { HealthModule } from './health/health.module';
import { JwtStrategy } from './common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.BID_RATE_LIMIT_WINDOW_MS) || 60000,
        limit: parseInt(process.env.BID_RATE_LIMIT_MAX_BIDS) || 10,
      },
    ]),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl && redisUrl.startsWith('redis://')) {
          // Parse Redis URL (e.g., redis://redis:6379)
          try {
            const url = new URL(redisUrl);
            return {
              redis: {
                host: url.hostname,
                port: parseInt(url.port) || 6379,
              },
            };
          } catch (e) {
            // Fallback to default if URL parsing fails
          }
        }
        return {
      redis: {
            host: configService.get<string>('REDIS_HOST') || 'redis',
            port: parseInt(configService.get<string>('REDIS_PORT') || '6379'),
      },
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    BidsModule,
    HealthModule,
  ],
  providers: [
    JwtStrategy,
  ],
})
export class AppModule {}