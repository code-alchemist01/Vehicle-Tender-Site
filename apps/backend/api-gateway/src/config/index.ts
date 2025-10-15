import dotenv from 'dotenv';

dotenv.config();

export interface ServiceConfig {
  name: string;
  url: string;
  healthPath: string;
  timeout: number;
}

export interface Config {
  server: {
    PORT: number;
    HOST: string;
  };
  env: string;
  corsOrigins: string[];
  cors: {
    origins: string[];
  };
  jwt: {
    secret: string;
    refreshSecret: string; // ✅ EKLE
    expiresIn: string; // ✅ EKLE
  };
  redis: { // ✅ EKLE
    host: string;
    port: number;
    password?: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  services: {
    auth: ServiceConfig;
    auction: ServiceConfig;
    bid: ServiceConfig;
    payment: ServiceConfig;
    vehicle: ServiceConfig;
    notification: ServiceConfig;
  };
  logging: {
    level: string;
    format: string;
  };
  frontend: { // ✅ EKLE
    url: string;
  };
}

const config: Config = {
  server: {
    PORT: parseInt(process.env.PORT || '4000', 10),
    HOST: process.env.HOST || '0.0.0.0',
  },
  env: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', // ✅ EKLE
    expiresIn: process.env.JWT_EXPIRES_IN || '7d', // ✅ EKLE
  },
  
  redis: { // ✅ EKLE
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  },
  
  services: {
    auth: {
      name: 'auth-service',
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      healthPath: '/api/v1/auth/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
    auction: {
      name: 'auction-service',
      url: process.env.AUCTION_SERVICE_URL || 'http://localhost:4003',
      healthPath: '/api/v1/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
    bid: {
      name: 'bid-service',
      url: process.env.BID_SERVICE_URL || 'http://localhost:4004',
      healthPath: '/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
    payment: {
      name: 'payment-service',
      url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:4005',
      healthPath: '/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
    vehicle: {
      name: 'vehicle-service',
      url: process.env.VEHICLE_SERVICE_URL || 'http://localhost:4002',
      healthPath: '/api/v1/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
    notification: {
      name: 'notification-service',
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4006',
      healthPath: '/notifications/health',
      timeout: parseInt(process.env.SERVICE_TIMEOUT || '30000', 10),
    },
  },
  
  frontend: { // ✅ EKLE
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
};

export default config;
export { config };