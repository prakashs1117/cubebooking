import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';
import DashboardScreen from './DashboardScreen';
import DashboardScreenTablet from './DashboardScreen.tablet';

/**
 * Routes to the correct Dashboard layout based on device width.
 * Uses useDeviceType() (reactive to orientation changes) instead of
 * the static Dimensions.get() snapshot.
 */
export default function HomeScreen() {
  const { isTablet, isDesktop } = useDeviceType();
  return (isTablet || isDesktop) ? <DashboardScreenTablet /> : <DashboardScreen />;
}
