// ✅ YÖNTEM 4: Socket.IO'yu ayrı port'ta çalıştır
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const SOCKET_PORT = 4010; // Port değiştir

// Basit HTTP server oluştur
const server = createServer();

// Socket.IO server oluştur (Redis olmadan basit test)
const io = new SocketIOServer(server, {
  path: '/socket.io/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Basit connection handler
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
  
  socket.emit('welcome', { message: 'Connected to standalone Socket.IO server' });
});

// Server'ı başlat
server.listen(SOCKET_PORT, () => {
  console.log(`🚀 Standalone Socket.IO server running on port ${SOCKET_PORT}`);
  console.log(`🔌 Test URL: http://localhost:${SOCKET_PORT}/socket.io/?EIO=4&transport=polling&t=123`);
});

export default io;