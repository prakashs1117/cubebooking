# Clean Slate Mobile App — Design Spec
**Date:** 2026-06-10  
**Status:** Approved

---

## Context

The mobile app (`mobile/`) currently contains two complete but entangled sub-apps: the original MMS (My M Safety) app with 39 screens, and a Demand Management sub-app with 12 screens. Both share infrastructure (theme, auth, components, navigation) but neither represents the direction for the new product.

The goal is to strip all existing screen content and API integrations down to a clean, working shell that a developer can immediately build new features on — with no legacy assumptions baked in. All existing reusable components, the theme system, and the icon library are preserved untouched.

---

## What We're Building

A clean React Native app with:
- A **Sign In screen** as the entry point (using the existing Demand Management sign-in screen, API call removed)
- A **bottom tab bar** with 5 tabs: Home, News, Search, Settings, Notifications (popup)
- A **side drawer** (hamburger from header) with a Profile page: avatar image, user name, logout button
- A **CustomHeader** on every main screen: hamburger left, screen title center, notification bell right
- **Placeholder content** on each tab screen — a title and a short descriptive subtitle, nothing else
- All existing **reusable components** kept in place and importable
- All old screens **archived** to `mobile/src/_archive/` (not deleted)
- **No API calls** wired into any new screen

---

## Navigation Structure

```
RootNavigator (NativeStack)
├── AuthStack (unauthenticated)
│   └── SignIn (demand/SignInScreen — static, no API)
└── DrawerNavigator (authenticated)
    ├── Drawer content → ProfileScreen
    │   ├── Avatar image (placeholder asset)
    │   ├── User name + email (hardcoded placeholder text)
    │   └── Logout button (bottom, calls logout() from AuthContext)
    └── TabNavigator (bottom tabs)
        ├── Home → HomeScreen
        ├── News → NewsScreen
        ├── Search → SearchScreen
        ├── Notifications → tapping opens NotificationModal (popup), no tab screen
        └── Settings → SettingsScreen
```

Each tab screen renders:
- `CustomHeader` (hamburger, title, notification bell)
- Centered placeholder: screen name as heading + one-line description using `CustomText`
- No data fetching, no store reads

---

## Files: Keep vs Archive vs Rewrite

### Keep Untouched (reusable infrastructure)
| Path | What it is |
|------|-----------|
| `src/components/` | All 150+ component files — untouched |
| `src/theme/` | Full theme system (colors, ThemeContext, commonStyles) |
| `src/components/icons/` | Icon registry + all icon components |
| `src/components/navigation/CustomHeader.tsx` | Primary header (hamburger + bell + title) |
| `src/components/modals/AppModal.tsx` | Base modal |
| `src/components/notifications/NotificationModal.tsx` | Notification popup |
| `src/components/notifications/NotificationBell.tsx` | Bell icon with badge |
| `src/components/common/CustomText.tsx` | Typography primitive |
| `src/components/common/CustomButton.tsx` | Button primitive |
| `src/components/common/CustomInput.tsx` | Input primitive |
| `src/context/AuthContext.tsx` | login/logout/session state |
| `src/services/storage/tokenStorage.ts` | Secure token storage |
| `src/localization/` | i18n setup + all translation files |
| `src/utils/fonts/` | Font system |
| `src/config/` | App config, breakpoints |
| `src/data/` | Static data files (kept for future use) |
| `src/stores/` | All Zustand store files (kept, just not used by new screens) |
| `src/services/` | All service files (kept, just not imported by new screens) |

### Archive (move to `src/_archive/`)
| What | Why |
|------|-----|
| `src/screens/` (all MMS screens, 39 files) | Legacy MMS app screens |
| `src/screens/demand/` (all 12 demand screens) | Legacy demand screens |
| `src/screens/examples/` | Dev example screens |
| `src/navigation/` (all existing nav files) | Replaced by new navigation |

### Rewrite / Create New
| Path | What |
|------|------|
| `src/navigation/RootNavigator.tsx` | New root: AuthStack vs DrawerNavigator |
| `src/navigation/DrawerNavigator.tsx` | Drawer wrapping TabNavigator |
| `src/navigation/TabNavigator.tsx` | 5-tab bottom bar |
| `src/navigation/types.ts` | TypeScript param lists for all navigators |
| `src/screens/new/HomeScreen.tsx` | Placeholder: "Blog Posts" |
| `src/screens/new/NewsScreen.tsx` | Placeholder: "News" |
| `src/screens/new/SearchScreen.tsx` | Placeholder: "Search" |
| `src/screens/new/SettingsScreen.tsx` | Placeholder: "Settings" |
| `src/screens/new/ProfileScreen.tsx` | Drawer profile: image + name + logout |
| `src/screens/new/SignInScreen.tsx` | Static sign-in form (no API call, hardcoded credentials or mock auth) |
| `App.tsx` | Trimmed provider stack |

---

## App.tsx Provider Stack (trimmed)

Keep only what the shell needs:
1. `StatusBar`
2. `QueryClientProvider`
3. `SafeAreaProvider`
4. `ThemeProvider`
5. `AuthProvider`
6. `BottomSheetModalProvider`
7. `NavigationContainer`
8. `RootNavigator`

Remove: `NetworkProvider`, `RegionProvider`, `ContextMenuProvider`, `QuickRateProvider`, `NetworkStatusHandler`, `ContextMenuModal`, `FirstLaunchCarousel`, `ForceUpdateModal`, `AnimatedBootSplash` — all move to `_archive` or simply removed from the provider tree (files stay).

---

## Sign In Screen Behaviour

- Renders email + password fields using `CustomInput`
- Submit button using `CustomButton`
- On submit: calls `login()` from `AuthContext` with hardcoded/mock user object (no HTTP call)
- Navigation to main app handled by `RootNavigator` reacting to auth state change
- "Forgot password?" link → no-op (shows a toast or does nothing for now)

---

## Profile Drawer Screen

- Static avatar: uses a placeholder image (`require('../assets/placeholder-avatar.png')` or a colored circle with initials)
- Displays hardcoded name "John Doe" and email "john@example.com" (or from AuthContext if available)
- Logout button at bottom: calls `logout()` from `AuthContext`, navigates back to Sign In

---

## Notification Behaviour

- Notifications tab item in the bottom bar has a bell icon
- Tapping it does NOT navigate to a screen — it opens `NotificationModal` as a modal overlay
- `NotificationModal` receives an empty list or mock data (no API call)
- Bell badge shows 0 or is hidden

---

## What Is NOT in This Spec

- No real API calls in any screen
- No real auth (mock login only)
- No feature flags logic in navigation
- No RTL-specific remounting logic (kept in i18n setup but not triggered)
- No analytics, crash reporting, push notifications
- No force update modal
- No onboarding carousel

---

## Verification

1. `cd mobile && npx react-native start` starts Metro without errors
2. iOS simulator: app shows Sign In screen
3. Entering any credentials and tapping Login navigates to Home tab
4. Bottom tab bar shows 5 tabs; tapping each navigates correctly
5. Tapping Notifications tab opens the modal overlay (not a screen)
6. Hamburger icon opens the drawer; Profile screen shows avatar + name + logout
7. Tapping Logout returns to Sign In
8. No TypeScript errors (`npx tsc --noEmit`)
