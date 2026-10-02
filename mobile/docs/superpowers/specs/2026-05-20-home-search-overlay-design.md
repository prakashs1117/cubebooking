# Home Search Overlay — Design Spec

**Date:** 2026-05-20  
**Feature:** Search bar + full-screen search overlay on HomeScreen  
**Status:** Approved for implementation

---

## Context

The HomeScreen (`HomeScreen.phone.tsx`) currently shows a placeholder "Testing" text. The goal is to give users a fast search entry-point directly from the home page — without navigating away. Tapping the search bar opens a full-screen overlay that shows recent searches as deletable chips, and live Atlas API results as the user types. This reuses the existing `searchArticles` API and `searchHistoryService` already used by SearchScreen.

---

## 1. Search Bar on HomeScreen

A **non-interactive display bar** placed below the hero carousel as a scrollable section in `HomeScreen.phone.tsx`.

- Full-width pill/bar styled with the MMS purple palette (`#4A0E8F` background or a soft purple-tinted input background `#EDE9F8`)
- Left: magnifier icon in purple
- Center: placeholder text "Search articles…" in muted gray
- Right: barcode scanner icon (purple, tappable — placeholder for future barcode integration, shows `Alert` "Coming soon" for now)
- The entire bar is wrapped in a `TouchableOpacity` — tapping anywhere (except the barcode icon) opens the overlay
- Horizontal padding 20px, vertical padding 14px, border-radius 14px
- Subtle shadow (elevation 2 on Android, shadowOpacity 0.08 on iOS)

---

## 2. Overlay Structure

A **React Native `Modal`** with `animationType="slide"` and `transparent={true}`, covering the full screen. Rendered inside `HomeScreen.phone.tsx`.

### 2a. Header Row

- Left: "Search" title (bold, 18px, theme text primary)
- Right: × close button (32×32 touchable, navigates back / dismisses modal)
- Background: theme card background, bottom border separator

### 2b. Search Input Row

- Same styling as SearchScreen: rounded input with `#EDE9F8` background
- Left: magnifier icon
- Right side (two icons):
  - Clear (×) button — visible only when `query.length > 0`, clears the input
  - Barcode scanner icon — always visible, tappable placeholder (triggers `Alert` "Coming soon")
- Auto-focused when overlay opens (`autoFocus={true}`)
- Debounced search: 400ms after last keystroke (same as SearchScreen)
- `returnKeyType="search"` triggers immediate search

### 2c. Content Area (conditional)

**Idle state** — when `query` is empty:

- Section heading row: "Recent Searches" (semibold, 14px, theme text secondary) + "Clear all" link on the right (purple, 13px)
- "Clear all" calls `clearSearchHistory()` and refreshes chip list
- Chips: wrapping `flexWrap: 'wrap'` row of pill-shaped chips
  - Each chip: `#EDE9F8` background, `#4A0E8F` text, `borderRadius: 999`, `paddingHorizontal: 12`, `paddingVertical: 6`
  - Left: query text (max 24 chars truncated with `…`)
  - Right: × icon (16px, gray) — calls `removeFromSearchHistory(query)` and refreshes
  - Tapping the chip body (not ×): immediately fires `performSearch(query)` and sets input text
- If history is empty: centered illustration area — clock icon (48px, muted) + "No recent searches" text

**Active state** — when `query.length > 0` or results are loading:

- Result count line: "X results for 'query'" (13px, gray) — hidden while loading
- `FlashList` of `ArticleCard` components (same component from `@components/search/ArticleCard`)
  - `estimatedItemSize={80}`, `keyExtractor={item => item.materialNumber}`
  - `onEndReachedThreshold={0.3}` triggers `loadMore()`
  - Footer: activity indicator while loading more pages; "No more results" text when `hasMore === false` and results exist
- Loading state (first page): centered `ActivityIndicator` with purple color
- No-results state: centered icon + "No results for 'X'" message + suggestion to try different keywords

---

## 3. Data Flow

```
HomeScreen.phone.tsx
  └─ renders: HomeSearchBar (tappable)
  └─ renders: HomeSearchOverlay (modal, visible when overlayOpen === true)
       ├─ state: query, results, totalHits, isSearching, hasSearched, offset, hasMore
       ├─ state: searchHistory (string[])
       ├─ on mount: getSearchHistory() → load chips
       ├─ on query change (debounced 400ms): searchArticles(query, 20, 0)
       ├─ on result tap: addToSearchHistory(query) → dismiss overlay → navigate ArticleDetail
       ├─ on chip tap: setQuery(chip) + searchArticles(chip, 20, 0)
       ├─ on chip ×: removeFromSearchHistory(chip) → refresh history
       └─ on "Clear all": clearSearchHistory() → setSearchHistory([])
```

**Services reused (no changes needed):**

- `searchArticles` from `@services/api/atlasSearch.service` (or wherever it lives in the project)
- `getSearchHistory`, `addToSearchHistory`, `removeFromSearchHistory`, `clearSearchHistory` from `@services/searchHistoryService`
- `ArticleCard` from `@components/search/ArticleCard`
- `FlashList` from `@shopify/flash-list`

---

## 4. New Files

| File                                          | Purpose                                                     |
| --------------------------------------------- | ----------------------------------------------------------- |
| `src/components/search/HomeSearchOverlay.tsx` | Full-screen overlay modal — owns all search + history state |
| `src/components/search/HomeSearchBar.tsx`     | Tappable display bar (non-input) rendered in HomeScreen     |

**Modified files:**

- `src/screens/HomeScreen/HomeScreen.phone.tsx` — add `overlayOpen` state, render `HomeSearchBar` + `HomeSearchOverlay`; remove the "Testing" placeholder; add the hero carousel and existing sections back

---

## 5. Navigation

Tapping a result in the overlay:

1. `addToSearchHistory(query)` — saves to AsyncStorage
2. Dismiss the overlay (`setOverlayOpen(false)`)
3. `navigation.navigate('Search', { screen: 'ArticleDetail', params: { article } })` — navigates to ArticleDetail inside the Search stack (same as SearchScreen)

Navigation type: use `useNavigation<any>()` (HomeScreen already uses this pattern).

---

## 6. Theme & Accessibility

- All colors respect `useTheme()` dark/light mode — `#EDE9F8` chip background becomes a dark equivalent in dark mode
- Input and overlay background use `theme.background.card` / `theme.background.primary`
- Text uses `theme.text.primary` / `theme.text.secondary`
- `accessibilityLabel` on the search bar, close button, and each chip's × icon
- Keyboard avoids covered content via `KeyboardAvoidingView` wrapping the overlay content

---

## 7. Verification

1. Run `npm start`, open HomeScreen on simulator
2. Hero carousel is visible; search bar appears below it
3. Tap search bar → overlay slides up, input is auto-focused
4. With empty input: recent searches appear as chips (if history exists)
5. Type a query (e.g. "acetone") → after 400ms, API call fires, results appear
6. Tap a result → overlay dismisses, ArticleDetail opens
7. Re-open overlay → "acetone" now appears as a chip
8. Tap chip × → chip disappears; tap chip body → query fires immediately
9. Tap "Clear all" → all chips disappear
10. Barcode icon → shows "Coming soon" alert
11. Test dark mode — all colors adapt correctly
