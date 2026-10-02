import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSInfoRow } from '@components/sds/SDSShared';
import type { ArticleSectionThree } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionThree | undefined | null;
}

const SDSSection3: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = {
    primary: theme.text.primary,
    secondary: theme.text.secondary,
    divider: theme.border.primary,
  };

  if (!data) {
    return (
      <CustomText style={{ color: theme.text.secondary, fontSize: 13 }}>
        {t('sds.noData')}
      </CustomText>
    );
  }

  const hasCompositions = !!data.compositions?.length;

  return (
    <View>
      {!!data.formula && (
        <SDSInfoRow
          label={t('label.formula')}
          value={data.formula}
          colors={colors}
          last={!data.molar && !hasCompositions}
        />
      )}
      {!!data.molar && (
        <SDSInfoRow
          label={t('label.molarMass')}
          value={data.molar}
          colors={colors}
          last={!hasCompositions}
        />
      )}
      {hasCompositions && (
        <View style={{ marginTop: 8 }}>
          <CustomText
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            Composition
          </CustomText>
          {data.compositions!.map((comp, i) => (
            <View
              key={i}
              style={{
                marginBottom: 10,
                paddingLeft: 8,
                borderLeftWidth: 2,
                borderLeftColor: colors.divider,
              }}
            >
              {!!comp.componentName && (
                <CustomText
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  {comp.componentName}
                </CustomText>
              )}
              {!!comp.casNumber && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  CAS: {comp.casNumber}
                </CustomText>
              )}
              {!!comp.percentage && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  Content: {comp.percentage}
                </CustomText>
              )}
              {!!comp.einecs && (
                <CustomText style={{ fontSize: 12, color: colors.secondary }}>
                  EINECS: {comp.einecs}
                </CustomText>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SDSSection3;
