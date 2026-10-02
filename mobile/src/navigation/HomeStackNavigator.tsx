import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@navigation/types';
import DashboardScreen from '@screens/new/DashboardScreen';
import FAQScreen from '@screens/new/FAQScreen';
import FeedbackScreen from '@screens/new/FeedbackScreen';
import ContactScreen from '@screens/new/ContactScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeDashboard" component={DashboardScreen} />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
