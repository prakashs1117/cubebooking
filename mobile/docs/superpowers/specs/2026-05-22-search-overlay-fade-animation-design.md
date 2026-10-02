# Search Overlay — Fade Animation Design

**Date:** 2026-05-22
**Status:** Approved

## Context

The `HomeSearchOverlay` currently opens with a bottom-sheet slide-up animation (`animationType="slide"` on the React Native `<Modal>`). The `NotificationModal` — which the user identified as more polished and user-friendly — uses a custom fade-in animation (`Animated.timing` opacity 0→1). This spec changes the search overlay to match that fade pattern.

Both entry points (tapping the HomeScreen search bar and tapping the Search tab button) route through `SearchOverlayContext.openSearch()` → `HomeSearchOverlay visible={isOpen}`, so a single file change fixes both.

## Scope

**One file changed:** `src/components/search/HomeSearchOverlay.tsx`

No changes to:

- `SearchOverlayContext.tsx`
- `TabNavigator.tsx` / `SearchInlineButton`
- `HomeScreen.phone.tsx`
- `HomeSearchBar.tsx`

## Implementation

### 1. Suppress built-in Modal animation

```tsx
// Before
<Modal animationType="slide" ...>

// After
<Modal animationType="none" ...>
```

### 2. Add fade ref

```tsx
const fadeAnim = useRef(new Animated.Value(0)).current;
```

(`Animated` is already imported from `react-native` in this file.)

### 3. Add useEffect for fade timing

```tsx
useEffect(() => {
  if (visible) {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }
}, [visible, fadeAnim]);
```

Timing values match `NotificationModal` exactly (200ms open, 150ms close).

### 4. Wrap KeyboardAvoidingView with Animated.View

```tsx
<Modal animationType="none" ...>
  <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
    <KeyboardAvoidingView ...>
      {/* existing content unchanged */}
    </KeyboardAvoidingView>
  </Animated.View>
</Modal>
```

## Verification

1. Run `npm start` and open the app on iOS simulator or device.
2. Tap the search bar on HomeScreen — overlay should fade in smoothly, not slide up.
3. Tap the Search tab button — same fade behaviour.
4. Close the overlay (X button or back gesture) — should fade out.
5. Verify keyboard still appears correctly inside the overlay on iOS.
6. Verify dark mode and light mode both look correct (no visual regressions).
