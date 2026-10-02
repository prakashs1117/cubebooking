# Context Menu Implementation Documentation

**Date**: 2026-05-21  
**Status**: ✅ Implemented  
**Components**: ArticleCard, FavoriteListCard (ArticleRow), HistoryItem

## Overview

Context menu system enables long-press (press-and-hold) gestures to quickly add articles to favorites.

## Architecture

### Core Files

- **ContextMenuContext** (`src/context/ContextMenuContext.tsx`) — Global state management for modal
- **ContextMenuProvider** (`src/components/common/ContextMenu/ContextMenuProvider.tsx`) — Wraps app, caches favorites
- **ContextMenuModal** (`src/components/common/ContextMenu/ContextMenuModal.tsx`) — Renders modal
- **useContextMenu hook** (`src/components/common/ContextMenu/useContextMenu.ts`) — Per-component gesture handling
- **Action Registry** (`src/components/common/ContextMenu/registry.ts`) — Extensible action configuration

### Integration Points

1. **ArticleCard** (`src/components/search/ArticleCard.tsx`)

   - `enableContextMenu={true}` prop enables feature
   - `useContextMenu()` hook manages press state
   - Scale animation on press

2. **FavoriteListCard** (`src/components/favorites/FavoriteListCard.tsx`)

   - ArticleRow updated with context menu
   - Same `enableContextMenu` prop pattern

3. **HistoryScreen** (`src/screens/HistoryScreen.tsx`)

   - HistoryItem component updated
   - Same gesture handling pattern

4. **App Root**
   - Wrapped with `<ContextMenuProvider>`
   - Includes `<ContextMenuModal />` instance

## Usage

### For Component Developers

To add context menu to any pressable component:

```typescript
import { useContextMenu } from '@components/common/ContextMenu';

const MyCard = ({ article, enableContextMenu = false }) => {
  const { onPressIn, onPressOut, isPressed } = useContextMenu({
    enabled: enableContextMenu,
    actionType: 'addToFavorites',
    article,
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        // ... rest of component
      />
    </Animated.View>
  );
};
```

### For Adding New Actions

1. Add action to `ACTION_REGISTRY` in `registry.ts`:

   ```typescript
   share: {
     threshold: 400,
     label: 'Share',
     icon: 'share',
   }
   ```

2. Update `ActionType` union:

   ```typescript
   export type ActionType = 'addToFavorites' | 'share';
   ```

3. Handle in `ContextMenuModal.tsx` based on `actionType`

## Behavior

### Long-Press Detection

- Threshold: 500ms (configurable per action)
- Light haptic feedback on press-in
- Scale animation (0.96x) during hold
- If released before threshold: no menu, no feedback

### Favorites List Caching

- Guest users: Loaded from localStorage on provider mount
- Authenticated users: Loaded from API via TanStack Query
- Menu appears instantly (no loading delay)
- Cache invalidated on list changes

### Modal Presentation

- Centered modal (reuses `AddToFavoritesSheet`)
- Shows all user's favorite lists
- User selects list to add article
- On save: menu closes, article added

## Testing Checklist

- [ ] Long-press detection works (500ms threshold)
- [ ] Scale animation smooth during hold
- [ ] Haptic feedback triggers on press-in
- [ ] Menu appears after threshold
- [ ] Menu doesn't appear if released early
- [ ] ArticleCard integration works
- [ ] FavoriteListCard integration works
- [ ] HistoryScreen integration works
- [ ] Guest user path works
- [ ] Authenticated user path works
- [ ] Favorites added successfully
- [ ] No crashes on edge cases

## Known Limitations

1. **Accessibility fallback not yet implemented** — Visible action button not yet added to cards
2. **Single action only** — Currently only 'addToFavorites'; other actions in registry but not wired up
3. **Android haptics vary** — Some Android devices may not support light impact feedback

## Future Enhancements

1. **Accessibility fallback buttons** — Visible 3-dot menu on each card for users unable to long-press
2. **Additional actions** — Wire up 'share' and 'copy' actions from registry
3. **Customizable thresholds** — Per-component override of action thresholds
4. **Analytics** — Track which actions are used
5. **Haptic variants** — Medium/heavy feedback for different action types

## Troubleshooting

**Menu doesn't appear:**

- Verify `enableContextMenu={true}` is set on component
- Check `ContextMenuProvider` is wrapping app root
- Check `ContextMenuModal` is rendered
- Verify press duration is > 500ms

**Haptics not working:**

- Check Expo.Haptics is available on device
- Android: Requires device with haptic motor
- Fallback: Visual feedback (scale animation) works regardless

**Cache empty when menu opens:**

- Guest users: Verify favorites were saved to localStorage
- Auth users: Verify TanStack Query is fetching lists
- Check browser console for errors

---

## Related Files

- Design Spec: `docs/superpowers/specs/2026-05-21-context-menu-design.md`
- Implementation Plan: `docs/superpowers/plans/2026-05-21-context-menu-implementation.md`
- Component: `src/components/common/ContextMenu/`
- Context: `src/context/ContextMenuContext.tsx`
