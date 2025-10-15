import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { WebSocketServer } from './websocket/websocketServer';
import websocketRoutes, { setWebSocketServer } from './routes/websocket';
import config from './config'; // ✅ EKLE!
import logger from './utils/logger'; // ✅ EKLE - Professional logging

dotenv.config();

const PORT = config.port; // ✅ Config'den al
const HOST = config.host; // ✅ Config'den al

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
console.log('📡 Initializing WebSocket server...');
const wsServer = new WebSocketServer(server);
console.log('✅ WebSocket server initialized\n');

// Set WebSocket server for routes
setWebSocketServer(wsServer);

// Add WebSocket routes BEFORE starting server
app.use('/api/websocket', websocketRoutes);
console.log('✅ WebSocket routes registered\n');

// Start server
server.listen(PORT, HOST, () => {
  console.log('✅ API Gateway started successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Server: http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${config.env}`); // ✅ config.environment değil, config.env!
  console.log(`🔗 WebSocket: ws://${HOST}:${PORT}`);
  console.log('═══════════════════════════════════════\n');
  
  // Log service URLs
  console.log('📋 Service Configuration:');
  console.log(`   Auth Service:         ${config.services.auth.url}`);
  console.log(`   Vehicle Service:      ${config.services.vehicle.url}`);
  console.log(`   Auction Service:      ${config.services.auction.url}`);
  console.log(`   Bid Service:          ${config.services.bid.url}`);
  console.log(`   Payment Service:      ${config.services.payment.url}`);
  console.log(`   Notification Service: ${config.services.notification.url}`);
  console.log(`   Redis:                ${config.redis.host}:${config.redis.port}\n`);
  
  // Initial health check and WebSocket stats
  setTimeout(async () => {
    await performHealthCheck();
    logWebSocketStats();
  }, 2000);
  
  // Periodic health checks (only in production)
  if (config.env === 'production') {
    setInterval(async () => {
      await performHealthCheck();
      logWebSocketStats();
    }, 60000); // 1 minute in production
  }
});

// Health check function
const performHealthCheck = async () => {
  const services = [
    { name: 'Auth Service', url: config.services.auth.url },
    { name: 'Vehicle Service', url: config.services.vehicle.url },
    { name: 'Auction Service', url: config.services.auction.url },
    { name: 'Bid Service', url: config.services.bid.url },
    { name: 'Payment Service', url: config.services.payment.url },
    { name: 'Notification Service', url: config.services.notification.url },
  ];

  console.log('\n🏥 Health Check Results:');
  let healthyServices = 0;
  
  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${service.url}/health`, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'API-Gateway-HealthCheck'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`   ✅ ${service.name.padEnd(25)} Healthy (${response.status})`);
        healthyServices++;
      } else {
        console.log(`   ⚠️  ${service.name.padEnd(25)} Unhealthy (${response.status})`);
        logger.warn(`Service ${service.name} is unhealthy`, { status: response.status });
      }
    } catch (error: any) {
      const errorMsg = error.name === 'AbortError' ? 'Timeout' : error.message;
      console.log(`   ❌ ${service.name.padEnd(25)} Error (${errorMsg})`);
      logger.error(`Health check failed for ${service.name}`, { error: errorMsg });
    }
  }
  
  const healthPercentage = Math.round((healthyServices / services.length) * 100);
  console.log(`\n📊 Overall Health: ${healthyServices}/${services.length} services (${healthPercentage}%)`);
  
  // Log warning if less than 80% healthy in production
  if (config.env === 'production' && healthPercentage < 80) {
    logger.warn('Less than 80% of services are healthy', {
      healthy: healthyServices,
      total: services.length,
      percentage: healthPercentage
    });
  }
};

// WebSocket statistics logging
const logWebSocketStats = () => {
  try {
    const stats = wsServer.getServerStats();
    console.log('\n🔌 WebSocket Statistics:');
    console.log(`   Connected Users:      ${stats.connectedUsers}`);
    console.log(`   Active Auctions:      ${stats.activeAuctions}`);
    console.log(`   Total Connections:    ${stats.totalConnections}`);
    console.log(`   Rate Limited Users:   ${stats.rateLimitedUsers}`);
    console.log(`   Server Uptime:        ${Math.round(stats.uptime)}s`);
    console.log(`   Memory Usage:         ${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB\n`);
    
    // Log to file for monitoring
    logger.info('WebSocket Statistics', {
      connectedUsers: stats.connectedUsers,
      activeAuctions: stats.activeAuctions,
      totalConnections: stats.totalConnections,
      rateLimitedUsers: stats.rateLimitedUsers,
      uptime: stats.uptime,
      memoryUsageMB: Math.round(stats.memory.heapUsed / 1024 / 1024)
    });
  } catch (error) {
    console.log('   ⚠️  WebSocket stats unavailable\n');
    logger.warn('Failed to get WebSocket statistics', { error });
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...\n`);
  logger.info('Graceful shutdown initiated', { signal });
  
  try {
    // Stop accepting new connections
    console.log('🔄 Closing WebSocket connections...');
    await wsServer.close();
    console.log('✅ WebSocket server closed');
    
    // Close HTTP server
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          console.error('❌ Error closing HTTP server:', err);
          reject(err);
        } else {
          console.log('✅ HTTP server closed');
          resolve();
        }
      });
    });
    
    console.log('✅ Graceful shutdown completed\n');
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    logger.error('Shutdown error', { error });
    process.exit(1);
  }
};

// Signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Error handlers
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack 
  });
  
  // In production, attempt graceful shutdown
  if (config.env === 'production') {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  logger.error('Unhandled Rejection', { reason, promise });
  
  // In production, attempt graceful shutdown
  if (config.env === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  } else {
    process.exit(1);
  }
});

// Handle process warnings
process.on('warning', (warning: Error) => {
  console.warn('⚠️  Process Warning:', warning.name);
  console.warn('   Message:', warning.message);
  if (warning.stack) {
    console.warn('   Stack:', warning.stack);
  }
  logger.warn('Process Warning', { 
    warning: warning.name, 
    message: warning.message 
  });
});

export default server;