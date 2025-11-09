# 🚗 Vehicle Auction Platform

Modern mikroservis mimarisi ile geliştirilmiş, enterprise seviyesinde araç açık artırma platformu.

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Servisler ve Portlar](#-servisler-ve-portlar)
- [API Endpoint'leri](#-api-endpointleri)
- [Veritabanı Yapısı](#-veritabanı-yapısı)
- [Geliştirme Rehberi](#-geliştirme-rehberi)
- [Sorun Giderme](#-sorun-giderme)

---

## 🎯 Proje Hakkında

Bu proje, kullanıcıların araçlarını açık artırmaya çıkarabildiği, diğer kullanıcıların bu araçlara teklif verebildiği bir web platformudur. Platform, modern mikroservis mimarisi kullanarak geliştirilmiştir ve ölçeklenebilir, güvenli ve performanslı bir yapıya sahiptir.

### Ne İşe Yarar?

1. **Kullanıcılar araç ekleyebilir**: Araç bilgilerini (marka, model, yıl, kilometre vb.) girerek platforma ekleyebilirler.
2. **Açık artırma oluşturulabilir**: Eklenen araçlar için açık artırma başlatılabilir.
3. **Teklif verilebilir**: Kullanıcılar açık artırmalara gerçek zamanlı teklif verebilir.
4. **İzleme listesi**: İlginç bulunan açık artırmalar izleme listesine eklenebilir.
5. **Ödeme işlemleri**: Kazanan teklifler için ödeme yapılabilir.
6. **Bildirimler**: Önemli olaylar için kullanıcılara bildirim gönderilir.

---

## ✨ Özellikler

### ✅ Tamamlanan Özellikler

- ✅ **Kullanıcı Kimlik Doğrulama**: JWT tabanlı güvenli giriş/çıkış sistemi
- ✅ **Araç Yönetimi**: Araç ekleme, düzenleme, silme ve listeleme
- ✅ **Açık Artırma Sistemi**: Açık artırma oluşturma ve yönetme
- ✅ **Teklif Verme**: Gerçek zamanlı teklif verme sistemi
- ✅ **İzleme Listesi**: Açık artırmaları izleme listesine ekleme
- ✅ **Ödeme Entegrasyonu**: Stripe ile ödeme işlemleri
- ✅ **Bildirim Sistemi**: Kullanıcı bildirimleri
- ✅ **Arama ve Filtreleme**: Gelişmiş arama ve filtreleme özellikleri
- ✅ **Responsive Tasarım**: Mobil uyumlu arayüz

### 🚧 Geliştirme Aşamasında

- 🔄 WebSocket ile gerçek zamanlı güncellemeler
- 🔄 Admin paneli
- 🔄 Gelişmiş analitik ve raporlama

---

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Kullanıcı arayüzü kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı build tool
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **Zustand** - State yönetimi
- **Socket.io Client** - Gerçek zamanlı iletişim
- **Tailwind CSS** - Stil kütüphanesi

### Backend
- **NestJS** - Mikroservis framework'ü
- **Prisma ORM** - Veritabanı yönetimi
- **PostgreSQL** - Ana veritabanı
- **Redis** - Cache ve session yönetimi
- **JWT** - Kimlik doğrulama
- **Socket.io** - Gerçek zamanlı iletişim
- **Stripe** - Ödeme işlemleri

### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **Turborepo** - Monorepo yönetimi
- **PNPM** - Paket yöneticisi

---

## 📁 Proje Yapısı

```
vehicle-auction-platform/
├── apps/
│   ├── frontend/                    # React frontend uygulaması
│   │   ├── src/
│   │   │   ├── pages/              # Sayfa bileşenleri
│   │   │   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   │   ├── lib/                # API client'ları ve yardımcı fonksiyonlar
│   │   │   ├── store/              # Zustand state yönetimi
│   │   │   └── types/              # TypeScript tipleri
│   │   └── package.json
│   │
│   └── backend/                     # Backend mikroservisler
│       ├── api-gateway-backup/     # API Gateway (tüm istekleri yönlendirir)
│       ├── auth-service/           # Kimlik doğrulama servisi
│       ├── vehicle-service/        # Araç yönetimi servisi
│       ├── auction-service/          # Açık artırma servisi
│       ├── bid-service/           # Teklif servisi
│       ├── payment-service/       # Ödeme servisi
│       └── notification-service/  # Bildirim servisi
│
├── infrastructure/                   # Altyapı dosyaları
│   ├── docker/                     # Docker konfigürasyonları
│   └── nginx/                      # Nginx konfigürasyonları
│
├── docker-compose.yml              # Tüm servisleri çalıştıran Docker Compose dosyası
└── README.md                       # Bu dosya
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler

Aşağıdaki yazılımların sisteminizde yüklü olması gerekmektedir:

- **Node.js** 20 veya üzeri
- **PNPM** 8.12.0 veya üzeri
- **Docker Desktop** (Windows/Mac) veya **Docker** + **Docker Compose** (Linux)
- **Git**

### Adım 1: Projeyi İndirin

```bash
# GitHub'dan projeyi klonlayın
git clone <repository-url>
cd vehicle-auction-platform
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
# Tüm bağımlılıkları yükleyin
pnpm install
```

### Adım 3: Docker Servislerini Başlatın

Bu komut, PostgreSQL, Redis ve tüm backend servislerini Docker container'larında başlatır:

```bash
# Docker servislerini başlat
docker-compose up -d
```

**Ne Oluyor?**
- PostgreSQL veritabanı başlatılıyor
- Redis cache servisi başlatılıyor
- Tüm backend servisleri (auth, vehicle, auction, bid, payment, notification) başlatılıyor
- API Gateway başlatılıyor

**Kontrol Etmek İçin:**
```bash
# Tüm container'ların çalıştığını kontrol edin
docker-compose ps
```

### Adım 4: Veritabanı Migration'larını Çalıştırın

Her servis kendi veritabanına sahiptir ve migration'lar otomatik olarak çalışır. Ancak manuel olarak çalıştırmak isterseniz:

```bash
# Her servis için migration'ları çalıştır
cd apps/backend/auth-service && npx prisma migrate deploy
cd apps/backend/vehicle-service && npx prisma migrate deploy
cd apps/backend/auction-service && npx prisma migrate deploy
cd apps/backend/bid-service && npx prisma migrate deploy
cd apps/backend/payment-service && npx prisma migrate deploy
cd apps/backend/notification-service && npx prisma migrate deploy
```

### Adım 5: Frontend'i Başlatın

Yeni bir terminal penceresi açın ve:

```bash
# Frontend dizinine gidin
cd apps/frontend

# Frontend'i başlatın
pnpm dev
```

Frontend şu adreste çalışacak: **http://localhost:3001**

### Adım 6: Test Edin

1. Tarayıcınızda **http://localhost:3001** adresine gidin
2. Kayıt olun veya giriş yapın
3. Araç ekleyin
4. Açık artırma oluşturun
5. Teklif verin

---

## 🌐 Servisler ve Portlar

Platform, birbirinden bağımsız çalışan mikroservislerden oluşur. Her servis kendi portunda çalışır:

| Servis | Port | Açıklama | Durum |
|--------|------|----------|-------|
| **Frontend** | 3001 | React uygulaması | ✅ Çalışıyor |
| **API Gateway** | 4008 | Tüm istekleri yönlendiren gateway | ✅ Çalışıyor |
| **Auth Service** | 4001 | Kullanıcı kimlik doğrulama | ✅ Çalışıyor |
| **Vehicle Service** | 4002 | Araç yönetimi | ✅ Çalışıyor |
| **Auction Service** | 4003 | Açık artırma yönetimi | ✅ Çalışıyor |
| **Bid Service** | 4004 | Teklif yönetimi | ✅ Çalışıyor |
| **Payment Service** | 4005 | Ödeme işlemleri | ✅ Çalışıyor |
| **Notification Service** | 4006 | Bildirimler | ✅ Çalışıyor |
| **PostgreSQL** | 5432 | Veritabanı | ✅ Çalışıyor |
| **Redis** | 6379 | Cache | ✅ Çalışıyor |
| **pgAdmin** | 5050 | Veritabanı yönetim arayüzü | ✅ Çalışıyor |

### Servislerin Ne İşe Yaradığı

#### 1. **Frontend (Port 3001)**
- Kullanıcı arayüzü
- Tüm sayfalar ve bileşenler
- API istekleri buradan gönderilir

#### 2. **API Gateway (Port 4008)**
- Tüm istekleri alır ve ilgili servise yönlendirir
- Authentication kontrolü yapar
- Rate limiting uygular
- WebSocket bağlantılarını yönetir

#### 3. **Auth Service (Port 4001)**
- Kullanıcı kaydı
- Giriş/çıkış işlemleri
- JWT token oluşturma ve doğrulama
- Şifre sıfırlama
- Profil yönetimi

#### 4. **Vehicle Service (Port 4002)**
- Araç ekleme, düzenleme, silme
- Araç listeleme ve arama
- Kategori yönetimi
- Araç filtreleme

#### 5. **Auction Service (Port 4003)**
- Açık artırma oluşturma
- Açık artırma listeleme
- Açık artırma detayları
- İzleme listesi yönetimi

#### 6. **Bid Service (Port 4004)**
- Teklif verme
- Teklif geçmişi
- En yüksek teklif bilgisi
- Otomatik teklif sistemi

#### 7. **Payment Service (Port 4005)**
- Stripe entegrasyonu
- Ödeme işlemleri
- Ödeme geçmişi

#### 8. **Notification Service (Port 4006)**
- Kullanıcı bildirimleri
- E-posta bildirimleri (gelecekte)
- Push bildirimleri (gelecekte)

---

## 📡 API Endpoint'leri

### Auth Service (Port 4001)

**Base URL:** `http://localhost:4001/api/v1/auth`

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|-----------|--------------|
| POST | `/register` | Kullanıcı kaydı | ❌ |
| POST | `/login` | Kullanıcı girişi | ❌ |
| POST | `/logout` | Kullanıcı çıkışı | ✅ |
| POST | `/refresh` | Token yenileme | ❌ |
| GET | `/profile` | Kullanıcı profili | ✅ |
| POST | `/change-password` | Şifre değiştirme | ✅ |
| GET | `/login-history` | Giriş geçmişi | ✅ |

**Örnek Kullanım:**
```bash
# Kayıt ol
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Giriş yap
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Vehicle Service (Port 4002)

**Base URL:** `http://localhost:4002/api/v1`

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|-----------|--------------|
| GET | `/vehicles` | Araç listesi | ❌ |
| POST | `/vehicles` | Yeni araç ekle | ✅ |
| GET | `/vehicles/:id` | Araç detayı | ❌ |
| PATCH | `/vehicles/:id` | Araç güncelle | ✅ |
| DELETE | `/vehicles/:id` | Araç sil | ✅ |
| GET | `/vehicles/search` | Araç ara | ❌ |
| GET | `/vehicles/my-vehicles` | Kullanıcının araçları | ✅ |
| GET | `/categories` | Kategori listesi | ❌ |

**Filtreleme Parametreleri:**
```
?page=1&limit=10&make=BMW&model=X5&yearFrom=2020&yearTo=2023
&mileageFrom=10000&mileageTo=50000&fuelType=GASOLINE
```

**Örnek Kullanım:**
```bash
# Araç listesi
curl http://localhost:4002/api/v1/vehicles?page=1&limit=10

# Araç ekle
curl -X POST http://localhost:4002/api/v1/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 15000,
    "fuelType": "GASOLINE",
    "transmission": "AUTOMATIC",
    "condition": "EXCELLENT",
    "categoryId": "category-id"
  }'
```

### Auction Service (Port 4003)

**Base URL:** `http://localhost:4003/api/v1/auctions`

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|-----------|--------------|
| GET | `/` | Açık artırma listesi | ❌ |
| POST | `/` | Yeni açık artırma | ✅ |
| GET | `/:id` | Açık artırma detayı | ❌ |
| PATCH | `/:id` | Açık artırma güncelle | ✅ |
| DELETE | `/:id` | Açık artırma sil | ✅ |
| GET | `/watchlist/:userId` | Kullanıcının izleme listesi | ✅ |
| POST | `/:id/watchlist` | İzleme listesine ekle | ✅ |
| DELETE | `/:id/watchlist` | İzleme listesinden çıkar | ✅ |

### Bid Service (Port 4004)

**Base URL:** `http://localhost:4004/api/v1/bids`

| Method | Endpoint | Açıklama | Auth Gerekli |
|--------|----------|-----------|--------------|
| POST | `/` | Teklif ver | ✅ |
| GET | `/auction/:auctionId` | Açık artırma teklifleri | ❌ |
| GET | `/auction/:auctionId/highest` | En yüksek teklif | ❌ |
| GET | `/auction/:auctionId/my-bids` | Kullanıcının teklifleri | ✅ |

---

## 🗄️ Veritabanı Yapısı

Platform, her servis için ayrı PostgreSQL veritabanı kullanır:

### Auth Database (`vehicle_auction_auth`)

**users** tablosu:
- `id` - Kullanıcı ID'si
- `email` - E-posta adresi (unique)
- `firstName`, `lastName` - İsim ve soyisim
- `password` - Hash'lenmiş şifre
- `role` - Kullanıcı rolü (USER, ADMIN, MODERATOR)
- `isActive` - Aktif mi?
- `createdAt`, `updatedAt` - Oluşturulma ve güncellenme tarihleri

**refresh_tokens** tablosu:
- `id` - Token ID'si
- `token` - Refresh token değeri
- `userId` - Kullanıcı ID'si
- `expiresAt` - Son kullanma tarihi
- `isRevoked` - İptal edildi mi?

### Vehicle Database (`vehicle_auction_vehicles`)

**vehicles** tablosu:
- `id` - Araç ID'si
- `make`, `model` - Marka ve model
- `year` - Yıl
- `mileage` - Kilometre
- `fuelType` - Yakıt tipi (GASOLINE, DIESEL, ELECTRIC, vb.)
- `transmission` - Vites tipi (MANUAL, AUTOMATIC, vb.)
- `condition` - Durum (NEW, EXCELLENT, GOOD, vb.)
- `status` - Durum (ACTIVE, INACTIVE, SOLD, vb.)
- `userId` - Araç sahibi ID'si
- `categoryId` - Kategori ID'si

**categories** tablosu:
- `id` - Kategori ID'si
- `name` - Kategori adı
- `slug` - URL-friendly isim
- `isActive` - Aktif mi?

**auctions** tablosu:
- `id` - Açık artırma ID'si
- `vehicleId` - Araç ID'si
- `title` - Başlık
- `startPrice` - Başlangıç fiyatı
- `currentBid` - Mevcut en yüksek teklif
- `startTime`, `endTime` - Başlangıç ve bitiş zamanı
- `status` - Durum (DRAFT, ACTIVE, ENDED, vb.)

**bids** tablosu:
- `id` - Teklif ID'si
- `auctionId` - Açık artırma ID'si
- `userId` - Teklif veren kullanıcı ID'si
- `amount` - Teklif miktarı
- `createdAt` - Teklif zamanı

### Diğer Veritabanları

- **auction** - Açık artırma servisi veritabanı
- **bid** - Teklif servisi veritabanı
- **payment** - Ödeme servisi veritabanı
- **notification** - Bildirim servisi veritabanı

---

## 💻 Geliştirme Rehberi

### Backend Geliştirme

#### Yeni Bir Servis Ekleme

1. `apps/backend/` dizininde yeni bir klasör oluşturun
2. NestJS projesi oluşturun:
   ```bash
   cd apps/backend
   nest new your-service-name
   ```
3. `docker-compose.yml` dosyasına servisi ekleyin
4. Prisma schema oluşturun
5. Migration'ları çalıştırın

#### Servis Loglarını İzleme

```bash
# Belirli bir servisin loglarını izle
docker-compose logs -f vehicle-service

# Tüm servislerin loglarını izle
docker-compose logs -f
```

#### Servisi Yeniden Build Etme

```bash
# Servisi yeniden build et
docker-compose build vehicle-service

# Servisi yeniden başlat
docker-compose up -d vehicle-service
```

### Frontend Geliştirme

#### Yeni Bir Sayfa Ekleme

1. `apps/frontend/src/pages/` dizininde yeni bir dosya oluşturun
2. `App.tsx` veya router dosyasına route ekleyin
3. API client'ı güncelleyin (gerekirse)

#### API Client Kullanımı

```typescript
import { vehicleApi } from '@/lib/api/vehicle'

// Araç listesi
const vehicles = await vehicleApi.getAll({ page: 1, limit: 10 })

// Araç ekle
const newVehicle = await vehicleApi.create({
  make: 'Toyota',
  model: 'Camry',
  // ...
})
```

---

## 🔧 Sorun Giderme

### Docker Container'lar Çalışmıyor

```bash
# Container'ların durumunu kontrol et
docker-compose ps

# Logları kontrol et
docker-compose logs

# Container'ları yeniden başlat
docker-compose restart

# Tüm container'ları durdur ve temizle
docker-compose down
docker-compose up -d
```

### Veritabanı Bağlantı Hatası

1. PostgreSQL container'ının çalıştığını kontrol edin:
   ```bash
   docker-compose ps postgres
   ```

2. Veritabanının oluşturulduğunu kontrol edin:
   ```bash
   docker-compose exec postgres psql -U postgres -l
   ```

3. Servislerin environment variable'larını kontrol edin

### Port Çakışması

Eğer bir port zaten kullanılıyorsa:

1. Port'u kullanan process'i bulun:
   ```bash
   # Windows
   netstat -ano | findstr :4002
   
   # Linux/Mac
   lsof -i :4002
   ```

2. Process'i sonlandırın veya `docker-compose.yml` dosyasında port'u değiştirin

### Frontend API İstekleri Çalışmıyor

1. Backend servislerinin çalıştığını kontrol edin
2. CORS ayarlarını kontrol edin
3. API base URL'lerini kontrol edin (`apps/frontend/src/lib/api/config.ts`)

### JWT Token Hataları

1. Token'ın süresi dolmuş olabilir - yeniden giriş yapın
2. `JWT_SECRET` environment variable'ının tüm servislerde aynı olduğundan emin olun

---

## 📝 Önemli Notlar

### Environment Variables

Tüm servisler için `JWT_SECRET` aynı olmalıdır. `docker-compose.yml` dosyasında bu değerler tanımlıdır.

### Veritabanı Migration'ları

Her servis kendi veritabanına sahiptir. Migration'lar container başlatıldığında otomatik çalışır.

### CORS Ayarları

Frontend'in çalıştığı port'lar (`http://localhost:3001`) backend servislerinin CORS ayarlarında tanımlı olmalıdır.

---

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 📞 İletişim

Sorularınız için issue açabilir veya proje sahibi ile iletişime geçebilirsiniz.

---

**Not:** Bu README dosyası projenin mevcut durumunu yansıtmaktadır. Proje geliştikçe güncellenecektir.
