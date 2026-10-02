# Icon System Documentation

## Overview

This TodoApp uses a comprehensive, asset-based icon system built with `react-native-svg` that provides:

- ✅ **Type-safe** icon names with TypeScript autocomplete
- ✅ **Optimized bundle size** - only includes icons you actually use
- ✅ **Consistent API** across all icons
- ✅ **Mix of assets** - combines your existing assets with new standardized icons
- ✅ **Cross-platform** - works on iOS and Android
- ✅ **Customizable** - easy to add/remove icons

## 🎯 Quick Start

```tsx
import Icon from '../components/icons/Icon';

// Basic usage
<Icon name="home" size={24} color="#007AFF" />

// With custom styling
<Icon
  name="bell"
  size={32}
  color="#503291"
  style={{ marginRight: 10 }}
/>
```

## 📁 File Structure

```
src/components/icons/
├── Icon.tsx                    # Main Icon component (use this!)
├── types.ts                    # TypeScript definitions
├── iconRegistry.tsx            # Central icon registry
└── components/                 # Individual icon components
    ├── HomeIcon.tsx            # Standardized home icons
    ├── BellIcon.tsx            # Asset-based bell icons
    ├── ArrowIcon.tsx           # Navigation arrows
    └── ...                     # More icon components
```

## 🎨 Available Icons

### Navigation Icons

- `home` / `home-outline` - Home screen icons
- `back` - Back navigation arrow
- `hamburger` - Menu hamburger
- `arrow-left` / `arrow-right` - Navigation arrows
- `arrow-left-small` / `arrow-right-small` - Smaller arrows

### UI & Interaction Icons

- `settings` / `settings-outline` - Settings gear
- `favorite` / `favorite-outline` - Heart/favorite
- `component` / `component-outline` - Component icon
- `bell` / `bell-outline` - Notifications (from your assets!)

### Form Controls

- `checkbox-checked` / `checkbox-unchecked` - Checkboxes
- `radio-selected` / `radio-unselected` - Radio buttons

### Medical & Health (From Your Assets)

- `lab` - Laboratory/medical
- `syringe` - Medical syringe
- `virus` - Virus icon

### Brand & Business

- `merck` / `merck-logo` - Merck branding (from your assets!)

### Date & Time

- `calendar` / `calendar-outline` - Calendar icons

### Actions & Tools

- `search` - Search icon
- `close` - Close/X icon
- `heart` / `heart-outline` - Heart icons
- `ruler` - Measurement tool
- `light` - Light bulb
- `dashboard` - Dashboard view
- `website` - Web/link icon

### Education

- `edu-1` through `edu-8` - Educational icons

### Location

- `map` / `map-outline` - Map/location icons

## 💼 Business Logic

### Icon Registry System

The system uses a central registry (`iconRegistry.tsx`) that:

1. **Maps** icon names to React components
2. **Wraps** existing assets for consistent API
3. **Provides** fallback placeholders for missing icons
4. **Validates** icon names at compile time

### Asset Integration

Your existing assets are integrated as:

```tsx
// Legacy wrapped components maintain backward compatibility
'settings': (props) => <LegacyIconWrapper IconComponent={IconSettings} {...props} />

// New standardized components for better performance
'bell': BellIcon,
'home': HomeIcon,
```

## 🛠 Adding New Icons

### Method 1: Add Existing Asset

```tsx
// 1. Import your asset
import IconNewAsset from '../../assets/icon-new-asset.tsx';

// 2. Add to registry
export const iconRegistry: Record<
  IconName,
  React.ComponentType<IconComponentProps>
> = {
  // ... existing icons
  'new-asset': props => (
    <LegacyIconWrapper IconComponent={IconNewAsset} {...props} />
  ),
};

// 3. Add to types
export type IconName =
  | 'home'
  | 'new-asset' // Add here
  | '...';
```

### Method 2: Create New Standardized Component

```tsx
// 1. Create new component file
// src/components/icons/components/NewIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const NewIcon: React.FC<IconComponentProps> = ({
  color = '#000',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
    <Path d="..." fill={color} />
  </Svg>
);

// 2. Add to registry
'new-icon': NewIcon,
```

## ⚡ Performance Benefits

### Bundle Size Optimization

- **Before**: Large icon font files (100kb+ for full icon sets)
- **After**: Only includes icons you actually use (~5-10kb per icon)

### Type Safety

- **Autocomplete** for all icon names
- **Compile-time** validation
- **No runtime** errors for missing icons

### Consistent API

```tsx
// All icons use the same props
<Icon name="any-icon" size={24} color="#000" />
```

## 🎯 Demo Implementation

See `HomeScreen.tsx` for a live demo showing:

- Asset-based bell icon from your original files
- Standardized home icon
- Navigation arrows
- Merck branding

```tsx
// Example from HomeScreen
<Icon name="bell" size={24} color="#503291" />
<Icon name="home" size={32} color="#007AFF" />
<Icon name="arrow-left" size={32} color="#FF6B35" />
<Icon name="merck-logo" size={32} color="#0066CC" />
```

## 🔧 Development Tips

### VSCode Autocomplete

The TypeScript definitions provide full autocomplete for icon names:

```tsx
<Icon name="  // Ctrl+Space shows all available icons
```

### Icon Not Found

If an icon isn't implemented yet, you'll see a placeholder with the icon abbreviation.

### Adding Your Assets

1. Copy your SVG/TSX files to `src/assets/`
2. Import them in `iconRegistry.tsx`
3. Add the name to `IconName` type
4. Wrap with `LegacyIconWrapper`

## 🚀 Usage in Production

This system is production-ready and provides:

- **Type safety** preventing runtime errors
- **Bundle optimization** for faster app startup
- **Maintainability** with centralized icon management
- **Scalability** to handle hundreds of icons efficiently

## 📱 Cross-Platform Compatibility

- ✅ **iOS** - Full support with react-native-svg
- ✅ **Android** - Full support with react-native-svg
- ✅ **RTL** - Supports right-to-left languages
- ✅ **Dark mode** - Color customizable per usage
