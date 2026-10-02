# Feature Flags Migration - JSON-Based System

## ✅ Migration Complete!

All feature flags now use **`featureFlagsConfig.json`** as the single source of truth. The old TypeScript-based system has been removed.

## What Changed

### Before (Old System)

```typescript
// src/config/featureFlags.ts (DEPRECATED)
export const FEATURE_FLAGS = {
  ENABLE_NEW_TODO_UI: {
    enabled: __DEV__,
    // Static TypeScript configuration
  },
};

// In components:
import { getFeatureFlagValue } from '@config/featureFlags';
const isEnabled = getFeatureFlagValue('ENABLE_NEW_TODO_UI');
```

### After (New JSON System)

```json
// src/config/featureFlagsConfig.json (ACTIVE)
{
  "featureFlags": {
    "experimental": {
      "ENABLE_NEW_TODO_UI": {
        "enabled": false,
        "description": "Enhanced todo interface",
        "rolloutPercentage": 0,
        "environments": ["development"]
      }
    }
  }
}
```

```typescript
// In components:
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

const isEnabled = useFeatureFlagsStore(state =>
  state.isFeatureEnabled('ENABLE_NEW_TODO_UI'),
);
```

## Data Flow

```
┌──────────────────────────────────────┐
│   featureFlagsConfig.json            │
│   (Single Source of Truth)           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Zustand Store                      │
│   - Loads JSON on startup            │
│   - Persists to AsyncStorage         │
│   - Handles overrides                │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   React Components                   │
│   - useFeatureFlagsStore hook        │
│   - Always reads from store          │
└──────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Remote API (Future)                │
│   - Fetch updated JSON               │
│   - Store updates automatically      │
└──────────────────────────────────────┘
```

## Files Updated

### ✅ Converted to JSON System

1. **`src/navigation/TabNavigator.tsx`**

   - Changed from: `getFeatureFlagValue()`
   - Changed to: `useFeatureFlagsStore((state) => state.isFeatureEnabled())`
   - Flags: `ENABLE_DRAWER_NAVIGATION`, `ENABLE_TAB_NAVIGATION`

2. **`src/screens/HomeScreen.tsx`**

   - Changed from: `getFeatureFlagValue()`
   - Changed to: `useFeatureFlagsStore((state) => state.isFeatureEnabled())`
   - Flag: `ENABLE_HOME_CAROUSEL`

3. **`src/navigation/EventsStackNavigator.tsx`**

   - Changed from: `getFeatureFlagValue()`
   - Changed to: `useFeatureFlagsStore((state) => state.isFeatureEnabled())`
   - Flag: `ENABLE_DRAWER_NAVIGATION`

4. **`src/navigation/RootNavigator.tsx`**

   - Changed from: `getFeatureFlagValue()`
   - Changed to: `useFeatureFlagsStore((state) => state.isFeatureEnabled())`
   - Flag: `ENABLE_DRAWER_NAVIGATION`

5. **`src/hooks/useFeatureFlag.ts`**
   - Fixed infinite loop with `useMemo`
   - All hooks now use Zustand store

### 📦 Archived

- **`src/config/featureFlags.ts`** → **`featureFlags.ts.backup`**
  - Old TypeScript-based system
  - Kept as backup but no longer imported anywhere

## How to Use Feature Flags

### 1. In React Components (Recommended)

```typescript
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

const MyComponent = () => {
  const isEnabled = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_NEW_TODO_UI'),
  );

  return isEnabled ? <NewUI /> : <OldUI />;
};
```

### 2. With Custom Hooks

```typescript
import { useFeatureFlag } from '@hooks/useFeatureFlag';

const MyComponent = () => {
  const isEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');

  return isEnabled ? <NewUI /> : <OldUI />;
};
```

### 3. Multiple Flags

```typescript
import { useFeatureFlags } from '@hooks/useFeatureFlag';

const MyComponent = () => {
  const flags = useFeatureFlags(['ENABLE_NEW_TODO_UI', 'ENABLE_DARK_MODE']);

  return (
    <View>
      {flags.ENABLE_NEW_TODO_UI && <NewUI />}
      {flags.ENABLE_DARK_MODE && <DarkToggle />}
    </View>
  );
};
```

### 4. Outside React Components

```typescript
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

// Non-reactive check
const isEnabled = useFeatureFlagsStore.getState().isFeatureEnabled('FLAG_NAME');
```

## How to Modify Flags

### Option 1: Update JSON File (Development)

Edit `src/config/featureFlagsConfig.json`:

```json
{
  "featureFlags": {
    "ui": {
      "ENABLE_DARK_MODE": {
        "enabled": true, // ← Change this
        "description": "Toggle between dark and light themes",
        "rolloutPercentage": 100,
        "environments": ["development", "staging", "production"]
      }
    }
  }
}
```

**Restart the app** to see changes.

### Option 2: Use Settings Screen (Runtime)

1. Navigate to **Settings** → **Features** tab
2. Toggle any flag
3. Changes persist in AsyncStorage
4. Works immediately, no restart needed

### Option 3: API Integration (Production)

```typescript
import { configService } from '@services/configService';

// Fetch remote flags from your API
await configService.fetchRemoteFeatureFlags();

// The Zustand store automatically updates
// All components re-render with new values
```

## API Integration (Future-Ready)

The system is ready for API integration:

```typescript
// Your API endpoint returns:
{
  "featureFlags": {
    "ui": {
      "ENABLE_DARK_MODE": {
        "enabled": true,
        "description": "...",
        "rolloutPercentage": 100,
        "environments": ["production"]
      }
    }
  }
}

// ConfigService will:
1. Fetch from API
2. Cache in AsyncStorage
3. Update Zustand store
4. All components re-render automatically
```

### Setup API Endpoint

1. **Configure API URL** in `src/config/appConfig.json`:

```json
{
  "api": {
    "baseUrl": "https://your-api.com",
    "featureFlagsEndpoint": "/api/feature-flags"
  }
}
```

2. **API Response Format**:

Your API should return the same structure as `featureFlagsConfig.json`:

```json
{
  "featureFlags": {
    "ui": { ... },
    "features": { ... },
    "social": { ... },
    "analytics": { ... },
    "experimental": { ... },
    "debug": { ... }
  }
}
```

3. **Automatic Loading**:

The app already calls `configService.initialize()` on startup, which:

- Loads cached flags from AsyncStorage
- Fetches fresh flags from API in background
- Updates store when new flags arrive

## Benefits of JSON-Based System

### ✅ For Development

- **Single Source**: All flags in one JSON file
- **Easy to Edit**: No code changes needed
- **Version Control**: JSON changes tracked in git
- **Type Safe**: TypeScript types generated from JSON

### ✅ For Production

- **API Ready**: Fetch flags from your backend
- **Real-time Updates**: Change flags without app updates
- **A/B Testing**: Control rollout percentages
- **Environment-Specific**: Different flags per environment

### ✅ For Users

- **Persistence**: Settings saved across sessions
- **User Control**: UI flags customizable in Settings
- **No Rebuilds**: Changes apply immediately

### ✅ For Admins

- **Full Control**: Manage all flags from Settings
- **Override Testing**: Test any combination
- **Bulk Actions**: Clear all overrides at once

## Testing

### Test JSON Changes

1. **Edit JSON file**:

```bash
# Edit src/config/featureFlagsConfig.json
code src/config/featureFlagsConfig.json
```

2. **Restart app**:

```bash
npm start -- --reset-cache
npm run android
```

3. **Verify in Settings**:

- Go to Settings → Features tab
- See your JSON changes reflected

### Test Runtime Changes

1. **Open Settings** → **Features** tab
2. **Toggle any flag**
3. **See immediate effect**
4. **Restart app** → Changes persist ✅

### Test API Integration

```typescript
// In App.tsx or any component
import { configService } from '@services/configService';

useEffect(() => {
  // Fetch from API
  configService
    .fetchRemoteFeatureFlags()
    .then(() => console.log('Flags updated from API'))
    .catch(err => console.error('API fetch failed', err));
}, []);
```

## Migration Checklist

- ✅ All components use Zustand store
- ✅ No imports from old `featureFlags.ts`
- ✅ Old file backed up to `featureFlags.ts.backup`
- ✅ JSON loads on app startup
- ✅ AsyncStorage persistence works
- ✅ Settings screen integration works
- ✅ API integration ready
- ✅ Fixed infinite loop in `useFeatureFlags`
- ✅ ESLint warnings resolved

## Troubleshooting

### Q: Changes in JSON not showing?

**A**: Restart Metro bundler with cache reset:

```bash
npm start -- --reset-cache
```

### Q: Old flags still appearing?

**A**: Clear AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### Q: Runtime toggles not working?

**A**: Check you're using the Zustand store, not the old imports:

```typescript
// ✅ Correct
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

// ❌ Wrong (old system)
import { getFeatureFlagValue } from '@config/featureFlags';
```

### Q: API not updating flags?

**A**: Verify API endpoint in `appConfig.json` and check response format matches JSON structure.

## Summary

🎉 **Success!** Your app now uses a **fully JSON-based feature flag system** that:

✅ Reads from `featureFlagsConfig.json`
✅ Stores in Zustand with AsyncStorage persistence
✅ Updates in real-time via Settings screen
✅ Ready for API integration
✅ No code changes needed to modify flags

**To enable/disable features:**

1. Edit `src/config/featureFlagsConfig.json`
2. Or use Settings → Features tab
3. Or fetch from your API

All components automatically react to changes! 🚀
