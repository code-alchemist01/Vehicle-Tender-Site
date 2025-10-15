import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import healthChecker from '../utils/healthChecker';
import logger from '../utils/logger';
import config from '../config';

const router = Router();

// Overall health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const healthStatuses = await healthChecker.checkAllServices();
    const overallHealth = healthStatuses.every(status => status.status === 'healthy');
    
    const response = {
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      gateway: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0',
        environment: config.env,
      },
      services: healthStatuses,
      summary: {
        total: healthStatuses.length,
        healthy: healthStatuses.filter(s => s.status === 'healthy').length,
        unhealthy: healthStatuses.filter(s => s.status === 'unhealthy').length,
        unknown: healthStatuses.filter(s => s.status === 'unknown').length,
      },
    };

    res.status(overallHealth ? 200 : 503).json(response);
  } catch (error: any) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}));

// Individual service health check
router.get('/services/:serviceName', asyncHandler(async (req: Request, res: Response) => {
  const { serviceName } = req.params;
  
  const serviceConfig = config.services[serviceName as keyof typeof config.services];
  if (!serviceConfig) {
    return res.status(404).json({
      error: 'Service not found',
      message: `Service '${serviceName}' is not configured`,
      availableServices: Object.keys(config.services),
    });
  }

  try {
    const healthStatus = await healthChecker.checkService(serviceConfig);
    
    return res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
      ...healthStatus,
      service: serviceName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`Health check failed for service ${serviceName}:`, error);
    return res.status(500).json({
      service: serviceName,
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}));

// Gateway-only health check (doesn't check services)
router.get('/gateway', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: config.env,
    pid: process.pid,
    nodeVersion: process.version,
  });
});

// Readiness probe (for Kubernetes)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  try {
    const healthStatuses = await healthChecker.checkAllServices();
    const criticalServices = ['auth', 'vehicle']; // Define critical services
    
    const criticalServicesHealth = healthStatuses.filter(
      status => criticalServices.includes(status.service)
    );
    
    const allCriticalHealthy = criticalServicesHealth.every(
      status => status.status === 'healthy'
    );

    if (allCriticalHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        criticalServices: criticalServicesHealth,
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        criticalServices: criticalServicesHealth,
        message: 'Critical services are not healthy',
      });
    }
  } catch (error: any) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      message: 'Readiness check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}));

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;