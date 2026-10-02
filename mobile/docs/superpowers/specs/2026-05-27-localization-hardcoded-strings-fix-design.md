# Localization: Fix Hardcoded Strings in HomeSearchOverlay and SafetyLabelScreen

**Date:** 2026-05-27
**Status:** Approved

## Context

Several user-facing strings in `HomeSearchOverlay.tsx`, `SafetyLabelScreen.tsx`, and their related components (`SearchResultsFlatList.tsx`, `PrintDetailsModal.tsx`) are hardcoded in English instead of going through the `react-i18next` `t()` function. This means French and Arabic users see English strings in these screens. The fix is to replace each hardcoded string with the appropriate `t('key')` call and add missing keys to all three translation files.

## Out of Scope

- `LabelShared.tsx` constants (`DISCLAIMER_LABEL`, `FILL_DATE_LABEL`, `NOTES_LABEL`, `TEMPLATE_OPTIONS` labels, `DISCLAIMER_TEXT`) — these appear on printed physical/chemical labels and must remain in English for regulatory compliance.
- Any strings in console logs or developer-only output.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/search/HomeSearchOverlay.tsx` | Add `useTranslation`, replace 6 hardcoded strings |
| `src/components/search/SearchResultsFlatList.tsx` | Add `useTranslation`, replace 3 hardcoded strings |
| `src/screens/SafetyLabelScreen.tsx` | Replace 3 hardcoded strings (already has `useTranslation`) |
| `src/components/modals/PrintDetailsModal.tsx` | Add `useTranslation`, replace 7 hardcoded strings |
| `src/localization/translations/en.json` | Add 11 new keys |
| `src/localization/translations/fr.json` | Add 11 new keys (English fallback values, translator to update) |
| `src/localization/translations/ar.json` | Add 11 new keys (English fallback values, translator to update) |

---

## String Replacements

### `HomeSearchOverlay.tsx`

Add `import { useTranslation } from 'react-i18next';` and `const { t } = useTranslation();` inside the component.

| Line | Old | New |
|------|-----|-----|
| 241 | `Recent Searches` | `{t('search.recentSearches')}` |
| 248 | `Clear all` | `{t('search.clearAll')}` |
| 300 | `No recent searches` | `{t('search.noRecentSearches')}` |
| 335 | `Search` | `{t('navigation.search')}` |
| 341 | `accessibilityLabel="Close search"` | `accessibilityLabel={t('search.closeSearch')}` |
| 410 | `` `Remove ${query} from history` `` | `t('search.removeFromHistory', { query })` |

### `SearchResultsFlatList.tsx`

Add `import { useTranslation } from 'react-i18next';` and `const { t } = useTranslation();`.

| Line | Old | New |
|------|-----|-----|
| 97 | `End of results` | `{t('search.endOfResults')}` |
| 131–133 | Inline JSX: `No results for {'"'}{query}{'"'}` | `{t('search.noResults', { term: query })}` |
| 144 | `Try different keywords or check the spelling` | `{t('search.emptyResultsHint')}` |

Note: `search.noResults` key already exists in en.json as `"No results for \"{{term}}\""` — no new key needed for this one.

### `SafetyLabelScreen.tsx`

Already imports `useTranslation` and has `const { t } = useTranslation()`.

| Line | Old | New |
|------|-----|-----|
| 536 | `'Tap to view'` | `t('label.tapToView')` |
| 536 | `'Loading...'` | `t('common.loading')` |
| 562 | `Update Label` | `{t('label.updateLabel')}` |
| 781 | `View Full SDS` | `{t('sds.viewAllSections')}` |

Note: `common.loading` (`"Loading..."`) and `sds.viewAllSections` (`"View All Sections"`) already exist — no new keys needed for these.

### `PrintDetailsModal.tsx`

Add `import { useTranslation } from 'react-i18next';` and `const { t } = useTranslation();`. Keys `label.amount`, `label.unit`, `label.cancel`, `label.update` already exist.

| Line | Old | New |
|------|-----|-----|
| 120 | `Update Label` | `{t('label.updateLabel')}` |
| 133 | `Template` | `{t('label.template')}` |
| 164 | `Amount` | `{t('label.amount')}` |
| 168 | `placeholder="Enter amount"` | `placeholder={t('label.amountPlaceholder')}` |
| 180 | `Unit` | `{t('label.unit')}` |
| 211 | `Additional Information` | `{t('label.additionalInfo')}` |
| 215 | `placeholder="Enter additional info (optional)"` | `placeholder={t('label.additionalInfoPlaceholder')}` |
| 238 | `Cancel` | `{t('label.cancel')}` |
| 250 | `Update` | `{t('label.update')}` |

---

## New Translation Keys

Add the following 11 keys to `en.json`, `fr.json`, and `ar.json`. English values are authoritative. fr/ar values are English fallbacks — a human translator should update them.

```json
// search namespace additions
"search.clearAll": "Clear all"
"search.noRecentSearches": "No recent searches"
"search.closeSearch": "Close search"
"search.removeFromHistory": "Remove {{query}} from history"
"search.endOfResults": "End of results"
"search.emptyResultsHint": "Try different keywords or check the spelling"

// label namespace additions
"label.tapToView": "Tap to view"
"label.updateLabel": "Update Label"
"label.template": "Template"
"label.amountPlaceholder": "Enter amount"
"label.additionalInfo": "Additional Information"
"label.additionalInfoPlaceholder": "Enter additional info (optional)"
```

### French translations (fr.json)
```json
"search.clearAll": "Effacer tout"
"search.noRecentSearches": "Aucune recherche récente"
"search.closeSearch": "Fermer la recherche"
"search.removeFromHistory": "Supprimer {{query}} de l'historique"
"search.endOfResults": "Fin des résultats"
"search.emptyResultsHint": "Essayez d'autres mots-clés ou vérifiez l'orthographe"
"label.tapToView": "Appuyez pour voir"
"label.updateLabel": "Mettre à jour l'étiquette"
"label.template": "Modèle"
"label.amountPlaceholder": "Saisir la quantité"
"label.additionalInfo": "Informations supplémentaires"
"label.additionalInfoPlaceholder": "Saisir des informations supplémentaires (facultatif)"
```

### Arabic translations (ar.json)
```json
"search.clearAll": "مسح الكل"
"search.noRecentSearches": "لا توجد عمليات بحث حديثة"
"search.closeSearch": "إغلاق البحث"
"search.removeFromHistory": "إزالة {{query}} من السجل"
"search.endOfResults": "نهاية النتائج"
"search.emptyResultsHint": "جرب كلمات مختلفة أو تحقق من الإملاء"
"label.tapToView": "اضغط للعرض"
"label.updateLabel": "تحديث التسمية"
"label.template": "القالب"
"label.amountPlaceholder": "أدخل الكمية"
"label.additionalInfo": "معلومات إضافية"
"label.additionalInfoPlaceholder": "أدخل معلومات إضافية (اختياري)"
```

---

## Verification

1. Run the app in French locale — all affected screens show French strings
2. Run the app in Arabic locale — all affected screens show Arabic strings, RTL layout intact
3. `HomeSearchOverlay`: "Recent Searches" header, "Clear all" button, "No recent searches" empty state, modal title all localized
4. `SearchResultsFlatList`: "End of results" footer, "No results for X" empty title, hint text all localized
5. `SafetyLabelScreen`: "Tap to view" / `common.loading` hint, "Update Label" button, "View Full SDS" button all localized
6. `PrintDetailsModal`: All field labels, placeholders, Cancel/Update buttons all localized
7. No TypeScript errors — all `t()` call sites use valid key strings
8. Run `npm run lint` — no new lint errors
