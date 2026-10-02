import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MERCK_TOKENS } from '@theme/merckTokens';
import { FontSize, FontWeight } from '@theme/typography';
import { Radius, Spacing } from '@theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

interface HeroCardProps {
  title: string;
  subtitle?: string;
  gradientColors: [string, string];
  onPress?: () => void;
  badge?: string;
  style?: ViewStyle;
  height?: number;
}

export default function HeroCard({
  title,
  subtitle,
  gradientColors,
  onPress,
  badge,
  style,
  height = 140,
}: HeroCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { height }]}
      >
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    color: '#fff',
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
