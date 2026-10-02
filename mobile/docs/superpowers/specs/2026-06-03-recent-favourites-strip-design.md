# Recent Favourites Strip — Design Spec

**Date:** 2026-06-03  
**Status:** Approved

## Context

The HomeScreen currently shows a "Recently Viewed" horizontal strip (`RecentArticlesStrip`) sourced from article view history. Users want a parallel strip showing their 10 most recently added favourite articles, with a "View All" link to the Favorites tab. Must work on both phone and iPad, and must handle both authenticated (API-backed) and guest (AsyncStorage-only) users.

---

## Data Strategy

### Authenticated users
- Source: existing `useFavoriteLists()` TanStack Query hook (`staleTime` 2 min, `gcTime` 10 min)
- No new API endpoints or backend changes required
- Flatten `RemoteArticle[]` across all lists → deduplicate by `materialNumber` → `slice(0, 10)`
- Array order from the API reflects add order (server prepends newest)

### Guest users
- Source: `favoritesListService.getFavoriteLists()` + `getListArticles(listId)` per list (AsyncStorage)
- Same flatten + dedup + slice logic
- Array order reflects add order (local service prepends newest at index 0)

### Shared output shape
```ts
interface RecentFavourite {
  materialNumber: string;
  articleName: string;
  substance?: string;
  casNumber?: string;
  articleNumber?: string;
  brand?: string;
}
```

---

## New Hook: `useRecentFavourites`

**File:** `src/hooks/useRecentFavourites.ts`

```
useRecentFavourites(limit = 10): {
  articles: RecentFavourite[];
  isLoading: boolean;
  isEmpty: boolean;
}
```

- Reads `isAuthenticated` (not guest) from `AuthContext`
- Authenticated path: consumes `useFavoriteLists()` result (already cached)
- Guest path: `useEffect` on mount → AsyncStorage reads → local state
- Both paths: flatten → dedup by `materialNumber` → `slice(0, limit)`
- Returns `isEmpty: true` when article count is 0 (strip hidden in this case)

---

## New Component: `RecentFavouritesStrip`

**File:** `src/components/favorites/RecentFavouritesStrip.tsx`

Mirrors `RecentArticlesStrip` exactly in structure and dimensions:

| Property | Value |
|----------|-------|
| Card size | 160 × 88 px |
| List type | `FlashList` horizontal |
| Item separator | 10 px gap |
| Section header | "Recently Favourited" + "View All" |
| "View All" destination | `Favorites` tab root |
| Article navigation | `Search → ArticleDetail` (same as RecentArticlesStrip) |
| Bookmark icon | Filled (always — item is already a favourite) |
| Empty state | Strip not rendered |
| Loading state | Strip not rendered |

Card chip content (same layout as history chips):
- Article name (2 lines, truncated)
- Material number (caption)
- Filled bookmark badge (top-right)

---

## HomeScreen Integration

Both `HomeScreen.phone.tsx` and `HomeScreen.tablet.tsx` receive identical changes:

1. Import and call `useRecentFavourites(10)`
2. Render `<RecentFavouritesStrip>` below the existing `<RecentArticlesStrip>`
3. Conditional: only render when `!isEmpty`

**Layout order (phone & tablet):**
```
SearchBar
SearchPromptCard
RecentArticlesStrip        ← existing (view history)
RecentFavouritesStrip      ← NEW (favourites)
```

Tablet layout: the existing centered column wrapper (`MAX_CONTENT_WIDTH = 640px`, `HORIZONTAL_PADDING = 24px`) applies automatically — no extra responsive work needed.

---

## Localization

Add to all 9 translation files (`en`, `de`, `es`, `fr`, `it`, `ja`, `pt`, `zh`, `ar`):

```json
"home": {
  "recentFavourites": "Recently Favourited"
}
```

(`home.viewAll` key already exists.)

**Translation files location:** `android/app/src/main/res/raw/src_localization_translations_*.json`

---

## Files Changed

| Action | Path |
|--------|------|
| Create | `src/hooks/useRecentFavourites.ts` |
| Create | `src/components/favorites/RecentFavouritesStrip.tsx` |
| Modify | `src/screens/HomeScreen/HomeScreen.phone.tsx` |
| Modify | `src/screens/HomeScreen/HomeScreen.tablet.tsx` |
| Modify | `android/app/src/main/res/raw/src_localization_translations_*.json` (9 files) |

---

## Verification

1. **Phone — authenticated:** Log in, add articles to favourites, open HomeScreen → strip appears below "Recently Viewed" with correct articles in add order, newest first.
2. **Phone — guest:** Add articles as guest, open HomeScreen → strip appears from AsyncStorage.
3. **Tablet — authenticated & guest:** Same as above, strip renders in centered 640px column.
4. **Empty state:** User with no favourites → strip absent (no empty section header rendered).
5. **"View All":** Tapping navigates to Favorites tab root (`FavoritesScreen`).
6. **Article tap:** Navigates to `ArticleDetail` via Search stack (same as history strip).
7. **Dark mode:** Cards and icons use theme colors correctly.
8. **Localization:** Switch device language, confirm strip header translates.
