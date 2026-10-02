# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native 0.83.1 TypeScript application with Firebase backend integration. The app features localization (English, French, Arabic with RTL support), network-aware data fetching with TanStack React Query, dark/light theming, and tab-based navigation.

## Required Development Commands

### Development Workflow

- `npm start` - Start Metro bundler
- `npm run android` - Build and run Android app
- `npm run ios` - Build and run iOS app (requires pod install first)
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run format` - Format code with Prettier

### iOS Setup (First Time Only)

```bash
bundle install                  # Install CocoaPods
bundle exec pod install        # Install iOS dependencies
```

### Firebase Configuration

- `npm run copy-firebase-android-files` - Copy Firebase config to Android
- `npm run copy-all--eva-files` - Copy Eva configuration files

### Build Commands

- `npm run generate-apk` - Generate Android release APK
- `npm run bundle-android` - Create Android bundle

### Rebrand (bundle ID, app name, icons, splash, Firebase)

Full identity change — use when deploying the app under a different name or bundle ID.

**Quick start:**
1. Edit `rebrand.config.js` at the repo root — set `appName`, `ios.bundleId`, `android.applicationId`
2. Place assets in `branding/` — `icon.png` (≥1024×1024, no alpha), `splash.png`, Firebase configs
3. Preview with dry-run, then run for real:

```bash
yarn rebrand:dry      # preview all changes — nothing written
yarn rebrand          # both platforms (requires clean git tree)
yarn rebrand:ios      # iOS only
yarn rebrand:android  # Android only

# Skip optional steps
yarn rebrand --skip-icons --skip-splash --skip-firebase
```

Full reference: `scripts/README.md` | Asset requirements: `branding/README.md`

### Version bump

```bash
yarn bump:dry --minor --build   # preview
yarn bump --minor --build       # release: new version name + new build number
yarn bump --build               # build number only (TestFlight / internal rebuild)
yarn bump --patch               # version name only
yarn bump:ios / yarn bump:android  # single platform
```

`package.json` is the single source of truth for the version name. Build numbers use a unified `max(ios, android) + 1` strategy so both platforms never drift.

### Rename App Display Name (legacy)

Prefer `yarn rebrand` above. The legacy shell script is still available:

```bash
./scripts/rename-app.sh "Your New App Name"
```

### Cache Management

- `npm run android-cache-clear` - Clear Android cache
- `npm run clear_local_gradle_cache` - Clear Gradle cache

## Mandatory Code Standards

### Absolute Path Imports (CRITICAL)

**All imports MUST use absolute paths - relative imports are forbidden.** This is enforced project-wide.

Available path aliases:

```typescript
// CORRECT - Use these absolute paths
import Component from '@/components/MyComponent';
import Screen from '@screens/MyScreen';
import { useHook } from '@hooks/useCustomHook';
import Navigator from '@navigation/TabNavigator';
import { utility } from '@utils/helpers';
import theme from '@theme/colors';
import service from '@services/api';
import { Context } from '@context/AppContext';
import config from '@config/app';
import { t } from '@localization/i18n';
import image from '@assets/images/logo.png';
import lib from '@lib/external';

// FORBIDDEN - Never use relative paths
import Component from '../components/MyComponent';
import { useHook } from './hooks/useCustomHook';
```

Path configuration is in `babel.config.js` and `tsconfig.json`.

## Architecture Overview

### Core Structure

- **Navigation**: Tab-based navigation with React Navigation v7
- **State Management**: TanStack React Query with network-aware caching
- **Localization**: i18next with English, French, Arabic (RTL support)
- **Theming**: Context-based dark/light theme system
- **Backend**: Firebase Authentication and Firestore
- **Network**: NetInfo integration for offline detection

### Key Directories

```
src/
├── components/     # Reusable UI components
│   ├── common/    # Shared components (CustomText, etc.)
│   ├── examples/  # Demo/example components
│   └── icons/     # Icon components and SVG assets
├── screens/       # Screen components (HomeScreen, SettingsScreen, etc.)
├── navigation/    # TabNavigator and navigation logic
├── theme/         # Theme system (colors, ThemeContext)
├── localization/  # i18n setup and translation files
├── hooks/         # Custom React hooks
├── services/      # API services and external integrations
├── context/       # React contexts (NetworkContext, etc.)
├── utils/         # Utility functions and helpers
├── lib/           # Third-party library configurations
├── config/        # App configuration
└── assets/        # Images, icons, SVG files
```

### Configuration System (Eva)

The app uses Eva configuration files in `config/eva/`:

- `platformconfig.json` - Platform-specific settings
- `theme.json` - Theme configuration
- `localization.json` - Localization settings
- `mockdata.json` - Mock data for development

## Key Features Implementation

### Localization

- **Languages**: English (default), French, Arabic
- **RTL Support**: Automatic right-to-left layout for Arabic
- **Device Detection**: Automatically detects device language
- **Usage**: Import `useTranslation` from `react-i18next`, call `t('key')`

### Network-Aware Data Fetching

- **TanStack Query**: Configured for network-aware caching
- **Offline Support**: Queries pause when offline, resume when online
- **Configuration**: See `src/lib/queryClient.ts`
- **Retry Logic**: Exponential backoff with 3 retry attempts

### Theme System

- **Modes**: Light and dark themes
- **Context**: Use `useTheme()` hook from `@theme/index`
- **Auto-detection**: Follows system color scheme by default
- **Colors**: Defined in `src/theme/colors.ts`

### Native Splash Screen

- **Platforms**: Both iOS and Android with native implementation
- **Conversion Script**: `node convert_image_to_splash.js <image_path>`
- **Templates**: Pre-built color templates in `src/assets/images/splash/templates/`
- **Zero Dependencies**: Fully native, no JS libraries required

## Firebase Integration

The app integrates with Firebase for:

- **Authentication**: User login/registration
- **Firestore**: Database operations
- **Push Notifications**: Firebase Cloud Messaging

Configuration files:

- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

## Testing

- **Framework**: Jest with React Native preset
- **Test Files**: Place in `__tests__/` or use `.test.tsx` suffix
- **Run Tests**: `npm test`

## Performance Standards

**Before implementing any new feature, read `PERFORMANCE.md`.** It contains the full React & React Native performance reference that must be applied during development.

Key mandates from that document:

- Lists must use `FlashList` with stable `key` props (never `key={index}`)
- Animations must use Reanimated 3 (not `Animated` from RN core)
- Server data must be managed by TanStack Query, never manual `useState` + `useEffect` fetch
- All `useEffect` hooks with subscriptions/timers MUST have cleanup returns
- Use `InteractionManager.runAfterInteractions` for post-navigation heavy work
- Run the Section 12 Audit Checklist before every PR merge

## Temporarily Disabled API Calls

These endpoints are currently commented out because they are not available in the dev environment. Re-enable them when the backend is ready.

| Endpoint | File | What to change |
|---|---|---|
| `GET /api/v1/app-version` | `App.tsx` | Uncomment the `checkAppVersion()` call and its import |
| `GET /api/v1/feature-flags` | `App.tsx` | Uncomment the `configService.initialize()` call and its import |
| `GET /api/v1/me/notifications` | `src/config/notificationsSync.config.ts` | Set `AUTO_SYNC_ENABLED: true` |

## Development Notes

### Adding New Pages

When creating new page components, add a link to the page in the header as per user's global instructions.

### Font System

The app uses a custom font system. Import `getFontStyle` from `@utils/fonts` for consistent typography.

### Icon System

Icons are located in `src/components/icons/` with TypeScript definitions. Use the `Icon` component with predefined `IconName` types.

### Network Status

The app includes network status detection. Use `NetworkProvider` context for network state throughout the app.

## Platform-Specific Notes

### iOS

- Requires CocoaPods setup (`bundle exec pod install`)
- Uses LaunchScreen.storyboard for splash screen
- Splash screen hides automatically via native system

### Android

- Uses drawable resources for splash screen
- Splash screen hidden explicitly via `SplashScreen.hide()`
- Keystore files in `config/` directory for release builds

## Environment & Dependencies

- **Node.js**: >=20 (specified in package.json engines)
- **React Native**: 0.83.1
- **React**: 19.2.0
- **TypeScript**: ^5.8.3
- **Main Libraries**: Firebase, TanStack Query, React Navigation, i18next
