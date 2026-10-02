import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { CustomText, Heading3 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { useDeviceType } from '@hooks/useDeviceType';
import type { SortOption, FilterOption } from './SortFilterBar';

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: SortOption;
  filterBy: FilterOption;
  onSortChange: (option: SortOption) => void;
  onFilterChange: (option: FilterOption) => void;
}

/**
 * Modal overlay for sort and filter options
 * Clean, reusable component with full localization
 */
const FilterSortModal: React.FC<FilterSortModalProps> = ({
  visible,
  onClose,
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();

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

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option);
    onClose();
  };

  const handleFilterSelect = (option: FilterOption) => {
    onFilterChange(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal Content */}
        <View
          style={[
            styles.modalContainer,
            isTablet && styles.modalContainerTablet,
          ]}
          onStartShouldSetResponder={() => true}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.background.card,
                borderColor: theme.border.primary,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Heading3 style={{ color: theme.text.primary }}>
                {t('events.sortAndFilter')}
              </Heading3>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Sort Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon
                    name="sort-ascending"
                    size={20}
                    color={theme.text.secondary}
                  />
                  <CustomText
                    style={[
                      styles.sectionTitle,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {t('events.sort')}
                  </CustomText>
                </View>
                <View style={styles.optionsContainer}>
                  {sortOptions.map(option => {
                    const isSelected = sortBy === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected
                              ? theme.button.primary.background
                              : 'transparent',
                            borderColor: isSelected
                              ? theme.button.primary.background
                              : theme.border.secondary,
                          },
                        ]}
                        onPress={() => handleSortSelect(option.value)}
                      >
                        <CustomText
                          style={[
                            styles.optionText,
                            {
                              color: isSelected
                                ? theme.button.primary.text
                                : theme.text.primary,
                            },
                          ]}
                        >
                          {option.label}
                        </CustomText>
                        {isSelected && (
                          <Icon
                            name="checkmark-circle"
                            size={20}
                            color={theme.button.primary.text}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Divider */}
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.border.secondary },
                ]}
              />

              {/* Filter Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="filter" size={20} color={theme.text.secondary} />
                  <CustomText
                    style={[
                      styles.sectionTitle,
                      { color: theme.text.secondary },
                    ]}
                  >
                    {t('events.filter')}
                  </CustomText>
                </View>
                <View style={styles.optionsContainer}>
                  {filterOptions.map(option => {
                    const isSelected = filterBy === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected
                              ? theme.button.primary.background
                              : 'transparent',
                            borderColor: isSelected
                              ? theme.button.primary.background
                              : theme.border.secondary,
                          },
                        ]}
                        onPress={() => handleFilterSelect(option.value)}
                      >
                        <CustomText
                          style={[
                            styles.optionText,
                            {
                              color: isSelected
                                ? theme.button.primary.text
                                : theme.text.primary,
                            },
                          ]}
                        >
                          {option.label}
                        </CustomText>
                        {isSelected && (
                          <Icon
                            name="checkmark-circle"
                            size={20}
                            color={theme.button.primary.text}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContainerTablet: {
    maxWidth: 500,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 16,
  },
});

export default FilterSortModal;
