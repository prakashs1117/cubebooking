import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Platform, Switch } from 'react-native';
import { useTheme } from '@theme/index';
import CustomText from '@components/common/CustomText';
import CustomButton from '@components/common/CustomButton';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
import TermsAndPrivacyModalDynamic from '@components/common/TermsAndPrivacyModalDynamic';
import { FeatureFlag } from '@components/common/FeatureFlag';
import Icon from '@components/icons/Icon';
import { useLegalContent } from '@hooks/useLegalContent';

/**
 * TermsPrivacyDemoScreen
 *
 * Demo screen showcasing the Terms and Privacy Policy modal integration.
 * This demonstrates how to use the TermsAndPrivacyModal component
 * in a signup/signin flow with feature flag support.
 */
const TermsPrivacyDemoScreen: React.FC = () => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [useDynamicContent, setUseDynamicContent] = useState(true);

  // Load legal content
  const {
    privacyPolicy,
    termsOfService,
    isLoading,
    error,
    source,
    refresh,
    clearCache,
  } = useLegalContent();

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleAccept = () => {
    setHasAccepted(true);
    setModalVisible(false);
    // Here you would typically proceed with signup/signin
    console.log('User accepted terms and privacy policy');
  };

  const handleSignup = () => {
    // This is where you'd integrate with your actual signup flow
    console.log('Proceeding with signup...');
    // Navigate to next screen, call API, etc.
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="shield-check" size={64} color={theme.text.link} />
          </View>
          <CustomText style={[styles.title, { color: theme.text.primary }]}>
            Terms & Privacy Demo
          </CustomText>
          <CustomText
            style={[styles.subtitle, { color: theme.text.secondary }]}
          >
            This screen demonstrates the Terms and Privacy Policy modal
            integration for signup/signin flows.
          </CustomText>
        </View>

        {/* Content Source Toggle */}
        <View
          style={[styles.infoCard, { backgroundColor: theme.background.card }]}
        >
          <View style={styles.infoHeader}>
            <Icon name="toggle" size={24} color={theme.text.link} />
            <CustomText
              style={[styles.infoTitle, { color: theme.text.primary }]}
            >
              Content Source
            </CustomText>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <CustomText
                style={[styles.toggleLabel, { color: theme.text.primary }]}
              >
                {useDynamicContent
                  ? 'Dynamic (JSON/API)'
                  : 'Static (Localization)'}
              </CustomText>
              <CustomText
                style={[styles.toggleDesc, { color: theme.text.tertiary }]}
              >
                {useDynamicContent
                  ? 'Content loaded from data files or API'
                  : 'Content from localization strings'}
              </CustomText>
            </View>
            <Switch
              value={useDynamicContent}
              onValueChange={setUseDynamicContent}
              trackColor={{
                false: theme.border.primary,
                true: theme.text.link,
              }}
              thumbColor={theme.background.primary}
            />
          </View>

          {useDynamicContent && (
            <View style={styles.dataSourceInfo}>
              <CustomText
                style={[
                  styles.dataSourceLabel,
                  { color: theme.text.secondary },
                ]}
              >
                Current Source:{' '}
                <CustomText
                  style={{ fontWeight: '600', color: theme.text.link }}
                >
                  {source || 'Loading...'}
                </CustomText>
              </CustomText>
              {isLoading && (
                <CustomText
                  style={[
                    styles.dataSourceStatus,
                    { color: theme.text.tertiary },
                  ]}
                >
                  Loading content...
                </CustomText>
              )}
              {error && (
                <CustomText
                  style={[styles.dataSourceStatus, { color: theme.text.error }]}
                >
                  Error: {error}
                </CustomText>
              )}
              {privacyPolicy && termsOfService && (
                <CustomText
                  style={[
                    styles.dataSourceStatus,
                    { color: theme.text.success },
                  ]}
                >
                  ✓ Content loaded successfully
                </CustomText>
              )}
            </View>
          )}
        </View>

        {/* Feature Flag Info */}
        <View
          style={[styles.infoCard, { backgroundColor: theme.background.card }]}
        >
          <View style={styles.infoHeader}>
            <Icon name="info-circle" size={24} color={theme.text.link} />
            <CustomText
              style={[styles.infoTitle, { color: theme.text.primary }]}
            >
              Feature Flag
            </CustomText>
          </View>
          <CustomText
            style={[styles.infoText, { color: theme.text.secondary }]}
          >
            <CustomText style={{ fontWeight: '600' }}>
              ENABLE_TERMS_AND_PRIVACY_POPUP
            </CustomText>
            {'\n\n'}
            This feature can be enabled/disabled via the feature flags
            configuration. When disabled, the modal will not be shown during
            signup/signin.
          </CustomText>
        </View>

        {/* Dynamic Content Info */}
        {useDynamicContent && (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.background.card },
            ]}
          >
            <View style={styles.infoHeader}>
              <Icon name="document" size={24} color={theme.text.link} />
              <CustomText
                style={[styles.infoTitle, { color: theme.text.primary }]}
              >
                Dynamic Content
              </CustomText>
            </View>
            <CustomText
              style={[styles.infoText, { color: theme.text.secondary }]}
            >
              Content is loaded from JSON files that can be easily replaced with
              API calls.
              {'\n\n'}
              <CustomText style={{ fontWeight: '600' }}>Files:</CustomText>
              {'\n'}• src/data/legal/privacyPolicy.json
              {'\n'}• src/data/legal/termsOfService.json
              {'\n\n'}
              <CustomText style={{ fontWeight: '600' }}>
                API Ready:
              </CustomText>{' '}
              Update the service configuration to switch to API.
            </CustomText>
            <View style={styles.actionButtons}>
              <CustomButton
                title="Refresh Content"
                onPress={refresh}
                variant="outline"
                size="small"
                containerStyle={styles.actionButton}
              />
              <CustomButton
                title="Clear Cache"
                onPress={() => clearCache()}
                variant="outline"
                size="small"
                containerStyle={styles.actionButton}
              />
            </View>
          </View>
        )}

        {/* Status */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: theme.background.card },
          ]}
        >
          <CustomText
            style={[styles.statusLabel, { color: theme.text.secondary }]}
          >
            Acceptance Status:
          </CustomText>
          <View style={styles.statusBadge}>
            <Icon
              name={hasAccepted ? 'check-square' : 'square'}
              size={20}
              color={hasAccepted ? theme.text.success : theme.text.tertiary}
            />
            <CustomText
              style={[
                styles.statusText,
                {
                  color: hasAccepted ? theme.text.success : theme.text.tertiary,
                },
              ]}
            >
              {hasAccepted ? 'Accepted' : 'Not Accepted'}
            </CustomText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {/* Feature Flag Gated Content */}
          <FeatureFlag
            flag="ENABLE_TERMS_AND_PRIVACY_POPUP"
            fallback={
              <View
                style={[
                  styles.disabledCard,
                  { backgroundColor: theme.background.secondary },
                ]}
              >
                <CustomText
                  style={[styles.disabledText, { color: theme.text.tertiary }]}
                >
                  Terms & Privacy popup is currently disabled via feature flag.
                  Enable it in Feature Flags settings to see the modal.
                </CustomText>
              </View>
            }
          >
            <CustomButton
              title="Show Terms & Privacy Modal"
              onPress={handleOpenModal}
              containerStyle={styles.button}
            />
          </FeatureFlag>

          <CustomButton
            title="Proceed to Signup"
            onPress={handleSignup}
            disabled={!hasAccepted}
            containerStyle={styles.button}
          />
        </View>

        {/* Integration Instructions */}
        <View
          style={[
            styles.instructionsCard,
            { backgroundColor: theme.background.secondary },
          ]}
        >
          <CustomText
            style={[styles.instructionsTitle, { color: theme.text.primary }]}
          >
            Integration Instructions
          </CustomText>

          <CustomText
            style={[styles.instructionStep, { color: theme.text.secondary }]}
          >
            <CustomText style={{ fontWeight: '600' }}>
              1. Import the component:
            </CustomText>
            {'\n'}
            import TermsAndPrivacyModal from
            '@components/common/TermsAndPrivacyModal';
          </CustomText>

          <CustomText
            style={[styles.instructionStep, { color: theme.text.secondary }]}
          >
            <CustomText style={{ fontWeight: '600' }}>
              2. Add state management:
            </CustomText>
            {'\n'}
            const [modalVisible, setModalVisible] = useState(false);
          </CustomText>

          <CustomText
            style={[styles.instructionStep, { color: theme.text.secondary }]}
          >
            <CustomText style={{ fontWeight: '600' }}>
              3. Use the modal:
            </CustomText>
            {'\n'}
            {'<TermsAndPrivacyModal'}
            {'\n  '}visible={'{modalVisible}'}
            {'\n  '}onClose={'{() => setModalVisible(false)}'}
            {'\n  '}onAccept={'{handleAccept}'}
            {'\n  '}requireAcceptance={'{true}'}
            {'\n'}
            {'/>'}'
          </CustomText>

          <CustomText
            style={[styles.instructionStep, { color: theme.text.secondary }]}
          >
            <CustomText style={{ fontWeight: '600' }}>
              4. Wrap with FeatureFlag:
            </CustomText>
            {'\n'}
            {'<FeatureFlag flag="ENABLE_TERMS_AND_PRIVACY_POPUP">'}
            {'\n  '}
            {/* Your modal trigger button */}
            {'\n'}
            {'</FeatureFlag>'}
          </CustomText>
        </View>

        {/* Features List */}
        <View
          style={[
            styles.featuresCard,
            { backgroundColor: theme.background.card },
          ]}
        >
          <CustomText
            style={[styles.featuresTitle, { color: theme.text.primary }]}
          >
            Features Included
          </CustomText>

          {[
            'Full-screen responsive modal',
            'Scrollable content with tabs',
            'Privacy Policy and Terms of Service sections',
            'Acceptance checkbox with validation',
            'Continue button (disabled until accepted)',
            'Close icon at top right corner',
            'Dark/Light theme support',
            'RTL (Right-to-Left) support for Arabic',
            'Full localization (English, French, Arabic)',
            'Feature flag integration',
            'Smooth animations and transitions',
            'Accessible and keyboard-friendly',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Icon name="check-square" size={16} color={theme.text.success} />
              <CustomText
                style={[styles.featureText, { color: theme.text.secondary }]}
              >
                {feature}
              </CustomText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* The Modal */}
      <FeatureFlag flag="ENABLE_TERMS_AND_PRIVACY_POPUP">
        {useDynamicContent ? (
          <TermsAndPrivacyModalDynamic
            visible={modalVisible}
            onClose={handleCloseModal}
            onAccept={handleAccept}
            requireAcceptance={true}
          />
        ) : (
          <TermsAndPrivacyModal
            visible={modalVisible}
            onClose={handleCloseModal}
            onAccept={handleAccept}
            requireAcceptance={true}
          />
        )}
      </FeatureFlag>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionContainer: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  disabledCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  disabledText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  instructionStep: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  dataSourceInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  dataSourceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dataSourceStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default TermsPrivacyDemoScreen;
