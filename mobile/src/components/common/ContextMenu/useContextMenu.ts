import { useCallback, useRef, useState, useEffect } from 'react';
import { Vibration } from 'react-native';
import { useContextMenuState } from '@context/ContextMenuContext';
import { getActionThreshold } from './registry';
import type { UseContextMenuOptions, UseContextMenuReturn } from './types';

/**
 * Hook for detecting long-press gestures and opening context menu.
 *
 * Usage:
 * ```
 * const { onPressIn, onPressOut, isPressed } = useContextMenu({
 *   enabled: true,
 *   actionType: 'addToFavorites',
 *   article,
 * });
 * ```
 */
export const useContextMenu = ({
  enabled = true,
  actionType,
  article,
  threshold,
  onAction,
}: UseContextMenuOptions): UseContextMenuReturn => {
  const { openMenu } = useContextMenuState();
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalThreshold = threshold ?? getActionThreshold(actionType);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  const onLongPress = useCallback(() => {
    if (!enabled || !article) {
      return;
    }

    // Open context menu
    openMenu(article, actionType);

    // Trigger optional callback
    onAction?.(actionType);
  }, [enabled, article, actionType, openMenu, onAction]);

  const onPressIn = useCallback(() => {
    if (!enabled || !article) {
      return;
    }

    setIsPressed(true);

    // Light haptic feedback on press-in
    try {
      // NOTE: Using Vibration API as a fallback. For proper haptic feedback (light tap),
      // consider migrating to react-native-haptic-feedback or expo-haptics in a follow-up.
      // Vibration.vibrate(10) produces a stronger buzz than ideal, but is available without
      // external dependencies.
      Vibration.vibrate(10);
    } catch (err) {
      // Haptics not available on all platforms - fail silently
      console.warn('Haptics not available:', err);
    }

    // Start timer for long-press detection
    pressTimer.current = setTimeout(() => {
      onLongPress();
    }, finalThreshold);
  }, [enabled, article, finalThreshold, onLongPress]);

  const onPressOut = useCallback(() => {
    setIsPressed(false);

    // Clear timer if press released before threshold
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
