/**
 * useRatePrompt
 *
 * Thin hook that any screen can call after a successful action.
 * It increments the action counter and, if all conditions are met,
 * fires the QuickRatePopup via QuickRateContext.
 *
 * Usage:
 *   const { triggerRatePrompt } = useRatePrompt();
 *   // ... after successful form submit, settings change, etc.
 *   triggerRatePrompt('form_submitted');
 */

import { useCallback } from 'react';
import { useQuickRate } from '@context/QuickRateContext';
import {
  incrementActionCount,
  shouldShowPrompt,
} from '@services/ratePromptStorage';

// ─── Prompt context types ─────────────────────────────────────────────────────

export type RatePromptContext =
  | 'language_changed'
  | 'settings_changed'
  | 'event_viewed'
  | 'notification_interacted'
  | 'form_submitted'
  | 'general';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRatePrompt = () => {
  const { showRatePopup } = useQuickRate();

  /**
   * Call this after any qualifying user action.
   * Handles its own async logic — safe to fire-and-forget.
   */
  const triggerRatePrompt = useCallback(
    (context: RatePromptContext = 'general') => {
      // Fire-and-forget; no need to await in call-sites
      (async () => {
        try {
          await incrementActionCount();
          const show = await shouldShowPrompt();
          if (show) {
            showRatePopup(context);
          }
        } catch {
          // Storage errors must never crash the app
        }
      })();
    },
    [showRatePopup],
  );

  return { triggerRatePrompt };
};
