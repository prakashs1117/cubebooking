import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { EventsStackParamList } from '@navigation/types';
import EventsScreen from '@screens/new/EventsScreen';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
    </Stack.Navigator>
  );
}
