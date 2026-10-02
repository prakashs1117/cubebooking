import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import BookmarkIcon from '@components/icons/BookmarkIcon';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';

interface Feature {
  icon: string;
  textKey: string;
}

interface AuthTabletHeroPanelProps {
  titleKey: string;
  subtitleKey: string;
  features: Feature[];
}

const Colors = {
  white: '#FFFFFF',
};

const AuthTabletHeroPanel: React.FC<AuthTabletHeroPanelProps> = ({
  titleKey,
  subtitleKey,
  features,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.leftColumn}>
      <View style={styles.contentBox}>
        <View style={styles.logoBg}>
          <Image
            source={require('@assets/merck-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.boxTitle}>{t(titleKey)}</Text>
        <Text style={styles.boxSubtitle}>{t(subtitleKey)}</Text>
        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              {feature.icon === 'bookmark' ? (
                <BookmarkIcon size={20} color={Colors.white} />
              ) : (
                <Icon name={feature.icon as any} size={20} color={Colors.white} />
              )}
              <Text style={styles.featureText}>{t(feature.textKey)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leftColumn: {
    flex: 1,
    backgroundColor: BaseColors.merckPurpleDark,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 32,
    maxWidth: 380,
    alignItems: 'center',
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoImage: {
    width: 56,
    height: 56,
    tintColor: Colors.white,
  },
  boxTitle: {
    fontFamily: getFontStyle('h1').fontFamily,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  boxSubtitle: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    fontFamily: getFontStyle('body').fontFamily,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 20,
  },
});

export default AuthTabletHeroPanel;
