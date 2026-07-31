# Unified Organization Workspace

> **Enterprise-Grade Unified Support Hub, Code Review Console, & Audit Platform**

A modern, full-stack multi-tenant web application combining Support Ticketing, Pull Request Reviews, Immutable Audit Logs, Notifications, and AI-powered Progress Digest under a single unified layout.

---

## 🚀 Features

- **🔐 Multi-Tenant Authentication & Session Management**:
  - Secure JWT authentication with refresh token mechanism.
  - Role-based Access Control (RBAC): `ORG_ADMIN`, `SUPPORT_AGENT`, `REVIEWER`, `CROSS_ORG_GUEST`, `SUPER_ADMIN`.
  - Organization switching with header-based tenant isolation (`x-organization-id`).

- **🎫 Support Hub Dashboard & Ticket Details**:
  - Full ticket lifecycle: Create, View, Edit, Delete, Filter, and Search.
  - Granular ticket details with public discussion threads, file attachments, and audit history timeline.
  - Partner Organization Banners & Security BOLA Scoping alerts.

- **🔀 PR Review & Audit Console**:
  - Pull Request tracking with reviewer assignment, approval status progress, and real-time metric cards.
  - Automated PR versioning snapshots upon code update.
  - Quick navigation button connecting PR review workflow directly to the Audit Viewer.

- **🛡️ Unified Organization Audit Trail**:
  - Immutable event log recording user actions, IP addresses, resource types, and security alerts.
  - Expandable row drawer for deep inspection of request metadata, session IDs, and JSON state diffs.
  - One-click CSV Audit Trail export.

- **🔔 Notifications & AI Progress Digest**:
  - Real-time notification bell dropdown with automatic 15-second polling.
  - Full notifications management console (`/notifications`) with filter pills and search.
  - AI Progress Digest (`/ai-digest`) providing automated SLA risk detection, priority action suggestions, and cross-org insights.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS / TailwindCSS with custom design system tokens
- **State & Data Fetching**: `@tanstack/react-query` (React Query v5) + Axios Interceptors
- **Icons & Alerts**: `lucide-react`, `sonner` toasts

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL / SQLite + Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt password hashing
- **Audit Logging**: Automatic audit event service

---

## 📁 Repository Structure

```
unified-org-workspace/
├── backend/                  # Express REST API server
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── controllers/      # API Controllers
│   │   ├── middleware/       # Auth, RBAC & Tenant Isolation Middleware
│   │   ├── routes/           # Express Route definitions
│   │   ├── services/         # Business Logic & Audit Log Services
│   │   └── server.ts         # Server Entrypoint
│   ├── .env.example
│   └── package.json
└── frontend/                 # React SPA Single Page Application
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── context/          # Auth & Organization Context Providers
    │   ├── lib/              # Axios API client setup
    │   ├── pages/            # Page Views (Tickets, PRs, Audit, Notifications, Digest)
    │   └── App.tsx           # Router Configuration
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Backend Setup & Database Migration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Push Prisma Schema to database & generate client
npx prisma db push
npx prisma generate

# Seed sample data (optional)
npx prisma db seed

# Start backend server
npm run dev
```
Backend running on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application running on: `http://localhost:5173`

---

## 🏗️ Production Build Commands

To build both services for production deployment:

### Backend Build
```bash
cd backend
npm run build
```

### Frontend Build
```bash
cd frontend
npm run build
```

The production frontend bundle will be compiled to `frontend/dist`.

---

## 🚀 Deployment Instructions

1. **Database**: Provision a PostgreSQL instance and update `DATABASE_URL` in `backend/.env`.
2. **Backend**: Run `npx prisma db push`, then start the compiled server using `node dist/server.js` or PM2 process manager.
3. **Frontend**: Host the static assets in `frontend/dist` using Nginx, Cloudflare Pages, Vercel, or AWS S3 + CloudFront.

---

## 📄 License
MIT License. Created for Enterprise Unified Organization Workspace.
