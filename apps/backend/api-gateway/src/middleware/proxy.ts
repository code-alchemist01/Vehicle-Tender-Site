import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import config, { ServiceConfig } from '../config';
import logger from '../utils/logger';
import healthChecker from '../utils/healthChecker';

// Helper function to get the correct service path for routing
function getServicePath(serviceName: string): string {
  const pathMap: { [key: string]: string } = {
    'auth-service': 'auth',
    'auction-service': 'auctions',
    'bid-service': 'bids',
    'payment-service': 'payments',
    'vehicle-service': 'vehicles',
    'notification-service': 'notifications',
  };
  return pathMap[serviceName] || serviceName;
}

// Helper function to determine the correct path rewrite pattern for each service
function getPathRewritePattern(serviceName: string): { [key: string]: string } {
  const servicePath = getServicePath(serviceName);
  
  // Services with global api/v1 prefix that need full path preserved
  const servicesWithGlobalPrefix = ['auth-service', 'vehicle-service', 'auction-service'];
  
  if (servicesWithGlobalPrefix.includes(serviceName)) {
    // For services with global prefix, don't rewrite the path at all
    return {};
  } else if (serviceName === 'notification-service') {
    // For notification service, only remove the /api/v1 prefix, keep the service path
    return { [`^/api/v1`]: '' };
  } else {
    // For other services, remove the entire api/v1/service prefix
    return { [`^/api/v1/${servicePath}`]: '' };
  }
}

export const createServiceProxy = (serviceConfig: ServiceConfig) => {
  const proxyOptions: Options = {
    target: serviceConfig.url,
    changeOrigin: true,
    timeout: 60000, // 60 seconds
    proxyTimeout: 60000, // 60 seconds
    
    // Path rewriting
    pathRewrite: getPathRewritePattern(serviceConfig.name),

    // Add custom headers
    onProxyReq: (proxyReq, req: Request) => {
      // Add correlation ID for tracing
      const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
      proxyReq.setHeader('x-correlation-id', correlationId);
      
      // Add gateway identifier
      proxyReq.setHeader('x-gateway', 'vehicle-auction-api-gateway');
      
      // Forward user information if available
      if ((req as any).user) {
        proxyReq.setHeader('x-user-id', (req as any).user.id);
        proxyReq.setHeader('x-user-role', (req as any).user.role);
      }

      logger.info(`Proxying request to ${serviceConfig.name}:`, {
        method: req.method,
        path: req.path,
        target: serviceConfig.url,
        correlationId,
        userId: (req as any).user?.id,
      });
    },

    // Handle responses
    onProxyRes: (proxyRes, req: Request, res: Response) => {
      // Add CORS headers if needed
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';

      logger.info(`Response from ${serviceConfig.name}:`, {
        statusCode: proxyRes.statusCode,
        method: req.method,
        path: req.path,
        correlationId: req.headers['x-correlation-id'],
      });
    },

    // Error handling
    onError: (err, req: Request, res: Response) => {
      logger.error(`Proxy error for ${serviceConfig.name}:`, {
        error: err.message,
        method: req.method,
        path: req.path,
        target: serviceConfig.url,
        correlationId: req.headers['x-correlation-id'],
      });

      // Check if service is healthy
      healthChecker.checkService(serviceConfig).then(health => {
        if (health.status === 'unhealthy') {
          logger.warn(`Service ${serviceConfig.name} is unhealthy`);
        }
      });

      if (!res.headersSent) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: `The ${serviceConfig.name} service is currently unavailable. Please try again later.`,
          service: serviceConfig.name,
          timestamp: new Date().toISOString(),
        });
      }
    },

    // Logging
    logLevel: config.env === 'production' ? 'warn' : 'debug',
  };

  return createProxyMiddleware(proxyOptions);
};

// Service-specific proxy creators
export const createAuthProxy = () => createServiceProxy(config.services.auth);
export const createAuctionProxy = () => createServiceProxy(config.services.auction);
export const createBidProxy = () => createServiceProxy(config.services.bid);
export const createPaymentProxy = () => createServiceProxy(config.services.payment);
export const createVehicleProxy = () => createServiceProxy(config.services.vehicle);
export const createNotificationProxy = () => createServiceProxy(config.services.notification);

// Utility function to generate correlation IDs
function generateCorrelationId(): string {
  return `gw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Health check middleware
export const healthCheckMiddleware = async (req: Request, res: Response, next: any) => {
  if (req.path === '/health') {
    try {
      const healthStatuses = await healthChecker.checkAllServices();
      const overallHealth = healthStatuses.every(status => status.status === 'healthy');
      
      res.status(overallHealth ? 200 : 503).json({
        status: overallHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: healthStatuses,
        gateway: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      });
    } catch (error: any) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    next();
  }
};