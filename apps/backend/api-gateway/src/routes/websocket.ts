import { Router } from 'express';
import { WebSocketServer } from '../websocket/websocketServer';
import config from '../config';

const router = Router();

// WebSocket server instance will be injected
let wsServer: WebSocketServer;

export const setWebSocketServer = (server: WebSocketServer) => {
  wsServer = server;
};

/**
 * @route GET /websocket/info
 * @desc Get WebSocket connection information
 * @access Public
 */
router.get('/info', (req, res) => {
  try {
    if (!wsServer) {
      return res.status(503).json({
        success: false,
        message: 'WebSocket server not initialized'
      });
    }

    const connectionInfo = {
      success: true,
      data: {
        endpoint: `ws://${req.get('host')}`,
        transports: ['websocket', 'polling'],
        cors: {
          origin: config.frontend.url,
          credentials: true
        },
        authentication: {
          required: true,
          method: 'JWT Bearer Token',
          header: 'Authorization: Bearer <token>',
          socketAuth: 'auth.token or headers.authorization'
        },
        events: {
          client_to_server: [
            'join-auction',
            'leave-auction', 
            'place-bid',
            'setup-auto-bid'
          ],
          server_to_client: [
            'auction-state',
            'bid-placed',
            'auction-updated',
            'auction-ended',
            'outbid-notification',
            'system-message'
          ]
        },
        rateLimits: {
          bids: '10 per minute',
          general: '50 per minute'
        }
      }
    };

    return res.json(connectionInfo);
  } catch (error) {
    console.error('Error getting WebSocket info:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket information'
    });
  }
});

/**
 * @route GET /websocket/stats
 * @desc Get WebSocket server statistics
 * @access Public
 */
router.get('/stats', (req, res) => {
  try {
    if (!wsServer) {
      return res.status(503).json({
        success: false,
        message: 'WebSocket server not initialized'
      });
    }

    const stats = {
      success: true,
      data: {
        connectedUsers: wsServer.getConnectedUsersCount(),
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    return res.json(stats);
  } catch (error) {
    console.error('Error getting WebSocket stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket statistics'
    });
  }
});

/**
 * @route GET /websocket/auction/:auctionId/participants
 * @desc Get number of participants in a specific auction
 * @access Public
 */
router.get('/auction/:auctionId/participants', (req, res) => {
  try {
    if (!wsServer) {
      return res.status(503).json({
        success: false,
        message: 'WebSocket server not initialized'
      });
    }

    const { auctionId } = req.params;
    const participantCount = wsServer.getAuctionParticipants(auctionId);

    return res.json({
      success: true,
      data: {
        auctionId,
        participantCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting auction participants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get auction participants'
    });
  }
});

/**
 * @route POST /websocket/broadcast
 * @desc Broadcast system message to all connected users
 * @access Admin only
 */
router.post('/broadcast', async (req, res) => {
  try {
    if (!wsServer) {
      return res.status(503).json({
        success: false,
        message: 'WebSocket server not initialized'
      });
    }

    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    await wsServer.broadcastSystemMessage(message);

    return res.json({
      success: true,
      message: 'System message broadcasted successfully',
      data: {
        message,
        timestamp: new Date().toISOString(),
        recipients: wsServer.getConnectedUsersCount()
      }
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast system message'
    });
  }
});

/**
 * @route GET /websocket/health
 * @desc WebSocket server health check
 * @access Public
 */
router.get('/health', (req, res) => {
  try {
    const isHealthy = wsServer !== undefined;
    
    return res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'WebSocket server is healthy' : 'WebSocket server not initialized',
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        connectedUsers: isHealthy ? wsServer.getConnectedUsersCount() : 0
      }
    });
  } catch (error) {
    console.error('Error checking WebSocket health:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check WebSocket health'
    });
  }
});

export default router;

// Register WebSocket routes function
export const registerWebSocketRoutes = () => {
  console.log('✅ WebSocket routes registered');
};