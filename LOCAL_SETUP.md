# Terra Forest - Digital MRV Platform
# Local Setup Guide

## 📋 Prerequisites

- **Node.js** 18+ (recommended: 20.x LTS)
- **npm** or **bun** package manager
- **PostgreSQL** 14+ with `postgres` superuser
- **Git**

---

## 🚀 Quick Start (5 minutes)

### 1. Extract the project

```bash
tar -xzf terra-forest-full.tar.gz -C terra-forest
cd terra-forest
```

### 2. Create PostgreSQL database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE terra_forest;

# Verify
\l terra_forest

# Exit
\q
```

### 3. Configure environment

The `.env` file is already configured. If you need to change the database URL:

```bash
# Edit .env and update these lines:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/terra_forest?schema=public"
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/terra_forest?schema=public"
```

> **Note**: Special characters in password must be URL-encoded. For example, `@` becomes `%40`.

### 4. Install dependencies

```bash
# Install root (Next.js) dependencies
npm install

# Install frontend dependencies
cd terra-forest/frontend
npm install
cd ../..
```

### 5. Push database schema & seed data

```bash
# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL (creates all tables)
npx prisma db push

# Seed the database with sample data
npx tsx prisma/seed.ts
```

Or use the combined command:
```bash
npm run db:setup
```

### 6. Build the Vue frontend

```bash
cd terra-forest/frontend
npm run build
cd ../..

# Copy built assets to Next.js public directory
cp -r terra-forest/frontend/dist/* public/terra-forest/
```

### 7. Start the development server

```bash
npm run dev
```

Open **http://localhost:3000/terra-forest** in your browser.

---

## 🔐 Default Login Credentials

| Email | Password | Role | MFA |
|-------|----------|------|-----|
| admin@terraforest.vn | password | Admin | Yes (any 6-digit code) |
| analyst@terraforest.vn | password | Analyst | No |
| govviewer@terraforest.vn | password | Gov Viewer | Yes (any 6-digit code) |
| fieldofficer@terraforest.vn | password | Field Officer | No |

---

## 📁 Project Structure

```
terra-forest/
├── .env                          # Environment variables (PostgreSQL config)
├── .env.example                  # Environment template
├── package.json                  # Next.js root package
├── prisma/
│   ├── schema.prisma             # PostgreSQL database schema (18 models)
│   └── seed.ts                   # Database seeder
├── src/
│   ├── app/
│   │   ├── api/                  # 61 Mock API route handlers
│   │   │   ├── auth/             # Login, MFA, Keycloak SSO
│   │   │   ├── dashboard/        # Summary, carbon trend, alerts
│   │   │   ├── forest-plots/     # CRUD + attachments, geometry, metadata
│   │   │   ├── carbon/           # Carbon records & verification
│   │   │   ├── compliance/       # Overview & plot compliance
│   │   │   ├── ai-assessments/   # AI review queue
│   │   │   ├── ai-pipeline/      # Pipeline runs & models
│   │   │   ├── reports/          # Generate & export reports
│   │   │   ├── provinces/        # Province listing
│   │   │   ├── blockchain/       # Carbon credits, passports, transactions
│   │   │   ├── events/           # Kafka, SSE, WebSocket alerts
│   │   │   ├── data-governance/  # GeoNetwork & FRMS sync
│   │   │   └── system/           # Health, metrics, security, load tests
│   │   └── terra-forest/
│   │       └── page.tsx          # Vue app iframe entry
│   ├── components/ui/            # shadcn/ui components
│   ├── hooks/                    # React hooks
│   └── lib/                      # Utilities & stores
├── public/
│   └── terra-forest/             # Vue built assets
├── terra-forest/
│   ├── frontend/                 # Vue 3 application
│   │   ├── src/
│   │   │   ├── views/            # 16 Vue views
│   │   │   ├── stores/           # 10 Pinia stores
│   │   │   ├── components/       # 4 components
│   │   │   ├── composables/      # 3 composables
│   │   │   ├── i18n/             # Vietnamese (vi) + English (en)
│   │   │   ├── router/           # Vue Router config
│   │   │   └── layouts/          # MainLayout
│   │   ├── vite.config.js        # base: '/terra-forest/'
│   │   └── package.json
│   ├── backend/                  # Laravel 11 backend (reference)
│   │   ├── app/
│   │   │   ├── Models/           # Eloquent models
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/Api/  # API controllers
│   │   │   │   ├── Middleware/       # RBAC, JSON response
│   │   │   │   └── Requests/        # Form validation
│   │   │   ├── Policies/        # Authorization policies
│   │   │   ├── Jobs/            # Queued jobs
│   │   │   ├── Services/        # MinIO, AI service
│   │   │   └── Traits/          # API response trait
│   │   ├── database/
│   │   │   ├── migrations/       # Laravel migrations
│   │   │   ├── seeders/          # Laravel seeders
│   │   │   └── factories/        # Model factories
│   │   └── tests/                # PHPUnit tests
│   ├── ai-service/               # Python FastAPI AI service
│   │   ├── main.py               # FastAPI app entry
│   │   ├── routers/              # API routers
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── core/                 # Config & database
│   │   └── tests/                # Pytest tests
│   ├── nginx/                    # Nginx configs
│   ├── docker-compose.yml        # Development Docker
│   └── docker-compose.prod.yml   # Production Docker
└── docker-compose.yml            # Root Docker compose
```

---

## 🗄️ Database Schema (18 Models)

| Model | Description |
|-------|-------------|
| Province | 5 Vietnamese provinces with regions |
| Organization | Government, academic, NGO, private orgs |
| User | Users with MFA and RBAC support |
| Role | Spatie-compatible roles (admin, analyst, gov_viewer, field_officer) |
| Permission | 14 fine-grained permissions |
| UserRole | User-role pivot table |
| UserPermission | User-permission pivot table |
| RolePermission | Role-permission pivot table |
| ForestPlot | Forest plots with geometry, fire risk, species |
| PlotMetadata | ISO 19115 metadata with GeoNetwork sync |
| PlotAttachment | File attachments for plots |
| CarbonRecord | Carbon stock measurements (2020-2024) |
| Alert | Fire risk, deforestation, AI detection alerts |
| PlotAiAssessment | AI boundary/crown/species assessments |
| Report | Report generation & export |
| MonitoringStation | Weather, camera, sensor stations |
| CarbonCredit | Blockchain carbon credits |
| TimberPassport | VPA-FLEGT timber passports |
| FrmsSyncLog | FRMS 4.0 synchronization logs |
| SpeciesCorrection | AI retraining corrections |
| PipelineRun | AI pipeline execution runs |

---

## 🛠️ Available NPM Scripts

```bash
# Development
npm run dev              # Start Next.js dev server on port 3000

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to PostgreSQL
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with sample data
npm run db:setup         # Push schema + seed (combined)

# Vue Frontend
cd terra-forest/frontend
npm run dev              # Vue dev server on port 5173
npm run build            # Build Vue for production
npm run preview          # Preview built Vue app

# Laravel Backend (requires PHP + Composer)
cd terra-forest/backend
composer install         # Install PHP dependencies
php artisan serve        # Start Laravel on port 8000

# Python AI Service (requires Python 3.10+)
cd terra-forest/ai-service
pip install -r requirements.txt
uvicorn main:app --reload  # Start FastAPI on port 8000
```

---

## 🌐 Application Routes

| Route | View | Description |
|-------|------|-------------|
| `/terra-forest/` | DashboardView | Main dashboard with KPIs |
| `/terra-forest/plots` | PlotsListView | Forest plot listing |
| `/terra-forest/plots/:id` | PlotDetailView | Plot detail with map |
| `/terra-forest/carbon` | CarbonView | Carbon tracking & charts |
| `/terra-forest/compliance` | ComplianceView | Compliance monitoring |
| `/terra-forest/ai-assessments` | ReviewQueueView | AI assessment review queue |
| `/terra-forest/reports` | ReportsView | Report generation |
| `/terra-forest/provinces` | ProvincesView | Province management |
| `/terra-forest/ai-pipeline` | AiPipelineView | AI pipeline management |
| `/terra-forest/events` | EventsView | Real-time events & Kafka |
| `/terra-forest/blockchain` | BlockchainView | Carbon credits & blockchain |
| `/terra-forest/data-governance` | DataGovernanceView | GeoNetwork & FRMS |
| `/terra-forest/system-health` | SystemHealthView | System monitoring |
| `/terra-forest/login` | LoginView | Login page |
| `/terra-forest/mfa` | MfaVerifyView | MFA verification |

---

## 🌍 Internationalization

- **Default**: Vietnamese (vi)
- **Secondary**: English (en)
- **Toggle**: Language switcher in the top navbar
- **500+ translation keys** covering all UI elements

---

## 🐛 Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql -U postgres -d terra_forest -c "SELECT 1;"

# If password has special characters, URL-encode them:
# @ → %40
# # → %23
# / → %2F
# : → %3A
```

### Prisma Issues

```bash
# Reset and re-seed
npx prisma db push --force-reset
npx tsx prisma/seed.ts

# Validate schema
npx prisma validate

# Check database status
npx prisma db push --help
```

### Vue Build Issues

```bash
cd terra-forest/frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

---

## 📌 Platform Warning

If you see this Docker warning:
```
The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)
```

This means you're on Apple Silicon (M1/M2/M3). Solutions:
1. **Use native PostgreSQL** (recommended for local dev) - you already have this!
2. **Add platform flag to docker-compose.yml**: `platform: linux/amd64`
3. **Use ARM64-compatible images**: change `postgres:15` to `postgres:15-alpine`

Since you already have PostgreSQL installed natively, you can ignore the Docker warning — just use your local PostgreSQL.

---

## 🏗️ Production Architecture (Reference)

The full stack for production deployment:

| Service | Technology | Port |
|---------|-----------|------|
| Frontend | Vue 3 + Vite | 80/443 (via Nginx) |
| Backend API | Laravel 11 | 8000 |
| AI Service | Python FastAPI | 8001 |
| Database | PostgreSQL 15 + PostGIS | 5432 |
| Cache/Queue | Redis | 6379 |
| Object Storage | MinIO | 9000/9001 |
| Map Server | GeoServer | 8081 |
| SSO | Keycloak | 8080 |
| Messaging | Apache Kafka | 9092 |
| Blockchain | Hyperledger Fabric | 7050/7051 |
| Metadata | GeoNetwork | 8082 |
| National System | FRMS 4.0 | External API |
| Reverse Proxy | Nginx | 80/443 |

For local development, only **PostgreSQL** and **Node.js** are required. All other services are mocked via the 61 API route handlers.

---

Built with ❤️ for Vietnam's Forestry MRV System
