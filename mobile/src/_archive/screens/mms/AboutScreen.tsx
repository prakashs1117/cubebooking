import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="merck-logo" size={80} color={theme.text.primary} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h1').fontFamily,
            },
          ]}
        >
          {t('about.title')}
        </Text>

        <Text
          style={[
            styles.version,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {t('common.version')} 1.0.0
        </Text>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
              },
            ]}
          >
            {t('about.description')}
          </Text>
          <Text
            style={[
              styles.sectionText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            This is a React Native 0.83.1 TypeScript application with Firebase
            backend integration, localization support, and dark/light theming.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
              },
            ]}
          >
            {t('about.features')}
          </Text>
          <Text
            style={[
              styles.sectionText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            • Tab-based navigation with drawer{'\n'}• Feature flags system{'\n'}
            • Localization (English, French, Arabic){'\n'}• Dark/Light theme
            support{'\n'}• Firebase authentication{'\n'}• Network-aware data
            fetching
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h3').fontFamily,
              },
            ]}
          >
            {t('about.technologies')}
          </Text>
          <Text
            style={[
              styles.sectionText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            • React Native 0.83.1{'\n'}• TypeScript{'\n'}• Firebase{'\n'}• React
            Navigation v7{'\n'}• TanStack React Query{'\n'}• i18next
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    marginBottom: 32,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AboutScreen;
