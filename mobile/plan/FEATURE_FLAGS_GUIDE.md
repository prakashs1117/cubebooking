# Feature Flags System Guide

Complete guide to using the feature flags system in this React Native application.

## Overview

The feature flags system uses **Zustand** for state management with **AsyncStorage** persistence, allowing you to:

- ✅ Control feature rollouts
- ✅ A/B test features
- ✅ Toggle features without code changes
- ✅ Environment-specific configurations
- ✅ Development overrides
- ✅ Remote configuration updates

## Architecture

```
┌─────────────────────────────────────────────┐
│   featureFlagsConfig.json (Source of Truth) │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Zustand Store (featureFlagsStore.ts)      │
│   - State management                         │
│   - AsyncStorage persistence                 │
│   - Override support                         │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   React Hooks (useFeatureFlag.ts)           │
│   - useFeatureFlag                           │
│   - useFeatureFlags                          │
│   - useFeatureFlagToggle                     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   Components                                 │
│   - FeatureFlag                              │
│   - FeatureFlagGate                          │
│   - ConditionalFeature                       │
└──────────────────────────────────────────────┘
```

## Configuration

### featureFlagsConfig.json

All feature flags are defined in `src/config/featureFlagsConfig.json`:

```json
{
  "featureFlags": {
    "ui": {
      "ENABLE_HOME_CAROUSEL": {
        "enabled": true,
        "description": "Show image carousel on home screen",
        "rolloutPercentage": 100,
        "environments": ["development", "staging", "production"]
      }
    },
    "features": { ... },
    "social": { ... },
    "analytics": { ... },
    "experimental": { ... },
    "debug": { ... }
  }
}
```

### Categories

Feature flags are organized into categories:

- **ui** - UI/UX features
- **features** - Core functionality
- **social** - Social integrations
- **analytics** - Analytics and tracking
- **experimental** - Experimental features
- **debug** - Development and debugging

## Usage

### 1. Basic Hook Usage

```tsx
import { useFeatureFlag } from '@hooks/useFeatureFlag';

const MyComponent = () => {
  const isNewUIEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');

  return <View>{isNewUIEnabled ? <NewTodoUI /> : <OldTodoUI />}</View>;
};
```

### 2. Component-Based Approach

```tsx
import { FeatureFlag } from '@components/common/FeatureFlag';

const MyComponent = () => (
  <FeatureFlag flag="ENABLE_NEW_TODO_UI" fallback={<OldTodoUI />}>
    <NewTodoUI />
  </FeatureFlag>
);
```

### 3. Multiple Flags

```tsx
import { useFeatureFlags } from '@hooks/useFeatureFlag';

const MyComponent = () => {
  const flags = useFeatureFlags([
    'ENABLE_NEW_TODO_UI',
    'ENABLE_DARK_MODE',
    'ENABLE_PREMIUM_FEATURES',
  ]);

  return (
    <View>
      {flags.ENABLE_NEW_TODO_UI && <NewTodoUI />}
      {flags.ENABLE_DARK_MODE && <DarkModeToggle />}
      {flags.ENABLE_PREMIUM_FEATURES && <PremiumFeatures />}
    </View>
  );
};
```

### 4. Feature Flag Gate (AND/OR Logic)

```tsx
import { FeatureFlagGate } from '@components/common/FeatureFlag';

const MyComponent = () => (
  <FeatureFlagGate
    flags={['ENABLE_PREMIUM_FEATURES', 'ENABLE_EXPORT_FEATURES']}
    operator="AND"
    fallback={<UpgradePrompt />}
  >
    <PremiumExportFeature />
  </FeatureFlagGate>
);
```

### 5. Conditional Features

```tsx
import { ConditionalFeature } from '@components/common/FeatureFlag';

const MyComponent = () => (
  <ConditionalFeature
    flag="ENABLE_DARK_MODE"
    whenEnabled={<DarkModeToggle />}
    whenDisabled={<Text>Dark mode coming soon!</Text>}
  />
);
```

### 6. Development Toggle (Dev Mode Only)

```tsx
import { useFeatureFlagToggle } from '@hooks/useFeatureFlag';

const DevPanel = () => {
  const { isEnabled, toggle, setOverride, clearOverride } =
    useFeatureFlagToggle('ENABLE_NEW_TODO_UI');

  return (
    <View>
      <Text>New UI: {isEnabled ? 'ON' : 'OFF'}</Text>
      <Button title="Toggle" onPress={toggle} />
      <Button title="Force Enable" onPress={() => setOverride(true)} />
      <Button title="Clear Override" onPress={clearOverride} />
    </View>
  );
};
```

### 7. Higher-Order Component

```tsx
import { withFeatureFlag } from '@components/common/FeatureFlag';

const NewTodoList = () => <View>{/* New UI */}</View>;
const OldTodoList = () => <View>{/* Old UI */}</View>;

const TodoList = withFeatureFlag(
  'ENABLE_NEW_TODO_UI',
  OldTodoList,
)(NewTodoList);

export default TodoList;
```

### 8. By Category

```tsx
import { useFeatureFlagsByCategory } from '@hooks/useFeatureFlag';

const UISettings = () => {
  const uiFlags = useFeatureFlagsByCategory('ui');

  return (
    <View>
      {Object.entries(uiFlags).map(([key, flag]) => (
        <Text key={key}>
          {key}: {flag.description}
        </Text>
      ))}
    </View>
  );
};
```

## Store Actions

### Direct Store Access

```tsx
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

const Component = () => {
  // Get state
  const isEnabled = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_NEW_TODO_UI'),
  );

  // Get action
  const toggleFlag = useFeatureFlagsStore(state => state.toggleFeatureFlag);

  return (
    <Button title="Toggle" onPress={() => toggleFlag('ENABLE_NEW_TODO_UI')} />
  );
};
```

### Using Actions Hook

```tsx
import { useFeatureFlagActions } from '@hooks/useFeatureFlag';

const AdminPanel = () => {
  const { resetToDefaults, clearAllOverrides, updateFromRemote } =
    useFeatureFlagActions();

  return (
    <View>
      <Button title="Reset All" onPress={resetToDefaults} />
      <Button title="Clear Overrides" onPress={clearAllOverrides} />
    </View>
  );
};
```

## Remote Configuration

The system supports fetching feature flags from a remote API:

```tsx
import { configService } from '@services/configService';

// Fetch remote flags
await configService.fetchRemoteFeatureFlags();

// The store will automatically update
```

The remote flags are:

- Cached in AsyncStorage
- Automatically loaded on app start
- Merged with local configuration
- Updated in the Zustand store

## Development Tools

### Feature Flags Management Screen

Navigate to the **Feature Flags Management Screen** (available in dev mode) to:

- View all feature flags by category
- Toggle flags in real-time
- See which flags have overrides
- Clear individual or all overrides
- Reset to default configuration

### Logging

```tsx
import { logAllFeatureFlags } from '@stores/featureFlagsStore';

// Log all feature flags to console (dev mode only)
logAllFeatureFlags();
```

Output:

```
🚩 Feature Flags Status
  ENABLE_NEW_TODO_UI: ✅ (overridden) - Enhanced todo interface
  ENABLE_DARK_MODE: ✅ - Toggle between dark and light themes
  ENABLE_OFFLINE_SYNC: ❌ - Background synchronization
  ...
```

## Adding New Feature Flags

### 1. Add to Configuration

Edit `src/config/featureFlagsConfig.json`:

```json
{
  "featureFlags": {
    "features": {
      "ENABLE_MY_NEW_FEATURE": {
        "enabled": false,
        "description": "Description of the new feature",
        "rolloutPercentage": 0,
        "environments": ["development"],
        "config": {
          "someOption": true,
          "anotherOption": "value"
        }
      }
    }
  }
}
```

### 2. Use in Components

```tsx
const MyComponent = () => {
  const isEnabled = useFeatureFlag('ENABLE_MY_NEW_FEATURE');

  if (!isEnabled) return null;

  return <NewFeature />;
};
```

### 3. Test in Development

Use the Feature Flags Management Screen or toggle directly:

```tsx
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

// Toggle for testing
useFeatureFlagsStore
  .getState()
  .setFeatureFlagOverride('ENABLE_MY_NEW_FEATURE', true);
```

## Environment-Based Behavior

Feature flags respect the environment configuration:

```json
{
  "enabled": true,
  "environments": ["development", "staging"]
}
```

- If current environment not in the list, flag returns `false`
- Use `["development", "staging", "production"]` for all environments

## Rollout Percentage

Control gradual rollout:

```json
{
  "enabled": true,
  "rolloutPercentage": 50
}
```

- `0` = Disabled for all users
- `50` = Enabled for ~50% of users (random)
- `100` = Enabled for all users

> **Note**: Current implementation uses random rollout. In production, you may want to use deterministic rollout based on user ID.

## Feature Flag Configuration

Some flags support additional configuration:

```json
{
  "ENABLE_ONBOARDING": {
    "enabled": true,
    "config": {
      "showOnFirstLaunchOnly": true,
      "skipEnabled": true,
      "autoPlayEnabled": false
    }
  }
}
```

Access in code:

```tsx
const flag = useFeatureFlagMetadata('ENABLE_ONBOARDING');
const config = flag?.config;

if (config?.skipEnabled) {
  // Show skip button
}
```

## Best Practices

### 1. Naming Conventions

- Use `ENABLE_*` for feature toggles
- Use `SHOW_*` for UI element visibility
- Use descriptive UPPER_SNAKE_CASE names

### 2. Default Values

- New features should default to `false`
- Only enable in `development` initially
- Gradually expand to `staging` then `production`

### 3. Cleanup

- Remove feature flags once features are stable
- Don't accumulate old flags
- Document why a flag exists

### 4. Testing

- Test both enabled and disabled states
- Use overrides for testing
- Clear overrides after testing

### 5. Documentation

- Provide clear descriptions
- Document any configuration options
- Note dependencies between flags

## Persistence

The Zustand store automatically persists to AsyncStorage:

```typescript
{
  name: 'feature-flags-storage',
  storage: AsyncStorage
}
```

What's persisted:

- ✅ Feature flag configuration
- ✅ User overrides
- ✅ Last update timestamp

What's not persisted:

- ❌ Computed values
- ❌ Remote fetch state

## TypeScript Support

Full TypeScript support with type safety:

```typescript
import {
  FeatureFlagKey,
  FeatureFlagCategory,
  FeatureFlag,
} from '@stores/featureFlagsStore';

const key: FeatureFlagKey = 'ENABLE_NEW_TODO_UI';
const category: FeatureFlagCategory = 'ui';
```

## Troubleshooting

### Flag not working

1. Check if flag exists in `featureFlagsConfig.json`
2. Verify environment matches flag's `environments` array
3. Check rollout percentage
4. Look for overrides in dev mode

### Store not persisting

1. Check AsyncStorage permissions
2. Verify store initialization
3. Check for storage quota issues

### Remote config not updating

1. Verify API endpoint configuration
2. Check network connectivity
3. Review cache duration settings
4. Check console for fetch errors

## Examples

See the following files for comprehensive examples:

- `src/screens/FeatureFlagsScreen.tsx` - Basic examples
- `src/screens/FeatureFlagsManagementScreen.tsx` - Management UI
- `src/components/examples/FeatureFlagExamples.tsx` - Usage patterns
- `src/components/common/FeatureFlag.tsx` - Component implementations

## Summary

The feature flags system provides a robust, type-safe way to control feature rollouts with:

- 🎯 Zustand state management
- 💾 AsyncStorage persistence
- 🔄 Remote configuration support
- 🧪 Development overrides
- 📱 React Native optimized
- 📊 Category organization
- 🎨 Environment-specific behavior
- 🔒 TypeScript type safety

Use feature flags to ship code confidently and enable features when ready!
