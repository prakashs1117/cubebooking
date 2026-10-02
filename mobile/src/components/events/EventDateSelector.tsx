import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

interface EventDateSelectorProps {
  startDate: string; // ISO string
  endDate: string; // ISO string
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  datesWithEvents: Date[];
}

const EventDateSelector: React.FC<EventDateSelectorProps> = ({
  startDate,
  endDate,
  selectedDate,
  onDateSelect,
  datesWithEvents,
}) => {
  const { theme } = useTheme();

  // Generate all dates in the event range (minimum 5 dates)
  const getAllDatesInRange = (): Date[] => {
    const dates: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set to start of day to avoid timezone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const current = new Date(start);

    // Generate dates in the event range
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // If we have less than 5 dates, pad with additional dates
    const minDates = 5;
    if (dates.length < minDates) {
      const datesNeeded = minDates - dates.length;

      // Add dates after the end date
      const lastDate = new Date(dates[dates.length - 1]);
      for (let i = 1; i <= datesNeeded; i++) {
        const newDate = new Date(lastDate);
        newDate.setDate(lastDate.getDate() + i);
        dates.push(newDate);
      }
    }

    return dates;
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    return datesWithEvents.some(eventDate => isSameDay(eventDate, date));
  };

  // Format date
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, month, weekday };
  };

  const allDates = getAllDatesInRange();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 12,
    },
    scrollContent: {
      paddingHorizontal: 16,
      gap: 12,
      flexDirection: 'row',
    },
    dateItem: {
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      minWidth: 65,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    dateItemSelected: {
      backgroundColor: theme.button.primary.background,
      borderColor: theme.button.primary.background,
    },
    dateItemWithEvents: {
      backgroundColor: theme.background.secondary,
      borderColor: theme.border.secondary,
    },
    dateItemDisabled: {
      backgroundColor: theme.background.secondary,
      opacity: 0.4,
    },
    weekday: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 2,
      textTransform: 'uppercase',
      fontFamily: getFontStyle('caption').fontFamily,
    },
    weekdaySelected: {
      color: theme.button.primary.text,
    },
    day: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text.primary,
      lineHeight: 28,
      fontFamily: getFontStyle('h2').fontFamily,
    },
    daySelected: {
      color: theme.button.primary.text,
    },
    dayDisabled: {
      color: theme.text.tertiary,
    },
    month: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.text.secondary,
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontFamily: getFontStyle('caption').fontFamily,
    },
    monthSelected: {
      color: theme.button.primary.text,
    },
    eventIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.button.success.background,
      marginTop: 4,
    },
    eventIndicatorSelected: {
      backgroundColor: theme.button.primary.text,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {allDates.map((date, index) => {
        const { day, month, weekday } = formatDate(date);
        const isSelected = isSameDay(date, selectedDate);
        const hasEvent = hasEvents(date);
        const isDisabled = !hasEvent;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateItem,
              isSelected && styles.dateItemSelected,
              !isSelected && hasEvent && styles.dateItemWithEvents,
              !isSelected && isDisabled && styles.dateItemDisabled,
            ]}
            onPress={() => {
              if (!isDisabled) {
                onDateSelect(date);
              }
            }}
            disabled={isDisabled}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.weekday, isSelected && styles.weekdaySelected]}
            >
              {weekday}
            </Text>
            <Text
              style={[
                styles.day,
                isSelected && styles.daySelected,
                isDisabled && !isSelected && styles.dayDisabled,
              ]}
            >
              {day}
            </Text>
            <Text style={[styles.month, isSelected && styles.monthSelected]}>
              {month}
            </Text>
            {hasEvent && (
              <View
                style={[
                  styles.eventIndicator,
                  isSelected && styles.eventIndicatorSelected,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default EventDateSelector;
