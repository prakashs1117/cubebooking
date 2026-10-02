import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { ToolsStackParamList } from '@/types/navigation';
import CustomHeader from '@components/navigation/CustomHeader';

// Import screens
import ToolsListScreen from '@screens/ToolsListScreen';
import IconGalleryScreen from '@screens/IconGalleryScreen';
import FeatureFlagsScreen from '@screens/FeatureFlagsScreen';
import DatePickerExample from '@screens/examples/DatePickerExample';
import AppListExample from '@screens/examples/AppListExample';

const Stack = createStackNavigator<ToolsStackParamList>();

const ToolsStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Feature flag from JSON config via Zustand store
  const isDrawerEnabled = useFeatureFlagsStore(state =>
    state.isFeatureEnabled('ENABLE_DRAWER_NAVIGATION'),
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ToolsList"
        component={ToolsListScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.tools')}
              showHamburger={isDrawerEnabled}
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="IconGallery"
        component={IconGalleryScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.iconGallery')}
              showHamburger={isDrawerEnabled}
              showBack
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
     
      <Stack.Screen
        name="DatePickerDemo"
        component={DatePickerExample}
        options={{
          header: () => (
            <CustomHeader
              title="Date Picker Examples"
              showHamburger={isDrawerEnabled}
              showBack
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="AppListDemo"
        component={AppListExample}
        options={{
          header: () => (
            <CustomHeader
              title="AppList Examples"
              showHamburger={isDrawerEnabled}
              showBack
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default ToolsStackNavigator;
