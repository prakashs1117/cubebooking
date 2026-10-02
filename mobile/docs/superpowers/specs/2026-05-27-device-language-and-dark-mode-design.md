# Device Language & Dark Mode Auto-Detection

**Date:** 2026-05-27
**Status:** Approved

## Context

The app already detects device language via `react-native-localize` on first launch and persists the preference. The theme system supports light/dark toggling and persistence, and reads the system color scheme once at cold start (`App.tsx` line 52–53 via `useColorScheme()`). However, after the app launches, changing the device from light to dark mode has no effect — the app does not react to live OS appearance changes. The user also has no way to express "always follow the system" vs. a pinned preference. This spec adds a real-time system dark mode listener and a three-way theme selector in Settings, while auditing the existing localization flow.

## Goals

1. App theme reacts live to OS dark/light mode changes
2. User can choose: follow system (default) | always light | always dark
3. Localization (device language detection) is verified correct and extended with 4 new translation keys

## Out of Scope

- Adding more languages beyond en/fr/ar
- Changing the language detection strategy (already correct)
- Any scheduling or time-based theme switching

---

## Part 1: Theme System — `ThemeContext.tsx`

### Type Changes

```typescript
export type ThemeMode = 'light' | 'dark' | 'system';
```

`ThemeContextType` gains:
- `themeMode: ThemeMode` — the user's stored preference (`'system'` | `'light'` | `'dark'`)
- `effectiveMode: 'light' | 'dark'` — the resolved mode (resolves `'system'` using OS value)
- `setTheme(mode: ThemeMode)` — already exists, now accepts `'system'`
- `isDark: boolean` — derived from `effectiveMode`, not `themeMode`

Remove `toggleTheme()` from the public API — replace with the three-way `setTheme()`. The Settings screen will stop using `toggleTheme`.

### Internal Logic

1. **State:** `const [themeMode, setThemeMode] = useState<ThemeMode>('system')`
2. **Appearance listener:** Subscribe in `useEffect` — on change, force a re-render (or store the OS scheme in a second state variable `const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme())`). Unsubscribe on unmount.
3. **`effectiveMode`:** Computed inline — if `themeMode === 'system'` use `systemScheme ?? 'light'`, else use `themeMode`.
4. **`isDark`:** `effectiveMode === 'dark'`
5. **`theme`:** Colors object from `effectiveMode`
6. **Persistence load:** AsyncStorage key `@app_theme` — now accepts `'system'` | `'light'` | `'dark'`. If not found, defaults to `'system'`. Old values `'light'` and `'dark'` continue to work unchanged.
7. **Persistence save:** Save `themeMode` (not `effectiveMode`) on every change.

### `App.tsx` Simplification

Remove the `useColorScheme()` call and `initialTheme` derivation (lines 52–53). Remove the `initialTheme` prop passed to `ThemeProvider` — the context now initializes itself from AsyncStorage + Appearance internally.

---

## Part 2: Settings Screen — Three-Segment Picker

**File:** `src/screens/SettingsScreenTabbed.tsx`

### Change the theme row

Replace the binary `Switch` (line 778–783) with a three-segment control component.

**Option A — inline segment buttons:** Three `TouchableOpacity` tiles in a row within the settings row. Each tile shows a label (System / Light / Dark). The selected tile gets a highlighted background using `theme.button.primary.background`.

**Option B — existing pattern:** If the app already has a segmented control component (check `src/components/`), use that.

The row's `value` subtitle changes from `'Dark' | 'Light'` to a descriptive string:
- Mode `'system'` + OS dark → `t('settings.themeFollowingSystem') + ' (Dark)'`
- Mode `'system'` + OS light → `t('settings.themeFollowingSystem') + ' (Light)'`
- Mode `'light'` → `t('settings.themeLight')`
- Mode `'dark'` → `t('settings.themeDark')`

### Update `useTheme()` destructuring at line 82

```typescript
const { theme, isDark, themeMode, effectiveMode, setTheme } = useTheme();
```

---

## Part 3: Translation Keys

Add to all three translation files (`en.json`, `fr.json`, `ar.json`):

| Key | English | French | Arabic |
|-----|---------|--------|--------|
| `settings.themeSystem` | System | Système | النظام |
| `settings.themeLight` | Light | Clair | فاتح |
| `settings.themeDark` | Dark | Sombre | داكن |
| `settings.themeFollowingSystem` | Following system | Suivre le système | تتبع النظام |

---

## Part 4: Localization Audit + Unsupported Language Fallback

### Unsupported Language Fallback (Required Fix)

If the device language is not in the supported set (`['en', 'fr', 'ar']`), the app **must** fall back to English (`'en'`). This must be explicit and guaranteed.

Current `getDeviceLanguage()` in `i18n.ts` already has a fallback to `'en'` at the end of the function, but the logic must be confirmed to handle all edge cases:
- Device locale `'de'` → not in supported list → fall back to `'en'`
- Device locale `'zh-CN'` → not in supported list → fall back to `'en'`
- Device locale `'fr-CA'` → language tag `'fr'` IS in supported list → use `'fr'`
- Device locale `null` / unavailable → fall back to `'en'`

Verify `SUPPORTED_LANGUAGES` constant in `i18n.ts` is the single source of truth and that `getDeviceLanguage()` always returns a value from that array (never an unsupported code).

If `RNLocalize.findBestLanguageTag(SUPPORTED_LANGUAGES)` returns `null` (no match), the function must explicitly return `'en'`. Audit and harden this path.

### Audit Checklist

- `src/localization/i18n.ts` — confirm `getDeviceLanguage()` never returns an unsupported language code
- `src/localization/i18n.ts` — confirm `i18nReady` Promise resolves only after device language is applied
- `App.tsx` — confirm `i18nReady.then(...)` resolves before any locale-dependent UI shows
- Settings language picker (`handleLanguageChange`) — confirm it calls `changeLanguage()` then updates `localeStore` in the right order (no race condition)

No structural changes expected beyond hardening the fallback path.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/theme/ThemeContext.tsx` | Add `'system'` mode, Appearance listener, effectiveMode, remove toggleTheme |
| `src/screens/SettingsScreenTabbed.tsx` | Replace Switch with three-segment picker, update useTheme destructuring |
| `src/localization/translations/en.json` | Add 4 theme keys |
| `src/localization/translations/fr.json` | Add 4 theme keys (French) |
| `src/localization/translations/ar.json` | Add 4 theme keys (Arabic) |
| `App.tsx` | Remove `useColorScheme()` call + `initialTheme` derivation + prop |

---

## Verification

1. **Dark mode live sync:** On simulator, set device to Dark Mode while app is open → app theme switches immediately without restart
2. **Pinned override:** Set theme to "Light" in Settings → switch device to Dark Mode → app stays light
3. **System default:** Set theme to "System" → switch device theme → app follows
4. **Cold launch:** Kill app, set device Dark Mode, relaunch → app starts dark (no flash of wrong theme)
5. **Persistence:** Change to "Dark", kill app, relaunch → Settings shows Dark, app is dark
6. **Language:** Change device language to French → relaunch app → app UI is in French
7. **Translation keys:** All 4 new keys visible in Settings under Appearance row on en/fr/ar
8. **RTL:** Change to Arabic → app relaunches in RTL layout
9. **Unsupported language fallback:** Set device language to German (de) or Spanish (es) → relaunch → app starts in English, not a missing translation or crash
