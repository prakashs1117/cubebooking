import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { SDSBulletList, SDSSubSection } from '@components/sds/SDSShared';
import type { ArticleSectionTwo } from '@services/api/atlasSDSService';
import { useTheme } from '@theme/index';

interface Props {
  data: ArticleSectionTwo | undefined | null;
}

const SDSSection2: React.FC<Props> = ({ data }) => {
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

  return (
    <View style={{ gap: 12 }}>
      {!!data.hazardClassification?.length && (
        <SDSSubSection title="Hazard Classification" colors={colors}>
          <SDSBulletList
            items={data.hazardClassification}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.signalWord?.length && (
        <View>
          <CustomText
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: theme.text.primary,
            }}
          >
            {data.signalWord.join(', ')}
          </CustomText>
        </View>
      )}
      {!!data.hazardStatements?.length && (
        <SDSSubSection title={t('label.hazardStatements')} colors={colors}>
          <SDSBulletList items={data.hazardStatements} color={colors.primary} />
        </SDSSubSection>
      )}
      {!!data.hazardStatementsSec?.length && (
        <SDSSubSection title="Secondary Hazard Statements" colors={colors}>
          <SDSBulletList
            items={data.hazardStatementsSec}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.precautionaryStatements?.prevention?.length && (
        <SDSSubSection title={t('label.prevention')} colors={colors}>
          <SDSBulletList
            items={data.precautionaryStatements.prevention}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.precautionaryStatements?.response?.length && (
        <SDSSubSection title={t('label.response')} colors={colors}>
          <SDSBulletList
            items={data.precautionaryStatements.response}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.precautionaryStatements?.storage?.length && (
        <SDSSubSection title={t('label.storage')} colors={colors}>
          <SDSBulletList
            items={data.precautionaryStatements.storage}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.precautionaryStatements?.disposal?.length && (
        <SDSSubSection title={t('label.disposal')} colors={colors}>
          <SDSBulletList
            items={data.precautionaryStatements.disposal}
            color={colors.primary}
          />
        </SDSSubSection>
      )}
      {!!data.emergencySummary?.length && (
        <SDSSubSection title="Emergency Summary" colors={colors}>
          <SDSBulletList items={data.emergencySummary} color={colors.primary} />
        </SDSSubSection>
      )}
      {!!data.otherHazards?.length && (
        <SDSSubSection title="Other Hazards" colors={colors}>
          <SDSBulletList items={data.otherHazards} color={colors.primary} />
        </SDSSubSection>
      )}
    </View>
  );
};

export default SDSSection2;
