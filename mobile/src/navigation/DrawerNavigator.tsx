import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from '@navigation/TabNavigator';
import CustomDrawerContent from '@components/navigation/CustomDrawerContent';
import PrivacyPolicyScreen from '@screens/new/PrivacyPolicyScreen';
import TermsScreen from '@screens/new/TermsScreen';
import CancellationPolicyScreen from '@screens/new/CancellationPolicyScreen';
import { MERCK_TOKENS } from '@theme/merckTokens';
import type { DrawerParamList } from '@navigation/types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        drawerStyle: {
          backgroundColor: MERCK_TOKENS.bgDrawer,
          width: 280,
        },
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEdgeWidth: 40,
      }}
    >
      <Drawer.Screen name="Tabs"               component={TabNavigator} />
      <Drawer.Screen name="PrivacyPolicy"      component={PrivacyPolicyScreen} />
      <Drawer.Screen name="Terms"              component={TermsScreen} />
      <Drawer.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
    </Drawer.Navigator>
  );
}
