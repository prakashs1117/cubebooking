# How to Add New SVG Icons

This guide explains how to convert new SVG files to React Native components, just like the existing 84 icons.

## Quick Start (Automated)

### Step 1: Add Your SVG Files

Place your new `.svg` files in the `src/assets/svg-broken-icons/` directory.

### Step 2: Run the Conversion Script

```bash
node scripts/convert-svg-icons.js
```

That's it! The script will:

- ✅ Convert all new SVG files to `.tsx` components
- ✅ Update the `index.ts` export file
- ✅ Apply proper formatting and props
- ✅ Make icons ready to use

## Manual Process (If Needed)

If you prefer to convert icons manually or understand the process:

### 1. SVG File Format

Your SVG should look like this:

```xml
<?xml version="1.0" encoding="utf-8"?>
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="12" cy="16" r="3" stroke="#1C274C" stroke-width="1.5"/>
</svg>
```

### 2. Convert to React Native Component

The script converts the SVG to this format:

```tsx
import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

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
      <Circle cx={12} cy={16} r={3} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export default SvgComponent;
```

### 3. Key Transformations

The conversion process:

| SVG Attribute             | React Native Prop        | Example       |
| ------------------------- | ------------------------ | ------------- |
| `width="800px"`           | `width={width}`          | Props-based   |
| `height="800px"`          | `height={height}`        | Props-based   |
| `stroke="#1C274C"`        | `stroke={color}`         | Dynamic color |
| `fill="#1C274C"`          | `fill={color}`           | Dynamic color |
| `stroke-width="1.5"`      | `strokeWidth={1.5}`      | camelCase     |
| `stroke-linecap="round"`  | `strokeLinecap="round"`  | camelCase     |
| `stroke-linejoin="round"` | `strokeLinejoin="round"` | camelCase     |

### 4. Update Index File

After creating the component, add it to `src/assets/svg-broken-icons/index.ts`:

```typescript
// Add this line (following the naming convention)
export { default as YourIconNameIcon } from './your-icon-file-name';
```

**Naming Convention:**

- SVG file: `home-svgrepo-com.svg`
- Export name: `HomeIcon`
- File remains: `home-svgrepo-com.tsx`

## Icon Naming Convention

### File Naming

Keep the original SVG filename, just change extension:

- ✅ `bell-svgrepo-com.svg` → `bell-svgrepo-com.tsx`
- ❌ Don't rename files

### Export Naming

Convert kebab-case to PascalCase + "Icon":

- `bell-svgrepo-com.svg` → Export as `BellIcon`
- `map-point-add-svgrepo-com.svg` → Export as `MapPointAddIcon`
- `archive-down-minimlistic-svgrepo-com.svg` → Export as `ArchiveDownIcon`

**Rules:**

1. Remove `-svgrepo-com` suffix
2. Remove `-minimlistic`, `-minimalistic` suffixes (optional variations)
3. Convert to PascalCase
4. Add `Icon` suffix
5. Keep meaning clear and concise

## Using the Automated Script

### What the Script Does

The `scripts/convert-svg-icons.js` script:

1. **Scans** for new `.svg` files in `src/assets/svg-broken-icons/`
2. **Parses** SVG content (paths, circles, rects, etc.)
3. **Converts** attributes to React Native props
4. **Generates** TypeScript component with proper interface
5. **Updates** `index.ts` with new exports
6. **Reports** success/failure for each icon

### Running the Script

```bash
# From project root
node scripts/convert-svg-icons.js

# Expected output:
Found 5 new SVG files to convert

✅ Converted: home-icon-svgrepo-com.svg -> home-icon-svgrepo-com.tsx
✅ Converted: user-profile-svgrepo-com.svg -> user-profile-svgrepo-com.tsx
✅ Converted: settings-gear-svgrepo-com.svg -> settings-gear-svgrepo-com.tsx
✅ Converted: notification-bell-svgrepo-com.svg -> notification-bell-svgrepo-com.tsx
✅ Converted: search-magnifier-svgrepo-com.svg -> search-magnifier-svgrepo-com.tsx

✨ Conversion complete!
✅ Success: 5 files
❌ Errors: 0 files
📝 Updated index.ts with 5 new exports
```

## Testing New Icons

After conversion, test your icons:

### 1. Import and Use

```tsx
import { YourNewIcon } from '@assets/svg-broken-icons';

<YourNewIcon />
<YourNewIcon width={32} height={32} color="#007AFF" />
```

### 2. View in Icon Gallery

1. Open the app
2. Go to the **Icons** tab
3. Search for your new icon
4. Click to see usage code

### 3. Check TypeScript

```bash
npm run lint
npx tsc --noEmit
```

## Troubleshooting

### Icon Not Showing Up

**Problem:** Icon appears blank or incorrect

**Solutions:**

- Check if SVG uses `fill` or `stroke` (both are supported)
- Verify viewBox is `0 0 24 24`
- Ensure paths are using valid SVG path syntax
- Check console for errors

### Import Errors

**Problem:** Cannot find module error

**Solutions:**

- Verify `index.ts` was updated with the export
- Check filename matches exactly (including `.tsx` extension)
- Restart Metro bundler: `npm start -- --reset-cache`

### Wrong Colors

**Problem:** Icon shows wrong color or doesn't respect color prop

**Solutions:**

- Ensure hardcoded colors (`#HEX`) were replaced with `{color}` prop
- Check if SVG uses `fill="none"` - this is correct
- Verify stroke/fill attributes point to `{color}` variable

### Size Issues

**Problem:** Icon too large or small

**Solutions:**

- Check default values: `width = 24, height = 24`
- Verify viewBox is `0 0 24 24`
- Don't use hardcoded pixel values like `800px`

## Best Practices

### ✅ DO

- Keep original SVG filenames
- Use descriptive export names
- Test icons in both light and dark themes
- Add icons to the Icon Gallery for discovery
- Use default size (24x24) for consistency
- Keep viewBox as `0 0 24 24`

### ❌ DON'T

- Don't hardcode colors in SVG paths
- Don't use pixel values in width/height props
- Don't skip updating `index.ts`
- Don't rename SVG files arbitrarily
- Don't use icons larger than needed (performance)

## Example Workflow

Here's a complete example of adding a new icon:

```bash
# 1. Download SVG file
# 2. Place in src/assets/svg-broken-icons/
cp ~/Downloads/heart-svgrepo-com.svg src/assets/svg-broken-icons/

# 3. Run conversion script
node scripts/convert-svg-icons.js

# Output:
# ✅ Converted: heart-svgrepo-com.svg -> heart-svgrepo-com.tsx
# 📝 Updated index.ts with export: HeartIcon

# 4. Use in your code
```

```tsx
import { HeartIcon } from '@assets/svg-broken-icons';

function LikeButton() {
  return (
    <TouchableOpacity>
      <HeartIcon width={24} height={24} color="#FF3B30" />
    </TouchableOpacity>
  );
}
```

## Script Location

The conversion script is located at:

```
scripts/convert-svg-icons.js
```

Keep this script in your repository for future use. It's designed to be run whenever you add new SVG icons.

## Need Help?

1. Check the existing 84 icons in `src/assets/svg-broken-icons/` as examples
2. Review `src/assets/svg-broken-icons/README.md` for usage examples
3. Open the Icon Gallery in the app to see how icons should look
4. Check `ICON_SETUP_COMPLETE.md` for complete system documentation

---

**Last Updated:** 2026-02-27
**Script Version:** 1.0
**Total Icons:** 84 (and counting!)
