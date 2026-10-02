/**
 * NetworkStatusHandler - Handles network status changes and shows popup when offline
 * Integrates with NetworkContext and NoNetworkPopup
 */

import React, { useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NoNetworkPopup } from './NoNetworkPopup';
import { useNetwork } from '@context/NetworkContext';

interface NetworkStatusHandlerProps {
  children: ReactNode;
}

export const NetworkStatusHandler: React.FC<NetworkStatusHandlerProps> = ({
  children,
}) => {
  const { isConnected } = useNetwork();
  const [showPopup, setShowPopup] = useState(false);
  const [hasShownOfflinePopup, setHasShownOfflinePopup] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Add delay on initial load to prevent premature popup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000); // 2-second delay to allow NetInfo to properly initialize

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't check network status during initial load
    if (isInitialLoad) return;

    // Only show popup when there's truly no internet connection
    // Primary check: rely on isConnected which is more reliable
    console.log('@123 isConnected ', isConnected);

    // Primary check: isConnected is the most reliable indicator
    // Only show popup when definitely not connected
    const hasNoInternet = isConnected === false;

    // Show popup when going offline (but only once per offline session)
    // Only rely on isConnected since isInternetReachable can be unreliable
    if (hasNoInternet && !hasShownOfflinePopup && isConnected !== null) {
      setShowPopup(true);
      setHasShownOfflinePopup(true);
    }

    // Reset the flag when back online (connected)
    if (isConnected === true) {
      setHasShownOfflinePopup(false);
      setShowPopup(false); // Auto-hide popup when connection is restored
    }
  }, [isConnected, hasShownOfflinePopup, isInitialLoad]);

  const handleRetry = () => {
    // Force NetInfo to re-check connection
    NetInfo.refresh().then(state => {
      // Close popup unless explicitly still disconnected (false).
      // isConnected can return null (unknown) on Android even when reconnected —
      // treating null as falsy was preventing the popup from closing.
      if (state.isConnected !== false) {
        setShowPopup(false);
      }
    });
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      {children}

      <NoNetworkPopup
        visible={showPopup}
        onRetry={handleRetry}
        onClose={handleClose}
      />
    </>
  );
};
