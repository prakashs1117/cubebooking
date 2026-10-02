import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getFontStyle } from '@utils/fonts';
import CustomText from '@components/common/CustomText';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import type { Article } from '@components/search/ArticleCard';

interface ArticleInfoProps {
  article: Article;
}

const captionFontFamily = getFontStyle('caption').fontFamily;

const ArticleInfo: React.FC<ArticleInfoProps> = ({ article }) => {
  const { theme, isDark } = useTheme();

  const titleColor = isDark ? BaseColors.white : BaseColors.merckPurple;
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : '#6C757D';

  return (
    <View>
      {/* Line 1: Article name */}
      <CustomText
        style={[styles.title, { color: titleColor }]}
        numberOfLines={1}
      >
        {article.articleName}
      </CustomText>

      {/* Line 2: Article number value */}
      <CustomText
        style={[
          styles.articleNumber,
          { fontFamily: captionFontFamily, color: theme.text.primary },
        ]}
        numberOfLines={1}
      >
        {article.articleNumber?.replace(/###/g, '-') ?? '—'}
      </CustomText>

      {/* Line 3: MATERIAL <value>   CAS <value> — justify between */}
      <View style={styles.bottomRow}>
        <View style={styles.inlineField}>
          <CustomText
            style={[
              styles.label,
              { fontFamily: captionFontFamily, color: labelColor },
            ]}
          >
            MATERIAL{' '}
          </CustomText>
          <CustomText
            style={[
              styles.value,
              { fontFamily: captionFontFamily, color: theme.text.primary },
            ]}
            numberOfLines={1}
          >
            {article.materialNumber}
          </CustomText>
        </View>

        {article.casNumber ? (
          <View style={styles.inlineField}>
            <CustomText
              style={[
                styles.label,
                { fontFamily: captionFontFamily, color: labelColor },
              ]}
            >
              CAS{' '}
            </CustomText>
            <CustomText
              style={[
                styles.value,
                { fontFamily: captionFontFamily, color: theme.text.primary },
              ]}
              numberOfLines={1}
            >
              {article.casNumber}
            </CustomText>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 1,
  },
  articleNumber: {
    fontSize: 12,
    marginBottom: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
  },
  inlineField: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    flexShrink: 1,
  },
});

export default ArticleInfo;
