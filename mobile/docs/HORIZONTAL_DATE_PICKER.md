# Horizontal Date Picker Component

## Overview

A reusable horizontal scrollable date picker component for React Native with the following features:

- ✅ **Horizontal scrolling** with FlatList for performance
- ✅ **Current day highlighting** with visual indicator
- ✅ **Sticky month label** on the left side
- ✅ **Auto-scrolls to today** on mount
- ✅ **Month transitions** - seamlessly handles month boundaries
- ✅ **Themed** - supports light/dark mode
- ✅ **Accessible** - large touch targets
- ✅ **Performant** - optimized rendering with FlatList

## Visual Design

```
┌─────────────────────────────────────────────────────┐
│ March 2026 │ Sun  Mon  Tue  [Wed] Thu  Fri  Sat   │
│            │  1    1    1    1    1    1    1     │
│            │                 ●                      │
└─────────────────────────────────────────────────────┘
```

- **Month Label**: Sticky on the left (e.g., "March 2026")
- **Weekday**: 3-letter abbreviation (Sun, Mon, Tue, etc.)
- **Date**: Day of month number
- **Selected**: Highlighted with primary color background
- **Today**: Dot indicator below date if not selected

## Installation

The component is already created in your project:

- Component: `src/components/common/HorizontalDatePicker.tsx`
- Example: `src/components/events/EventListWithDatePicker.tsx`
- Demo Screen: `src/screens/AllEventsScreen.tsx`

## Basic Usage

### Simple Date Picker

```tsx
import { HorizontalDatePicker } from '@components/common/HorizontalDatePicker';

function MyScreen() {
  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
  };

  return (
    <HorizontalDatePicker
      onDateSelect={handleDateSelect}
      initialDate={new Date()}
    />
  );
}
```

### With Custom Styling

```tsx
<HorizontalDatePicker
  onDateSelect={handleDateSelect}
  initialDate={new Date()}
  daysToShow={90} // Show 45 days before and after
  showMonthLabel={true} // Show sticky month label
  containerStyle={{
    marginHorizontal: 16,
    borderRadius: 12,
  }}
/>
```

### Without Month Label

```tsx
<HorizontalDatePicker
  onDateSelect={handleDateSelect}
  showMonthLabel={false} // Hide month label for compact view
/>
```

## Props

| Prop             | Type                   | Default      | Description                                         |
| ---------------- | ---------------------- | ------------ | --------------------------------------------------- |
| `onDateSelect`   | `(date: Date) => void` | `undefined`  | Callback when a date is selected                    |
| `initialDate`    | `Date`                 | `new Date()` | Initially selected/centered date                    |
| `daysToShow`     | `number`               | `60`         | Total days to display (centered around initialDate) |
| `containerStyle` | `ViewStyle`            | `undefined`  | Custom styling for the container                    |
| `showMonthLabel` | `boolean`              | `true`       | Whether to show the sticky month label              |

## Advanced Usage

### Event Filtering with Date Picker

The component can be used with event lists for date-based filtering:

```tsx
import { EventListWithDatePicker } from '@components/events/EventListWithDatePicker';

function EventsScreen() {
  const events = [
    {
      id: '1',
      title: 'Healthcare Forum',
      startTime: '2026-03-04T09:00:00.000Z',
      endTime: '2026-03-04T17:00:00.000Z',
      // ... other event properties
    },
  ];

  return (
    <EventListWithDatePicker
      events={events}
      onEventPress={event => {
        console.log('Event pressed:', event.id);
      }}
    />
  );
}
```

## Features Explained

### 1. Auto-scroll to Today

On mount, the component automatically scrolls to today's date:

```tsx
useEffect(() => {
  const todayIndex = dateItems.findIndex(item => item.isToday);
  if (todayIndex !== -1) {
    flatListRef.current?.scrollToIndex({
      index: todayIndex,
      animated: false,
      viewPosition: 0.2, // Position at 20% from left
    });
  }
}, []);
```

### 2. Sticky Month Label

The month label stays fixed on the left as you scroll:

```tsx
<View style={styles.monthLabelContainer}>
  <Text style={styles.monthLabel}>March 2026</Text>
</View>
```

Updates dynamically based on the first visible date.

### 3. Month Transitions

Seamlessly handles transitions between months:

```tsx
// January 30, 31 → February 1, 2, 3...
// December 30, 31 → January 1, 2, 3... (next year)
```

The date generation algorithm automatically handles:

- Different month lengths (28-31 days)
- Leap years
- Year boundaries

### 4. Today Indicator

Shows a small dot under today's date when not selected:

```tsx
{
  isToday && !isSelected && (
    <View style={[styles.todayDot, { backgroundColor: primaryColor }]} />
  );
}
```

### 5. Performance Optimization

FlatList is configured for optimal performance:

```tsx
<FlatList
  getItemLayout={(data, index) => ({
    length: 60,
    offset: 60 * index,
    index,
  })}
  initialNumToRender={15}
  maxToRenderPerBatch={10}
  windowSize={21}
/>
```

## Event Integration

### Event Data Structure

The component works with this event structure:

```typescript
interface Event {
  id: string;
  title: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  timezone: string;
  venue: string;
  venueModel?: {
    name: string;
    city: string;
    state: string;
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
  availableSeats?: number;
}
```

### Filtering Logic

Events are filtered to show only those on the selected date:

```typescript
const filteredEvents = events.filter(event => {
  const eventStart = new Date(event.startTime);
  const eventEnd = new Date(event.endTime);
  const selected = new Date(selectedDate);

  // Check if selected date falls within event range
  return selected >= eventStart && selected <= eventEnd;
});
```

### Multi-day Events

Events spanning multiple days appear on all applicable dates:

```typescript
// Event: March 3-5
// Shows on: March 3, March 4, March 5
```

## Theming

The component automatically uses your app's theme:

```typescript
// Uses theme colors
const { theme } = useTheme();

// Selected date
backgroundColor: theme.button.primary.background;
color: theme.button.primary.text;

// Unselected date
color: theme.text.primary;

// Today indicator
color: theme.button.primary.background;

// Month label
color: theme.text.primary;
```

## Customization Examples

### Compact Mode (No Month Label)

```tsx
<HorizontalDatePicker showMonthLabel={false} containerStyle={{ height: 70 }} />
```

### Extended Range

```tsx
<HorizontalDatePicker
  daysToShow={180} // Show 90 days before/after
  initialDate={new Date('2026-06-01')}
/>
```

### Custom Initial Date

```tsx
// Start at a specific event date
const eventDate = new Date(event.startTime);

<HorizontalDatePicker
  initialDate={eventDate}
  onDateSelect={handleDateSelect}
/>;
```

## Accessibility

- ✅ **Large touch targets**: 60x66pt minimum
- ✅ **Clear labels**: Weekday + date number
- ✅ **Visual feedback**: Selected state with background
- ✅ **Today indicator**: Distinct visual marker

## Performance Considerations

### Optimizations Applied

1. **FlatList with getItemLayout**: Constant-size items for fast scrolling
2. **initialNumToRender**: Only renders 15 items initially
3. **windowSize**: Keeps 21 screens worth of items in memory
4. **useMemo**: Date filtering is memoized
5. **Key extractor**: Stable keys prevent unnecessary re-renders

### Best Practices

```tsx
// ✅ DO: Use with reasonable daysToShow
<HorizontalDatePicker daysToShow={60} />

// ❌ AVOID: Very large ranges (memory intensive)
<HorizontalDatePicker daysToShow={3650} /> // 10 years!

// ✅ DO: Memoize callbacks
const handleDateSelect = useCallback((date: Date) => {
  // Handle selection
}, []);

// ✅ DO: Use stable containerStyle objects
const containerStyle = useMemo(() => ({
  marginHorizontal: 16,
}), []);
```

## Testing

### Manual Testing Scenarios

1. **Current Day**

   - Open component
   - Should auto-scroll to today
   - Today should have dot indicator

2. **Selection**

   - Tap any date
   - Should highlight with primary color
   - Callback should fire with correct date

3. **Month Transition**

   - Scroll from end of month (e.g., Jan 31)
   - Next date should be Feb 1
   - Month label should update to "February 2026"

4. **Dark Mode**

   - Toggle theme
   - All colors should update correctly

5. **Long Scroll**
   - Scroll far in either direction
   - Should remain performant
   - Month label should update smoothly

## Troubleshooting

### Date picker doesn't scroll to today

**Solution**: Check that `initialDate` is set correctly and component is mounted.

### Performance issues with large date ranges

**Solution**: Reduce `daysToShow` to 60-90 days.

### Month label not updating

**Solution**: Ensure `showMonthLabel={true}` and `viewabilityConfig` is properly set.

### Selected date not highlighting

**Solution**: Ensure `onDateSelect` callback updates parent state correctly.

## Future Enhancements

- [ ] Custom date ranges (min/max dates)
- [ ] Disabled dates
- [ ] Event badges on dates (show event count)
- [ ] Swipe gestures for month navigation
- [ ] Week view mode
- [ ] Localization for weekday labels
- [ ] Custom color per date (for event types)

## Related Components

- `EventListWithDatePicker` - Full implementation with event filtering
- `AllEventsScreen` - Example screen using the component
- `EventCard` - Display individual events

## Files

```
src/
├── components/
│   ├── common/
│   │   └── HorizontalDatePicker.tsx  ← Main component
│   └── events/
│       └── EventListWithDatePicker.tsx  ← With event filtering
├── screens/
│   └── AllEventsScreen.tsx  ← Example screen
└── HORIZONTAL_DATE_PICKER.md  ← This file
```
