import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionTwelve } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionTwelve | undefined | null;
}

const SDSSection12: React.FC<Props> = ({ data }) => {
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
      {!!data.toxicity?.length && (
        <SDSSubSection title="Ecotoxicity" colors={colors}>
          {data.toxicity.map((entry, i) => (
            <View
              key={i}
              style={{
                marginBottom: 6,
                paddingLeft: 8,
                borderLeftWidth: 2,
                borderLeftColor: colors.divider,
              }}
            >
              {!!entry.organism && (
                <CustomText
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  {entry.organism}
                </CustomText>
              )}
              {!!(entry.value && entry.unit) && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  {entry.value} {entry.unit}
                  {entry.duration ? ` / ${entry.duration}` : ''}
                </CustomText>
              )}
            </View>
          ))}
        </SDSSubSection>
      )}
      {[
        ['Persistence and Degradability', data.persistenceDegradability],
        ['Bioaccumulative Potential', data.bioaccumulativePotential],
        ['Mobility in Soil', data.mobilityInSoil],
        ['Other Adverse Effects', data.otherAdverseEffects],
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

export default SDSSection12;
