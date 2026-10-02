# Icon System Documentation

Complete documentation for the React Native icon system with 84+ SVG icons.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Adding New Icons](#adding-new-icons)
4. [Using Icons](#using-icons)
5. [Icon Gallery](#icon-gallery)
6. [File Structure](#file-structure)
7. [Technical Details](#technical-details)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses a custom SVG icon system that converts SVG files to React Native TypeScript components with customizable props.

### Key Features

- ✅ **84+ Icons**: Pre-converted and ready to use
- ✅ **TypeScript**: Full type safety with interfaces
- ✅ **Customizable**: Width, height, and color props
- ✅ **Mobile-Optimized**: Default 24x24px size
- ✅ **Theme-Aware**: Adapts to light/dark themes
- ✅ **Visual Gallery**: Browse all icons in the app
- ✅ **Automated Conversion**: One command to convert new SVGs
- ✅ **Centralized Exports**: Import from one location

### Icon Props

All icons support these props:

```tsx
interface IconProps {
  width?: number; // Default: 24
  height?: number; // Default: 24
  color?: string; // Default: "#1C274C"
}
```

---

## Quick Start

### View Icons

1. Open the app
2. Tap the **Icons** tab in the bottom navigation
3. Browse, search, and click icons to see usage code

### Use Icons in Code

```tsx
import { BellIcon, AddSquareIcon, CameraIcon } from '@assets/svg-broken-icons';

function MyComponent() {
  return (
    <View>
      {/* Default size and color */}
      <BellIcon />

      {/* Custom size */}
      <AddSquareIcon width={32} height={32} />

      {/* Custom color */}
      <CameraIcon color="#007AFF" />

      {/* All custom */}
      <BellIcon width={48} height={48} color="#FF3B30" />
    </View>
  );
}
```

---

## Adding New Icons

### Automated Method (Recommended)

```bash
# 1. Add SVG file(s) to the icons directory
cp your-icon.svg src/assets/svg-broken-icons/

# 2. Run the conversion script
npm run convert-icons

# 3. Icons are ready to use!
```

### What the Script Does

1. ✅ Scans for new `.svg` files
2. ✅ Converts to React Native `.tsx` components
3. ✅ Adds TypeScript interfaces
4. ✅ Updates `index.ts` with exports
5. ✅ Reports success/failure

### Example Output

```
🔍 Scanning for SVG files...

Found 2 new SVG files to convert

✅ Converted: heart-svgrepo-com.svg -> heart-svgrepo-com.tsx
   Export as: HeartIcon
✅ Converted: star-svgrepo-com.svg -> star-svgrepo-com.tsx
   Export as: StarIcon

==================================================
✨ Conversion complete!
✅ Success: 2 files
❌ Errors: 0 files
📝 Updated index.ts with 2 new exports
==================================================

🎉 New icons are ready to use!
```

### SVG Requirements

Your SVG should:

- Be valid XML
- Use `viewBox="0 0 24 24"` (or similar aspect ratio)
- Use `stroke` or `fill` for colors
- Not have inline JavaScript or styles

### Manual Method

See detailed instructions in `HOW_TO_ADD_NEW_ICONS.md`

---

## Using Icons

### Basic Usage

```tsx
import { IconName } from '@assets/svg-broken-icons';

<IconName />;
```

### Custom Size

```tsx
<IconName width={32} height={32} />
<IconName width={48} height={48} />
<IconName width={16} height={16} />
```

### Custom Color

```tsx
<IconName color="#007AFF" />  // iOS Blue
<IconName color="#FF3B30" />  // iOS Red
<IconName color="#34C759" />  // iOS Green
```

### With Theme

```tsx
import { useTheme } from '@theme/index';

function ThemedIcon() {
  const { theme } = useTheme();

  return <IconName width={24} height={24} color={theme.text.primary} />;
}
```

### In Buttons

```tsx
<TouchableOpacity onPress={handlePress}>
  <View style={styles.button}>
    <IconName width={20} height={20} color="#FFF" />
    <Text>Button Text</Text>
  </View>
</TouchableOpacity>
```

### In Lists

```tsx
<FlatList
  data={items}
  renderItem={({ item }) => (
    <View style={styles.listItem}>
      <IconName width={24} height={24} color={item.color} />
      <Text>{item.title}</Text>
    </View>
  )}
/>
```

---

## Icon Gallery

The Icon Gallery screen provides a visual browser for all icons.

### Features

- **Grid View**: All icons in a 4-column responsive grid
- **Search**: Filter icons by name
- **Selection**: Click any icon to see details
- **Code Snippets**: Copy-paste ready usage examples
- **Live Preview**: See icons at different sizes
- **Theme Support**: Works with light and dark themes

### Location

`src/screens/IconGalleryScreen.tsx`

### Access

1. Open the app
2. Tap **Icons** in the bottom navigation
3. Browse and search icons

---

## File Structure

```
src/
├── assets/
│   └── svg-broken-icons/
│       ├── index.ts                    # Central exports
│       ├── README.md                   # Icon usage docs
│       ├── add-square-svgrepo-com.tsx  # Icon components...
│       ├── bell-svgrepo-com.tsx
│       └── ... (84+ icon files)
│
├── screens/
│   └── IconGalleryScreen.tsx          # Visual icon browser
│
├── navigation/
│   └── TabNavigator.tsx               # Includes Icons tab
│
scripts/
└── convert-svg-icons.js               # Conversion script

docs/
├── HOW_TO_ADD_NEW_ICONS.md           # Detailed guide
└── ICON_SYSTEM_DOCUMENTATION.md      # This file

QUICK_START_ICONS.md                   # Quick reference
ICON_SETUP_COMPLETE.md                 # Setup summary
```

---

## Technical Details

### Conversion Process

1. **Parse SVG**: Extract viewBox, paths, circles, rects
2. **Convert Attributes**: `stroke-width` → `strokeWidth`
3. **Replace Colors**: `#1C274C` → `{color}` prop
4. **Generate TSX**: Create React Native component
5. **Add Interface**: TypeScript props interface
6. **Update Exports**: Add to `index.ts`

### Component Format

```tsx
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

function SvgComponent({
  width = 24,
  height = 24,
  color = '#1C274C',
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
```

### Naming Convention

| Original Filename                          | Component Name | Export Name       |
| ------------------------------------------ | -------------- | ----------------- |
| `bell-svgrepo-com.svg`                     | `SvgComponent` | `BellIcon`        |
| `map-point-add-svgrepo-com.svg`            | `SvgComponent` | `MapPointAddIcon` |
| `archive-down-minimlistic-svgrepo-com.svg` | `SvgComponent` | `ArchiveDownIcon` |

**Rules:**

1. Keep original filename for `.tsx`
2. Remove suffixes: `-svgrepo-com`, `-minimlistic`, `-minimalistic`
3. Convert to PascalCase
4. Add `Icon` suffix

### Path Aliases

Icons use Babel/TypeScript path aliases:

```tsx
// ✅ Correct - Use alias
import { BellIcon } from '@assets/svg-broken-icons';

// ❌ Wrong - Don't use relative paths
import { BellIcon } from '../../assets/svg-broken-icons';
```

Configured in:

- `babel.config.js` (runtime)
- `tsconfig.json` (TypeScript)

---

## Troubleshooting

### Icon Not Showing

**Problem:** Icon renders as blank or incorrect

**Solutions:**

1. Check if SVG uses `stroke` or `fill` (both supported)
2. Verify `viewBox="0 0 24 24"`
3. Look for console errors
4. Try different color: `color="#000000"`

### Import Error

**Problem:** "Cannot find module" error

**Solutions:**

1. Check `index.ts` has the export
2. Restart Metro bundler: `npm start -- --reset-cache`
3. Verify filename is correct
4. Check TypeScript compilation: `npx tsc --noEmit`

### Color Not Working

**Problem:** Icon doesn't respect color prop

**Solutions:**

1. Check if SVG originally used `fill` or `stroke`
2. Verify conversion replaced hardcoded colors
3. Try explicit color: `color="#FF0000"`
4. Check if SVG has `fill="none"` (correct)

### Size Issues

**Problem:** Icon too large or small

**Solutions:**

1. Use explicit size: `width={24} height={24}`
2. Check parent container size
3. Verify `viewBox` is `0 0 24 24`
4. Don't use pixel strings: ~~`width="24px"`~~ → `width={24}`

### Script Errors

**Problem:** Conversion script fails

**Solutions:**

1. Check SVG is valid XML
2. Verify file has `.svg` extension
3. Check for special characters in filename
4. Run with Node.js directly: `node scripts/convert-svg-icons.js`

### Gallery Not Updating

**Problem:** New icons not showing in gallery

**Solutions:**

1. Verify `index.ts` was updated
2. Reload app (Cmd+R on iOS, R+R on Android)
3. Clear cache and restart: `npm start -- --reset-cache`

---

## Best Practices

### ✅ DO

- Use default size (24x24) for consistency
- Import from `@assets/svg-broken-icons`
- Test icons in light and dark themes
- Add icons to gallery for discovery
- Use descriptive export names
- Keep original SVG filenames

### ❌ DON'T

- Don't hardcode colors in SVG files
- Don't use pixel strings (`"24px"`)
- Don't skip running conversion script
- Don't rename SVG files arbitrarily
- Don't use icons larger than needed
- Don't use relative imports

---

## Icon Categories

### Actions (15+)

AddSquare, CloseSquare, CheckSquare, Forward, UndoRight, DownloadSquare, DownloadTwiceSquare, MaximizeSquare, Maximize, Like, Dislike, VerifiedCheck

### Alerts & Status (8+)

Danger, DangerCircle, DangerTriangle, ForbiddenCircle, InfoSquare, VerifiedCheck

### Archive (4+)

Archive, ArchiveCheck, ArchiveDown, ArchiveUp

### Communication (5+)

Bell, BellBing, BellOff, ChatRoundCheck, Feed

### Documents (4+)

DocumentAdd, DocumentMedicine, ClipboardAdd, List

### Gallery & Media (8+)

Album, GalleryAdd, GalleryCircle, GalleryRemove, Camera, ClapperboardPlay, Muted, Stream

### Location (3+)

MapPointAdd, MapPointRemove, MapPointSearch

### Navigation (8+)

RoundArrowLeft, RoundArrowRight, RoundArrowDown, RoundArrowRightUp, RoundAltArrowLeft, RoundAltArrowRight, RoundAltArrowUp, RoundDoubleAltArrowDown

### Security (5+)

LockKeyholeUnlocked, KeySquare, ShieldPlus, ShieldUser, Incognito

### Tools (9+)

Magnifier, MagnifierZoomIn, MagnifierZoomOut, CodeScan, EyeScan, Eye, Printer, Printer2, RemoteController2

### UI Elements (6+)

Widget, Widget4, Widget5, Clock, RoundSortHorizontal

### Other (12+)

Battery, CaseRound, Crown, Cup (Hot/Music/Star), Dollar, ElectricRefueling, KickScooter, Moon, MoonFog, PresentationGraph, SortByAlphabet, SortFromTopToBottom, Wineglass, WineglassTriangle

**Total: 84+ icons**

---

## Resources

### Documentation Files

| File                                    | Description               |
| --------------------------------------- | ------------------------- |
| `docs/HOW_TO_ADD_NEW_ICONS.md`          | Detailed conversion guide |
| `docs/ICON_SYSTEM_DOCUMENTATION.md`     | This file - Complete docs |
| `QUICK_START_ICONS.md`                  | Quick reference guide     |
| `ICON_SETUP_COMPLETE.md`                | Initial setup summary     |
| `src/assets/svg-broken-icons/README.md` | Usage examples            |
| `scripts/README.md`                     | Script documentation      |

### Script Files

| File                           | Purpose                     |
| ------------------------------ | --------------------------- |
| `scripts/convert-svg-icons.js` | Convert SVG to React Native |

### NPM Commands

```bash
npm run convert-icons    # Convert new SVG files
npm run lint            # Check code quality
npm run format          # Format code
```

---

## Support

### Questions?

1. Check this documentation
2. Review `HOW_TO_ADD_NEW_ICONS.md`
3. Look at existing icon files as examples
4. Open the Icon Gallery in the app

### Need Help?

- All icons in `src/assets/svg-broken-icons/` serve as examples
- Icon Gallery shows live usage
- Script provides detailed error messages

---

**Last Updated:** 2026-02-27
**Icon Count:** 84+ (and growing)
**Version:** 1.0
**Status:** ✅ Production Ready
