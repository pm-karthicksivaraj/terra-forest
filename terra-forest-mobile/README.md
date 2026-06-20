# Terra Forest Mobile — Digital MRV Platform

> Nền tảng MRV Số cho Lâm nghiệp Việt Nam | Digital MRV Platform for Vietnam Forestry

Flutter mobile application for the Terra Forest Digital MRV (Measurement, Reporting, and Verification) platform, designed for Bu Gia Map National Park, Dong Nai Province, Vietnam.

## Features

### Core Capabilities
- **Offline-First Architecture** — Full functionality without network; automatic sync when online
- **Vietnamese Default Language** — All UI text in Tiếng Việt with English fallback
- **5 Role-Based Views** — System Admin, Operations Manager, Team Lead, Ranger, Auditor
- **Geofencing & Polygon Drawing** — Draw boundaries, monitor zones, detect entry/exit
- **OTA Updates** — Over-the-air app updates with mandatory/optional controls
- **SOS Emergency** — One-tap distress signal with GPS coordinates
- **Evidence Capture** — Photo, video, voice notes with GPS metadata and file hashing

### Modules

| Module | Description |
|--------|-------------|
| **Home Dashboard** | Role-adaptive KPIs, quick actions, alerts summary, weather |
| **Map** | MapLibre GL with OSM tiles, geofences, forest plots, NDVI overlay, polygon drawing |
| **Patrol** | Check-in/out, GPS tracking, observations, evidence capture, SOS |
| **Alerts** | Fire risk, deforestation, AI detection alerts with severity levels |
| **Tasks** | Task assignment, status tracking, proof upload |
| **Evidence** | Photo/video/voice capture, offline upload queue, review status |
| **Biodiversity** | Species surveys with IUCN conservation status |
| **Fire & Weather** | FWI index, weather conditions, fire risk gauge |
| **Devices** | Device registration, telemetry, battery monitoring |
| **OTA** | Update checking, download progress, mandatory updates |
| **Settings** | Sync control, language, notifications, cache management |

## Role-Based Access

### Ranger (Kiểm lâm) — Primary Mobile User
- **Sees**: Home, Map, Patrol, Alerts, Profile
- **Can Do**: Check-in to patrols, capture evidence, submit observations, trigger SOS
- **Data Feeds**: GPS tracks, photos/videos/voice notes, observation forms, SOS alerts

### Team Lead (Trưởng đội)
- **Sees**: Home, Map, Patrol, Tasks, Alerts, Profile
- **Can Do**: Start team patrols, assign subtasks, validate submissions, confirm attendance

### Operations Manager (Quản lý vận hành)
- **Sees**: Home, Map, Patrol, Tasks, Evidence, Alerts, Profile
- **Can Do**: Create teams, monitor live sessions, review evidence, approve closures

### Auditor / Verifier (Kiểm toán/Xác minh)
- **Sees**: Home, Map, Evidence, Alerts, Profile
- **Can Do**: Review evidence history, verify timestamps, check route logs, audit trails

### System Admin (Quản trị viên)
- **Sees**: Home, Map, Alerts, Devices, Settings, Profile
- **Can Do**: Full platform access, user management, device management, OTA releases

## Architecture

```
lib/
├── core/                    # Shared infrastructure
│   ├── theme/               # Material 3 forest green theme
│   ├── constants/           # API URLs, role names, enum values
│   ├── network/             # Dio API client with auth/cache interceptors
│   ├── storage/             # SQLite database + sync engine
│   └── utils/               # Router, location service, permissions
├── features/                # Feature modules (Clean Architecture)
│   ├── auth/                # Login, biometrics, device registration
│   ├── home/                # Dashboard with role-based content
│   ├── map/                 # MapLibre, geofencing, polygon drawing
│   ├── patrol/              # Check-in/out, observations, evidence
│   ├── alerts/              # Alert list, detail, acknowledge
│   ├── tasks/               # Task assignment and tracking
│   ├── evidence/            # Media capture and upload queue
│   ├── ota/                 # Over-the-air updates
│   ├── biodiversity/        # Species surveys with IUCN status
│   ├── fire_weather/        # Fire risk and weather conditions
│   ├── devices/             # Device management and telemetry
│   └── settings/            # App settings and sync control
├── l10n/                    # Vietnamese (vi) + English (en) ARB files
└── main.dart                # App entry with BLoC providers
```

### Design Patterns
- **BLoC/Cubit** — State management with flutter_bloc
- **Clean Architecture** — Data → Domain → Presentation layers per feature
- **Offline-First** — Local SQLite with sync queue, exponential backoff retry
- **Repository Pattern** — Abstract repositories with offline-first implementations
- **Singleton** — ApiClient, LocalDatabase, SyncManager, LocationService

## Offline Strategy

| Component | Strategy |
|-----------|----------|
| **Authentication** | JWT cached in FlutterSecureStorage; biometric fallback |
| **Patrol Data** | Start/check-in locally; sync when online |
| **Observations** | Save to SQLite + queue; upload with retry |
| **Evidence Media** | Store locally; upload in background via Workmanager |
| **GPS Tracking** | Log every 5 min to SQLite; batch upload |
| **Alerts** | Download when online; read from cache offline |
| **Geofences** | Downloaded and stored locally for monitoring |
| **Sync Queue** | FIFO with 3 retries, exponential backoff (1m→5m→30m) |

## Theme Consistency with Web Platform

The mobile app uses the exact same color palette as the Next.js web platform:

| Color | Hex | Usage |
|-------|-----|-------|
| Forest 900 | `#0D3320` | App bar, sidebar background |
| Forest 700 | `#1B5A38` | Primary color (light mode) |
| Forest 600 | `#2D6A4F` | Chart color, emphasis |
| Forest 400 | `#52B788` | Primary color (dark mode), accent |
| Forest 100 | `#D8F3DC` | Light backgrounds, on-primary text |
| Fire 700 | `#E65100` | Alert critical, fire risk |
| Water 700 | `#0277BD` | Info, patrol route |

## Prerequisites

- Flutter 3.22+ / Dart 3.2+
- Android Studio / VS Code with Flutter extension
- Android SDK 24+ (Android 7.0+)
- iOS 14+ (Xcode 15+)
- Terra Forest backend running (Next.js API at localhost:3000)

## Setup

### 1. Install Dependencies

```bash
cd terra-forest-mobile
flutter pub get
```

### 2. Generate Localization Files

```bash
flutter gen-l10n
```

### 3. Generate Code (JSON serialization, etc.)

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 4. Configure Backend URL

Edit `lib/core/constants/app_constants.dart`:

```dart
// Production (default — points to the Vercel deployment)
static const String apiBaseUrl = 'https://terra-forest.vercel.app';

// Local dev with Next.js running on your machine:
//   - Android emulator:  http://10.0.2.2:3000
//   - iOS simulator:     http://localhost:3000
//   - Physical device:   http://192.168.1.100:3000 (your LAN IP)
```

### 5. Run the App

```bash
# Development
flutter run

# Android release
flutter run --release

# Specific device
flutter devices
flutter run -d <device_id>
```

## Building for Production

### Android APK

```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS

```bash
flutter build ios --release
# Then archive via Xcode
```

## Key Permissions

| Permission | Purpose |
|------------|---------|
| Location (Always) | Patrol GPS tracking, geofence monitoring, SOS |
| Camera | Evidence photo/video capture |
| Microphone | Voice note recording |
| Notifications | Alert push notifications |
| Storage | Offline data caching, evidence files |
| Biometric | Quick login with fingerprint/face |

## Data Flow

```
Ranger Mobile App
       │
       ├── Online ──→ API (Next.js) ──→ PostgreSQL ──→ Web Dashboard
       │                    │
       │                    └── Firebase FCM ──→ Push Notifications
       │
       └── Offline ──→ SQLite ──→ Sync Queue ──→ Auto-retry when online
                          │
                          └── Geofence Monitor ──→ Local Alerts
```

## Folder Structure Detail

```
terra-forest-mobile/
├── android/                 # Android platform code
├── ios/                     # iOS platform code
├── assets/                  # Images, icons, fonts, animations
├── lib/
│   ├── core/                # Shared infrastructure
│   │   ├── theme/           # AppTheme, ForestColor, AppIcons
│   │   ├── constants/       # AppConstants (API URLs, enums)
│   │   ├── network/         # ApiClient with Dio
│   │   ├── storage/         # LocalDatabase, SyncManager
│   │   └── utils/           # AppRouter, LocationService, Permissions
│   ├── features/            # Feature modules
│   │   └── [feature]/
│   │       ├── data/        # Datasources (remote + local) + Repository impl
│   │       ├── domain/      # Entities, Repository interfaces, Use cases
│   │       └── presentation/ # BLoC, Pages, Widgets
│   ├── l10n/                # Vietnamese + English ARB files
│   └── main.dart            # Entry point
├── pubspec.yaml             # Dependencies
├── l10n.yaml                # Localization config
└── analysis_options.yaml    # Linting rules
```

## License

Proprietary — Terra Forest Project
