import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppModal, { type ModalConfig } from '@components/modals/AppModal';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from '@components/icons/Icon';
import { CustomText } from '@components/common/CustomText';
import CustomHeader from '@components/navigation/CustomHeader';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { SearchStackParamList } from '@/types/navigation';
import { useSDS } from '@hooks/useSDS';
import { useSettings } from '@hooks/useSettings';
import { useRegion } from '@context/RegionContext';
import { useLocaleStore } from '@/stores/localeStore';
import { captureRef } from 'react-native-view-shot';
import { analytics } from '@services/analyticsService';
import SafetyTagDisclaimerModal from '@components/modals/SafetyTagDisclaimerModal';
import LabelImageViewerModal from '@components/modals/LabelImageViewerModal';
import PrintDetailsModal, { type PrintDetails } from '@components/modals/PrintDetailsModal';
import SDSSectionGrid from '@components/sds/SDSSectionGrid';
import SDSSectionSheet from '@components/sds/SDSSectionSheet';
import LabelPreview, {
  type TemplateKey,
  TEMPLATE_OPTIONS,
  GHSPictogram,
  QRCodeSVG,
} from '@components/label/LabelPreview';

const DISCLAIMER_KEY = '@safety_tag_disclaimer_shown';

// ─── Navigation types ────────────────────────────────────────────────────────

type SafetyLabelRouteProp = RouteProp<SearchStackParamList, 'SafetyLabel'>;

// ─── Constants ───────────────────────────────────────────────────────────────

const BRAND_PURPLE = BaseColors.merckPurple;

const UNIT_OPTIONS = [
  'L',
  'mL',
  'μL',
  'g',
  'mg',
  'μg',
  'ng',
  'lbs',
  'oz',
  'gal',
] as const;
type UnitType = (typeof UNIT_OPTIONS)[number];

// ─── Picker Modal ─────────────────────────────────────────────────────────────

interface PickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly T[];
  selected: T | '';
  renderLabel: (val: T) => string;
  onSelect: (val: T) => void;
  onDismiss: () => void;
  isDark: boolean;
}

function PickerModal<T extends string>({
  visible,
  title,
  options,
  selected,
  renderLabel,
  onSelect,
  onDismiss,
  isDark,
}: PickerModalProps<T>) {
  const { t } = useTranslation();
  const { theme, isDark: pickerIsDark } = useTheme();
  const sheetBg = theme.background.primary;
  const titleColor = theme.text.primary;
  const rowBg = pickerIsDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6';
  const rowText = theme.text.primary;
  const cancelColor = theme.text.secondary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={pickerStyles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
      />
      <View style={[pickerStyles.sheet, { backgroundColor: sheetBg }]}>
        <View style={pickerStyles.handle} />
        <CustomText style={[pickerStyles.title, { color: titleColor }]}>
          {title}
        </CustomText>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map(opt => {
            const isSelected = opt === selected;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  pickerStyles.row,
                  isSelected && { backgroundColor: rowBg },
                ]}
                onPress={() => {
                  onSelect(opt);
                  onDismiss();
                }}
                activeOpacity={0.7}
              >
                <CustomText
                  style={[
                    pickerStyles.rowText,
                    {
                      color: isSelected
                        ? isDark
                          ? BaseColors.merckPurpleLight
                          : BRAND_PURPLE
                        : rowText,
                    },
                  ]}
                >
                  {renderLabel(opt)}
                </CustomText>
                {isSelected && (
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={isDark ? BaseColors.merckPurpleLight : BRAND_PURPLE}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={pickerStyles.cancelBtn} onPress={onDismiss}>
          <CustomText style={[pickerStyles.cancelText, { color: cancelColor }]}>
            {t('label.cancel')}
          </CustomText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: '72%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowText: { flex: 1, fontSize: 15 },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15 },
});

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  cardBg: string;
  titleColor: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  cardBg,
  titleColor,
}) => (
  <View style={[sectionStyles.card, { backgroundColor: cardBg }]}>
    <View style={sectionStyles.titleRow}>
      <View style={sectionStyles.titleAccent} />
      <CustomText style={[sectionStyles.title, { color: titleColor }]}>
        {title}
      </CustomText>
    </View>
    {children}
  </View>
);

const sectionStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 8,
  },
  titleAccent: {
    width: 3,
    height: 16,
    backgroundColor: BRAND_PURPLE,
    borderRadius: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
});

// ─── Info Row ─────────────────────────────────────────────────────────────────
// ─── Loading skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC<{ shimmer: string }> = ({ shimmer }) => (
  <View style={skeletonStyles.wrapper}>
    {([120, 80, 160, 100] as const).map((w, i) => (
      <View
        key={i}
        style={[
          skeletonStyles.bar,
          skeletonStyles[i % 2 === 0 ? 'barStart' : 'barEnd'],
          { width: w, backgroundColor: shimmer },
        ]}
      />
    ))}
    <View
      style={[
        skeletonStyles.block,
        skeletonStyles.blockTall,
        { backgroundColor: shimmer },
      ]}
    />
    <View
      style={[
        skeletonStyles.block,
        skeletonStyles.blockShort,
        { backgroundColor: shimmer },
      ]}
    />
  </View>
);

const skeletonStyles = StyleSheet.create({
  wrapper: { gap: 12, paddingTop: 8 },
  bar: { height: 14, borderRadius: 7 },
  barStart: { alignSelf: 'flex-start' as const },
  barEnd: { alignSelf: 'flex-end' as const },
  block: { borderRadius: 12 },
  blockTall: { height: 80 },
  blockShort: { height: 60 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SafetyLabelScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<SafetyLabelRouteProp>();
  const { article } = route.params;
  const { theme, isDark } = useTheme();

  // Derived theme tokens
  const bg = theme.background.primary;
  const cardBg = theme.background.card;
  const textPrimary = theme.text.primary;
  const textSecondary = theme.text.secondary;
  const dividerColor = theme.border.primary;
  const errorColor = theme.text.error;
  const headerBg = isDark ? BaseColors.merckPurpleDark : BRAND_PURPLE;
  const accentColor = isDark ? '#FFFFFF' : BRAND_PURPLE;

  // Region + locale (replaces hardcoded 'US')
  const { region } = useRegion();
  const language = useLocaleStore(s => s.language).toUpperCase();
  const country = region === 'US' ? 'US' : 'EU';

  // Defer all heavy work until after the navigation animation completes
  const [screenReady, setScreenReady] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setScreenReady(true);
    });
    return () => task.cancel();
  }, []);

  // SDS data fetch — only starts after navigation animation is done
  const {
    data: sds,
    isLoading,
    isError,
    refetch,
  } = useSDS({
    materialNumber: article.materialNumber,
    system: 'NEX',
    country,
    language,
    enabled: screenReady,
  });

  // Get user settings to determine which SDS sections to display
  const { settings } = useSettings();

  // Disclaimer gate state — deferred behind screenReady
  const [disclaimerDone, setDisclaimerDone] = useState(false);
  useEffect(() => {
    if (!screenReady) return;
    AsyncStorage.getItem(DISCLAIMER_KEY).then(v =>
      setDisclaimerDone(v === 'true'),
    );
  }, [screenReady]);
  const handleDisclaimerAccept = useCallback(async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    setDisclaimerDone(true);
  }, []);

  // SDS section sheet state
  const [showSDSSheet, setShowSDSSheet] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const handleSectionPress = useCallback((idx: number) => {
    setActiveSectionIdx(idx);
    setShowSDSSheet(true);
  }, []);

  const labelCardRef = useRef<View>(null);
  const [labelImageUri, setLabelImageUri] = useState<string | null>(null);

  const handleLabelPress = useCallback(async () => {
    try {
      const startTime = Date.now();
      const uri = await captureRef(labelCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        snapshotContentContainer: false,
      });
      const generationTime = Date.now() - startTime;
      setLabelImageUri(uri);

      // Log analytics for label generated
      const hazardCategories = hazardPictogramIcons?.map((icon: any) => icon.title ?? icon.name ?? 'Unknown').filter(Boolean) ?? [];
      analytics.logLabelGenerated({
        material_number: article.materialNumber,
        product_name: article.articleName,
        label_count: 1,
        label_type: 'safety_tag',
        template_size: previewTemplate,
        hazard_categories: hazardCategories,
        hazard_count: hazardCategories.length,
        pictogram_count: hazardPictogramIcons?.length ?? 0,
        rotation_applied: previewRotation !== 0,
        validity_area: 'EU',
        language: 'EN',
        generation_time_ms: generationTime,
      });
    } catch (error) {
      console.warn('Failed to generate label:', error);
    }
  }, [article.materialNumber, article.articleName, previewTemplate, previewRotation, hazardPictogramIcons]);

  const [showPrintDetails, setShowPrintDetails] = useState(false);

  // Live label state
  const [template, setTemplate] = useState<TemplateKey>('big');
  const [_amount, _setAmount] = useState('');
  const [unit, setUnit] = useState<UnitType | ''>('');
  const [_extraText, _setExtraText] = useState('');
  const [_rotation, setRotation] = useState<number>(0);
  const [_amountError, _setAmountError] = useState(false);
  const [_unitError, _setUnitError] = useState(false);

  // Preview state — only updates on "Update" press
  const [previewTemplate, setPreviewTemplate] = useState<TemplateKey>('big');
  const [previewAmount, setPreviewAmount] = useState('');
  const [previewUnit, setPreviewUnit] = useState<UnitType | ''>('');
  const [previewExtra, setPreviewExtra] = useState('');
  const [previewFillDate, setPreviewFillDate] = useState('');
  const [previewRotation, setPreviewRotation] = useState<number>(0);

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  // Derive SDS-enriched values — memoized to avoid re-computation on every render
  const {
    revisionDate,
    casNumber,
    articleNumber,
    hazardPictogramIcons,
    signalWords,
    hazardStatements,
    otherHazards,
    precStatements,
  } = useMemo(() => ({
    revisionDate: sds?.header?.revisionDate ?? article.revisionDate ?? '',
    casNumber: sds?.section_one?.cas ?? article.casNumber ?? '',
    articleNumber: (sds?.header?.articleNumber ?? sds?.section_one?.articleNumber ?? '')
      .replace(/###/g, ' ')
      .trim(),
    hazardPictogramIcons:
      sds?.section_two?.hazardPictogramIcons ??
      article.hazardPictogramIcons ??
      [],
    signalWords: sds?.section_two?.signalWord ?? [],
    hazardStatements: sds?.section_two?.hazardStatements ?? [],
    otherHazards: sds?.section_two?.otherHazards ?? [],
    precStatements: sds?.section_two?.precautionaryStatements,
  }), [sds, article]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleUnitSelect = useCallback((val: UnitType) => {
    setUnit(val);
  }, []);

  const handleShare = useCallback(() => {
    // Log analytics for label share (even if not implemented yet)
    analytics.logLabelShared({
      label_count: 1,
      share_method: 'pdf_download',
      validity_area: 'EU',
      success: false,
    });
    setModal({
      variant: 'info',
      title: t('label.printShare'),
      message: t('label.printShareComingSoon'),
    });
  }, [t]);

  const handlePrintDetailsUpdate = useCallback(
    async (details: PrintDetails) => {
      const tmpl = details.template as TemplateKey;
      setTemplate(tmpl);
      setPreviewTemplate(tmpl);
      setPreviewAmount(details.amount);
      setPreviewExtra(details.extraText);
      setPreviewFillDate(details.fillDate);
      if (UNIT_OPTIONS.includes(details.unit as any)) {
        const u = details.unit as UnitType;
        setUnit(u);
        setPreviewUnit(u);
      } else {
        setUnit('');
        setPreviewUnit('');
      }
    },
    [],
  );

  const handleTemplateChange = useCallback((key: TemplateKey) => {
    setTemplate(key);
    setRotation(0);
    setPreviewRotation(0);
  }, []);

  const templateLabel = useMemo(
    () =>
      TEMPLATE_OPTIONS.find(opt => opt.key === template)?.labelKey ?? template,
    [template],
  );

  return (
    <View style={[screenStyles.container, { backgroundColor: bg }]}>
      <CustomHeader
        title={t('label.title')}
        showBack
        onBackPress={handleBack}
        hideSearch
      />

      <ScrollView
        style={screenStyles.scroll}
        contentContainerStyle={[
          screenStyles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Label Preview ── */}
        <SectionCard
          title={t('label.preview')}
          cardBg={cardBg}
          titleColor={textSecondary}
        >
          <TouchableOpacity
            style={screenStyles.labelPreviewPadding}
            onPress={handleLabelPress}
            activeOpacity={0.8}
            disabled={!screenReady}
          >
            {!screenReady ? (
              <View style={screenStyles.labelLoadingPlaceholder}>
                <ActivityIndicator size="small" color={accentColor} />
              </View>
            ) : (
            <LabelPreview
              template={previewTemplate}
              articleName={article.articleName}
              materialNumber={article.materialNumber}
              articleNumber={articleNumber}
              casNumber={casNumber}
              amount={previewAmount}
              unit={previewUnit}
              revisionDate={revisionDate}
              fillDate={previewFillDate}
              extraText={previewExtra}
              rotation={previewRotation as 0 | 90 | 180 | 270}
              hazardPictogramIcons={hazardPictogramIcons}
              signalWord={signalWords[0]}
              hazardStatements={hazardStatements}
              otherHazards={otherHazards}
              isDark={isDark}
              viewRef={labelCardRef}
            />
            )}
            <View style={screenStyles.inspectHint}>
              <Icon name="search" size={14} color={textSecondary} />
              <CustomText
                style={[screenStyles.inspectHintText, { color: textSecondary }]}
              >
                {screenReady ? t('label.tapToView') : t('common.loading')}
              </CustomText>
            </View>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Print Details Button ── */}
        <TouchableOpacity
          style={[
            screenStyles.printDetailsBtn,
            {
              backgroundColor: cardBg,
              borderColor: accentColor,
            },
          ]}
          onPress={() => setShowPrintDetails(true)}
          activeOpacity={0.75}
        >
          <Icon name="options" size={18} color={accentColor} />
          <View style={screenStyles.printDetailsBtnContent}>
            <CustomText
              style={[
                screenStyles.printDetailsBtnTitle,
                { color: textPrimary },
              ]}
            >
              {t('label.updateLabel')}
            </CustomText>
            <CustomText
              style={[
                screenStyles.printDetailsBtnSubtitle,
                { color: textSecondary },
              ]}
            >
              {templateLabel}
              {previewAmount && ` • ${previewAmount} ${previewUnit}`}
            </CustomText>
          </View>
          <Icon name="chevron-down" size={16} color={textSecondary} />
        </TouchableOpacity>

        {/* ─────────────────────────────────────────── */}
        {/* ── SDS Data Sections ── */}
        {/* ─────────────────────────────────────────── */}

        <View style={screenStyles.sdsDivider}>
          <View
            style={[
              screenStyles.sdsDividerLine,
              { backgroundColor: dividerColor },
            ]}
          />
          <CustomText
            style={[screenStyles.sdsDividerLabel, { color: textSecondary }]}
          >
            {t('label.sdsData')}
          </CustomText>
          <View
            style={[
              screenStyles.sdsDividerLine,
              { backgroundColor: dividerColor },
            ]}
          />
        </View>

        {/* Loading / Error states */}
        {isLoading && (
          <View style={[screenStyles.stateBox, { backgroundColor: cardBg }]}>
            <ActivityIndicator size="small" color={accentColor} />
            <CustomText
              style={[screenStyles.stateText, { color: textSecondary }]}
            >
              {t('label.loadingData')}
            </CustomText>
          </View>
        )}

        {isError && !isLoading && (
          <View style={[screenStyles.stateBox, { backgroundColor: cardBg }]}>
            <Icon name="alert-circle" size={28} color={errorColor} />
            <CustomText style={[screenStyles.stateText, { color: errorColor }]}>
              {t('label.loadError')}
            </CustomText>
            <TouchableOpacity
              onPress={() => refetch()}
              style={[screenStyles.retryBtn, { backgroundColor: BRAND_PURPLE }]}
            >
              <CustomText style={screenStyles.retryBtnText}>
                {t('label.retry')}
              </CustomText>
            </TouchableOpacity>
          </View>
        )}

        {sds && (
          <>
            {/* ── Safety Tag ── */}
            <SectionCard
              title={t('safetyTag.generate')}
              cardBg={cardBg}
              titleColor={textSecondary}
            >
              {/* DataMatrix placeholder (consistent with QR placeholder approach) */}
              <View style={sdsStyles.safetyTagRow}>
                <View
                  style={[
                    sdsStyles.dataMatrixBox,
                    { borderColor: dividerColor },
                  ]}
                >
                  <CustomText
                    style={[
                      sdsStyles.dataMatrixLabel,
                      { color: textSecondary },
                    ]}
                  >
                    {t('safetyTag.dataMatrix')}
                  </CustomText>
                  <CustomText
                    style={[sdsStyles.dataMatrixCode, { color: textPrimary }]}
                    numberOfLines={2}
                  >
                    {sds.section_one.articleNumber?.replace(/###/g, '') ||
                      article.materialNumber}
                  </CustomText>
                </View>
                <View style={sdsStyles.tagInfo}>
                  <CustomText
                    style={[sdsStyles.tagName, { color: textPrimary }]}
                    numberOfLines={2}
                  >
                    {article.articleName}
                  </CustomText>
                  {!!casNumber && (
                    <CustomText
                      style={[sdsStyles.tagMeta, { color: textSecondary }]}
                    >
                      {t('label.cas')}: {casNumber}
                    </CustomText>
                  )}
                  <CustomText
                    style={[sdsStyles.tagMeta, { color: accentColor }]}
                  >
                    {sds.section_one.articleNumber?.replace(/###/g, '') ||
                      article.materialNumber}
                  </CustomText>
                  {!!(previewAmount && previewUnit) && (
                    <CustomText
                      style={[sdsStyles.tagMeta, { color: textSecondary }]}
                    >
                      {previewAmount} {previewUnit}
                    </CustomText>
                  )}
                </View>
              </View>

              {/* GHS Pictograms (3×3 grid, up to 9) */}
              {hazardPictogramIcons.length > 0 && (
                <View style={sdsStyles.tagPictoGrid}>
                  {hazardPictogramIcons.slice(0, 9).map(code => (
                    <GHSPictogram key={code} code={code} size={44} />
                  ))}
                </View>
              )}

              {/* Signal word + hazard text */}
              {signalWords.length > 0 && (
                <CustomText
                  style={[sdsStyles.tagSignalWord, { color: accentColor }]}
                >
                  {signalWords[0]}
                </CustomText>
              )}
              {hazardStatements.length > 0 && (
                <View style={sdsStyles.tagHazardList}>
                  {hazardStatements.map((s, i) => (
                    <CustomText
                      key={i}
                      style={[sdsStyles.tagHazardText, { color: textPrimary }]}
                    >
                      • {s}
                    </CustomText>
                  ))}
                </View>
              )}
              {precStatements?.prevention?.length ? (
                <View style={sdsStyles.tagHazardList}>
                  <CustomText
                    style={[sdsStyles.tagPrecTitle, { color: textSecondary }]}
                  >
                    {t('label.prevention')}
                  </CustomText>
                  {precStatements.prevention.map((s, i) => (
                    <CustomText
                      key={i}
                      style={[sdsStyles.tagHazardText, { color: textPrimary }]}
                    >
                      • {s}
                    </CustomText>
                  ))}
                </View>
              ) : null}

              {/* Legal footer */}
              <View
                style={[sdsStyles.tagFooter, { borderTopColor: dividerColor }]}
              >
                <CustomText
                  style={[sdsStyles.tagFooterText, { color: textSecondary }]}
                >
                  {t('safetyTag.footer')}
                </CustomText>
              </View>
            </SectionCard>

            {/* ── Full SDS — 16 section grid ── */}
            <View style={screenStyles.sdsDivider}>
              <View
                style={[
                  screenStyles.sdsDividerLine,
                  { backgroundColor: dividerColor },
                ]}
              />
              <CustomText
                style={[screenStyles.sdsDividerLabel, { color: textSecondary }]}
              >
                {t('sds.fullSDS')}
              </CustomText>
              <View
                style={[
                  screenStyles.sdsDividerLine,
                  { backgroundColor: dividerColor },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                screenStyles.viewSdsBtn,
                { backgroundColor: BRAND_PURPLE },
              ]}
              onPress={() => handleSectionPress(0)}
              activeOpacity={0.85}
            >
              <CustomText style={screenStyles.viewSdsBtnText}>
                {t('sds.viewAllSections')}
              </CustomText>
            </TouchableOpacity>

            <SDSSectionGrid
              sds={sds}
              isDark={isDark}
              onSectionPress={handleSectionPress}
              enabledSections={settings?.sections}
            />

            {/* ── QR Code card ── */}
            <SectionCard
              title={t('label.qrCode')}
              cardBg={cardBg}
              titleColor={textSecondary}
            >
              <View style={sdsStyles.qrCard}>
                <QRCodeSVG
                  value={`https://www.sigmaaldrich.com/SDS/MSDS/DisplayMSDSPage.do?country=${country}&language=${language}&productNumber=${article.materialNumber}`}
                  size={120}
                  color={textPrimary}
                  bgColor={theme.background.card}
                />
                <View style={sdsStyles.qrInfo}>
                  <CustomText
                    style={[sdsStyles.qrArticle, { color: textPrimary }]}
                    numberOfLines={2}
                  >
                    {article.articleName}
                  </CustomText>
                  <CustomText style={[sdsStyles.qrMat, { color: accentColor }]}>
                    {article.materialNumber}
                  </CustomText>
                  {revisionDate ? (
                    <CustomText
                      style={[sdsStyles.qrDate, { color: textSecondary }]}
                    >
                      {t('label.revisionDate')}: {revisionDate}
                    </CustomText>
                  ) : null}
                </View>
              </View>
            </SectionCard>
          </>
        )}

        {/* Skeleton while loading */}
        {isLoading && (
          <LoadingSkeleton shimmer={isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'} />
        )}
      </ScrollView>

      {/* Pickers */}
      <PickerModal
        visible={showTemplatePicker}
        title={t('label.selectLabelSize')}
        options={TEMPLATE_OPTIONS.map(opt => opt.key)}
        selected={template}
        renderLabel={key =>
          TEMPLATE_OPTIONS.find(opt => opt.key === key)?.labelKey ?? key
        }
        onSelect={handleTemplateChange}
        onDismiss={() => setShowTemplatePicker(false)}
        isDark={isDark}
      />

      <PickerModal
        visible={showUnitPicker}
        title={t('label.selectUnit')}
        options={UNIT_OPTIONS}
        selected={unit}
        renderLabel={u => u}
        onSelect={handleUnitSelect}
        onDismiss={() => setShowUnitPicker(false)}
        isDark={isDark}
      />
      <AppModal config={modal} onClose={() => setModal(null)} />

      {/* Safety Tag disclaimer — shown once on first visit */}
      <SafetyTagDisclaimerModal
        visible={!disclaimerDone}
        onAccept={handleDisclaimerAccept}
      />

      <PrintDetailsModal
        visible={showPrintDetails}
        onClose={() => setShowPrintDetails(false)}
        onUpdate={handlePrintDetailsUpdate}
        initialTemplate={previewTemplate}
        initialAmount={previewAmount}
        initialUnit={previewUnit}
        initialFillDate={previewFillDate}
        initialExtraText={previewExtra}
      />

      {/* Remaining heavy modals — lazy-mounted after screen is ready */}
      {screenReady && (
        <>
          <LabelImageViewerModal
            visible={!!labelImageUri}
            uri={labelImageUri}
            onClose={() => setLabelImageUri(null)}
          />
          {sds ? (
            <SDSSectionSheet
              visible={showSDSSheet}
              sds={sds}
              initialSection={activeSectionIdx}
              isDark={isDark}
              onClose={() => setShowSDSSheet(false)}
              enabledSections={settings?.sections}
              materialNumber={article.materialNumber}
              productName={article.articleName}
              validityArea={country === 'US' ? 'US' : 'EU'}
              language={language as 'EN' | 'FR' | 'AR' | 'ZH'}
            />
          ) : null}
        </>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const screenStyles = StyleSheet.create({
  container: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, gap: 12 },
  labelLoadingPlaceholder: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  updateHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputLabel: { width: 110, fontSize: 13, flexShrink: 0 },
  inputValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputValueText: { flex: 1, fontSize: 14, fontWeight: '500' },

  amountRow: { flexDirection: 'row', gap: 10 },
  amountField: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  amountInput: { fontSize: 15 },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  unitText: { fontSize: 15, flex: 1 },
  fieldError: { borderWidth: 1.5 },
  errorText: { fontSize: 12, marginTop: -6, marginLeft: 4 },

  extraContainer: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  extraInput: { fontSize: 14, minHeight: 72, maxHeight: 120 },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },

  rotationContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rotationLabel: { fontSize: 13, marginBottom: 10, fontWeight: '600' },
  rotationButtons: { flexDirection: 'row', gap: 8 },
  rotateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  rotateBtnText: { fontSize: 14 },
  rotateBtnTextActive: { fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 13,
  },
  shareBtnText: { fontSize: 14, fontWeight: '600' },
  updateBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 13,
  },
  updateBtnDisabled: { opacity: 0.45 },
  updateBtnText: { fontSize: 14, fontWeight: '700' },
  labelPreviewPadding: { paddingHorizontal: 0, paddingBottom: 0 },
  inspectHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  inspectHintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  printDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 16,
    marginBottom: 16,
  },
  printDetailsBtnContent: {
    flex: 1,
  },
  printDetailsBtnTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  printDetailsBtnSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },

  viewSdsBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSdsBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sdsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  sdsDividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  sdsDividerLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  stateBox: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  stateText: { fontSize: 14, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

const sdsStyles = StyleSheet.create({
  pictoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pictoWrap: { alignItems: 'center', gap: 4 },
  pictoCode: { fontSize: 10, fontWeight: '600' },

  signalWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  signalLabel: { fontSize: 12, fontWeight: '600' },
  signalValue: { fontSize: 14, fontWeight: '700' },

  subSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },

  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  qrInfo: { flex: 1, gap: 4 },
  qrArticle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  qrMat: { fontSize: 12, fontWeight: '600' },
  qrDate: { fontSize: 12 },
  listPad: { paddingBottom: 4 },

  // Safety Tag styles
  safetyTagRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dataMatrixBox: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    flexShrink: 0,
  },
  dataMatrixLabel: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  dataMatrixCode: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  tagInfo: { flex: 1, gap: 2 },
  tagName: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  tagMeta: { fontSize: 11 },
  tagPictoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tagSignalWord: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  tagHazardList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 2,
  },
  tagHazardText: { fontSize: 12, lineHeight: 18 },
  tagPrecTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  tagFooter: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tagFooterText: { fontSize: 11, fontStyle: 'italic', lineHeight: 16 },
});

export default SafetyLabelScreen;
