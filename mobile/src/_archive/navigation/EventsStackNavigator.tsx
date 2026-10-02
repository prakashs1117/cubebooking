import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';
import { EventsStackParamList } from '@/types/navigation';
import CustomHeader from '@components/navigation/CustomHeader';

// Import screens
import EventsScreen from '@screens/EventsScreen';
import EventsListScreen from '@screens/EventsListScreen';
import EventDetailScreen from '@screens/EventDetailScreen';
import DatePickerExample from '@screens/examples/DatePickerExample';

const Stack = createStackNavigator<EventsStackParamList>();

const EventsStackNavigator: React.FC = () => {
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
        name="EventsList"
        component={EventsScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('navigation.events')}
              showHamburger={isDrawerEnabled}
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="AllEvents"
        component={EventsListScreen}
        options={{
          header: () => (
            <CustomHeader
              title={t('events.filterAll')}
              showHamburger={isDrawerEnabled}
              onHamburgerPress={() =>
                navigation.dispatch(DrawerActions.openDrawer())
              }
            />
          ),
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DatePickerExample"
        component={DatePickerExample}
        options={{
          header: () => (
            <CustomHeader
              title="Date Picker Examples"
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

export default EventsStackNavigator;
