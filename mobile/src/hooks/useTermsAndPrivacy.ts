import { useState, useCallback } from 'react';
import { useFeatureFlag } from '@hooks/useFeatureFlag';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TERMS_ACCEPTANCE_KEY = '@terms_privacy_acceptance';

interface UseTermsAndPrivacyReturn {
  isModalVisible: boolean;
  hasAccepted: boolean;
  isFeatureEnabled: boolean;
  showModal: () => void;
  hideModal: () => void;
  handleAccept: () => Promise<void>;
  handleDecline: () => void;
  checkAcceptance: () => Promise<boolean>;
  clearAcceptance: () => Promise<void>;
}

/**
 * useTermsAndPrivacy Hook
 *
 * Custom hook for managing Terms and Privacy Policy acceptance state.
 * Integrates with feature flags and persists acceptance state.
 *
 * @returns {UseTermsAndPrivacyReturn} Methods and state for managing the modal
 *
 * @example
 * ```tsx
 * const {
 *   isModalVisible,
 *   hasAccepted,
 *   isFeatureEnabled,
 *   showModal,
 *   hideModal,
 *   handleAccept,
 * } = useTermsAndPrivacy();
 *
 * // Check if user needs to accept before signup
 * useEffect(() => {
 *   if (isFeatureEnabled && !hasAccepted) {
 *     showModal();
 *   }
 * }, [isFeatureEnabled, hasAccepted]);
 *
 * return (
 *   <>
 *     <SignupForm onSubmit={handleSignup} />
 *     <TermsAndPrivacyModal
 *       visible={isModalVisible}
 *       onClose={hideModal}
 *       onAccept={handleAccept}
 *     />
 *   </>
 * );
 * ```
 */
export const useTermsAndPrivacy = (): UseTermsAndPrivacyReturn => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Check if feature is enabled
  const isFeatureEnabled = useFeatureFlag('ENABLE_TERMS_AND_PRIVACY_POPUP');

  /**
   * Show the terms and privacy modal
   */
  const showModal = useCallback(() => {
    if (isFeatureEnabled) {
      setIsModalVisible(true);
    }
  }, [isFeatureEnabled]);

  /**
   * Hide the terms and privacy modal
   */
  const hideModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  /**
   * Handle user accepting the terms and privacy policy
   * Persists the acceptance state to AsyncStorage
   */
  const handleAccept = useCallback(async () => {
    try {
      const acceptanceData = {
        accepted: true,
        timestamp: new Date().toISOString(),
        version: '1.0', // You can track versions of T&C
      };

      await AsyncStorage.setItem(
        TERMS_ACCEPTANCE_KEY,
        JSON.stringify(acceptanceData),
      );

      setHasAccepted(true);
      setIsModalVisible(false);

      if (__DEV__) {
        console.log('✅ Terms and Privacy accepted and saved');
      }
    } catch (error) {
      console.error('Error saving terms acceptance:', error);
      // Still allow user to proceed even if storage fails
      setHasAccepted(true);
      setIsModalVisible(false);
    }
  }, []);

  /**
   * Handle user declining the terms and privacy policy
   */
  const handleDecline = useCallback(() => {
    setIsModalVisible(false);
    setHasAccepted(false);
    // You might want to prevent signup or show a message
    if (__DEV__) {
      console.log('❌ Terms and Privacy declined');
    }
  }, []);

  /**
   * Check if user has previously accepted terms and privacy
   * Loads the acceptance state from AsyncStorage
   *
   * @returns {Promise<boolean>} True if user has accepted, false otherwise
   */
  const checkAcceptance = useCallback(async (): Promise<boolean> => {
    try {
      const acceptanceDataString = await AsyncStorage.getItem(
        TERMS_ACCEPTANCE_KEY,
      );

      if (acceptanceDataString) {
        const acceptanceData = JSON.parse(acceptanceDataString);

        // Check if acceptance is valid
        if (acceptanceData.accepted) {
          setHasAccepted(true);

          if (__DEV__) {
            console.log(
              '✅ Terms and Privacy previously accepted on:',
              acceptanceData.timestamp,
            );
          }

          return true;
        }
      }

      setHasAccepted(false);
      return false;
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      setHasAccepted(false);
      return false;
    }
  }, []);

  /**
   * Clear the acceptance state (useful for testing or logout)
   */
  const clearAcceptance = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TERMS_ACCEPTANCE_KEY);
      setHasAccepted(false);

      if (__DEV__) {
        console.log('🗑️ Terms and Privacy acceptance cleared');
      }
    } catch (error) {
      console.error('Error clearing terms acceptance:', error);
    }
  }, []);

  return {
    isModalVisible,
    hasAccepted,
    isFeatureEnabled,
    showModal,
    hideModal,
    handleAccept,
    handleDecline,
    checkAcceptance,
    clearAcceptance,
  };
};

export default useTermsAndPrivacy;
