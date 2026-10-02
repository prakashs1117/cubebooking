# First Launch Carousel (Onboarding Guide)

## Overview

Comprehensive onboarding/first launch guide with configurable carousel screens, feature flag control, and persistent state management.

## Features

### ✅ Fully Configurable

- **JSON Data Source**: All screens defined in `src/data/onboardingData.json`
- **Platform Config**: Feature flags and settings in `config/eva/platformconfig.json`
- **Flexible Content**: Support for images or icons, custom colors per screen
- **Variable Screen Count**: Add/remove screens by editing JSON (1-10+ screens)

### ✅ Feature Flag Control

```json
{
  "onboarding": {
    "enabled": true, // Enable/disable entire feature
    "showOnFirstLaunchOnly": true, // Show only on first launch
    "skipEnabled": true, // Allow users to skip
    "autoPlayEnabled": false // Auto-advance slides
  }
}
```

### ✅ Persistent State

- Uses AsyncStorage to track completion
- Shows only once (configurable)
- Survives app restarts
- Reset option in Settings for testing

### ✅ Theme-Aware

- Adapts to light/dark mode
- Custom colors per screen
- Smooth transitions
- Professional UI/UX

## Configuration

### Platform Config (config/eva/platformconfig.json)

```json
{
  "onboarding": {
    "enabled": true,
    "showOnFirstLaunchOnly": true,
    "skipEnabled": true,
    "autoPlayEnabled": false
  }
}
```

**Options:**

- `enabled`: Master switch for onboarding feature
- `showOnFirstLaunchOnly`: If true, shows only on first app launch. If false, shows every time
- `skipEnabled`: If true, shows "Skip" button. If false, users must complete all screens
- `autoPlayEnabled`: If true, automatically advances screens every 5 seconds

### Onboarding Data (src/data/onboardingData.json)

```json
{
  "onboardingScreens": [
    {
      "id": "1",
      "title": "Welcome to Pharma Connect",
      "description": "Your gateway to cutting-edge pharmaceutical events",
      "imageUrl": "",
      "iconName": "merck-logo",
      "backgroundColor": "#4A90E2"
    }
  ]
}
```

**Fields:**

- `id`: Unique identifier for the screen
- `title`: Main heading text (bold, large)
- `description`: Detailed explanation text
- `imageUrl`: Optional image URL. If empty, uses icon instead
- `iconName`: Icon to display when no image URL provided
- `backgroundColor`: Hex color for screen background (ignored in dark mode)

## Adding/Removing Screens

### Add a New Screen

Edit `src/data/onboardingData.json`:

```json
{
  "onboardingScreens": [
    // ... existing screens
    {
      "id": "6",
      "title": "New Feature",
      "description": "Description of the new feature",
      "imageUrl": "",
      "iconName": "star",
      "backgroundColor": "#FF6B6B"
    }
  ]
}
```

### Remove a Screen

Simply delete the screen object from the JSON array. The carousel automatically adjusts to the number of screens.

### Change Screen Order

Reorder the objects in the JSON array. Screens display in array order.

## Available Icons

Available icon names (from `src/components/icons/types.tsx`):

- `merck-logo`, `bell`, `favorite`, `calendar`, `checkbox-checked`
- `home`, `settings`, `user`, `document`, `star`
- `arrow-left`, `arrow-right`, `back`, `hamburger`
- Many more - see icon registry

## Usage

### Automatic Display

The carousel automatically displays on first app launch (if enabled in config). No code changes needed.

### Manual Trigger (Testing)

Reset onboarding from Settings screen:

1. Open Settings
2. Scroll to "Reset First Launch Guide"
3. Tap and confirm
4. Restart app to see onboarding again

### Programmatic Reset

```typescript
import { resetOnboarding } from '@services/onboardingService';

// Reset onboarding status
await resetOnboarding();
```

### Check Completion Status

```typescript
import { hasCompletedOnboarding } from '@services/onboardingService';

const completed = await hasCompletedOnboarding();
if (completed) {
  // User has seen onboarding
} else {
  // First launch
}
```

## File Structure

```
src/
├── components/
│   └── onboarding/
│       └── FirstLaunchCarousel.tsx      # Main carousel component
├── data/
│   └── onboardingData.json              # Screen content (EDITABLE)
├── services/
│   └── onboardingService.ts             # State management
└── utils/
    └── platformConfig.ts                # Config helpers

config/
└── eva/
    └── platformconfig.json              # Feature flags (EDITABLE)
```

## Customization Examples

### Example 1: Welcome Flow (3 Screens)

```json
{
  "onboardingScreens": [
    {
      "id": "1",
      "title": "Welcome",
      "description": "Welcome to our app",
      "imageUrl": "",
      "iconName": "home",
      "backgroundColor": "#4A90E2"
    },
    {
      "id": "2",
      "title": "Features",
      "description": "Explore amazing features",
      "imageUrl": "",
      "iconName": "star",
      "backgroundColor": "#50C878"
    },
    {
      "id": "3",
      "title": "Get Started",
      "description": "Let's begin your journey",
      "imageUrl": "",
      "iconName": "checkbox-checked",
      "backgroundColor": "#E74C3C"
    }
  ]
}
```

### Example 2: Single Welcome Screen

```json
{
  "onboardingScreens": [
    {
      "id": "1",
      "title": "Welcome",
      "description": "Tap Get Started to begin",
      "imageUrl": "",
      "iconName": "merck-logo",
      "backgroundColor": "#4A90E2"
    }
  ]
}
```

### Example 3: Extended Guide (7 Screens)

Add more screens to the array - the carousel automatically adjusts pagination and navigation.

### Example 4: Auto-Advance

In `platformconfig.json`:

```json
{
  "onboarding": {
    "enabled": true,
    "showOnFirstLaunchOnly": true,
    "skipEnabled": false,
    "autoPlayEnabled": true // Auto-advance every 5 seconds
  }
}
```

## Styling

### Dark Mode Support

- Automatically adapts background colors
- Uses theme colors for text
- Icon colors adjust to theme
- Buttons use theme colors

### Light Mode

- Uses custom `backgroundColor` from JSON
- White text for contrast
- Colored "Next" button

### Dark Mode

- Uses `theme.background.primary`
- Theme-aware text colors
- Theme-colored buttons

## Testing

### Test First Launch

1. Reset onboarding in Settings
2. Kill and restart app
3. Onboarding should display

### Test Skip Functionality

1. Set `skipEnabled: true` in config
2. Launch onboarding
3. Tap "Skip" button
4. Should complete onboarding

### Test Auto-Play

1. Set `autoPlayEnabled: true` in config
2. Launch onboarding
3. Screens should auto-advance every 5 seconds

### Disable Feature

1. Set `enabled: false` in config
2. Restart app
3. Onboarding should not display

## Integration Points

### App.tsx

- Checks onboarding status on startup
- Shows modal if needed
- Handles completion callback

### SettingsScreen.tsx

- "Reset First Launch Guide" option
- Only visible if onboarding enabled in config

### onboardingService.ts

- Manages AsyncStorage state
- Tracks completion status
- Provides reset functionality

## AsyncStorage Keys

- `@app_onboarding_completed`: Stores completion status (`"true"` or not set)

## Performance

- Lazy loads modal only when needed
- Efficient carousel rendering
- Minimal re-renders
- Smooth animations via react-native-reanimated

## Accessibility

- Swipe gestures supported
- Touch-responsive navigation
- Clear "Next" and "Skip" buttons
- Pagination dots for progress indication

## Best Practices

1. **Keep It Short**: 3-5 screens is optimal
2. **Clear Messaging**: Use simple, concise descriptions
3. **Visual Hierarchy**: Use icons or images to reinforce messaging
4. **Allow Skip**: Users appreciate the option to skip
5. **Test Both Themes**: Ensure readability in light and dark modes
6. **Update Regularly**: Refresh content when adding major features

## Common Use Cases

### Use Case 1: Feature Announcements

Update onboarding content with new feature highlights in each app release.

### Use Case 2: Tutorial Flow

Guide new users through key app features step-by-step.

### Use Case 3: Brand Introduction

Showcase company values, mission, and key information.

### Use Case 4: Regulatory Compliance

Display required legal information or terms acceptance flow.

## Troubleshooting

### Onboarding Not Showing

1. Check `platformconfig.json` → `onboarding.enabled: true`
2. Reset onboarding from Settings
3. Verify AsyncStorage key is not set

### Can't Skip

1. Check `platformconfig.json` → `onboarding.skipEnabled: true`

### Shows Every Time

1. Check `platformconfig.json` → `onboarding.showOnFirstLaunchOnly: true`
2. Verify AsyncStorage is working

### Screens Not Updating

1. Clear cache: `npm start -- --reset-cache`
2. Rebuild app if JSON changes aren't reflecting

## Summary

✅ **Feature Flag Controlled** - Easy enable/disable via config
✅ **JSON Configured** - Update content without code changes
✅ **Flexible Screen Count** - 1 to 10+ screens supported
✅ **Persistent State** - Shows only once (configurable)
✅ **Theme Integrated** - Dark/light mode support
✅ **Skip Option** - User-friendly experience
✅ **Auto-Play** - Optional automated progression
✅ **Reset Functionality** - Easy testing and debugging
✅ **Production Ready** - Polished, professional UI/UX

The first launch carousel is fully integrated and ready for customization! 🎉
