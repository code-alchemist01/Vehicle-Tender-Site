import { io, Socket } from 'socket.io-client'
import { API_BASE_URLS } from './api/config'

let socket: Socket | null = null

export const getSocket = (token?: string): Socket | null => {
  // If socket already exists and is connected, return it
  if (socket && socket.connected) {
    return socket
  }

  // Get API Gateway URL (WebSocket server)
  // API Gateway runs on port 4008, but WebSocket might be on different path
  // Vite uses import.meta.env instead of process.env
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4008'
  
  try {
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      auth: token
        ? {
            token: `Bearer ${token}`,
          }
        : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected to WebSocket server')
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })

    socket.on('authenticated', (data) => {
      console.log('[Socket] Authenticated:', data)
    })

    return socket
  } catch (error) {
    console.error('[Socket] Failed to create socket connection:', error)
    return null
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default getSocket

