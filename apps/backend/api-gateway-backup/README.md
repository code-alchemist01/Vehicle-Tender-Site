# 🚗 Vehicle Auction Platform - API Gateway

## 📋 İçindekiler
- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Mimari](#mimari)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [API Endpoint'leri](#api-endpointleri)
- [WebSocket Bağlantıları](#websocket-bağlantıları)
- [Güvenlik](#güvenlik)
- [Monitoring ve Logging](#monitoring-ve-logging)
- [Test](#test)
- [Deployment](#deployment)
- [Sorun Giderme](#sorun-giderme)

## 🎯 Genel Bakış

Vehicle Auction Platform API Gateway, mikroservis mimarisinde merkezi giriş noktası olarak görev yapan Express.js tabanlı bir uygulamadır. Tüm istemci isteklerini ilgili mikroservislere yönlendirir ve WebSocket desteği ile gerçek zamanlı iletişim sağlar.

### 🏗️ Temel Sorumluluklar
- **Routing**: İstekleri doğru mikroservislere yönlendirme
- **Authentication**: JWT tabanlı kimlik doğrulama
- **Rate Limiting**: İstek sınırlama ve DDoS koruması
- **Load Balancing**: Servisler arası yük dağılımı
- **WebSocket**: Gerçek zamanlı açık artırma iletişimi
- **Logging**: Merkezi log yönetimi
- **Health Monitoring**: Servis sağlık kontrolü

## ✨ Özellikler

### 🔐 Güvenlik
- **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- **Rate Limiting**: IP bazlı istek sınırlama
- **CORS**: Cross-Origin Resource Sharing desteği
- **Helmet**: HTTP güvenlik başlıkları
- **Input Validation**: Giriş verisi doğrulama

### 🌐 Networking
- **HTTP Proxy**: Mikroservislere şeffaf yönlendirme
- **WebSocket**: Socket.IO ile gerçek zamanlı iletişim
- **Health Checks**: Otomatik servis sağlık kontrolü
- **Circuit Breaker**: Hatalı servislere karşı koruma

### 📊 Monitoring
- **Winston Logging**: Yapılandırılabilir log seviyeleri
- **Request Tracing**: Correlation ID ile istek takibi
- **Performance Metrics**: Yanıt süresi ve throughput ölçümü
- **Error Tracking**: Hata yakalama ve raporlama

## 🏛️ Mimari

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │   Third Party   │
│   (React)       │    │   (React Native)│    │   Integrations  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway          │
                    │   (Express.js + Socket.IO)│
                    └─────────────┬─────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│ Auth Service   │    │ Auction Service   │    │ Vehicle Service   │
│ (Port: 4001)   │    │ (Port: 4003)      │    │ (Port: 4002)      │
└───────────────┘    └───────────────────┘    └───────────────────┘
        │                       │                        │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│ Bid Service    │    │ Payment Service   │    │Notification Service│
│ (Port: 4004)   │    │ (Port: 4005)      │    │ (Port: 4006)      │
└───────────────┘    └───────────────────┘    └───────────────────┘
```

### 🔄 Request Flow
1. **İstemci İsteği**: Frontend/Mobile app API Gateway'e istek gönderir
2. **Authentication**: JWT token doğrulanır (gerekirse)
3. **Rate Limiting**: İstek sınırları kontrol edilir
4. **Routing**: İstek uygun mikroservise yönlendirilir
5. **Proxy**: HTTP proxy ile istek iletilir
6. **Response**: Yanıt istemciye geri döndürülür

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Redis (opsiyonel, development'ta devre dışı)

### Adım Adım Kurulum

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd vehicle-auction-platform/apps/backend/api-gateway-backup
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment dosyasını oluşturun**
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

4. **Uygulamayı derleyin**
```bash
npm run build
```

5. **Uygulamayı başlatın**
```bash
# Development (TypeScript ile direkt çalıştırma)
npm run start:dev

# Production (Derlenmiş JavaScript ile)
npm start
# veya
npm run start:prod
```

## ⚙️ Yapılandırma

### Environment Variables

```env
# Server Configuration
PORT=4008
HOST=0.0.0.0
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Service URLs
AUTH_SERVICE_URL=http://localhost:4001
VEHICLE_SERVICE_URL=http://localhost:4002
AUCTION_SERVICE_URL=http://localhost:4003
BID_SERVICE_URL=http://localhost:4004
PAYMENT_SERVICE_URL=http://localhost:4005
NOTIFICATION_SERVICE_URL=http://localhost:4006

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Servis Yapılandırması

API Gateway aşağıdaki mikroservislere bağlanır:

| Servis | Port | Health Check | Açıklama |
|--------|------|--------------|----------|
| Auth Service | 4001 | `/api/v1/auth/health` | Kimlik doğrulama ve yetkilendirme |
| Vehicle Service | 4002 | `/api/v1/health` | Araç bilgileri yönetimi |
| Auction Service | 4003 | `/api/v1/health` | Açık artırma yönetimi |
| Bid Service | 4004 | `/health` | Teklif yönetimi |
| Payment Service | 4005 | `/health` | Ödeme işlemleri |
| Notification Service | 4006 | `/notifications/health` | Bildirim servisi |

## 🛣️ API Endpoint'leri

### 🏥 Health Check Endpoints

```http
GET /health
GET /api/health
```

**Yanıt:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T23:04:09.753Z",
  "uptime": 402.0549006,
  "version": "1.0.0",
  "environment": "development"
}
```

### 📚 API Documentation

```http
GET /api
```

**Yanıt:**
```json
{
  "name": "Vehicle Auction Platform API Gateway",
  "version": "1.0.0",
  "description": "API Gateway for Vehicle Auction Platform microservices",
  "endpoints": {
    "health": "/health",
    "auth": "/api/v1/auth",
    "auctions": "/api/v1/auctions",
    "bids": "/api/v1/bids",
    "payments": "/api/v1/payments",
    "vehicles": "/api/v1/vehicles",
    "notifications": "/api/v1/notifications"
  },
  "documentation": {
    "swagger": "/api/docs",
    "postman": "/api/postman"
  },
  "timestamp": "2025-10-16T23:05:00.516Z"
}
```

### 🔐 Authentication Endpoints

```http
# Public Endpoints
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification

# Protected Endpoints (JWT Required)
GET /api/v1/auth/profile
PUT /api/v1/auth/profile
POST /api/v1/auth/change-password
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token

# Optional Auth
GET /api/v1/auth/me
```

### 🚗 Vehicle Endpoints

```http
# Public Endpoints
GET /api/v1/vehicles              # List vehicles
GET /api/v1/vehicles/search       # Search vehicles
GET /api/v1/vehicles/featured     # Featured vehicles
GET /api/v1/vehicles/categories   # Vehicle categories
GET /api/v1/vehicles/makes        # Vehicle makes
GET /api/v1/vehicles/:id          # Get vehicle details

# Protected Endpoints (JWT Required)
POST /api/v1/vehicles             # Create vehicle
PUT /api/v1/vehicles/:id          # Update vehicle
DELETE /api/v1/vehicles/:id       # Delete vehicle
POST /api/v1/vehicles/:id/images  # Upload images
```

### 🏛️ Auction Endpoints

```http
# Public Endpoints
GET /api/v1/auctions              # List auctions
GET /api/v1/auctions/search       # Search auctions
GET /api/v1/auctions/featured     # Featured auctions
GET /api/v1/auctions/:id          # Get auction details

# Protected Endpoints (JWT Required)
POST /api/v1/auctions             # Create auction
PUT /api/v1/auctions/:id          # Update auction
DELETE /api/v1/auctions/:id       # Delete auction
POST /api/v1/auctions/:id/start   # Start auction
POST /api/v1/auctions/:id/end     # End auction
```

### 💰 Bid Endpoints

```http
# Protected Endpoints (JWT Required)
GET /api/v1/bids                  # List user bids
POST /api/v1/bids                 # Place bid
GET /api/v1/bids/:id              # Get bid details
PUT /api/v1/bids/:id              # Update bid
DELETE /api/v1/bids/:id           # Cancel bid
GET /api/v1/bids/auction/:id      # Get auction bids
```

### 💳 Payment Endpoints

```http
# Protected Endpoints (JWT Required)
GET /api/v1/payments              # List payments
POST /api/v1/payments             # Create payment
GET /api/v1/payments/:id          # Get payment details
POST /api/v1/payments/:id/confirm # Confirm payment
POST /api/v1/payments/:id/refund  # Refund payment

# Public Endpoints
POST /api/v1/payments/validate    # Validate payment data
POST /api/v1/payments/calculate-fees # Calculate fees
```

### 🔔 Notification Endpoints

```http
# Protected Endpoints (JWT Required)
GET /api/v1/notifications         # List notifications
POST /api/v1/notifications        # Send notification
GET /api/v1/notifications/:id     # Get notification
PUT /api/v1/notifications/:id/read # Mark as read
DELETE /api/v1/notifications/:id  # Delete notification
```

## 🔌 WebSocket Bağlantıları

### Bağlantı Kurma

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4008', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});
```

### 📡 WebSocket Events

#### Client → Server Events

```javascript
// Açık artırmaya katılma
socket.emit('join-auction', {
  auctionId: 'auction-123',
  userId: 'user-456'
});

// Açık artırmadan ayrılma
socket.emit('leave-auction', {
  auctionId: 'auction-123',
  userId: 'user-456'
});

// Teklif verme
socket.emit('place-bid', {
  auctionId: 'auction-123',
  userId: 'user-456',
  amount: 15000,
  timestamp: new Date().toISOString()
});

// İstatistik alma
socket.emit('get-stats');
```

#### Server → Client Events

```javascript
// Açık artırma güncellemeleri
socket.on('auction-update', (data) => {
  console.log('Auction updated:', data);
});

// Teklif kabul edildi
socket.on('bid-accepted', (data) => {
  console.log('Bid accepted:', data);
});

// Teklif reddedildi
socket.on('bid-rejected', (data) => {
  console.log('Bid rejected:', data);
});

// Açık artırma bitti
socket.on('auction-ended', (data) => {
  console.log('Auction ended:', data);
});

// İstatistikler
socket.on('stats', (data) => {
  console.log('WebSocket stats:', data);
});

// Bağlantı olayları
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error);
});
```

### 🧪 WebSocket Test

WebSocket bağlantısını test etmek için test sayfalarını kullanabilirsiniz:

```bash
# Tarayıcıda test sayfalarını açın
http://localhost:4008/test-websocket.html
# veya
http://localhost:4008/websocket-test.html

# Dosya yolu ile açmak için
file:///path/to/test-websocket.html
```

**Test Sayfası Özellikleri:**
- ✅ Development modunda authentication bypass
- 🔌 WebSocket bağlantı testi
- 📡 Gerçek zamanlı event gönderme/alma
- 📊 Bağlantı durumu ve istatistikler

## 🔒 Güvenlik

### JWT Authentication

```javascript
// Header'da token gönderme
Authorization: Bearer <jwt-token>

// Token yapısı
{
  "userId": "user-123",
  "email": "user@example.com",
  "role": "user",
  "iat": 1634567890,
  "exp": 1634654290
}
```

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General | 100 requests | 15 minutes |
| Auth (login/register) | 5 requests | 15 minutes |
| Public | 200 requests | 15 minutes |

### CORS Policy

```javascript
{
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}
```

### Security Headers

- **Content Security Policy**: XSS koruması
- **X-Frame-Options**: Clickjacking koruması
- **X-Content-Type-Options**: MIME type sniffing koruması
- **Referrer-Policy**: Referrer bilgisi kontrolü

## 📊 Monitoring ve Logging

### Health Check
```bash
# Sunucu durumunu kontrol et
curl http://localhost:4008/health

# WebSocket durumunu kontrol et
curl http://localhost:4008/api/websocket/health
```

### API Dokümantasyonu
```bash
# API dokümantasyonuna erişim
http://localhost:4008/api-docs
# veya
http://localhost:4008/
```

### Log Seviyeleri

- **error**: Kritik hatalar
- **warn**: Uyarılar
- **info**: Genel bilgiler
- **debug**: Detaylı debug bilgileri

### Logs
- **Error Logs**: `logs/error.log`
- **Combined Logs**: `logs/combined.log`
- **Console Logs**: Gerçek zamanlı terminal çıktısı

**Log Görüntüleme:**
```bash
# Windows PowerShell
Get-Content logs/combined.log -Tail 50 -Wait

# Son hataları görüntüle
Get-Content logs/error.log -Tail 20
```

### Log Formatı

```json
{
  "timestamp": "2025-10-16T23:04:09.753Z",
  "level": "info",
  "message": "Request processed",
  "correlationId": "req-123-456",
  "method": "GET",
  "path": "/api/v1/vehicles",
  "statusCode": 200,
  "responseTime": 45,
  "userId": "user-123"
}
```

### Health Monitoring

```http
GET /health
```

**Yanıt:**
```json
{
  "status": "healthy",
  "services": {
    "auth-service": "healthy",
    "vehicle-service": "unhealthy",
    "auction-service": "healthy"
  },
  "uptime": 3600,
  "memory": {
    "used": "45MB",
    "total": "512MB"
  }
}
```

## 📚 Dokümantasyon

### Mevcut Endpoint'ler
- **Ana Sayfa**: http://localhost:4008/
- **API Dokümantasyonu**: http://localhost:4008/api-docs
- **Health Check**: http://localhost:4008/health
- **WebSocket Health**: http://localhost:4008/api/websocket/health
- **WebSocket Test**: http://localhost:4008/test-websocket.html

## 🧪 Test

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### WebSocket Tests

```bash
# Test dosyasını tarayıcıda açın
open test-websocket.html
```

### API Tests

```bash
# Postman collection'ı import edin
# Veya curl ile test edin

curl -X GET http://localhost:4008/health
curl -X GET http://localhost:4008/api
```

### Load Testing

```bash
# Artillery ile load test
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:4008/health
```

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.production ./.env

EXPOSE 4008
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api-gateway:
    build: .
    ports:
      - "4008:4008"
    environment:
      - NODE_ENV=production
      - PORT=4008
    depends_on:
      - redis
      - auth-service
      - vehicle-service
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### Production Checklist

- [ ] Environment variables ayarlandı
- [ ] SSL/TLS sertifikaları yapılandırıldı
- [ ] Rate limiting production değerleri
- [ ] Log rotation yapılandırıldı
- [ ] Health check endpoint'leri test edildi
- [ ] Monitoring ve alerting kuruldu
- [ ] Backup stratejisi belirlendi

## 🔧 Sorun Giderme

### Yaygın Sorunlar

#### 1. Redis Bağlantı Hatası

```
Error: ECONNREFUSED 127.0.0.1:6379
```

**Çözüm:**
- Redis servisinin çalıştığını kontrol edin
- Development'ta Redis devre dışı bırakılmıştır

#### 2. Mikroservis Bağlantı Hatası

```
Service Unavailable: auth-service
```

**Çözüm:**
- İlgili mikroservisin çalıştığını kontrol edin
- Health check endpoint'ini test edin
- Network bağlantısını kontrol edin

#### 3. JWT Token Hatası

```
Unauthorized: Invalid token
```

**Çözüm:**
- Token'ın doğru format'ta olduğunu kontrol edin
- Token'ın expire olmadığını kontrol edin
- JWT_SECRET'in doğru olduğunu kontrol edin

#### 4. CORS Hatası

```
Access to fetch blocked by CORS policy
```

**Çözüm:**
- CORS_ORIGINS environment variable'ını kontrol edin
- Frontend URL'ini CORS listesine ekleyin

#### 5. WebSocket Bağlantı Hatası

```
WebSocket connection failed
```

**Çözüm:**
- Socket.IO server'ının çalıştığını kontrol edin
- Firewall ayarlarını kontrol edin
- Proxy ayarlarını kontrol edin

### WebSocket Bağlantı Sorunları

**Problem:** WebSocket bağlantısı kurulamıyor
```bash
# 1. Sunucunun çalıştığını kontrol edin
curl http://localhost:4008/health

# 2. WebSocket portunu kontrol edin
netstat -an | findstr :4008

# 3. Logları kontrol edin
# Log dosyalarını görüntülemek için:
Get-Content logs/combined.log -Tail 50
# veya
Get-Content logs/error.log -Tail 50

# 4. Development modunda authentication bypass aktif mi?
# .env dosyasında NODE_ENV=development olduğundan emin olun
```

**Problem:** Authentication hatası alıyorum
```bash
# Development modunda token gerekmez
# Production modunda geçerli JWT token gerekir
# .env dosyasındaki JWT_SECRET'ı kontrol edin
```

**Problem:** Proxy hatası alıyorum
```bash
# Hedef servislerin çalıştığını kontrol edin
docker ps
# veya
docker-compose ps

# Servisleri başlatın
docker-compose up -d
```

### Debug Modu

```bash
# Debug logları aktif etme
LOG_LEVEL=debug npm start

# Specific module debug
# Windows PowerShell
$env:DEBUG="socket.io*"; npm start

# Windows CMD
set DEBUG=socket.io* && npm start

# Linux/Mac
DEBUG=socket.io* npm start
```

**Debug Çıktısı:**
- 🔍 Detaylı request/response logları
- 🔌 WebSocket event izleme
- 🛡️ Authentication süreç detayları
- 🔄 Proxy yönlendirme bilgileri

### Performance İzleme

```javascript
// Response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## 🤝 Destek

### İletişim
- **Email**: support@vehicleauction.com
- **GitHub Issues**: [Repository Issues]

### Dokümantasyon
- **API Dokümantasyonu**: http://localhost:4008/api-docs
- **WebSocket Test**: http://localhost:4008/test-websocket.html
- **Health Check**: http://localhost:4008/health

---

## 📝 Changelog

### v1.0.0 (2025-01-16)
- ✅ İlk stable release
- ✅ Tüm mikroservis proxy'leri
- ✅ WebSocket desteği ve test sayfaları
- ✅ JWT authentication (development bypass)
- ✅ Rate limiting
- ✅ Health monitoring
- ✅ Comprehensive logging
- ✅ CORS yapılandırması
- ✅ Security headers
- ✅ TypeScript desteği

---

**🎉 API Gateway başarıyla çalışıyor! WebSocket bağlantıları aktif ve tüm proxy yönlendirmeleri yapılandırılmış durumda.**