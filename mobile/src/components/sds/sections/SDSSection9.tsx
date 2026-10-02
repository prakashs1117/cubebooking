import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSInfoRow, SDSBulletList } from '@components/sds/SDSShared';
import type { ArticleSectionNine } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionNine | undefined | null;
}

const SDSSection9: React.FC<Props> = ({ data }) => {
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

  const fields: Array<[string, string | undefined]> = [
    ['Form', data.form],
    ['Color', data.color],
    ['Odor', data.odor],
    ['pH', data.ph],
    ['Melting Point', data.meltingPoint],
    ['Boiling Point', data.boilingPoint],
    ['Flash Point', data.flashPoint],
    ['Evaporation Rate', data.evaporationRate],
    ['Flammability', data.flammability],
    ['Upper Explosive Limit', data.upperExplosiveLimit],
    ['Lower Explosive Limit', data.lowerExplosiveLimit],
    ['Vapour Pressure', data.vapourPressure],
    ['Vapour Density', data.vapourDensity],
    ['Relative Density', data.relativeDensity],
    ['Water Solubility', data.waterSolubility],
    ['Auto-ignition Temperature', data.autoIgnitionTemperature],
    ['Decomposition Temperature', data.decompositionTemperature],
    ['Viscosity', data.viscosity],
    ['log Pow', data.logPow],
  ];

  const visible = fields.filter(([, v]) => v && v.trim() !== '');
  if (!visible.length && !data.otherInformation?.length) {
    return (
      <CustomText style={{ color: theme.text.secondary, fontSize: 13 }}>
        {t('sds.noData')}
      </CustomText>
    );
  }

  return (
    <View>
      {visible.map(([label, value], i) => (
        <SDSInfoRow
          key={label}
          label={label}
          value={value!}
          colors={colors}
          last={i === visible.length - 1 && !data.otherInformation?.length}
        />
      ))}
      {!!data.otherInformation?.length && (
        <View style={{ marginTop: 10 }}>
          <CustomText
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            Other Information
          </CustomText>
          <SDSBulletList items={data.otherInformation} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default SDSSection9;
