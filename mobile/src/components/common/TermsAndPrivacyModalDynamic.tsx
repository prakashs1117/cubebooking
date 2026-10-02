import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import Icon from '@components/icons/Icon';
import { CustomText } from '@components/common/CustomText';
import CustomButton from '@components/common/CustomButton';
import {
  LegalModalHeader,
  LegalModalTabs,
  LegalModalFooter,
  LegalDocumentView,
} from '@components/legal';
import { useLegalModalAnimation } from '@hooks/useLegalModalAnimation';
import { useLegalModalState } from '@hooks/useLegalModalState';
import { useLegalContent } from '@hooks/useLegalContent';

interface TermsAndPrivacyModalDynamicProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  requireAcceptance?: boolean;
}

/**
 * TermsAndPrivacyModalDynamic Component
 *
 * Full-screen modal displaying privacy policy and terms of service
 * with content loaded dynamically from JSON or API.
 *
 * Features:
 * - Dynamic content loading from JSON/API
 * - Full-screen overlay
 * - Close button at top right
 * - Scrollable content with tabs
 * - Acceptance checkbox
 * - Continue button (disabled until accepted)
 * - Dark/Light theme support
 * - RTL support
 * - Multi-language support
 * - Loading and error states
 *
 * @param visible - Controls modal visibility
 * @param onClose - Callback when modal is closed
 * @param onAccept - Callback when user accepts and continues
 * @param requireAcceptance - If true, user must check the box to continue
 */
const TermsAndPrivacyModalDynamic: React.FC<
  TermsAndPrivacyModalDynamicProps
> = ({ visible, onClose, onAccept, requireAcceptance = true }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Modal state management
  const { isAccepted, activeTab, setActiveTab, toggleAcceptance } =
    useLegalModalState(visible);

  // Animation management
  const { fadeAnim, slideAnim } = useLegalModalAnimation(visible);

  // Load legal content dynamically
  const { privacyPolicy, termsOfService, isLoading, error, source, refresh } =
    useLegalContent();

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

  /**
   * Render Loading State
   */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={theme.text.link} />
      <CustomText style={[styles.loadingText, { color: theme.text.secondary }]}>
        {t('common.loading')}
      </CustomText>
      {source && (
        <CustomText style={[styles.sourceText, { color: theme.text.tertiary }]}>
          Loading from {source}...
        </CustomText>
      )}
    </View>
  );

  /**
   * Render Error State
   */
  const renderError = () => (
    <View style={styles.centerContainer}>
      <Icon name="alert-circle" size={48} color={theme.text.error} />
      <CustomText style={[styles.errorTitle, { color: theme.text.error }]}>
        {t('common.error')}
      </CustomText>
      <CustomText style={[styles.errorText, { color: theme.text.secondary }]}>
        {error}
      </CustomText>
      <CustomButton
        title={t('network.retry')}
        onPress={refresh}
        containerStyle={styles.retryButton}
      />
    </View>
  );

  /**
   * Render Content
   */
  const renderContent = () => {
    if (isLoading) {
      return renderLoading();
    }

    if (error) {
      return renderError();
    }

    if (activeTab === 'privacy' && privacyPolicy) {
      return (
        <LegalDocumentView
          title={privacyPolicy.title}
          lastUpdatedLabel={privacyPolicy.lastUpdatedLabel}
          lastUpdatedDate={privacyPolicy.lastUpdatedDate}
          sections={privacyPolicy.sections}
          headerIcon="shield-check"
          showSectionIcons={false}
        />
      );
    }

    if (activeTab === 'terms' && termsOfService) {
      return (
        <LegalDocumentView
          title={termsOfService.title}
          lastUpdatedLabel={termsOfService.lastUpdatedLabel}
          lastUpdatedDate={termsOfService.lastUpdatedDate}
          sections={termsOfService.sections}
          headerIcon="file-text"
          showSectionIcons={false}
        />
      );
    }

    return null;
  };

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
            {renderContent()}
          </ScrollView>

          {/* Footer - Only show when content is loaded */}
          {!isLoading && !error && (
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
          )}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  sourceText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 8,
  },
});

export default TermsAndPrivacyModalDynamic;
