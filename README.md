# Vehicle Auction Platform

Enterprise-level vehicle auction web platform built with modern microservices architecture.

## 📊 Current Project Status

### ✅ Completed Components

**Backend Services:**
- ✅ **Auth Service** - Fully implemented with JWT authentication, refresh tokens, password security
- ✅ **Vehicle Service** - Complete CRUD operations with advanced filtering and pagination
- ✅ **Database Schemas** - Prisma models for both auth and vehicle databases
- ✅ **API Endpoints** - All endpoints tested and working with proper error handling
- ✅ **Rate Limiting** - Implemented across all services for security

**Development Infrastructure:**
- ✅ **Prisma ORM** - Database models and migrations configured
- ✅ **Docker Configuration** - Development environment setup
- ✅ **API Testing** - Comprehensive endpoint testing completed
- ✅ **Error Handling** - Proper HTTP status codes and error responses

### 🚧 In Progress
- Frontend development (Next.js 14)
- API Gateway implementation
- Real-time bidding system

### 📋 Upcoming Features
- Auction management system
- Payment processing
- Real-time notifications
- Admin dashboard
- Mobile responsiveness

## 🗺️ Development Roadmap

### Phase 1: Frontend Foundation (Next 2-3 weeks)
**Priority: HIGH**
- [ ] Next.js 14 project setup with App Router
- [ ] Shadcn/ui component library integration
- [ ] Authentication pages (Login, Register, Profile)
- [ ] Vehicle listing and detail pages
- [ ] Responsive design implementation
- [ ] State management with Zustand

### Phase 2: Core Auction Features (3-4 weeks)
**Priority: HIGH**
- [ ] Real-time bidding system with Socket.io
- [ ] Auction countdown timers
- [ ] Bid history and notifications
- [ ] Image upload and gallery
- [ ] Search and filtering UI
- [ ] User dashboard

### Phase 3: Advanced Features (4-5 weeks)
**Priority: MEDIUM**
- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Admin panel for auction management
- [ ] Advanced analytics and reporting
- [ ] Mobile app development (React Native)

### Phase 4: Production & Optimization (2-3 weeks)
**Priority: MEDIUM**
- [ ] Performance optimization
- [ ] Security hardening
- [ ] CI/CD pipeline setup
- [ ] Monitoring and logging
- [ ] Load testing
- [ ] Production deployment

## 🎯 Immediate Next Steps

1. **Frontend Development Start**
   - Set up Next.js 14 project structure
   - Configure Tailwind CSS and Shadcn/ui
   - Create authentication flow

2. **API Gateway Implementation**
   - Set up NestJS API Gateway
   - Configure service routing
   - Implement authentication middleware

3. **Real-time Features**
   - Socket.io server setup
   - Real-time bidding implementation
   - Live auction updates

## 🏗️ Architecture

This project uses a **monorepo** structure with **microservices** backend and **Next.js 14** frontend.

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Zustand (State Management)
- React Query (Data Fetching)
- Socket.io Client (Real-time)

**Backend:**
- NestJS (Microservices)
- Prisma ORM
- PostgreSQL
- Redis
- Socket.io (Real-time)
- Bull Queue (Job Processing)
- JWT Authentication

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- Turborepo (Monorepo Management)
- PNPM Workspaces
- GitHub Actions (CI/CD)

## 🗃️ Database Schema

### Auth Database Tables

**users**
- `id` (String, Primary Key)
- `email` (String, Unique)
- `firstName`, `lastName` (String)
- `phone` (String, Optional)
- `password` (String, Hashed)
- `role` (Enum: USER, ADMIN, MODERATOR)
- `isActive`, `isEmailVerified` (Boolean)
- `emailVerificationToken`, `passwordResetToken` (String, Optional)
- `passwordResetExpires`, `lastLoginAt` (DateTime, Optional)
- `createdAt`, `updatedAt` (DateTime)

**refresh_tokens**
- `id` (String, Primary Key)
- `token` (String, Unique)
- `userId` (String, Foreign Key)
- `expiresAt` (DateTime)
- `isRevoked` (Boolean)
- `createdAt` (DateTime)

**login_history**
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `ipAddress`, `userAgent` (String, Optional)
- `success` (Boolean)
- `action` (Enum: LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, TOKEN_REFRESH)
- `createdAt` (DateTime)

### Vehicle Database Tables

**categories**
- `id` (String, Primary Key)
- `name` (String, Unique)
- `description` (String, Optional)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (DateTime)

**vehicles**
- `id` (String, Primary Key)
- `make`, `model` (String)
- `year`, `mileage` (Integer)
- `fuelType` (Enum: GASOLINE, DIESEL, ELECTRIC, HYBRID, LPG, CNG)
- `transmission` (Enum: MANUAL, AUTOMATIC, CVT, SEMI_AUTOMATIC)
- `condition` (Enum: NEW, EXCELLENT, GOOD, FAIR, POOR)
- `status` (Enum: ACTIVE, INACTIVE, SOLD, PENDING, DRAFT)
- `description` (String, Optional)
- `images` (String Array)
- `engineSize` (Float, Optional)
- `color`, `vin`, `licensePlate`, `location` (String, Optional)
- `estimatedValue`, `reservePrice` (Float, Optional)
- `userId`, `categoryId` (String, Foreign Keys)
- `createdAt`, `updatedAt` (DateTime)

**auctions**
- `id` (String, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `startPrice`, `reservePrice`, `currentBid` (Float)
- `startTime`, `endTime` (DateTime)
- `status` (Enum: DRAFT, ACTIVE, ENDED, CANCELLED)
- `vehicleId` (String, Unique Foreign Key)
- `userId`, `winnerId` (String, Foreign Keys)
- `createdAt`, `updatedAt` (DateTime)

**bids**
- `id` (String, Primary Key)
- `amount` (Float)
- `userId`, `auctionId` (String, Foreign Keys)
- `createdAt` (DateTime)

## 📁 Project Structure

```
vehicle-auction-platform/
├── apps/
│   ├── frontend/                 # Next.js 14 Application
│   └── backend/                  # Microservices
│       ├── api-gateway/          # API Gateway Service
│       ├── auth-service/         # Authentication Service ✅
│       ├── vehicle-service/      # Vehicle Management Service ✅
│       ├── auction-service/      # Auction Management Service
│       ├── bid-service/          # Bidding Service
│       ├── payment-service/      # Payment Processing Service
│       └── notification-service/ # Notification Service
├── packages/
│   ├── types/                    # Shared TypeScript Types
│   ├── utils/                    # Shared Utilities
│   └── config/                   # Shared Configuration
├── infrastructure/
│   ├── docker/                   # Docker Configurations
│   ├── kubernetes/               # Kubernetes Manifests
│   └── nginx/                    # Nginx Configuration
├── scripts/                      # Build & Deploy Scripts
├── docs/                         # Documentation
└── .github/workflows/            # CI/CD Workflows
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PNPM 8.12.0+
- Docker Desktop
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd vehicle-auction-platform
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start infrastructure:**
   ```bash
   pnpm docker:up
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start development servers:**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individually
   pnpm start:frontend
   pnpm start:backend
   ```

## 📋 Available Scripts

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all applications
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm docker:up` - Start Docker services
- `pnpm docker:down` - Stop Docker services
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with sample data

## 🌐 Services & Ports

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:4000
- **Auth Service:** http://localhost:3001 ✅
- **Vehicle Service:** http://localhost:4002 ✅
- **Auction Service:** http://localhost:4003
- **Bid Service:** http://localhost:4004
- **Payment Service:** http://localhost:4005
- **Notification Service:** http://localhost:4006
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **pgAdmin:** http://localhost:8080

## 🔌 API Endpoints (Currently Working)

> **📚 Detaylı API Dokümantasyonu:** [Backend API Dokümantasyonu](./docs/api/backend-api.md)

### Auth Service (Port 3001) ✅
```bash
POST /api/v1/auth/register        # Kullanıcı kaydı
POST /api/v1/auth/login           # Kullanıcı girişi
POST /api/v1/auth/refresh         # Access token yenileme
POST /api/v1/auth/logout          # Kullanıcı çıkışı
POST /api/v1/auth/change-password # Şifre değiştirme
GET  /api/v1/auth/profile         # Kullanıcı profili
GET  /api/v1/auth/login-history   # Giriş geçmişi
```

### Vehicle Service (Port 4002) ✅
```bash
# Araçlar
GET    /api/v1/vehicles           # Araç listesi (filtreleme ve sayfalama)
POST   /api/v1/vehicles           # Yeni araç oluşturma
GET    /api/v1/vehicles/:id       # Araç detayı
PUT    /api/v1/vehicles/:id       # Araç güncelleme
DELETE /api/v1/vehicles/:id       # Araç silme
GET    /api/v1/vehicles/search    # Araç arama
GET    /api/v1/vehicles/my-vehicles # Kullanıcının araçları

# Açık Artırmalar
GET    /api/v1/auctions           # Açık artırma listesi
POST   /api/v1/auctions           # Yeni açık artırma
GET    /api/v1/auctions/:id       # Açık artırma detayı
PUT    /api/v1/auctions/:id       # Açık artırma güncelleme
DELETE /api/v1/auctions/:id       # Açık artırma silme

# Teklifler
GET    /api/v1/bids               # Teklif listesi
POST   /api/v1/bids               # Yeni teklif verme
GET    /api/v1/bids/:id           # Teklif detayı

# Kategoriler
GET    /api/v1/categories         # Kategori listesi
POST   /api/v1/categories         # Yeni kategori oluşturma
PUT    /api/v1/categories/:id     # Kategori güncelleme
DELETE /api/v1/categories/:id     # Kategori silme
```

### Filtreleme ve Sayfalama Parametreleri ✅
```bash
# Araç Filtreleme
?page=1&limit=10&make=BMW&model=X5&yearFrom=2020&yearTo=2023&mileageFrom=10000&mileageTo=50000&fuelType=GASOLINE

# Araç Arama
?q=Toyota&page=1&limit=10

# Açık Artırma Filtreleme
?page=1&limit=10&status=ACTIVE&startPriceFrom=100000&startPriceTo=500000

# Teklif Filtreleme
?page=1&limit=10&amountFrom=100000&amountTo=1000000&auctionId=auction-uuid
```

### Doğru Parametre İsimleri ⚠️
- **Yıl filtreleme:** `yearFrom`, `yearTo` (~~minYear, maxYear değil~~)
- **Kilometre filtreleme:** `mileageFrom`, `mileageTo`
- **Fiyat filtreleme:** `startPriceFrom`, `startPriceTo`
- **Teklif filtreleme:** `amountFrom`, `amountTo`

## 📚 Documentation

- **[Backend API Dokümantasyonu](./docs/api/backend-api.md)** - Kapsamlı API endpoint rehberi
- [Development Guide](./docs/development/) - Geliştirme rehberi
- [Deployment Guide](./docs/deployment/) - Deployment rehberi

### API Dokümantasyonu İçeriği
- ✅ **Auth Service** - Kimlik doğrulama endpoint'leri
- ✅ **Vehicle Service** - Araç yönetimi endpoint'leri
- ✅ **Filtreleme Parametreleri** - Doğru parametre isimleri
- ✅ **Hata Kodları** - HTTP status kodları ve hata mesajları
- ✅ **Örnek İstekler** - Detaylı request/response örnekleri

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.