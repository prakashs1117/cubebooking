import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { MoreStackParamList } from '@/types/navigation';
import CustomHeader from '@components/navigation/CustomHeader';

// Import screens
import MoreListScreen from '@screens/MoreListScreen';
import SettingsScreen from '@screens/SettingsScreen';
import AboutScreen from '@screens/AboutScreen';
import FAQScreen from '@screens/FAQScreen';
import AppListExample from '@screens/examples/AppListExample';
import FeedbackScreen from '@screens/FeedbackScreen';
import CuratedScreen from '@screens/CuratedScreen';
import IconGalleryScreen from '@screens/IconGalleryScreen';

const Stack = createStackNavigator<MoreStackParamList>();

const MoreStackNavigator: React.FC = () => {
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
        name="MoreList"
        component={MoreListScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('history.title')}
              showHamburger={false}
              hideSearch
            />
          ),
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.about')}
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
        name="FAQ"
        component={FAQScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.faq')}
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
        name="Settings"
        component={SettingsScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.settings')}
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
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          header: () => (
            <CustomHeader
              title="Feedback"
              showHamburger={isDrawerEnabled}
              showBack
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
      {/*
        headerShown: false — the HeroCarouselHeader renders its own transparent
        overlay header, so we don't want the navigation chrome on top of it.
      */}
      <Stack.Screen
        name="CuratedDemo"
        component={CuratedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IconGallery"
        component={IconGalleryScreen}
        options={{
          header: () => (
            <CustomHeader
              title="Animicons Gallery"
              showBack
              showHamburger={isDrawerEnabled}
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

export default MoreStackNavigator;
