import { Server as HttpServer, IncomingMessage } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

// Interfaces
interface AuthenticatedSocket extends Socket {
  userId?: string;
  auctionId?: string;
  isAuthenticated?: boolean;
  lastActivity?: number;
}

interface BidData {
  auctionId: string;
  amount: number;
  userId?: string;
}

interface AuctionUpdate {
  auctionId: string;
  currentBid: number;
  bidder: string;
  timeRemaining: number;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  auctionId?: string;
  amount?: number;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private redis: Redis;
  private redisSubscriber: Redis;
  private redisPub: Redis;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();
  private auctionRooms: Map<string, Set<AuthenticatedSocket>> = new Map();
  private rateLimitMap: Map<string, RateLimitData> = new Map();
  
  // Rate limiting constants
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 30;
  private readonly CLEANUP_INTERVAL = 300000; // 5 minutes
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly PONG_TIMEOUT = 5000; // 5 seconds

  constructor(server: HttpServer) {
    console.log('🔧 Initializing WebSocket server with Socket.IO...');
    
    // Create Socket.IO server
    this.io = new SocketIOServer(server, {
      path: '/socket.io/',
      cors: {
        origin: config.cors?.origins || "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      maxHttpBufferSize: 16 * 1024, // 16KB max payload
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    console.log('✅ Socket.IO server created successfully');
    console.log('🔌 Socket.IO listening on path: /socket.io/');
    console.log('🌐 CORS enabled for origins:', config.cors?.origins || "*");
    console.log('🚀 Max payload: 16KB');

    // Initialize Redis clients only if Redis is available
    // Skip Redis initialization for development
    console.log('⚠️ Skipping Redis initialization for development mode');
    this.redis = null as any;
    this.redisSubscriber = null as any;
    this.redisPub = null as any;

    this.setupSocketIOHandlers();
    this.startCleanupJob();
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // In development, allow all connections
    if (config.env === 'development') {
      return true;
    }

    // In production, verify origin
    const allowedOrigins = config.cors?.origins || [];
    return allowedOrigins.includes(info.origin);
  }

  private createRedisClient(name: string): Redis {
    console.log(`🔧 Creating Redis client: ${name}`);
    
    const client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      retryStrategy: (times: number) => {
        const maxRetries = 10;
        if (times > maxRetries) {
          console.error(`❌ Redis ${name}: Max retries (${maxRetries}) reached`);
          return null;
        }
        const delay = Math.min(times * 1000, 10000);
        console.log(`🔄 Redis ${name}: Retry ${times}/${maxRetries} in ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      enableOfflineQueue: true,
      commandTimeout: 5000,
      connectTimeout: 10000,
    });

    client.on('error', (err) => {
      const ignoredErrors = ['client|setinfo', 'READONLY', 'Connection is closed'];
      if (!ignoredErrors.some(ignored => err.message?.includes(ignored))) {
        logger.error(`Redis ${name} error:`, err);
      }
    });

    client.on('connect', () => {
      console.log(`✅ Redis ${name} connected`);
    });

    client.on('ready', () => {
      console.log(`🚀 Redis ${name} ready`);
    });

    return client;
  }

  private setupSocketIOHandlers(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        // In development mode, allow connections without token
        if (!token) {
          if (config.env === 'development') {
            console.log('🔓 Development mode: Allowing connection without authentication');
            socket.userId = 'dev-user-' + Math.random().toString(36).substr(2, 9);
            socket.isAuthenticated = false;
            socket.lastActivity = Date.now();
            return next();
          }
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        socket.userId = decoded.userId || decoded.sub;
        socket.isAuthenticated = true;
        socket.lastActivity = Date.now();
        
        console.log(`✅ Socket authenticated for user: ${socket.userId}`);
        next();
      } catch (error) {
        console.log('❌ Socket authentication failed:', error);
        
        // In development mode, allow connections even with invalid token
        if (config.env === 'development') {
          console.log('🔓 Development mode: Allowing connection despite auth error');
          socket.userId = 'dev-user-' + Math.random().toString(36).substr(2, 9);
          socket.isAuthenticated = false;
          socket.lastActivity = Date.now();
          return next();
        }
        
        next(new Error('Invalid authentication token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 New Socket.IO connection: ${socket.id} for user: ${socket.userId}`);
      
      // Store connected user
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
      }

      // Socket event handlers
      socket.on('join-auction', (data) => {
        this.handleJoinAuction(socket, data);
      });

      socket.on('leave-auction', (data) => {
        this.handleLeaveAuction(socket, data);
      });

      socket.on('place-bid', (data) => {
        this.handlePlaceBid(socket, data);
      });

      socket.on('get-auction-status', (data) => {
        this.handleGetAuctionStatus(socket, data);
      });

      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      socket.on('error', (error) => {
        logger.error('Socket.IO error:', error);
        this.handleDisconnection(socket, 'transport error');
      });

      // Send welcome message
      socket.emit('authenticated', { 
        userId: socket.userId,
        isAuthenticated: socket.isAuthenticated,
        mode: config.env === 'development' ? 'development' : 'production',
        timestamp: new Date().toISOString()
      });

      // Publish user connection to Redis
      if (socket.userId) {
        this.redisPub.publish('user:connected', JSON.stringify({
          userId: socket.userId,
          timestamp: new Date().toISOString()
        }));
      }
    });

    console.log('✅ Socket.IO event handlers configured');
  }

  private handleJoinAuction(socket: AuthenticatedSocket, data: any): void {
    try {
      const auctionId = data?.auctionId || data;
      
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID required', code: 'AUCTION_ID_REQUIRED' });
        return;
      }

      // Rate limiting check
      if (!this.checkRateLimit(socket.userId!)) {
        socket.emit('error', { message: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' });
        return;
      }

      socket.auctionId = auctionId;
      socket.join(`auction:${auctionId}`);

      // Add to auction room tracking
      if (!this.auctionRooms.has(auctionId)) {
        this.auctionRooms.set(auctionId, new Set());
      }
      this.auctionRooms.get(auctionId)!.add(socket);

      console.log(`👥 User ${socket.userId} joined auction ${auctionId}`);
      
      socket.emit('auction-joined', { 
        auctionId,
        timestamp: new Date().toISOString()
      });

      // Notify other participants
      socket.to(`auction:${auctionId}`).emit('user-joined-auction', {
        userId: socket.userId,
        auctionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error joining auction:', error);
      socket.emit('error', { message: 'Failed to join auction', code: 'JOIN_AUCTION_ERROR' });
    }
  }

  private handleLeaveAuction(socket: AuthenticatedSocket, data: any): void {
    try {
      const auctionId = data?.auctionId || data || socket.auctionId;
      
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID required', code: 'AUCTION_ID_REQUIRED' });
        return;
      }

      socket.leave(`auction:${auctionId}`);

      // Remove from auction room tracking
      if (this.auctionRooms.has(auctionId)) {
        this.auctionRooms.get(auctionId)!.delete(socket);
        
        // Clean up empty rooms
        if (this.auctionRooms.get(auctionId)!.size === 0) {
          this.auctionRooms.delete(auctionId);
        }
      }

      if (socket.auctionId === auctionId) {
        socket.auctionId = undefined;
      }

      console.log(`👋 User ${socket.userId} left auction ${auctionId}`);
      
      socket.emit('auction-left', { 
        auctionId,
        timestamp: new Date().toISOString()
      });

      // Notify other participants
      socket.to(`auction:${auctionId}`).emit('user-left-auction', {
        userId: socket.userId,
        auctionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error leaving auction:', error);
      socket.emit('error', { message: 'Failed to leave auction', code: 'LEAVE_AUCTION_ERROR' });
    }
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      });
      return true;
    }

    if (userLimit.count >= this.RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  private async handlePlaceBid(socket: AuthenticatedSocket, data: BidData): Promise<void> {
    try {
      if (!data || !data.auctionId || !data.amount) {
        socket.emit('error', { message: 'Invalid bid data', code: 'INVALID_BID_DATA' });
        return;
      }

      // Rate limiting check
      if (!this.checkRateLimit(socket.userId!)) {
        socket.emit('error', { message: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' });
        return;
      }

      // Validate user is in the auction
      if (socket.auctionId !== data.auctionId) {
        socket.emit('error', { message: 'Not joined to this auction', code: 'NOT_IN_AUCTION' });
        return;
      }

      // Add user ID to bid data
      const bidData = {
        ...data,
        userId: socket.userId,
        timestamp: new Date().toISOString()
      };

      // Publish bid to Redis for processing
      await this.redisPub.publish('auction:bid-placed', JSON.stringify(bidData));

      console.log(`💰 Bid placed by ${socket.userId} for auction ${data.auctionId}: $${data.amount}`);

      // Send confirmation to bidder
      socket.emit('bid-placed', {
        auctionId: data.auctionId,
        amount: data.amount,
        timestamp: bidData.timestamp
      });

    } catch (error) {
      logger.error('Place bid error:', error);
      socket.emit('error', { message: 'Failed to place bid', code: 'BID_PLACEMENT_FAILED' });
    }
  }

  private handleGetAuctionStatus(socket: AuthenticatedSocket, data: any): void {
    try {
      const auctionId = data?.auctionId || data;
      
      if (!auctionId) {
        socket.emit('error', { message: 'Auction ID required', code: 'AUCTION_ID_REQUIRED' });
        return;
      }

      // Get participant count
      const participantCount = this.auctionRooms.get(auctionId)?.size || 0;

      socket.emit('auction-status', {
        auctionId,
        participantCount,
        isConnected: socket.auctionId === auctionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Get auction status error:', error);
      socket.emit('error', { message: 'Failed to get auction status', code: 'GET_STATUS_FAILED' });
    }
  }

  private handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
    console.log(`🔌 Socket.IO disconnected: ${socket.userId} (${reason})`);

    try {
      // Leave auction if in one
      if (socket.auctionId) {
        this.handleLeaveAuction(socket, { auctionId: socket.auctionId });
      }

      // Remove from connected users
      if (socket.userId) {
        this.connectedUsers.delete(socket.userId);
        
        // Publish disconnection to Redis
        this.redisPub.publish('user:disconnected', JSON.stringify({
          userId: socket.userId,
          timestamp: new Date().toISOString()
        }));
      }

    } catch (error) {
      logger.error('Disconnection handling error:', error);
    }
  }

  private setupRedisSubscriptions(): void {
    if (!this.redisSubscriber) {
      console.log('⚠️ Redis subscriber not available, skipping Redis subscriptions');
      return;
    }

    // Subscribe to auction updates
    this.redisSubscriber.subscribe('auction:update', 'bid:accepted', 'bid:rejected');

    this.redisSubscriber.on('message', (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (channel) {
          case 'auction:update':
            this.handleAuctionUpdate(data);
            break;
          case 'bid:accepted':
            this.handleBidAccepted(data);
            break;
          case 'bid:rejected':
            this.handleBidRejected(data);
            break;
        }
      } catch (error) {
        logger.error('Redis message handling error:', error);
      }
    });

    console.log('✅ Redis subscriptions configured');
  }

  private handleAuctionUpdate(data: AuctionUpdate): void {
    this.io.to(`auction:${data.auctionId}`).emit('auction-update', data);
  }

  private handleBidAccepted(data: any): void {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.emit('bid-accepted', data);
    }
    
    // Broadcast to auction participants
    this.io.to(`auction:${data.auctionId}`).emit('new-bid', data);
  }

  private handleBidRejected(data: any): void {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.emit('bid-rejected', data);
    }
  }

  private startCleanupJob(): void {
    setInterval(() => {
      this.cleanupInactiveConnections();
      this.cleanupRateLimitMap();
    }, this.CLEANUP_INTERVAL);

    console.log('✅ Cleanup job started');
  }

  private cleanupInactiveConnections(): void {
    const now = Date.now();
    let cleaned = 0;

    this.connectedUsers.forEach((socket, userId) => {
      if (!socket.connected || 
          (socket.lastActivity && now - socket.lastActivity > 300000)) { // 5 minutes
        this.handleDisconnection(socket, 'Cleanup');
        socket.disconnect(true);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} inactive connections`);
    }
  }

  private cleanupRateLimitMap(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [userId, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(userId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} rate limit entries`);
    }
  }

  // Public methods
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getAuctionParticipants(auctionId: string): number {
    return this.io.sockets.adapter.rooms.get(`auction:${auctionId}`)?.size || 0;
  }

  public async broadcastSystemMessage(message: string): Promise<void> {
    this.io.emit('system-message', { 
      message, 
      timestamp: new Date().toISOString() 
    });
  }

  public getServerStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeAuctions: this.auctionRooms.size,
      totalConnections: this.io.engine.clientsCount,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      rateLimitedUsers: this.rateLimitMap.size
    };
  }

  public async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Socket.IO server...');
    
    // Close all connections
    this.io.disconnectSockets(true);

    // Close Socket.IO server
    this.io.close();

    // Close Redis connections if they exist
    if (this.redis) {
      await this.redis.quit();
    }
    if (this.redisSubscriber) {
      await this.redisSubscriber.quit();
    }
    if (this.redisPub) {
      await this.redisPub.quit();
    }

    console.log('✅ Socket.IO server shutdown complete');
  }
}