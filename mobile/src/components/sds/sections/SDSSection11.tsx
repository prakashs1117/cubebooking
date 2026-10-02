import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionEleven } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionEleven | undefined | null;
}

const SDSSection11: React.FC<Props> = ({ data }) => {
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
      {!!data.routesOfExposure?.length && (
        <SDSSubSection title="Routes of Exposure" colors={colors}>
          <SDSBulletList items={data.routesOfExposure} color={colors.primary} />
        </SDSSubSection>
      )}
      {!!data.acuteToxicity?.length && (
        <SDSSubSection title="Acute Toxicity" colors={colors}>
          {data.acuteToxicity.map((entry, i) => (
            <View
              key={i}
              style={{
                marginBottom: 6,
                paddingLeft: 8,
                borderLeftWidth: 2,
                borderLeftColor: colors.divider,
              }}
            >
              {!!entry.routeOfAdministration && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  Route: {entry.routeOfAdministration}
                </CustomText>
              )}
              {!!entry.species && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  Species: {entry.species}
                </CustomText>
              )}
              {!!(entry.value && entry.unit) && (
                <CustomText style={{ fontSize: 12, color: colors.primary }}>
                  {entry.value} {entry.unit}
                </CustomText>
              )}
            </View>
          ))}
        </SDSSubSection>
      )}
      {[
        ['Skin Corrosion / Irritation', data.skinCorrosionIrritation],
        ['Serious Eye Damage', data.seriousEyeDamage],
        ['Respiratory Sensitization', data.respiratorySensitization],
        ['Skin Sensitization', data.skinSensitization],
        ['Germ Cell Mutagenicity', data.germCellMutagenicity],
        ['Carcinogenicity', data.carcinogenicity],
        ['Reproductive Toxicity', data.reproductiveToxicity],
        ['Single Exposure (STOT)', data.singleExposure],
        ['Repeated Exposure (STOT)', data.repeatedExposure],
        ['Aspiration Hazard', data.aspirationHazard],
        ['Additional Information', data.additionalInformation],
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

export default SDSSection11;
