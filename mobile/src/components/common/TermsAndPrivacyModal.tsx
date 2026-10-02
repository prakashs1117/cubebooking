import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import {
  LegalModalHeader,
  LegalModalTabs,
  LegalModalFooter,
  LegalDocumentView,
} from '@components/legal';
import { useLegalModalAnimation } from '@hooks/useLegalModalAnimation';
import { useLegalModalState } from '@hooks/useLegalModalState';
import { LegalSection } from '@/types/legal.types';

interface TermsAndPrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  requireAcceptance?: boolean;
}

/**
 * TermsAndPrivacyModal Component
 *
 * Full-screen modal displaying privacy policy and terms of service
 * with acceptance checkbox and localization support.
 *
 * Features:
 * - Full-screen overlay
 * - Close button at top right
 * - Scrollable content with privacy policy and terms
 * - Acceptance checkbox
 * - Continue button (disabled until accepted)
 * - Dark/Light theme support
 * - RTL support
 * - Localization (en, fr, ar)
 *
 * @param visible - Controls modal visibility
 * @param onClose - Callback when modal is closed
 * @param onAccept - Callback when user accepts and continues
 * @param requireAcceptance - If true, user must check the box to continue
 */
const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  visible,
  onClose,
  onAccept,
  requireAcceptance = true,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Modal state management
  const { isAccepted, activeTab, setActiveTab, toggleAcceptance } =
    useLegalModalState(visible);

  // Animation management
  const { fadeAnim, slideAnim } = useLegalModalAnimation(visible);

  // Scroll detection for acceptance requirement
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Reset scroll position when active tab changes
  useEffect(() => {
    setHasScrolledToBottom(false);
  }, [activeTab]);

  const handleScroll = (e: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (
      contentOffset.y + layoutMeasurement.height >=
      contentSize.height - 20
    ) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (requireAcceptance && !isAccepted) {
      return;
    }
    onAccept();
  };

  // Prepare privacy policy sections from localization
  const privacySections: LegalSection[] = [
    {
      id: 'introduction',
      order: 1,
      title: t('legal.privacyPolicy.sections.introduction.title'),
      content: t('legal.privacyPolicy.sections.introduction.content'),
    },
    {
      id: 'informationCollection',
      order: 2,
      title: t('legal.privacyPolicy.sections.informationCollection.title'),
      content: t('legal.privacyPolicy.sections.informationCollection.content'),
    },
    {
      id: 'dataUsage',
      order: 3,
      title: t('legal.privacyPolicy.sections.dataUsage.title'),
      content: t('legal.privacyPolicy.sections.dataUsage.content'),
    },
    {
      id: 'dataProtection',
      order: 4,
      title: t('legal.privacyPolicy.sections.dataProtection.title'),
      content: t('legal.privacyPolicy.sections.dataProtection.content'),
    },
    {
      id: 'thirdPartyServices',
      order: 5,
      title: t('legal.privacyPolicy.sections.thirdPartyServices.title'),
      content: t('legal.privacyPolicy.sections.thirdPartyServices.content'),
    },
    {
      id: 'yourRights',
      order: 6,
      title: t('legal.privacyPolicy.sections.yourRights.title'),
      content: t('legal.privacyPolicy.sections.yourRights.content'),
    },
    {
      id: 'contact',
      order: 7,
      title: t('legal.privacyPolicy.sections.contact.title'),
      content: t('legal.privacyPolicy.sections.contact.content'),
    },
  ];

  // Prepare terms of service sections from localization
  const termsSections: LegalSection[] = [
    {
      id: 'agreementToTerms',
      order: 1,
      title: t('legal.termsOfService.sections.agreementToTerms.title'),
      content: t('legal.termsOfService.sections.agreementToTerms.content'),
    },
    {
      id: 'userAccounts',
      order: 2,
      title: t('legal.termsOfService.sections.userAccounts.title'),
      content: t('legal.termsOfService.sections.userAccounts.content'),
    },
    {
      id: 'acceptableUse',
      order: 3,
      title: t('legal.termsOfService.sections.acceptableUse.title'),
      content: t('legal.termsOfService.sections.acceptableUse.content'),
    },
    {
      id: 'intellectualProperty',
      order: 4,
      title: t('legal.termsOfService.sections.intellectualProperty.title'),
      content: t('legal.termsOfService.sections.intellectualProperty.content'),
    },
    {
      id: 'limitationOfLiability',
      order: 5,
      title: t('legal.termsOfService.sections.limitationOfLiability.title'),
      content: t('legal.termsOfService.sections.limitationOfLiability.content'),
    },
    {
      id: 'termination',
      order: 6,
      title: t('legal.termsOfService.sections.termination.title'),
      content: t('legal.termsOfService.sections.termination.content'),
    },
    {
      id: 'changesToTerms',
      order: 7,
      title: t('legal.termsOfService.sections.changesToTerms.title'),
      content: t('legal.termsOfService.sections.changesToTerms.content'),
    },
  ];

  // Tab configuration
  const tabs = [
    {
      key: 'privacy' as const,
      label: t('legal.tabs.privacy'),
      icon: 'shield-check' as const,
    },
    {
      key: 'terms' as const,
      label: t('legal.tabs.terms'),
      icon: 'file-text' as const,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={[styles.backdrop, { backgroundColor: theme.background.overlay }]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.background.primary,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <LegalModalHeader
            title={t('legal.headerTitle')}
            onClose={onClose}
            isRTL={isRTL}
          />

          {/* Tabs */}
          <LegalModalTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
            isRTL={isRTL}
          />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {activeTab === 'privacy' ? (
              <LegalDocumentView
                title={t('legal.privacyPolicy.title')}
                lastUpdatedLabel={t('legal.lastUpdated')}
                lastUpdatedDate={t('legal.privacyPolicy.lastUpdatedDate')}
                sections={privacySections}
                headerIcon="shield-check"
              />
            ) : (
              <LegalDocumentView
                title={t('legal.termsOfService.title')}
                lastUpdatedLabel={t('legal.lastUpdated')}
                lastUpdatedDate={t('legal.termsOfService.lastUpdatedDate')}
                sections={termsSections}
                headerIcon="file-text"
              />
            )}
          </ScrollView>

          {/* Footer */}
          <LegalModalFooter
            isAccepted={isAccepted}
            onToggleAcceptance={toggleAcceptance}
            onContinue={handleAccept}
            requireAcceptance={requireAcceptance}
            acceptanceText={t('legal.acceptanceText')}
            continueButtonText={t('legal.continueButton')}
            isRTL={isRTL}
            canAccept={hasScrolledToBottom}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
    marginTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 44 : 0,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});

export default TermsAndPrivacyModal;
