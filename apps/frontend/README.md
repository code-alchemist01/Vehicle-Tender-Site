# Vehicle Auction Platform - Frontend

Modern React + TypeScript + Vite frontend uygulaması.

## 🚀 Özellikler

- **React 18** + **TypeScript** - Modern ve type-safe
- **Vite** - Hızlı development ve build
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🔌 Backend Bağlantısı

Frontend şu backend servislerine bağlanır:

- **Auth Service**: `http://localhost:4001/api/v1`
- **Vehicle Service**: `http://localhost:4002/api/v1`
- **Auction Service**: `http://localhost:4003`
- **Bid Service**: `http://localhost:4004`
- **Payment Service**: `http://localhost:4005`
- **Notification Service**: `http://localhost:4006`

## 📁 Proje Yapısı

```
src/
├── components/     # Reusable components
│   ├── layout/   # Layout components
│   └── ui/       # UI components
├── lib/          # Utilities and helpers
│   └── api/      # API client and services
├── pages/        # Page components
├── store/        # Zustand stores
└── types/        # TypeScript types
```

## 🎨 Stil

Tailwind CSS kullanılıyor. Custom utility classes `src/index.css` içinde tanımlı.

## 🔐 Authentication

JWT token-based authentication kullanılıyor. Token'lar localStorage'da saklanıyor ve axios interceptor'ları ile otomatik olarak request'lere ekleniyor.

