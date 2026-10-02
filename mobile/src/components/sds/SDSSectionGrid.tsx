import React, { useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import { BaseColors } from '@theme/colors';
import { useTheme } from '@theme/index';
import type { SafetyDataSheet } from '@services/api/atlasSDSService';

// ─── Section color cycling (6 colors from Ionic design) ──────────────────────
const SECTION_COLORS = [
  '#E61E50', // 1, 7, 13  — amaranth
  '#FFC832', // 2, 8, 14  — sunglow
  '#A5CD50', // 3, 9, 15  — android green
  '#005CA9', // 4, 10, 16 — persian blue
  '#EB3C96', // 5, 11     — rose
  '#29B8CD', // 6, 12     — strong blue
];

const SECTION_KEYS = [
  'section1',
  'section2',
  'section3',
  'section4',
  'section5',
  'section6',
  'section7',
  'section8',
  'section9',
  'section10',
  'section11',
  'section12',
  'section13',
  'section14',
  'section15',
  'section16',
] as const;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 32;
const TILE_GAP = 8;
const NUM_COLUMNS = 4;
const TILE_WIDTH =
  (SCREEN_WIDTH - GRID_PADDING - (NUM_COLUMNS - 1) * TILE_GAP) / NUM_COLUMNS;
const TILE_HEIGHT = TILE_WIDTH + 8; // slightly taller than wide for title room

interface TileItem {
  index: number;
  titleKey: string;
  color: string;
}

interface SDSSectionGridProps {
  sds: SafetyDataSheet;
  isDark: boolean;
  onSectionPress: (index: number) => void;
  enabledSections?: boolean[];
}

const SDSSectionGrid: React.FC<SDSSectionGridProps> = ({
  onSectionPress,
  enabledSections,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  // Build tiles keeping original index so number badge and onSectionPress
  // always refer to the correct section number (1–16).
  const tiles: TileItem[] = SECTION_KEYS.reduce<TileItem[]>((acc, key, i) => {
    // If enabledSections is provided, skip tiles whose flag is false.
    if (enabledSections && enabledSections[i] === false) return acc;
    acc.push({
      index: i,
      titleKey: `sds.${key}`,
      color: SECTION_COLORS[i % SECTION_COLORS.length],
    });
    return acc;
  }, []);

  const cardBg = isDark ? theme.background.card : '#FFFFFF';
  const numberBg = BaseColors.merckPurple;

  const renderTile = useCallback(
    ({ item }: { item: TileItem }) => (
      <Animated.View entering={FadeIn.delay(item.index * 30).duration(200)}>
        <TouchableOpacity
          style={[
            styles.tile,
            { backgroundColor: cardBg, width: TILE_WIDTH, height: TILE_HEIGHT },
          ]}
          onPress={() => onSectionPress(item.index)}
          activeOpacity={0.75}
        >
          {/* Color accent bar */}
          <View style={[styles.accentBar, { backgroundColor: item.color }]} />

          {/* Number badge */}
          <View style={[styles.numberBadge, { backgroundColor: numberBg }]}>
            <CustomText style={styles.numberText}>{item.index + 1}</CustomText>
          </View>

          {/* Section title */}
          <CustomText
            style={[styles.tileTitle, { color: theme.text.secondary }]}
            numberOfLines={2}
          >
            {t(item.titleKey)}
          </CustomText>
        </TouchableOpacity>
      </Animated.View>
    ),
    [cardBg, numberBg, theme.text.secondary, onSectionPress, t],
  );

  return (
    <FlatList
      data={tiles}
      keyExtractor={item => String(item.index)}
      renderItem={renderTile}
      numColumns={NUM_COLUMNS}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.grid}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: TILE_GAP,
  },
  row: {
    gap: TILE_GAP,
  },
  tile: {
    borderRadius: 12,
    alignItems: 'center',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: '100%',
    height: 6,
    marginBottom: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  numberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tileTitle: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});

export default SDSSectionGrid;
