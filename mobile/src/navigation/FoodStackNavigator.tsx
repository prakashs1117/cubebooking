import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FoodScreen from '@screens/new/FoodScreen';
import AllOrdersScreen from '@screens/new/AllOrdersScreen';
import type { FoodStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<FoodStackParamList>();

export default function FoodStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FoodMenu"   component={FoodScreen} />
      <Stack.Screen name="AllOrders"  component={AllOrdersScreen} />
    </Stack.Navigator>
  );
}
