/**
 * AppModal
 *
 * Reusable bottom-sheet modal replacing native Alert.alert across the app.
 * Supports four variants: confirm (destructive), success, error, info, warning.
 *
 * Usage:
 *   const [modal, setModal] = useState<ModalConfig | null>(null);
 *
 *   setModal({
 *     variant: 'confirm',
 *     title: 'Logout',
 *     message: 'Are you sure you want to logout?',
 *     confirmLabel: 'Logout',
 *     onConfirm: () => logout(),
 *   });
 *
 *   <AppModal config={modal} onClose={() => setModal(null)} />
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { BaseColors } from '@theme/colors';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import { CustomText } from '@components/common/CustomText';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalVariant = 'confirm' | 'success' | 'error' | 'info' | 'warning' | 'destructive';

export interface ModalConfig {
  variant: ModalVariant;
  title: string;
  message: string;
  /** Primary action button label. Defaults: confirm→'Confirm', others→'OK' */
  confirmLabel?: string;
  /** Cancel button label (only visible for 'confirm' and 'destructive' variants). Default: 'Cancel' */
  cancelLabel?: string;
  /** Called when the primary button is tapped */
  onConfirm?: () => void;
  /** Called when cancel is tapped or modal is dismissed */
  onCancel?: () => void;
}

interface AppModalProps {
  /** Pass a config to show the modal, null to dismiss */
  config: ModalConfig | null;
  /** Called when the modal should close (set config back to null) */
  onClose: () => void;
}

// ─── Variant metadata ─────────────────────────────────────────────────────────

type VariantMeta = {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  confirmBg: string;
  confirmTextColor: string;
};

const VARIANTS: Record<ModalVariant, VariantMeta> = {
  success: {
    icon: 'checkmark-circle',
    iconColor: BaseColors.success,
    iconBg: '#E8F8ED',
    confirmBg: BaseColors.success,
    confirmTextColor: '#FFFFFF',
  },
  error: {
    icon: 'close-circle',
    iconColor: BaseColors.error,
    iconBg: '#FFEDEB',
    confirmBg: BaseColors.error,
    confirmTextColor: '#FFFFFF',
  },
  warning: {
    icon: 'alert-circle',
    iconColor: BaseColors.warning,
    iconBg: '#FFF4E5',
    confirmBg: BaseColors.warning,
    confirmTextColor: '#FFFFFF',
  },
  info: {
    icon: 'info-circle',
    iconColor: BaseColors.primary,
    iconBg: '#E5F0FF',
    confirmBg: BaseColors.primary,
    confirmTextColor: '#FFFFFF',
  },
  confirm: {
    icon: 'logout',
    iconColor: BaseColors.error,
    iconBg: '#FFEDEB',
    confirmBg: BaseColors.error,
    confirmTextColor: '#FFFFFF',
  },
  destructive: {
    icon: 'alert-circle',
    iconColor: BaseColors.error,
    iconBg: '#FFEDEB',
    confirmBg: BaseColors.error,
    confirmTextColor: '#FFFFFF',
  },
};

// Use a specific icon for known confirm titles
function resolveIcon(config: ModalConfig): IconName {
  if (config.variant === 'destructive') {
    const title = config.title.toLowerCase();
    if (title.includes('delete') || title.includes('remove')) return 'trash';
    return 'alert-circle';
  }
  if (config.variant !== 'confirm') return VARIANTS[config.variant].icon;
  const title = config.title.toLowerCase();
  if (title.includes('logout') || title.includes('log out')) return 'logout';
  if (title.includes('delete') || title.includes('remove')) return 'trash';
  if (title.includes('reset') || title.includes('clear')) return 'alert-circle';
  return 'alert-circle';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppModal({ config, onClose }: AppModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  // Keep last config so content doesn't disappear during dismiss animation
  const lastConfig = useRef<ModalConfig | null>(null);
  if (config) lastConfig.current = config;
  const displayed = lastConfig.current;

  // Present / dismiss when config changes
  useEffect(() => {
    if (config) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [config]);

  const handleConfirm = useCallback(() => {
    lastConfig.current?.onConfirm?.();
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    lastConfig.current?.onCancel?.();
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        pressBehavior="close"
        onPress={handleCancel}
      />
    ),
    [handleCancel],
  );

  if (!displayed) return null;

  const meta = VARIANTS[displayed.variant];
  const iconName = resolveIcon(displayed);
  const isConfirm = displayed.variant === 'confirm' || displayed.variant === 'destructive';
  const confirmLabel = displayed.confirmLabel ?? (isConfirm ? 'Confirm' : 'OK');
  const cancelLabel = displayed.cancelLabel ?? 'Cancel';
  const bottomPad = Math.max(insets.bottom, 16);

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={[
        styles.sheetBackground,
        { backgroundColor: theme.background.modal },
      ]}
      handleIndicatorStyle={[
        styles.handle,
        { backgroundColor: theme.border.primary },
      ]}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: bottomPad }]}>
        {/* Icon badge */}
        <Animated.View
          entering={ZoomIn.springify().damping(14).stiffness(140)}
          style={[styles.iconBadge, { backgroundColor: meta.iconBg }]}
        >
          <Icon name={iconName} size={34} color={meta.iconColor} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeIn.delay(60).duration(280)}>
          <CustomText
            variant="h3"
            style={[styles.title, { color: theme.text.primary }]}
          >
            {displayed.title}
          </CustomText>
        </Animated.View>

        {/* Message */}
        <Animated.View entering={FadeIn.delay(100).duration(280)}>
          <CustomText
            variant="bodyMedium"
            style={[styles.message, { color: theme.text.secondary }]}
          >
            {displayed.message}
          </CustomText>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          entering={FadeIn.delay(140).duration(280)}
          style={[styles.buttons, isConfirm && styles.buttonsRow]}
        >
          {isConfirm && (
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnCancel,
                { borderColor: theme.border.primary },
              ]}
              onPress={handleCancel}
              activeOpacity={0.75}
            >
              <CustomText
                variant="buttonMedium"
                style={{ color: theme.text.secondary }}
              >
                {cancelLabel}
              </CustomText>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: meta.confirmBg },
              !isConfirm && styles.btnFull,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.82}
          >
            <CustomText
              variant="buttonMedium"
              style={{ color: meta.confirmTextColor }}
            >
              {confirmLabel}
            </CustomText>
          </TouchableOpacity>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  buttons: {
    width: '100%',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  btnFull: {
    flex: undefined,
    width: '100%',
  },
});
