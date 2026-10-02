import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingToggleRow } from '@components/settings/SettingToggleRow';
import { useTheme } from '@theme/index';
import { useTranslation } from 'react-i18next';

const SDS_SECTION_DESCRIPTIONS: Record<number, string> = {
  1: 'Identification of the substance/mixture and of the company',
  2: 'Hazard identification',
  3: 'Composition/information on ingredients',
  4: 'First-aid measures',
  5: 'Fire-fighting measures',
  6: 'Accidental release measures',
  7: 'Handling and storage',
  8: 'Exposure controls/personal protection',
  9: 'Physical and chemical properties',
  10: 'Stability and reactivity',
  11: 'Toxicological information',
  12: 'Ecological information',
  13: 'Disposal considerations',
  14: 'Transport information',
  15: 'Regulatory information',
  16: 'Other information',
};

interface SectionsListProps {
  sections: boolean[];
  onUpdate: (index: number, value: boolean) => void;
  disabled?: boolean;
}

export const SectionsList: React.FC<SectionsListProps> = ({
  sections,
  onUpdate,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: theme.border.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border.primary,
      marginHorizontal: 16,
    },
  });

  return (
    <View style={styles.container}>
      {sections.map((enabled, index) => (
        <React.Fragment key={`section-${index}`}>
          <SettingToggleRow
            label={`${index + 1}. ${t(`sds.section.${index + 1}`)}`}
            description={SDS_SECTION_DESCRIPTIONS[index + 1]}
            value={enabled}
            onValueChange={newValue => onUpdate(index, newValue)}
            disabled={disabled}
            testID={`section-toggle-${index}`}
          />
          {index < sections.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};
