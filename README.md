# 🌳 Terra Forest — Digital MRV Platform for Vietnam Forestry

A Monitoring, Reporting, and Verification (MRV) platform for Vietnam's forestry sector, deployed at **Bu Gia Map National Park** (Dong Nai province). Built as a monorepo with a Next.js web admin dashboard and a Flutter mobile app for offline-first field data collection.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📦 Repository Structure

```
terra-forest/
├── prisma/                      # Prisma schema + seed script
│   ├── schema.prisma            # Database models (PostgreSQL)
│   └── seed.ts                  # Seed data for local dev
├── public/                      # Static assets (images, icons)
├── src/                         # Next.js App Router source
│   ├── app/                     # Routes & pages
│   ├── components/              # React components (shadcn/ui)
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities, API client, auth
├── terra-forest-mobile/         # Flutter mobile app (field officers)
│   ├── lib/
│   │   ├── core/                # API client, storage, sync engine
│   │   ├── features/            # Auth, map, biodiversity, etc.
│   │   └── main.dart
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
├── package.json                 # Next.js dependencies
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── prisma/schema.prisma
```

---

## 🌐 Web App (Next.js + Prisma)

**Stack**: Next.js 15 · TypeScript · TailwindCSS · shadcn/ui · Prisma ORM · PostgreSQL

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL (PostgreSQL recommended)

# 3. Set up database
npx prisma db push
npx tsx prisma/seed.ts

# 4. Run dev server
npm run dev
# Open http://localhost:3000
```

### Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for full step-by-step instructions.

Quick version:
1. Push this repo to GitHub (already done)
2. Go to https://vercel.com/new → import the repo
3. Add env var `DATABASE_URL` (use Neon, Supabase, or Vercel Postgres)
4. Deploy — Vercel auto-detects Next.js + Prisma
5. Run `npx prisma db push && npx tsx prisma/seed.ts` against your prod DB once

---

## 📱 Mobile App (Flutter)

**Stack**: Flutter · Dart · SQLite (offline-first) · flutter_map · dio · bloc · go_router

### Local Development

```bash
cd terra-forest-mobile

# 1. Install dependencies
flutter pub get
flutter gen-l10n

# 2. Run on Android emulator/device
flutter run
```

### Build APK

```bash
cd terra-forest-mobile
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Connect Mobile App to Vercel Backend

After deploying the web app to Vercel, edit the API base URL in the mobile app:

**File**: `terra-forest-mobile/lib/core/constants/app_constants.dart`

```dart
static const String apiBaseUrl = 'https://your-vercel-app.vercel.app';
```

For local testing with Android emulator, use `http://10.0.2.2:3000` (maps to host machine's localhost:3000).

---

## 🔐 Authentication

- **Web**: Session-based via NextAuth (or JWT — see `src/lib/auth.ts`)
- **Mobile**: JWT-based with offline-first SQLite storage
- Default seed credentials (dev only):
  - Admin: `admin@terraforest.vn` / `admin123`
  - Ranger: `ranger@terraforest.vn` / `ranger123`

---

## 🗺️ Key Features

### Web Dashboard
- Forest plot management (CRUD)
- Ranger & patrol assignment
- Alert monitoring & verification
- Geofence zone editor
- Biodiversity observation review
- NDVI satellite imagery viewer
- OTA update distribution for mobile app

### Mobile App (Field Officers)
- **Offline-first**: All data collected offline syncs automatically when online
- **Map**: OSM tiles, geofence polygons, forest plot markers, polygon drawing
- **Patrol tracking**: GPS breadcrumbs with 5-min pings
- **Data collection**: Tree measurements, violation reports, biodiversity observations
- **SOS**: Emergency alert with GPS coordinates (accessible without login)
- **Sync engine**: FIFO queue with exponential backoff retry

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Web frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Web backend | Next.js API routes (App Router) |
| Database | PostgreSQL (production), SQLite (local dev option) |
| ORM | Prisma 6.x |
| Mobile | Flutter 3.x, Dart 3.x |
| Mobile storage | SQLite (sqflite) |
| Mobile map | flutter_map 7.0.2 + OSM tiles |
| Mobile state | flutter_bloc |
| Auth | JWT (mobile), session (web) |
| Deployment | Vercel (web), APK sideload (mobile) |

---

## 📚 Documentation

- **[DEPLOY.md](./DEPLOY.md)** — Full deployment guide (Vercel + APK)
- **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** — Detailed local dev setup

---

**Built for Bu Gia Map National Park · Dong Nai, Vietnam** 🇻🇳
