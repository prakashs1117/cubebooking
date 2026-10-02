import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@components/icons/Icon';
import { Heading3, BodyText } from '@components/common/CustomText';
import { useTheme, createCommonStyles } from '@theme/index';
import { IconName } from '@components/icons/Icon';

interface CollapsibleSectionProps {
  title: string;
  icon?: IconName;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultExpanded = true,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { theme } = useTheme();
  const commonStyles = createCommonStyles(theme);

  const styles = StyleSheet.create({
    ...commonStyles,
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.border.primary,
      gap: 12,
    },
    headerContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    arrowIcon: {
      marginLeft: 'auto',
    },
    content: {
      paddingVertical: 12,
    },
  });

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          {icon && <Icon name={icon} size={20} color={theme.text.link} />}
          <Heading3 color={theme.text.primary}>{title}</Heading3>
        </View>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.text.tertiary}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>

      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};
