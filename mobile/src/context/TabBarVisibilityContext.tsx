/**
 * TabBarVisibilityContext
 *
 * Shares a Reanimated SharedValue that drives the tab bar's show/hide animation.
 * Screens call `useHideTabBarOnScroll()` to get an `onScroll` handler that
 * automatically hides the tab bar on scroll-down and shows it on scroll-up.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import {
  useSharedValue,
  withTiming,
  SharedValue,
} from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabBarVisibilityContextValue {
  /** 0 = fully visible, 1 = fully hidden */
  progress: SharedValue<number>;
  /** Call from JS thread to show the tab bar immediately */
  show: () => void;
}

const TabBarVisibilityContext =
  createContext<TabBarVisibilityContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const TabBarVisibilityProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const progress = useSharedValue(0);

  const show = useMemo(
    () => () => {
      progress.value = withTiming(0, { duration: 250 });
    },
    [progress],
  );

  const value = useMemo(() => ({ progress, show }), [progress, show]);

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook — returns an onScroll handler for ScrollView / FlatList / FlashList
// ---------------------------------------------------------------------------

const SCROLL_THRESHOLD = 10; // minimum delta before we react

/**
 * Returns a scroll-event handler that hides the bottom tab bar when the user
 * scrolls down and shows it when scrolling up.
 *
 * Usage:
 * ```tsx
 * const scrollHandler = useHideTabBarOnScroll();
 * <ScrollView onScroll={scrollHandler} scrollEventThrottle={16} />
 * ```
 */
export function useHideTabBarOnScroll() {
  const ctx = useContext(TabBarVisibilityContext);

  // Track previous scroll offset via ref-like shared value so we stay on UI thread
  const prevOffset = useSharedValue(0);

  const handler = useMemo(() => {
    if (!ctx) {
      // Not wrapped in provider — return a no-op to avoid crashes
      return undefined;
    }

    return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const diff = y - prevOffset.value;
      prevOffset.value = y;

      // Only react beyond a small threshold to avoid jitter
      if (Math.abs(diff) < SCROLL_THRESHOLD) return;

      // Near the top — always show
      if (y < SCROLL_THRESHOLD) {
        ctx.progress.value = withTiming(0, { duration: 250 });
        return;
      }

      if (diff > 0) {
        // Scrolling DOWN → hide
        ctx.progress.value = withTiming(1, { duration: 250 });
      } else {
        // Scrolling UP → show
        ctx.progress.value = withTiming(0, { duration: 250 });
      }
    };
  }, [ctx, prevOffset]);

  return handler;
}

// ---------------------------------------------------------------------------
// Direct context access (used by AnimatedTabBar)
// ---------------------------------------------------------------------------

export function useTabBarVisibility() {
  const ctx = useContext(TabBarVisibilityContext);
  if (!ctx) {
    throw new Error(
      'useTabBarVisibility must be used within TabBarVisibilityProvider',
    );
  }
  return ctx;
}

/**
 * Returns the progress SharedValue so screens using Reanimated scroll handlers
 * (useAnimatedScrollHandler) can drive the tab bar from the UI thread directly.
 *
 * Usage inside a worklet scroll handler:
 * ```ts
 * const { tabBarProgress, tabBarPrevOffset } = useTabBarProgress();
 * const onScroll = useAnimatedScrollHandler(e => {
 *   const diff = e.contentOffset.y - tabBarPrevOffset.value;
 *   tabBarPrevOffset.value = e.contentOffset.y;
 *   if (Math.abs(diff) < 10) return;
 *   if (e.contentOffset.y < 10) { tabBarProgress.value = withTiming(0); return; }
 *   tabBarProgress.value = withTiming(diff > 0 ? 1 : 0, { duration: 250 });
 * });
 * ```
 */
export function useTabBarProgress() {
  const ctx = useContext(TabBarVisibilityContext);
  const prevOffset = useSharedValue(0);

  return {
    tabBarProgress: ctx?.progress ?? null,
    tabBarPrevOffset: prevOffset,
  };
}
