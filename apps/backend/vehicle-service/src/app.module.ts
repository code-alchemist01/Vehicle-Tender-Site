import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@/database/database.module';
import { VehiclesModule } from '@/vehicles/vehicles.module';
import { CategoriesModule } from '@/categories/categories.module';
import { AuctionsModule } from '@/auctions/auctions.module';
import { BidsModule } from '@/bids/bids.module';
import { HealthModule } from '@/health/health.module';

import { JwtStrategy } from '@/common/strategies/jwt.strategy';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Rate limiting module
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    
    // Database module
    DatabaseModule,
    
    // Feature modules
    VehiclesModule,
    CategoriesModule,
    AuctionsModule,
    BidsModule,
    HealthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}