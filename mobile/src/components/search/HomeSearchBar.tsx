import React, { RefObject } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import { BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { getFontStyle } from '@utils/fonts';
import IconCloseCircle from '@assets/icon-close-circle';

const SEARCH_BAR_TINT = '#EDE9F8';

// Tappable mode: provide onPress (home screen fake input)
// Input mode: provide onChangeText + value (overlay active input)
interface HomeSearchBarProps {
  onBarcodePress: () => void;
  showBarcodeButton?: boolean;

  // Tappable mode
  onPress?: () => void;

  // Input mode
  inputRef?: RefObject<TextInput | null>;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  onBarcodePress,
  showBarcodeButton = true,
  onPress,
  inputRef,
  value,
  onChangeText,
  onSubmit,
  onClear,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const isInputMode = !!onChangeText;

  const barBg = isDark ? '#2A2A2A' : SEARCH_BAR_TINT;
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'transparent';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF';
  const iconColor = isDark ? '#FFFFFF' : BaseColors.merckPurple;
  const clearIconColor = isDark
    ? 'rgba(255,255,255,0.7)'
    : theme.text.secondary;
  const dividerColor = isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB';
  const bodyFont = getFontStyle('body');

  return (
    <View
      style={[
        styles.wrapper,
        !isInputMode && { backgroundColor: theme.background.primary },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: barBg, borderColor }]}>
        <Icon
          name="search"
          size={20}
          color={iconColor}
          style={styles.searchIcon}
        />

        {isInputMode ? (
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { color: theme.text.primary, fontFamily: bodyFont.fontFamily },
            ]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={placeholderColor}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={onSubmit}
          />
        ) : (
          <TouchableOpacity
            style={styles.searchArea}
            activeOpacity={0.85}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={t('search.openSearch')}
          >
            <BodyText
              style={[styles.placeholder, { color: placeholderColor }]}
              numberOfLines={1}
            >
              {t('search.placeholder')}
            </BodyText>
          </TouchableOpacity>
        )}

        {isInputMode && value && value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Clear search text"
          >
            <IconCloseCircle width={20} height={20} stroke={clearIconColor} />
          </TouchableOpacity>
        )}

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        {showBarcodeButton && (
          <TouchableOpacity
            onPress={onBarcodePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={t('search.scanBarcode')}
            style={styles.barcodeBtn}
          >
            <Icon name="scanner" size={22} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 10 },
  searchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: 10,
  },
  barcodeBtn: { padding: 4 },
});

export default HomeSearchBar;
