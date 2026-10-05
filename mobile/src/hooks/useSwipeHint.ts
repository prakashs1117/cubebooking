import { useCallback, useEffect, useRef, useState } from 'react';
import {
  hasSeenSwipeHint,
  markSwipeHintSeen,
} from '@services/onboardingService';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

export type SwipeHintScreen = 'home' | 'history' | 'favourites';

interface SwipeHintResult {
  registerSwipeRef: (ref: SwipeableMethods | null) => void;
  tooltipVisible: boolean;
  dismiss: () => void;
}

export function useSwipeHint(
  screen: SwipeHintScreen,
  ready: boolean,
): SwipeHintResult {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const triggered = useRef(false);
  const swipeRef = useRef<SwipeableMethods | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notSeen, setNotSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    hasSeenSwipeHint(screen).then(seen => {
      if (!cancelled) setNotSeen(!seen);
    });
    return () => {
      cancelled = true;
    };
  }, [screen]);

  useEffect(() => {
    if (!ready || notSeen !== true || triggered.current) return;
    triggered.current = true;

    // t=800ms → open swipeable
    timerRef.current = setTimeout(() => {
      swipeRef.current?.openRight();

      // t=1200ms → show tooltip
      timerRef.current = setTimeout(() => {
        setTooltipVisible(true);

        // t=3200ms → close swipeable automatically, tooltip stays open
        autoCloseRef.current = setTimeout(() => {
          swipeRef.current?.close();
          markSwipeHintSeen(screen);
        }, 2000);
      }, 400);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, notSeen]);

  const registerSwipeRef = useCallback((ref: SwipeableMethods | null) => {
    swipeRef.current = ref;
  }, []);

  // Dismiss only hides the tooltip — swipeable already closed by this point
  const dismiss = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setTooltipVisible(false);
    swipeRef.current?.close();
    markSwipeHintSeen(screen);
  }, [screen]);

  return { registerSwipeRef, tooltipVisible, dismiss };
}
