# Bid Service

Araç müzayede platformu için teklif yönetim servisi. Bu servis, müzayedelerde verilen tekliflerin işlenmesi, doğrulanması ve otomatik teklif özelliklerini yönetir.

## 🚀 Özellikler

### Temel Teklif İşlemleri
- **Manuel Teklif Verme**: Kullanıcıların müzayedelere manuel teklif vermesi
- **Otomatik Teklif**: Kullanıcıların maksimum limit belirleyerek otomatik teklif vermesi
- **Teklif Doğrulama**: Tekliflerin iş kurallarına uygunluğunun kontrol edilmesi
- **Teklif Geçmişi**: Tüm teklif hareketlerinin kayıt altına alınması

### Güvenlik ve Performans
- **JWT Tabanlı Kimlik Doğrulama**: Güvenli API erişimi
- **Rate Limiting**: Spam koruması ve sistem güvenliği
- **Redis Queue**: Asenkron teklif işleme
- **IP ve User Agent Takibi**: Güvenlik ve analiz amaçlı

### Veri Yönetimi
- **PostgreSQL**: Ana veritabanı
- **Prisma ORM**: Veritabanı yönetimi
- **Otomatik Migrasyon**: Veritabanı şema yönetimi

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm veya yarn

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Çevre Değişkenlerini Ayarla
`.env.example` dosyasını `.env` olarak kopyalayın ve gerekli değerleri doldurun:

```bash
cp .env.example .env
```

### 3. Veritabanını Hazırla
```bash
# Prisma client oluştur
npm run prisma:generate

# Veritabanı migrasyonlarını çalıştır
npm run prisma:migrate

# Seed verilerini yükle (opsiyonel)
npm run prisma:seed
```

### 4. Servisi Başlat
```bash
# Geliştirme modu
npm run start:dev

# Üretim modu
npm run start:prod
```

## 🔧 Yapılandırma

### Çevre Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `PORT` | Servis portu | 4004 |
| `DATABASE_URL` | PostgreSQL bağlantı URL'i | - |
| `REDIS_HOST` | Redis sunucu adresi | localhost |
| `REDIS_PORT` | Redis portu | 6379 |
| `JWT_SECRET` | JWT imzalama anahtarı | - |
| `JWT_EXPIRES_IN` | JWT geçerlilik süresi | 1h |
| `BID_RATE_LIMIT_WINDOW_MS` | Rate limit penceresi (ms) | 60000 |
| `BID_RATE_LIMIT_MAX_BIDS` | Maksimum teklif sayısı | 10 |

## 📊 Veritabanı Şeması

### Bid (Teklifler)
- `id`: Benzersiz teklif ID'si
- `auctionId`: Müzayede ID'si
- `bidderId`: Teklif veren kullanıcı ID'si
- `amount`: Teklif miktarı
- `isAutomatic`: Otomatik teklif mi?
- `maxAmount`: Otomatik teklif maksimum miktarı
- `status`: Teklif durumu (PENDING, ACCEPTED, REJECTED, vb.)
- `placedAt`: Teklif verilme zamanı

### AutoBid (Otomatik Teklifler)
- `id`: Benzersiz otomatik teklif ID'si
- `auctionId`: Müzayede ID'si
- `bidderId`: Kullanıcı ID'si
- `maxAmount`: Maksimum teklif miktarı
- `increment`: Artış miktarı
- `isActive`: Aktif durumu

### BidHistory (Teklif Geçmişi)
- Tüm teklif hareketlerinin kayıt altına alınması
- Audit trail ve analiz amaçlı

### BidValidation (Teklif Doğrulama)
- Teklif doğrulama sonuçları
- Hata mesajları ve validasyon detayları

## 🔌 API Endpoints

**Not:** Bid Service'de global prefix yoktur. Tüm endpoint'ler direkt `/bids` path'i ile başlar. Port: **4004**

### Health Check
- `GET /health` - Servis sağlık kontrolü

### Teklif İşlemleri
- `POST /bids` - Yeni teklif ver
- `GET /bids` - Tüm teklifleri listele (filtreleme ile)
- `GET /bids/:id` - Belirli bir teklifi getir
- `DELETE /bids/:id/cancel/:bidderId` - Teklifi iptal et

### Kullanıcı Bazlı İşlemler
- `GET /bids/user/:bidderId` - Kullanıcının tekliflerini listele

### Müzayede Bazlı İşlemler
- `GET /bids/auction/:auctionId` - Müzayede tekliflerini listele
- `GET /bids/auction/:auctionId/highest` - En yüksek teklifi getir

### İstatistikler
- `GET /bids/statistics` - Teklif istatistikleri
  - Query Param: `auctionId` (opsiyonel) - Belirli müzayede için istatistikler

### Otomatik Teklif
- `POST /bids/auto` - Otomatik teklif oluştur
- `GET /bids/auto/user/:bidderId` - Kullanıcının otomatik tekliflerini listele
- `DELETE /bids/auto/:autoBidId/user/:bidderId` - Otomatik teklifi devre dışı bırak

## 🧪 Test

```bash
# Unit testler
npm run test

# Test coverage
npm run test:cov

# E2E testler
npm run test:e2e

# Test watch modu
npm run test:watch
```

## 🏗️ Mimari

### Katmanlar
1. **Controller**: HTTP isteklerini karşılar
2. **Service**: İş mantığını yönetir
3. **Validation**: Teklif doğrulama kuralları
4. **Database**: Veri erişim katmanı
5. **Queue**: Asenkron işlem yönetimi

### Önemli Servisler
- **BidsService**: Ana teklif işlemleri
- **AutoBidService**: Otomatik teklif yönetimi
- **BidValidationService**: Teklif doğrulama
- **BidProcessor**: Queue işlemleri

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rate limiting ile spam koruması
- Input validation ve sanitization
- IP adresi ve User Agent takibi
- Audit logging

## 📈 Performans

- Redis ile asenkron işlem kuyruğu
- Database indexleri
- Connection pooling
- Caching stratejileri

## 🐳 Docker

```bash
# Docker image oluştur
docker build -t bid-service .

# Container çalıştır
docker run -p 4007:4007 bid-service
```

## 📝 Loglama

Servis aşağıdaki log seviyelerini kullanır:
- `ERROR`: Hata durumları
- `WARN`: Uyarı mesajları
- `INFO`: Genel bilgi mesajları
- `DEBUG`: Detaylı debug bilgileri

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel lisans altındadır.

## 📞 İletişim

Sorularınız için proje maintainer'ları ile iletişime geçin.