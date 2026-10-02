# Feature Flags Documentation

## Overview

Feature flags provide a mechanism to enable or disable features in the application without changing code. This allows for controlled feature rollouts, A/B testing, environment-specific configurations, and safe deployment of new features.

## Architecture

Feature flags are centrally managed in `src/config/featureFlags.ts` and can be accessed throughout the application using the provided utility functions.

### Key Components

- **Feature Flag Registry**: Central configuration of all available flags
- **Environment Overrides**: Environment-specific flag configurations
- **Utility Functions**: Helper functions to check flag status
- **Type Safety**: TypeScript types for compile-time validation

## Available Feature Flags

### Navigation Flags

#### `ENABLE_DRAWER_NAVIGATION`

- **Description**: Enable/disable drawer navigation menu (hamburger menu)
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: true`
- **Impact**:
  - When enabled: Shows drawer menu with hamburger icon in header
  - When disabled: Uses tab navigation only, no drawer access

#### `ENABLE_TAB_NAVIGATION`

- **Description**: Enable/disable bottom tab navigation bar
- **Default**: `true`
- **Environment**: `all`
- **Current Status**: `enabled: true`
- **Impact**:
  - When enabled: Shows bottom tab bar with navigation items
  - When disabled: Hides bottom tab bar completely

#### `ENABLE_FEATURE_FLAGS_SCREEN`

- **Description**: Show feature flags screen in drawer navigation
- **Default**: `true`
- **Environment**: `development`
- **Current Status**: `enabled: __DEV__` (development only)
- **Impact**: Controls visibility of Feature Flags screen in drawer menu

#### `ENABLE_ABOUT_SCREEN`

- **Description**: Show about screen in drawer navigation
- **Default**: `true`
- **Environment**: `all`
- **Current Status**: `enabled: true`
- **Impact**: Controls visibility of About screen in drawer menu

### UI Features

#### `ENABLE_NEW_TODO_UI`

- **Description**: Enhanced todo interface with animations and improved UX
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: __DEV__` (development only)
- **Impact**: Switches between old and new todo UI implementations

#### `ENABLE_DARK_MODE`

- **Description**: Toggle between dark and light themes
- **Default**: `true`
- **Environment**: `all`
- **Current Status**: `enabled: true`
- **Impact**: Already implemented, controls theme switching capability

### Data & Sync Features

#### `ENABLE_OFFLINE_SYNC`

- **Description**: Background synchronization when connection is restored
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: __DEV__` (testing in development)
- **Impact**: Enables offline data synchronization

#### `ENABLE_REAL_TIME_UPDATES`

- **Description**: Live updates using WebSockets or Server-Sent Events
- **Default**: `false`
- **Environment**: `development`
- **Current Status**: `enabled: false` (not implemented)
- **Impact**: Future feature for real-time data updates

### Analytics & Monitoring

#### `ENABLE_ANALYTICS`

- **Description**: User behavior analytics and crash reporting
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: !__DEV__` (production only)
- **Impact**: Controls analytics tracking and crash reporting

#### `ENABLE_PERFORMANCE_MONITORING`

- **Description**: Monitor app performance and render times
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: __DEV__` (development only)
- **Impact**: Enables performance profiling and monitoring

### Premium Features

#### `ENABLE_PREMIUM_FEATURES`

- **Description**: Advanced todo management, categories, and collaboration
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: false`
- **Impact**: Gates premium functionality

#### `ENABLE_EXPORT_FEATURES`

- **Description**: Export todos to PDF, CSV, or other formats
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: false`
- **Impact**: Future feature for data export

### Network & API Features

#### `ENABLE_API_V2`

- **Description**: Use new API endpoints with improved performance
- **Default**: `false`
- **Environment**: `development`
- **Current Status**: `enabled: false`
- **Impact**: Switches between API v1 and v2

#### `ENABLE_PUSH_NOTIFICATIONS`

- **Description**: Send push notifications for reminders and updates
- **Default**: `false`
- **Environment**: `all`
- **Current Status**: `enabled: false`
- **Impact**: Not implemented yet

### Debug & Development

#### `SHOW_DEBUG_INFO`

- **Description**: Show debug information in the UI
- **Default**: `false`
- **Environment**: `development`
- **Current Status**: `enabled: __DEV__`
- **Impact**: Displays debug panels and information

#### `ENABLE_FLIPPER_INTEGRATION`

- **Description**: Enable Flipper debugging tools
- **Default**: `false`
- **Environment**: `development`
- **Current Status**: `enabled: __DEV__`
- **Impact**: Enables Flipper integration for debugging

## Usage

### Checking Feature Flags

```typescript
import { getFeatureFlagValue } from '@config/featureFlags';

// Check if a feature is enabled
const isDrawerEnabled = getFeatureFlagValue('ENABLE_DRAWER_NAVIGATION');

if (isDrawerEnabled) {
  // Show drawer navigation
} else {
  // Use alternative navigation
}
```

### Getting All Active Flags

```typescript
import { getAllActiveFeatureFlags } from '@config/featureFlags';

const activeFlags = getAllActiveFeatureFlags();
console.log(activeFlags);
// Output: { ENABLE_DARK_MODE: true, ENABLE_NEW_TODO_UI: false, ... }
```

### Getting Flag Metadata

```typescript
import { getFeatureFlagMetadata } from '@config/featureFlags';

const metadata = getFeatureFlagMetadata('ENABLE_DARK_MODE');
console.log(metadata);
// Output: { key: 'ENABLE_DARK_MODE', name: 'Dark Mode', description: '...', ... }
```

### Debug Logging (Development Only)

```typescript
import { logAllFeatureFlags } from '@config/featureFlags';

// Logs all feature flags with status
logAllFeatureFlags();
```

## Adding New Feature Flags

### Step 1: Define the Flag

Add your flag to `FEATURE_FLAGS` object in `src/config/featureFlags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // ... existing flags

  ENABLE_NEW_FEATURE: {
    key: 'ENABLE_NEW_FEATURE',
    name: 'New Feature',
    description: 'Description of what this feature does',
    defaultValue: false,
    environment: 'all', // or 'development', 'staging', 'production'
    enabled: false,
  },
} as const;
```

### Step 2: Use the Flag

```typescript
import { getFeatureFlagValue } from '@config/featureFlags';

const MyComponent = () => {
  const isNewFeatureEnabled = getFeatureFlagValue('ENABLE_NEW_FEATURE');

  return (
    <View>
      {isNewFeatureEnabled ? <NewFeatureComponent /> : <OldFeatureComponent />}
    </View>
  );
};
```

### Step 3: Document the Flag

Update this documentation file with the new flag details.

## Environment Overrides

Feature flags can be overridden based on the current environment:

```typescript
const ENVIRONMENT_OVERRIDES = {
  development: {
    ENABLE_ANALYTICS: false,
    SHOW_DEBUG_INFO: true,
    ENABLE_PERFORMANCE_MONITORING: true,
  },
  staging: {
    ENABLE_ANALYTICS: true,
    SHOW_DEBUG_INFO: false,
    ENABLE_PERFORMANCE_MONITORING: true,
  },
  production: {
    ENABLE_ANALYTICS: true,
    SHOW_DEBUG_INFO: false,
    ENABLE_PERFORMANCE_MONITORING: false,
  },
};
```

## Navigation Configuration Matrix

| Drawer Flag | Tab Flag    | Result                                     |
| ----------- | ----------- | ------------------------------------------ |
| ✅ enabled  | ✅ enabled  | Full navigation: Drawer menu + Bottom tabs |
| ✅ enabled  | ❌ disabled | Drawer menu only (no bottom tabs)          |
| ❌ disabled | ✅ enabled  | Bottom tabs only (no drawer/hamburger)     |
| ❌ disabled | ❌ disabled | Single screen navigation (not recommended) |

## Best Practices

### Naming Conventions

- Use `ENABLE_*` for feature toggles
- Use `SHOW_*` for UI element visibility
- Use descriptive `UPPER_SNAKE_CASE` names

### Feature Flag Lifecycle

1. **Development**: Create flag with `enabled: __DEV__`
2. **Testing**: Test feature in development environment
3. **Staging**: Enable for staging environment
4. **Production**: Gradually enable for production users
5. **Cleanup**: Remove flag once feature is stable (6-12 months)

### When to Use Feature Flags

✅ **Use feature flags for:**

- New features in development
- Experimental features
- A/B testing
- Environment-specific behavior
- Gradual rollouts
- Emergency kill switches

❌ **Avoid feature flags for:**

- Bug fixes (just fix the bug)
- Simple code changes
- Features that will never be disabled
- Short-lived experiments (use time-based logic instead)

### Performance Considerations

- Feature flag checks are cheap (simple boolean lookups)
- Checks happen at render time, not on every interaction
- Environment overrides are resolved once per app session
- No network calls required (flags are compiled into the app)

## Testing with Feature Flags

### Unit Tests

```typescript
import { getFeatureFlagValue } from '@config/featureFlags';

jest.mock('@config/featureFlags', () => ({
  getFeatureFlagValue: jest.fn(),
}));

describe('MyComponent', () => {
  it('should render new UI when flag is enabled', () => {
    (getFeatureFlagValue as jest.Mock).mockReturnValue(true);
    // Test with feature enabled
  });

  it('should render old UI when flag is disabled', () => {
    (getFeatureFlagValue as jest.Mock).mockReturnValue(false);
    // Test with feature disabled
  });
});
```

### Manual Testing

1. Open `src/config/featureFlags.ts`
2. Change `enabled` value for the flag you want to test
3. Reload the app (Fast Refresh may not pick up config changes)
4. Verify behavior with flag enabled/disabled

## Troubleshooting

### Flag Changes Not Taking Effect

**Problem**: Changed flag value but app behavior hasn't changed

**Solutions**:

- Reload the app completely (not just Fast Refresh)
- Check if there's an environment override affecting the flag
- Verify you're checking the correct flag key
- Ensure `getFeatureFlagValue()` is being called, not directly accessing `FEATURE_FLAGS`

### TypeScript Errors

**Problem**: TypeScript complaining about flag key

**Solutions**:

- Ensure the flag is added to `FEATURE_FLAGS` object
- The `as const` assertion provides type safety
- Flag keys are automatically typed from the object keys

### Environment-Specific Issues

**Problem**: Flag works in development but not production

**Solutions**:

- Check the `environment` field in the flag definition
- Review `ENVIRONMENT_OVERRIDES` for conflicts
- Verify `getCurrentEnvironment()` returns correct environment

## Future Enhancements

Potential improvements to the feature flag system:

1. **Remote Configuration**: Load flags from Firebase Remote Config
2. **User-Specific Flags**: Enable features for specific users
3. **Percentage Rollouts**: Enable features for X% of users
4. **A/B Testing Integration**: Built-in A/B test support
5. **Analytics Integration**: Auto-track flag usage
6. **Admin Panel**: UI to manage flags without code changes
7. **Flag Expiration**: Auto-disable flags after a certain date

## Related Files

- `src/config/featureFlags.ts` - Feature flag configuration
- `src/navigation/RootNavigator.tsx` - Uses drawer navigation flag
- `src/navigation/TabNavigator.tsx` - Uses tab navigation flag
- `src/components/navigation/CustomDrawerContent.tsx` - Uses drawer item flags
- `src/config/drawerConfig.json` - Drawer items with feature flag references

## Support

For questions or issues with feature flags:

1. Check this documentation first
2. Review `featureFlags.ts` for flag definitions
3. Search codebase for flag usage examples
4. Create an issue if you find a bug

---

**Last Updated**: 2026-02-17
**Version**: 1.0.0
