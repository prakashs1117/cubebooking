import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FETabBar from '@components/fe/organisms/FETabBar';
import TodayScreen from '@screens/fe/TodayScreen';
import CommunityScreen from '@screens/fe/CommunityScreen';
import ProgressScreen from '@screens/fe/ProgressScreen';
import ProfileScreen from '@screens/fe/ProfileScreen';
import PracticeStackNavigator from '@navigation/PracticeStackNavigator';

import type { FETabParamList } from '@navigation/types';

const Tab = createBottomTabNavigator<FETabParamList>();

/**
 * FluentEdge bottom-tab shell: Today · Community · (center mic → Practice stack) ·
 * Progress · Profile, with the floating glass tab bar + center mic FAB.
 */
export default function FETabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FETabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Today"
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="PracticeNav" component={PracticeStackNavigator} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
