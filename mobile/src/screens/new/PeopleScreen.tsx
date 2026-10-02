import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';
import PeopleScreenMobile from './PeopleScreen.mobile';

export default function PeopleScreen() {
  const { isTablet } = useDeviceType();
  // Tablet layout built in Phase 3
  return <PeopleScreenMobile />;
}
