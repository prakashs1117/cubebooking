/**
 * QuickRateContext
 *
 * Global context that:
 *  - Holds the popup's open/closed state + the triggering context string
 *  - Automatically calls markAsResponded / markDismissed in ratePromptStorage
 *    so call-sites don't have to know about storage
 *
 * Usage:
 *   const { showRatePopup } = useQuickRate();
 *   showRatePopup('event_viewed');
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import QuickRatePopup from '@components/common/QuickRatePopup';
import { markAsResponded, markDismissed } from '@services/ratePromptStorage';
import type { RatePromptContext } from '@hooks/useRatePrompt';
import { analytics } from '@services/analyticsService';

// ─── Context shape ────────────────────────────────────────────────────────────

interface QuickRateContextValue {
  /** Trigger the quick rate popup with an optional context hint for copy */
  showRatePopup: (context?: RatePromptContext) => void;
}

const QuickRateContext = createContext<QuickRateContextValue>({
  showRatePopup: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const QuickRateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [promptContext, setPromptContext] =
    useState<RatePromptContext>('general');

  const showRatePopup = useCallback(
    (context: RatePromptContext = 'general') => {
      setPromptContext(context);
      setVisible(true);
      analytics.logRatePromptShown(context);
    },
    [],
  );

  /** User submitted feedback or opened the store — mark permanent */
  const handleResponded = useCallback(async () => {
    setVisible(false);
    analytics.logRatePromptResponded();
    try {
      await markAsResponded();
    } catch {
      /* storage errors are non-fatal */
    }
  }, []);

  /** User dismissed without engaging — record soft-dismiss for cooldown logic */
  const handleDismissed = useCallback(async () => {
    setVisible(false);
    analytics.logRatePromptDismissed();
    try {
      await markDismissed();
    } catch {
      /* storage errors are non-fatal */
    }
  }, []);

  return (
    <QuickRateContext.Provider value={{ showRatePopup }}>
      {children}
      <QuickRatePopup
        visible={visible}
        promptContext={promptContext}
        onResponded={handleResponded}
        onDismissed={handleDismissed}
      />
    </QuickRateContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useQuickRate = (): QuickRateContextValue =>
  useContext(QuickRateContext);
