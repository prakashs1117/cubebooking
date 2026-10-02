import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';

interface FAQEmptyStateProps {
  title: string;
  message: string;
  icon?: string;
}

/**
 * FAQEmptyState
 *
 * Empty state component for when no FAQs match search/filter
 */
export const FAQEmptyState: React.FC<FAQEmptyStateProps> = ({
  title,
  message,
  icon = 'search',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${theme.text.tertiary}10` },
        ]}
      >
        <Icon name={icon as any} size={48} color={theme.text.tertiary} />
      </View>
      <CustomText style={[styles.title, { color: theme.text.primary }]}>
        {title}
      </CustomText>
      <CustomText style={[styles.message, { color: theme.text.secondary }]}>
        {message}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
