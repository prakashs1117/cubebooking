import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { LegalSection } from '@/types/legal.types';

interface LegalContentSectionProps {
  section: LegalSection;
  showIcon?: boolean;
}

/**
 * LegalContentSection
 *
 * Reusable component for rendering a single legal document section.
 */
export const LegalContentSection: React.FC<LegalContentSectionProps> = ({
  section,
  showIcon = false,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {showIcon && section.icon && (
        <View style={styles.iconContainer}>
          <Icon name={section.icon as any} size={24} color={theme.text.link} />
        </View>
      )}
      <CustomText style={[styles.title, { color: theme.text.primary }]}>
        {section.title}
      </CustomText>
      <CustomText style={[styles.content, { color: theme.text.secondary }]}>
        {section.content}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});
