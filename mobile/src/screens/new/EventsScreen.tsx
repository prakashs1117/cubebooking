import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';
import EventsScreenMobile from './EventsScreen.mobile';

export default function EventsScreen() {
  const { isTablet } = useDeviceType();
  // Tablet layout built in Phase 2
  return <EventsScreenMobile />;
}
