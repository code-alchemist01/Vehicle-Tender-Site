# Vehicle Service

Vehicle Service, araç açık artırma platformunun araç yönetimi işlemlerini gerçekleştiren mikroservisidir. Bu servis, araçların CRUD işlemleri, kategori yönetimi ve araç durumu takibi gibi temel işlevleri sağlar.

## 🚀 Özellikler

- **Araç Yönetimi**: Araç oluşturma, güncelleme, silme ve listeleme
- **Kategori Yönetimi**: Araç kategorilerinin yönetimi
- **Araç Durumu Takibi**: DRAFT, ACTIVE, SOLD, EXPIRED durumları
- **Güvenlik**: JWT tabanlı kimlik doğrulama ve yetkilendirme
- **Validasyon**: Kapsamlı veri doğrulama ve güvenlik kontrolleri
- **Swagger Dokümantasyonu**: API endpoint'lerinin detaylı dokümantasyonu
- **Health Check**: Servis sağlık durumu kontrolü

## 📋 API Endpoints

### Health Check
- `GET /api/v1/health` - Servis sağlık durumu kontrolü

### Kategoriler
- `GET /api/v1/categories` - Tüm kategorileri listele
- `GET /api/v1/categories/:id` - Kategori detaylarını getir
- `POST /api/v1/categories` - Yeni kategori oluştur (Admin)
- `PATCH /api/v1/categories/:id` - Kategori güncelle (Admin)
- `DELETE /api/v1/categories/:id` - Kategori sil (Admin)

### Araçlar
- `GET /api/v1/vehicles` - Araçları listele (filtreleme ve sayfalama ile)
- `GET /api/v1/vehicles/:id` - Araç detaylarını getir
- `POST /api/v1/vehicles` - Yeni araç oluştur (Kimlik doğrulama gerekli)
- `PATCH /api/v1/vehicles/:id` - Araç güncelle (Sahip veya Admin)
- `DELETE /api/v1/vehicles/:id` - Araç sil (Sahip veya Admin)

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Docker (opsiyonel)

### Yerel Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Çevre değişkenlerini ayarlayın:**
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

3. **Veritabanını hazırlayın:**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. **Servisi başlatın:**
```bash
# Geliştirme modu
npm run start:dev

# Üretim modu
npm run build
npm run start:prod
```

### Docker ile Çalıştırma

```bash
# Docker image'ı oluşturun
docker build -t vehicle-service .

# Container'ı çalıştırın
docker run -p 4002:4002 --env-file .env vehicle-service
```

## 🔧 Yapılandırma

### Çevre Değişkenleri

```env
# Sunucu Ayarları
PORT=4002
NODE_ENV=development

# Veritabanı
DATABASE_URL="postgresql://username:password@localhost:5432/vehicle_auction_db"

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Redis (Cache)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Dosya Yükleme
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## 🗄️ Veritabanı Şeması

### Vehicle Tablosu
```sql
model Vehicle {
  id             String    @id @default(cuid())
  make           String    // Marka
  model          String    // Model
  year           Int       // Yıl
  mileage        Int?      // Kilometre
  fuelType       FuelType  // Yakıt türü
  transmission   TransmissionType // Şanzıman
  condition      VehicleCondition // Durum
  status         VehicleStatus @default(DRAFT) // Araç durumu
  description    String?   // Açıklama
  images         String[]  // Resim URL'leri
  engineSize     Float?    // Motor hacmi
  color          String?   // Renk
  vin            String?   @unique // Şasi numarası
  licensePlate   String?   @unique // Plaka
  location       String?   // Konum
  estimatedValue Decimal?  // Tahmini değer
  reservePrice   Decimal?  // Rezerv fiyat
  userId         String    // Sahip kullanıcı
  categoryId     String    // Kategori
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // İlişkiler
  user           User      @relation(fields: [userId], references: [id])
  category       Category  @relation(fields: [categoryId], references: [id])
  auctions       Auction[]
}
```

### Category Tablosu
```sql
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // İlişkiler
  vehicles    Vehicle[]
}
```

## 🔒 Güvenlik Özellikleri

- **JWT Kimlik Doğrulama**: Tüm korumalı endpoint'ler için
- **Role-based Authorization**: Kullanıcı rollerine göre erişim kontrolü
- **Input Validation**: Tüm giriş verilerinin doğrulanması
- **Rate Limiting**: API kötüye kullanımını önleme
- **CORS**: Cross-origin isteklerin güvenli yönetimi
- **Helmet**: HTTP güvenlik başlıkları
- **Data Sanitization**: XSS ve injection saldırılarına karşı koruma

## 🧪 Test Etme

### Unit Testler
```bash
npm run test
```

### Integration Testler
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

### Manuel API Testleri

#### 1. Health Check
```bash
curl -X GET http://localhost:4002/api/v1/health
```

#### 2. Kategorileri Listele
```bash
curl -X GET http://localhost:4002/api/v1/categories
```

#### 3. Araç Oluştur
```bash
curl -X POST http://localhost:4002/api/v1/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "BMW",
    "model": "320i",
    "year": 2020,
    "mileage": 45000,
    "fuelType": "GASOLINE",
    "transmission": "AUTOMATIC",
    "condition": "GOOD",
    "description": "Temiz BMW 320i, full bakımlı",
    "engineSize": 2.0,
    "color": "Siyah",
    "categoryId": "category-id-here"
  }'
```

#### 4. Araç Güncelle
```bash
curl -X PATCH http://localhost:4002/api/v1/vehicles/VEHICLE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mileage": 46000,
    "description": "Güncellenmiş açıklama",
    "condition": "EXCELLENT"
  }'
```

## 📊 Monitoring ve Logging

### Health Check Endpoint
- **URL**: `/api/v1/health`
- **Kontroller**: Veritabanı bağlantısı, servis durumu, bellek kullanımı

### Logging
- **Winston** logger kullanımı
- **Log Seviyeleri**: error, warn, info, debug
- **Log Formatı**: JSON (üretim), console (geliştirme)

### Metrics
- API response times
- Database query performance
- Memory usage
- Error rates

## 🚀 Deployment

### Docker Deployment
```bash
# Production image oluştur
docker build -t vehicle-service:latest .

# Container çalıştır
docker run -d \
  --name vehicle-service \
  -p 4002:4002 \
  --env-file .env.production \
  vehicle-service:latest
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vehicle-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vehicle-service
  template:
    metadata:
      labels:
        app: vehicle-service
    spec:
      containers:
      - name: vehicle-service
        image: vehicle-service:latest
        ports:
        - containerPort: 4002
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vehicle-service-secrets
              key: database-url
```

## 🔗 Diğer Servislerle Entegrasyon

### Auth Service
- JWT token doğrulama
- Kullanıcı bilgileri alma
- Role-based authorization

### Auction Service
- Araç açık artırma durumu senkronizasyonu
- Araç durumu güncellemeleri

### Notification Service
- Araç durumu değişiklik bildirimleri
- Yeni araç ekleme bildirimleri

## 🐛 Troubleshooting

### Yaygın Sorunlar

#### 1. Veritabanı Bağlantı Hatası
```bash
# Veritabanı durumunu kontrol et
docker ps | grep postgres

# Bağlantı string'ini kontrol et
echo $DATABASE_URL
```

#### 2. JWT Token Hatası
```bash
# Token geçerliliğini kontrol et
# Auth Service'den yeni token al
```

#### 3. Port Çakışması
```bash
# Port kullanımını kontrol et
netstat -tulpn | grep :4002

# Farklı port kullan
PORT=4003 npm run start:dev
```

### Log Analizi
```bash
# Container loglarını görüntüle
docker logs vehicle-service

# Belirli seviye logları filtrele
docker logs vehicle-service 2>&1 | grep ERROR
```

## 📚 API Dokümantasyonu

Swagger UI dokümantasyonuna erişim:
- **URL**: `http://localhost:4002/api/docs`
- **Geliştirme**: Otomatik güncellenen dokümantasyon
- **Üretim**: Güvenlik nedeniyle devre dışı

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 📞 İletişim

- **Geliştirici**: Vehicle Auction Platform Team
- **Email**: dev@vehicleauction.com
- **Dokümantasyon**: [API Docs](http://localhost:4002/api/docs)

---

**Not**: Bu README dosyası Vehicle Service v1.0.0 için hazırlanmıştır. Güncellemeler için repository'yi takip edin.