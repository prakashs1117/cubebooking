import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

interface DateItem {
  date: Date;
  dayLabel: string;
  dayNumber: number;
  monthLabel: string;
  monthShort: string;
  year: number;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hasEvents: boolean;
  key: string;
}

interface HorizontalDatePickerProps {
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
  daysToShow?: number;
  containerStyle?: any;
  showMonthLabel?: boolean;
  startDate?: Date;
  endDate?: Date;
  datesWithEvents?: Date[];
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_LABEL_WIDTH = 56;
const ITEM_GAP = 6;

export const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  onDateSelect,
  initialDate = new Date(),
  daysToShow = 60,
  containerStyle,
  showMonthLabel = true,
  startDate,
  endDate,
  datesWithEvents = [],
}) => {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [visibleMonth, setVisibleMonth] = useState<string>('');

  // Compute item width so exactly 5 items fill the available width
  const availableWidth = showMonthLabel
    ? screenWidth - MONTH_LABEL_WIDTH
    : screenWidth;
  const itemWidth = Math.floor((availableWidth - ITEM_GAP * 6) / 5);

  const dateItems = React.useMemo(
    () =>
      generateDateItems(
        initialDate,
        daysToShow,
        selectedDate,
        startDate,
        endDate,
        datesWithEvents,
      ),
    [initialDate, daysToShow, selectedDate, startDate, endDate, datesWithEvents],
  );

  // Scroll to first item on mount
  useEffect(() => {
    if (flatListRef.current && dateItems.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: 0,
          animated: false,
          viewPosition: 0,
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDatePress = (item: DateItem) => {
    if (item.isDisabled) return;
    setSelectedDate(item.date);
    onDateSelect?.(item.date);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const first = viewableItems[0].item as DateItem;
        setVisibleMonth(`${first.monthShort} ${first.year}`);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderDateItem = ({ item }: { item: DateItem }) => {
    const isSelected = isSameDay(item.date, selectedDate);
    const isToday = item.isToday;
    const isDisabled = item.isDisabled;
    const hasEvents = item.hasEvents;

    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          { width: itemWidth },
          isSelected && [
            styles.dateItemSelected,
            { backgroundColor: theme.button.primary.background },
          ],
          isDisabled && styles.dateItemDisabled,
        ]}
        onPress={() => handleDatePress(item)}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.dayLabel,
            {
              color: isSelected
                ? theme.button.primary.text
                : isDisabled
                ? theme.text.tertiary + '50'
                : theme.text.secondary,
              fontFamily: getFontStyle('caption').fontFamily,
            },
            isToday && !isSelected && !isDisabled && { color: theme.button.primary.background },
          ]}
        >
          {item.dayLabel}
        </Text>

        <Text
          style={[
            styles.dayNumber,
            {
              color: isSelected
                ? theme.button.primary.text
                : isDisabled
                ? theme.text.tertiary + '50'
                : theme.text.primary,
              fontFamily: getFontStyle('h4').fontFamily,
            },
            isToday && !isSelected && !isDisabled && { color: theme.button.primary.background },
          ]}
        >
          {item.dayNumber}
        </Text>

        {hasEvents && !isSelected && !isDisabled && (
          <View style={[styles.eventDot, { backgroundColor: theme.button.success.background }]} />
        )}

        {isToday && !isSelected && !hasEvents && !isDisabled && (
          <View style={[styles.todayDot, { backgroundColor: theme.button.primary.background }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Sticky Month Label */}
      {showMonthLabel && visibleMonth && (
        <View
          style={[
            styles.monthLabelContainer,
            { width: MONTH_LABEL_WIDTH, backgroundColor: theme.background.primary },
          ]}
        >
          <Text
            style={[
              styles.monthLabel,
              { color: theme.text.primary, fontFamily: getFontStyle('h4').fontFamily },
            ]}
          >
            {visibleMonth}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={dateItems}
        renderItem={renderDateItem}
        keyExtractor={item => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          showMonthLabel && { paddingLeft: MONTH_LABEL_WIDTH + 4 },
        ]}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: itemWidth + ITEM_GAP,
          offset: (itemWidth + ITEM_GAP) * index,
          index,
        })}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
    </View>
  );
};

function generateDateItems(
  centerDate: Date,
  totalDays: number,
  selectedDate: Date,
  rangeStartDate?: Date,
  rangeEndDate?: Date,
  datesWithEvents: Date[] = [],
): DateItem[] {
  const items: DateItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedRangeStart = rangeStartDate ? new Date(rangeStartDate) : null;
  const normalizedRangeEnd = rangeEndDate ? new Date(rangeEndDate) : null;
  if (normalizedRangeStart) normalizedRangeStart.setHours(0, 0, 0, 0);
  if (normalizedRangeEnd) normalizedRangeEnd.setHours(0, 0, 0, 0);

  const startDate = normalizedRangeStart
    ? new Date(normalizedRangeStart)
    : new Date(centerDate);
  if (!normalizedRangeStart) startDate.setDate(startDate.getDate() - Math.floor(totalDays / 2));
  startDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dayNumber = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const isDisabled =
      (normalizedRangeStart && currentDate < normalizedRangeStart) ||
      (normalizedRangeEnd && currentDate > normalizedRangeEnd);

    const hasEvents = datesWithEvents.some(eventDate => isSameDay(currentDate, eventDate));

    items.push({
      date: currentDate,
      dayLabel: WEEKDAY_LABELS[dayOfWeek],
      dayNumber,
      monthLabel: MONTH_LABELS[month],
      monthShort: MONTH_SHORT_LABELS[month],
      year,
      isToday: isSameDay(currentDate, today),
      isSelected: isSameDay(currentDate, selectedDate),
      isDisabled: isDisabled || false,
      hasEvents,
      key: `${year}-${month}-${dayNumber}-${i}`,
    });
  }

  return items;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 84,
  },
  monthLabelContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingLeft: 10,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: ITEM_GAP,
    paddingVertical: 10,
    gap: ITEM_GAP,
  },
  dateItem: {
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dateItemSelected: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dateItemDisabled: {
    opacity: 0.3,
  },
  dayLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
  },
  todayDot: {
    position: 'absolute',
    bottom: 7,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventDot: {
    position: 'absolute',
    bottom: 7,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

export default HorizontalDatePicker;
