import React, { useCallback, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, Platform, PermissionsAndroid } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Toast from 'react-native-toast-message';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  PinchGestureHandler,
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import LabelPreview, {
  type LabelPreviewProps,
  ROTATION_OPTIONS,
} from '@components/label/LabelPreview';

// ─── Custom Icons ─────────────────────────────────────────────────────────────

const RotateIcon: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.7733 13.3292C15.4851 14.1471 14.9388 14.8493 14.2169 15.3298C13.4949 15.8103 12.6363 16.0432 11.7704 15.9934C10.9046 15.9436 10.0784 15.6137 9.41631 15.0535C8.75424 14.4933 8.29217 13.7332 8.09972 12.8876C7.90728 12.042 7.99489 11.1567 8.34934 10.3652C8.7038 9.57374 9.3059 8.91887 10.0649 8.4993C10.824 8.07974 11.6988 7.91819 12.5576 8.03902C13.9223 8.23101 14.9173 9.23345 16 10M16 10V7M16 10H13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z"
      fill={color}
    />
  </Svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LabelInspectModalProps extends LabelPreviewProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const INITIAL_ZOOM = 1.5;

// ─── Component ────────────────────────────────────────────────────────────────

const LabelInspectModal: React.FC<LabelInspectModalProps> = ({
  visible,
  onClose,
  template,
  articleName,
  materialNumber,
  casNumber,
  amount,
  unit,
  revisionDate,
  extraText,
  rotation: _initialRotation,
  hazardPictogramIcons,
  isDark,
}) => {
  const insets = useSafeAreaInsets();
  const [isDownloading, setIsDownloading] = useState(false);

  // Zoom + pan state
  const scale = useSharedValue(INITIAL_ZOOM);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Local rotation state (cycles 0 → 90 → 180 → 270)
  const [rotationIndex, setRotationIndex] = useState(0);
  const currentRotation = ROTATION_OPTIONS[rotationIndex];

  const panRef = useRef(null);
  const labelViewRef = useRef<View>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      // Android ≤ 28 needs WRITE_EXTERNAL_STORAGE at runtime
      if (Platform.OS === 'android' && Platform.Version <= 28) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Save to Photos',
            message: 'My M Safety needs permission to save the label to your photos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({ type: 'error', text1: 'Permission denied', text2: 'Cannot save to photos without permission.' });
          return;
        }
      }

      const uri = await captureRef(labelViewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        snapshotContentContainer: false,
      });

      await CameraRoll.saveAsset(uri, { type: 'photo', album: 'My M Safety' });
      Toast.show({ type: 'success', text1: 'Label saved', text2: 'Saved to your Photos library.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Save failed', text2: 'Could not save label to photos.' });
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading]);

  const handlePinchEvent = useCallback(
    (event: any) => {
      scale.value = event.nativeEvent.scale;
    },
    [scale],
  );

  const handlePinchEnd = useCallback(() => {
    if (scale.value < MIN_ZOOM) {
      scale.value = withSpring(MIN_ZOOM, {
        damping: 12,
        mass: 1,
        stiffness: 100,
      });
    } else if (scale.value > MAX_ZOOM) {
      scale.value = withSpring(MAX_ZOOM, {
        damping: 12,
        mass: 1,
        stiffness: 100,
      });
    }

    if (scale.value <= MIN_ZOOM) {
      translateX.value = withSpring(0, {
        damping: 12,
        mass: 1,
        stiffness: 100,
      });
      translateY.value = withSpring(0, {
        damping: 12,
        mass: 1,
        stiffness: 100,
      });
    }
  }, [scale, translateX, translateY]);

  const handlePanEvent = useCallback(
    (event: any) => {
      if (scale.value > MIN_ZOOM) {
        translateX.value = event.nativeEvent.translationX;
        translateY.value = event.nativeEvent.translationY;
      }
    },
    [scale, translateX, translateY],
  );

  const handleRotatePress = useCallback(() => {
    setRotationIndex(prevIdx => (prevIdx + 1) % ROTATION_OPTIONS.length);
  }, []);

  const handleResetView = useCallback(() => {
    scale.value = withSpring(INITIAL_ZOOM, {
      damping: 12,
      mass: 1,
      stiffness: 100,
    });
    translateX.value = withSpring(0, { damping: 12, mass: 1, stiffness: 100 });
    translateY.value = withSpring(0, { damping: 12, mass: 1, stiffness: 100 });
    setRotationIndex(0);
  }, [scale, translateX, translateY]);

  const handleZoomSliderChange = useCallback(
    (newScale: number) => {
      scale.value = newScale;
      if (newScale <= MIN_ZOOM) {
        translateX.value = withSpring(0, {
          damping: 12,
          mass: 1,
          stiffness: 100,
        });
        translateY.value = withSpring(0, {
          damping: 12,
          mass: 1,
          stiffness: 100,
        });
      }
    },
    [scale, translateX, translateY],
  );

  // ─── Animated styles ──────────────────────────────────────────────────────

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // ─── Colors ───────────────────────────────────────────────────────────────

  const bgColor = isDark ? '#1a1c1e' : '#f5f5f5';
  const headerBg = isDark
    ? 'rgba(26, 28, 30, 0.85)'
    : 'rgba(255, 255, 255, 0.85)';
  const textColor = isDark ? '#ffffff' : '#1a1c1e';
  const secondaryColor = isDark ? '#e0e0e0' : '#6b7280';
  const buttonBg = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const buttonBorder = isDark
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.1)';

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.backdrop, { backgroundColor: bgColor }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: headerBg, paddingTop: insets.top + 12 },
            ]}
          >
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <CustomText
                style={[styles.headerTitle, { color: textColor }]}
                numberOfLines={1}
              >
                Label Preview
              </CustomText>
              <CustomText
                style={[styles.headerSubtitle, { color: secondaryColor }]}
                numberOfLines={1}
              >
                INSPECTION MODE
              </CustomText>
            </View>

            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleRotatePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <RotateIcon size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Viewport */}
          <View style={styles.viewport}>
            <PanGestureHandler
              ref={panRef}
              onGestureEvent={handlePanEvent}
              enabled={scale.value > MIN_ZOOM}
            >
              <Animated.View style={styles.panContainer}>
                <PinchGestureHandler
                  onGestureEvent={handlePinchEvent}
                  onEnded={handlePinchEnd}
                >
                  <Animated.View
                    style={[styles.zoomContainer, labelAnimatedStyle]}
                  >
                    <LabelPreview
                      template={template}
                      articleName={articleName}
                      materialNumber={materialNumber}
                      casNumber={casNumber}
                      amount={amount}
                      unit={unit}
                      revisionDate={revisionDate}
                      extraText={extraText}
                      rotation={currentRotation}
                      hazardPictogramIcons={hazardPictogramIcons}
                      isDark={isDark}
                      noBackground
                      viewRef={labelViewRef}
                    />
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </View>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { backgroundColor: headerBg, paddingBottom: insets.bottom + 12 },
            ]}
          >
            <ZoomSlider
              value={scale.value}
              onChange={handleZoomSliderChange}
              isDark={isDark}
            />

            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={[
                  styles.ghostBtn,
                  { backgroundColor: buttonBg, borderColor: buttonBorder },
                ]}
                onPress={handleResetView}
                activeOpacity={0.7}
              >
                <RotateIcon size={16} color={textColor} />
                <CustomText style={[styles.ghostBtnText, { color: textColor }]}>
                  Reset
                </CustomText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.ghostBtn,
                  { backgroundColor: buttonBg, borderColor: buttonBorder },
                  isDownloading && { opacity: 0.5 },
                ]}
                onPress={handleDownload}
                activeOpacity={0.7}
                disabled={isDownloading}
              >
                <ShareIcon size={16} color={textColor} />
                <CustomText style={[styles.ghostBtnText, { color: textColor }]}>
                  {isDownloading ? 'Saving...' : 'Save to Photos'}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

// ─── Zoom Slider Component ────────────────────────────────────────────────────

interface ZoomSliderProps {
  value: number;
  onChange: (val: number) => void;
  isDark: boolean;
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({
  value: _value,
  onChange,
  isDark,
}) => {
  const panRef = useRef(null);
  const sliderWidth = useRef(0);
  const [displayValue, setDisplayValue] = useState(INITIAL_ZOOM);

  const handlePanEvent = useCallback(
    (event: any) => {
      if (sliderWidth.current === 0) return;

      const { translationX } = event.nativeEvent;
      const ratio =
        (translationX + sliderWidth.current / 2) / sliderWidth.current;
      const clamped = Math.max(0, Math.min(1, ratio));
      const newValue = MIN_ZOOM + (MAX_ZOOM - MIN_ZOOM) * clamped;

      setDisplayValue(parseFloat(newValue.toFixed(2)));
      onChange(newValue);
    },
    [onChange],
  );

  const sliderPosition = displayValue
    ? ((displayValue - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
    : ((INITIAL_ZOOM - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;

  const iconColor = isDark ? '#ffffff' : '#1a1c1e';
  const barBg = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
  const thumbColor = isDark ? '#ffffff' : '#1a1c1e';

  return (
    <View style={styles.sliderContainer}>
      <Icon name="search-outline" size={18} color={iconColor} />

      <PanGestureHandler ref={panRef} onGestureEvent={handlePanEvent}>
        <Animated.View
          style={styles.sliderTrack}
          onLayout={e => {
            sliderWidth.current = e.nativeEvent.layout.width;
          }}
        >
          <View style={[styles.sliderBar, { backgroundColor: barBg }]} />
          <View
            style={[
              styles.sliderThumb,
              {
                left: `${sliderPosition}%`,
                backgroundColor: thumbColor,
              },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>

      <Icon name="search" size={18} color={iconColor} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  viewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  panContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  sliderTrack: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sliderBar: {
    height: 3,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: -10,
  },

  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LabelInspectModal;
