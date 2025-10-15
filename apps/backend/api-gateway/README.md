# API Gateway

Vehicle Auction Platform için merkezi API Gateway servisi. Tüm mikroservisleri yönetir ve istemci isteklerini uygun servislere yönlendirir.

## 🚀 Özellikler

- **Mikroservis Yönlendirme**: Tüm mikroservislere proxy desteği
- **Kimlik Doğrulama**: JWT tabanlı authentication ve authorization
- **Rate Limiting**: Endpoint bazlı istek sınırlaması
- **Health Monitoring**: Mikroservislerin sağlık durumu takibi
- **Logging**: Winston ile kapsamlı log yönetimi
- **CORS**: Cross-origin resource sharing desteği
- **Security**: Helmet ile güvenlik başlıkları
- **Error Handling**: Merkezi hata yönetimi

## 📋 Mikroservisler

| Servis | Port | Endpoint | Açıklama |
|--------|------|----------|----------|
| Auth Service | 3001 | `/api/v1/auth/*` | Kimlik doğrulama ve yetkilendirme |
| Auction Service | 3002 | `/api/v1/auctions/*` | Açık artırma yönetimi |
| Bid Service | 3003 | `/api/v1/bids/*` | Teklif yönetimi |
| Payment Service | 3004 | `/api/v1/payments/*` | Ödeme işlemleri |
| Vehicle Service | 3005 | `/api/v1/vehicles/*` | Araç yönetimi |
| Notification Service | 3006 | `/api/v1/notifications/*` | Bildirim servisi |

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```

3. **Environment değişkenlerini düzenleyin:**
   ```bash
   # .env dosyasını açın ve gerekli değerleri girin
   nano .env
   ```

## 🔧 Konfigürasyon

### Environment Variables

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `PORT` | Gateway port numarası | 3000 |
| `NODE_ENV` | Çalışma ortamı | development |
| `JWT_SECRET` | JWT imzalama anahtarı | - |
| `CORS_ORIGINS` | İzin verilen origin'ler | localhost:3000 |
| `*_SERVICE_URL` | Mikroservis URL'leri | localhost:300X |
| `*_SERVICE_TIMEOUT` | Servis timeout süreleri | 5000-15000ms |

### Rate Limiting

- **Genel**: 100 istek/15 dakika
- **Auth**: 5 istek/15 dakika
- **Public**: 200 istek/15 dakika
- **Payment**: 10 istek/15 dakika

## 🚀 Çalıştırma

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### TypeScript Compilation
```bash
npm run build
```

## 📊 Health Check

Gateway ve mikroservislerin sağlık durumunu kontrol etmek için:

```bash
# Genel sağlık durumu
GET /health

# Detaylı sağlık raporu
GET /health/detailed

# Sadece gateway sağlığı
GET /health/gateway

# Kubernetes probes
GET /health/ready
GET /health/live
```

## 🔐 Authentication

### JWT Token Kullanımı

```javascript
// Header'da token gönderme
Authorization: Bearer <your-jwt-token>

// Veya query parameter olarak
?token=<your-jwt-token>
```

### Rol Bazlı Erişim

- **admin**: Tüm endpoint'lere erişim
- **seller**: Satıcı işlemleri
- **buyer**: Alıcı işlemleri
- **user**: Temel kullanıcı işlemleri

## 📝 API Endpoints

### Authentication Routes
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile
PUT    /api/v1/auth/profile
```

### Vehicle Routes
```
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/:id
PUT    /api/v1/vehicles/:id
DELETE /api/v1/vehicles/:id
```

### Auction Routes
```
GET    /api/v1/auctions
POST   /api/v1/auctions
GET    /api/v1/auctions/:id
PUT    /api/v1/auctions/:id
DELETE /api/v1/auctions/:id
```

### Bid Routes
```
GET    /api/v1/bids
POST   /api/v1/bids
GET    /api/v1/bids/:id
PUT    /api/v1/bids/:id
DELETE /api/v1/bids/:id
```

### Payment Routes
```
GET    /api/v1/payments
POST   /api/v1/payments
GET    /api/v1/payments/:id
POST   /api/v1/payments/refund
```

### Notification Routes
```
GET    /api/v1/notifications
POST   /api/v1/notifications
PUT    /api/v1/notifications/:id/read
DELETE /api/v1/notifications/:id
```

## 🔍 Monitoring ve Logging

### Log Seviyeleri
- `error`: Hata logları
- `warn`: Uyarı logları
- `info`: Bilgi logları
- `debug`: Debug logları

### Log Dosyaları
- `logs/error.log`: Sadece hata logları
- `logs/combined.log`: Tüm loglar

## 🛡️ Güvenlik

- **Helmet**: Güvenlik başlıkları
- **CORS**: Cross-origin kontrolü
- **Rate Limiting**: DDoS koruması
- **JWT**: Token tabanlı kimlik doğrulama
- **Input Validation**: Giriş verisi doğrulama

## 🔧 Geliştirme

### Yeni Mikroservis Ekleme

1. `src/config/index.ts` dosyasına servis konfigürasyonu ekleyin
2. `src/routes/` klasörüne yeni route dosyası oluşturun
3. `src/routes/index.ts` dosyasına route'u ekleyin

### Middleware Ekleme

1. `src/middleware/` klasörüne yeni middleware dosyası oluşturun
2. `src/app.ts` dosyasında middleware'i kaydedin

## 📦 Bağımlılıklar

### Production Dependencies
- `express`: Web framework
- `cors`: CORS middleware
- `helmet`: Security headers
- `morgan`: HTTP request logger
- `http-proxy-middleware`: Proxy middleware
- `express-rate-limit`: Rate limiting
- `jsonwebtoken`: JWT handling
- `winston`: Logging library

### Development Dependencies
- `typescript`: TypeScript compiler
- `@types/*`: Type definitions
- `nodemon`: Development server
- `ts-node`: TypeScript execution

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.