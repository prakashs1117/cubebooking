/**
 * All Events Screen
 * Shows all events with horizontal date picker for filtering
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { getEvents } from '@services/api/events.service';
import { EventListWithDatePicker } from '@components/events/EventListWithDatePicker';
import { EventsStackParamList } from '@/types/navigation';

type AllEventsScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  'AllEvents'
>;

const AllEventsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<AllEventsScreenNavigationProp>();

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-events'],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.button.primary.background}
        />
        <Text
          style={[
            styles.loadingText,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {t('events.loading')}
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            {
              color: theme.text.primary,
              fontFamily: getFontStyle('h4').fontFamily,
            },
          ]}
        >
          {t('events.error.title')}
        </Text>
      </View>
    );
  }

  // Extract events array from response
  const events = eventsData?.events || [];

  // Handle event press - navigate to event details
  const handleEventPress = (event: any) => {
    navigation.navigate('EventDetail', { sessionId: event.id });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <EventListWithDatePicker
        events={events}
        onEventPress={handleEventPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AllEventsScreen;
