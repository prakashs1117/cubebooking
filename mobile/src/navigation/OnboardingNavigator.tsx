import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingFlow from '@screens/fe/onboarding/OnboardingFlow';
import AuthScreen from '@screens/fe/auth/AuthScreen';

export type OnboardingParamList = {
  Flow: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<OnboardingParamList>();

/**
 * Pre-auth: the full onboarding funnel (welcome → assessment → signup → trial).
 * Existing users reach the sign-in screen via the "Log in" link.
 */
export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Flow">
        {({ navigation }) => (
          <OnboardingFlow onLogin={() => navigation.navigate('Login')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login" component={AuthScreen} />
    </Stack.Navigator>
  );
}
