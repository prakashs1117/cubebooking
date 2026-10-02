# Documentation Index

Welcome to the project documentation! This directory contains comprehensive guides and references.

## 📚 Quick Navigation

### Android Native Setup (fresh android/ folder)

👉 **Start here:** [`ANDROID_NATIVE_SETUP.md`](./ANDROID_NATIVE_SETUP.md)

### Crash Reporting (Firebase Crashlytics)

👉 [`CRASHLYTICS_GUIDE.md`](./CRASHLYTICS_GUIDE.md)

### Splash Screen (react-native-bootsplash)

👉 [`BOOTSPLASH_GUIDE.md`](./BOOTSPLASH_GUIDE.md)

### App Icons (swap per client/brand)

👉 [`APP_ICONS_GUIDE.md`](./APP_ICONS_GUIDE.md)

### For Adding New SVG Icons

👉 **Start here:** [`HOW_TO_ADD_NEW_ICONS.md`](./HOW_TO_ADD_NEW_ICONS.md)

Quick reference at project root: [`QUICK_START_ICONS.md`](../QUICK_START_ICONS.md)

### For Understanding the SVG Icon System

📖 **Complete documentation:** [`ICON_SYSTEM_DOCUMENTATION.md`](./ICON_SYSTEM_DOCUMENTATION.md)

Setup summary: [`ICON_SETUP_COMPLETE.md`](../ICON_SETUP_COMPLETE.md)

---

## 📋 Documentation Files

### Native & Platform Setup

| File                                                     | Purpose                                      | When to Read                                  |
| -------------------------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| **[ANDROID_NATIVE_SETUP.md](./ANDROID_NATIVE_SETUP.md)** | Full Android native setup for RN 0.83.1      | Replacing/scaffolding `android/` folder       |
| **[BOOTSPLASH_GUIDE.md](./BOOTSPLASH_GUIDE.md)**         | react-native-bootsplash v7 setup & animation | Setting up or modifying the splash screen     |
| **[APP_ICONS_GUIDE.md](./APP_ICONS_GUIDE.md)**           | Customizable app icons for Android & iOS     | Swapping icons per client/brand/app           |
| **[CRASHLYTICS_GUIDE.md](./CRASHLYTICS_GUIDE.md)**       | Firebase Crashlytics setup, usage & testing  | Enabling crash reporting or diagnosing issues |

### SVG Icon System Documentation

| File                                                               | Purpose                                 | When to Read               |
| ------------------------------------------------------------------ | --------------------------------------- | -------------------------- |
| **[HOW_TO_ADD_NEW_ICONS.md](./HOW_TO_ADD_NEW_ICONS.md)**           | Step-by-step guide to add new SVG icons | When adding new icons      |
| **[ICON_SYSTEM_DOCUMENTATION.md](./ICON_SYSTEM_DOCUMENTATION.md)** | Complete icon system reference          | For deep understanding     |
| **[QUICK_START_ICONS.md](../QUICK_START_ICONS.md)**                | 3-step quick reference                  | Quick lookup               |
| **[ICON_SETUP_COMPLETE.md](../ICON_SETUP_COMPLETE.md)**            | Initial setup summary                   | Overview of what was built |

### In-Code Documentation

| File                                    | Purpose                                               |
| --------------------------------------- | ----------------------------------------------------- |
| `src/assets/svg-broken-icons/README.md` | Usage examples and icon list                          |
| `scripts/README.md`                     | Script documentation (`convert-icons`, `apply-icons`) |

---

## 🎯 Quick Reference

### Add New Icons (3 Steps)

```bash
# 1. Add SVG file
cp your-icon.svg src/assets/svg-broken-icons/

# 2. Convert
npm run convert-icons

# 3. Use it
```

```tsx
import { YourIconIcon } from '@assets/svg-broken-icons';
<YourIconIcon width={24} height={24} color="#007AFF" />;
```

### View All Icons

Open app → **Icons** tab → Browse/Search

---

## 📖 Documentation Structure

```
docs/
├── README.md                          # This file - Documentation index
├── HOW_TO_ADD_NEW_ICONS.md           # Adding icons guide
└── ICON_SYSTEM_DOCUMENTATION.md      # Complete reference

Root level:
├── QUICK_START_ICONS.md              # Quick reference card
└── ICON_SETUP_COMPLETE.md            # Setup summary

In src/:
├── src/assets/svg-broken-icons/README.md    # Icon usage
└── scripts/README.md                         # Script docs
```

---

## 🔍 Find What You Need

### "I replaced the android/ folder — what do I need to set up?"

→ Read: [`ANDROID_NATIVE_SETUP.md`](./ANDROID_NATIVE_SETUP.md)

### "How do I set up or use crash reporting?"

→ Read: [`CRASHLYTICS_GUIDE.md`](./CRASHLYTICS_GUIDE.md)

### "Crashes aren't appearing in the Firebase console"

→ Read: [`CRASHLYTICS_GUIDE.md#troubleshooting`](./CRASHLYTICS_GUIDE.md#troubleshooting)

### "The Android build fails with a Firebase error"

→ Read: [`ANDROID_NATIVE_SETUP.md#common-build-errors--fixes`](./ANDROID_NATIVE_SETUP.md#10-common-build-errors--fixes)

### "I need to set up or change the splash screen"

→ Read: [`BOOTSPLASH_GUIDE.md`](./BOOTSPLASH_GUIDE.md)

### "I need to swap app icons for a different client"

→ Read: [`APP_ICONS_GUIDE.md`](./APP_ICONS_GUIDE.md)

```bash
npm run apply-icons -- --source=assets/ClientName/AppIcons
```

### "How do I add a new SVG icon?"

→ Read: [`HOW_TO_ADD_NEW_ICONS.md`](./HOW_TO_ADD_NEW_ICONS.md)

### "How do I use icons in my code?"

→ Read: [`ICON_SYSTEM_DOCUMENTATION.md`](./ICON_SYSTEM_DOCUMENTATION.md#using-icons)

### "What icons are available?"

→ Open app → **Icons** tab
→ Or read: `src/assets/svg-broken-icons/README.md`

### "The script isn't working"

→ Read: [`HOW_TO_ADD_NEW_ICONS.md`](./HOW_TO_ADD_NEW_ICONS.md#troubleshooting)

### "Quick cheat sheet?"

→ Read: [`QUICK_START_ICONS.md`](../QUICK_START_ICONS.md)

---

## 🎨 Icon System Overview

### Current Status

- ✅ **84 icons** converted and ready
- ✅ TypeScript support with interfaces
- ✅ Automated conversion script
- ✅ Visual icon gallery in app
- ✅ Mobile-optimized (24x24 default)
- ✅ Theme-aware (light/dark)
- ✅ Centralized exports

### Key Features

**For Developers:**

- One command to add new icons
- TypeScript autocomplete
- Customizable props (width, height, color)
- Import from single location

**For Users:**

- Visual icon browser
- Search functionality
- Code snippets
- Live preview

---

## 🚀 Common Tasks

### Add Icons

```bash
npm run convert-icons
```

### Use Icon

```tsx
import { IconName } from '@assets/svg-broken-icons';
<IconName />;
```

### Browse Icons

Open app → **Icons** tab

### Read Docs

```bash
# Open in your editor
code docs/HOW_TO_ADD_NEW_ICONS.md
```

---

## 📦 Project Integration

### Files Created

- `src/screens/IconGalleryScreen.tsx` - Icon gallery UI
- `src/assets/svg-broken-icons/index.ts` - Central exports
- `scripts/convert-svg-icons.js` - Conversion automation
- All documentation files

### Files Modified

- `src/navigation/TabNavigator.tsx` - Added Icons tab
- `package.json` - Added `convert-icons` script

### Navigation

Added "**Icons**" tab to bottom navigation for easy access.

---

## 🔄 Workflow

```
Add SVG → Run Script → Auto-Convert → Update Exports → Ready to Use
   │           │              │              │              │
   └─────→ Place in    │       │       │       └──→ Import in code
           folder      │       │       └──────→ Gallery shows it
                      │       └──────────→ Creates .tsx
                      └──────────────→ npm run convert-icons
```

---

## 💡 Tips

### Best Practices

- Always run conversion script for new SVGs
- Use default size (24x24) for consistency
- Test icons in light and dark themes
- Browse gallery before creating custom icons

### Don't Forget

- Check gallery first - icon might already exist
- Restart Metro after adding many icons
- Use descriptive names for custom icons
- Follow naming conventions in docs

---

## 📞 Support

### Self-Service

1. Check relevant documentation file
2. Look at existing icons as examples
3. Use icon gallery for live examples
4. Read script error messages

### Documentation Updates

This documentation is version-controlled with your code.

---

**Last Updated:** 2026-03-22
**Total Documentation Files:** 11
**Icon Count:** 84+
**Status:** ✅ Complete & Ready
