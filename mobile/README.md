# MerckConnect Mobile App

React Native 0.85.3 · TypeScript · Firebase · i18n (EN / FR / AR)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 22.11.0 |
| Ruby / Bundler | for CocoaPods |
| Xcode | latest stable |
| Android Studio | latest stable |

---

## First-Time Setup

```bash
# Install JS dependencies
npm install

# iOS — install CocoaPods
cd ios && bundle install && bundle exec pod install && cd ..
```

---

## Development

| Script | Command | Description |
|--------|---------|-------------|
| Start Metro | `npm start` | Start the Metro bundler |
| Start (reset cache) | `npm run nps_start` | Metro with cache reset |
| Run iOS | `npm run ios` | Build & run on iOS simulator |
| Run Android | `npm run android` | Build & run on Android emulator |
| Lint | `npm run lint` | ESLint check |
| Format | `npm run format` | Prettier format all files |
| Test | `npm test` | Run Jest test suite |

---

## iOS — Pod / Cache Troubleshooting

Use these when Xcode shows errors like:
- `ReactNativeDependencies.xcframework: (l)stat: No such file or directory`
- `Command PhaseScriptExecutionFailed with a nonzero exit code`
- Hermes build failures after a React Native upgrade

| Script | Command | What it does |
|--------|---------|--------------|
| Clean Pods | `npm run ios:clean-pods` | Deintegrates pods, clears pod cache, reinstalls |
| Clean Derived Data | `npm run ios:clean-derived` | Deletes Xcode DerivedData |
| Full Nuke | `npm run ios:nuke` | Clears DerivedData **and** reinstalls pods (start here when stuck) |

> After `ios:nuke`, open `ios/TodoAppRN.xcworkspace` (not `.xcodeproj`) and rebuild.

---

## Android — Cache & Build

| Script | Command | Description |
|--------|---------|-------------|
| Clear Android cache | `npm run android-cache-clear` | Clears Android JS bundle cache |
| Clear Gradle cache | `npm run clear_local_gradle_cache` | Deletes `~/.gradle/caches/` |
| Clean build dirs | `npm run clear_build` | Removes `android/.gradle` and `android/build` |
| Gradle clean | `npm run clean_gradle` | Runs `./gradlew clean` |
| Bundle Android | `npm run bundle-android` | Creates release JS bundle for Android |
| Generate APK | `npm run generate-apk` | Bundles JS + assembles release APK |

---

## API Target Switching

| Script | Command | Target |
|--------|---------|--------|
| Local server | `npm run api:local` | `localhost` |
| iOS simulator | `npm run api:ios` | iOS-specific host |
| Android emulator | `npm run api:emu` | `10.0.2.2` |
| Remote | `npm run api:remote` | Deployed backend |

---

## Firebase Setup

```bash
npm run copy-firebase-android-files   # Copy google-services.json → android/app/
npm run copy-all--eva-files           # Copy Eva config files to root
npm run setup:firebase                # Interactive Firebase config setup
```

---

## Rebrand (Bundle ID, App Name, Icons, Splash)

Use when deploying the app under a different name or bundle ID.

1. Edit `rebrand.config.js` — set `appName`, `ios.bundleId`, `android.applicationId`
2. Place assets in `branding/` — `icon.png` (≥1024×1024, no alpha), `splash.png`, Firebase configs

| Script | Command | Description |
|--------|---------|-------------|
| Dry run | `npm run rebrand:dry` | Preview all changes — nothing written |
| Both platforms | `npm run rebrand` | Full rebrand (requires clean git tree) |
| iOS only | `npm run rebrand:ios` | iOS rebrand only |
| Android only | `npm run rebrand:android` | Android rebrand only |

Optional flags: `--skip-icons`, `--skip-splash`, `--skip-firebase`

Full reference: `scripts/README.md` | Asset requirements: `branding/README.md`

---

## Version Bumping

`package.json` is the single source of truth for the version name.

| Script | Command | Description |
|--------|---------|-------------|
| Dry run | `npm run bump:dry` | Preview version changes |
| Minor bump | `npm run bump -- --minor` | Bump minor version |
| Build number only | `npm run bump -- --build` | New build number (TestFlight / internal) |
| Patch bump | `npm run bump -- --patch` | Bump patch version |
| iOS only | `npm run bump:ios` | Bump iOS version only |
| Android only | `npm run bump:android` | Bump Android version only |

---

## Icons

| Script | Command | Description |
|--------|---------|-------------|
| Convert SVGs | `npm run convert-icons` | Convert SVGs in `src/assets/svg-broken-icons/` to TSX |
| Apply icons | `npm run apply-icons` | Apply app icons from a source directory |

Add new icons: place `.svg` in `src/assets/svg-broken-icons/`, then run `npm run convert-icons`.

Browse icons: open app → **Icons** tab.

Full guide: `docs/HOW_TO_ADD_NEW_ICONS.md`

---

## Splash Screen

```bash
node scripts/generate-splash-logo.js
```

Templates in `src/assets/images/splash/templates/`. Full guide: `docs/BOOTSPLASH_GUIDE.md`

---

## Project Structure

```
mobile/
├── android/              # Android native project
├── ios/                  # iOS native project
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Tab navigator & routing
│   ├── theme/            # Colors, ThemeContext
│   ├── localization/     # i18n (EN / FR / AR)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API & Firebase services
│   ├── context/          # React contexts
│   ├── utils/            # Helpers & utilities
│   ├── config/           # App configuration
│   └── assets/           # Images, fonts, SVGs
├── scripts/              # Automation scripts
├── branding/             # Brand assets (icons, splash)
├── docs/                 # Extended documentation
└── package.json
```

---

## Documentation

| Guide | Path |
|-------|------|
| Android native setup | `docs/ANDROID_NATIVE_SETUP.md` |
| Splash screen | `docs/BOOTSPLASH_GUIDE.md` |
| App icons | `docs/APP_ICONS_GUIDE.md` |
| Firebase Crashlytics | `docs/CRASHLYTICS_GUIDE.md` |
| SVG icon system | `docs/ICON_SYSTEM_DOCUMENTATION.md` |
| Scripts reference | `scripts/README.md` |
| Branding assets | `branding/README.md` |
