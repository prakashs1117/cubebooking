import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import {
  SDSBulletList,
  SDSInfoRow,
  SDSSubSection,
} from '@components/sds/SDSShared';
import type { ArticleSectionTen } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionTen | undefined | null;
}

const SDSSection10: React.FC<Props> = ({ data }) => {
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
      {!!data.hazardousPolymerization && (
        <SDSInfoRow
          label="Hazardous Polymerization"
          value={data.hazardousPolymerization}
          colors={colors}
        />
      )}
      {!!data.reactivity?.length && (
        <SDSSubSection title="Reactivity" colors={colors}>
          <SDSBulletList items={data.reactivity} color={colors.primary} />
        </SDSSubSection>
      )}
      {!!data.chemicalStability?.length && (
        <SDSSubSection title="Chemical Stability" colors={colors}>
          <SDSBulletList
            items={data.chemicalStability}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.conditionsToAvoid?.length && (
        <SDSSubSection title="Conditions to Avoid" colors={colors}>
          <SDSBulletList
            items={data.conditionsToAvoid}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.incompatibleMaterials?.length && (
        <SDSSubSection title="Incompatible Materials" colors={colors}>
          <SDSBulletList
            items={data.incompatibleMaterials}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.hazardousDecompositionProducts?.length && (
        <SDSSubSection title="Hazardous Decomposition Products" colors={colors}>
          <SDSBulletList
            items={data.hazardousDecompositionProducts}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
    </View>
  );
};

export default SDSSection10;
