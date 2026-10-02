import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { Heading3, BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { useDeviceType } from '@hooks/useDeviceType';
import homeCarouselData from '@/data/homeCarouselData.json';

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor: string;
}

const HomeCarousel: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { i18n } = useTranslation();
  const { isTablet: IS_TABLET, width: viewportWidth } = useDeviceType();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const ITEM_WIDTH = IS_TABLET ? 380 : Math.round(viewportWidth * 0.9);
  const ITEM_HEIGHT = IS_TABLET ? 280 : 240;

  // Get current language, fallback to 'en' if not supported
  const currentLang = useMemo(() => {
    const lang = i18n.language.split('-')[0]; // Handle 'en-US' -> 'en'
    return ['en', 'fr', 'ar'].includes(lang) ? lang : 'en';
  }, [i18n.language]);

  // Get localized data
  const localizedCarouselItems = useMemo(() => {
    return homeCarouselData[currentLang as keyof typeof homeCarouselData].items;
  }, [currentLang]);

  // Hide carousel on iPad/tablets
  if (IS_TABLET) {
    return null;
  }

  // Calculate how many items to show on tablet
  const visibleItems = IS_TABLET
    ? Math.floor(viewportWidth / (ITEM_WIDTH + 20))
    : 1;

  const renderItem = ({ item }: { item: CarouselItem; index: number }) => {
    const hasImage = item.imageUrl && item.imageUrl.trim() !== '';

    return (
      <View style={[styles.slideContainer, { width: ITEM_WIDTH }]}>
        <View
          style={[
            styles.slide,
            {
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              backgroundColor: isDark
                ? theme.background.card
                : item.backgroundColor,
              borderColor: theme.border.primary,
            },
          ]}
        >
          {/* Image or Placeholder */}
          <View
            style={[
              styles.imageContainer,
              {
                height: IS_TABLET ? 160 : 140,
                backgroundColor: isDark
                  ? theme.background.tertiary
                  : 'rgba(255,255,255,0.2)',
              },
            ]}
          >
            {hasImage ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Icon
                  name="merck-logo"
                  size={80}
                  color={
                    isDark ? theme.text.secondary : 'rgba(255,255,255,0.8)'
                  }
                />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Heading3
              color={isDark ? theme.text.primary : '#FFFFFF'}
              style={styles.title}
            >
              {item.title}
            </Heading3>
            <BodyText
              color={isDark ? theme.text.secondary : 'rgba(255,255,255,0.9)'}
              style={[
                styles.description,
                {
                  fontSize: IS_TABLET ? 15 : 14,
                  lineHeight: IS_TABLET ? 22 : 20,
                },
              ]}
            >
              {item.description}
            </BodyText>
          </View>
        </View>
      </View>
    );
  };

  // Pagination removed as per user request

  return (
    <View
      style={[
        styles.container,
        { width: viewportWidth },
        IS_TABLET && styles.tabletContainer,
      ]}
    >
      <Carousel
        ref={carouselRef}
        width={ITEM_WIDTH + 20}
        height={ITEM_HEIGHT}
        data={localizedCarouselItems}
        renderItem={renderItem}
        loop={localizedCarouselItems.length > visibleItems}
        autoPlay
        autoPlayInterval={4000}
        onProgressChange={(_, absoluteProgress) => {
          const newIndex = Math.round(absoluteProgress);
          if (newIndex !== activeSlide) {
            setActiveSlide(newIndex);
          }
        }}
        mode={IS_TABLET ? 'horizontal-stack' : 'parallax'}
        modeConfig={
          IS_TABLET
            ? {
                snapDirection: 'left',
                stackInterval: ITEM_WIDTH + 20,
              }
            : {
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }
        }
        style={[styles.carousel, { width: viewportWidth }]}
        pagingEnabled={!IS_TABLET}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // width applied inline (computed per device)
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  tabletContainer: {
    paddingHorizontal: 20,
  },
  // width applied inline
  carousel: {},
  // width applied inline
  slideContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // width/height applied inline
  slide: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  // height applied inline
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  // fontSize/lineHeight applied inline
  description: {
    textAlign: 'center',
  },
});

export default HomeCarousel;
