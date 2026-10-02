# Feature Flags Quick Reference

## Common Imports

```typescript
// Hooks
import {
  useFeatureFlag,
  useFeatureFlags,
  useFeatureFlagToggle,
  useFeatureFlagActions,
  useFeatureFlagsByCategory,
} from '@hooks/useFeatureFlag';

// Components
import {
  FeatureFlag,
  FeatureFlagGate,
  ConditionalFeature,
} from '@components/common/FeatureFlag';

// Store (advanced usage)
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
```

## Hook Patterns

### Single Flag

```tsx
const isEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');
```

### Multiple Flags

```tsx
const flags = useFeatureFlags(['FLAG_1', 'FLAG_2', 'FLAG_3']);
// Access: flags.FLAG_1, flags.FLAG_2, flags.FLAG_3
```

### With Metadata

```tsx
const metadata = useFeatureFlagMetadata('ENABLE_NEW_TODO_UI');
// metadata.description, metadata.config, etc.
```

### Toggle (Dev Only)

```tsx
const { isEnabled, toggle, setOverride, clearOverride } =
  useFeatureFlagToggle('ENABLE_NEW_TODO_UI');
```

### By Category

```tsx
const uiFlags = useFeatureFlagsByCategory('ui');
// Returns all flags in 'ui' category
```

## Component Patterns

### Basic Conditional

```tsx
<FeatureFlag flag="ENABLE_NEW_TODO_UI" fallback={<OldUI />}>
  <NewUI />
</FeatureFlag>
```

### Multiple Flags (AND)

```tsx
<FeatureFlagGate
  flags={['FLAG_1', 'FLAG_2']}
  operator="AND"
  fallback={<Disabled />}
>
  <Enabled />
</FeatureFlagGate>
```

### Multiple Flags (OR)

```tsx
<FeatureFlagGate
  flags={['FLAG_1', 'FLAG_2']}
  operator="OR"
  fallback={<Disabled />}
>
  <Enabled />
</FeatureFlagGate>
```

### Explicit Enabled/Disabled

```tsx
<ConditionalFeature
  flag="ENABLE_DARK_MODE"
  whenEnabled={<DarkModeUI />}
  whenDisabled={<LightModeUI />}
/>
```

## Code Patterns

### If/Else Pattern

```tsx
const MyComponent = () => {
  const isEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');

  if (isEnabled) {
    return <NewUI />;
  }

  return <OldUI />;
};
```

### Ternary Pattern

```tsx
const MyComponent = () => {
  const isEnabled = useFeatureFlag('ENABLE_NEW_TODO_UI');
  return isEnabled ? <NewUI /> : <OldUI />;
};
```

### Early Return Pattern

```tsx
const MyComponent = () => {
  const isEnabled = useFeatureFlag('ENABLE_PREMIUM_FEATURES');

  if (!isEnabled) {
    return null; // or <UpgradePrompt />
  }

  return <PremiumFeatures />;
};
```

### Multiple Flags Pattern

```tsx
const MyComponent = () => {
  const { ENABLE_FEATURE_A, ENABLE_FEATURE_B } = useFeatureFlags([
    'ENABLE_FEATURE_A',
    'ENABLE_FEATURE_B',
  ]);

  return (
    <View>
      {ENABLE_FEATURE_A && <FeatureA />}
      {ENABLE_FEATURE_B && <FeatureB />}
      {ENABLE_FEATURE_A && ENABLE_FEATURE_B && <BothEnabled />}
    </View>
  );
};
```

## Store Actions

### Direct Store Access

```tsx
const isEnabled = useFeatureFlagsStore(state =>
  state.isFeatureEnabled('ENABLE_NEW_TODO_UI'),
);
```

### Toggle Flag (Dev)

```tsx
useFeatureFlagsStore.getState().toggleFeatureFlag('ENABLE_NEW_TODO_UI');
```

### Set Override (Dev)

```tsx
useFeatureFlagsStore.getState().setFeatureFlagOverride('FLAG_NAME', true);
```

### Clear Override (Dev)

```tsx
useFeatureFlagsStore.getState().clearOverride('FLAG_NAME');
```

### Reset All

```tsx
const { resetToDefaults } = useFeatureFlagActions();
resetToDefaults();
```

### Clear All Overrides

```tsx
const { clearAllOverrides } = useFeatureFlagActions();
clearAllOverrides();
```

## Configuration

### Add New Flag

Edit `src/config/featureFlagsConfig.json`:

```json
{
  "featureFlags": {
    "features": {
      "ENABLE_MY_FEATURE": {
        "enabled": false,
        "description": "My new feature description",
        "rolloutPercentage": 0,
        "environments": ["development"],
        "config": {
          "option1": true,
          "option2": "value"
        }
      }
    }
  }
}
```

### Access Flag Config

```tsx
const metadata = useFeatureFlagMetadata('ENABLE_ONBOARDING');
const config = metadata?.config;

if (config?.skipEnabled) {
  // Use config value
}
```

## Categories

```typescript
'ui'; // 🎨 UI/UX features
'features'; // ⭐ Core functionality
'social'; // 🔗 Social integrations
'analytics'; // 📊 Analytics and tracking
'experimental'; // 🧪 Experimental features
'debug'; // 🐛 Development and debugging
```

## Environment Values

```typescript
'development'; // Dev builds
'staging'; // Staging environment
'production'; // Production releases
```

## Rollout Percentage

```json
"rolloutPercentage": 0    // Disabled for all
"rolloutPercentage": 50   // Enabled for ~50%
"rolloutPercentage": 100  // Enabled for all
```

## Common Use Cases

### Feature Toggle

```tsx
const isNewUI = useFeatureFlag('ENABLE_NEW_TODO_UI');
return isNewUI ? <NewTodoList /> : <OldTodoList />;
```

### Premium Feature Gate

```tsx
<FeatureFlagGate
  flags={['ENABLE_PREMIUM_FEATURES']}
  fallback={<UpgradePrompt />}
>
  <PremiumContent />
</FeatureFlagGate>
```

### A/B Testing

```tsx
const useNewAlgorithm = useFeatureFlag('ENABLE_NEW_ALGORITHM');
const result = useNewAlgorithm ? newAlgorithm() : oldAlgorithm();
```

### Debug Mode

```tsx
const showDebugInfo = useFeatureFlag('SHOW_DEBUG_INFO');
{
  showDebugInfo && <DebugPanel />;
}
```

### Gradual Rollout

```json
// Week 1: 10% rollout
"rolloutPercentage": 10

// Week 2: 50% rollout
"rolloutPercentage": 50

// Week 3: 100% rollout
"rolloutPercentage": 100
```

## Development Tools

### Management Screen

Navigate to **Feature Flags Management** in drawer menu (dev mode)

### Console Logging

```tsx
import { logAllFeatureFlags } from '@stores/featureFlagsStore';

// Log all flags to console (dev only)
logAllFeatureFlags();
```

### Check Override Status

```tsx
const hasOverrides = useHasFeatureFlagOverrides();
console.log('Has overrides:', hasOverrides);
```

## Best Practices

### ✅ DO

- Use descriptive flag names (`ENABLE_*`, `SHOW_*`)
- Start with `enabled: false` for new features
- Test in development first
- Document flag purpose in description
- Clean up flags after feature is stable

### ❌ DON'T

- Don't nest feature flags too deeply
- Don't create flags for one-time use
- Don't forget to remove old flags
- Don't rely on flags for critical security
- Don't use flags for business logic

## Performance Tips

### Use Selectors

```tsx
// ✅ Good - Only re-renders when this specific flag changes
const isEnabled = useFeatureFlagsStore(state =>
  state.isFeatureEnabled('ENABLE_NEW_TODO_UI'),
);

// ❌ Avoid - Re-renders on any store change
const store = useFeatureFlagsStore();
const isEnabled = store.isFeatureEnabled('ENABLE_NEW_TODO_UI');
```

### Memoization

```tsx
const flagChecks = useMemo(
  () => ({
    newUI: getFeatureFlagValue('ENABLE_NEW_TODO_UI'),
    premium: getFeatureFlagValue('ENABLE_PREMIUM_FEATURES'),
  }),
  [],
);
```

## Testing

### Mock in Tests

```typescript
jest.mock('@stores/featureFlagsStore', () => ({
  useFeatureFlagsStore: () => ({
    isFeatureEnabled: (key: string) => key === 'ENABLE_NEW_TODO_UI',
  }),
}));
```

### Override for Testing

```typescript
beforeEach(() => {
  useFeatureFlagsStore.getState().setFeatureFlagOverride('FLAG_NAME', true);
});

afterEach(() => {
  useFeatureFlagsStore.getState().clearAllOverrides();
});
```

## Cheat Sheet

| Task             | Code                              |
| ---------------- | --------------------------------- |
| Check if enabled | `useFeatureFlag('FLAG')`          |
| Check multiple   | `useFeatureFlags(['F1', 'F2'])`   |
| Toggle (dev)     | `useFeatureFlagToggle('FLAG')`    |
| By category      | `useFeatureFlagsByCategory('ui')` |
| Reset all        | `resetToDefaults()`               |
| Clear overrides  | `clearAllOverrides()`             |
| Component gate   | `<FeatureFlag flag="FLAG">`       |
| Multiple gate    | `<FeatureFlagGate flags={[...]}>` |

## Support

- Full Guide: `FEATURE_FLAGS_GUIDE.md`
- Implementation: `FEATURE_FLAGS_IMPLEMENTATION_SUMMARY.md`
- Examples: `src/screens/FeatureFlagsScreen.tsx`
- Management UI: `src/screens/FeatureFlagsManagementScreen.tsx`
