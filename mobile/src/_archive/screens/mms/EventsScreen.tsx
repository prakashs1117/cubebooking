import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { HorizontalEventsList } from '@components/events';
import {
  transformAPIEventsToCards,
  getUpcomingEvents,
} from '@utils/eventTransformers';
import { EventsStackParamList } from '@/types/navigation';
import { getEvents } from '@services/api/events.service';
import { useRatePrompt } from '@hooks/useRatePrompt';
import RateUsBanner from '@components/common/RateUsBanner';

type EventsScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  'EventsList'
>;

const EventsScreen: React.FC = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // React Query for data fetching with caching
  const {
    data: eventsData,
    isLoading,
    refetch,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    refetchOnWindowFocus: true,
  });

  // Transform API events data to card data - ONLY upcoming/current events
  const upcomingEvents = useMemo(() => {
    if (!eventsData) return [];

    try {
      const allCards = transformAPIEventsToCards(eventsData);
      // Only get upcoming and live events (filter out completed/past)
      return getUpcomingEvents(allCards);
    } catch (error) {
      console.error('Error transforming events:', error);
      return [];
    }
  }, [eventsData]);

  const { triggerRatePrompt } = useRatePrompt();

  // Handle event card press — trigger rate prompt after viewing an event
  const handleEventPress = (slug: string) => {
    console.log('Event pressed with slug: 3444', slug);
    navigation.navigate('EventDetail', { slug });
    triggerRatePrompt('event_viewed');
  };

  // Handle "See All" press
  const handleSeeAllPress = () => {
    navigation.navigate('AllEvents');
  };

  // Render loading state
  if (isLoading && upcomingEvents.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.loadingContainer}>
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
      </View>
    );
  }

  // Render error state with retry functionality
  if (error && upcomingEvents.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.errorScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.button.primary.background}
              colors={[theme.button.primary.background]}
            />
          }
        >
          <View style={styles.errorContainer}>
            {/* Error Icon */}
            <View
              style={[
                styles.errorIconContainer,
                { backgroundColor: theme.button.primary.background + '15' },
              ]}
            >
              <Text
                style={[
                  styles.errorIcon,
                  { color: theme.button.primary.background },
                ]}
              >
                ⚠️
              </Text>
            </View>

            {/* Error Title */}
            <Text
              style={[
                styles.errorTitle,
                {
                  color: theme.text.primary,
                  fontFamily: getFontStyle('h3').fontFamily,
                },
              ]}
            >
              {t('events.error.title')}
            </Text>

            {/* Error Message */}
            <Text
              style={[
                styles.errorMessage,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              {t('events.error.message')}
            </Text>

            {/* Retry Button */}
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: theme.button.primary.background },
              ]}
              onPress={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <ActivityIndicator
                  size="small"
                  color={theme.button.primary.text}
                />
              ) : (
                <Text
                  style={[
                    styles.retryButtonText,
                    {
                      color: theme.button.primary.text,
                      fontFamily: getFontStyle('button').fontFamily,
                    },
                  ]}
                >
                  {t('events.retryButton')}
                </Text>
              )}
            </TouchableOpacity>

            {/* Pull to Refresh Hint */}
            <Text
              style={[
                styles.pullToRefreshHint,
                {
                  color: theme.text.tertiary,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {t('events.pullToRefresh')}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.button.primary.background}
            colors={[theme.button.primary.background]}
          />
        }
      >
        {/* Upcoming Events Section - Shows only current and future events */}
        <HorizontalEventsList
          title={t('events.title')}
          events={upcomingEvents}
          onEventPress={handleEventPress}
          onSeeAllPress={handleSeeAllPress}
          showHeader
          showSeeAll
          containerStyle={{ paddingTop: 20 }}
        />

        {/* Rate Us Banner */}
        <View style={styles.bannerContainer}>
          <RateUsBanner variant="compact" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pullToRefreshHint: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  demoSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsScreen;
