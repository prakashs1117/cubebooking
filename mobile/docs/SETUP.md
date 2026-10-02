# Mobile App Setup & Development Guide

**App:** Demand Management Portal (React Native)  
**Platform:** Android & iOS  
**Tech Stack:** React Native 0.85.3, TypeScript, React Navigation v7, Zustand, TanStack Query  
**Status:** In development (6/10 screens implemented)

---

## Quick Start

### Prerequisites

```bash
# Node.js >= 22.11.0
node --version

# pnpm (for monorepo)
npm install -g pnpm
pnpm --version

# For iOS (macOS only)
xcode-select --install
brew install cocoapods

# For Android (all platforms)
# Download Android Studio from: https://developer.android.com/studio
```

### First Run

```bash
# 1. Clone and install (from project root)
cd /Users/M324550/Documents/POC/DEMAND_MANAGEMENT_LATEST
pnpm install

# 2. Start Metro bundler
cd mobile
npm start

# 3. In another terminal, run on your platform
npm run android    # Android emulator
npm run ios        # iOS simulator
```

**Expected:** Metro bundler starts, emulator launches, app runs.

---

## Platform-Specific Setup

### Android

#### First Time Setup

```bash
# 1. Install Android Studio
# Download from: https://developer.android.com/studio

# 2. Create Android Virtual Device (AVD)
# In Android Studio:
# - Tools → Device Manager
# - Create Virtual Device (Pixel 6, API 34)
# - Start the emulator

# 3. Verify adb recognizes your device
adb devices
# Should show: emulator-5554  device
```

#### Run the App

```bash
cd mobile

# Terminal 1: Start Metro
npm start

# Terminal 2: Build and run
npm run android

# Expected output:
# ✓ Metro bundler started
# ✓ APK built
# ✓ App installed on device
# ✓ App launches and shows Sign In screen
```

#### Troubleshooting

**"adb not found"**

```bash
# Solution: Add Android tools to PATH
export PATH=$PATH:~/Library/Android/sdk/platform-tools
# Add this to ~/.zshrc to persist
```

**"ANDROID_HOME not set"**

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

**Emulator won't start**

```bash
# Check emulator status
emulator -list-avds

# Start emulator manually
emulator -avd Pixel_6_API_34

# If still stuck, clear cache
npm run android-cache-clear
npm run clear_local_gradle_cache
```

**App crashes on launch**

```bash
# Clear Android build
npm run clear_build

# Rebuild
npm run android
```

---

### iOS

#### First Time Setup (macOS only)

```bash
# 1. Install CocoaPods (Objective-C dependency manager)
cd mobile
bundle install           # Install Ruby gems
bundle exec pod install  # Install iOS dependencies

# This creates Pods/ directory and links native dependencies
```

#### Run the App

```bash
cd mobile

# Terminal 1: Start Metro
npm start

# Terminal 2: Build and run
npm run ios

# Expected output:
# ✓ Metro bundler started
# ✓ Xcode build succeeds
# ✓ iOS simulator opens
# ✓ App launches and shows Sign In screen
```

#### Troubleshooting

**"pod install failed"**

```bash
# Solution: Update CocoaPods
sudo gem install cocoapods
cd mobile
bundle update
bundle exec pod install
```

**"Xcode build failed"**

```bash
# Clear build cache and rebuild
cd ios
xcodebuild clean -workspace Demand.xcworkspace -scheme Demand
cd ..
npm run ios
```

**"iPhone simulator won't launch"**

```bash
# List available simulators
xcrun simctl list devices

# Launch specific simulator
xcrun simctl boot "iPhone 15"  # Device name from list above

# Then try npm run ios again
```

**App shows blank screen**

```bash
# Metro connection issue, restart
npm start -- --reset-cache
```

---

## Metro Bundler

### What is it?

Metro is React Native's bundler — like Webpack for web apps. It combines all your JS/TS files into a bundle for the emulator/device.

### Starting Metro

```bash
cd mobile
npm start

# Options:
npm start -- --reset-cache      # Fresh bundle (clears cache)
npm start -- --only android     # Only Android
npm start -- --only ios         # Only iOS
npm start -- --max-workers 1    # Single thread (slower, more stable)
```

### Metro Console Commands

Once Metro is running, press:

```
i   - Open iOS
a   - Open Android
r   - Reload
d   - Open debugger
j   - Open debugger in Flipper
c   - Clear console
q   - Quit
```

### Common Metro Issues

**"Metro bundler taking too long"**

```bash
# Use single worker for stability
npm start -- --max-workers 1
```

**"ENOSPC: System limit for number of open files exceeded"**

```bash
# Increase file watch limit (macOS)
launchctl limit maxfiles 200000 200000
npm start -- --reset-cache
```

---

## Running on Physical Device

### Android

```bash
# 1. Enable USB debugging on device
# Settings → Developer Options → USB Debugging (ON)

# 2. Connect device via USB

# 3. Verify adb sees it
adb devices
# Should show: ABC123DEF456  device

# 4. Run app
npm run android
```

### iOS

```bash
# 1. Connect iPhone via USB

# 2. Open Xcode
open ios/Demand.xcworkspace

# 3. Select your device from top menu
# 4. Click Play button to build and run

# Or command line:
npm run ios -- --device "My iPhone"
```

---

## Development Workflow

### Edit Code → See Changes

**Hot Reload:** Changes to JS/TS files reload automatically

```bash
# 1. Edit a screen file
vi mobile/src/screens/demand/dashboard/DashboardScreen.tsx

# 2. Save file

# 3. Metro detects change and reloads app automatically
# You should see update in 2-3 seconds
```

**Full Reload:** If hot reload doesn't work

```bash
# Press 'r' in Metro terminal
# Or: Press Cmd+R (iOS) / Cmd+M → Reload (Android)
```

### Debug Logging

```typescript
// Mobile app code
import { Alert } from 'react-native';

// Log to console
console.log('Debug info:', variable);

// Show popup (testing only)
Alert.alert('Debug', JSON.stringify(variable));

// Metro terminal shows:
// LOG Running "Demand" with {"rootTag":1,"initialProps":{}}
// LOG Debug info: ...
```

### Inspect Element (Flipper)

```bash
# 1. Download Flipper Desktop
# https://fbflipper.com/

# 2. Open Flipper
# 3. App should appear automatically when running
# 4. Use Logs tab to see console output
# 5. Use Network tab to see API calls
```

---

## Building for Release

### Android APK

```bash
cd mobile

# 1. Generate release APK
npm run generate-apk

# 2. APK will be at:
# android/app/build/outputs/apk/release/app-release.apk

# 3. Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# 4. Or use Android Studio to distribute to Play Store
```

### iOS App

```bash
cd mobile

# 1. Archive
npm run ios -- --mode Release

# 2. Or use Xcode
open ios/Demand.xcworkspace
# → Product → Archive
# → Distribute App
```

---

## Environment Configuration

### API Endpoint

The app connects to a backend API. Configure the URL:

```typescript
// mobile/src/services/api/client.ts
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

**Local development:**

```bash
# Backend runs at http://localhost:3000
# App connects automatically
```

**Remote server:**

```bash
# Set environment variable
export REACT_APP_API_URL=https://api.example.com/api

# Or edit client.ts directly
const BASE_URL = 'https://api.example.com/api';

# Rebuild and restart
npm start -- --reset-cache
```

### Debugging Network Calls

```typescript
// mobile/src/services/api/client.ts
// Add request/response logging

this.client.interceptors.request.use(config => {
  console.log('API Request:', config.url);
  return config;
});

this.client.interceptors.response.use(
  response => {
    console.log('API Response:', response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.message);
    throw error;
  },
);
```

---

## Current Implementation Status

### ✅ Implemented (6 Screens)

1. **SignInScreen** — Login with email/password
2. **ForgotPasswordScreen** — Password reset flow
3. **DashboardScreen** — Home with KPI metrics
4. **MyRequestsScreen** — User's submissions
5. **SubmissionDetailScreen** — View submission + chat
6. **AllSubmissionsScreen** — All submissions with filters

### ⏳ Stub/TODO (6 Screens)

7. **ReviewQueueScreen** — Approval workflow
8. **WizardScreen** — 9-step new request form
9. **WizardReviewScreen** — Review before submit
10. **NotificationsScreen** — Notification list
11. **UsersScreen** — User management (admin)
12. **ProfileScreen** — User profile + logout

### App Flow

```
SignInScreen
    ↓ (login success)
RootNavigator shows: AppNavigator
    ↓
BottomTabNavigator (5 tabs)
├── Dashboard Tab → DashboardScreen
├── My Requests Tab → MyRequestsScreen → SubmissionDetailScreen
├── New Request Tab → WizardScreen (TODO)
├── Notifications Tab → NotificationsScreen (TODO)
└── More Tab → MoreStack (role-gated)
    ├── All Submissions → AllSubmissionsScreen
    ├── Review Queue → ReviewQueueScreen (TODO)
    ├── Users → UsersScreen (TODO)
    └── Profile → ProfileScreen (TODO)
```

---

## Testing

### Manual Testing Checklist

```
Navigation:
- [ ] App launches on sign in screen
- [ ] Can navigate between 5 tabs
- [ ] Role-gated screens visible only for correct roles
- [ ] Back navigation works

Authentication:
- [ ] Can sign in with valid credentials
- [ ] Invalid credentials show error
- [ ] Forgot password flow works
- [ ] Token persists after restart (AsyncStorage)

Dashboard:
- [ ] KPI cards show correct counts
- [ ] Recent submissions list displays
- [ ] Pull-to-refresh works
- [ ] Navigation to detail screen works

Submissions:
- [ ] Can filter by status
- [ ] Can filter by priority
- [ ] Can search by title or reference
- [ ] Details screen shows all fields
- [ ] Chat thread displays messages
- [ ] Can send new message

Performance:
- [ ] Scrolling is smooth (60fps)
- [ ] No memory leaks (use Flipper)
- [ ] Network requests complete in <2s
- [ ] Pull-to-refresh responds quickly
```

### Unit Tests

```bash
# Run Jest tests
npm test

# Run specific test
npm test -- DashboardScreen.test.tsx

# Watch mode
npm test -- --watch
```

### E2E Tests (TBD)

Currently no E2E tests configured. To add:

```bash
# Consider: Detox (E2E testing library for React Native)
npm install --save-dev detox-cli detox
```

---

## Performance

### Key Standards (from mobile/CLAUDE.md)

**Must use FlashList for 50+ item lists** (not FlatList):

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <Item {...item} />}
  keyExtractor={item => item.id} // Stable key, never use index!
  estimatedItemSize={80}
/>;
```

**Use Reanimated 3 for animations** (not RN Animated):

```typescript
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';

<Animated.View entering={FadeIn}>
  <Text>Animates in</Text>
</Animated.View>;
```

**TanStack Query for server state** (not useState + useEffect):

```typescript
const { data: submissions } = useQuery({
  queryKey: ['submissions'],
  queryFn: () => submissionService.getAll(),
});
```

**Cleanup subscriptions in useEffect:**

```typescript
useEffect(() => {
  const subscription = eventEmitter.subscribe(...);
  return () => subscription.unsubscribe();  // Cleanup!
}, []);
```

---

## Debugging

### React DevTools

```bash
# 1. Install React DevTools
npm install -g react-devtools

# 2. In separate terminal
react-devtools

# 3. App should connect automatically
```

### Flipper

```bash
# 1. Download Flipper Desktop
# https://fbflipper.com/

# 2. Open Flipper
# 3. Tabs: Logs, Network, Database, etc.
```

### Console Logs

```bash
# View logs from Metro terminal
npm start

# Or use Flipper Logs tab
# Or install react-native-console
```

### Breakpoint Debugging

```typescript
// Add debugger statement
async function handleSubmit() {
  debugger; // Execution pauses here
  await submitForm();
}

// In Metro terminal, press 'd' to open debugger
// Then open Chrome DevTools to inspect
```

---

## Troubleshooting Common Issues

### App won't start

```bash
# 1. Clear Metro cache
npm start -- --reset-cache

# 2. Rebuild
npm run android      # or: npm run ios

# 3. If still stuck, wipe everything
rm -rf node_modules
pnpm install
npm start -- --reset-cache
```

### "Module not found: @demand/shared"

```bash
# Solution: Reinstall workspace
cd ..
pnpm install
cd mobile
npm start -- --reset-cache
```

### "Cannot find module @/screens"

```bash
# Check path alias in tsconfig.json and babel.config.js
# Restart Metro
npm start -- --reset-cache
```

### "Network request timeout"

```typescript
// Increase timeout in mobile/src/services/api/client.ts
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds instead of 10
});
```

### "Emulator is very slow"

```bash
# Use host GPU acceleration
emulator -avd Pixel_6_API_34 -gpu host

# Or reduce graphics:
emulator -avd Pixel_6_API_34 -gpu angle
```

### "Pod install fails"

```bash
# Update CocoaPods
sudo gem install cocoapods

# Clear old pods
cd ios
rm -rf Pods Podfile.lock
cd ..

# Reinstall
bundle exec pod install
```

---

## Next Steps

### To Add New Screen

1. Create screen file in `mobile/src/screens/demand/[feature]/ScreenName.tsx`
2. Add to navigation stack in `mobile/src/navigation/demand/`
3. Import shared types/services from `@demand/shared`
4. Use TanStack Query for data fetching
5. Use Zustand store for state management

See: `/mobile/DEVELOPMENT.md` for detailed screen development guide.

### To Complete Remaining Screens

Refer to design spec for screen details:
`/docs/superpowers/specs/2026-05-17-monorepo-shared-layer-and-mobile-app-design.md#screen-inventory`

---

## References

- **App Architecture:** `/MONOREPO.md`
- **Shared Package Usage:** `/packages/shared/README.md`
- **Web App Setup:** `/CLAUDE.md`
- **Development Guide:** `/mobile/DEVELOPMENT.md` (TBD)
- **Mobile CLAUDE.md:** `/mobile/CLAUDE.md` (code standards, path aliases)
