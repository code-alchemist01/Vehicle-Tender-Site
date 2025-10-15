import axios from 'axios';
import config, { ServiceConfig } from '../config';
import logger from './logger';

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}

export class HealthChecker {
  private static instance: HealthChecker;
  private healthCache: Map<string, HealthStatus> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  async checkService(serviceConfig: ServiceConfig): Promise<HealthStatus> {
    const cacheKey = serviceConfig.name;
    const cached = this.healthCache.get(cacheKey);
    
    if (cached && Date.now() - (cached as any).timestamp < this.cacheTimeout) {
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.get(
        `${serviceConfig.url}${serviceConfig.healthPath}`,
        {
          timeout: serviceConfig.timeout,
          validateStatus: (status) => status < 500, // Accept 2xx, 3xx, 4xx as healthy
        }
      );

      const responseTime = Date.now() - startTime;
      const healthStatus: HealthStatus = {
        service: serviceConfig.name,
        status: response.status < 400 ? 'healthy' : 'unhealthy',
        responseTime,
      };

      this.updateCache(cacheKey, healthStatus);
      return healthStatus;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const healthStatus: HealthStatus = {
        service: serviceConfig.name,
        status: 'unhealthy',
        responseTime,
        error: error.message,
      };

      this.updateCache(cacheKey, healthStatus);
      logger.warn(`Service ${serviceConfig.name} health check failed:`, error.message);
      return healthStatus;
    }
  }

  async checkAllServices(): Promise<HealthStatus[]> {
    const services = Object.values(config.services);
    const healthChecks = services.map(service => this.checkService(service));
    
    return Promise.all(healthChecks);
  }

  private updateCache(key: string, status: HealthStatus): void {
    (status as any).timestamp = Date.now();
    this.healthCache.set(key, status);
  }

  clearCache(): void {
    this.healthCache.clear();
  }
}

export default HealthChecker.getInstance();