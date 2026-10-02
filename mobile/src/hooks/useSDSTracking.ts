import { useEffect, useRef } from 'react';
import { analytics } from '@services/analyticsService';

interface UseSDSTrackingProps {
  materialNumber: string;
  productName?: string;
  validityArea?: 'EU' | 'US' | 'CN';
  language?: 'EN' | 'FR' | 'AR' | 'ZH';
  sdsSystem?: 'NEX' | 'P24';
  source?: 'search' | 'barcode' | 'favorites' | 'history';
}

/**
 * Hook to track Safety Data Sheet (SDS) viewing with metrics:
 * - Scroll depth percentage
 * - Sections viewed
 * - Time spent on SDS
 *
 * Usage in SDSDetailScreen:
 *
 * const { handleScroll, handleSectionViewed } = useSDSTracking({
 *   materialNumber: sds.materialNumber,
 *   productName: sds.productName,
 *   validityArea: 'EU',
 *   language: 'EN',
 * });
 *
 * // On FlatList scroll event:
 * onScroll={(event) => {
 *   const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
 *   handleScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
 * }}
 *
 * // On section header tap:
 * onSectionPress={(sectionNumber) => {
 *   handleSectionViewed(String(sectionNumber));
 * }}
 */
export function useSDSTracking({
  materialNumber,
  productName,
  validityArea = 'EU',
  language = 'EN',
  sdsSystem = 'NEX',
  source = 'search',
}: UseSDSTrackingProps) {
  const mountTimeRef = useRef(Date.now());
  const maxScrollPercentRef = useRef(0);
  const sectionsViewedRef = useRef<Set<string>>(new Set());
  const hasLoggedOnMountRef = useRef(false);

  // Log on mount
  useEffect(() => {
    if (!hasLoggedOnMountRef.current) {
      hasLoggedOnMountRef.current = true;
      try {
        analytics.logSDSViewed({
          material_number: materialNumber,
          product_name: productName,
          sds_system: sdsSystem,
          validity_area: validityArea,
          language,
          source,
        });
      } catch (error) {
        console.warn('Failed to log SDS viewed on mount:', error);
      }
    }

    // Log with accumulated metrics on unmount
    return () => {
      try {
        const timeOnSds = Math.floor((Date.now() - mountTimeRef.current) / 1000);
        analytics.logSDSViewed({
          material_number: materialNumber,
          product_name: productName,
          sds_system: sdsSystem,
          validity_area: validityArea,
          language,
          source,
          scroll_depth_percent: maxScrollPercentRef.current,
          time_on_sds_seconds: timeOnSds,
          sections_viewed: Array.from(sectionsViewedRef.current),
        });
      } catch (error) {
        console.warn('Failed to log SDS viewed on unmount:', error);
      }
    };
  }, [materialNumber, productName, validityArea, language, sdsSystem, source]);

  /**
   * Call this from FlatList onScroll event to track scroll depth.
   * Pass the contentOffset.y, contentSize.height, and layoutMeasurement.height
   * from the scroll event's nativeEvent.
   */
  const handleScroll = (
    contentOffsetY: number,
    contentHeight: number,
    scrollViewHeight: number,
  ) => {
    if (contentHeight <= scrollViewHeight) {
      // Content fits entirely in view (no scrolling possible)
      maxScrollPercentRef.current = 100;
      return;
    }

    const scrollableHeight = contentHeight - scrollViewHeight;
    const percentage = Math.floor((contentOffsetY / scrollableHeight) * 100);
    maxScrollPercentRef.current = Math.max(
      maxScrollPercentRef.current,
      Math.min(percentage, 100),
    );
  };

  /**
   * Call this when user taps or views a specific SDS section
   * (e.g., when expanding a section header).
   */
  const handleSectionViewed = (sectionNumber: string) => {
    sectionsViewedRef.current.add(sectionNumber);
  };

  return { handleScroll, handleSectionViewed };
}
