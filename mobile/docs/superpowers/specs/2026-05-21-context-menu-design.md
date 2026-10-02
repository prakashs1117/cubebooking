# Press-and-Hold Context Menu System Design Spec

**Date**: 2026-05-21  
**Status**: Approved for Implementation  
**Epic**: Product Detail Consistency & Accessibility

---

## Overview

A reusable, extensible long-press gesture system enabling quick actions (starting with "Add to Favorites") across article cards, favorites items, and history items. Designed for gradual rollout with prop-based opt-in per component.

### Core Requirements

- ✅ Long-press detection with scale animation + haptic feedback
- ✅ Centered modal context menu (no background dim required for first action only)
- ✅ Reuses existing `AddToFavoritesSheet` modal
- ✅ Dynamic action support via registry pattern
- ✅ Configurable thresholds per action type
- ✅ Accessibility fallback with visible action buttons
- ✅ Aggressive favorites list caching
- ✅ Prop-based opt-in for phased rollout

---

## System Architecture

### High-Level Flow

```
User Long-Presses Article
       ↓
useContextMenu detects hold (LongPressGestureHandler)
       ↓
Scale animation starts + haptic feedback
       ↓
After threshold met → ContextMenuModal opens
       ↓
Modal presents AddToFavoritesSheet
       ↓
User selects list or cancels
       ↓
Modal closes → article added (or cancelled)
```

### Component Hierarchy

```
App (wrapped with ContextMenuProvider)
├─ ContextMenuProvider
│  ├─ Manages global modal state
│  ├─ Caches favorite lists
│  └─ Provides useContextMenu hook
│
├─ ArticleCard (with useContextMenu opt-in)
│  └─ LongPressGestureHandler → opens menu
│
├─ FavoriteListCard > ArticleRow (with useContextMenu opt-in)
│  └─ LongPressGestureHandler → opens menu
│
├─ HistoryScreen > HistoryItem (with useContextMenu opt-in)
│  └─ LongPressGestureHandler → opens menu
│
└─ ContextMenuModal (single instance, global)
   └─ Wraps AddToFavoritesSheet
```

---

## Implementation Details

### 1. Action Registry

**File**: `src/components/common/ContextMenu/registry.ts`

```typescript
export type ActionType = 'addToFavorites' | 'share' | 'copyInfo';

export interface ActionConfig {
  threshold: number; // milliseconds
  handler: (article: Article) => Promise<void>;
  label: string;
  icon?: string;
}

export const ACTION_REGISTRY: Record<ActionType, ActionConfig> = {
  addToFavorites: {
    threshold: 500,
    handler: addArticleToFavorites,
    label: 'Add to Favorites',
  },
  // Future actions can be added here
};

export const getActionThreshold = (actionType: ActionType): number => {
  return ACTION_REGISTRY[actionType]?.threshold ?? 500;
};
```

### 2. Context Definition

**File**: `src/context/ContextMenuContext.tsx`

```typescript
interface ContextMenuContextType {
  // Modal state
  isVisible: boolean;
  article: Article | null;
  actionType: string | null;

  // Modal controls
  openMenu: (article: Article, actionType: string) => void;
  closeMenu: () => void;

  // Cache
  favoritesLists: FavoriteList[];
  remoteFavoritesLists: RemoteFavoriteList[];
  cacheReady: boolean;
  invalidateCache: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export const ContextMenuContext =
  createContext<ContextMenuContextType>(undefined);
```

### 3. Provider Component

**File**: `src/components/common/ContextMenu/ContextMenuProvider.tsx`

Responsibilities:

- Initialize & manage modal visibility state
- Pre-load and cache favorite lists (guest + auth paths)
- Provide `openMenu` / `closeMenu` functions
- Invalidate cache on explicit updates
- Handle loading/error states

```typescript
export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [favoritesLists, setFavoritesLists] = useState<FavoriteList[]>([]);
  const [remoteFavoritesLists, setRemoteFavoritesLists] = useState<
    RemoteFavoriteList[]
  >([]);
  const [cacheReady, setCacheReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isGuest, user } = useAuth();
  const { data: remoteListsQuery } = useFavoriteLists(!isGuest && !!user);

  // Load cache on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        if (isGuest) {
          const lists = await getFavoriteLists();
          setFavoritesLists(lists);
        } else if (remoteListsQuery) {
          setRemoteFavoritesLists(remoteListsQuery);
        }
        setCacheReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lists');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isGuest, remoteListsQuery]);

  const openMenu = useCallback((art: Article, action: string) => {
    setArticle(art);
    setActionType(action);
    setIsVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setArticle(null);
    setActionType(null);
  }, []);

  const invalidateCache = useCallback(async () => {
    // Re-fetch lists
  }, [isGuest]);

  return (
    <ContextMenuContext.Provider
      value={{
        isVisible,
        article,
        actionType,
        openMenu,
        closeMenu,
        favoritesLists,
        remoteFavoritesLists,
        cacheReady,
        invalidateCache,
        isLoading,
        error,
      }}
    >
      {children}
      <ContextMenuModal />
    </ContextMenuContext.Provider>
  );
};
```

### 4. Hook API

**File**: `src/components/common/ContextMenu/useContextMenu.ts`

```typescript
interface UseContextMenuOptions {
  enabled?: boolean;
  actionType: ActionType;
  article: Article;
  threshold?: number;
  onAction?: (action: string) => void;
}

export const useContextMenu = ({
  enabled = true,
  actionType,
  article,
  threshold,
  onAction,
}: UseContextMenuOptions) => {
  const { openMenu } = useContext(ContextMenuContext);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const finalThreshold = threshold ?? getActionThreshold(actionType);

  const onLongPress = useCallback(() => {
    if (!enabled) return;
    openMenu(article, actionType);
    onAction?.(actionType);
  }, [enabled, article, actionType, openMenu, onAction]);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    pressTimer.current = setTimeout(() => {
      onLongPress();
    }, finalThreshold);
  }, [enabled, finalThreshold, onLongPress]);

  const onPressOut = useCallback(() => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  return {
    onPressIn,
    onPressOut,
    isPressed,
  };
};
```

### 5. Modal Component

**File**: `src/components/common/ContextMenu/ContextMenuModal.tsx`

```typescript
export const ContextMenuModal: React.FC = () => {
  const {
    isVisible,
    article,
    closeMenu,
    favoritesLists,
    remoteFavoritesLists,
  } = useContext(ContextMenuContext);
  const { isGuest } = useAuth();

  if (!isVisible || !article) return null;

  return (
    <AddToFavoritesSheet
      visible={isVisible}
      article={article}
      onClose={closeMenu}
      onSaved={closeMenu}
      isLoggedIn={!isGuest}
      remoteLists={remoteFavoritesLists}
    />
  );
};
```

### 6. Component Integration: ArticleCard

**File**: `src/components/search/ArticleCard.tsx` (modified)

```typescript
interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  enableContextMenu?: boolean; // opt-in prop
}

const ArticleCard: React.FC<ArticleCardProps> = memo(
  ({ article, onPress, enableContextMenu = false }) => {
    const { theme } = useTheme();
    const { isPressed, onPressIn, onPressOut } = useContextMenu({
      enabled: enableContextMenu,
      actionType: 'addToFavorites',
      article,
    });

    const scaleValue = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.spring(scaleValue, {
        toValue: isPressed ? 0.96 : 1,
        useNativeDriver: true,
      }).start();
    }, [isPressed, scaleValue]);

    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.background.card }]}
          onPress={() => onPress(article)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={article.articleName}
        >
          {/* existing card content */}

          {/* Accessibility fallback button */}
          {enableContextMenu && (
            <TouchableOpacity
              style={styles.contextMenuButton}
              onPress={() => openMenu(article, 'addToFavorites')}
              accessibilityLabel="Quick actions"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="options" size={16} color={theme.text.secondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);
```

### 7. Component Integration: HistoryItem & FavoriteListCard

Same pattern as ArticleCard — wrap with `useContextMenu`, add scale animation, include fallback button.

---

## File Structure

### New Files

```
src/components/common/ContextMenu/
├─ ContextMenuProvider.tsx      (provider component + initialization)
├─ ContextMenuModal.tsx         (modal wrapper around AddToFavoritesSheet)
├─ useContextMenu.ts            (hook for components)
├─ types.ts                      (TypeScript definitions)
└─ registry.ts                   (action registry)

src/context/
└─ ContextMenuContext.tsx        (context definition)
```

### Modified Files

```
src/components/search/ArticleCard.tsx
├─ Add enableContextMenu prop
├─ Add useContextMenu hook
├─ Add scale animation
└─ Add accessibility fallback button

src/components/favorites/FavoriteListCard.tsx
├─ Update ArticleRow with same pattern

src/screens/HistoryScreen.tsx
├─ Update HistoryItem with same pattern

App.tsx or index.tsx
└─ Wrap app with <ContextMenuProvider>
```

---

## Phased Rollout

**Phase 1 (MVP):** Search results only

- Enable `enableContextMenu={true}` on ArticleCard in search
- Verify gesture handling, haptics, modal UX

**Phase 2:** Favorites + History

- Enable on FavoriteListCard articles
- Enable on HistoryItem
- Test across all three surfaces

**Phase 3:** Future actions

- Add 'share' action to registry
- Add 'copy' action to registry
- Components inherit new actions automatically

---

## Caching Strategy

**Favorites Lists Cache:**

1. Load on provider mount (async, non-blocking)
2. Store in context (guest path: localStorage, auth path: TanStack Query)
3. Invalidate on explicit list changes (create/delete/add article)
4. Result: Context menu appears instantly, no "loading..." delay

**Cache Invalidation Triggers:**

- User creates a new list
- User deletes a list
- User adds/removes article from list
- Manual `invalidateCache()` call

---

## Accessibility

### Screen Reader Support

- Menu items announced with labels ("Add to Favorites")
- Fallback buttons labeled "Quick actions"
- Article name available as context

### Haptic Feedback

- Light impact on press-in
- Supplements visual feedback for users with visual impairments

### Fallback Button

- Visible 3-dot menu icon on each card
- Same action as long-press
- For users unable to perform sustained press gestures

---

## Error Handling

**Scenarios:**

1. **Favorites lists fail to load** → Show error in modal + retry button
2. **Add to favorites fails** → Toast error, keep menu open for retry
3. **Long-press canceled before threshold** → Silently dismiss, no error
4. **Article data missing** → Don't open menu (graceful degradation)

---

## Testing

### Unit Tests

- Hook logic: gesture timing, state transitions
- Action registry: threshold lookups, action dispatch
- Cache invalidation: state consistency

### Integration Tests

- Modal open/close with proper article context
- AddToFavoritesSheet receives correct data
- Cache pre-loads before modal appears

### Manual Testing

- Real device haptic feedback (varies by platform)
- Gesture detection across different press durations
- Animation smoothness
- Accessibility with screen readers
- Fallback button usability

---

## Success Criteria

✅ Users can long-press any article to add to favorites  
✅ Scale animation + haptic feedback during hold  
✅ Menu appears within 500ms of threshold met  
✅ Reuses existing AddToFavoritesSheet (no UI duplication)  
✅ Works for guest and authenticated users  
✅ Prop-based opt-in allows gradual rollout  
✅ Accessibility fallback available on all cards  
✅ Easy to add new actions via registry  
✅ No performance degradation on list scrolling

---

## Timeline & Effort Estimate

- **Core hook + provider**: 2-3 hours
- **Modal + integration**: 1-2 hours
- **Component updates (3 surfaces)**: 2-3 hours
- **Testing + refinement**: 2-3 hours
- **Total**: ~7-11 hours

---

## Risk Mitigation

**Risk**: Haptic feedback inconsistent across devices  
**Mitigation**: Graceful fallback to visual feedback only

**Risk**: Long-press conflicts with existing scrolling gestures  
**Mitigation**: Test on real device, tune threshold if needed

**Risk**: Performance impact on large lists  
**Mitigation**: Memoize component, use Animated API (GPU-accelerated)

---

## Future Enhancements

1. **Swipe alternatives** — some users prefer swiping
2. **Multi-select** — long-press to select, then batch actions
3. **Customizable animations** — per-action animation variants
4. **Undo/toast feedback** — confirm action with dismissible toast
5. **Analytics** — track which actions users prefer

---

**Approved by**: User  
**Next Step**: Begin implementation with writing-plans skill
