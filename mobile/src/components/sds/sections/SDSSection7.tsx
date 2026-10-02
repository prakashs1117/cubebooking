import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import {
  SDSBulletList,
  SDSInfoRow,
  SDSSubSection,
} from '@components/sds/SDSShared';
import type { ArticleSectionSeven } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionSeven | undefined | null;
}

const SDSSection7: React.FC<Props> = ({ data }) => {
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
      {!!data.storageTemperature && (
        <SDSInfoRow
          label="Storage Temperature"
          value={data.storageTemperature}
          colors={colors}
        />
      )}
      {!!data.storageClass && (
        <SDSInfoRow
          label="Storage Class"
          value={data.storageClass}
          colors={colors}
        />
      )}
      {!!data.handlingPrecautions?.length && (
        <SDSSubSection title="Handling Precautions" colors={colors}>
          <SDSBulletList
            items={data.handlingPrecautions}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.storageConditions?.length && (
        <SDSSubSection title="Storage Conditions" colors={colors}>
          <SDSBulletList
            items={data.storageConditions}
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
    </View>
  );
};

export default SDSSection7;
