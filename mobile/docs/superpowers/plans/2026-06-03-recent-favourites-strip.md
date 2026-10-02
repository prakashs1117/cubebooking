# Recent Favourites Strip — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Recently Favourited" horizontal article strip to the HomeScreen (phone & tablet) that shows the 10 most recently added favourite articles, with a "View All" link to the Favorites tab.

**Architecture:** A new `useRecentFavourites` hook abstracts the dual data path — authenticated users pull from the existing TanStack Query `useFavoriteLists` cache, guest users read from AsyncStorage via `favoritesListService`. Both paths flatten + deduplicate articles across all lists and return the first 10. A new `RecentFavouritesStrip` component mirrors `RecentArticlesStrip` exactly in structure and renders the strip; both `HomeScreen.phone.tsx` and `HomeScreen.tablet.tsx` add the strip below the existing "Recently Viewed" strip.

**Tech Stack:** React Native, TypeScript, TanStack Query v5, AsyncStorage, FlashList, react-i18next, Reanimated 3, react-navigation

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/hooks/useRecentFavourites.ts` | Dual-path data hook (auth + guest) |
| Create | `src/components/favorites/RecentFavouritesStrip.tsx` | Horizontal strip UI component |
| Modify | `src/screens/HomeScreen/HomeScreen.phone.tsx` | Add strip below RecentArticlesStrip |
| Modify | `src/screens/HomeScreen/HomeScreen.tablet.tsx` | Add strip below RecentArticlesStrip |
| Modify | `android/app/src/main/res/raw/src_localization_translations_en.json` | Add `home.recentFavourites` key |
| Modify | `android/app/src/main/res/raw/src_localization_translations_de.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_es.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_fr.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_it.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_ja.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_pt.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_zh.json` | Add translation |
| Modify | `android/app/src/main/res/raw/src_localization_translations_ar.json` | Add translation |

---

## Task 1: Create `useRecentFavourites` hook

**Files:**
- Create: `src/hooks/useRecentFavourites.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/useRecentFavourites.ts
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { getFavoriteLists, getListArticles } from '@services/favoritesListService';
import type { Article } from '@components/search/ArticleCard';

export interface RecentFavourite {
  materialNumber: string;
  articleName: string;
  substance?: string;
  casNumber?: string;
  articleNumber?: string;
  brand?: string;
}

function dedupeByMaterialNumber(articles: RecentFavourite[]): RecentFavourite[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    if (seen.has(a.materialNumber)) return false;
    seen.add(a.materialNumber);
    return true;
  });
}

export function useRecentFavourites(limit = 10): {
  articles: RecentFavourite[];
  isLoading: boolean;
  isEmpty: boolean;
} {
  const { isGuest, user } = useAuth();
  const isLoggedIn = !isGuest && !!user;

  // ── Authenticated path ────────────────────────────────────────────────────
  const { data: remoteLists = [], isLoading: remoteLoading } = useFavoriteLists(isLoggedIn);

  const remoteArticles = useMemo<RecentFavourite[]>(() => {
    if (!isLoggedIn) return [];
    const flat = remoteLists.flatMap(list =>
      (list.articles ?? []).map(a => ({
        materialNumber: a.materialNumber,
        articleName: a.articleName,
        substance: a.substance,
        casNumber: a.casNumber,
        articleNumber: a.articleNumber,
        brand: a.system,
      })),
    );
    return dedupeByMaterialNumber(flat).slice(0, limit);
  }, [isLoggedIn, remoteLists, limit]);

  // ── Guest path ────────────────────────────────────────────────────────────
  const [guestArticles, setGuestArticles] = useState<RecentFavourite[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) return;
    let cancelled = false;
    setGuestLoading(true);
    (async () => {
      try {
        const lists = await getFavoriteLists();
        const all: Article[] = [];
        for (const list of lists) {
          const articles = await getListArticles(list.id);
          all.push(...articles);
        }
        if (!cancelled) {
          setGuestArticles(
            dedupeByMaterialNumber(
              all.map(a => ({
                materialNumber: a.materialNumber,
                articleName: a.articleName,
                substance: a.substance,
                casNumber: a.casNumber,
                articleNumber: a.articleNumber,
                brand: a.brand,
              })),
            ).slice(0, limit),
          );
        }
      } finally {
        if (!cancelled) setGuestLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, limit]);

  const articles = isLoggedIn ? remoteArticles : guestArticles;
  const isLoading = isLoggedIn ? remoteLoading : guestLoading;

  return { articles, isLoading, isEmpty: articles.length === 0 };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep useRecentFavourites
```

Expected: no output (no errors for this file)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRecentFavourites.ts
git commit -m "feat(home): add useRecentFavourites hook with auth/guest dual path"
```

---

## Task 2: Create `RecentFavouritesStrip` component

**Files:**
- Create: `src/components/favorites/RecentFavouritesStrip.tsx`

This mirrors `RecentArticlesStrip` exactly. The key differences:
- Accepts `RecentFavourite[]` instead of `HistoryArticle[]`
- Section title uses `t('home.recentFavourites')` instead of `t('history.recentlyViewed')`
- "View All" calls `onViewAll` which navigates to Favorites tab (not History)
- Bookmark badge is always shown (item is already a favourite — no need to check)

- [ ] **Step 1: Create the component file**

```typescript
// src/components/favorites/RecentFavouritesStrip.tsx
import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import { navigationRef } from '@navigation/navigationRef';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';
import BookmarkIcon from '@components/icons/BookmarkIcon';
import type { RecentFavourite } from '@hooks/useRecentFavourites';

const CARD_WIDTH = 160;
const CARD_HEIGHT = 88;

interface Props {
  articles: RecentFavourite[];
  onViewAll: () => void;
}

const FavouriteChip: React.FC<{
  item: RecentFavourite;
  onPress: (item: RecentFavourite) => void;
}> = ({ item, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: theme.background.secondary }]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={styles.chipStrip} />
      <View style={styles.chipContent}>
        <BodyText
          style={[styles.chipName, { color: theme.text.primary }]}
          numberOfLines={2}
        >
          {item.articleName}
        </BodyText>
        <CaptionText
          style={[styles.chipMaterial, { color: theme.text.tertiary }]}
          numberOfLines={1}
        >
          {item.materialNumber}
        </CaptionText>
      </View>
      <View style={styles.bookmarkBadge} pointerEvents="none">
        <BookmarkIcon size={12} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
};

const RecentFavouritesStrip: React.FC<Props> = ({ articles, onViewAll }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handlePress = useCallback((item: RecentFavourite) => {
    navigationRef.navigate('Search', {
      screen: 'ArticleDetail',
      params: {
        article: {
          materialNumber: item.materialNumber,
          articleName: item.articleName,
          substance: item.substance,
          casNumber: item.casNumber,
          articleNumber: item.articleNumber,
          brand: item.brand,
        },
      },
    });
  }, []);

  if (articles.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <BodyText style={[styles.sectionTitle, { color: theme.text.primary }]}>
          {t('home.recentFavourites')}
        </BodyText>
        <TouchableOpacity
          onPress={onViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CaptionText
            style={[
              styles.viewAll,
              { color: isDark ? BaseColors.white : BaseColors.merckPurple },
            ]}
          >
            {t('common.viewAll')}
          </CaptionText>
        </TouchableOpacity>
      </View>
      <FlashList
        data={articles}
        horizontal
        keyExtractor={item => item.materialNumber}
        renderItem={({ item }) => (
          <FavouriteChip item={item} onPress={handlePress} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        estimatedItemSize={CARD_WIDTH}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontWeight: '600',
  },
  viewAll: { fontSize: 13, fontFamily: getFontStyle('body').fontFamily },
  list: { paddingHorizontal: 16, paddingBottom: 4 },
  separator: { width: 10 },
  chip: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chipStrip: { width: 4, backgroundColor: BaseColors.merckPurple },
  chipContent: { flex: 1, padding: 10, justifyContent: 'center' },
  bookmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BaseColors.merckPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  chipMaterial: { fontSize: 11 },
});

export default RecentFavouritesStrip;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep RecentFavouritesStrip
```

Expected: no output (no errors for this file)

- [ ] **Step 3: Commit**

```bash
git add src/components/favorites/RecentFavouritesStrip.tsx
git commit -m "feat(home): add RecentFavouritesStrip component"
```

---

## Task 3: Wire strip into `HomeScreen.phone.tsx`

**Files:**
- Modify: `src/screens/HomeScreen/HomeScreen.phone.tsx`

- [ ] **Step 1: Add imports**

In `src/screens/HomeScreen/HomeScreen.phone.tsx`, add these two imports after the existing `RecentArticlesStrip` import line:

```typescript
import RecentFavouritesStrip from '@components/favorites/RecentFavouritesStrip';
import { useRecentFavourites } from '@hooks/useRecentFavourites';
```

- [ ] **Step 2: Call the hook inside the component**

Inside `HomeScreenPhone`, add this line directly after the `recentArticles` state declaration:

```typescript
const { articles: recentFavourites } = useRecentFavourites(10);
```

- [ ] **Step 3: Add the strip to JSX**

In the `Animated.ScrollView` content, add `RecentFavouritesStrip` immediately after the closing `}` of the existing `recentArticles.length > 0 && (...)` block:

```tsx
{/* Recently favourited */}
{recentFavourites.length > 0 && (
  <View style={styles.recentSection}>
    <RecentFavouritesStrip
      articles={recentFavourites}
      onViewAll={() => navigation.navigate('Favorites')}
    />
  </View>
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -i "HomeScreen.phone"
```

Expected: no output

- [ ] **Step 5: Commit**

```bash
git add src/screens/HomeScreen/HomeScreen.phone.tsx
git commit -m "feat(home): add recent favourites strip to phone home screen"
```

---

## Task 4: Wire strip into `HomeScreen.tablet.tsx`

**Files:**
- Modify: `src/screens/HomeScreen/HomeScreen.tablet.tsx`

- [ ] **Step 1: Add imports**

In `src/screens/HomeScreen/HomeScreen.tablet.tsx`, add these two imports after the existing `RecentArticlesStrip` import line:

```typescript
import RecentFavouritesStrip from '@components/favorites/RecentFavouritesStrip';
import { useRecentFavourites } from '@hooks/useRecentFavourites';
```

- [ ] **Step 2: Call the hook inside the component**

Inside `HomeScreenTablet`, add this line directly after the `recentArticles` state declaration:

```typescript
const { articles: recentFavourites } = useRecentFavourites(10);
```

- [ ] **Step 3: Add the strip to JSX**

Inside the `<View style={styles.columnWrapper}>`, add `RecentFavouritesStrip` immediately after the closing `}` of the existing `recentArticles.length > 0 && (...)` block:

```tsx
{/* Recently favourited */}
{recentFavourites.length > 0 && (
  <View style={styles.recentSection}>
    <RecentFavouritesStrip
      articles={recentFavourites}
      onViewAll={() => navigation.navigate('Favorites')}
    />
  </View>
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -i "HomeScreen.tablet"
```

Expected: no output

- [ ] **Step 5: Commit**

```bash
git add src/screens/HomeScreen/HomeScreen.tablet.tsx
git commit -m "feat(home): add recent favourites strip to tablet home screen"
```

---

## Task 5: Add localization keys (9 languages)

**Files:**
- Modify: all 9 `src_localization_translations_*.json` files

- [ ] **Step 1: Add key to English**

In `android/app/src/main/res/raw/src_localization_translations_en.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Recently Favourited"
```

- [ ] **Step 2: Add key to German**

In `android/app/src/main/res/raw/src_localization_translations_de.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Zuletzt als Favorit markiert"
```

- [ ] **Step 3: Add key to Spanish**

In `android/app/src/main/res/raw/src_localization_translations_es.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Añadidos recientemente a favoritos"
```

- [ ] **Step 4: Add key to French**

In `android/app/src/main/res/raw/src_localization_translations_fr.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Récemment ajoutés aux favoris"
```

- [ ] **Step 5: Add key to Italian**

In `android/app/src/main/res/raw/src_localization_translations_it.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Aggiunti di recente ai preferiti"
```

- [ ] **Step 6: Add key to Japanese**

In `android/app/src/main/res/raw/src_localization_translations_ja.json`, inside the `"home"` object, add:

```json
"recentFavourites": "最近のお気に入り"
```

- [ ] **Step 7: Add key to Portuguese**

In `android/app/src/main/res/raw/src_localization_translations_pt.json`, inside the `"home"` object, add:

```json
"recentFavourites": "Adicionados recentemente aos favoritos"
```

- [ ] **Step 8: Add key to Chinese**

In `android/app/src/main/res/raw/src_localization_translations_zh.json`, inside the `"home"` object, add:

```json
"recentFavourites": "最近收藏"
```

- [ ] **Step 9: Add key to Arabic**

In `android/app/src/main/res/raw/src_localization_translations_ar.json`, inside the `"home"` object, add:

```json
"recentFavourites": "المفضلة المضافة مؤخراً"
```

- [ ] **Step 10: Commit all translation files**

```bash
git add android/app/src/main/res/raw/src_localization_translations_*.json
git commit -m "feat(i18n): add recentFavourites translation key for all 9 languages"
```

---

## Task 6: Full TypeScript compile check

- [ ] **Step 1: Run full compile**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1
```

Expected: no errors (or only pre-existing errors unrelated to this feature)

---

## Verification Checklist

After all tasks complete, verify manually:

1. **Phone — authenticated:** Log in, add articles to any favourite list → open HomeScreen → "Recently Favourited" strip appears below "Recently Viewed" showing those articles, newest first. Bookmark badge visible on every chip.
2. **Phone — guest:** Skip login (Continue as Guest), add articles to a local list → HomeScreen shows strip from AsyncStorage.
3. **Tablet — authenticated & guest:** Same as above. Strip renders inside the 640px centered column.
4. **Empty state:** User with zero favourites → strip absent, no empty section header shown.
5. **"View All":** Tap "View All" → navigates to Favorites tab (FavoritesScreen).
6. **Article tap:** Tap a chip → navigates to ArticleDetail via Search stack.
7. **Dark mode:** Chips use `theme.background.secondary`, text uses `theme.text.primary/tertiary`, view-all link is white.
8. **Localization:** Switch device language to French → strip header reads "Récemment ajoutés aux favoris".
