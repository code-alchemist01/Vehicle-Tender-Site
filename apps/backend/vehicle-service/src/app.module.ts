import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@/database/database.module';
import { VehiclesModule } from '@/vehicles/vehicles.module';
import { CategoriesModule } from '@/categories/categories.module';

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
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    
    // Database module
    DatabaseModule,
    
    // Feature modules
    VehiclesModule,
    CategoriesModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}