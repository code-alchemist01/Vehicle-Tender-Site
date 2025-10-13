# Vehicle Auction Platform

Enterprise-level vehicle auction web platform built with modern microservices architecture.

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

## 📁 Project Structure

```
vehicle-auction-platform/
├── apps/
│   ├── frontend/                 # Next.js 14 Application
│   └── backend/                  # Microservices
│       ├── api-gateway/          # API Gateway Service
│       ├── auth-service/         # Authentication Service
│       ├── vehicle-service/      # Vehicle Management Service
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
- **Auth Service:** http://localhost:4001
- **Vehicle Service:** http://localhost:4002
- **Auction Service:** http://localhost:4003
- **Bid Service:** http://localhost:4004
- **Payment Service:** http://localhost:4005
- **Notification Service:** http://localhost:4006
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **pgAdmin:** http://localhost:8080

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Development Guide](./docs/development/)
- [Deployment Guide](./docs/deployment/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.