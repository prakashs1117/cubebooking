# Guest Mode Skip Clears Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user taps "Skip" on the guest-favorites import prompt, clear all local guest favorites from AsyncStorage so the popup never appears again.

**Architecture:** `handleSkip` in `ImportFavoritesSheet.tsx` is made async and calls `clearAllLocalFavorites()` before dismissing the sheet. The cleared data is the "never ask again" mechanism — on next login `checkGuestFavorites()` finds nothing and `pendingMigration` stays null.

**Tech Stack:** React Native, `@react-native-async-storage/async-storage`, `@gorhom/bottom-sheet`, TanStack React Query, Jest/React Native Testing Library

---

### Task 1: Fix `handleSkip` to clear local favorites

**Files:**
- Modify: `src/components/favorites/ImportFavoritesSheet.tsx:97-99`

- [ ] **Step 1: Make `handleSkip` async and call `clearAllLocalFavorites` before dismiss**

In `src/components/favorites/ImportFavoritesSheet.tsx`, replace lines 97–99:

```typescript
// BEFORE
const handleSkip = () => {
  sheetRef.current?.dismiss();
};

// AFTER
const handleSkip = async () => {
  await clearAllLocalFavorites();
  sheetRef.current?.dismiss();
};
```

`clearAllLocalFavorites` is already imported at line 19 — no import changes needed.

- [ ] **Step 2: Verify TypeScript compiles without errors**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/favorites/ImportFavoritesSheet.tsx
git commit -m "fix: skip import prompt clears local guest favorites so it never re-appears"
```

---

### Task 2: Verify end-to-end flow manually

**Files:** No code changes — manual verification steps.

- [ ] **Step 1: Start the app in guest mode**

Tap "Continue Without Registering" on the Sign In screen.

- [ ] **Step 2: Add a favorites list as guest**

Navigate to Favorites tab → create a new list, add at least one article.

- [ ] **Step 3: Log in with a real account**

Tap More → Sign In → enter valid credentials.

- [ ] **Step 4: Confirm the import sheet appears**

After login, navigate to Favorites tab. The "Import your saved lists?" bottom sheet should appear showing the guest list(s).

- [ ] **Step 5: Tap Skip**

Sheet should dismiss immediately with no loading state.

- [ ] **Step 6: Confirm sheet does not re-appear**

Navigate away from Favorites and back — sheet must NOT appear again.

- [ ] **Step 7: Kill and relaunch the app**

Force-close the app and reopen. Log back in (or the session restores automatically). Navigate to Favorites tab — sheet must NOT appear.

- [ ] **Step 8: Verify Import path still works (regression check)**

Repeat steps 1–4 with a fresh guest session. This time tap **Import Lists**. Confirm the lists appear in the authenticated account's Favorites and the sheet does not reappear.

---

## Self-Review

**Spec coverage:**
- ✅ Skip clears local storage — Task 1 Step 1
- ✅ Never ask again — covered by cleared data + Task 2 Steps 6–7
- ✅ Import path regression — Task 2 Step 8

**Placeholder scan:** None found.

**Type consistency:** `clearAllLocalFavorites` matches the import at line 19 of the file. `handleSkip` return type becomes `Promise<void>` — compatible with `onPress` which accepts both sync and async handlers in React Native.
