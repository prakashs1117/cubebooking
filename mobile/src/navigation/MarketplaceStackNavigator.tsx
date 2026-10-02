import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MarketplaceStackParamList } from '@navigation/types';
import MarketplaceScreen from '@screens/new/MarketplaceScreen';
import MarketplaceDetailScreen from '@screens/new/MarketplaceDetailScreen';
import MarketplaceSubmitScreen from '@screens/new/MarketplaceSubmitScreen';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function MarketplaceStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketplaceList"   component={MarketplaceScreen} />
      <Stack.Screen name="MarketplaceDetail" component={MarketplaceDetailScreen} />
      <Stack.Screen name="MarketplaceSubmit" component={MarketplaceSubmitScreen} />
    </Stack.Navigator>
  );
}
