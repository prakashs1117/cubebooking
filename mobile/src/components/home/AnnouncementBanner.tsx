import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import CustomText from '@/components/common/CustomText';
import { MegaphoneIcon } from '@/components/icons/components/MegaphoneIcon';
import { ChevronRightIcon } from '@/components/icons/components/ChevronRightIcon';

interface AnnouncementBannerProps {
  tag?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export default function AnnouncementBanner({
  tag = 'Priority · Leadership',
  title = 'Q3 Townhall — Innovation Day 2026',
  description = "Join the EMEA leadership stream live from Darmstadt. Acknowledge to confirm you've read this update.",
  ctaLabel = 'Read & acknowledge',
  onCtaPress,
}: AnnouncementBannerProps) {
  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 14,
      marginBottom: 20,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: '#149B5F',
      overflow: 'visible',
    },
    content: {
      flex: 1,
      width: '100%',
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginBottom: 12,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: '#fff',
      lineHeight: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      lineHeight: 1.4,
      color: '#fff',
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    description: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.7,
      color: 'rgba(255,255,255,0.98)',
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#fff',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 26,
      alignSelf: 'flex-start',
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0B5A37',
      lineHeight: 18,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.tag}>
        <MegaphoneIcon width={12} height={12} color="#fff" />
        <CustomText style={styles.tagText} allowFontScaling={false}>
          {tag}
        </CustomText>
      </View>
      <CustomText style={styles.title} allowFontScaling={false}>
        {title}
      </CustomText>
      <CustomText style={styles.description} allowFontScaling={false}>
        {description}
      </CustomText>
      <TouchableOpacity
        onPress={onCtaPress}
        style={styles.ctaButton}
        activeOpacity={0.8}
      >
        <CustomText style={styles.ctaText} allowFontScaling={false}>
          {ctaLabel}
        </CustomText>
        <ChevronRightIcon width={14} height={14} color="#0B5A37" />
      </TouchableOpacity>
    </View>
  );
}
