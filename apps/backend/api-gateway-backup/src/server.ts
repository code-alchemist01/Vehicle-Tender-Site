import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { WebSocketServer } from './websocket/websocketServer';
import logger from './utils/logger';

dotenv.config();

const { PORT, HOST } = config.server;

// ✅ CRITICAL: HTTP server oluştur Express app ile
const server = createServer(app);

// ✅ CRITICAL: WebSocket server'ı HTTP server'a DOĞRUDAN bağla
console.log('🔧 Initializing WebSocket server...');
const wsServer = new WebSocketServer(server);
console.log('✅ WebSocket server initialized and attached to HTTP server');

// Set WebSocket server for routes
app.set('wsServer', wsServer);

console.log('✅ WebSocket server directly attached to HTTP server');

// ✅ CRITICAL: HTTP server'ı başlat (Express app'i değil!)
server.listen(PORT, HOST, () => {
  console.log('✅ API Gateway started successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Server: http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket: ws://${HOST}:${PORT}/ws`);
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origins: ${config.cors?.origins || 'Not configured'}`);
  console.log(`📡 Environment: ${config.env}`);
  console.log(`🔗 WebSocket: ws://${HOST}:${PORT}`);
  console.log('═══════════════════════════════════════');
  console.log('\n📋 Service Configuration:');
  console.log(`   Auth Service:         ${config.services.auth.url}`);
  console.log(`   Vehicle Service:      ${config.services.vehicle.url}`);
  console.log(`   Auction Service:      ${config.services.auction.url}`);
  console.log(`   Bid Service:          ${config.services.bid.url}`);
  console.log(`   Payment Service:      ${config.services.payment.url}`);
  console.log(`   Notification Service: ${config.services.notification.url}`);
  console.log(`   Redis:                ${config.redis.host}:${config.redis.port}`);
  console.log('\n🎯 Server is ready to accept connections');
  
  // Log WebSocket statistics every 30 seconds
  setInterval(logWebSocketStats, 30000);
});

// Health check function
const performHealthCheck = async () => {
  const services = [
    { name: 'Auth Service', url: config.services.auth.url, healthPath: config.services.auth.healthPath },
    { name: 'Vehicle Service', url: config.services.vehicle.url, healthPath: config.services.vehicle.healthPath },
    { name: 'Auction Service', url: config.services.auction.url, healthPath: config.services.auction.healthPath },
    { name: 'Bid Service', url: config.services.bid.url, healthPath: config.services.bid.healthPath },
    { name: 'Payment Service', url: config.services.payment.url, healthPath: config.services.payment.healthPath },
    { name: 'Notification Service', url: config.services.notification.url, healthPath: config.services.notification.healthPath },
  ];

  console.log('\n🏥 Health Check Results:');
  let healthyServices = 0;
  
  for (const service of services) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthUrl = `${service.url}${service.healthPath}`;
      const response = await fetch(healthUrl, { 
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

// Log WebSocket statistics
const logWebSocketStats = () => {
  try {
    const stats = wsServer.getServerStats();
    console.log('\n🔌 WebSocket Statistics:');
    console.log(`   Connected Users:      ${stats.connectedUsers}`);
    console.log(`   Active Auctions:      ${stats.activeAuctions}`);
    console.log(`   Total Connections:    ${stats.totalConnections}`);
    console.log(`   Rate Limited Users:   ${stats.rateLimitedUsers}`);
    console.log(`   Uptime:              ${Math.floor(stats.uptime / 1000)}s`);
    console.log(`   Memory Usage:        ${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB`);
  } catch (error) {
    console.error('❌ Error getting WebSocket stats:', error);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    console.log('🔄 Closing HTTP server...');
    server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close WebSocket connections
    console.log('🔄 Closing WebSocket connections...');
    await wsServer.shutdown();
    console.log('✅ WebSocket server closed');
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;