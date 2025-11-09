# Notification Service

Araç müzayede platformu için bildirim yönetim servisi. Bu servis, kullanıcılara e-posta, SMS ve push bildirimleri gönderir, bildirim tercihlerini yönetir ve gerçek zamanlı bildirimler sağlar.

## 🚀 Özellikler

### Bildirim Türleri
- **Müzayede Bildirimleri**: Müzayede oluşturma, başlama, bitiş uyarıları
- **Teklif Bildirimleri**: Yeni teklif, teklif aşılması, müzayede kazanma
- **Ödeme Bildirimleri**: Ödeme gerekli, ödeme alındı, ödeme başarısız
- **Araç Bildirimleri**: Araç onaylandı, araç reddedildi
- **Hesap Bildirimleri**: Hesap doğrulandı, şifre sıfırlama
- **Sistem Bildirimleri**: Sistem bakımı, pazarlama

### Bildirim Kanalları
- **E-posta**: Nodemailer ile e-posta gönderimi
- **SMS**: SMS bildirimleri (entegrasyon hazır)
- **Push Bildirimleri**: Web push bildirimleri
- **Gerçek Zamanlı**: WebSocket ile anlık bildirimler

### Kullanıcı Tercihleri
- Bildirim kanallarını açma/kapatma
- Bildirim türlerine göre özelleştirme
- E-posta, SMS, push bildirim ayarları

## 📋 API Endpoints

**Not:** Notification Service'de global prefix yoktur. Tüm endpoint'ler direkt `/notifications` path'i ile başlar. Port: **4006**

### Health Check
```
GET    /notifications/health      # Servis sağlık kontrolü
```

### Temel Bildirim İşlemleri
```
GET    /notifications             # Kullanıcı bildirimlerini getir (Query: userId, read)
GET    /notifications/unread-count/:userId  # Okunmamış bildirim sayısını getir
GET    /notifications/:id         # Belirli bildirimi getir
POST   /notifications             # Yeni bildirim oluştur
PATCH  /notifications/:id/read    # Bildirimi okundu olarak işaretle
PATCH  /notifications/user/:userId/read-all # Tüm bildirimleri okundu işaretle
PATCH  /notifications/:id         # Bildirimi güncelle
DELETE /notifications/:id         # Bildirimi sil
```

### E-posta Gönderimi
```
POST   /notifications/email/send         # E-posta gönder
```

### Toplu Bildirimler
```
POST   /notifications/bulk/auction-created  # Müzayede oluşturulduğunda bildirim gönder
POST   /notifications/bulk/bid-placed       # Teklif verildiğinde bildirim gönder
```

**Not:** Yukarıdaki endpoint'ler implementasyonda mevcuttur. Diğer endpoint'ler (preferences, push, SMS, admin, analytics, webhooks) henüz implementasyonda yoktur.

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- Redis (opsiyonel, önbellekleme için)

### Bağımlılıkları Yükle
```bash
npm install
```

### Veritabanı Kurulumu
```bash
# Prisma migration'larını çalıştır
npx prisma migrate deploy

# Prisma client'ı oluştur
npx prisma generate

# Seed verilerini yükle (opsiyonel)
npx prisma db seed
```

### Çevre Değişkenleri
`.env` dosyasını oluşturun:
```env
# Uygulama
NODE_ENV=development
PORT=4006
# Not: Global prefix yok, endpoint'ler direkt /notifications ile başlar

# Veritabanı
DATABASE_URL="postgresql://username:password@localhost:5432/notification_db"

# E-posta Servisi
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@vehicleauction.com
FROM_NAME="Vehicle Auction Platform"

# SMS Servisi (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Bildirimleri
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@vehicleauction.com

# Redis (opsiyonel)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret

# Diğer Servisler
USER_SERVICE_URL=http://localhost:3001
AUCTION_SERVICE_URL=http://localhost:3002
```

### Servisi Başlat
```bash
# Geliştirme modu
npm run start:dev

# Üretim modu
npm run build
npm run start:prod
```

## 📊 Veritabanı Şeması

### Notification Tablosu
```sql
model Notification {
  id        String            @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?
  read      Boolean           @default(false)
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}
```

### NotificationPreference Tablosu
```sql
model NotificationPreference {
  id              String  @id @default(cuid())
  userId          String  @unique
  emailEnabled    Boolean @default(true)
  smsEnabled      Boolean @default(false)
  pushEnabled     Boolean @default(true)
  auctionUpdates  Boolean @default(true)
  bidUpdates      Boolean @default(true)
  paymentUpdates  Boolean @default(true)
  marketingEmails Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🔧 Yapılandırma

### E-posta Şablonları
E-posta şablonları `src/templates/` dizininde bulunur:
- `auction_created.hbs`
- `bid_placed.hbs`
- `auction_won.hbs`
- `payment_required.hbs`
- vb.

### Bildirim Türleri
```typescript
enum NotificationType {
  AUCTION_CREATED = 'AUCTION_CREATED'
  AUCTION_STARTED = 'AUCTION_STARTED'
  AUCTION_ENDING_SOON = 'AUCTION_ENDING_SOON'
  AUCTION_ENDED = 'AUCTION_ENDED'
  BID_PLACED = 'BID_PLACED'
  BID_OUTBID = 'BID_OUTBID'
  BID_WON = 'BID_WON'
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED'
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED'
  PAYMENT_FAILED = 'PAYMENT_FAILED'
  VEHICLE_APPROVED = 'VEHICLE_APPROVED'
  VEHICLE_REJECTED = 'VEHICLE_REJECTED'
  ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED'
  PASSWORD_RESET = 'PASSWORD_RESET'
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE'
  MARKETING = 'MARKETING'
}
```

## 🧪 Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:4006/notifications/health
```

### Metrics
Servis aşağıdaki metrikleri sağlar:
- Gönderilen bildirim sayısı
- E-posta teslimat oranı
- SMS teslimat oranı
- Push bildirim etkileşim oranı
- Hata oranları

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rate limiting
- Input validation
- CORS koruması
- Helmet.js güvenlik başlıkları

## 🚀 Deployment

### Docker
```bash
# Docker image oluştur
docker build -t notification-service .

# Container çalıştır
docker run -p 3004:3004 notification-service
```

### Docker Compose
```yaml
version: '3.8'
services:
  notification-service:
    build: .
    ports:
      - "3004:3004"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/notification_db
    depends_on:
      - db
```

## 📝 API Dokümantasyonu

Swagger UI: `http://localhost:4006/api`

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için: [GitHub Issues](https://github.com/your-repo/issues)