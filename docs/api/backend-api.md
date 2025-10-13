# Vehicle Auction Platform - Backend API Dokümantasyonu

## 📋 Genel Bilgiler

Bu dokümantasyon, Vehicle Auction Platform'un backend mikroservislerinin API endpoint'lerini detaylı olarak açıklamaktadır.

### Base URL'ler
- **Auth Service:** `http://localhost:3001`
- **Vehicle Service:** `http://localhost:4002`

### Genel HTTP Status Kodları
- `200 OK` - İstek başarılı
- `201 Created` - Kaynak başarıyla oluşturuldu
- `400 Bad Request` - Geçersiz istek parametreleri
- `401 Unauthorized` - Kimlik doğrulama gerekli
- `403 Forbidden` - Erişim izni yok
- `404 Not Found` - Kaynak bulunamadı
- `500 Internal Server Error` - Sunucu hatası

### Authentication
Çoğu endpoint JWT token gerektirir. Token'ı `Authorization` header'ında `Bearer` prefix'i ile gönderin:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Auth Service API (Port 3001)

### 1. Kullanıcı Kaydı
**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+90 555 123 4567" // Opsiyonel
}
```

**Response (201 Created):**
```json
{
  "message": "Kullanıcı başarıyla kaydedildi",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true,
    "isEmailVerified": false
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### 2. Kullanıcı Girişi
**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Giriş başarılı",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### 3. Token Yenileme
**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (200 OK):**
```json
{
  "message": "Token başarıyla yenilendi",
  "tokens": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  }
}
```

### 4. Çıkış
**Endpoint:** `POST /api/v1/auth/logout`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200 OK):**
```json
{
  "message": "Başarıyla çıkış yapıldı"
}
```

### 5. Şifre Değiştirme
**Endpoint:** `POST /api/v1/auth/change-password`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### 6. Profil Bilgileri
**Endpoint:** `GET /api/v1/auth/profile`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+90 555 123 4567",
  "role": "USER",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T14:20:00Z"
}
```

### 7. Giriş Geçmişi
**Endpoint:** `GET /api/v1/auth/login-history`

**Headers:** `Authorization: Bearer <access-token>`

**Query Parameters:**
- `page` (number, default: 1) - Sayfa numarası
- `limit` (number, default: 10) - Sayfa başına kayıt sayısı

---

## 🚗 Vehicle Service API (Port 4002)

### Kategoriler

#### 1. Kategori Listesi
**Endpoint:** `GET /api/v1/categories`

**Response (200 OK):**
```json
[
  {
    "id": "category-uuid",
    "name": "Otomobil",
    "description": "Binek araçlar",
    "isActive": true,
    "_count": {
      "vehicles": 15
    }
  }
]
```

#### 2. Kategori Oluşturma
**Endpoint:** `POST /api/v1/categories`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "Motosiklet",
  "description": "İki tekerlekli motorlu araçlar"
}
```

### Araçlar

#### 1. Araç Listesi (Filtreleme ve Sayfalama)
**Endpoint:** `GET /api/v1/vehicles`

**Query Parameters:**
- **Sayfalama:**
  - `page` (number, default: 1) - Sayfa numarası
  - `limit` (number, default: 10) - Sayfa başına kayıt sayısı

- **Filtreleme:**
  - `categoryId` (string) - Kategori ID'si
  - `make` (string) - Marka
  - `model` (string) - Model
  - `yearFrom` (number) - Minimum yıl
  - `yearTo` (number) - Maksimum yıl
  - `mileageFrom` (number) - Minimum kilometre
  - `mileageTo` (number) - Maksimum kilometre
  - `fuelType` (string) - Yakıt türü (GASOLINE, DIESEL, ELECTRIC, HYBRID, LPG, CNG)
  - `transmission` (string) - Vites türü (MANUAL, AUTOMATIC, CVT, SEMI_AUTOMATIC)
  - `condition` (string) - Durum (NEW, EXCELLENT, GOOD, FAIR, POOR)
  - `status` (string) - Araç durumu (ACTIVE, INACTIVE, SOLD, PENDING, DRAFT)

**Örnek İstek:**
```
GET /api/v1/vehicles?page=1&limit=5&make=BMW&yearFrom=2020&yearTo=2023&fuelType=GASOLINE
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "vehicle-uuid",
      "make": "BMW",
      "model": "X5",
      "year": 2022,
      "mileage": 25000,
      "fuelType": "GASOLINE",
      "transmission": "AUTOMATIC",
      "condition": "EXCELLENT",
      "status": "ACTIVE",
      "description": "Temiz araç",
      "images": ["image1.jpg", "image2.jpg"],
      "engineSize": 3.0,
      "color": "Siyah",
      "location": "İstanbul",
      "estimatedValue": 850000,
      "category": {
        "id": "category-uuid",
        "name": "SUV"
      },
      "user": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### 2. Araç Arama
**Endpoint:** `GET /api/v1/vehicles/search`

**Query Parameters:**
- `q` (string, required) - Arama sorgusu
- `page` (number, default: 1) - Sayfa numarası
- `limit` (number, default: 10) - Sayfa başına kayıt sayısı

**Örnek İstek:**
```
GET /api/v1/vehicles/search?q=Toyota&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "vehicle-uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2021,
      "mileage": 35000,
      "fuelType": "GASOLINE",
      "transmission": "AUTOMATIC",
      "condition": "GOOD",
      "status": "ACTIVE",
      "category": {
        "name": "Otomobil"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### 3. Araç Oluşturma
**Endpoint:** `POST /api/v1/vehicles`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "mileage": 50000,
  "fuelType": "GASOLINE",
  "transmission": "AUTOMATIC",
  "condition": "GOOD",
  "description": "Temiz ve bakımlı araç",
  "images": ["image1.jpg", "image2.jpg"],
  "engineSize": 2.5,
  "color": "Beyaz",
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "34 ABC 123",
  "location": "İstanbul",
  "estimatedValue": 450000,
  "reservePrice": 400000,
  "categoryId": "category-uuid"
}
```

**Response (201 Created):**
```json
{
  "message": "Araç başarıyla oluşturuldu",
  "vehicle": {
    "id": "vehicle-uuid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 4. Araç Detayı
**Endpoint:** `GET /api/v1/vehicles/:id`

**Response (200 OK):**
```json
{
  "id": "vehicle-uuid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "mileage": 50000,
  "fuelType": "GASOLINE",
  "transmission": "AUTOMATIC",
  "condition": "GOOD",
  "status": "ACTIVE",
  "description": "Temiz ve bakımlı araç",
  "images": ["image1.jpg", "image2.jpg"],
  "engineSize": 2.5,
  "color": "Beyaz",
  "vin": "1HGBH41JXMN109186",
  "licensePlate": "34 ABC 123",
  "location": "İstanbul",
  "estimatedValue": 450000,
  "reservePrice": 400000,
  "category": {
    "id": "category-uuid",
    "name": "Otomobil",
    "description": "Binek araçlar"
  },
  "user": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### 5. Araç Güncelleme
**Endpoint:** `PUT /api/v1/vehicles/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:** (Araç oluşturma ile aynı format)

#### 6. Araç Silme
**Endpoint:** `DELETE /api/v1/vehicles/:id`

**Headers:** `Authorization: Bearer <access-token>`

**Response (200 OK):**
```json
{
  "message": "Araç başarıyla silindi"
}
```

#### 7. Kullanıcının Araçları
**Endpoint:** `GET /api/v1/vehicles/my-vehicles`

**Headers:** `Authorization: Bearer <access-token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

### Açık Artırmalar

#### 1. Açık Artırma Listesi
**Endpoint:** `GET /api/v1/auctions`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - DRAFT, ACTIVE, ENDED, CANCELLED
- `startPriceFrom` (number) - Minimum başlangıç fiyatı
- `startPriceTo` (number) - Maksimum başlangıç fiyatı

#### 2. Açık Artırma Oluşturma
**Endpoint:** `POST /api/v1/auctions`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "title": "2020 Toyota Camry Açık Artırması",
  "description": "Temiz ve bakımlı araç",
  "startPrice": 400000,
  "reservePrice": 450000,
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-25T18:00:00Z",
  "vehicleId": "vehicle-uuid"
}
```

### Teklifler

#### 1. Teklif Verme
**Endpoint:** `POST /api/v1/bids`

**Headers:** `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "amount": 420000,
  "auctionId": "auction-uuid"
}
```

#### 2. Teklif Listesi
**Endpoint:** `GET /api/v1/bids`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `auctionId` (string) - Belirli bir açık artırmanın teklifleri
- `amountFrom` (number) - Minimum teklif miktarı
- `amountTo` (number) - Maksimum teklif miktarı

---

## 🔧 Hata Kodları ve Mesajları

### Yaygın Hata Yanıtları

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email format is invalid"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized access"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 📝 Notlar

### Parametre İsimleri
- Yıl filtreleme için: `yearFrom` ve `yearTo` kullanın (~~minYear, maxYear değil~~)
- Kilometre filtreleme için: `mileageFrom` ve `mileageTo` kullanın
- Fiyat filtreleme için: `startPriceFrom` ve `startPriceTo` kullanın

### Enum Değerleri

**Yakıt Türleri:**
- `GASOLINE` - Benzin
- `DIESEL` - Dizel
- `ELECTRIC` - Elektrik
- `HYBRID` - Hibrit
- `LPG` - LPG
- `CNG` - CNG

**Vites Türleri:**
- `MANUAL` - Manuel
- `AUTOMATIC` - Otomatik
- `CVT` - CVT
- `SEMI_AUTOMATIC` - Yarı Otomatik

**Araç Durumu:**
- `NEW` - Sıfır
- `EXCELLENT` - Mükemmel
- `GOOD` - İyi
- `FAIR` - Orta
- `POOR` - Kötü

**Araç Statüsü:**
- `ACTIVE` - Aktif
- `INACTIVE` - Pasif
- `SOLD` - Satıldı
- `PENDING` - Beklemede
- `DRAFT` - Taslak

### Rate Limiting
- Tüm endpoint'ler için dakikada 100 istek limiti
- Auth endpoint'leri için dakikada 10 istek limiti

### Güvenlik
- Tüm şifreler bcrypt ile hash'lenir
- JWT token'lar 15 dakika geçerlidir
- Refresh token'lar 7 gün geçerlidir