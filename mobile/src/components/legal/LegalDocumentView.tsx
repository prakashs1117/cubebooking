import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon, { type IconName } from '@components/icons/Icon';
import { LegalSection } from '@/types/legal.types';
import { LegalContentSection } from './LegalContentSection';

interface LegalDocumentViewProps {
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: LegalSection[];
  headerIcon: IconName;
  showSectionIcons?: boolean;
}

/**
 * LegalDocumentView
 *
 * Complete view for displaying a legal document with header, sections, and metadata.
 */
export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({
  title,
  lastUpdatedLabel,
  lastUpdatedDate,
  sections,
  headerIcon,
  showSectionIcons = false,
}) => {
  const { theme } = useTheme();

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <View style={styles.container}>
      <View style={styles.iconHeader}>
        <Icon name={headerIcon} size={48} color={theme.text.link} />
      </View>

      <CustomText
        style={[styles.title, { color: theme.text.primary, paddingTop: 15 }]}
      >
        {title}
      </CustomText>

      <CustomText style={[styles.lastUpdated, { color: theme.text.tertiary }]}>
        {lastUpdatedLabel}: {lastUpdatedDate}
      </CustomText>

      {sortedSections.map(section => (
        <LegalContentSection
          key={section.id}
          section={section}
          showIcon={showSectionIcons}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});
