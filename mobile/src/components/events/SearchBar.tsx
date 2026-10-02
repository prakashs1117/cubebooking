import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
}

/**
 * Reusable search bar component with optional filter button
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder,
  showFilterButton = false,
  onFilterPress,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('events.searchPlaceholder');

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : theme.background.secondary,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : theme.border.primary,
          },
          showFilterButton && styles.containerWithFilter,
        ]}
      >
        <Icon name="search" size={20} color={theme.text.tertiary} />
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
          placeholder={defaultPlaceholder}
          placeholderTextColor={theme.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={18} color={theme.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      {showFilterButton && onFilterPress && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : theme.background.card,
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.15)'
                : theme.border.primary,
            },
          ]}
          activeOpacity={0.7}
        >
          <Icon name="options" size={22} color={theme.text.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  containerWithFilter: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 8,
      },
      android: {
        paddingVertical: 6,
      },
    }),
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default SearchBar;
