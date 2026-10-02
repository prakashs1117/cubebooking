import React, { useRef, useState } from 'react';
import { View, Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import HeroSlideItem from './HeroSlideItem';
import HeroOverlayHeader from './HeroOverlayHeader';
import type { HeroCarouselHeaderProps } from './types';

export type { HeroSlide } from './types';
export { default as HeroOverlayHeader } from './HeroOverlayHeader';

const { width: SW, height: SH } = Dimensions.get('window');

const HeroCarouselHeader: React.FC<HeroCarouselHeaderProps> = ({
  slides,
  heroHeight = 'half',
  title = 'CURATED',
  showHamburger = false,
  onMenuPress,
  autoPlay = true,
  autoPlayInterval = 4000,
  showDots = false,
  stickyHeader = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const carouselHeight = heroHeight === 'full' ? SH : Math.round(SH * 0.5);

  // contentBottom drives how far up slide content sits from the bottom of the hero
  const contentBottom = heroHeight === 'full' ? 80 : 36;

  return (
    <View style={{ height: carouselHeight }}>
      <Carousel
        ref={carouselRef}
        width={SW}
        height={carouselHeight}
        data={slides}
        renderItem={({ item, index }) => (
          <HeroSlideItem
            item={item}
            index={index}
            carouselHeight={carouselHeight}
            contentBottom={contentBottom}
            showDots={showDots}
            activeIndex={activeIndex}
            totalSlides={slides.length}
          />
        )}
        loop={slides.length > 1}
        autoPlay={autoPlay && slides.length > 1}
        autoPlayInterval={autoPlayInterval}
        onProgressChange={(_, absoluteProgress) => {
          const next = Math.round(absoluteProgress) % slides.length;
          if (next !== activeIndex) setActiveIndex(next);
        }}
        style={{ width: SW }}
      />

      {/* When not sticky, render overlay header inside the carousel so it overlays the image */}
      {!stickyHeader && (
        <HeroOverlayHeader
          title={title}
          showHamburger={showHamburger}
          onMenuPress={onMenuPress}
        />
      )}
    </View>
  );
};

export default HeroCarouselHeader;
