import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@theme/index';
import { Heading2, BodyText, ButtonText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import { getOnboardingData } from '@services/api/onboarding.service';
import { useLocaleStore } from '@stores/localeStore';
import { useDeviceType } from '@hooks/useDeviceType';
import firstLaunchGuide from '@/data/firstLaunchGuide.json';

// Local PNG assets converted from the My M Safety Ionic app SVGs
const slideLocalAssets: Record<string, ReturnType<typeof require>> = {
  '1': require('@assets/images/slides/welcome.png'),
  '2': require('@assets/images/slides/search.png'),
  '3': require('@assets/images/slides/ghs.png'),
  '4': require('@assets/images/slides/print.png'),
  '5': require('@assets/images/slides/share.png'),
};

interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iconName: string;
  backgroundColor: string;
}

interface FirstLaunchCarouselProps {
  visible: boolean;
  onComplete: () => void;
  skipEnabled?: boolean;
  autoPlayEnabled?: boolean;
}

const FirstLaunchCarousel: React.FC<FirstLaunchCarouselProps> = ({
  visible,
  onComplete,
  skipEnabled = true,
  autoPlayEnabled = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    isTablet,
    width: viewportWidth,
    height: viewportHeight,
  } = useDeviceType();

  // ─── Tablet / iPad layout constants ────────────────────────────────────────
  const TABLET_IMAGE_WIDTH = Math.min(viewportWidth * 0.55, 520);
  const TABLET_TEXT_WIDTH = Math.min(viewportWidth * 0.62, 600);
  const TABLET_ACTIONS_INSET = (viewportWidth - TABLET_TEXT_WIDTH) / 2;
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<
    Record<string, boolean>
  >({});

  // Get locale from store (read-only, don't re-initialize)
  const { language, isRTL, calendarType, timezone } = useLocaleStore();

  // Log locale info when it changes
  useEffect(() => {
    if (visible && language) {
      console.log('🌐 Onboarding using locale from store:', {
        language,
        isRTL,
        calendarType,
        timezone,
      });
    }
  }, [visible, language, isRTL, calendarType, timezone]);

  // Get current language from store, fallback to 'en' if not supported
  const currentLang = useMemo(() => {
    // Use language from store (which is persisted and initialized from device)
    const lang =
      language || i18n.language?.split('-')[0]?.toLowerCase() || 'en';

    // Validate and return supported language
    const supportedLang = ['en', 'fr', 'ar', 'de', 'es', 'it', 'ja', 'pt', 'zh'].includes(lang) ? lang : 'en';
    console.log('🌐 Using language for onboarding:', supportedLang);

    return supportedLang;
  }, [language, i18n.language]);

  // Fetch onboarding data from API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingData,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
    enabled: visible, // Only fetch when modal is visible
  });

  // Get localized data - use API data if available, fallback to local JSON
  const localizedData = useMemo(() => {
    const source = apiData || firstLaunchGuide;
    const data = source[currentLang as keyof typeof source];

    // Log which language data we're using
    if (apiData) {
      console.log('✅ Using API data for language:', currentLang);
    } else {
      console.log('📦 Using fallback JSON data for language:', currentLang);
    }

    return data;
  }, [currentLang, apiData]);

  const dotAnimations = useRef(
    localizedData.screens.map(() => new Animated.Value(8)),
  ).current;

  const isLastSlide = activeSlide === localizedData.screens.length - 1;

  // Animate dots when active slide changes
  React.useEffect(() => {
    dotAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: activeSlide === index ? 24 : 8,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [activeSlide, dotAnimations]);

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      carouselRef.current?.scrollTo({ index: activeSlide + 1, animated: true });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentScreen = localizedData.screens[activeSlide];

  // Handle image error
  const handleImageError = (itemId: string) => {
    console.warn(`Failed to load image for item: ${itemId}`);
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  // Handle image load
  const handleImageLoad = (itemId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  // Initialize image as loading
  useEffect(() => {
    if (localizedData?.screens) {
      const initialLoadingStates: Record<string, boolean> = {};
      localizedData.screens.forEach(screen => {
        if (screen.imageUrl && screen.imageUrl.trim() !== '') {
          initialLoadingStates[screen.id] = true;
        }
      });
      setImageLoadingStates(initialLoadingStates);
    }
  }, [localizedData]);

  const renderItem = ({ item }: { item: OnboardingScreen; index: number }) => {
    const hasRemoteImage = item.imageUrl && item.imageUrl.trim() !== '';
    const hasLocalAsset = !!slideLocalAssets[item.id];
    const imageError = imageErrors[item.id] || false;
    const imageLoading = imageLoadingStates[item.id] || false;

    return (
      <View
        style={[
          styles.slideContainer,
          { width: viewportWidth, height: viewportHeight },
        ]}
      >
        <View
          style={[
            styles.slide,
            isDark ? styles.slideDark : null,
            !isDark ? { backgroundColor: item.backgroundColor } : null,
            isTablet && styles.slideTablet,
          ]}
        >
          {/* Icon/Image Container */}
          <View
            style={[
              styles.iconContainer,
              { height: viewportHeight * 0.4 },
              isDark ? styles.iconContainerDark : styles.iconContainerLight,
              isTablet && [
                styles.iconContainerTablet,
                { width: TABLET_IMAGE_WIDTH },
              ],
            ]}
          >
            {hasRemoteImage && !imageError ? (
              // Remote URL image (API-driven)
              <>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => handleImageError(item.id)}
                  onLoad={() => handleImageLoad(item.id)}
                />
                {imageLoading && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator
                      size="large"
                      color={
                        isDark ? theme.button.primary.background : '#FFFFFF'
                      }
                    />
                  </View>
                )}
              </>
            ) : hasLocalAsset ? (
              // Local PNG asset from My M Safety Ionic app
              <Image
                source={slideLocalAssets[item.id]}
                style={styles.localImage}
                resizeMode="contain"
              />
            ) : (
              // Final fallback: icon placeholder
              <View
                style={[
                  styles.placeholderContainer,
                  isDark
                    ? styles.placeholderDark
                    : { backgroundColor: item.backgroundColor },
                ]}
              >
                <Icon
                  name={item.iconName as IconName}
                  size={120}
                  color={isDark ? theme.text.primary : '#FFFFFF'}
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View
            style={[
              styles.contentContainer,
              isTablet && [
                styles.contentContainerTablet,
                { width: TABLET_TEXT_WIDTH },
              ],
            ]}
          >
            <Heading2
              color={isDark ? theme.text.primary : '#FFFFFF'}
              style={styles.title}
            >
              {item.title}
            </Heading2>
            <BodyText
              color={isDark ? theme.text.secondary : 'rgba(255,255,255,0.95)'}
              style={styles.description}
            >
              {item.description}
            </BodyText>
          </View>
        </View>
      </View>
    );
  };

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <View
          style={[
            styles.modalContainer,
            styles.loadingContainer,
            isDark ? styles.loadingContainerDark : styles.loadingContainerLight,
          ]}
        >
          <Icon
            name="merck-logo"
            size={100}
            color={isDark ? theme.text.primary : '#FFFFFF'}
            style={styles.loadingIcon}
          />
          <ActivityIndicator
            size="large"
            color={isDark ? theme.button.primary.background : '#FFFFFF'}
            style={styles.loadingIndicator}
          />
          <BodyText
            color={isDark ? theme.text.secondary : 'rgba(255,255,255,0.9)'}
            style={styles.loadingText}
          >
            {t('onboarding.loading')}
          </BodyText>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <Carousel
          ref={carouselRef}
          width={viewportWidth}
          height={viewportHeight}
          data={localizedData.screens}
          renderItem={renderItem}
          loop={false}
          autoPlay={autoPlayEnabled}
          autoPlayInterval={5000}
          onProgressChange={(_, absoluteProgress) => {
            const newIndex = Math.round(absoluteProgress);
            if (
              newIndex !== activeSlide &&
              newIndex >= 0 &&
              newIndex < localizedData.screens.length
            ) {
              setActiveSlide(newIndex);
            }
          }}
          enabled={true}
        />

        {/* Fixed Pagination Dots */}
        <View
          style={[
            styles.paginationWrapper,
            isTablet && styles.paginationWrapperTablet,
          ]}
        >
          <View style={styles.paginationContainer}>
            {localizedData.screens.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    width: dotAnimations[index],
                    backgroundColor:
                      activeSlide === index
                        ? isDark
                          ? theme.button.primary.background
                          : '#FFFFFF'
                        : isDark
                        ? theme.background.tertiary
                        : 'rgba(255,255,255,0.4)',
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Fixed Bottom Actions */}
        <View
          style={[
            styles.actionsWrapper,
            isTablet && [
              styles.actionsWrapperTablet,
              { paddingHorizontal: TABLET_ACTIONS_INSET },
            ],
          ]}
        >
          <View style={styles.actionsContainer}>
            {skipEnabled && !isLastSlide ? (
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <ButtonText
                  color={
                    isDark ? theme.text.secondary : 'rgba(255,255,255,0.8)'
                  }
                >
                  {t('onboarding.skip', { defaultValue: localizedData.skip })}
                </ButtonText>
              </TouchableOpacity>
            ) : (
              <View style={styles.skipButton} />
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.nextButton,
                isDark ? styles.nextButtonDark : styles.nextButtonLight,
              ]}
            >
              <ButtonText
                color={
                  isDark
                    ? theme.button.primary.text
                    : currentScreen.backgroundColor
                }
                style={styles.nextButtonText}
              >
                {isLastSlide
                  ? t('onboarding.getStarted', {
                      defaultValue: localizedData.getStarted,
                    })
                  : t('onboarding.next', { defaultValue: localizedData.next })}
              </ButtonText>
              {!isLastSlide && (
                <Icon
                  name="arrow-right"
                  size={20}
                  color={
                    isDark
                      ? theme.button.primary.text
                      : currentScreen.backgroundColor
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  // width/height applied inline (computed per device)
  slideContainer: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingBottom: 180,
    paddingHorizontal: 30,
  },
  slideDark: {
    backgroundColor: '#000000',
  },
  // height applied inline (computed per device)
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 40,
  },
  iconContainerLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  localImage: {
    width: '85%',
    height: '85%',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  placeholderDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  paginationWrapper: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionsWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  nextButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  nextButtonDark: {
    backgroundColor: '#4A90E2',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerDark: {
    backgroundColor: '#000000',
  },
  loadingContainerLight: {
    backgroundColor: '#4A90E2',
  },
  loadingIcon: {
    marginBottom: 40,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },

  // ─── Tablet / iPad overrides (applied on top of phone styles) ──────────────
  // Centre the slide's column so image + text sit in a narrow channel
  slideTablet: {
    alignItems: 'center',
    paddingHorizontal: 0, // the child widths handle their own inset
    paddingTop: 100,
    paddingBottom: 200,
  },
  // Image / placeholder box: width applied inline (computed per device)
  iconContainerTablet: {
    alignSelf: 'center',
  },
  // Text column: width applied inline (computed per device)
  contentContainerTablet: {
    alignSelf: 'center',
    paddingHorizontal: 0,
  },
  // Pagination: push slightly higher so it doesn't clash on tall iPads
  paginationWrapperTablet: {
    bottom: 160,
  },
  // Actions bar: paddingHorizontal applied inline (computed per device)
  actionsWrapperTablet: {
    bottom: 64,
  },
});

export default FirstLaunchCarousel;
