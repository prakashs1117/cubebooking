import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { GenericSectionRenderer } from '@components/sds/SDSShared';
import { useTheme } from '@theme/index';

interface Props {
  data: any;
}

const SDSSection16: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = {
    primary: theme.text.primary,
    secondary: theme.text.secondary,
    divider: theme.border.primary,
  };

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <CustomText style={{ color: theme.text.secondary, fontSize: 13 }}>
        {t('sds.noData')}
      </CustomText>
    );
  }

  return (
    <View>
      <GenericSectionRenderer data={data} colors={colors} />
    </View>
  );
};

export default SDSSection16;
