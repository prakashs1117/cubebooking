# Localization: Fix Hardcoded Strings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded English strings in `HomeSearchOverlay`, `SearchResultsFlatList`, `SafetyLabelScreen`, and `PrintDetailsModal` with `t()` calls so French and Arabic users see localized text.

**Architecture:** Add `useTranslation` to the three files missing it, replace each hardcoded JSX string or prop with `t('key')`, then add the 11 net-new keys to all three translation files (en/fr/ar) in one pass. No structural changes — pure string replacement following the existing i18next pattern.

**Tech Stack:** `react-i18next` (`useTranslation`, `t()`), translation JSON files at `src/localization/translations/`.

---

## File Map

| File | Action |
|------|--------|
| `src/components/search/HomeSearchOverlay.tsx` | Add `useTranslation` import + hook, replace 6 strings |
| `src/components/search/SearchResultsFlatList.tsx` | Add `useTranslation` import + hook, replace 3 strings |
| `src/screens/SafetyLabelScreen.tsx` | Already has `useTranslation` — replace 4 strings only |
| `src/components/modals/PrintDetailsModal.tsx` | Add `useTranslation` import + hook, replace 9 strings |
| `src/localization/translations/en.json` | Add 11 new keys to `search` and `label` namespaces |
| `src/localization/translations/fr.json` | Add same 11 keys in French |
| `src/localization/translations/ar.json` | Add same 11 keys in Arabic |

---

## Task 1: Add new translation keys to all three JSON files

**Files:**
- Modify: `src/localization/translations/en.json`
- Modify: `src/localization/translations/fr.json`
- Modify: `src/localization/translations/ar.json`

- [ ] **Step 1: Add new `search` keys to `en.json`**

Open `src/localization/translations/en.json`. Inside the existing `"search"` object, add these keys after the last existing key:

```json
"clearAll": "Clear all",
"noRecentSearches": "No recent searches",
"closeSearch": "Close search",
"removeFromHistory": "Remove {{query}} from history",
"endOfResults": "End of results",
"emptyResultsHint": "Try different keywords or check the spelling"
```

- [ ] **Step 2: Add new `label` keys to `en.json`**

Inside the existing `"label"` object in `en.json`, add after the last existing key:

```json
"tapToView": "Tap to view",
"updateLabel": "Update Label",
"template": "Template",
"amountPlaceholder": "Enter amount",
"additionalInfo": "Additional Information",
"additionalInfoPlaceholder": "Enter additional info (optional)"
```

- [ ] **Step 3: Add new `search` keys to `fr.json`**

Open `src/localization/translations/fr.json`. Inside the existing `"search"` object, add:

```json
"clearAll": "Effacer tout",
"noRecentSearches": "Aucune recherche récente",
"closeSearch": "Fermer la recherche",
"removeFromHistory": "Supprimer {{query}} de l'historique",
"endOfResults": "Fin des résultats",
"emptyResultsHint": "Essayez d'autres mots-clés ou vérifiez l'orthographe"
```

- [ ] **Step 4: Add new `label` keys to `fr.json`**

Inside the existing `"label"` object in `fr.json`, add:

```json
"tapToView": "Appuyez pour voir",
"updateLabel": "Mettre à jour l'étiquette",
"template": "Modèle",
"amountPlaceholder": "Saisir la quantité",
"additionalInfo": "Informations supplémentaires",
"additionalInfoPlaceholder": "Saisir des informations supplémentaires (facultatif)"
```

- [ ] **Step 5: Add new `search` keys to `ar.json`**

Open `src/localization/translations/ar.json`. Inside the existing `"search"` object, add:

```json
"clearAll": "مسح الكل",
"noRecentSearches": "لا توجد عمليات بحث حديثة",
"closeSearch": "إغلاق البحث",
"removeFromHistory": "إزالة {{query}} من السجل",
"endOfResults": "نهاية النتائج",
"emptyResultsHint": "جرب كلمات مختلفة أو تحقق من الإملاء"
```

- [ ] **Step 6: Add new `label` keys to `ar.json`**

Inside the existing `"label"` object in `ar.json`, add:

```json
"tapToView": "اضغط للعرض",
"updateLabel": "تحديث التسمية",
"template": "القالب",
"amountPlaceholder": "أدخل الكمية",
"additionalInfo": "معلومات إضافية",
"additionalInfoPlaceholder": "أدخل معلومات إضافية (اختياري)"
```

- [ ] **Step 7: Verify JSON is valid**

```bash
cd react-native-mobileapp
node -e "require('./src/localization/translations/en.json'); require('./src/localization/translations/fr.json'); require('./src/localization/translations/ar.json'); console.log('All JSON valid')"
```

Expected output: `All JSON valid`

- [ ] **Step 8: Commit**

```bash
git add src/localization/translations/en.json src/localization/translations/fr.json src/localization/translations/ar.json
git commit -m "i18n: add missing translation keys for search and label screens"
```

---

## Task 2: Localize `HomeSearchOverlay.tsx`

**Files:**
- Modify: `src/components/search/HomeSearchOverlay.tsx`

- [ ] **Step 1: Add `useTranslation` import**

In `src/components/search/HomeSearchOverlay.tsx`, after line 1 (the React import line), add the import. The imports currently start with:

```typescript
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
```

Add after the existing imports block (find the last import line in the file and add below it):

```typescript
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 2: Add `const { t } = useTranslation()` to the overlay component**

In `HomeSearchOverlay.tsx`, find the `HomeSearchOverlay` component function body. It starts with:

```typescript
const HomeSearchOverlay: React.FC<HomeSearchOverlayProps> = ({
```

Inside the component body, after the existing hooks (e.g. after the `useTheme`, `useSafeAreaInsets` lines), add:

```typescript
const { t } = useTranslation();
```

- [ ] **Step 3: Add `const { t } = useTranslation()` to the `HistoryChip` sub-component**

`HistoryChip` is defined in the same file. Find it — it's a component that receives `{ query, onPress, onDelete, isDark }`. Inside its function body, add:

```typescript
const { t } = useTranslation();
```

- [ ] **Step 4: Replace "Recent Searches" (line ~241)**

Find:
```tsx
<BodyText
  style={[
    styles.historyTitle,
    { color: isDark ? '#FFFFFF' : theme.text.secondary },
  ]}
>
  Recent Searches
</BodyText>
```

Replace with:
```tsx
<BodyText
  style={[
    styles.historyTitle,
    { color: isDark ? '#FFFFFF' : theme.text.secondary },
  ]}
>
  {t('search.recentSearches')}
</BodyText>
```

- [ ] **Step 5: Replace "Clear all" (line ~248)**

Find:
```tsx
<BodyText style={[styles.clearAllText, { color: iconColor }]}>
  Clear all
</BodyText>
```

Replace with:
```tsx
<BodyText style={[styles.clearAllText, { color: iconColor }]}>
  {t('search.clearAll')}
</BodyText>
```

- [ ] **Step 6: Replace "No recent searches" (line ~300)**

Find:
```tsx
<BodyText
  style={[
    styles.emptyHistoryText,
    { color: isDark ? 'rgba(255,255,255,0.6)' : theme.text.tertiary },
  ]}
>
  No recent searches
</BodyText>
```

Replace with:
```tsx
<BodyText
  style={[
    styles.emptyHistoryText,
    { color: isDark ? 'rgba(255,255,255,0.6)' : theme.text.tertiary },
  ]}
>
  {t('search.noRecentSearches')}
</BodyText>
```

- [ ] **Step 7: Replace "Search" header title (line ~335)**

Find:
```tsx
<BodyText
  style={[styles.headerTitle, { color: theme.text.primary }]}
>
  Search
</BodyText>
```

Replace with:
```tsx
<BodyText
  style={[styles.headerTitle, { color: theme.text.primary }]}
>
  {t('navigation.search')}
</BodyText>
```

- [ ] **Step 8: Replace `accessibilityLabel="Close search"` (line ~341)**

Find:
```tsx
accessibilityLabel="Close search"
```

Replace with:
```tsx
accessibilityLabel={t('search.closeSearch')}
```

- [ ] **Step 9: Replace dynamic accessibilityLabel in `HistoryChip` (line ~410)**

Find:
```tsx
accessibilityLabel={`Remove ${query} from history`}
```

Replace with:
```tsx
accessibilityLabel={t('search.removeFromHistory', { query })}
```

- [ ] **Step 10: Verify TypeScript compiles**

```bash
cd react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "HomeSearchOverlay|error" | head -20
```

Expected: no errors referencing `HomeSearchOverlay.tsx`.

- [ ] **Step 11: Commit**

```bash
git add src/components/search/HomeSearchOverlay.tsx
git commit -m "i18n: localize hardcoded strings in HomeSearchOverlay"
```

---

## Task 3: Localize `SearchResultsFlatList.tsx`

**Files:**
- Modify: `src/components/search/SearchResultsFlatList.tsx`

- [ ] **Step 1: Add `useTranslation` import**

In `src/components/search/SearchResultsFlatList.tsx`, the current imports are:

```typescript
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { getFontStyle } from '@utils/fonts';
import ArticleCard, { Article } from '@components/search/ArticleCard';
import { CaptionText, BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
```

Add after the last import:

```typescript
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 2: Add `const { t } = useTranslation()` to the component**

The component starts with:

```typescript
const SearchResultsFlatList: React.FC<SearchResultsFlatListProps> = ({
  ...
}) => {
  const { theme, isDark } = useTheme();
  const captionStyle = getFontStyle('caption');
  const bodyStyle = getFontStyle('body');
  const accentColor = isDark ? '#FFFFFF' : BaseColors.merckPurple;
```

Add `const { t } = useTranslation();` after the `const accentColor` line:

```typescript
const { t } = useTranslation();
```

- [ ] **Step 3: Replace "End of results" (line ~97)**

Find:
```tsx
<CaptionText
  style={[
    styles.footerText,
    {
      fontFamily: captionStyle.fontFamily,
      color: isDark ? 'rgba(255,255,255,0.4)' : theme.text.tertiary,
    },
  ]}
>
  End of results
</CaptionText>
```

Replace with:
```tsx
<CaptionText
  style={[
    styles.footerText,
    {
      fontFamily: captionStyle.fontFamily,
      color: isDark ? 'rgba(255,255,255,0.4)' : theme.text.tertiary,
    },
  ]}
>
  {t('search.endOfResults')}
</CaptionText>
```

- [ ] **Step 4: Replace inline "No results for..." JSX (lines ~131–133)**

Find:
```tsx
<BodyText
  style={[
    styles.emptyTitle,
    {
      fontFamily: bodyStyle.fontFamily,
      color: isDark ? '#FFFFFF' : theme.text.primary,
    },
  ]}
>
  No results for {'"'}
  {query}
  {'"'}
</BodyText>
```

Replace with:
```tsx
<BodyText
  style={[
    styles.emptyTitle,
    {
      fontFamily: bodyStyle.fontFamily,
      color: isDark ? '#FFFFFF' : theme.text.primary,
    },
  ]}
>
  {t('search.noResults', { term: query })}
</BodyText>
```

Note: `search.noResults` already exists in en.json as `"No results for \"{{term}}\""` — no new key needed.

- [ ] **Step 5: Replace "Try different keywords..." (line ~144)**

Find:
```tsx
<CaptionText
  style={[
    styles.emptyHint,
    {
      fontFamily: captionStyle.fontFamily,
      color: isDark ? 'rgba(255,255,255,0.5)' : theme.text.tertiary,
    },
  ]}
>
  Try different keywords or check the spelling
</CaptionText>
```

Replace with:
```tsx
<CaptionText
  style={[
    styles.emptyHint,
    {
      fontFamily: captionStyle.fontFamily,
      color: isDark ? 'rgba(255,255,255,0.5)' : theme.text.tertiary,
    },
  ]}
>
  {t('search.emptyResultsHint')}
</CaptionText>
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "SearchResultsFlatList|error" | head -20
```

Expected: no errors referencing `SearchResultsFlatList.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/components/search/SearchResultsFlatList.tsx
git commit -m "i18n: localize hardcoded strings in SearchResultsFlatList"
```

---

## Task 4: Localize `SafetyLabelScreen.tsx`

**Files:**
- Modify: `src/screens/SafetyLabelScreen.tsx`

This file already imports `useTranslation` and has `const { t } = useTranslation()` — no import changes needed.

- [ ] **Step 1: Replace "Tap to view" / "Loading..." ternary (line ~536)**

Find:
```tsx
{screenReady ? 'Tap to view' : 'Loading...'}
```

Replace with:
```tsx
{screenReady ? t('label.tapToView') : t('common.loading')}
```

Note: `common.loading` already exists as `"Loading..."` — no new key needed.

- [ ] **Step 2: Replace "Update Label" button text (line ~562)**

Find:
```tsx
<CustomText
  style={[
    screenStyles.printDetailsBtnTitle,
    { color: textPrimary },
  ]}
>
  Update Label
</CustomText>
```

Replace with:
```tsx
<CustomText
  style={[
    screenStyles.printDetailsBtnTitle,
    { color: textPrimary },
  ]}
>
  {t('label.updateLabel')}
</CustomText>
```

- [ ] **Step 3: Replace "View Full SDS" button text (line ~781)**

Find:
```tsx
<CustomText style={screenStyles.viewSdsBtnText}>
  View Full SDS
</CustomText>
```

Replace with:
```tsx
<CustomText style={screenStyles.viewSdsBtnText}>
  {t('sds.viewAllSections')}
</CustomText>
```

Note: `sds.viewAllSections` already exists as `"View All Sections"` — no new key needed.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "SafetyLabelScreen|error" | head -20
```

Expected: no errors referencing `SafetyLabelScreen.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/screens/SafetyLabelScreen.tsx
git commit -m "i18n: localize hardcoded strings in SafetyLabelScreen"
```

---

## Task 5: Localize `PrintDetailsModal.tsx`

**Files:**
- Modify: `src/components/modals/PrintDetailsModal.tsx`

- [ ] **Step 1: Add `useTranslation` import**

In `src/components/modals/PrintDetailsModal.tsx`, the file currently starts with:

```typescript
import React, { useCallback, useEffect, useState } from 'react';
```

Add after the last import in the file:

```typescript
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 2: Add `const { t } = useTranslation()` to the component**

Find the component function body. After the existing hooks at the top of the component (e.g. `useTheme`, `useSafeAreaInsets`, `useState` lines), add:

```typescript
const { t } = useTranslation();
```

- [ ] **Step 3: Replace "Update Label" modal title (line ~120)**

Find:
```tsx
<CustomText style={[styles.title, { color: textColor }]}>
  Update Label
</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.title, { color: textColor }]}>
  {t('label.updateLabel')}
</CustomText>
```

- [ ] **Step 4: Replace "Template" field label (line ~133)**

Find:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  Template
</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  {t('label.template')}
</CustomText>
```

- [ ] **Step 5: Replace "Amount" field label (line ~164)**

Find:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  Amount
</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  {t('label.amount')}
</CustomText>
```

Note: `label.amount` already exists as `"Amount"`.

- [ ] **Step 6: Replace `placeholder="Enter amount"` (line ~168)**

Find:
```tsx
placeholder="Enter amount"
```

Replace with:
```tsx
placeholder={t('label.amountPlaceholder')}
```

- [ ] **Step 7: Replace "Unit" field label (line ~180)**

Find:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  Unit
</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  {t('label.unit')}
</CustomText>
```

Note: `label.unit` already exists as `"Unit"`.

- [ ] **Step 8: Replace "Additional Information" field label (line ~211)**

Find:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  Additional Information
</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.fieldLabel, { color: textColor }]}>
  {t('label.additionalInfo')}
</CustomText>
```

- [ ] **Step 9: Replace `placeholder="Enter additional info (optional)"` (line ~215)**

Find:
```tsx
placeholder="Enter additional info (optional)"
```

Replace with:
```tsx
placeholder={t('label.additionalInfoPlaceholder')}
```

- [ ] **Step 10: Replace "Cancel" button (line ~238)**

Find:
```tsx
<CustomText style={[styles.btnText, { color: textColor }]}>Cancel</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.btnText, { color: textColor }]}>{t('label.cancel')}</CustomText>
```

Note: `label.cancel` already exists as `"Cancel"`.

- [ ] **Step 11: Replace "Update" button (line ~250)**

Find:
```tsx
<CustomText style={[styles.btnText, { color: '#FFFFFF' }]}>Update</CustomText>
```

Replace with:
```tsx
<CustomText style={[styles.btnText, { color: '#FFFFFF' }]}>{t('label.update')}</CustomText>
```

Note: `label.update` already exists as `"Update"`.

- [ ] **Step 12: Verify TypeScript compiles**

```bash
cd react-native-mobileapp
npx tsc --noEmit 2>&1 | grep -E "PrintDetailsModal|error" | head -20
```

Expected: no errors referencing `PrintDetailsModal.tsx`.

- [ ] **Step 13: Commit**

```bash
git add src/components/modals/PrintDetailsModal.tsx
git commit -m "i18n: localize hardcoded strings in PrintDetailsModal"
```

---

## Task 6: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd react-native-mobileapp
npx tsc --noEmit 2>&1 | grep "error" | head -20
```

Expected: no errors.

- [ ] **Step 2: Lint check**

```bash
cd react-native-mobileapp
npm run lint 2>&1 | tail -20
```

Expected: no new lint errors.

- [ ] **Step 3: Confirm all new keys present in all three files**

```bash
cd react-native-mobileapp
node -e "
const en = require('./src/localization/translations/en.json');
const fr = require('./src/localization/translations/fr.json');
const ar = require('./src/localization/translations/ar.json');
const newKeys = [
  ['search','clearAll'],['search','noRecentSearches'],['search','closeSearch'],
  ['search','removeFromHistory'],['search','endOfResults'],['search','emptyResultsHint'],
  ['label','tapToView'],['label','updateLabel'],['label','template'],
  ['label','amountPlaceholder'],['label','additionalInfo'],['label','additionalInfoPlaceholder'],
];
let ok = true;
for (const [ns, key] of newKeys) {
  for (const [lang, obj] of [['en',en],['fr',fr],['ar',ar]]) {
    if (!obj[ns] || !obj[ns][key]) { console.log('MISSING', lang, ns+'.'+key); ok = false; }
  }
}
if (ok) console.log('All 12 keys present in all 3 languages');
"
```

Expected: `All 12 keys present in all 3 languages`

- [ ] **Step 4: Final commit if any loose files remain**

```bash
git status
```

If any modified files are unstaged, add and commit them.
