import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import {
  Heading2,
  Heading3,
  BodyText,
  Caption,
} from '@components/common/CustomText';
import OTPInput from '@components/auth/OTPInput';
import CustomButton from '@components/common/CustomButton';

/**
 * OTPInputExample
 * Demo screen to showcase the OTP input component
 */
const OTPInputExample: React.FC = () => {
  const { theme } = useTheme();
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('123456');
  const [code3, setCode3] = useState('');
  const [code4, setCode4] = useState('1234');
  const [error1, _setError1] = useState('');
  const [error3, setError3] = useState(
    'Invalid verification code. Please try again.',
  );

  const handleVerify = (code: string) => {
    if (code.length === 6) {
      alert(`Code entered: ${code}`);
    }
  };

  const handleClear = (setter: (value: string) => void) => {
    setter('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      marginBottom: 32,
    },
    title: {
      marginBottom: 8,
    },
    subtitle: {
      lineHeight: 22,
    },
    section: {
      marginBottom: 40,
      padding: 20,
      backgroundColor: theme.background.card,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      marginBottom: 8,
    },
    sectionDescription: {
      marginBottom: 20,
      lineHeight: 20,
    },
    codeDisplay: {
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.background.secondary,
      borderRadius: 8,
      alignItems: 'center',
    },
    codeText: {
      fontFamily: 'Courier',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    button: {
      flex: 1,
    },
    infoBox: {
      marginTop: 32,
      padding: 16,
      backgroundColor: theme.button.primary.background + '10',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.button.primary.background,
    },
    infoTitle: {
      marginBottom: 8,
    },
    infoText: {
      lineHeight: 20,
    },
    featureList: {
      marginTop: 12,
      gap: 8,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    featureBullet: {
      marginTop: 2,
    },
    featureText: {
      flex: 1,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Heading2
          style={[
            styles.title,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h2').fontFamily,
            },
          ]}
        >
          OTP Input Demo
        </Heading2>
        <BodyText
          style={[
            styles.subtitle,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          Beautiful, modern OTP input component with individual square boxes for
          each digit
        </BodyText>
      </View>

      {/* Example 1: Empty State */}
      <View style={styles.section}>
        <Heading3
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Empty State (Auto-Focus)
        </Heading3>
        <Caption
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          Clean, empty boxes ready for input. First box auto-focuses on mount.
        </Caption>

        <OTPInput
          value={code1}
          onChangeText={setCode1}
          error={error1}
          autoFocus={false}
        />

        <View style={styles.codeDisplay}>
          <Caption style={{ color: theme.text.tertiary }}>
            Current Value:
          </Caption>
          <BodyText style={[styles.codeText, { color: theme.text.primary }]}>
            {code1 || '(empty)'}
          </BodyText>
        </View>

        <View style={styles.buttonRow}>
          <CustomButton
            title="Set to 123456"
            onPress={() => setCode1('123456')}
            variant="secondary"
            size="small"
            style={styles.button}
          />
          <CustomButton
            title="Clear"
            onPress={() => handleClear(setCode1)}
            variant="outline"
            size="small"
            style={styles.button}
          />
        </View>
      </View>

      {/* Example 2: Filled State */}
      <View style={styles.section}>
        <Heading3
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Filled State
        </Heading3>
        <Caption
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          All boxes filled with digits. Ready for verification.
        </Caption>

        <OTPInput value={code2} onChangeText={setCode2} autoFocus={false} />

        <CustomButton
          title="Verify Code"
          onPress={() => handleVerify(code2)}
          variant="primary"
          size="large"
          disabled={code2.length !== 6}
          style={{ marginTop: 16 }}
        />
      </View>

      {/* Example 3: Error State */}
      <View style={styles.section}>
        <Heading3
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Error State
        </Heading3>
        <Caption
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          Shows error message and red border when validation fails.
        </Caption>

        <OTPInput
          value={code3}
          onChangeText={setCode3}
          error={error3}
          autoFocus={false}
        />

        <View style={styles.buttonRow}>
          <CustomButton
            title="Clear Error"
            onPress={() => setError3('')}
            variant="secondary"
            size="small"
            style={styles.button}
          />
          <CustomButton
            title="Show Error"
            onPress={() =>
              setError3('Invalid verification code. Please try again.')
            }
            variant="outline"
            size="small"
            style={styles.button}
          />
        </View>
      </View>

      {/* Example 4: 4-Digit Code */}
      <View style={styles.section}>
        <Heading3
          style={[
            styles.sectionTitle,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          Custom Length (4 digits)
        </Heading3>
        <Caption
          style={[
            styles.sectionDescription,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
          ]}
        >
          Configurable length for different OTP formats.
        </Caption>

        <OTPInput
          value={code4}
          onChangeText={setCode4}
          length={4}
          autoFocus={false}
        />

        <View style={styles.codeDisplay}>
          <Caption style={{ color: theme.text.tertiary }}>
            Current Value:
          </Caption>
          <BodyText style={[styles.codeText, { color: theme.text.primary }]}>
            {code4 || '(empty)'}
          </BodyText>
        </View>
      </View>

      {/* Features Info Box */}
      <View style={styles.infoBox}>
        <Heading3
          style={[
            styles.infoTitle,
            {
              color: theme.button.primary.background,
              fontFamily: getFontStyle('h3').fontFamily,
            },
          ]}
        >
          ✨ Features
        </Heading3>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Auto-advance to next box after digit entry
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Intelligent backspace navigation
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Paste full code support
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Animated focus states with scale effect
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Number-only input validation
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Theme-aware colors (dark/light mode)
            </BodyText>
          </View>
          <View style={styles.featureItem}>
            <BodyText
              style={[styles.featureBullet, { color: theme.text.primary }]}
            >
              •
            </BodyText>
            <BodyText
              style={[
                styles.featureText,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Configurable length (4, 6, or custom)
            </BodyText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default OTPInputExample;
