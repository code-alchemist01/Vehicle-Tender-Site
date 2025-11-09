# Auth Service

Vehicle Auction Platform için kimlik doğrulama ve kullanıcı yönetimi servisi.

## 🚀 Özellikler

- **Kullanıcı Kaydı**: Güvenli kullanıcı kaydı ve e-posta doğrulama
- **Kimlik Doğrulama**: JWT tabanlı giriş/çıkış sistemi
- **Rol Tabanlı Erişim**: USER ve ADMIN rolleri ile yetkilendirme
- **Güvenlik**: Bcrypt şifreleme, rate limiting, güçlü şifre politikaları
- **Profil Yönetimi**: Kullanıcı profil bilgilerini güncelleme
- **Token Yönetimi**: Access ve refresh token sistemi
- **Audit Trail**: Giriş geçmişi ve güvenlik logları

## 📋 API Endpoints

### Health Check
```http
GET /api/v1/auth/health
```

### Kimlik Doğrulama
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
```

### Profil Yönetimi
```http
GET /api/v1/auth/profile
POST /api/v1/auth/change-password
GET /api/v1/auth/login-history
```

### Kullanıcı Yönetimi (Admin)
```http
GET /api/v1/users
GET /api/v1/users/:id
PUT /api/v1/users/:id
DELETE /api/v1/users/:id
```

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Ortam Değişkenleri
```env
# Veritabanı
DATABASE_URL=postgresql://username:password@localhost:5432/auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Sunucu
PORT=4001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Güvenlik
BCRYPT_ROUNDS=12

# Loglama
LOG_LEVEL=info
LOG_FORMAT=json

# E-posta (Opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Yerel Geliştirme
```bash
# Bağımlılıkları yükle
npm install

# Veritabanı migration'larını çalıştır
npx prisma migrate dev

# Seed verilerini yükle
npm run seed

# Geliştirme sunucusunu başlat
npm run dev
```

### Docker ile Çalıştırma
```bash
# Docker container'ı başlat
docker-compose up auth-service

# Veya sadece bu servisi build et
docker build -t auth-service .
docker run -p 4001:4001 auth-service
```

## 🔐 Güvenlik Özellikleri

### Şifre Politikaları
- Minimum 8 karakter
- En az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter
- Ardışık karakterler yasak (123, abc vb.)
- Yaygın şifreler yasak

### Rate Limiting
- 15 dakikada maksimum 100 istek
- Başarısız giriş denemeleri için özel limitler
- IP tabanlı koruma

### JWT Token Güvenliği
- Access token: 7 gün geçerlilik
- Refresh token: 30 gün geçerlilik
- Secure HTTP-only cookies
- Token rotation desteği

## 📊 Veritabanı Şeması

### Users Tablosu
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  phone VARCHAR,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  isActive BOOLEAN DEFAULT true,
  emailVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Refresh Tokens Tablosu
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR PRIMARY KEY,
  token VARCHAR UNIQUE NOT NULL,
  userId VARCHAR REFERENCES users(id),
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Login History Tablosu
```sql
CREATE TABLE login_history (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR REFERENCES users(id),
  ipAddress VARCHAR,
  userAgent VARCHAR,
  success BOOLEAN NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

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

### Manuel Test Örnekleri

#### Kullanıcı Kaydı
```bash
curl -X POST http://localhost:4001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword!2024",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+90 555 123 4567"
  }'
```

#### Giriş Yapma
```bash
curl -X POST http://localhost:4001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword!2024"
  }'
```

#### Profil Görüntüleme
```bash
curl -X GET http://localhost:4001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Monitoring ve Loglama

### Health Check
Servis durumu `/api/v1/auth/health` endpoint'i ile kontrol edilebilir.

### Loglar
- Tüm authentication olayları loglanır
- Başarısız giriş denemeleri izlenir
- Rate limit aşımları kaydedilir
- Hata logları structured format'ta

### Metrikler
- Aktif kullanıcı sayısı
- Günlük giriş sayısı
- Başarısız authentication denemeleri
- Response time metrikleri

## 🔄 Deployment

### Production Ortamı
```bash
# Production build
npm run build

# Production'da çalıştır
npm run start:prod
```

### Docker Production
```bash
docker build -t auth-service:latest .
docker push your-registry/auth-service:latest
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: auth-service:latest
        ports:
        - containerPort: 4001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: database-url
```

## 🤝 Diğer Servislerle Entegrasyon

### API Gateway
Auth Service, API Gateway üzerinden proxy edilir:
- Base URL: `http://api-gateway:4000/auth`
- Rate limiting API Gateway seviyesinde de uygulanır

### Vehicle Service
- Araç sahipliği doğrulaması için kullanıcı bilgileri
- JWT token validation

### Auction Service
- Açık artırma katılımcı doğrulaması
- Teklif verme yetkilendirmesi

### Notification Service
- Kullanıcı bildirim tercihleri
- E-posta gönderimi için kullanıcı bilgileri

## 🐛 Troubleshooting

### Yaygın Sorunlar

#### Database Connection Error
```bash
# Veritabanı bağlantısını kontrol et
npx prisma db pull

# Migration'ları kontrol et
npx prisma migrate status
```

#### JWT Token Errors
- Token süresi dolmuş: Refresh token kullan
- Invalid signature: JWT_SECRET kontrol et
- Token format hatası: Bearer prefix kontrol et

#### Rate Limit Aşımı
- IP whitelist kontrol et
- Rate limit ayarlarını gözden geçir
- Redis bağlantısını kontrol et

### Debug Modu
```bash
# Debug logları aktif et
DEBUG=auth:* npm run dev

# Verbose logging
LOG_LEVEL=debug npm run dev
```

## 📚 API Dokümantasyonu

Swagger dokümantasyonu: `http://localhost:4001/api/docs`

## 🔗 İlgili Linkler

- [Vehicle Service](../vehicle-service/README.md)
- [API Gateway](../api-gateway/README.md)
- [Deployment Guide](../../../docs/deployment/README.md)
- [Security Guidelines](../../../docs/security/README.md)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.