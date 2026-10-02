# Guest Mode: Skip Clears Local Favorites

**Date:** 2026-05-27  
**Feature:** When a logged-in user skips the guest-favorites import prompt, clear local favorites and never show the prompt again.

---

## Context

When a user browses in Guest Mode and adds favorites, those lists are stored in AsyncStorage (`@mms_favorites_lists`, `@mms_favorites_items_*`). After logging in, `checkGuestFavorites()` in `AuthContext` detects them and sets `pendingMigration`, which causes `FavoritesScreen` to render `ImportFavoritesSheet` — a bottom sheet offering to import or skip.

**Problem:** The current `handleSkip` only dismisses the sheet. It does not clear the AsyncStorage data. So on the next app launch, `loadStoredAuth()` calls `checkGuestFavorites()` again, finds the same data, and the popup reappears.

---

## Design

### Single Change

**File:** `src/components/favorites/ImportFavoritesSheet.tsx`  
**Function:** `handleSkip` (lines 97–99)

```typescript
// Before
const handleSkip = () => {
  sheetRef.current?.dismiss();
};

// After
const handleSkip = async () => {
  await clearAllLocalFavorites();
  sheetRef.current?.dismiss();
};
```

`clearAllLocalFavorites` is already imported at line 19 — no new imports needed.

### Why This Works

- `clearAllLocalFavorites()` removes `@mms_favorites_lists` and all `@mms_favorites_items_${id}` keys from AsyncStorage.
- The sheet dismisses → `handleDismiss` fires → `onDone()` → `clearPendingMigration()` clears in-memory `pendingMigration` state.
- On next login or app restart, `checkGuestFavorites()` finds zero lists → `pendingMigration` stays null → `ImportFavoritesSheet` is never rendered.

No new files, no "skip flag" in AsyncStorage, no new imports. The cleared data IS the "never ask again" mechanism.

### UX Decision

No loading state on Skip — `clearAllLocalFavorites` completes fast enough that a spinner would be distracting. The button stays enabled and dismisses immediately.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/favorites/ImportFavoritesSheet.tsx` | Make `handleSkip` async, add `await clearAllLocalFavorites()` before dismiss |

---

## Verification

1. Browse as guest and add at least one favorites list.
2. Log in with a real account.
3. The Import Favorites bottom sheet appears.
4. Tap **Skip**.
5. Sheet dismisses. Navigate away and back to Favorites tab — sheet does NOT reappear.
6. Kill and relaunch the app, log back in — sheet does NOT reappear.
7. Verify: tap **Import** path still works (lists appear in authenticated account, local storage is cleared).
