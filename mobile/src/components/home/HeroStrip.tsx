import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import { ChevronRightIcon } from '@/components/icons/components/ChevronRightIcon';

interface HeroStripProps {
  greeting?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export default function HeroStrip({
  greeting = "Good morning, Prakash 👋",
  subtitle = "3 announcements need your acknowledgment, your AI in Pharma seat is confirmed for 16 June, and the Frontend Guild just earned a Spot Award.",
  ctaLabel = 'Review now',
  onCtaPress,
}: HeroStripProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      borderRadius: 10,
      paddingVertical: 20,
      paddingHorizontal: 22,
      backgroundColor: '#149B5F',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      marginBottom: 18,
      overflow: 'hidden',
      position: 'relative',
    },
    textSection: {
      flex: 1,
      zIndex: 1,
    },
    greeting: {
      fontSize: 19,
      fontWeight: '900',
      letterSpacing: -0.01,
      color: '#fff',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12.5,
      lineHeight: 1.5,
      color: 'rgba(255,255,255,0.88)',
      maxWidth: '90%',
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: '#fff',
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 99,
      zIndex: 1,
    },
    ctaText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#0B5A37',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <CustomText style={styles.greeting}>{greeting}</CustomText>
        <CustomText style={styles.subtitle}>{subtitle}</CustomText>
      </View>
      <TouchableOpacity style={styles.ctaButton} onPress={onCtaPress} activeOpacity={0.8}>
        <CustomText style={styles.ctaText}>{ctaLabel}</CustomText>
        <ChevronRightIcon width={14} height={14} color="#0B5A37" />
      </TouchableOpacity>
    </View>
  );
}
