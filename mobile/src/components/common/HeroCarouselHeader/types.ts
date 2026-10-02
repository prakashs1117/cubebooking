export interface HeroSlide {
  id: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  headline: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export interface HeroCarouselHeaderProps {
  slides: HeroSlide[];
  /** 'half' = 50 % of screen height, 'full' = 100 % */
  heroHeight?: 'half' | 'full';
  title?: string;
  showHamburger?: boolean;
  onMenuPress?: () => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  /** Show pagination dots below slide content. Default false. */
  showDots?: boolean;
  /**
   * When true the overlay header is NOT rendered inside the carousel.
   * The parent must render <HeroOverlayHeader> as a sibling of the ScrollView
   * so it stays fixed while the hero scrolls. Default true.
   */
  stickyHeader?: boolean;
}
