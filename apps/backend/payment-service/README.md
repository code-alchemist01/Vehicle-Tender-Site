# Payment Service

Vehicle Auction Platform için ödeme işlemlerini yöneten mikroservis.

## 🚀 Özellikler

- **Stripe Entegrasyonu**: Güvenli kredi kartı ödemeleri
- **PayTR Entegrasyonu**: Türk ödeme sistemleri desteği
- **Webhook Desteği**: Gerçek zamanlı ödeme durumu güncellemeleri
- **JWT Kimlik Doğrulama**: Güvenli API erişimi
- **PostgreSQL Veritabanı**: Ödeme verilerinin güvenli saklanması
- **Redis Cache**: Performans optimizasyonu
- **Rate Limiting**: API güvenliği

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm veya yarn

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre değişkenlerini yapılandırın:**
   ```bash
   cp .env.example .env
   ```

3. **Veritabanını başlatın:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Servisi başlatın:**
   ```bash
   # Geliştirme modu
   npm run start:dev
   
   # Production modu
   npm run start:prod
   ```

## ⚙️ Çevre Değişkenleri

```env
# Temel Yapılandırma
NODE_ENV=development
PORT=3003
HOST=localhost

# Veritabanı
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_auction_payment"

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# Stripe Yapılandırması
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2025-09-30.yonca

# PayTR Yapılandırması
PAYTR_MERCHANT_ID=your-merchant-id
PAYTR_MERCHANT_KEY=your-merchant-key
PAYTR_MERCHANT_SALT=your-merchant-salt
PAYTR_SUCCESS_URL=http://localhost:3000/payment/success
PAYTR_FAIL_URL=http://localhost:3000/payment/fail

# Ödeme Yapılandırması
PAYMENT_TIMEOUT_MINUTES=30
```

## 🔌 API Endpoints

### Kimlik Doğrulama Gerektiren Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/payments` | Yeni ödeme oluştur |
| POST | `/payments/:id/process` | Ödemeyi işle |
| GET | `/payments/:id` | Ödeme detaylarını getir |
| GET | `/payments/auction/:auctionId` | Müzayede ödemelerini listele |
| GET | `/payments/bidder/:bidderId` | Kullanıcı ödemelerini listele |
| DELETE | `/payments/:id/cancel` | Ödemeyi iptal et |
| GET | `/payments/statistics` | Ödeme istatistikleri |

### Public Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/health` | Servis sağlık kontrolü |
| POST | `/webhooks/stripe` | Stripe webhook |
| GET | `/test-stripe` | Stripe bağlantı testi |

## 💳 Ödeme Akışı

### 1. Ödeme Oluşturma
```javascript
POST /api/v1/payments
{
  "auctionId": "uuid",
  "bidderId": "uuid",
  "amount": 50000,
  "currency": "USD",
  "paymentMethod": "stripe"
}
```

### 2. Ödeme İşleme
```javascript
POST /api/v1/payments/:id/process
{
  "paymentMethodId": "pm_...",
  "confirmationToken": "optional"
}
```

### 3. Webhook Handling
Stripe webhook'ları otomatik olarak işlenir ve ödeme durumları güncellenir.

## 🔒 Güvenlik

- **JWT Token**: Tüm korumalı endpoint'ler için gerekli
- **Rate Limiting**: Dakikada 100 istek limiti
- **CORS**: Sadece izin verilen origin'lerden erişim
- **Webhook Signature**: Stripe webhook'ları imza ile doğrulanır
- **Environment Variables**: Hassas bilgiler çevre değişkenlerinde

## 🧪 Test

### Test Komutları
```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Test coverage
npm run test:cov

# Stripe bağlantı testi
curl http://localhost:3003/payments/test-stripe
```

### Test Sonuçları (Son Güncelleme: 2025-01-26)

#### ✅ Stripe Integration Test
- **Stripe Connection**: ✅ Başarılı
- **Account ID**: acct_1SIwYVDmcjqWKmiP
- **Country**: US
- **Default Currency**: USD
- **Account Type**: Standard

#### ✅ Payment Creation Test
- **Endpoint**: `POST /payments` ✅ Çalışıyor
- **Response Status**: 201 Created
- **Payment ID Format**: cmgtuj2ry0003q48t4rrpme0f
- **Stripe Payment Intent**: pi_3SIxNCDmcjqWKmiP2HeNn3YE
- **Status**: PENDING (Beklenen davranış)

#### ✅ Payment Retrieval Test
- **Endpoint**: `GET /payments/:id` ✅ Çalışıyor
- **Response Status**: 200 OK
- **Data Integrity**: ✅ Doğru

#### ⚠️ Webhook Test
- **Stripe Webhook Endpoint**: `/webhooks/stripe` 
- **Status**: Endpoint mevcut ancak ayrı webhook controller'ı bulunamadı
- **Not**: API Gateway üzerinden proxy edilmekte

### Test Verileri
```json
{
  "auctionId": "550e8400-e29b-41d4-a716-446655440000",
  "bidderId": "550e8400-e29b-41d4-a716-446655440001",
  "amount": 100.00,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD"
}
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3003/health
```

### Metrics
- Ödeme başarı oranları
- İşlem süreleri
- Hata oranları
- Webhook delivery durumu

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Stripe Connection Failed**
   - API anahtarlarını kontrol edin
   - Stripe hesap durumunu doğrulayın

2. **Database Connection Error**
   - PostgreSQL servisinin çalıştığından emin olun
   - DATABASE_URL'yi kontrol edin

3. **Redis Connection Error**
   - Redis servisinin çalıştığından emin olun
   - REDIS_URL'yi kontrol edin

### Log Seviyeleri
```env
LOG_LEVEL=debug  # debug, info, warn, error
```

## 🚀 Deployment

### Docker ile
```bash
docker build -t payment-service .
docker run -p 3003:3003 payment-service
```

### Docker Compose ile
```bash
docker-compose up payment-service
```

## 📝 Changelog

### v1.1.0 (2025-01-26)
- ✅ Stripe integration test tamamlandı
- ✅ Payment creation/retrieval endpoints test edildi
- ✅ Test sonuçları README'ye eklendi
- ⚠️ Webhook endpoint'i tespit edildi ancak ayrı controller bulunamadı
- 📊 Test verileri ve örnek kullanım eklendi

### v1.0.0
- ✅ Stripe entegrasyonu
- ✅ PayTR entegrasyonu
- ✅ Webhook desteği
- ✅ JWT kimlik doğrulama
- ✅ Rate limiting
- ✅ Health check endpoint

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Geliştirici**: Vehicle Auction Team
- **Email**: support@vehicleauction.com
- **Dokümantasyon**: [API Docs](http://localhost:3003/api-docs)

## 🔗 İlgili Servisler

- [Auth Service](../auth-service/README.md)
- [Bid Service](../bid-service/README.md)
- [Vehicle Service](../vehicle-service/README.md)
- [Notification Service](../notification-service/README.md)
- [API Gateway](../api-gateway/README.md)