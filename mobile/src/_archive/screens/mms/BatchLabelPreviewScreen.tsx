import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import CustomHeader from '@components/navigation/CustomHeader';
import LabelPreview from '@components/label/LabelPreview';
import { TEMPLATE_OPTIONS } from '@components/label/shared/LabelShared';
import type { Article } from '@components/search/ArticleCard';
import type { FavoritesStackParamList } from '@/types/navigation';
import { getFontStyle } from '@utils/fonts';
import { useSDS } from '@hooks/useSDS';

type BatchLabelPreviewNavigationProp = StackNavigationProp<FavoritesStackParamList, 'BatchLabelPreview'>;
type BatchLabelPreviewRouteProp = RouteProp<FavoritesStackParamList, 'BatchLabelPreview'>;

// ─── BatchLabelCard: renders one label with SDS data fetched via hook ────────

interface BatchLabelCardProps {
  article: Article;
  template: string;
}

const BatchLabelCard: React.FC<BatchLabelCardProps> = ({ article, template }) => {
  const { data: sds, isLoading } = useSDS({
    materialNumber: article.materialNumber,
    system: 'NEX',
    enabled: true,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={BaseColors.merckPurple} size="large" />
      </View>
    );
  }

  return (
    <LabelPreview
      articleName={article.articleName}
      materialNumber={article.materialNumber}
      template={template as any}
      articleNumber={sds?.header.articleNumber ?? article.articleNumber}
      casNumber={sds?.section_one.cas ?? article.casNumber}
      hazardPictogramIcons={sds?.section_two.hazardPictogramIcons}
      signalWord={sds?.section_two.signalWord?.[0]}
      hazardStatements={sds?.section_two.hazardStatements}
      otherHazards={sds?.section_two.otherHazards}
      revisionDate={sds?.header.revisionDate}
      noBackground={false}
    />
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const BatchLabelPreviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BatchLabelPreviewNavigationProp>();
  const route = useRoute<BatchLabelPreviewRouteProp>();

  // Use the first template option by default (Big)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATE_OPTIONS[0].key);
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(true);

  const articles: Article[] = route.params?.articles ?? [];

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background.primary }]}>
      <CustomHeader
        title={t('favorites.batchPrint')}
        showBack
        onBackPress={handleBack}
        hideSearch
      />

      {/* Scrollable content including template, disclaimer, and labels */}
      <ScrollView
        style={styles.previewScroll}
        contentContainerStyle={[styles.previewContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Template selector */}
        <View style={[styles.templateSection, { borderBottomColor: theme.border.primary }]}>
          <CaptionText style={[styles.templateLabel, { color: theme.text.secondary }]}>
            {t('label.template')}
          </CaptionText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled
          >
            {TEMPLATE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.templateChip,
                  selectedTemplate === option.key && styles.templateChipActive,
                  {
                    backgroundColor:
                      selectedTemplate === option.key
                        ? BaseColors.merckPurple
                        : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : '#F3F4F6',
                    borderColor:
                      selectedTemplate === option.key ? BaseColors.merckPurple : 'transparent',
                  },
                ]}
                onPress={() => setSelectedTemplate(option.key)}
                activeOpacity={0.7}
              >
                <CaptionText
                  style={[
                    styles.templateChipText,
                    {
                      color:
                        selectedTemplate === option.key ? BaseColors.white : theme.text.primary,
                    },
                  ]}
                >
                  {option.labelKey}
                </CaptionText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Disclaimer banner */}
        <TouchableOpacity
          style={[
            styles.disclaimerSection,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FEF3C7' },
          ]}
          onPress={() => setDisclaimerExpanded(!disclaimerExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.disclaimerHeader}>
            <Icon
              name={disclaimerExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.text.secondary}
            />
            <CaptionText style={[styles.disclaimerTitle, { color: theme.text.secondary }]}>
              {t('label.generateHintTitle')}
            </CaptionText>
          </View>
          {disclaimerExpanded && (
            <CaptionText style={[styles.disclaimerText, { color: theme.text.secondary }]}>
              {t('label.generateHintText')}
            </CaptionText>
          )}
        </TouchableOpacity>

        {/* Label preview cards */}
        {articles.length === 0 ? (
          <View style={styles.emptyState}>
            <CaptionText style={[styles.emptyText, { color: theme.text.tertiary }]}>
              {t('favorites.empty')}
            </CaptionText>
          </View>
        ) : (
          articles.map(article => (
            <View key={article.materialNumber} style={styles.labelContainer}>
              <BatchLabelCard article={article} template={selectedTemplate} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  templateSection: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    paddingLeft: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 12,
    fontFamily: getFontStyle('caption').fontFamily,
    marginBottom: 12,
  },
  templateScroll: {
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 16,
    gap: 8,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateChipActive: {
    borderWidth: 1,
  },
  templateChipText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: getFontStyle('bodySmall').fontFamily,
  },
  previewScroll: {
    flex: 1,
  },
  previewContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  labelContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  loadingCard: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: getFontStyle('caption').fontFamily,
    fontStyle: 'italic',
  },
  disclaimerSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: getFontStyle('caption').fontFamily,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: getFontStyle('caption').fontFamily,
    lineHeight: 16,
    marginTop: 8,
  },
});

export default BatchLabelPreviewScreen;
