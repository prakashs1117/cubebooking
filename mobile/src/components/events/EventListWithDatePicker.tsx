/**
 * Event List with Date Picker
 * Shows horizontal date picker with filtered event list
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { HorizontalDatePicker } from '@components/common/HorizontalDatePicker';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

// Event type based on API response
interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venue: string;
  latitude: number;
  longitude: number;
  capacity: number;
  bannerPath: string;
  status: string;
  visibility: string;
  venueId: string;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  venueModel?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  _count?: {
    registrations: number;
  };
  confirmedCount?: number;
  availableSeats?: number;
}

interface EventListWithDatePickerProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
}

export const EventListWithDatePicker: React.FC<
  EventListWithDatePickerProps
> = ({ events, onEventPress }) => {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter events by selected date
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      // Check if selected date falls within event date range
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      const start = new Date(eventStart);
      start.setHours(0, 0, 0, 0);

      const end = new Date(eventEnd);
      end.setHours(23, 59, 59, 999);

      return selected >= start && selected <= end;
    });
  }, [events, selectedDate]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Render event item
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        {
          backgroundColor: theme.background.secondary,
          borderColor: theme.border.primary,
        },
      ]}
      onPress={() => onEventPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Event Title */}
      <Text
        style={[
          styles.eventTitle,
          {
            color: theme.text.primary,
            fontFamily: getFontStyle('h4').fontFamily,
          },
        ]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {/* Event Time */}
      <View style={styles.eventTimeContainer}>
        <Text
          style={[
            styles.eventTime,
            {
              color: theme.text.secondary,
              fontFamily: getFontStyle('body').fontFamily,
            },
          ]}
        >
          {formatEventDate(item.startTime)} - {formatEventDate(item.endTime)}
        </Text>
      </View>

      {/* Event Venue */}
      {item.venueModel && (
        <View style={styles.eventVenueContainer}>
          <Text
            style={[
              styles.eventVenue,
              {
                color: theme.text.tertiary,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
            numberOfLines={1}
          >
            📍 {item.venueModel.name}, {item.venueModel.city}
          </Text>
        </View>
      )}

      {/* Event Capacity */}
      {item.availableSeats !== undefined && (
        <View style={styles.eventCapacityContainer}>
          <Text
            style={[
              styles.eventCapacity,
              {
                color:
                  item.availableSeats > 0
                    ? theme.text.success
                    : theme.text.error,
                fontFamily: getFontStyle('caption').fontFamily,
              },
            ]}
          >
            {item.availableSeats > 0
              ? `${item.availableSeats} seats available`
              : 'Fully booked'}
          </Text>
        </View>
      )}

      {/* Event Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.eventTagsContainer}>
          {item.tags.slice(0, 3).map(tag => (
            <View
              key={tag.id}
              style={[
                styles.eventTag,
                { backgroundColor: theme.button.primary.background + '20' },
              ]}
            >
              <Text
                style={[
                  styles.eventTagText,
                  {
                    color: theme.button.primary.background,
                    fontFamily: getFontStyle('caption').fontFamily,
                  },
                ]}
              >
                {tag.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          {
            color: theme.text.secondary,
            fontFamily: getFontStyle('body').fontFamily,
          },
        ]}
      >
        No events scheduled for this date
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      {/* Date Picker */}
      <HorizontalDatePicker
        onDateSelect={handleDateSelect}
        initialDate={new Date()}
        showMonthLabel={true}
        containerStyle={[
          styles.datePickerContainer,
          { backgroundColor: theme.background.secondary },
        ]}
      />

      {/* Event List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  datePickerContainer: {
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventTimeContainer: {
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
  },
  eventVenueContainer: {
    marginBottom: 8,
  },
  eventVenue: {
    fontSize: 12,
  },
  eventCapacityContainer: {
    marginBottom: 8,
  },
  eventCapacity: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  eventTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default EventListWithDatePicker;
