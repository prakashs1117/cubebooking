import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import ResponsiveView from '@components/common/ResponsiveView';
import { SortOption, FilterOption } from '@components/events/SortFilterBar';
import {
  transformAPIEventsToCards,
  type EventsAPIResponse,
} from '@utils/eventTransformers';
import { EventsStackParamList } from '@/types/navigation';
import eventsData from '@/data/eventsData.json';
import EventsListPhone from './EventsListScreen.phone';
import EventsListTablet from './EventsListScreen.tablet';

type EventsListScreenNavigationProp = StackNavigationProp<
  EventsStackParamList,
  'AllEvents'
>;

/**
 * EventsListScreen — thin selector + shared business logic.
 * Layout lives in EventsListScreen.phone.tsx and EventsListScreen.tablet.tsx.
 */
const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<EventsListScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const getStatusPriority = useCallback((status: string): number => {
    switch (status) {
      case 'LIVE':
        return 1;
      case 'UPCOMING':
        return 2;
      case 'COMPLETED':
        return 3;
      default:
        return 4;
    }
  }, []);

  const { isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['all-events'],
    queryFn: async () => [],
    enabled: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const allEvents = useMemo(() => {
    try {
      return transformAPIEventsToCards(eventsData as EventsAPIResponse);
    } catch (error) {
      console.error('Error transforming events:', error);
      return [];
    }
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    if (filterBy !== 'all') {
      filtered = filtered.filter(event => {
        if (filterBy === 'upcoming') return event.status === 'UPCOMING';
        if (filterBy === 'live') return event.status === 'LIVE';
        if (filterBy === 'completed') return event.status === 'COMPLETED';
        return true;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query),
      );
    }

    filtered.sort((a, b) => {
      const statusDiff =
        getStatusPriority(a.status) - getStatusPriority(b.status);
      if (statusDiff !== 0) return statusDiff;
      switch (sortBy) {
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'date-desc':
          return b.date.localeCompare(a.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allEvents, searchQuery, sortBy, filterBy, getStatusPriority]);

  const handleEventPress = (slug: string) => {
    navigation.navigate('EventDetail', { slug });
  };

  const sharedProps = {
    filteredEvents,
    isLoading,
    isRefetching,
    refetch,
    searchQuery,
    setSearchQuery,
    sortBy,
    filterBy,
    setSortBy,
    setFilterBy,
    showFilterModal,
    setShowFilterModal,
    onEventPress: handleEventPress,
  };

  return (
    <ResponsiveView
      phone={<EventsListPhone {...sharedProps} />}
      tablet={<EventsListTablet {...sharedProps} />}
    />
  );
};

export default EventsListScreen;
