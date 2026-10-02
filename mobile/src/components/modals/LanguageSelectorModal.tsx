/**
 * LanguageSelectorModal
 *
 * Mount this component to open the sheet — it presents itself on mount
 * and calls onClose when dismissed (same pattern as OTPBottomSheet).
 *
 * Usage:
 *   {langOpen && (
 *     <LanguageSelectorModal
 *       currentLang={getCurrentLanguage()}
 *       onSelect={(code) => changeLanguage(code)}
 *       onClose={() => setLangOpen(false)}
 *     />
 *   )}
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import { CustomText } from '@components/common/CustomText';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

interface LanguageSelectorModalProps {
  currentLang: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LanguageSelectorModal({
  currentLang,
  onSelect,
  onClose,
}: LanguageSelectorModalProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // Open as soon as the ref is ready — same 50ms pattern as OTPBottomSheet
  useEffect(() => {
    const id = setTimeout(() => sheetRef.current?.present(), 50);
    return () => clearTimeout(id);
  }, []);

  const handleSelect = useCallback(
    (code: string) => {
      if (code !== currentLang) {
        onSelect(code);
      }
      sheetRef.current?.dismiss();
    },
    [currentLang, onSelect],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    [],
  );

  const bottomPad = Math.max(insets.bottom, 16);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={[
        styles.sheetBg,
        { backgroundColor: theme.background.modal },
      ]}
      handleIndicatorStyle={[
        styles.handle,
        { backgroundColor: theme.border.primary },
      ]}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: bottomPad }]}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(220)} style={styles.header}>
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: isDark
                  ? BaseColors.merckPurple
                  : BaseColors.merckPurple + '1A',
              },
            ]}
          >
            <CustomText style={styles.headerEmoji}>🌐</CustomText>
          </View>
          <CustomText
            variant="h3"
            style={[styles.headerTitle, { color: theme.text.primary }]}
          >
            {t('settings.selectLanguage')}
          </CustomText>
          <CustomText
            variant="bodySmall"
            style={[styles.headerSubtitle, { color: theme.text.secondary }]}
          >
            {t('settings.selectLanguageSubtitle')}
          </CustomText>
        </Animated.View>

        {/* Divider */}
        <View
          style={[styles.divider, { backgroundColor: theme.border.secondary }]}
        />

        {/* Language options */}
        {LANGUAGES.map((lang, index) => {
          const isSelected = lang.code === currentLang;
          return (
            <Animated.View
              key={lang.code}
              entering={FadeIn.delay(index * 60).duration(200)}
            >
              <TouchableOpacity
                style={[
                  styles.langRow,
                  isSelected && {
                    backgroundColor: isDark
                      ? 'rgba(109,40,217,0.22)'
                      : BaseColors.merckPurple + '14',
                  },
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                {/* Flag */}
                <View style={styles.flagWrap}>
                  <CustomText style={styles.flag}>{lang.flag}</CustomText>
                </View>

                {/* Names */}
                <View style={styles.langText}>
                  <CustomText
                    variant="bodyMedium"
                    style={[
                      styles.langName,
                      { color: theme.text.primary },
                      isSelected && {
                        color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {lang.name}
                  </CustomText>
                  <CustomText
                    variant="bodySmall"
                    style={{ color: theme.text.secondary }}
                  >
                    {lang.nativeName}
                  </CustomText>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <Icon
                    name="checkmark-circle"
                    size={22}
                    color={isDark ? '#FFFFFF' : BaseColors.merckPurple}
                  />
                )}
              </TouchableOpacity>

              {index < LANGUAGES.length - 1 && (
                <View
                  style={[
                    styles.rowDivider,
                    { backgroundColor: theme.border.secondary },
                  ]}
                />
              )}
            </Animated.View>
          );
        })}

        {/* Close button */}
        <View style={styles.closeWrap}>
          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.12)'
                  : theme.background.secondary,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.18)'
                  : 'transparent',
              },
            ]}
            onPress={() => sheetRef.current?.dismiss()}
            activeOpacity={0.7}
          >
            <CustomText
              variant="bodyMedium"
              style={[
                styles.closeBtnText,
                { color: isDark ? '#FFFFFF' : theme.text.secondary },
              ]}
            >
              {t('common.close')}
            </CustomText>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerEmoji: {
    fontSize: 30,
    lineHeight: 36,
    includeFontPadding: false,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 9,
  },
  flagWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flag: {
    fontSize: 22,
  },
  langText: {
    flex: 1,
    gap: 2,
  },
  langName: {
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 24,
  },
  closeWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeBtnText: {
    fontWeight: '600',
  },
});
