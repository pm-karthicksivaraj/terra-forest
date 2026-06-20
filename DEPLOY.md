# 🚀 Deployment Guide — Terra Forest

Complete walkthrough for deploying the **web app to Vercel** and building the **mobile APK** that connects to it.

---

## Part 1 — Deploy Web App to Vercel

### Step 1: Provision a PostgreSQL Database

Vercel doesn't include a database — use one of these (all have free tiers):

| Provider | Free tier | Recommended for |
|----------|----------|------------------|
| **[Neon](https://neon.tech)** | 0.5 GB, always-on | Best DX, branching support |
| **[Supabase](https://supabase.com)** | 500 MB, full suite | If you want auth/storage too |
| **[Vercel Postgres](https://vercel.com/storage/postgres)** | 256 MB | Tightest Vercel integration |
| **[Railway](https://railway.app)** | $5 credit/mo | Simple, no limits |

**Recommended: Neon** — fast, modern, branches for staging.

After creating the DB, copy the connection string. It looks like:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/terra_forest?schema=public
```

### Step 2: Import Repo to Vercel

1. Go to **https://vercel.com/new**
2. Import the GitHub repo: `pm-karthicksivaraj/terra-forest`
3. Vercel auto-detects Next.js — leave defaults:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
4. **Environment Variables** — add these:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` (from Step 1) | Production, Preview, Development |
| `NEXTAUTH_SECRET` | (run `openssl rand -base64 32`) | Production |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `JWT_SECRET` | (run `openssl rand -base64 32`) | Production |

5. Click **Deploy** — first build takes ~3 min.

### Step 3: Initialize the Production Database

After the first successful deploy, run Prisma against your prod DB:

```bash
# Clone repo locally if you haven't
git clone https://github.com/pm-karthicksivaraj/terra-forest.git
cd terra-forest
npm install

# Set DATABASE_URL to your PROD Neon/Supabase URL
export DATABASE_URL="postgresql://...your-prod-url..."

# Push schema to prod DB
npx prisma db push

# Seed initial data (admin user, demo plots, etc.)
npx tsx prisma/seed.ts
```

Alternatively, use Prisma Studio to inspect:
```bash
npx prisma studio
# Opens http://localhost:5555 — connect to prod DB via DATABASE_URL
```

### Step 4: Verify the Deployment

1. Visit `https://your-app.vercel.app` — should load the login page
2. Log in with seeded admin credentials:
   - Email: `admin@terraforest.vn`
   - Password: `admin123`
3. Check the dashboard loads forest plots and rangers

If you see DB errors, verify `DATABASE_URL` is set in Vercel → Settings → Environment Variables.

---

## Part 2 — Build the Mobile APK

### Step 1: Install Flutter

```bash
# Mac (with Homebrew)
brew install --cask flutter

# Or download from https://docs.flutter.dev/get-started/install
flutter doctor
```

### Step 2: Point Mobile App at Vercel Backend

Edit **`terra-forest-mobile/lib/core/constants/app_constants.dart`**:

```dart
class AppConstants {
  // CHANGE THIS to your Vercel URL
  static const String apiBaseUrl = 'https://your-app.vercel.app';
  // ... rest unchanged
}
```

### Step 3: Build the APK

```bash
cd terra-forest-mobile

# Install dependencies
flutter pub get
flutter gen-l10n

# Build release APK
flutter build apk --release

# Output:
# build/app/outputs/flutter-apk/app-release.apk
```

### Step 4: Install on Device

**Option A — ADB (Android):**
```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

**Option B — Manual sideload:**
1. Copy `app-release.apk` to your Android phone
2. Open the file manager, tap the APK
3. Allow "Install from unknown sources" if prompted

### Step 5: Test Login

Open the app → log in with:
- Email: `ranger@terraforest.vn`
- Password: `ranger123`

The app should connect to your Vercel backend and show the home dashboard.

---

## Part 3 — Building an App Bundle (.aab) for Play Store

If you want to publish to Google Play:

```bash
cd terra-forest-mobile
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

You'll also need to:
1. Generate a upload keystore: https://docs.flutter.dev/deployment/android#signing-the-app
2. Configure `android/key.properties` (NOT committed to git)
3. Update `android/app/build.gradle` to read the keystore
4. Create a Play Console account ($25 one-time): https://play.google.com/console

---

## 🔧 Troubleshooting

### Vercel build fails on `prisma generate`

Add this to your `package.json` `postinstall` script:
```json
"postinstall": "prisma generate"
```

### Mobile app can't connect to Vercel

1. Make sure the URL in `app_constants.dart` uses `https://` (not `http://`)
2. Vercel enforces HTTPS — Android 9+ blocks cleartext HTTP by default
3. Test the URL in a browser first: `https://your-app.vercel.app/api/health`

### CORS errors from mobile

Vercel Next.js API routes need CORS headers for cross-origin requests. Check `src/lib/cors.ts` or add to your API route:
```ts
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### Database connection limit hit

Neon free tier has limited connections. In `schema.prisma`, add connection pooling:
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Use pooled URL for directUrl
}
```

Use the **pooled connection string** (port 6543 for Neon) for `DATABASE_URL` and the direct string (port 5432) for `DIRECT_URL`.

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Web app URL | `https://your-app.vercel.app` |
| GitHub repo | https://github.com/pm-karthicksivaraj/terra-forest |
| Vercel dashboard | https://vercel.com/dashboard |
| Neon dashboard | https://neon.tech/dashboard |
| Prisma Studio | `npx prisma studio` (local) |
| Flutter docs | https://docs.flutter.dev |
| APK output path | `terra-forest-mobile/build/app/outputs/flutter-apk/app-release.apk` |

---

**Need help?** Check the in-repo `LOCAL_SETUP.md` for local dev details, or open an issue on GitHub.
