import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from '@screens/fe/PracticeScreen';
import TableTopicsScreen from '@screens/fe/practice/TableTopicsScreen';
import GamesHubScreen from '@screens/fe/practice/GamesHubScreen';
import FillerWordSlayerScreen from '@screens/fe/practice/FillerWordSlayerScreen';
import GamePlaceholderScreen from '@screens/fe/practice/GamePlaceholderScreen';
import type { PracticeStackParamList } from '@navigation/types';

const Stack = createNativeStackNavigator<PracticeStackParamList>();

/**
 * Practice nested stack navigator.
 * Allows navigation from PracticeHub (the drill list) to individual practice modes
 * (Table Topics, Rapid Response, etc) without losing the tab's position.
 */
export default function PracticeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: 'transparent' },
      }}
      initialRouteName="PracticeHub"
    >
      <Stack.Screen name="PracticeHub" component={PracticeScreen} />
      <Stack.Screen name="TableTopics" component={TableTopicsScreen} />
      <Stack.Screen name="GamesHub" component={GamesHubScreen} />
      <Stack.Screen name="FillerWordSlayer" component={FillerWordSlayerScreen} />
      <Stack.Screen name="GamePlaceholder" component={GamePlaceholderScreen} />
    </Stack.Navigator>
  );
}
