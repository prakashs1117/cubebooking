import React from 'react';
import { HeaderType1, HeaderType2, HeaderType3 } from '@components/headers';
import { getHeaderType } from '@utils/platformConfig';
import { EventData } from '@services/eventsService';

interface HeaderProps {
  eventData?: EventData;
}

/**
 * Get the appropriate header component based on platform configuration
 * @param eventData - Event data to pass to header (required for type1)
 * @returns React component for the configured header type
 */
export const getHeaderComponent = (eventData?: EventData): React.ReactNode => {
  const headerType = getHeaderType();

  switch (headerType) {
    case 'type1':
      return eventData ? <HeaderType1 eventData={eventData} /> : null;
    case 'type2':
      return <HeaderType2 />;
    case 'type3':
      return <HeaderType3 />;
    default:
      return eventData ? <HeaderType1 eventData={eventData} /> : null;
  }
};

/**
 * Hook to get the configured header component
 * @param props - Props to pass to the header component
 * @returns React component for the configured header type
 */
export const useHeaderComponent = (props?: HeaderProps): React.ReactNode => {
  return getHeaderComponent(props?.eventData);
};
