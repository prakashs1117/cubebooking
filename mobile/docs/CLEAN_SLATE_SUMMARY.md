# Clean Slate Mobile App — Summary

**Date:** 2026-06-10  
**Branch:** setup/commonapp  
**Commit:** f78ab13

## What Changed

Your mobile app has been completely restructured as a clean slate. All legacy code is preserved but archived, and a new minimal working app shell is in place.

---

## New App Structure

### Navigation
- **Entry:** Sign In screen (static, no API calls)
- **After login:** 5-tab bottom navigation inside a side drawer
  - Home → "Blog posts coming soon"
  - News → "News coming soon"
  - Search → "Search coming soon"
  - Notifications → Opens modal overlay (bell icon)
  - Settings → "Settings coming soon"
- **Drawer:** Profile page with user info + Logout button

### File Structure

**New files created:**
```
src/navigation/
  ├── RootNavigator.tsx (Auth vs Main)
  ├── DrawerNavigator.tsx (Drawer wrapping tabs)
  ├── TabNavigator.tsx (5-tab bottom bar)
  └── types.ts (TypeScript types)

src/screens/new/
  ├── SignInScreen.tsx
  ├── HomeScreen.tsx
  ├── NewsScreen.tsx
  ├── SearchScreen.tsx
  ├── SettingsScreen.tsx
  └── ProfileScreen.tsx

App.tsx (trimmed from 232 lines to ~36 lines)
```

**Archived (not deleted):**
```
src/_archive/
  ├── screens/mms/ (39 MMS screens)
  ├── screens/demand/ (12 Demand screens)
  ├── screens/examples/ (3 example screens)
  └── navigation/ (9 legacy navigation files)
```

---

## What's Kept & Available

### All Reusable Components
Every component from the old app is still in `src/components/` — **150+ files** ready to import:
- `CustomText`, `CustomButton`, `CustomInput` — UI primitives
- `CustomHeader` — app header with hamburger + bell + title
- `NotificationModal`, `NotificationBell` — notification UI
- Icon library — 50+ pre-built icons (HomeIcon, SearchIcon, etc.)
- All domain-specific components (events, favorites, modals, etc.)

### Theme System
- Full light/dark theme support
- `useTheme()` hook — use in any screen
- Color system in `src/theme/colors.ts`
- Common styles factory

### State Management
- `AuthContext` — login/logout (already integrated)
- All Zustand stores (available but not used yet)
- TanStack React Query (ready for data fetching)

### i18n / Localization
- 9 language support (en, fr, ar, de, it, es, zh, ja, pt)
- RTL support for Arabic
- `i18n.t('key')` ready to use

---

## API Integration: How to Add It

The new screens have **no API calls**. To add authentication and features:

### Step 1: Wire Up Sign In
Edit `src/screens/new/SignInScreen.tsx`:
- The form already calls `authContext?.login({ email, password })`
- The `login()` function will make the HTTP request via `AuthContext`

### Step 2: Add Home Feed
Edit `src/screens/new/HomeScreen.tsx`:
- Import a service: `import { articleService } from '@services/api/article.service'`
- Use TanStack Query: `const { data } = useQuery({ queryKey: ['articles'], queryFn: () => articleService.list() })`
- Render the data

### Step 3: Add More Features
Each screen is a clean slate. Copy the pattern above to:
- Fetch data → display it
- Add state for user interactions
- Use existing components from `src/components/`

---

## Testing the App

### Start Dev Server
```bash
cd mobile
npx react-native start --reset-cache
```

### Run on iOS Simulator
```bash
npx react-native run-ios
```

### Expected Flow
1. App shows Sign In screen
2. Enter any email/password → tap Login
3. On success → Home tab appears with bottom navigation
4. Tap tabs → each screen shows placeholder text
5. Tap bell icon → notification modal opens
6. Tap hamburger (top left) → drawer slides in with Profile
7. Profile shows "John Doe" + Logout button
8. Tap Logout → returns to Sign In

---

## Clean Code Rules

- **No relative imports** — use absolute paths: `import X from '@/components/MyComponent'`
- **No API calls in screens** — use services + TanStack Query
- **Keep it simple** — this is a blank canvas; don't over-engineer early
- **Reuse components** — 150+ components are already available

---

## What's Different From Before

| Before | After |
|--------|-------|
| 51 screens total | 6 screens (minimal) |
| Two entangled sub-apps | Single clean app |
| Complex provider stack | 8 core providers |
| Feature flags everywhere | None (just plain screens) |
| Network status detection | Removed |
| Onboarding carousel | Removed |
| Force update modal | Removed |
| Multiple navigation stacks | 1 root, 1 drawer, 1 tab bar |

---

## Next Steps

1. **Start the dev server** — make sure Metro builds clean
2. **Test on simulator** — verify the sign-in flow works
3. **Plan your first feature** — pick one (blog post feed, search results, etc.)
4. **Copy screen patterns** — HomeScreen is a template for adding data fetching
5. **Extend components** — the UI library is ready to customize

---

## Files You'll Work On Most

- `src/screens/new/` — Your screen implementations
- `src/navigation/` — To add new screens or change layout
- `src/services/api/` — To add API endpoints (already has 13+ services)
- `src/components/` — To customize or extend UI

Everything else is supporting infrastructure — you rarely need to touch it.

---

## Questions?

- **"How do I add a new screen?"** → Copy `HomeScreen.tsx`, rename it, add it to TabNavigator
- **"How do I fetch data?"** → Use TanStack Query + a service (see `useHook` examples in archived demand screens)
- **"How do I use the theme?"** → Call `useTheme()` in any screen, use `theme.colors.*`
- **"Can I use Redux / other state?"** → Yes, the app structure supports it; add providers in App.tsx

---

**You're ready to build.**
