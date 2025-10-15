import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { createAdapter } from '@socket.io/redis-adapter';
import config from '../config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface BidData {
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: Date;
}

interface AuctionUpdate {
  auctionId: string;
  currentPrice: number;
  bidCount: number;
  timeRemaining: number;
  lastBidder?: string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private redis: Redis;
  private redisSubscriber: Redis;
  private redisPub: Redis;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private auctionRooms: Map<string, Set<string>> = new Map(); // auctionId -> Set of userIds
  private rateLimitMap: Map<string, RateLimitData> = new Map();
  
  // Configuration
  private readonly MAX_BIDS_PER_MINUTE = 10;
  private readonly MAX_REQUESTS_PER_MINUTE = 50;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.frontend.url,
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 45000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true,
    });

    // Initialize Redis connections
    this.redis = this.createRedisClient('main');
    this.redisSubscriber = this.createRedisClient('subscriber');
    this.redisPub = this.createRedisClient('publisher');

    this.setupRedisAdapter();
    this.setupSocketHandlers();
    this.setupRedisSubscriptions();
    this.startCleanupJob();
  }

  private createRedisClient(name: string): Redis {
    const client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times: number) => {
        const maxRetries = 10;
        if (times > maxRetries) {
          console.error(`Redis ${name}: Max retries (${maxRetries}) reached`);
          return null;
        }
        const delay = Math.min(times * 1000, 10000);
        console.log(`Redis ${name}: Retry attempt ${times} in ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      reconnectOnError: (err) => {
        console.error(`Redis ${name} reconnectOnError:`, err.message);
        return true;
      },
    });

    client.on('error', (err) => {
      console.error(`Redis ${name} error:`, err);
    });

    client.on('connect', () => {
      console.log(`✅ Redis ${name} connected`);
    });

    client.on('ready', () => {
      console.log(`✅ Redis ${name} ready`);
    });

    client.on('reconnecting', (time: number) => {
      console.log(`🔄 Redis ${name} reconnecting in ${time}ms...`);
    });

    client.on('close', () => {
      console.log(`❌ Redis ${name} connection closed`);
    });

    return client;
  }

  private setupRedisAdapter(): void {
    // Use Redis adapter for horizontal scaling across multiple instances
    const adapter = createAdapter(this.redisPub, this.redisSubscriber);
    this.io.adapter(adapter);
    console.log('✅ Redis adapter configured for Socket.IO');
  }

  private setupSocketHandlers(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || 
                     socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(
          token, 
          config.jwt.secret
        ) as any;
        
        if (!decoded.userId) {
          return next(new Error('Invalid token payload'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        const err = error as Error;
        console.error('Auth middleware error:', err.message);
        next(new Error('Invalid authentication token'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection (disconnect old session if exists)
      if (socket.userId) {
        const existingSocketId = this.connectedUsers.get(socket.userId);
        if (existingSocketId && existingSocketId !== socket.id) {
          console.log(`⚠️  Disconnecting old session for user ${socket.userId}`);
          this.io.sockets.sockets.get(existingSocketId)?.disconnect(true);
        }
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Handle joining auction rooms
      socket.on('join-auction', async (auctionId: string) => {
        try {
          if (!socket.userId || !auctionId) {
            socket.emit('error', { message: 'Invalid request' });
            return;
          }

          // Rate limiting
          if (!this.checkGeneralRateLimit(socket.userId)) {
            socket.emit('error', { message: 'Too many requests. Please slow down.' });
            return;
          }

          // Verify auction exists and user has permission
          const auctionExists = await this.verifyAuctionAccess(auctionId, socket.userId);
          if (!auctionExists) {
            socket.emit('error', { message: 'Auction not found or access denied' });
            return;
          }

          // Join socket room
          await socket.join(`auction-${auctionId}`);
          
          // Track user in auction
          if (!this.auctionRooms.has(auctionId)) {
            this.auctionRooms.set(auctionId, new Set());
          }
          this.auctionRooms.get(auctionId)?.add(socket.userId);

          // Send current auction state
          const auctionState = await this.getAuctionState(auctionId);
          if (auctionState) {
            socket.emit('auction-state', auctionState);
          }

          // Notify others
          const participantCount = this.auctionRooms.get(auctionId)?.size || 0;
          socket.to(`auction-${auctionId}`).emit('user-joined', {
            userId: socket.userId,
            participantCount
          });

          console.log(`✅ User ${socket.userId} joined auction ${auctionId} (${participantCount} participants)`);
        } catch (error) {
          console.error('Error joining auction:', error);
          socket.emit('error', { message: 'Failed to join auction' });
        }
      });

      // Handle leaving auction rooms
      socket.on('leave-auction', async (auctionId: string) => {
        if (!socket.userId) return;
        await this.leaveAuctionRoom(socket, auctionId);
      });

      // Handle new bids with rate limiting
      socket.on('place-bid', async (bidData: BidData) => {
        try {
          if (!socket.userId) {
            socket.emit('bid-error', { message: 'Unauthorized' });
            return;
          }

          // Rate limiting for bids
          if (!this.checkBidRateLimit(socket.userId)) {
            socket.emit('bid-error', { 
              message: 'Too many bids. Please wait before placing another bid.',
              retryAfter: this.getRetryAfter(socket.userId, 'bid')
            });
            return;
          }

          // Validate bid data
          if (!bidData.auctionId || !bidData.amount || bidData.amount <= 0) {
            socket.emit('bid-error', { message: 'Invalid bid data' });
            return;
          }

          // Sanitize and validate amount
          const sanitizedAmount = Math.round(bidData.amount * 100) / 100;
          if (sanitizedAmount !== bidData.amount) {
            socket.emit('bid-error', { message: 'Invalid bid amount precision' });
            return;
          }

          // Process bid through bid service
          const bidResult = await this.processBid({
            auctionId: bidData.auctionId,
            userId: socket.userId,
            amount: sanitizedAmount,
            timestamp: new Date()
          });

          if (bidResult.success) {
            // Publish bid event to Redis for other services
            await this.redis.publish('bid-placed', JSON.stringify({
              auctionId: bidData.auctionId,
              userId: socket.userId,
              amount: sanitizedAmount,
              timestamp: new Date().toISOString()
            }));

            socket.emit('bid-success', { 
              message: 'Bid placed successfully',
              amount: sanitizedAmount
            });
          } else {
            socket.emit('bid-error', { message: bidResult.error || 'Bid failed' });
          }
        } catch (error) {
          console.error('Error placing bid:', error);
          socket.emit('bid-error', { message: 'Failed to place bid' });
        }
      });

      // Handle auto-bid setup
      socket.on('setup-auto-bid', async (autoBidData: any) => {
        try {
          if (!socket.userId) {
            socket.emit('auto-bid-error', { message: 'Unauthorized' });
            return;
          }

          // Validate auto-bid data
          if (!autoBidData.auctionId || !autoBidData.maxAmount || autoBidData.maxAmount <= 0) {
            socket.emit('auto-bid-error', { message: 'Invalid auto-bid data' });
            return;
          }

          // Sanitize maxAmount
          const sanitizedMaxAmount = Math.round(autoBidData.maxAmount * 100) / 100;

          const result = await this.setupAutoBid({
            ...autoBidData,
            userId: socket.userId,
            maxAmount: sanitizedMaxAmount
          });

          if (result.success) {
            socket.emit('auto-bid-success', { 
              message: 'Auto-bid configured successfully',
              maxAmount: sanitizedMaxAmount
            });
          } else {
            socket.emit('auto-bid-error', { message: result.error || 'Setup failed' });
          }
        } catch (error) {
          console.error('Error setting up auto-bid:', error);
          socket.emit('auto-bid-error', { message: 'Failed to setup auto-bid' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        console.log(`❌ User ${socket.userId} disconnected: ${reason}`);
        
        if (socket.userId) {
          // Only remove if this is the current socket
          if (this.connectedUsers.get(socket.userId) === socket.id) {
            this.connectedUsers.delete(socket.userId);
          }
          
          // Remove from all auction rooms
          const roomsToLeave: string[] = [];
          this.auctionRooms.forEach((users, auctionId) => {
            if (socket.userId && users.has(socket.userId)) {
              users.delete(socket.userId);
              roomsToLeave.push(auctionId);
              
              // Clean up empty auction rooms
              if (users.size === 0) {
                this.auctionRooms.delete(auctionId);
                console.log(`🗑️  Cleaned up empty auction room: ${auctionId}`);
              }
            }
          });

          // Notify remaining users in each room
          roomsToLeave.forEach(auctionId => {
            const participantCount = this.auctionRooms.get(auctionId)?.size || 0;
            this.io.to(`auction-${auctionId}`).emit('user-left', {
              userId: socket.userId,
              participantCount
            });
          });
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  private setupRedisSubscriptions(): void {
    const channels = ['bid-placed', 'auction-updated', 'auction-ended', 'auction-starting-soon'];
    
    this.redisSubscriber.subscribe(...channels, (err, count) => {
      if (err) {
        console.error('❌ Redis subscription error:', err);
      } else {
        console.log(`✅ Subscribed to ${count} channels:`, channels.join(', '));
      }
    });

    this.redisSubscriber.on('message', async (channel: string, message: string) => {
      try {
        const data = JSON.parse(message);

        switch (channel) {
          case 'bid-placed':
            await this.handleBidPlaced(data);
            break;
          case 'auction-updated':
            await this.handleAuctionUpdated(data);
            break;
          case 'auction-ended':
            await this.handleAuctionEnded(data);
            break;
          case 'auction-starting-soon':
            await this.handleAuctionStartingSoon(data);
            break;
          default:
            console.warn(`⚠️  Unhandled channel: ${channel}`);
        }
      } catch (error) {
        console.error(`❌ Error processing Redis message from ${channel}:`, error);
      }
    });
  }

  private async leaveAuctionRoom(socket: AuthenticatedSocket, auctionId: string): Promise<void> {
    if (!socket.userId) return;

    await socket.leave(`auction-${auctionId}`);
    
    const room = this.auctionRooms.get(auctionId);
    if (room) {
      room.delete(socket.userId);
      
      const participantCount = room.size;
      
      // Notify others
      socket.to(`auction-${auctionId}`).emit('user-left', {
        userId: socket.userId,
        participantCount
      });
      
      // Clean up empty rooms
      if (participantCount === 0) {
        this.auctionRooms.delete(auctionId);
        console.log(`🗑️  Cleaned up empty auction room: ${auctionId}`);
      }
    }
    
    console.log(`✅ User ${socket.userId} left auction ${auctionId}`);
  }

  private checkBidRateLimit(userId: string): boolean {
    return this.checkRateLimit(userId, 'bid', this.MAX_BIDS_PER_MINUTE);
  }

  private checkGeneralRateLimit(userId: string): boolean {
    return this.checkRateLimit(userId, 'general', this.MAX_REQUESTS_PER_MINUTE);
  }

  private checkRateLimit(userId: string, type: string, maxRequests: number): boolean {
    const key = `${userId}:${type}`;
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(key);

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + 60000 // 1 minute
      });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  private getRetryAfter(userId: string, type: string): number {
    const key = `${userId}:${type}`;
    const userLimit = this.rateLimitMap.get(key);
    if (!userLimit) return 0;
    return Math.max(0, Math.ceil((userLimit.resetTime - Date.now()) / 1000));
  }

  private startCleanupJob(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      // Clean up rate limit map
      for (const [key, limit] of this.rateLimitMap.entries()) {
        if (now > limit.resetTime) {
          this.rateLimitMap.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired rate limits. Remaining: ${this.rateLimitMap.size}`);
      }
    }, this.CLEANUP_INTERVAL);
  }

  private async handleBidPlaced(data: any): Promise<void> {
    const { auctionId, userId, amount, timestamp } = data;
    
    // Broadcast to all users in the auction room
    this.io.to(`auction-${auctionId}`).emit('new-bid', {
      auctionId,
      userId,
      amount,
      timestamp,
      message: 'New bid placed!'
    });

    // Send specific notification to outbid users
    try {
      const outbidUsers = await this.getOutbidUsers(auctionId, userId);
      outbidUsers.forEach(outbidUserId => {
        const socketId = this.connectedUsers.get(outbidUserId);
        if (socketId) {
          this.io.to(socketId).emit('outbid-notification', {
            auctionId,
            newHighestBid: amount,
            message: 'You have been outbid!',
            timestamp: new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error('Error sending outbid notifications:', error);
    }
  }

  private async handleAuctionUpdated(data: AuctionUpdate): Promise<void> {
    const { auctionId, currentPrice, bidCount, timeRemaining, lastBidder } = data;
    
    this.io.to(`auction-${auctionId}`).emit('auction-update', {
      auctionId,
      currentPrice,
      bidCount,
      timeRemaining,
      lastBidder,
      timestamp: new Date().toISOString()
    });
  }

  private async handleAuctionEnded(data: any): Promise<void> {
    const { auctionId, winnerId, winningBid } = data;
    
    // Notify all users in auction room
    this.io.to(`auction-${auctionId}`).emit('auction-ended', {
      auctionId,
      winnerId,
      winningBid,
      message: 'Auction has ended!',
      timestamp: new Date().toISOString()
    });

    // Send winner notification
    if (winnerId) {
      const winnerSocketId = this.connectedUsers.get(winnerId);
      if (winnerSocketId) {
        this.io.to(winnerSocketId).emit('auction-won', {
          auctionId,
          winningBid,
          message: 'Congratulations! You won the auction!',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Clean up auction room after a delay
    setTimeout(() => {
      this.auctionRooms.delete(auctionId);
      console.log(`🗑️  Cleaned up ended auction room: ${auctionId}`);
    }, 60000); // 1 minute delay
  }

  private async handleAuctionStartingSoon(data: any): Promise<void> {
    const { auctionId, startTime, interestedUsers } = data;
    
    // Notify specific interested users if provided
    if (interestedUsers && Array.isArray(interestedUsers)) {
      interestedUsers.forEach(userId => {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
          this.io.to(socketId).emit('auction-starting-soon', {
            auctionId,
            startTime,
            message: 'An auction you are watching is starting soon!',
            timestamp: new Date().toISOString()
          });
        }
      });
    } else {
      // Broadcast to all connected users
      this.io.emit('auction-starting-soon', {
        auctionId,
        startTime,
        message: 'Auction starting soon!',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Helper methods with retry logic
  private async fetchWithRetry(
    url: string, 
    options: RequestInit, 
    retries = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeout);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`Fetch attempt ${i + 1}/${retries} failed:`, lastError.message);
        
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries reached');
  }

  private async verifyAuctionAccess(auctionId: string, userId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithRetry(
        `${config.services.auction.url}/auctions/${auctionId}/access`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`,
            'X-User-ID': userId,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.ok;
    } catch (error) {
      console.error('Error verifying auction access:', error);
      return false;
    }
  }

  private async getAuctionState(auctionId: string): Promise<any> {
    try {
      const response = await this.fetchWithRetry(
        `${config.services.auction.url}/auctions/${auctionId}/state`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch auction state: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching auction state:', error);
      throw error;
    }
  }

  private async processBid(bidData: BidData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.fetchWithRetry(
        `${config.services.auction.url}/auctions/${bidData.auctionId}/bids`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bidData)
        }
      );

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json() as { message?: string };
        return { success: false, error: errorData.message || 'Bid processing failed' };
      }
    } catch (error) {
      console.error('Error processing bid:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async setupAutoBid(autoBidData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.fetchWithRetry(
        `${config.services.auction.url}/auctions/${autoBidData.auctionId}/auto-bid`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(autoBidData)
        }
      );

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json() as { message?: string };
        return { success: false, error: errorData.message || 'Auto-bid setup failed' };
      }
    } catch (error) {
      console.error('Error setting up auto-bid:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async getOutbidUsers(auctionId: string, currentBidderId: string): Promise<string[]> {
    try {
      const response = await this.fetchWithRetry(
        `${config.services.auction.url}/auctions/${auctionId}/outbid-users`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.generateServiceToken()}`,
            'X-Current-Bidder': currentBidderId,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return (data as any).outbidUsers || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting outbid users:', error);
      return [];
    }
  }

  private generateServiceToken(): string {
    return jwt.sign(
      { 
        service: 'api-gateway',
        timestamp: Date.now()
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }

  // Public methods
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getAuctionParticipants(auctionId: string): number {
    return this.auctionRooms.get(auctionId)?.size || 0;
  }

  public async broadcastSystemMessage(message: string): Promise<void> {
    this.io.emit('system_message', { message, timestamp: new Date() });
  }

  // ✅ NEW: Server statistics method
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

  // ✅ NEW: Active auctions count method
  public getActiveAuctionsCount(): number {
    return this.auctionRooms.size;
  }

  // ✅ NEW: Notify specific user method
  public async notifyUser(userId: string, event: string, data: any): Promise<boolean> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
        return true;
      }
    }
    return false;
  }

  // ✅ NEW: Notify auction participants method
  public async notifyAuction(auctionId: string, event: string, data: any): Promise<number> {
    const participants = this.auctionRooms.get(auctionId);
    if (!participants) return 0;

    let notifiedCount = 0;
    for (const userId of participants) {
      const success = await this.notifyUser(userId, event, data);
      if (success) notifiedCount++;
    }
    
    return notifiedCount;
  }

  public async close(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    await this.redis.quit();
    await this.redisSubscriber.quit();
    await this.redisPub.quit();
    this.io.close();
  }
}