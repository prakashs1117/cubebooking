import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS, DeviceType } from '@config/breakpoints';

export interface DeviceTypeResult {
  deviceType: DeviceType;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Single hook that replaces all ad-hoc `isTablet` derivations across the app.
 * Reacts to orientation / window-size changes automatically.
 */
export const useDeviceType = (): DeviceTypeResult => {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= BREAKPOINTS.DESKTOP;
  const isTablet = !isDesktop && width >= BREAKPOINTS.TABLET;
  const isPhone = !isTablet && !isDesktop;

  const deviceType: DeviceType = isDesktop
    ? 'desktop'
    : isTablet
    ? 'tablet'
    : 'phone';

  return { deviceType, isPhone, isTablet, isDesktop, width, height };
};
