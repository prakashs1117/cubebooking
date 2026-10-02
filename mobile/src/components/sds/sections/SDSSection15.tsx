import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import {
  SDSBulletList,
  SDSInfoRow,
  SDSSubSection,
} from '@components/sds/SDSShared';
import type { ArticleSectionFifteen } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionFifteen | undefined | null;
}

const SDSSection15: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = {
    primary: theme.text.primary,
    secondary: theme.text.secondary,
    divider: theme.border.primary,
  };

  if (!data)
    return (
      <CustomText style={{ color: theme.text.secondary, fontSize: 13 }}>
        {t('sds.noData')}
      </CustomText>
    );

  return (
    <View style={{ gap: 12 }}>
      {!!data.chemicalSafetyAssessment && (
        <SDSInfoRow
          label="Chemical Safety Assessment"
          value={data.chemicalSafetyAssessment}
          colors={colors}
        />
      )}
      {[
        [
          'Safety / Health / Environmental Regulations',
          data.safetyHealthEnvironmentalRegulations,
        ],
        ['National Regulations', data.nationalRegulations],
        ['EU Regulations', data.euRegulations],
      ]
        .filter(([, v]) => (v as string[] | undefined)?.length)
        .map(([title, items]) => (
          <SDSSubSection
            key={title as string}
            title={title as string}
            colors={colors}
          >
            <SDSBulletList items={items as string[]} color={colors.primary} />
          </SDSSubSection>
        ))}
    </View>
  );
};

export default SDSSection15;
