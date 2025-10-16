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

### Temel Bildirim İşlemleri
```
GET    /health                    # Servis sağlık kontrolü
GET    /notifications             # Kullanıcı bildirimlerini getir
GET    /notifications/unread      # Okunmamış bildirimleri getir
GET    /notifications/count       # Bildirim sayısını getir
GET    /notifications/:id         # Belirli bildirimi getir
POST   /notifications             # Yeni bildirim oluştur
POST   /notifications/:id/read    # Bildirimi okundu olarak işaretle
POST   /notifications/mark-all-read # Tüm bildirimleri okundu işaretle
DELETE /notifications/:id         # Bildirimi sil
DELETE /notifications/clear-all   # Tüm bildirimleri temizle
```

### Bildirim Tercihleri
```
GET    /notifications/preferences        # Bildirim tercihlerini getir
PUT    /notifications/preferences        # Bildirim tercihlerini güncelle
POST   /notifications/preferences/reset  # Varsayılan tercihlere sıfırla
```

### Push Bildirim Yönetimi
```
POST   /notifications/push/subscribe     # Push bildirimlerine abone ol
POST   /notifications/push/unsubscribe   # Push bildirimlerinden çık
GET    /notifications/push/status        # Push bildirim durumunu getir
```

### E-posta Yönetimi
```
POST   /notifications/email/subscribe    # E-posta bildirimlerine abone ol
POST   /notifications/email/unsubscribe  # E-posta bildirimlerinden çık
GET    /notifications/email/status       # E-posta bildirim durumunu getir
POST   /notifications/email/send         # E-posta gönder
```

### SMS Yönetimi
```
POST   /notifications/sms/subscribe      # SMS bildirimlerine abone ol
POST   /notifications/sms/unsubscribe    # SMS bildirimlerinden çık
GET    /notifications/sms/status         # SMS bildirim durumunu getir
POST   /notifications/sms/verify-phone   # Telefon numarasını doğrula
```

### Gerçek Zamanlı Bildirimler
```
GET    /notifications/realtime           # WebSocket bağlantısı
```

### Şablon Yönetimi (Satıcı/Admin)
```
GET    /notifications/templates          # Bildirim şablonlarını getir
GET    /notifications/templates/:id      # Belirli şablonu getir
```

### Özel Bildirimler (Satıcı)
```
POST   /notifications/custom/send        # Özel bildirim gönder
GET    /notifications/custom/history     # Özel bildirim geçmişi
```

### Admin İşlemleri
```
GET    /notifications/admin/all          # Tüm bildirimleri getir
GET    /notifications/admin/stats        # Bildirim istatistikleri
POST   /notifications/admin/broadcast    # Tüm kullanıcılara bildirim gönder
POST   /notifications/admin/send-to-users # Belirli kullanıcılara gönder
GET    /notifications/admin/templates    # Tüm şablonları getir
POST   /notifications/admin/templates    # Şablon oluştur
PUT    /notifications/admin/templates/:id # Şablonu güncelle
DELETE /notifications/admin/templates/:id # Şablonu sil
```

### Analitik
```
GET    /notifications/analytics/delivery-stats # Teslimat istatistikleri
GET    /notifications/analytics/engagement     # Etkileşim istatistikleri
```

### Webhook Endpoints
```
POST   /notifications/webhooks/email-status    # E-posta durum webhook'u
POST   /notifications/webhooks/sms-status      # SMS durum webhook'u
```

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
PORT=3004

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
curl http://localhost:3004/health
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

Swagger UI: `http://localhost:3004/api`

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