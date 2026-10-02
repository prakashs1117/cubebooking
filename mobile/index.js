/**
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Firebase disabled - messaging import removed
// import messaging from '@react-native-firebase/messaging';
// import { crashlytics } from '@services/crashlyticsService';
import App from './App';
import { name as appName } from './app.json';

// ─── Global JS error handler ─────────────────────────────────────────────────
// Catches unhandled JS exceptions and forwards them to Crashlytics before
// delegating to the default React Native error handler.
const defaultHandler = ErrorUtils.getGlobalHandler();
// ErrorUtils.setGlobalHandler((error, isFatal) => {
//   crashlytics.recordError(error, isFatal ? 'fatal' : 'non-fatal');
//   defaultHandler(error, isFatal);
// });

// Background / quit-state FCM handler — must be registered before AppRegistry.
// This runs in a headless JS task; no UI is available here.
// Firebase disabled - background message handler removed
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('📩 FCM background message received:', remoteMessage);
//   // The system tray notification is displayed automatically by FCM in background/quit.
// });

const AppWithGestureHandler = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

AppRegistry.registerComponent(appName, () => AppWithGestureHandler);
