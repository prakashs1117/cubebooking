import { useState, useCallback, useEffect } from 'react';
import { LegalTab } from '@components/legal/LegalModalTabs';

interface UseLegalModalStateReturn {
  isAccepted: boolean;
  activeTab: LegalTab;
  setActiveTab: (tab: LegalTab) => void;
  toggleAcceptance: () => void;
  resetState: () => void;
}

/**
 * useLegalModalState
 *
 * Custom hook to manage legal modal state (acceptance and active tab).
 *
 * @param visible - Whether the modal is visible (resets state when shown)
 * @param initialTab - Initial tab to show
 * @returns State and handlers for modal interactions
 */
export const useLegalModalState = (
  visible: boolean,
  initialTab: LegalTab = 'privacy',
): UseLegalModalStateReturn => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  const toggleAcceptance = useCallback(() => {
    setIsAccepted(prev => !prev);
  }, []);

  const resetState = useCallback(() => {
    setIsAccepted(false);
    setActiveTab(initialTab);
  }, [initialTab]);

  // Reset acceptance state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setIsAccepted(false);
    }
  }, [visible]);

  return {
    isAccepted,
    activeTab,
    setActiveTab,
    toggleAcceptance,
    resetState,
  };
};
