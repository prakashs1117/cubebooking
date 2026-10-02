import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '@theme/index';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShowLessIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#FF6B6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12,0C5.38,0,0,5.38,0,12c0,6.62,5.38,12,12,12c6.62,0,12-5.38,12-12C24,5.38,18.62,0,12,0z M12,22C6.49,22,2,17.51,2,12C2,6.49,6.49,2,12,2c5.51,0,10,4.49,10,10C22,17.51,17.51,22,12,22z M20,11v2H4v-2H20z" />
  </Svg>
);

interface SearchPromptCardProps {
  onClose?: () => void;
  onDismissPermanently?: () => void;
  testID?: string;
}

const STORAGE_KEY = 'searchPromptCardDismissed';

const SearchPromptCard: React.FC<SearchPromptCardProps> = ({
  onClose,
  onDismissPermanently,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleClosePermanently = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      setIsVisible(false);
      setShowBottomSheet(false);
      onDismissPermanently?.();
    } catch (error) {
      console.error('Error saving dismissal preference:', error);
    }
  }, [onDismissPermanently]);

  const handleCloseTemporarily = useCallback(() => {
    setIsVisible(false);
    setShowBottomSheet(false);
    onClose?.();
  }, [onClose]);

  const handleCloseButtonPress = () => {
    setShowBottomSheet(true);
  };

  if (!isVisible) {
    return null;
  }

  const styles = getStyles(theme, isDark);

  return (
    <>
      <View style={styles.wrapper} testID={testID}>
        <View style={styles.container}>
          <Image
            source={require('@assets/images/slides/search.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <CustomText variant="bodyLarge" style={styles.title}>
              {t('home.searchPromptTitle')}
            </CustomText>
            <CustomText variant="bodyMedium" style={styles.description}>
              {t('home.searchPromptDescription')}
            </CustomText>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleCloseButtonPress}
          activeOpacity={0.7}
          style={styles.closeButton}
        >
          <Icon name="close" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showBottomSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBottomSheet(false)}
        >
          <Pressable
            style={styles.bottomSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.bottomSheetHandle} />

            <CustomText variant="bodyLarge" style={styles.bottomSheetTitle}>
              {t('home.dismissPromptTitle') || 'Dismiss Prompt Card'}
            </CustomText>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.option, styles.optionTemporary]}
                onPress={handleCloseTemporarily}
                activeOpacity={0.7}
              >
                <Icon name="close" size={18} color="#0070C0" />
                <View style={styles.optionTextContainer}>
                  <CustomText
                    variant="bodySmall"
                    style={styles.optionTitle}
                  >
                    {t('home.dismissTemporarily') || 'Close for Now'}
                  </CustomText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, styles.optionPermanent]}
                onPress={handleClosePermanently}
                activeOpacity={0.7}
              >
                <ShowLessIcon size={18} color="#FF6B6B" />
                <View style={styles.optionTextContainer}>
                  <CustomText
                    variant="bodySmall"
                    style={styles.optionTitle}
                  >
                    {t('home.dismissPermanently') || "Don't Show Again"}
                  </CustomText>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBottomSheet(false)}
              activeOpacity={0.7}
            >
              <CustomText variant="bodyMedium" style={styles.cancelButtonText}>
                {t('common.cancel') || 'Cancel'}
              </CustomText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 24,
      position: 'relative',
    },
    container: {
      paddingVertical: 20,
      paddingHorizontal: 16,
      backgroundColor: '#F5C518',
      borderRadius: 16,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    image: {
      width: 160,
      height: 140,
    },
    textContainer: {
      alignItems: 'center',
    },
    title: {
      color: '#000',
      fontWeight: '600',
      marginBottom: 6,
      lineHeight: 20,
      textAlign: 'center',
    },
    description: {
      color: '#333333',
      lineHeight: 16,
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    bottomSheet: {
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 12,
      paddingBottom: 32,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: isDark ? '#666666' : '#DDDDDD',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    bottomSheetTitle: {
      textAlign: 'center',
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
      marginBottom: 20,
    },
    optionsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8,
    },
    optionTemporary: {
      backgroundColor: isDark ? '#2A2A2A' : '#E8F4FD',
    },
    optionPermanent: {
      backgroundColor: isDark ? '#2A2A2A' : '#FFE8E8',
    },
    optionTextContainer: {
      flex: 1,
    },
    optionTitle: {
      color: isDark ? '#FFFFFF' : '#000000',
      fontWeight: '600',
    },
    optionDescription: {
      color: isDark ? '#CCCCCC' : '#666666',
      fontSize: 12,
    },
    cancelButton: {
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#444444' : '#EEEEEE',
    },
    cancelButtonText: {
      textAlign: 'center',
      color: isDark ? '#FFFFFF' : '#666666',
      fontWeight: '500',
    },
  });

export default SearchPromptCard;
