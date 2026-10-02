import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';
import DiscoverScreenMobile from './DiscoverScreen.mobile';

export default function DiscoverScreen() {
  const { isTablet } = useDeviceType();
  // Tablet layout built in Phase 4
  return <DiscoverScreenMobile />;
}
