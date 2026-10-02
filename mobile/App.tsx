import React, { useEffect, useState, useCallback } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { i18nReady } from './src/localization/i18n';
import './src/utils/globalFonts';
import './src/utils/debugAuth';
import { apiConfig } from './src/config';
import { initializePushNotifications } from './src/services/pushNotificationService';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { TabBarVisibilityProvider } from './src/context/TabBarVisibilityContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { NetworkStatusHandler } from './src/components/common/NetworkStatusHandler';
import { queryClient } from './src/lib/queryClient';
import { toastConfig } from './src/components/toast/CustomToast';
import AnimatedBootSplash from './src/components/splash/AnimatedBootSplash';
import FirstLaunchCarousel from './src/components/onboarding/FirstLaunchCarousel';
import { hasCompletedOnboarding, setOnboardingCompleted } from './src/services/onboardingService';
import BootSplash from 'react-native-bootsplash';

function App() {
  const systemColorScheme = useColorScheme();
  const initialTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  const [i18nLoaded, setI18nLoaded] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    i18nReady.then(async () => {
      const seen = await hasCompletedOnboarding();
      setShowOnboarding(!seen);
      setTimeout(() => {
        BootSplash.hide({ fade: true }).catch(() => {});
      }, 100);
      setI18nLoaded(true);
    });
  }, []);

  // Wake up the Render backend on app start (free tier spins down after inactivity).
  // Fire-and-forget — runs silently in background during splash.
  useEffect(() => {
    const baseUrl = apiConfig.baseUrl.replace('/api/v1', '');
    fetch(`${baseUrl}/health`, { method: 'GET' }).catch(() => {});
  }, []);

  // Initialize Firebase push notifications once on mount.
  // Returns a cleanup function that removes foreground/token listeners.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initializePushNotifications().then(fn => { cleanup = fn; }).catch(() => {});
    return () => { cleanup?.(); };
  }, []);

  const handleSplashAnimationEnd = useCallback(() => {
    setSplashVisible(false);
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    await setOnboardingCompleted();
    setShowOnboarding(false);
  }, []);

  if (!i18nLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <BottomSheetModalProvider>
              <NetworkProvider>
                <NetworkStatusHandler>
                  <AuthProvider>
                    <TabBarVisibilityProvider>
                      <NavigationContainer>
                        <RootNavigator />
                      </NavigationContainer>
                    </TabBarVisibilityProvider>
                  </AuthProvider>
                  <FirstLaunchCarousel
                    visible={!splashVisible && showOnboarding}
                    onComplete={handleOnboardingComplete}
                  />
                </NetworkStatusHandler>
              </NetworkProvider>
            </BottomSheetModalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
        <Toast config={toastConfig} />
        {splashVisible && (
          <AnimatedBootSplash onAnimationEnd={handleSplashAnimationEnd} />
        )}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
