import React, { useCallback, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Svg, { Path, G } from 'react-native-svg';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import Toast from 'react-native-toast-message';

interface LabelImageViewerModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

const { width: SW, height: SH } = Dimensions.get('window');
const ROTATION_OPTIONS = [0, 90, 180, 270] as const;

const LeftArrowIcon: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <Path d="M16.000,32.000 C7.178,32.000 -0.000,24.822 -0.000,16.000 C-0.000,7.178 7.178,-0.000 16.000,-0.000 C24.822,-0.000 32.000,7.178 32.000,16.000 C32.000,24.822 24.822,32.000 16.000,32.000 ZM16.000,2.000 C8.280,2.000 2.000,8.280 2.000,16.000 C2.000,23.720 8.280,30.000 16.000,30.000 C23.720,30.000 30.000,23.720 30.000,16.000 C30.000,8.280 23.720,2.000 16.000,2.000 ZM23.000,17.000 L11.414,17.000 L13.707,19.293 C14.098,19.684 14.098,20.316 13.707,20.707 C13.512,20.902 13.256,21.000 13.000,21.000 C12.744,21.000 12.488,20.902 12.293,20.707 L8.293,16.707 C8.201,16.615 8.128,16.505 8.077,16.382 C7.976,16.138 7.976,15.862 8.077,15.618 C8.128,15.495 8.201,15.385 8.293,15.293 L12.293,11.293 C12.684,10.902 13.316,10.902 13.707,11.293 C14.098,11.684 14.098,12.316 13.707,12.707 L11.414,15.000 L23.000,15.000 C23.552,15.000 24.000,15.448 24.000,16.000 C24.000,16.552 23.552,17.000 23.000,17.000 Z" />
  </Svg>
);

const RightArrowIcon: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
    <Path d="M16.000,32.000 C7.178,32.000 0.000,24.822 0.000,16.000 C0.000,7.178 7.178,-0.000 16.000,-0.000 C24.822,-0.000 32.000,7.178 32.000,16.000 C32.000,24.822 24.822,32.000 16.000,32.000 ZM16.000,2.000 C8.280,2.000 2.000,8.280 2.000,16.000 C2.000,23.720 8.280,30.000 16.000,30.000 C23.720,30.000 30.000,23.720 30.000,16.000 C30.000,8.280 23.720,2.000 16.000,2.000 ZM23.923,16.382 C23.872,16.505 23.799,16.615 23.706,16.708 L19.707,20.707 C19.512,20.902 19.256,21.000 19.000,21.000 C18.744,21.000 18.488,20.902 18.293,20.707 C17.902,20.316 17.902,19.684 18.293,19.293 L20.586,17.000 L9.000,17.000 C8.448,17.000 8.000,16.552 8.000,16.000 C8.000,15.448 8.448,15.000 9.000,15.000 L20.586,15.000 L18.293,12.707 C17.902,12.316 17.902,11.684 18.293,11.293 C18.684,10.902 19.316,10.902 19.707,11.293 L23.706,15.292 C23.799,15.385 23.872,15.495 23.923,15.618 C24.024,15.862 24.024,16.138 23.923,16.382 Z" />
  </Svg>
);

const SaveDownIcon: React.FC<{ size?: number; color?: string }> = ({ size = 28, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <G>
      <Path d="M17.617,6.383a7.944,7.944,0,0,1-1.748,12.568A8.028,8.028,0,0,1,4.283,13.908,8.028,8.028,0,0,1,6.378,6.391c.451-.46-.256-1.168-.707-.707A8.946,8.946,0,0,0,15.427,20.27a8.946,8.946,0,0,0,2.9-14.594c-.451-.461-1.158.247-.707.707Z" />
      <Path d="M15.355,10.6l-3,3a.5.5,0,0,1-.35.15.508.508,0,0,1-.36-.15l-3-3a.5.5,0,0,1,.71-.71l2.14,2.14V3.555a.508.508,0,0,1,.5-.5.5.5,0,0,1,.5.5v8.49l2.15-2.16a.5.5,0,0,1,.71.71Z" />
    </G>
  </Svg>
);

const LabelImageViewerModal: React.FC<LabelImageViewerModalProps> = ({
  visible,
  uri,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [rotIndex, setRotIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const rotation = useSharedValue(0);

  const rotateLeft = useCallback(() => {
    const next = (rotIndex + 3) % 4;
    setRotIndex(next);
    rotation.value = withTiming(ROTATION_OPTIONS[next], { duration: 200 });
  }, [rotIndex, rotation]);

  const rotateRight = useCallback(() => {
    const next = (rotIndex + 1) % 4;
    setRotIndex(next);
    rotation.value = withTiming(ROTATION_OPTIONS[next], { duration: 200 });
  }, [rotIndex, rotation]);

  const handleClose = useCallback(() => {
    setRotIndex(0);
    rotation.value = 0;
    onClose();
  }, [onClose, rotation]);

  const handleSave = useCallback(async () => {
    if (!uri || isSaving) return;
    setIsSaving(true);
    try {
      if (Platform.OS === 'android' && Platform.Version <= 28) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Save to Photos',
            message: 'My M Safety needs permission to save the label.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({ type: 'error', text1: 'Permission denied' });
          return;
        }
      }
      await CameraRoll.saveAsset(uri, { type: 'photo', album: 'My M Safety' });
      Toast.show({ type: 'success', text1: 'Label saved', text2: 'Saved to your Photos library.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Save failed', text2: 'Could not save label to photos.' });
    } finally {
      setIsSaving(false);
    }
  }, [uri, isSaving]);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const isTransverse = rotIndex === 1 || rotIndex === 3;
  const imgDisplayWidth = isTransverse ? SH * 0.6 : SW * 0.9;
  const imgDisplayHeight = isTransverse ? SW * 0.9 : SH * 0.6;

  if (!visible || !uri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <CustomText style={styles.title}>Label Preview</CustomText>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.viewport}>
          <Animated.View style={imageAnimatedStyle}>
            <Image
              source={{ uri }}
              style={{ width: imgDisplayWidth, height: imgDisplayHeight }}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Footer controls */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.btn} onPress={rotateLeft} activeOpacity={0.75}>
            <LeftArrowIcon size={28} color="#FFFFFF" />
            <CustomText style={styles.btnLabel}>Left</CustomText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={rotateRight} activeOpacity={0.75}>
            <RightArrowIcon size={28} color="#FFFFFF" />
            <CustomText style={styles.btnLabel}>Right</CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, isSaving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.75}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <SaveDownIcon size={28} color="#FFFFFF" />
            )}
            <CustomText style={styles.btnLabel}>{isSaving ? 'Saving...' : 'Save'}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 12,
  },
  viewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingTop: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  btn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  btnDisabled: { opacity: 0.5 },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default LabelImageViewerModal;
