import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionSix } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionSix | undefined | null;
}

const SDSSection6: React.FC<Props> = ({ data }) => {
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

  const subsections: Array<[string, string[] | undefined]> = [
    ['Personal Precautions', data.personalPrecautions],
    ['Environmental Precautions', data.environmentalPrecautions],
    ['Methods for Cleanup', data.methodsCleanup],
    ['Preventive Measures', data.preventiveMeasures],
  ];

  const visible = subsections.filter(([, v]) => v?.length);
  if (!visible.length)
    return (
      <CustomText style={{ color: theme.text.secondary, fontSize: 13 }}>
        {t('sds.noData')}
      </CustomText>
    );

  return (
    <View style={{ gap: 12 }}>
      {visible.map(([title, items]) => (
        <SDSSubSection key={title} title={title} colors={colors}>
          <SDSBulletList items={items!} color={colors.primary} />
        </SDSSubSection>
      ))}
    </View>
  );
};

export default SDSSection6;
