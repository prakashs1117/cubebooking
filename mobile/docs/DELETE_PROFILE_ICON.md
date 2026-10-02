# Delete Profile Icon Implementation

## Overview
Added custom delete profile icon to the Settings screen's delete account button with proper warning color styling and dark/light theme support.

## Changes Made

### 1. Created DeleteProfileIcon Component
**File:** `src/components/icons/components/DeleteProfileIcon.tsx`

A custom SVG-based icon component that displays a user profile with a delete/cancel symbol overlay. The icon is:
- Responsive to color prop (theme-aware)
- Scalable via size prop
- Built with react-native-svg for native rendering

### 2. Updated Icon Registry
**File:** `src/components/icons/iconRegistry.tsx` (Line 244)

```typescript
'delete-profile': DeleteProfileIcon,
```

The icon was already registered in the icon system, now properly linked to the custom component.

### 3. Updated Icon Types
**File:** `src/components/icons/types.ts` (Line 102)

```typescript
| 'delete-profile'
```

The icon type was already defined in the system.

### 4. Enhanced SettingsRowComponent
**File:** `src/screens/SettingsScreen.tsx`

#### Updated Component to Use Warning Colors
- Icon color: `theme.text.error` (red warning color)
- Text color: `theme.text.error` (red warning color)
- Chevron color: `theme.text.error` (red warning color)
- Background: Subtle error tint (`theme.text.error + '08'` = 5% opacity)

#### Styling Features
- Light theme: Red error color with light red background
- Dark theme: Light red error color with dark red background tint
- Active opacity on press: 0.7 for tactile feedback

### Color Values

#### Light Theme
- Error text color: `#FF3B30` (bright red)
- Background tint: `#FF3B3D08` (5% opacity red)

#### Dark Theme
- Error text color: `#FF6B5B` (lighter red for contrast on dark background)
- Background tint: `#FF6B5B08` (5% opacity lighter red)

## Visual Hierarchy

The delete account button now has visual distinction:
1. **Icon** - Red delete profile icon (20px)
2. **Text** - Red "Delete Account" label
3. **Background** - Subtle red tint overlay
4. **Indicator** - Red chevron-right icon

## Theme Behavior

### Light Mode
- Red icon and text stand out against white background
- Subtle red background highlight for context
- Clear destructive action indication

### Dark Mode
- Lighter red for better contrast on dark background
- Darker red background tint for visibility
- Maintains red warning aesthetic

## Files Modified

```
react-native-mobileapp/
├── src/
│   ├── components/
│   │   └── icons/
│   │       ├── components/
│   │       │   └── DeleteProfileIcon.tsx (NEW)
│   │       ├── iconRegistry.tsx (already had reference)
│   │       └── types.ts (already had type)
│   └── screens/
│       └── SettingsScreen.tsx (updated SettingsRowComponent)
└── docs/
    └── DELETE_PROFILE_ICON.md (this file)
```

## Testing Checklist

- [x] Icon displays correctly in light theme
- [x] Icon displays correctly in dark theme
- [x] Warning colors are visible and appropriate
- [x] Button press opens destructive confirmation modal
- [x] Delete account flow works as expected
- [x] TypeScript compilation passes
- [x] No console warnings or errors
