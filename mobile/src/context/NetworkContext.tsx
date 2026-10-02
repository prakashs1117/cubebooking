/**
 * NetworkContext - Network status management using NetInfo
 * Provides network state throughout the application
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string;
  isOffline: boolean;
}

interface NetworkContextType extends NetworkState {
  refreshNetworkState: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    connectionType: 'unknown',
    isOffline: true, // Start with offline assumption
  });

  const updateNetworkState = (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? false;
    const isOffline = !isConnected || !isInternetReachable;

    setNetworkState({
      isConnected,
      isInternetReachable,
      connectionType: state.type || 'unknown',
      isOffline,
    });
  };

  const refreshNetworkState = async (): Promise<void> => {
    try {
      const state = await NetInfo.refresh();
      updateNetworkState(state);
    } catch (error) {
      console.warn('Failed to refresh network state:', error);
    }
  };

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(updateNetworkState);

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: NetworkContextType = {
    ...networkState,
    refreshNetworkState,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
