import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DiscoverStackParamList } from '@navigation/types';
import DiscoverScreen from '@screens/new/DiscoverScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverFeed" component={DiscoverScreen} />
    </Stack.Navigator>
  );
}
