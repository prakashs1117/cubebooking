import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSInfoRow, SDSBulletList } from '@components/sds/SDSShared';
import type { ArticleSectionOne } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionOne | undefined | null;
}

const SDSSection1: React.FC<Props> = ({ data }) => {
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

  const fields: Array<[string, string | undefined]> = [
    [t('article.productDetails'), data.productName || data.articleName],
    [t('article.articleNumber'), data.articleNumber?.replace(/###/g, '')],
    [t('article.casNumber'), data.cas],
    ['Emergency Phone', data.emergencyPhone],
    ['Manufacturer', data.manufacturerName],
    ['Address', data.manufacturerAddress],
    ['Product Code', data.productCode],
  ];

  const visibleFields = fields.filter(([, v]) => v && v.trim() !== '');

  return (
    <View>
      {visibleFields.map(([label, value], i) => (
        <SDSInfoRow
          key={label}
          label={label}
          value={value!}
          colors={colors}
          last={
            i === visibleFields.length - 1 &&
            !data.synonyms?.length &&
            !data.identifiedUses?.length
          }
        />
      ))}
      {!!data.synonyms?.length && (
        <View style={{ marginTop: 8 }}>
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
            Synonyms
          </CustomText>
          <SDSBulletList items={data.synonyms} color={colors.primary} />
        </View>
      )}
      {!!data.identifiedUses?.length && (
        <View style={{ marginTop: 8 }}>
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
            Identified Uses
          </CustomText>
          <SDSBulletList items={data.identifiedUses} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default SDSSection1;
