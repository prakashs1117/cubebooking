# Product Detail Consistency Initiative

**Date**: 2026-05-21  
**Status**: ✅ Complete  
**Branch**: feature/migration

## Overview

This initiative enhances product identification across the app by displaying consistent material and article numbers in three key interfaces: Search Results, Favorites Lists, and History Screen.

## Motivation

Users previously had to open article detail screens to see article numbers, which was inefficient. By displaying both material and article numbers at a glance, users can:

- Quickly identify products without opening details
- Have consistent experience across search, favorites, and history
- Better manage their product collections

## Changes Summary

### 1. Favorites List Items Enhancement

**Commit**: c27b952d  
**File**: `src/components/favorites/FavoriteListCard.tsx`

Enhanced article items displayed within favorite lists to show additional product details.

**Display Format:**

```
Article Name (bold, primary color)
Material123 • Article456 (secondary color, smaller)
```

**Features:**

- Material number always displayed
- Article number displayed if available
- Bullet separator between numbers
- Bold article name for emphasis
- Secondary color metadata
- Works in light/dark mode
- Swipe-to-delete preserved

### 2. History Screen Enhancement

**Commit**: 90ce526f  
**File**: `src/screens/HistoryScreen.tsx`

Enhanced history items to match the favorites display format.

**Display Format:**

```
Article Name (bold, primary color)
Material123 • Article456 (secondary color, smaller)
```

**Features:**

- Same format as favorites items
- Conditional article number rendering
- Consistent color scheme
- Works in light/dark mode
- Swipe-to-delete preserved

### 3. Search Results (Reference)

**File**: `src/components/search/ArticleCard.tsx`

Already displays:

```
Article Name (bold)
Material123
Substance (if different from name)
```

## Implementation Pattern

All three interfaces now follow this pattern:

### Component Structure

```tsx
<View style={styles.itemBody}>
  {/* Primary: Article Name */}
  <BodyText style={styles.itemName}>{article.articleName}</BodyText>

  {/* Secondary: Metadata */}
  <View style={styles.metadataRow}>
    <CaptionText>{materialNumber}</CaptionText>
    {articleNumber && (
      <>
        <CaptionText>•</CaptionText>
        <CaptionText>{articleNumber}</CaptionText>
      </>
    )}
  </View>
</View>
```

### Styling Pattern

```typescript
itemName: {
  fontSize: 14-15,
  fontWeight: '600',
  color: theme.text.primary,
},
metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
metaText: {
  fontSize: 12,
  color: theme.text.secondary,
},
separator: {
  fontSize: 12,
  color: theme.text.tertiary,
}
```

## Visual Consistency

### Text Hierarchy

1. **Article Name** - Bold (600), larger (14-15px), primary color
2. **Numbers** - Regular weight, smaller (12px), secondary color
3. **Separator** - Subtle, tertiary color

### Color Consistency

| Element                  | Light Mode     | Dark Mode      |
| ------------------------ | -------------- | -------------- |
| Article Name             | Primary text   | Primary text   |
| Material/Article Numbers | Secondary text | Secondary text |
| Separator                | Tertiary text  | Tertiary text  |

## Data Flow

### Guest Users

```
Local Storage → FavoritesListService/HistoryService
→ Article object with materialNumber + articleNumber
→ Display in UI
```

### Authenticated Users

```
API → TanStack Query
→ Article object with materialNumber + articleNumber
→ Display in UI
```

Both paths provide the required data fields.

## Testing Matrix

| Feature                 | Guest Mode | Auth Mode | Light | Dark |
| ----------------------- | ---------- | --------- | ----- | ---- |
| Material number display | ✓          | ✓         | ✓     | ✓    |
| Article number display  | ✓          | ✓         | ✓     | ✓    |
| Conditional rendering   | ✓          | ✓         | ✓     | ✓    |
| Text truncation         | ✓          | ✓         | ✓     | ✓    |
| Swipe actions           | ✓          | ✓         | N/A   | N/A  |
| Colors/hierarchy        | ✓          | ✓         | ✓     | ✓    |

## Files Modified

### Code Changes

1. `src/components/favorites/FavoriteListCard.tsx`

   - Enhanced ArticleRow component
   - Added articleContent, articleMeta, articleMetaText, articleMetaSeparator styles

2. `src/screens/HistoryScreen.tsx`
   - Enhanced HistoryItem component
   - Added itemMetaRow, itemSeparator styles

### Documentation Created

1. `docs/features/favorites-list-enhancement.md`
2. `docs/migration/completed/favorites-list-enhancement.md`
3. `docs/migration/completed/history-screen-enhancement.md`
4. `docs/features/product-detail-consistency.md` (this file)

## Git Commits

```
c27b952d feat: enhance favorites list items to display material and article numbers
8cb8773e docs: add favorites list enhancement documentation
90ce526f feat: enhance history screen to display article numbers with material numbers
11566c4f docs: add history screen enhancement documentation
```

## Accessibility Considerations

✅ **Color Not Only Medium**: Numbers are differentiated by:

- Position (below primary text)
- Font size (smaller)
- Font weight (lighter)
- Color (secondary/tertiary)

✅ **Text Truncation**: Important information (article name) is not truncated, supporting metadata is truncated if needed

✅ **Touch Targets**: All interactive elements maintain minimum 44x44 touch size

## Performance Notes

- No additional API calls required
- Data already fetched and available
- Minimal re-render performance impact
- Pure presentation layer enhancement

## Future Enhancements

Potential next steps:

1. Add article images/badges if available
2. Show GHS pictograms from SDS data
3. Add quick-view modal on long-press
4. Brand name display where applicable
5. Search/filter by article number

## Rollback Plan

If issues arise:

1. Revert commits in reverse order
2. Remove new style properties
3. Remove conditional article number rendering
4. Restore single-line metadata display

Each change is self-contained and can be reverted independently.

## Sign-off

**Implementation**: ✅ Complete  
**Testing**: ✅ Verified  
**Documentation**: ✅ Complete  
**Push**: ✅ To feature/migration

Ready for review and merge.
