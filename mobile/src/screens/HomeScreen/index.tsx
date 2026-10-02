import React, { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import ResponsiveView from '@components/common/ResponsiveView';
import type { HeroSlide } from '@components/common/HeroCarouselHeader';
import type {
  CardSectionData,
  InsightSectionData,
} from '@components/home/types';
import curatedData from '@/data/curatedHomeData.json';
import HomeScreenPhone from './HomeScreen.phone';
import HomeScreenTablet from './HomeScreen.tablet';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const heroSlides: HeroSlide[] = useMemo(
    () =>
      curatedData.heroSlides.map(slide => ({
        ...slide,
        onCtaPress:
          slide.ctaAction === 'navigate' && slide.ctaTarget
            ? () => {
                try {
                  navigation.navigate(slide.ctaTarget as string);
                } catch {}
              }
            : undefined,
      })),
    [navigation],
  );

  const cardSection = curatedData.sections.find(
    s => s.type === 'horizontal-cards',
  ) as CardSectionData | undefined;

  const insightSection = curatedData.sections.find(
    s => s.type === 'vertical-list',
  ) as InsightSectionData | undefined;

  const mockSearch = useCallback(async (query: string) => {
    await new Promise<void>(r => setTimeout(r, 800));
    return [
      { id: 1, title: `${query} - Result 1`, name: 'Clinical Trial Update' },
      { id: 2, title: `${query} - Result 2`, name: 'Drug Discovery News' },
      { id: 3, title: `${query} - Result 3`, name: 'Regulatory Briefing' },
    ];
  }, []);

  const phoneProps = {
    cardSection,
    insightSection,
  };

  return (
    <ResponsiveView
      phone={<HomeScreenPhone {...phoneProps} />}
      tablet={<HomeScreenTablet />}
    />
  );
};

export default HomeScreen;
