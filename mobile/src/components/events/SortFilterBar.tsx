import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';

export type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
export type FilterOption = 'all' | 'upcoming' | 'live' | 'completed';

interface SortFilterBarProps {
  sortBy: SortOption;
  filterBy: FilterOption;
  onSortChange: (option: SortOption) => void;
  onFilterChange: (option: FilterOption) => void;
}

/**
 * Reusable sort and filter bar component
 */
const SortFilterBar: React.FC<SortFilterBarProps> = ({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-asc', label: t('events.sortDateAsc') },
    { value: 'date-desc', label: t('events.sortDateDesc') },
    { value: 'title-asc', label: t('events.sortTitleAsc') },
    { value: 'title-desc', label: t('events.sortTitleDesc') },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: t('events.filterAll') },
    { value: 'upcoming', label: t('events.filterUpcoming') },
    { value: 'live', label: t('events.filterLive') },
    { value: 'completed', label: t('events.filterCompleted') },
  ];

  const getCurrentSortLabel = () => {
    return (
      sortOptions.find(opt => opt.value === sortBy)?.label || t('events.sort')
    );
  };

  const getCurrentFilterLabel = () => {
    return (
      filterOptions.find(opt => opt.value === filterBy)?.label ||
      t('events.filter')
    );
  };

  return (
    <View style={styles.container}>
      {/* Sort Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : theme.background.secondary,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : theme.border.primary,
          },
        ]}
        onPress={() => {
          // TODO: Implement sort menu modal/dropdown
          const currentIndex = sortOptions.findIndex(
            opt => opt.value === sortBy,
          );
          const nextIndex = (currentIndex + 1) % sortOptions.length;
          onSortChange(sortOptions[nextIndex].value);
        }}
      >
        <Icon name="refresh" size={16} color={theme.text.secondary} />
        <BodyText
          style={[
            styles.buttonText,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {getCurrentSortLabel()}
        </BodyText>
        <Icon name="chevron-down" size={14} color={theme.text.tertiary} />
      </TouchableOpacity>

      {/* Filter Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : theme.background.secondary,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : theme.border.primary,
          },
        ]}
        onPress={() => {
          // TODO: Implement filter menu modal/dropdown
          const currentIndex = filterOptions.findIndex(
            opt => opt.value === filterBy,
          );
          const nextIndex = (currentIndex + 1) % filterOptions.length;
          onFilterChange(filterOptions[nextIndex].value);
        }}
      >
        <Icon name="toggle" size={16} color={theme.text.secondary} />
        <BodyText
          style={[
            styles.buttonText,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {getCurrentFilterLabel()}
        </BodyText>
        <Icon name="chevron-down" size={14} color={theme.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SortFilterBar;
