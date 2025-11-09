# Auction Service

Auction Service, araç müzayede platformunun müzayede yönetimi ve teklif işlemlerini gerçekleştiren mikroservisidir. Bu servis, müzayedelerin oluşturulması, yönetimi, teklif alma ve müzayede durumlarının takibi gibi temel işlevleri sağlar.

## 🚀 Özellikler

### Müzayede Yönetimi
- **Müzayede Oluşturma**: Yeni müzayedeler oluşturma ve yapılandırma
- **Müzayede Güncelleme**: Aktif olmayan müzayedelerin güncellenmesi
- **Müzayede Silme**: Müzayedelerin güvenli silinmesi
- **Müzayede Listeleme**: Filtreleme ve sayfalama ile müzayede listeleme
- **Müzayede Detayları**: Tekil müzayede bilgilerinin getirilmesi

### Teklif Sistemi
- **Teklif Alma**: Gerçek zamanlı teklif işlemleri
- **Otomatik Teklif**: Kullanıcı tanımlı maksimum limitlerle otomatik teklif
- **Teklif Validasyonu**: Minimum artış miktarı ve fiyat kontrolü
- **Teklif Geçmişi**: Müzayede teklif geçmişinin takibi

### Durum Yönetimi
- **Otomatik Durum Güncellemeleri**: Zamanlanmış müzayede durumu güncellemeleri
- **Müzayede Uzatma**: Son dakika tekliflerinde otomatik uzatma
- **Sonlandırma**: Müzayedelerin otomatik sonlandırılması

### Gerçek Zamanlı İletişim
- **WebSocket Desteği**: Anlık teklif güncellemeleri
- **Event Broadcasting**: Müzayede olaylarının yayınlanması
- **Bildirim Entegrasyonu**: Notification Service ile entegrasyon

## 📋 API Endpoints

**Not:** Auction Service'de global prefix yoktur. Tüm endpoint'ler direkt `/auctions` path'i ile başlar. API Gateway üzerinden `/api/v1/auctions` olarak erişilebilir.

### Health Check
```http
GET /health
```

### Müzayede İşlemleri

#### Müzayede Listeleme
```http
GET /auctions
```

**Query Parameters:**
- `page` (number): Sayfa numarası (varsayılan: 1)
- `limit` (number): Sayfa başına öğe sayısı (varsayılan: 10)
- `search` (string): Başlık veya açıklama araması
- `status` (enum): Müzayede durumu (DRAFT, SCHEDULED, ACTIVE, ENDED, CANCELLED)
- `sellerId` (string): Satıcı ID'si ile filtreleme
- `vehicleId` (string): Araç ID'si ile filtreleme
- `isFeatured` (boolean): Öne çıkan müzayedeler
- `isActive` (boolean): Aktif müzayedeler
- `minPrice` (number): Minimum fiyat
- `maxPrice` (number): Maksimum fiyat

**Response:**
```json
{
  "data": [
    {
      "id": "auction-id",
      "title": "Mercedes C200 Müzayedesi",
      "description": "2021 model Mercedes C200",
      "vehicleId": "vehicle-id",
      "sellerId": "seller-id",
      "startingPrice": "450000",
      "currentPrice": "450000",
      "reservePrice": "500000",
      "minBidIncrement": "5000",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-22T10:00:00Z",
      "status": "ACTIVE",
      "totalBids": 5,
      "viewCount": 150,
      "watchlistCount": 12
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Müzayede İstatistikleri
```http
GET /auctions/stats
```

#### Müzayede Detayı
```http
GET /auctions/:id
```

#### Müzayede Oluşturma
```http
POST /auctions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Mercedes C200 Müzayedesi",
  "description": "2021 model Mercedes C200, temiz araç",
  "vehicleId": "vehicle-id",
  "sellerId": "seller-id",
  "startingPrice": 450000,
  "reservePrice": 500000,
  "minBidIncrement": 5000,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-22T10:00:00Z",
  "autoExtendMinutes": 10,
  "isFeatured": false
}
```

#### Müzayede Güncelleme
```http
PATCH /auctions/:id
Authorization: Bearer <token>
```

#### Müzayede Silme
```http
DELETE /auctions/:id
Authorization: Bearer <token>
```

#### Watchlist İşlemleri
```http
POST /auctions/:id/watchlist
Authorization: Bearer <token>
Body: { "userId": "user-id" }

DELETE /auctions/:id/watchlist/:userId
Authorization: Bearer <token>
```

### Teklif İşlemleri

#### Teklif Verme
```http
POST /auctions/:id/bids
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 460000,
  "isAutomatic": false,
  "maxAmount": 500000
}
```

#### Müzayede Tekliflerini Listeleme
```http
GET /auctions/:id/bids
```

### Durum Güncellemeleri

#### Manuel Durum Güncelleme
```http
POST /auctions/update-statuses
```

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Veritabanı migrasyonlarını çalıştır
npx prisma migrate deploy

# Veritabanını seed'le
npx prisma db seed
```

### Geliştirme Ortamı
```bash
# Geliştirme modunda çalıştır
npm run start:dev

# Test modunda çalıştır
npm run test

# E2E testleri çalıştır
npm run test:e2e
```

### Üretim Ortamı
```bash
# Uygulamayı build et
npm run build

# Üretim modunda çalıştır
npm run start:prod
```

## ⚙️ Yapılandırma

### Ortam Değişkenleri

```env
# Sunucu Yapılandırması
PORT=4003
NODE_ENV=production
# Not: Global prefix yok, endpoint'ler direkt /auctions ile başlar

# Veritabanı
DATABASE_URL="postgresql://user:password@localhost:5432/auction_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret"

# Diğer Servisler
VEHICLE_SERVICE_URL="http://localhost:4002"
BID_SERVICE_URL="http://localhost:4004"
NOTIFICATION_SERVICE_URL="http://localhost:4005"
PAYMENT_SERVICE_URL="http://localhost:4006"

# WebSocket
WEBSOCKET_PORT=4013

# Cron Jobs
ENABLE_CRON_JOBS=true
AUCTION_STATUS_UPDATE_INTERVAL="*/5 * * * *"

# Müzayede Ayarları
DEFAULT_AUTO_EXTEND_MINUTES=10
MAX_AUCTION_DURATION_DAYS=30
MIN_BID_INCREMENT=100
```

## 🗄️ Veritabanı Şeması

### Auction Tablosu
```sql
CREATE TABLE auctions (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  vehicle_id VARCHAR NOT NULL,
  seller_id VARCHAR NOT NULL,
  starting_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  reserve_price DECIMAL(10,2),
  min_bid_increment DECIMAL(10,2) DEFAULT 100,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  extended_end_time TIMESTAMP,
  auto_extend_minutes INTEGER DEFAULT 10,
  status auction_status DEFAULT 'DRAFT',
  is_active BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  total_bids INTEGER DEFAULT 0,
  highest_bidder_id VARCHAR,
  view_count INTEGER DEFAULT 0,
  watchlist_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Bid Tablosu
```sql
CREATE TABLE bids (
  id VARCHAR PRIMARY KEY,
  auction_id VARCHAR NOT NULL REFERENCES auctions(id),
  bidder_id VARCHAR NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_automatic BOOLEAN DEFAULT false,
  max_amount DECIMAL(10,2),
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Watchlist Tablosu
```sql
CREATE TABLE watchlists (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  auction_id VARCHAR NOT NULL REFERENCES auctions(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, auction_id)
);
```

## 🔒 Güvenlik

### Kimlik Doğrulama
- JWT token tabanlı kimlik doğrulama
- Bearer token formatı
- Token süresi: 24 saat

### Yetkilendirme
- Rol tabanlı erişim kontrolü (RBAC)
- Müzayede sahipliği kontrolü
- Admin yetkisi gerektiren işlemler

### Veri Validasyonu
- DTO tabanlı giriş validasyonu
- Fiyat ve tarih kontrolü
- XSS ve SQL injection koruması

### Rate Limiting
- API endpoint'leri için rate limiting
- Teklif işlemleri için özel limitler
- IP tabanlı kısıtlamalar

## 🧪 Test

### Unit Testler
```bash
# Tüm unit testleri çalıştır
npm run test

# Belirli bir dosyayı test et
npm run test auctions.service.spec.ts

# Coverage raporu
npm run test:cov
```

### Integration Testler
```bash
# Integration testleri çalıştır
npm run test:e2e

# Belirli bir test suite'i çalıştır
npm run test:e2e -- --grep "Auction CRUD"
```

### Test Senaryoları

#### Müzayede CRUD İşlemleri
- ✅ Müzayede oluşturma
- ✅ Müzayede listeleme ve filtreleme
- ✅ Müzayede detayı getirme
- ✅ Müzayede güncelleme
- ✅ Müzayede silme

#### Teklif İşlemleri
- ✅ Geçerli teklif verme
- ✅ Geçersiz teklif kontrolü
- ✅ Otomatik teklif sistemi
- ✅ Teklif geçmişi

#### Durum Geçişleri
- ✅ DRAFT → SCHEDULED
- ✅ SCHEDULED → ACTIVE
- ✅ ACTIVE → ENDED
- ✅ Müzayede uzatma

## 📊 Monitoring ve Logging

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "auction-service",
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": "2h 30m 15s",
  "database": "connected",
  "redis": "connected"
}
```

### Metrics
- API response times
- Database query performance
- Active auction count
- Bid processing rate
- WebSocket connection count

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking
- Performance monitoring

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4003
CMD ["npm", "run", "start:prod"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auction-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auction-service
  template:
    metadata:
      labels:
        app: auction-service
    spec:
      containers:
      - name: auction-service
        image: auction-service:latest
        ports:
        - containerPort: 4003
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## 🔗 Diğer Servislerle Entegrasyon

### Vehicle Service
- Araç bilgilerinin doğrulanması
- Araç durumu kontrolü
- Araç sahipliği doğrulaması

### Bid Service
- Teklif işleme ve validasyon
- Otomatik teklif yönetimi
- Teklif geçmişi

### Notification Service
- Müzayede başlangıç bildirimleri
- Teklif bildirimleri
- Müzayede sonuç bildirimleri

### Payment Service
- Kazanan teklif ödemesi
- Ödeme durumu takibi
- Para iadesi işlemleri

### API Gateway
- Route proxy
- Rate limiting
- Authentication middleware

## 🐛 Troubleshooting

### Yaygın Sorunlar

#### Müzayede Oluşturulamıyor
```bash
# Veritabanı bağlantısını kontrol et
npm run db:check

# Araç servisinin çalıştığını doğrula
curl http://localhost:4002/health
```

#### Teklifler İşlenmiyor
```bash
# Redis bağlantısını kontrol et
redis-cli ping

# Bid servisinin durumunu kontrol et
curl http://localhost:4004/health
```

#### WebSocket Bağlantı Sorunu
```bash
# WebSocket portunu kontrol et
netstat -an | grep 4013

# Firewall ayarlarını kontrol et
```

### Log Analizi
```bash
# Hata loglarını görüntüle
docker logs auction-service | grep ERROR

# Performans loglarını analiz et
docker logs auction-service | grep "response_time"
```

## 📚 API Dokümantasyonu

Swagger UI: `http://localhost:4003/api/docs`

### Postman Collection
Proje kök dizininde `postman/auction-service.json` dosyasında Postman collection'ı bulunmaktadır.

### API Versioning
- Mevcut versiyon: v1
- Base URL: `/api/v1`
- Backward compatibility desteği

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Geliştirici**: Vehicle Auction Platform Team
- **Email**: dev@vehicleauction.com
- **Dokümantasyon**: https://docs.vehicleauction.com
- **Issue Tracker**: https://github.com/vehicle-auction/issues