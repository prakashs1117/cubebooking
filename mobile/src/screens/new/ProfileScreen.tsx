import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';
import ProfileScreenMobile from './ProfileScreen.mobile';

export default function ProfileScreen() {
  const { isTablet } = useDeviceType();
  // Tablet layout built in Phase 5
  return <ProfileScreenMobile />;
}
