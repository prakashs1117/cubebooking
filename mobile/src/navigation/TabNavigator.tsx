import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MerckTabBar from '@components/navigation/MerckTabBar';
import HomeStackNavigator from '@navigation/HomeStackNavigator';
import FoodStackNavigator from '@navigation/FoodStackNavigator';
import ProfileScreen from '@screens/new/ProfileScreen';
import VendorScreen from '@screens/new/VendorScreen';
import type { TabParamList } from '@navigation/types';
import { useFeAuthStore } from '@stores/feAuthStore';

const Tab = createBottomTabNavigator<TabParamList>();

const VENDOR_ROLES = ['vendor', 'tenant_admin', 'super_admin'];

export default function TabNavigator() {
  const userRole = useFeAuthStore(s => s.user?.role ?? '');
  const isVendor = VENDOR_ROLES.includes(userRole);

  return (
    <Tab.Navigator
      tabBar={(props) => <MerckTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeStackNavigator} />
      <Tab.Screen name="Food"    component={FoodStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {isVendor && (
        <Tab.Screen name="Vendor" component={VendorScreen} />
      )}
    </Tab.Navigator>
  );
}
