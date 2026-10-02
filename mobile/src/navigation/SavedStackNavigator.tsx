import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SavedScreen from '@screens/new/SavedScreen';
import type { SavedStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export default function SavedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedList" component={SavedScreen} />
    </Stack.Navigator>
  );
}
