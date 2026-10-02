import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import DrawerNavigator from '@navigation/DrawerNavigator';
import SignInScreen from '@screens/new/SignInScreen';
import SignUpScreen from '@screens/new/SignUpScreen';
import { useFeAuthStore } from '@stores/feAuthStore';
import { useFETheme } from '@theme/useFETheme';
import { MERCK_TOKENS } from '@theme/merckTokens';

import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth stack — shown when not logged in
const AuthStack = createNativeStackNavigator<{ SignIn: undefined; SignUp: undefined }>();
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const t = useFETheme();
  const status = useFeAuthStore(s => s.status);
  const hydrate = useFeAuthStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (status === 'hydrating') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: MERCK_TOKENS.bgApp }}>
        <ActivityIndicator size="large" color={MERCK_TOKENS.green} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {status === 'authed' ? (
        <RootStack.Screen name="Main" component={DrawerNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
