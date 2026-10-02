import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionEight } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionEight | undefined | null;
}

const SDSSection8: React.FC<Props> = ({ data }) => {
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
      {!!data.componentExposureLimits?.length && (
        <SDSSubSection title="Exposure Limits" colors={colors}>
          {data.componentExposureLimits.map((lim, i) => (
            <View
              key={i}
              style={{
                marginBottom: 8,
                paddingLeft: 8,
                borderLeftWidth: 2,
                borderLeftColor: colors.divider,
              }}
            >
              {!!lim.component && (
                <CustomText
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  {lim.component}
                </CustomText>
              )}
              {!!lim.twaPpm && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  TWA: {lim.twaPpm} ppm
                </CustomText>
              )}
              {!!lim.twaMgM3 && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  TWA: {lim.twaMgM3} mg/m³
                </CustomText>
              )}
              {!!lim.stelPpm && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  STEL: {lim.stelPpm} ppm
                </CustomText>
              )}
              {!!lim.stelMgM3 && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  STEL: {lim.stelMgM3} mg/m³
                </CustomText>
              )}
            </View>
          ))}
        </SDSSubSection>
      )}
      {!!data.engineeringMeasures?.length && (
        <SDSSubSection title="Engineering Measures" colors={colors}>
          <SDSBulletList
            items={data.engineeringMeasures}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.respiratoryProtection?.length && (
        <SDSSubSection title="Respiratory Protection" colors={colors}>
          <SDSBulletList
            items={data.respiratoryProtection}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.handProtection?.length && (
        <SDSSubSection title="Hand Protection" colors={colors}>
          <SDSBulletList items={data.handProtection} color={colors.primary} />
        </SDSSubSection>
      )}
      {!!data.eyeFaceProtection?.length && (
        <SDSSubSection title="Eye / Face Protection" colors={colors}>
          <SDSBulletList
            items={data.eyeFaceProtection}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.skinBodyProtection?.length && (
        <SDSSubSection title="Skin / Body Protection" colors={colors}>
          <SDSBulletList
            items={data.skinBodyProtection}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.hygieneRecommendations?.length && (
        <SDSSubSection title="Hygiene Recommendations" colors={colors}>
          <SDSBulletList
            items={data.hygieneRecommendations}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
    </View>
  );
};

export default SDSSection8;
