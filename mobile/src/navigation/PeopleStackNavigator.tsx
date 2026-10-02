import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { PeopleStackParamList } from '@navigation/types';
import PeopleScreen from '@screens/new/PeopleScreen';

const Stack = createNativeStackNavigator<PeopleStackParamList>();

export default function PeopleStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PeopleFeed" component={PeopleScreen} />
    </Stack.Navigator>
  );
}
