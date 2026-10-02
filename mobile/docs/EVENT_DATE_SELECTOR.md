# Event Date Selector - Custom Component

## Overview

Created a new custom `EventDateSelector` component specifically for the Event Schedule Modal that displays all event dates in a clean, horizontal scrollable list with clear visual indicators.

## Design

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│  MON    TUE    WED    THU    FRI    SAT    SUN │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌──│
│  │ 15│  │ 16│  │ 17│  │ 18│  │ 19│  │ 20│  │ 2│
│  │JUN│  │JUN│  │JUN│  │JUN│  │JUN│  │JUN│  │JU│
│  │ • │  └───┘  │ • │  └───┘  │ • │  └───┘  └──│
│  └───┘         └───┘         └───┘            │
│  Selected    Disabled    Has Events  Disabled  │
└─────────────────────────────────────────────────┘
```

### Date Card States

**1. Selected Date**

```
┌─────┐
│ MON │ ← Weekday (10px, uppercase)
│  15 │ ← Day (24px, bold)
│ JUN │ ← Month (11px, uppercase)
│  •  │ ← Event indicator (green dot)
└─────┘
Purple background
White text
```

**2. Date with Events (Not Selected)**

```
┌─────┐
│ WED │
│  17 │
│ JUN │
│  •  │ ← Green dot
└─────┘
Secondary background
Primary text
Border visible
```

**3. Disabled Date (No Events)**

```
┌─────┐
│ THU │
│  18 │
│ JUN │
└─────┘
Faded (40% opacity)
No event indicator
Not tappable
```

## Component API

### Props

```typescript
interface EventDateSelectorProps {
  startDate: string; // ISO string - Event start date
  endDate: string; // ISO string - Event end date
  selectedDate: Date; // Currently selected date
  onDateSelect: (date: Date) => void; // Callback when date tapped
  datesWithEvents: Date[]; // Array of dates that have schedule items
}
```

### Usage

```tsx
<EventDateSelector
  startDate="2026-06-15T09:00:00.000Z"
  endDate="2026-06-21T18:00:00.000Z"
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  datesWithEvents={datesWithEvents}
/>
```

## Implementation Details

### Date Range Generation

```typescript
const getAllDatesInRange = (): Date[] => {
  const dates: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Set to start of day to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
```

**Features**:

- Generates all dates from start to end
- Sets hours to 0 to avoid timezone issues
- Returns array of Date objects

### Date Comparison

```typescript
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
```

**Purpose**: Compare dates ignoring time component

### Event Detection

```typescript
const hasEvents = (date: Date): boolean => {
  return datesWithEvents.some(eventDate => isSameDay(eventDate, date));
};
```

**Returns**: `true` if date has schedule items, `false` otherwise

### Date Formatting

```typescript
const formatDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return { day, month, weekday };
};
```

**Returns**:

```typescript
{
  day: 15,           // Number
  month: "Jun",      // Short month name
  weekday: "Mon"     // Short weekday name
}
```

## Styling

### Date Item

```typescript
dateItem: {
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 12,
  minWidth: 65,
  borderWidth: 2,
  borderColor: 'transparent',
}
```

**Default**: Transparent border, centered content

### Selected State

```typescript
dateItemSelected: {
  backgroundColor: theme.button.primary.background,  // Purple
  borderColor: theme.button.primary.background,
}
```

**Text colors**: All text becomes white

### With Events (Not Selected)

```typescript
dateItemWithEvents: {
  backgroundColor: theme.background.secondary,
  borderColor: theme.border.secondary,
}
```

**Visual**: Subtle background, visible border

### Disabled State

```typescript
dateItemDisabled: {
  backgroundColor: theme.background.secondary,
  opacity: 0.4,  // Faded
}
```

**Interaction**: `disabled={true}` on TouchableOpacity

### Event Indicator

```typescript
eventIndicator: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: theme.button.success.background,  // Green
  marginTop: 4,
}

eventIndicatorSelected: {
  backgroundColor: theme.button.primary.text,  // White when selected
}
```

**Position**: Below month text

## Typography

```typescript
weekday: {
  fontSize: 10,
  fontWeight: '600',
  textTransform: 'uppercase',
  color: theme.text.secondary,
}

day: {
  fontSize: 24,
  fontWeight: '700',
  lineHeight: 28,
}

month: {
  fontSize: 11,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

## Integration in EventScheduleModal

### Layout Structure

```
┌─────────────────────────────────────────┐
│         Event Schedule             [X]  │
├─────────────────────────────────────────┤
│ [EventDateSelector - Scrollable]        │
├─────────────────────────────────────────┤
│ June 2026               7 Sessions      │
├─────────────────────────────────────────┤
│                                         │
│ Timeline (Schedule Items)               │
│                                         │
└─────────────────────────────────────────┘
```

### Date Selector Section

```tsx
<View style={styles.datePickerSection}>
  <EventDateSelector
    startDate={startTime}
    endDate={endTime}
    selectedDate={selectedDate}
    onDateSelect={setSelectedDate}
    datesWithEvents={datesWithEvents}
  />
</View>
```

**Style**:

```typescript
datePickerSection: {
  backgroundColor: theme.background.card,
  borderBottomWidth: 1,
  borderBottomColor: theme.border.secondary,
}
```

### Selected Date Info

```tsx
<View style={styles.selectedDateInfo}>
  <View style={styles.selectedDateHeader}>
    <Text style={styles.selectedDateText}>{formatMonthYear(selectedDate)}</Text>
    <Text style={styles.sessionsCountBadge}>
      {filteredScheduleItems.length} Sessions
    </Text>
  </View>
</View>
```

**Style**:

```typescript
selectedDateInfo: {
  backgroundColor: theme.background.card,
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.border.secondary,
}

selectedDateHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
}

selectedDateText: {
  fontSize: 16,
  fontWeight: '600',
  color: theme.text.primary,
}

sessionsCountBadge: {
  fontSize: 12,
  fontWeight: '600',
  color: theme.button.primary.background,
}
```

## Interaction Flow

### 1. Initial Load

```
User opens modal
  ↓
Component generates dates from startDate to endDate
  ↓
Checks which dates have events (datesWithEvents)
  ↓
Displays all dates in horizontal scroll
  ↓
Highlights selected date (event start date by default)
  ↓
Shows event indicator dots on dates with events
  ↓
Disables dates without events
```

### 2. Date Selection

```
User taps enabled date
  ↓
onDateSelect(date) callback fires
  ↓
selectedDate state updates
  ↓
Date card gets selected styling (purple background)
  ↓
Selected date info updates ("June 2026", "7 Sessions")
  ↓
Timeline below updates to show sessions for that date
```

### 3. Disabled Date Tap

```
User taps disabled date (no events)
  ↓
Nothing happens (disabled={true})
  ↓
No state change
  ↓
No visual feedback
```

## Advantages Over HorizontalDatePicker

### Old Component Issues

- Complex configuration
- Not specific to events
- Unclear which dates have events
- Hard to see all dates at once
- Too many props

### New Component Benefits

✅ **Event-Specific** - Built for event schedules
✅ **Clear States** - Selected, enabled, disabled
✅ **Event Indicators** - Green dots show which dates have sessions
✅ **Simple API** - Only 5 props needed
✅ **All Dates Visible** - Scrollable horizontal list
✅ **Better UX** - Clear visual hierarchy
✅ **Automatic Filtering** - Disables dates without events
✅ **Clean Design** - Modern card-based layout

## Edge Cases Handled

### Single Day Event

```
startDate: "2026-06-15"
endDate: "2026-06-15"

Result: Shows single date card
Only one date selectable
```

### Multi-Day Event with Gaps

```
Date Range: June 15-21 (7 days)
Events on: June 15, 17, 19 (3 days)

Result:
- Shows all 7 date cards
- June 15, 17, 19: Enabled with green dots
- June 16, 18, 20, 21: Disabled (faded)
```

### Month Boundary

```
Date Range: June 29 - July 3

Result:
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 29  │ │ 30  │ │  1  │ │  2  │ │  3  │
│ JUN │ │ JUN │ │ JUL │ │ JUL │ │ JUL │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

Month label updates per date.

### No Events on Any Date

```
Result: All dates disabled
Modal shows but timeline is empty
User can still see date range
```

## Performance

### Optimizations

- Date generation only runs once on mount
- Simple comparison functions
- No complex state management
- Efficient rendering with map

### Rendering

- Only renders dates in range (typically 1-7 days)
- No virtual scrolling needed
- Lightweight component

## Theme Support

### Dark Mode

```typescript
Selected:
  Background: theme.button.primary.background (purple)
  Text: theme.button.primary.text (white)

Enabled:
  Background: theme.background.secondary (dark gray)
  Text: theme.text.primary (light)

Disabled:
  Background: theme.background.secondary (dark gray)
  Text: theme.text.tertiary (faded)
  Opacity: 0.4
```

### Light Mode

Same structure with light theme colors.

## Accessibility

- **Large Touch Targets**: 65px min width, generous padding
- **Clear States**: Visual distinction between enabled/disabled
- **High Contrast**: Selected state very visible
- **Descriptive Text**: Weekday + Day + Month = complete context

## Testing Scenarios

### Test 1: Date Range Generation

```
Input: startDate="2026-06-15", endDate="2026-06-17"
Expected: 3 date cards (15, 16, 17)
Result: All dates displayed
```

### Test 2: Event Indicators

```
Input: datesWithEvents=[June 15, June 17]
Expected: Green dots on 15 and 17, none on 16
Result: Dots displayed correctly
```

### Test 3: Date Selection

```
Action: Tap June 17
Expected: June 17 gets purple background, white text
Result: Visual state updates immediately
```

### Test 4: Disabled Dates

```
Action: Tap date without events
Expected: No response, no state change
Result: Touch blocked
```

### Test 5: Month Boundary

```
Input: June 30 - July 2
Expected: Shows JUN for 30, JUL for 1 and 2
Result: Month labels update per date
```

## Files Created/Modified

### New Files

1. ✅ **src/components/events/EventDateSelector.tsx**
   - Complete custom date selector component
   - Event-specific functionality
   - Clean, modern design

### Modified Files

1. ✅ **src/components/events/EventScheduleModal.tsx**
   - Replaced HorizontalDatePicker with EventDateSelector
   - Simplified date picker section
   - Added selected date info section below
   - Updated styles

## Future Enhancements

Potential improvements:

- Swipe gesture to change dates
- Month headers when crossing month boundaries
- Quick jump to today
- Animation when changing dates
- Haptic feedback on selection

---

**Status**: ✅ COMPLETE

**Component**: EventDateSelector
**Purpose**: Event schedule date selection
**Design**: Horizontal scrollable date cards
**Last Updated**: March 5, 2026
**Version**: 1.0.0
