# 🎨 Quick Start: Adding New Icons

## TL;DR - 3 Steps

```bash
# 1. Add your .svg file to the icons folder
cp your-icon.svg src/assets/svg-broken-icons/

# 2. Run the conversion script
node scripts/convert-svg-icons.js

# 3. Use it in your code
```

```tsx
import { YourIconIcon } from '@assets/svg-broken-icons';

<YourIconIcon width={24} height={24} color="#007AFF" />;
```

## What the Script Does

✅ Converts SVG → React Native TSX components
✅ Adds TypeScript props (width, height, color)
✅ Updates index.ts with exports
✅ Makes icons mobile-friendly (24x24 default)
✅ Replaces hardcoded colors with props

## Example Output

```
🔍 Scanning for SVG files...

Found 3 new SVG files to convert

✅ Converted: heart-svgrepo-com.svg -> heart-svgrepo-com.tsx
   Export as: HeartIcon
✅ Converted: star-svgrepo-com.svg -> star-svgrepo-com.tsx
   Export as: StarIcon
✅ Converted: home-icon-svgrepo-com.svg -> home-icon-svgrepo-com.tsx
   Export as: HomeIcon

==================================================
✨ Conversion complete!
✅ Success: 3 files
❌ Errors: 0 files
📝 Updated index.ts with 3 new exports
==================================================

🎉 New icons are ready to use!

Usage example:

import { HeartIcon } from '@assets/svg-broken-icons';

<HeartIcon width={24} height={24} color="#007AFF" />

💡 View all icons in the Icon Gallery tab of your app!
```

## Icon Props

All converted icons support these props:

```tsx
interface IconProps {
  width?: number; // Default: 24
  height?: number; // Default: 24
  color?: string; // Default: "#1C274C"
}
```

## View All Icons

Open your app → Open **Sidebar** (hamburger menu) → Tap **Icon Gallery** to:

- 👀 Browse all available icons
- 🔍 Search by name
- 📋 Get copy-paste code snippets
- 🎨 See live previews

**Note:** Icon Gallery is only visible in dev mode. Enable it in Feature Flags if needed.

## Full Documentation

📖 **Detailed Guide**: `docs/HOW_TO_ADD_NEW_ICONS.md`
📦 **Complete Setup**: `ICON_SETUP_COMPLETE.md`
🔧 **Script Location**: `scripts/convert-svg-icons.js`

## Current Icon Count

**84 icons** (and counting!)

Categories: Actions, Alerts, Archive, Communication, Documents, Gallery, Location, Media, Navigation, Security, Tools, UI Elements, and more.

---

**Need help?** Check `docs/HOW_TO_ADD_NEW_ICONS.md` for troubleshooting and detailed instructions.
