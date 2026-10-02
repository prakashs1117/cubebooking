import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { BodyText, CaptionText } from '@components/common/CustomText';
import { getFontStyle } from '@utils/fonts';
import { BaseColors } from '@theme/colors';

interface Props {
  searches: string[];
  onViewAll: () => void;
}

const SearchChip: React.FC<{ query: string; onPress: (q: string) => void }> = ({
  query,
  onPress,
}) => {
  const { isDark } = useTheme();
  const bg = isDark ? 'rgba(255,255,255,0.1)' : '#EDE9F8';
  const textColor = isDark ? BaseColors.white : BaseColors.merckPurple;
  const display = query.length > 20 ? query.slice(0, 20) + '…' : query;
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: bg }]}
      onPress={() => onPress(query)}
      activeOpacity={0.75}
    >
      <BodyText style={[styles.chipText, { color: textColor }]}>
        {display}
      </BodyText>
    </TouchableOpacity>
  );
};

const RecentSearchesStrip: React.FC<Props> = ({ searches, onViewAll }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const handlePress = useCallback(
    (query: string) => {
      navigation.navigate('Search', {
        screen: 'SearchList',
        params: { initialQuery: query },
      });
    },
    [navigation],
  );

  if (searches.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <BodyText style={[styles.sectionTitle, { color: theme.text.primary }]}>
          {t('search.recentSearches')}
        </BodyText>
        <TouchableOpacity
          onPress={onViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CaptionText
            style={[
              styles.viewAll,
              { color: isDark ? BaseColors.white : BaseColors.merckPurple },
            ]}
          >
            {t('common.viewAll')}
          </CaptionText>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScrollContent}
      >
        <View style={styles.chipsColumn}>
          <View style={styles.chipsRow}>
            {searches
              .filter((_, i) => i % 2 === 0)
              .map(item => (
                <SearchChip key={item} query={item} onPress={handlePress} />
              ))}
          </View>
          <View style={styles.chipsRow}>
            {searches
              .filter((_, i) => i % 2 === 1)
              .map(item => (
                <SearchChip key={item} query={item} onPress={handlePress} />
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: getFontStyle('bodyMedium').fontFamily,
    fontWeight: '600',
  },
  viewAll: { fontSize: 13, fontFamily: getFontStyle('body').fontFamily },
  chipsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  chipsColumn: {
    gap: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipText: { fontSize: 13, fontFamily: getFontStyle('body').fontFamily },
});

export default RecentSearchesStrip;
