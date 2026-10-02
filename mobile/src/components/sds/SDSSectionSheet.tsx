import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import type { SafetyDataSheet } from '@services/api/atlasSDSService';
import { useSDSTracking } from '@hooks/useSDSTracking';

import SDSSection1 from '@components/sds/sections/SDSSection1';
import SDSSection2 from '@components/sds/sections/SDSSection2';
import SDSSection3 from '@components/sds/sections/SDSSection3';
import SDSSection4 from '@components/sds/sections/SDSSection4';
import SDSSection5 from '@components/sds/sections/SDSSection5';
import SDSSection6 from '@components/sds/sections/SDSSection6';
import SDSSection7 from '@components/sds/sections/SDSSection7';
import SDSSection8 from '@components/sds/sections/SDSSection8';
import SDSSection9 from '@components/sds/sections/SDSSection9';
import SDSSection10 from '@components/sds/sections/SDSSection10';
import SDSSection11 from '@components/sds/sections/SDSSection11';
import SDSSection12 from '@components/sds/sections/SDSSection12';
import SDSSection13 from '@components/sds/sections/SDSSection13';
import SDSSection14 from '@components/sds/sections/SDSSection14';
import SDSSection15 from '@components/sds/sections/SDSSection15';
import SDSSection16 from '@components/sds/sections/SDSSection16';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;

type SectionKey =
  | 'section_one'
  | 'section_two'
  | 'section_three'
  | 'section_four'
  | 'section_five'
  | 'section_six'
  | 'section_seven'
  | 'section_eight'
  | 'section_nine'
  | 'section_ten'
  | 'section_eleven'
  | 'section_twelve'
  | 'section_thirteen'
  | 'section_fourteen'
  | 'section_fifteen'
  | 'section_sixteen';

const SECTION_DATA_KEYS: SectionKey[] = [
  'section_one',
  'section_two',
  'section_three',
  'section_four',
  'section_five',
  'section_six',
  'section_seven',
  'section_eight',
  'section_nine',
  'section_ten',
  'section_eleven',
  'section_twelve',
  'section_thirteen',
  'section_fourteen',
  'section_fifteen',
  'section_sixteen',
];

const SECTION_I18N_KEYS = [
  'sds.section1',
  'sds.section2',
  'sds.section3',
  'sds.section4',
  'sds.section5',
  'sds.section6',
  'sds.section7',
  'sds.section8',
  'sds.section9',
  'sds.section10',
  'sds.section11',
  'sds.section12',
  'sds.section13',
  'sds.section14',
  'sds.section15',
  'sds.section16',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SDSSectionSheetProps {
  visible: boolean;
  sds: SafetyDataSheet;
  initialSection: number;
  isDark: boolean;
  onClose: () => void;
  enabledSections?: boolean[];
  materialNumber?: string;
  productName?: string;
  validityArea?: 'EU' | 'US' | 'CN';
  language?: 'EN' | 'FR' | 'AR' | 'ZH';
}

// ─── Section page (carousel item) ────────────────────────────────────────────

const SectionPage: React.FC<{
  index: number;
  sds: SafetyDataSheet;
  isDark: boolean;
  height: number;
}> = ({ index, sds, isDark, height }) => {
  const data = sds[SECTION_DATA_KEYS[index]];
  const renderContent = () => {
    switch (index) {
      case 0:
        return <SDSSection1 data={data as any} />;
      case 1:
        return <SDSSection2 data={data as any} />;
      case 2:
        return <SDSSection3 data={data as any} />;
      case 3:
        return <SDSSection4 data={data as any} />;
      case 4:
        return <SDSSection5 data={data as any} />;
      case 5:
        return <SDSSection6 data={data as any} />;
      case 6:
        return <SDSSection7 data={data as any} />;
      case 7:
        return <SDSSection8 data={data as any} />;
      case 8:
        return <SDSSection9 data={data as any} />;
      case 9:
        return <SDSSection10 data={data as any} />;
      case 10:
        return <SDSSection11 data={data as any} />;
      case 11:
        return <SDSSection12 data={data as any} />;
      case 12:
        return <SDSSection13 data={data as any} />;
      case 13:
        return <SDSSection14 data={data as any} />;
      case 14:
        return <SDSSection15 data={data as any} />;
      case 15:
        return <SDSSection16 data={data as any} />;
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={{ width: SCREEN_WIDTH, height }}
      contentContainerStyle={pageStyles.content}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {renderContent()}
    </ScrollView>
  );
};

const pageStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
});

// ─── Section chip ─────────────────────────────────────────────────────────────

interface SectionChipProps {
  label: string;
  active: boolean;
  isDark: boolean;
  onPress: () => void;
  onLayout: (x: number) => void;
}

const SectionChip: React.FC<SectionChipProps> = ({
  label,
  active,
  isDark,
  onPress,
  onLayout,
}) => {
  const activeBg = BaseColors.merckPurple;
  const inactiveBg = isDark ? 'rgba(255,255,255,0.10)' : '#F3F4F6';
  const activeText = '#FFFFFF';
  const inactiveText = isDark ? 'rgba(255,255,255,0.75)' : '#374151';

  return (
    <TouchableOpacity
      style={[
        chipStyles.chip,
        { backgroundColor: active ? activeBg : inactiveBg },
        active && chipStyles.chipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      onLayout={e => onLayout(e.nativeEvent.layout.x)}
    >
      <CustomText
        style={[
          chipStyles.chipText,
          { color: active ? activeText : inactiveText },
        ]}
      >
        {label}
      </CustomText>
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    shadowColor: BaseColors.merckPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

const SDSSectionSheet: React.FC<SDSSectionSheetProps> = ({
  visible,
  sds,
  initialSection,
  isDark,
  onClose,
  enabledSections,
  materialNumber,
  productName,
  validityArea = 'EU',
  language = 'EN',
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { handleSectionViewed } = useSDSTracking({
    materialNumber: materialNumber || '',
    productName,
    validityArea,
    language,
    sdsSystem: 'NEX',
    source: 'search',
  });

  // Derive the filtered list of sections, preserving original indices.
  // If enabledSections is not provided, all 16 are shown.
  const visibleIndices: number[] = enabledSections
    ? SECTION_DATA_KEYS.reduce<number[]>((acc, _, i) => {
        if (enabledSections[i] !== false) acc.push(i);
        return acc;
      }, [])
    : SECTION_DATA_KEYS.map((_, i) => i);

  // Map the original initialSection index to its position in the filtered list.
  const initialCarouselIndex = Math.max(
    0,
    visibleIndices.indexOf(initialSection),
  );

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(initialCarouselIndex);
  const [carouselHeight, setCarouselHeight] = useState(0);

  const carouselRef = useRef<ICarouselInstance>(null);
  const chipScrollRef = useRef<ScrollView>(null);
  const chipXPositions = useRef<number[]>(Array(visibleIndices.length).fill(0));

  // Sync to initial section whenever overlay opens
  useEffect(() => {
    if (visible) {
      const idx = Math.max(0, visibleIndices.indexOf(initialSection));
      setActiveCarouselIndex(idx);
      setTimeout(() => {
        carouselRef.current?.scrollTo({ index: idx, animated: false });
        scrollChipIntoView(idx);
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialSection]);

  const scrollChipIntoView = useCallback((carouselIdx: number) => {
    const x = chipXPositions.current[carouselIdx] ?? 0;
    chipScrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  }, []);

  const handleChipPress = useCallback(
    (carouselIdx: number) => {
      setActiveCarouselIndex(carouselIdx);
      const origIdx = visibleIndices[carouselIdx];
      handleSectionViewed(String(origIdx + 1));
      carouselRef.current?.scrollTo({ index: carouselIdx, animated: true });
      scrollChipIntoView(carouselIdx);
    },
    [scrollChipIntoView, visibleIndices, handleSectionViewed],
  );

  const handleSnapToItem = useCallback(
    (carouselIdx: number) => {
      setActiveCarouselIndex(carouselIdx);
      const origIdx = visibleIndices[carouselIdx];
      handleSectionViewed(String(origIdx + 1));
      scrollChipIntoView(carouselIdx);
    },
    [scrollChipIntoView, visibleIndices, handleSectionViewed],
  );

  // Split visible sections into two rows
  const half = Math.ceil(visibleIndices.length / 2);
  const row1 = visibleIndices.slice(0, half);
  const row2 = visibleIndices.slice(half);

  const borderColor = theme.border.primary;
  const textPrimary = theme.text.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        style={[
          styles.sheet,
          { backgroundColor: theme.background.primary, paddingBottom: insets.bottom },
        ]}
      >
        {/* ── Handle ── */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* ── Header row: title + close ── */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <CustomText
            style={[styles.headerTitle, { color: textPrimary }]}
            numberOfLines={1}
          >
            {t('sds.fullSDS')}
          </CustomText>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={20} color={theme.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* ── Two-row chip bar ── */}
        <View style={[styles.chipBarWrap, { borderBottomColor: borderColor }]}>
          <ScrollView
            ref={chipScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            <View style={styles.chipsColumn}>
              <View style={styles.chipsRow}>
                {row1.map((origIdx, carouselIdx) => (
                  <SectionChip
                    key={origIdx}
                    label={t(SECTION_I18N_KEYS[origIdx])}
                    active={activeCarouselIndex === carouselIdx}
                    isDark={isDark}
                    onPress={() => handleChipPress(carouselIdx)}
                    onLayout={x => {
                      chipXPositions.current[carouselIdx] = x;
                    }}
                  />
                ))}
              </View>
              <View style={styles.chipsRow}>
                {row2.map((origIdx, rowIdx) => {
                  const carouselIdx = half + rowIdx;
                  return (
                    <SectionChip
                      key={origIdx}
                      label={t(SECTION_I18N_KEYS[origIdx])}
                      active={activeCarouselIndex === carouselIdx}
                      isDark={isDark}
                      onPress={() => handleChipPress(carouselIdx)}
                      onLayout={x => {
                        chipXPositions.current[carouselIdx] = x;
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ── Carousel ── */}
        <View
          style={styles.carouselWrap}
          onLayout={e => setCarouselHeight(e.nativeEvent.layout.height)}
        >
          {carouselHeight > 0 && (
            <Carousel
              ref={carouselRef}
              data={visibleIndices}
              width={SCREEN_WIDTH}
              height={carouselHeight}
              loop={false}
              pagingEnabled
              defaultIndex={initialCarouselIndex}
              onSnapToItem={handleSnapToItem}
              renderItem={({ item: origIdx }) => (
                <SectionPage
                  index={origIdx}
                  sds={sds}
                  isDark={isDark}
                  height={carouselHeight}
                />
              )}
            />
          )}
        </View>

        {/* ── Progress indicator ── */}
        <View style={[styles.progressBar, { borderTopColor: borderColor }]}>
          <CustomText
            style={[styles.progressText, { color: theme.text.secondary }]}
          >
            {t('sds.sectionN', { n: visibleIndices[activeCarouselIndex] + 1 })} /{' '}
            {visibleIndices.length} —{' '}
            {t(SECTION_I18N_KEYS[visibleIndices[activeCarouselIndex]])}
          </CustomText>
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '93%',
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBarWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    paddingRight: 24,
  },
  chipsColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  carouselWrap: {
    flex: 1,
  },
  progressBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default SDSSectionSheet;
