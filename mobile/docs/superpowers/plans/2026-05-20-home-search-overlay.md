# Home Search Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tappable search bar below the hero carousel on HomeScreen that opens a full-screen overlay with recent search chips (deletable), live Atlas API results via FlashList, and navigation to ArticleDetail on result tap.

**Architecture:** Two new components (`HomeSearchBar`, `HomeSearchOverlay`) live in `src/components/search/`. `HomeScreen.phone.tsx` owns the `overlayOpen` boolean state and renders both. `HomeSearchOverlay` owns all search + history state internally, reusing `searchArticles` and `searchHistoryService` unchanged.

**Tech Stack:** React Native Modal, FlashList (@shopify/flash-list), AsyncStorage (via searchHistoryService), React Navigation, Reanimated (existing scroll), useTheme, i18next.

---

## File Map

| Action | File                                          | Responsibility                                                         |
| ------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| Create | `src/components/search/HomeSearchBar.tsx`     | Tappable display bar — no input, fires `onPress`                       |
| Create | `src/components/search/HomeSearchOverlay.tsx` | Full-screen modal: history chips + live search results                 |
| Modify | `src/components/search/index.ts`              | Export both new components                                             |
| Modify | `src/screens/HomeScreen/HomeScreen.phone.tsx` | Add `overlayOpen` state, render bar + overlay, restore hero + sections |

---

## Task 1: HomeSearchBar component

**Files:**

- Create: `src/components/search/HomeSearchBar.tsx`

- [ ] **Step 1: Create the component file**

```typescript
// src/components/search/HomeSearchBar.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';

const MMS_PURPLE = '#4A0E8F';
const INPUT_BG = '#EDE9F8';

interface HomeSearchBarProps {
  onPress: () => void;
  onBarcodePress: () => void;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  onPress,
  onBarcodePress,
}) => {
  const { theme, isDark } = useTheme();

  const barBg = isDark ? 'rgba(255,255,255,0.08)' : INPUT_BG;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'transparent';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF';

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: isDark
            ? theme.background.card
            : theme.background.primary,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.bar, { backgroundColor: barBg, borderColor }]}
        accessibilityRole="button"
        accessibilityLabel="Open search"
      >
        {/* Search icon */}
        <Icon
          name="search"
          size={20}
          color={MMS_PURPLE}
          style={styles.searchIcon}
        />

        {/* Placeholder text */}
        <BodyText
          style={[
            styles.placeholder,
            {
              color: placeholderColor,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
          numberOfLines={1}
        >
          Search articles…
        </BodyText>

        {/* Barcode icon — placeholder, wired separately */}
        <TouchableOpacity
          onPress={onBarcodePress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Scan barcode (coming soon)"
          style={styles.barcodeBtn}
        >
          <Icon name="barcode" size={22} color={MMS_PURPLE} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  barcodeBtn: {
    marginLeft: 8,
    padding: 4,
  },
});

export default HomeSearchBar;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep HomeSearchBar
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/search/HomeSearchBar.tsx
git commit -m "feat: add HomeSearchBar tappable display component"
```

---

## Task 2: HomeSearchOverlay — skeleton + history chips

**Files:**

- Create: `src/components/search/HomeSearchOverlay.tsx`

- [ ] **Step 1: Create the overlay skeleton with history state**

```typescript
// src/components/search/HomeSearchOverlay.tsx
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import ArticleCard, { Article } from '@components/search/ArticleCard';
import { searchArticles } from '@services/api/atlasSearch.service';
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from '@services/searchHistoryService';

const MMS_PURPLE = '#4A0E8F';
const INPUT_BG = '#EDE9F8';
const DEBOUNCE_MS = 400;
const SEARCH_LIMIT = 20;

interface HomeSearchOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const HomeSearchOverlay: React.FC<HomeSearchOverlayProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef('');

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // History state
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const loadHistory = useCallback(async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  }, []);

  // Load history when overlay opens
  useEffect(() => {
    if (visible) {
      loadHistory();
      // Auto-focus after modal animates in
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    } else {
      // Reset state on close
      setQuery('');
      setResults([]);
      setTotalHits(0);
      setHasSearched(false);
      setIsSearching(false);
      setOffset(0);
      setHasMore(false);
    }
  }, [visible, loadHistory]);

  const performSearch = useCallback(async (term: string, searchOffset = 0) => {
    if (!term.trim()) {
      setResults([]);
      setTotalHits(0);
      setHasSearched(false);
      setIsSearching(false);
      setOffset(0);
      setHasMore(false);
      return;
    }
    currentQueryRef.current = term;
    setIsSearching(true);
    setHasSearched(true);
    if (searchOffset === 0) {
      setResults([]);
      setOffset(0);
    }
    try {
      const data = await searchArticles(term, SEARCH_LIMIT, searchOffset);
      if (currentQueryRef.current !== term) return;
      const mapped: Article[] = data.results.map(a => ({
        materialNumber: a.materialNumber,
        articleName: a.articleName,
        substance: a.substance !== a.articleName ? a.substance : undefined,
        brand: a.system,
        casNumber: a.casNumber,
        articleNumber: a.articleNumber,
      }));
      setResults(prev => (searchOffset === 0 ? mapped : [...prev, ...mapped]));
      setTotalHits(data.hits);
      setOffset(searchOffset + data.results.length);
      setHasMore(searchOffset + data.results.length < data.hits);
    } catch {
      if (currentQueryRef.current === term && searchOffset === 0) {
        setResults([]);
        setTotalHits(0);
      }
    } finally {
      if (currentQueryRef.current === term) {
        setIsSearching(false);
      }
    }
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(
        () => performSearch(text, 0),
        DEBOUNCE_MS,
      );
    },
    [performSearch],
  );

  const handleChipPress = useCallback(
    (chip: string) => {
      setQuery(chip);
      performSearch(chip, 0);
    },
    [performSearch],
  );

  const handleChipDelete = useCallback(async (chip: string) => {
    await removeFromSearchHistory(chip);
    setSearchHistory(prev => prev.filter(q => q !== chip));
  }, []);

  const handleClearAll = useCallback(async () => {
    await clearSearchHistory();
    setSearchHistory([]);
  }, []);

  const handleResultPress = useCallback(
    async (article: Article) => {
      if (query.trim()) {
        await addToSearchHistory(query.trim());
      }
      onClose();
      navigation.navigate('Search', {
        screen: 'ArticleDetail',
        params: { article },
      });
    },
    [query, onClose, navigation],
  );

  const loadMore = useCallback(() => {
    if (!isSearching && hasMore && query.trim()) {
      performSearch(query, offset);
    }
  }, [isSearching, hasMore, query, offset, performSearch]);

  const handleBarcodePress = useCallback(() => {
    Alert.alert(
      'Coming Soon',
      'Barcode scanning will be available in a future update.',
    );
  }, []);

  const handleClose = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    onClose();
  }, [onClose]);

  const barBg = isDark ? 'rgba(255,255,255,0.08)' : INPUT_BG;
  const overlayBg = isDark
    ? theme.background.primary
    : theme.background.primary;

  // ── Idle: history chips ──────────────────────────────────────────────────
  const renderIdleContent = () => (
    <View style={styles.idleContainer}>
      {searchHistory.length > 0 ? (
        <>
          <View style={styles.historyHeader}>
            <BodyText
              style={[styles.historyTitle, { color: theme.text.secondary }]}
            >
              Recent Searches
            </BodyText>
            <TouchableOpacity
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <BodyText style={[styles.clearAllText, { color: MMS_PURPLE }]}>
                Clear all
              </BodyText>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsContainer}>
            {searchHistory.map(item => (
              <HistoryChip
                key={item}
                query={item}
                onPress={handleChipPress}
                onDelete={handleChipDelete}
                isDark={isDark}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyHistory}>
          <Icon
            name="clock"
            size={48}
            color={isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}
          />
          <BodyText
            style={[styles.emptyHistoryText, { color: theme.text.tertiary }]}
          >
            No recent searches
          </BodyText>
        </View>
      )}
    </View>
  );

  // ── Active: search results ───────────────────────────────────────────────
  const renderListHeader = () =>
    hasSearched && !isSearching ? (
      <CaptionText
        style={[styles.resultCount, { color: theme.text.secondary }]}
      >
        {totalHits} result{totalHits !== 1 ? 's' : ''} for "{query}"
      </CaptionText>
    ) : null;

  const renderListFooter = () => {
    if (isSearching && results.length > 0) {
      return (
        <ActivityIndicator color={MMS_PURPLE} style={styles.footerSpinner} />
      );
    }
    if (hasSearched && !hasMore && results.length > 0) {
      return (
        <CaptionText
          style={[styles.footerText, { color: theme.text.tertiary }]}
        >
          End of results
        </CaptionText>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (!hasSearched || isSearching) return null;
    return (
      <View style={styles.emptyResults}>
        <Icon
          name="search"
          size={48}
          color={isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'}
        />
        <BodyText
          style={[styles.emptyResultsTitle, { color: theme.text.primary }]}
        >
          No results for "{query}"
        </BodyText>
        <CaptionText
          style={[styles.emptyResultsHint, { color: theme.text.tertiary }]}
        >
          Try different keywords or check the spelling
        </CaptionText>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: overlayBg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              borderBottomColor: theme.border.primary,
            },
          ]}
        >
          <BodyText style={[styles.headerTitle, { color: theme.text.primary }]}>
            Search
          </BodyText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Search Input ─────────────────────────────────────────────────── */}
        <View style={styles.inputWrapper}>
          <View style={[styles.inputRow, { backgroundColor: barBg }]}>
            <Icon
              name="search"
              size={20}
              color={MMS_PURPLE}
              style={styles.inputIcon}
            />
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: theme.text.primary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
              placeholder="Search articles…"
              placeholderTextColor={theme.text.placeholder}
              value={query}
              onChangeText={handleTextChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                performSearch(query, 0);
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => handleTextChange('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Clear search text"
              >
                <Icon name="close" size={18} color={theme.text.secondary} />
              </TouchableOpacity>
            )}
            <View style={styles.inputDivider} />
            <TouchableOpacity
              onPress={handleBarcodePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Scan barcode (coming soon)"
            >
              <Icon name="barcode" size={22} color={MMS_PURPLE} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        {query.length === 0 ? (
          renderIdleContent()
        ) : isSearching && results.length === 0 ? (
          <View style={styles.centerSpinner}>
            <ActivityIndicator color={MMS_PURPLE} size="large" />
          </View>
        ) : (
          <FlashList
            data={results}
            keyExtractor={item => item.materialNumber}
            estimatedItemSize={80}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 16,
            }}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            ListEmptyComponent={renderEmpty}
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ArticleCard article={item} onPress={handleResultPress} />
            )}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── HistoryChip — memoized chip with delete ────────────────────────────────
interface HistoryChipProps {
  query: string;
  onPress: (q: string) => void;
  onDelete: (q: string) => void;
  isDark: boolean;
}

const HistoryChip: React.FC<HistoryChipProps> = memo(
  ({ query, onPress, onDelete, isDark }) => {
    const chipBg = isDark ? 'rgba(255,255,255,0.1)' : '#EDE9F8';
    const chipText = isDark ? '#C8B8F0' : MMS_PURPLE;
    const displayText = query.length > 24 ? query.slice(0, 24) + '…' : query;

    return (
      <View style={[styles.chip, { backgroundColor: chipBg }]}>
        <TouchableOpacity
          onPress={() => onPress(query)}
          style={styles.chipBody}
        >
          <BodyText
            style={[
              styles.chipText,
              { color: chipText, fontFamily: getFontStyle('body').fontFamily },
            ]}
          >
            {displayText}
          </BodyText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(query)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Remove ${query} from history`}
          style={styles.chipDelete}
        >
          <Icon
            name="close"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontFamily: getFontStyle('h3').fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    bottom: 14,
    padding: 4,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  inputDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
  },
  idleContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  historyTitle: {
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearAllText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 13,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  chipBody: { paddingRight: 4 },
  chipText: { fontSize: 14, lineHeight: 18 },
  chipDelete: { padding: 2 },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyHistoryText: {
    marginTop: 12,
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 15,
  },
  centerSpinner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCount: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 13,
  },
  footerSpinner: { marginVertical: 16 },
  footerText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  emptyResults: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyResultsTitle: {
    marginTop: 16,
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyResultsHint: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeSearchOverlay;
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep HomeSearchOverlay
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/search/HomeSearchOverlay.tsx
git commit -m "feat: add HomeSearchOverlay modal with history chips and live Atlas search"
```

---

## Task 3: Export new components from search index

**Files:**

- Modify: `src/components/search/index.ts`

- [ ] **Step 1: Add exports**

Open `src/components/search/index.ts`. Current content:

```typescript
export { default as AISearchOverlay } from './AISearchOverlay';
```

Replace with:

```typescript
export { default as AISearchOverlay } from './AISearchOverlay';
export { default as HomeSearchBar } from './HomeSearchBar';
export { default as HomeSearchOverlay } from './HomeSearchOverlay';
```

- [ ] **Step 2: Verify**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "HomeSearch|index"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/search/index.ts
git commit -m "feat: export HomeSearchBar and HomeSearchOverlay from search index"
```

---

## Task 4: Wire HomeScreen.phone.tsx

**Files:**

- Modify: `src/screens/HomeScreen/HomeScreen.phone.tsx`

This task replaces the "Testing" placeholder with the hero carousel, the search bar section, and the overlay. The existing scroll animation, tab bar progress, and status bar logic stay unchanged.

- [ ] **Step 1: Add imports at the top of the file**

In `src/screens/HomeScreen/HomeScreen.phone.tsx`, find the imports block. Add these two imports after the existing `AISearchOverlay` import line:

```typescript
import HomeSearchBar from '@components/search/HomeSearchBar';
import HomeSearchOverlay from '@components/search/HomeSearchOverlay';
```

- [ ] **Step 2: Add overlay state**

Inside the `HomeScreenPhone` component body, after the `const styles = getStyles(theme);` line, add:

```typescript
const [overlayOpen, setOverlayOpen] = useState(false);

const handleBarcodePress = React.useCallback(() => {
  Alert.alert(
    'Coming Soon',
    'Barcode scanning will be available in a future update.',
  );
}, []);
```

Also add `Alert` to the React Native imports at the top of the file if it's not already there:

```typescript
import {
  View,
  Text,
  Alert, // ← add this
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
```

Also add `useState` to the React import if not already there:

```typescript
import React, { useState } from 'react';
```

- [ ] **Step 3: Replace the ScrollView body**

Find this block inside the `<Animated.ScrollView>`:

```typescript
<View>
  <Text>Testing</Text>
</View>
```

Replace it with:

```typescript
{
  /* Hero carousel */
}
<HeroCarouselHeader
  slides={heroSlides}
  heightMode={heroHeightMode}
  stickyHeader={stickyHeader}
  scrollY={scrollY}
  fadeThreshold={fadeThreshold}
  overlayHeader={
    <HeroOverlayHeader
      onMenuPress={() => {
        if (isDrawerEnabled) {
          navigation.dispatch(DrawerActions.openDrawer());
        }
      }}
    />
  }
/>;

{
  /* Search bar section */
}
<HomeSearchBar
  onPress={() => setOverlayOpen(true)}
  onBarcodePress={handleBarcodePress}
/>;

{
  /* Horizontal cards */
}
{
  cardSection && (
    <View style={styles.existingSection}>
      <HorizontalCardsSection data={cardSection} />
    </View>
  );
}

{
  /* Vertical insights */
}
{
  insightSection && (
    <View style={styles.existingSection}>
      <VerticalInsightsSection data={insightSection} />
    </View>
  );
}
```

- [ ] **Step 4: Add the overlay and rate prompt banner after the ScrollView closing tag**

Find the closing `</Animated.ScrollView>` tag. After it (still inside the root `<View>`), add:

```typescript
{
  /* Rate us banner */
}
<RateUsBanner triggerRatePrompt={triggerRatePrompt} />;

{
  /* Home search overlay */
}
<HomeSearchOverlay
  visible={overlayOpen}
  onClose={() => setOverlayOpen(false)}
/>;
```

- [ ] **Step 5: Verify no TypeScript errors**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "HomeScreen|phone"
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen/HomeScreen.phone.tsx
git commit -m "feat: wire HomeScreen with search bar, overlay, hero carousel, and sections"
```

---

## Task 5: Manual verification

- [ ] **Step 1: Start Metro and open the app on simulator**

```bash
cd /Users/M324550/Documents/MERCK_PROJECTS/mobile/mms/react-native-mobileapp
npm start
# In a second terminal:
npm run ios
```

- [ ] **Step 2: HomeScreen golden path**

Navigate to the Home tab. Confirm:

- Hero carousel renders correctly (no blank screen)
- Search bar is visible below the hero carousel
- Purple magnifier icon on the left, barcode icon on the right
- Sections (cards, insights) render below the bar

- [ ] **Step 3: Open overlay**

Tap the search bar. Confirm:

- Overlay slides up from bottom
- "Search" header with × close button
- Input is auto-focused, keyboard appears
- If no history: clock icon + "No recent searches" text

- [ ] **Step 4: Search flow**

Type "acetone" in the input. Confirm:

- After ~400ms, ActivityIndicator appears
- Results appear as ArticleCard list with result count ("X results for 'acetone'")
- Scrolling to bottom triggers pagination (more results load)

- [ ] **Step 5: Result tap**

Tap any result. Confirm:

- Overlay dismisses
- ArticleDetail screen opens with the correct article data

- [ ] **Step 6: History chips**

Close overlay, reopen it. Confirm:

- "acetone" appears as a purple chip under "Recent Searches"
- "Clear all" link appears
- Tapping the chip body re-fires the search immediately
- Tapping × on the chip removes it
- Tapping "Clear all" removes all chips

- [ ] **Step 7: Barcode placeholder**

Tap the barcode icon (in the bar and inside the overlay). Confirm: "Coming Soon" alert appears.

- [ ] **Step 8: Dark mode**

Toggle dark mode on the simulator. Confirm all colors adapt (chip backgrounds, input bg, text, overlay bg).

- [ ] **Step 9: Commit verification note**

```bash
git add -p  # confirm no unintended changes
git commit -m "chore: verified home search overlay end-to-end on simulator"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement                                   | Task                             |
| -------------------------------------------------- | -------------------------------- |
| Tappable search bar below hero carousel            | Task 1, Task 4                   |
| Full-screen slide-up modal overlay                 | Task 2                           |
| Auto-focus input on overlay open                   | Task 2 (useEffect)               |
| Recent searches as wrapping pill chips             | Task 2 (HistoryChip)             |
| × delete on each chip                              | Task 2 (handleChipDelete)        |
| "Clear all" link                                   | Task 2 (handleClearAll)          |
| Chip tap → immediate search                        | Task 2 (handleChipPress)         |
| Empty history placeholder                          | Task 2 (renderIdleContent)       |
| Debounced Atlas API search (400ms)                 | Task 2 (handleTextChange)        |
| FlashList of ArticleCard results                   | Task 2                           |
| Result count line                                  | Task 2 (renderListHeader)        |
| Pagination on scroll end                           | Task 2 (loadMore)                |
| Loading spinner (first page)                       | Task 2 (centerSpinner)           |
| No-results empty state                             | Task 2 (renderEmpty)             |
| Result tap → save history + navigate ArticleDetail | Task 2 (handleResultPress)       |
| Barcode icon placeholder (Alert)                   | Task 1, Task 2                   |
| Hero carousel restored                             | Task 4                           |
| Sections (cards, insights) restored                | Task 4                           |
| Dark/light theme aware                             | Task 1, Task 2 (isDark branches) |
| Export from index.ts                               | Task 3                           |

All spec requirements are covered. No TBDs. Type names and function signatures are consistent across all tasks.
