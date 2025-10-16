# Vehicle Auction Platform - Backend

Araç müzayede platformunun mikroservis mimarisi ile geliştirilmiş backend sistemi. Node.js, TypeScript, PostgreSQL, Redis ve Docker teknolojileri kullanılarak oluşturulmuştur.

## 🏗️ Mimari Genel Bakış

### Mikroservis Yapısı
- **API Gateway**: Tüm servislere yönlendirme, kimlik doğrulama, rate limiting
- **Auth Service**: Kullanıcı kimlik doğrulama, JWT token yönetimi
- **Vehicle Service**: Araç ve kategori yönetimi
- **Auction Service**: Müzayede yönetimi, gerçek zamanlı iletişim
- **Bid Service**: Teklif yönetimi, otomatik teklif sistemi
- **Payment Service**: Ödeme işlemleri (Stripe, PayTR)
- **Notification Service**: E-posta, SMS, push bildirimleri

### Teknoloji Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: PostgreSQL (her servis için ayrı DB)
- **Cache**: Redis
- **ORM**: Prisma
- **Container**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Authentication**: JWT
- **Real-time**: WebSocket

## 🚀 Quick Start

### Docker ile Çalıştırma (Önerilen)

```bash
# Projeyi klonlayın
git clone <repository-url>
cd vehicle-auction-platform

# Docker container'ları başlatın
docker-compose up -d

# Servislerin durumunu kontrol edin
docker-compose ps
```

**Servis URL'leri:**
- **API Gateway**: http://localhost:4008
- **Auth Service**: http://localhost:4001  
- **Vehicle Service**: http://localhost:4002
- **Auction Service**: http://localhost:4003
- **Bid Service**: http://localhost:4004
- **Payment Service**: http://localhost:4005
- **Notification Service**: http://localhost:4006

### Gereksinimler
- Docker & Docker Compose
- Node.js 18+ (local development için)
- PostgreSQL 15+ (local development için)
- Redis 7+ (local development için)

### Docker ile Kurulum
```bash
# Repository'yi klonla
git clone <repository-url>
cd vehicle-auction-platform/apps/backend

# Environment dosyalarını kopyala
cp .env.example .env

# Servisleri başlat
docker-compose up -d

# Veritabanı migration'larını çalıştır
docker-compose exec auth-service npm run prisma:migrate
docker-compose exec vehicle-service npm run prisma:migrate
docker-compose exec auction-service npm run prisma:migrate
docker-compose exec bid-service npm run prisma:migrate
docker-compose exec payment-service npm run prisma:migrate
docker-compose exec notification-service npm run prisma:migrate
```

### Local Development
```bash
# Her servis için ayrı ayrı
cd auth-service
npm install
npm run dev

# Veya tüm servisleri paralel çalıştır
npm run dev:all
```

## 📊 Servis Detayları

### 🔐 Auth Service (Port: 4001)
**Özellikler**: JWT kimlik doğrulama, rol tabanlı erişim, kullanıcı profil yönetimi
**Endpoints**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/profile`
**Database**: `vehicle_auction_auth`

### 🚗 Vehicle Service (Port: 4002)
**Özellikler**: Araç CRUD, kategori yönetimi, filtreleme, sayfalama
**Endpoints**: `/vehicles`, `/categories`, `/vehicles/search`
**Database**: `vehicle_auction_vehicles`

### 🏆 Auction Service (Port: 4003)
**Özellikler**: Müzayede yönetimi, gerçek zamanlı WebSocket, otomatik durum güncellemeleri
**Endpoints**: `/auctions`, `/auctions/:id/bids`, WebSocket: `/ws`
**Database**: `vehicle_auction_auction`

### 💰 Bid Service (Port: 4004)
**Özellikler**: Manuel/otomatik teklif, Redis queue, rate limiting
**Endpoints**: `/bids`, `/bids/auto`, `/bids/history`
**Database**: `vehicle_auction_bid`

### 💳 Payment Service (Port: 4005)
**Özellikler**: Stripe/PayTR entegrasyonu, webhook desteği, ödeme geçmişi
**Endpoints**: `/payments`, `/payments/stripe`, `/payments/paytr`
**Database**: `vehicle_auction_payment`

### 📧 Notification Service (Port: 4006)
**Özellikler**: E-posta, SMS, push bildirimleri, kullanıcı tercihleri
**Endpoints**: `/notifications`, `/notifications/preferences`
**Database**: `vehicle_auction_notification`

### 🌐 API Gateway (Port: 4008)
**Özellikler**: Reverse proxy, JWT middleware, CORS, rate limiting
**Routes**: Tüm servislere yönlendirme (`/api/auth/*`, `/api/vehicles/*`, vb.)

## 🗄️ Veritabanı Yapısı

### PostgreSQL Databases
- `vehicle_auction_auth`: Kullanıcılar, roller, token'lar
- `vehicle_auction_vehicles`: Araçlar, kategoriler, özellikler
- `vehicle_auction_auction`: Müzayedeler, durumlar
- `vehicle_auction_bid`: Teklifler, otomatik teklif kuralları
- `vehicle_auction_payment`: Ödemeler, işlem geçmişi
- `vehicle_auction_notification`: Bildirimler, kullanıcı tercihleri

### Redis Cache
- Session yönetimi
- Rate limiting
- Real-time data caching
- Queue management (bid processing)

## 🔧 Yapılandırma

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Services URLs (for API Gateway)
AUTH_SERVICE_URL=http://auth-service:4001
VEHICLE_SERVICE_URL=http://vehicle-service:4002
AUCTION_SERVICE_URL=http://auction-service:4003
BID_SERVICE_URL=http://bid-service:4004
PAYMENT_SERVICE_URL=http://payment-service:4005
NOTIFICATION_SERVICE_URL=http://notification-service:4006

# Payment Providers
STRIPE_SECRET_KEY=sk_test_...
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key

# Email (Notification Service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🐳 Docker Compose Servisleri

### Infrastructure
- **PostgreSQL**: Ana veritabanı (port: 5432)
- **PgAdmin**: Veritabanı yönetimi (port: 5050)
- **Redis**: Cache ve queue (port: 6379)
- **Nginx**: Reverse proxy (port: 80)

### Application Services
Tüm mikroservisler otomatik olarak başlatılır ve birbirleriyle iletişim kurar.

## 🔍 Monitoring & Health Checks

### Health Endpoints
```bash
# Tüm servisler için health check
curl http://localhost:4008/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health
curl http://localhost:4005/health
curl http://localhost:4006/health
```

### Logs
```bash
# Tüm servislerin logları
docker-compose logs -f

# Belirli servis logları
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
```

### Database Management
```bash
# PgAdmin'e erişim
http://localhost:5050
# Email: admin@admin.com
# Password: admin

# Redis CLI
docker-compose exec redis redis-cli
```

## 🧪 Test & Development

### API Testing
- **Swagger Docs**: Her serviste `/docs` endpoint'i
- **Postman Collection**: `docs/postman/` klasöründe
- **Health Checks**: Tüm servislerde `/health` endpoint'i

### Development Commands
```bash
# Tüm servisleri development modunda başlat
npm run dev:all

# Belirli servisi başlat
cd auth-service && npm run dev

# Database migration
npm run prisma:migrate

# Database seed
npm run prisma:seed

# Tests
npm run test
npm run test:e2e
```

## 🔒 Güvenlik

- **JWT Authentication**: Tüm korumalı endpoint'ler için
- **Rate Limiting**: API Gateway seviyesinde
- **CORS**: Yapılandırılabilir origin kontrolü
- **Input Validation**: Joi/Zod ile veri doğrulama
- **SQL Injection**: Prisma ORM koruması
- **Security Headers**: Helmet.js ile

## 📈 Performans

- **Redis Caching**: Sık kullanılan veriler için
- **Database Indexing**: Optimized queries
- **Connection Pooling**: PostgreSQL bağlantı havuzu
- **Async Processing**: Queue-based bid processing
- **Load Balancing**: Nginx reverse proxy

## 🚨 Troubleshooting

### Yaygın Sorunlar
```bash
# Port çakışması
docker-compose down && docker-compose up -d

# Database bağlantı sorunu
docker-compose restart postgres

# Redis bağlantı sorunu
docker-compose restart redis

# Service discovery sorunu
docker-compose restart api-gateway
```

### Debug Mode
```bash
# Debug logları aktif et
DEBUG=* docker-compose up

# Belirli servis için debug
DEBUG=auth-service:* npm run dev
```

## 📚 API Dokümantasyonu

- **API Gateway**: http://localhost:4008/docs
- **Auth Service**: http://localhost:4001/docs
- **Vehicle Service**: http://localhost:4002/docs
- **Auction Service**: http://localhost:4003/docs
- **Bid Service**: http://localhost:4004/docs
- **Payment Service**: http://localhost:4005/docs
- **Notification Service**: http://localhost:4006/docs

## 🤝 Katkıda Bulunma

1. Feature branch oluştur: `git checkout -b feature/new-feature`
2. Değişiklikleri commit et: `git commit -am 'Add new feature'`
3. Branch'i push et: `git push origin feature/new-feature`
4. Pull Request oluştur

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.