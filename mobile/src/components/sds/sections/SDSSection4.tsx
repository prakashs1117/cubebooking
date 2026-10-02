import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionFour } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionFour | undefined | null;
}

const SDSSection4: React.FC<Props> = ({ data }) => {
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
    ['General Instructions', data.generalInstructions],
    ['Eye Contact', data.eyeContact],
    ['Skin Contact', data.skinContact],
    ['Inhalation', data.inhalation],
    ['Ingestion', data.ingestion],
    ['Protection for First Aiders', data.protectionForFirstAiders],
    ['Symptoms / Effects', data.symptomsEffects],
  ];

  const visible = subsections.filter(([, v]) => v?.length);

  return (
    <View style={{ gap: 12 }}>
      {!!data.immediateAttentionRequired && (
        <CustomText
          style={{ fontSize: 13, fontWeight: '600', color: theme.text.error }}
        >
          {data.immediateAttentionRequired}
        </CustomText>
      )}
      {visible.map(([title, items]) => (
        <SDSSubSection key={title} title={title} colors={colors}>
          <SDSBulletList items={items!} color={colors.primary} />
        </SDSSubSection>
      ))}
    </View>
  );
};

export default SDSSection4;
