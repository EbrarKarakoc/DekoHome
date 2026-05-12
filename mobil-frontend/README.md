# DekoHome Mobile

React Native + Expo (SDK 55) mobile app for DekoHome.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- For native dev builds:
  - **iOS**: macOS with Xcode 16+ and CocoaPods
  - **Android**: Android Studio with an SDK / emulator configured

## Setup

```bash
git clone <repo-url>
cd mobil-frontend
npm install
```

> `.npmrc` already sets `legacy-peer-deps=true`, so `npm install` works without flags.

## Running the app

This project uses **Expo SDK 55**, which requires a matching Expo Go build or a custom dev client. Pick **one** of the options below.

### Option 1 — Custom Dev Build (recommended)

Works on any device, never breaks when SDK versions change. Build once, then iterate with fast refresh.

```bash
# iOS (macOS only)
npm run ios

# Android (requires Android Studio / emulator or USB-connected device)
npm run android
```

The first run will compile the native project (a few minutes). Subsequent runs are instant — just run `npm start` and open the installed app.

```bash
npm start
```

### Option 2 — Expo Go (quick preview, no native build)

Only works if your installed Expo Go supports SDK 55.

1. Install the **latest Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. Run:
   ```bash
   npm run start:go
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

> If you see **"Project is incompatible with this version of Expo Go"**, your Expo Go is older than SDK 55. Update it from the store, or use Option 1.

### Option 3 — Web

```bash
npm run web
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Start Metro for the custom dev client |
| `npm run start:go` | Start Metro for Expo Go |
| `npm run ios` | Build & run the iOS dev client |
| `npm run android` | Build & run the Android dev client |
| `npm run web` | Run the web build |
| `npm run prebuild` | Regenerate `ios/` and `android/` native projects |
| `npm run typecheck` | TypeScript check (no emit) |

## Troubleshooting

**`ERESOLVE` on `npm install`** — `.npmrc` enables `legacy-peer-deps`. If you removed it, run `npm install --legacy-peer-deps`.

**"Project is incompatible with this version of Expo Go"** — Use a dev build (`npm run ios` / `npm run android`) or update Expo Go from the store.

**iOS build fails on Pods** — From `ios/`, run `pod install --repo-update`.

**Android build fails** — Ensure `ANDROID_HOME` is set and an emulator/device is available (`adb devices`).
