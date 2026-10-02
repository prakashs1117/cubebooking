import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { FAQCategory } from '@/types/faq.types';

interface FAQCategoryFilterProps {
  categories: FAQCategory[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

/**
 * FAQCategoryFilter
 *
 * Horizontal scrollable category filter with chips
 */
export const FAQCategoryFilter: React.FC<FAQCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  showAllOption = true,
  allOptionLabel = 'All',
}) => {
  const { theme } = useTheme();

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const isSelected = (categoryId: string | null) => {
    return selectedCategory === categoryId;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* All Option */}
      {showAllOption && (
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor: isSelected(null)
                ? theme.text.link
                : theme.background.card,
              borderColor: theme.border.secondary,
            },
          ]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected(null) }}
        >
          <Icon
            name="component"
            size={16}
            color={isSelected(null) ? '#FFFFFF' : theme.text.tertiary}
          />
          <CustomText
            style={[
              styles.chipText,
              {
                color: isSelected(null) ? '#FFFFFF' : theme.text.secondary,
              },
            ]}
          >
            {allOptionLabel}
          </CustomText>
        </TouchableOpacity>
      )}

      {/* Category Chips */}
      {sortedCategories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.chip,
            {
              backgroundColor: isSelected(category.id)
                ? theme.text.link
                : theme.background.card,
              borderColor: theme.border.secondary,
            },
          ]}
          onPress={() => onSelectCategory(category.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected(category.id) }}
        >
          <Icon
            name={category.icon as any}
            size={16}
            color={isSelected(category.id) ? '#FFFFFF' : theme.text.tertiary}
          />
          <CustomText
            style={[
              styles.chipText,
              {
                color: isSelected(category.id)
                  ? '#FFFFFF'
                  : theme.text.secondary,
              },
            ]}
          >
            {category.name}
          </CustomText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
