import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceRegion, type DeviceRegion } from '@services/locationService';
import { useLocaleStore } from '@/stores/localeStore';

interface RegionContextValue {
  region: DeviceRegion;
  isLoading: boolean;
  refresh: () => void;
}

const RegionContext = createContext<RegionContextValue>({
  region: 'UNKNOWN',
  isLoading: true,
  refresh: () => {},
});

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setRegionInStore = useLocaleStore(s => s.setRegion);
  // Initialise from persisted store so UI has a value before GPS resolves
  const persistedRegion = useLocaleStore(s => s.region);
  const [region, setRegion] = useState<DeviceRegion>(persistedRegion);
  const [isLoading, setIsLoading] = useState(true);

  const detect = async () => {
    setIsLoading(true);
    const detected = await getDeviceRegion();
    setRegion(detected);
    setRegionInStore(detected); // persist to Zustand + AsyncStorage
    setIsLoading(false);
  };

  useEffect(() => {
    detect();
  }, []);

  return (
    <RegionContext.Provider value={{ region, isLoading, refresh: detect }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = (): RegionContextValue => useContext(RegionContext);
