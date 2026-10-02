# Event Schedule Modal - Timeline View

## Overview

Added a beautiful "More Info" button to the EventDetailScreen that opens a modal displaying the event schedule in an alternating timeline layout. The modal features:

- ✅ HorizontalDatePicker for multi-day events
- ✅ Alternating left-right timeline layout
- ✅ Time displayed in the center
- ✅ Type-specific colors and icons
- ✅ Speaker information
- ✅ Capacity and difficulty badges
- ✅ Theme-aware styling

## Design Philosophy

The schedule modal uses a **timeline design pattern** that:

- Shows time in the center vertical line
- Alternates schedule items left and right
- Uses color-coded indicators for different session types
- Displays speaker information inline
- Provides clear visual hierarchy
- Works seamlessly with single-day and multi-day events

## Visual Layout

### Timeline Structure

```
        [HorizontalDatePicker]

09:00   ┌─────────────────┐
        │ Opening Keynote │
        │ Dr. Emily Chen  │
        │ Main Hall       │
        └─────────────────┘
10:30                       ┌─────────────────┐
                            │ React Workshop  │
                            │ Alex Rivera     │
                            │ Room A • 50     │
                            └─────────────────┘
        ┌─────────────────┐
13:00   │ Kubernetes      │
        │ Maria Garcia    │
        │ Room C • 40     │
        └─────────────────┘
14:30                       ┌─────────────────┐
                            │ Coffee Break    │
                            │ Main Lobby      │
                            └─────────────────┘
```

### Alternating Pattern

- **Even indices (0, 2, 4...)**: Left side
- **Odd indices (1, 3, 5...)**: Right side
- **Center**: Time + colored dot + connecting line

## Key Components

### 1. EventScheduleModal Component

**Location**: `src/components/events/EventScheduleModal.tsx`

**Props**:

```typescript
interface EventScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  startTime: string;
  endTime: string;
  scheduleItems: ScheduleItem[];
}
```

**Features**:

- Date picker integration with event date constraints
- Filter schedule items by selected date
- Alternating left-right layout algorithm
- Type-specific colors and icons
- Speaker list display
- Capacity and difficulty badges
- Empty state for dates without events

### 2. More Info Button

**Location**: `src/screens/EventDetailScreen.tsx`

**Display Logic**:

- Only shows when `event.scheduleItems` exists and has items
- Shows session count: "View Schedule (7 sessions)"
- Positioned after stats section in hero area
- Primary button styling with icon + text + chevron

```tsx
<TouchableOpacity
  style={styles.moreInfoButton}
  onPress={() => setShowScheduleModal(true)}
>
  <Icon name="calendar" />
  <Text>View Schedule ({event.scheduleItems.length} sessions)</Text>
  <Icon name="chevron-right" />
</TouchableOpacity>
```

## Session Type Styling

### Type Colors & Icons

```typescript
Type        | Color     | Icon      | Use Case
------------|-----------|-----------|------------------
keynote     | #e74c3c   | star      | Main presentations
workshop    | #3498db   | briefcase | Hands-on sessions
talk        | #9b59b6   | mic       | Presentations
panel       | #f39c12   | users     | Panel discussions
break       | #95a5a6   | coffee    | Coffee/lunch breaks
default     | primary   | calendar  | Other types
```

### Type Badge

- Small uppercase label
- White text on type color background
- Positioned below title
- Example: `KEYNOTE`, `WORKSHOP`, `PANEL`

## Schedule Card Content

### Card Header

```
┌─────────────────────────────────┐
│ [ICON] Opening Keynote: AI      │  ← Icon + Title
│ [KEYNOTE]                        │  ← Type badge
└─────────────────────────────────┘
```

### Card Body

```
Description (max 3 lines)
"Join our CEO as he explores..."

[📍 Main Hall] [👤 50 seats] [INTERMEDIATE]

Speakers:
• Dr. Emily Chen • CEO & Chief AI Officer
• Prof. David Lee • AI Ethics Researcher
```

### Card Styles

- **Highlight card**: Has border with primary color (30% opacity)
- **Left border**: 4px colored border matching session type
- **Shadow**: Subtle elevation for depth
- **Padding**: 14px for compact information display

## Date Picker Integration

### HorizontalDatePicker Props

```typescript
<HorizontalDatePicker
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  startDate={new Date(startTime)}
  endDate={new Date(endTime)}
  datesWithEvents={datesWithEvents} // Green dots
/>
```

### Features

- Shows only dates within event range
- Green dots on dates with scheduled sessions
- Disabled dates outside event range
- Scrolls to selected date
- Single-day events show single date
- Multi-day events show full range

## Timeline Algorithm

### Alternating Logic

```typescript
filteredScheduleItems.map((item, index) => {
  const isLeft = index % 2 === 0;

  return (
    <View style={styles.timelineItem}>
      {/* Left Side */}
      <View style={styles.timelineLeft}>{isLeft && <ScheduleCard />}</View>

      {/* Center Timeline */}
      <View style={styles.timelineCenter}>
        <Text>{formatTime(startTime)}</Text>
        <Dot color={typeColor} />
        {!isLastItem && <Line />}
      </View>

      {/* Right Side */}
      <View style={styles.timelineRight}>{!isLeft && <ScheduleCard />}</View>
    </View>
  );
});
```

### Center Timeline

- **Width**: 60px
- **Time**: Small font (12px), centered above dot
- **Dot**: 12px circle with type color
- **Line**: 2px vertical line connecting dots
- **Last item**: No line after final dot

## Data Filtering

### Filter by Date

```typescript
const getScheduleItemsForDate = (date: Date): ScheduleItem[] => {
  return scheduleItems
    .filter(item => {
      const itemDate = new Date(item.startTime);
      return isSameDay(itemDate, date);
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
};
```

### Dates with Events

```typescript
const getDatesWithScheduleItems = (): Date[] => {
  const uniqueDates = new Set<string>();
  scheduleItems.forEach(item => {
    const date = new Date(item.startTime);
    uniqueDates.add(date.toDateString());
  });
  return Array.from(uniqueDates).map(dateStr => new Date(dateStr));
};
```

## Speaker Display

### Speaker Row

```
• Dr. Emily Chen • CEO & Chief AI Officer
• Prof. David Lee • AI Ethics Researcher
```

### Styling

- Small dot (4px) with primary color
- Name and title separated by bullet
- Compact font (12px)
- Stacked vertically with 4px gap

## Detail Badges

### Location Badge

```
[📍 Main Hall]
```

### Capacity Badge

```
[👤 50 seats]
```

### Difficulty Badge

```typescript
Difficulty     | Color     | Display
---------------|-----------|----------
beginner       | #27ae60   | BEGINNER
intermediate   | #f39c12   | INTERMEDIATE
advanced       | #e74c3c   | ADVANCED
```

## Empty State

When no schedule items for selected date:

```
        [📅 Calendar Icon]

  No schedule items for this date
```

- Icon: 48px calendar
- Text: Secondary color
- Centered in scrollable area

## Modal Structure

### Header

```
Event Schedule                     [X]
```

- Title: "Event Schedule"
- Close button: X icon in circular background

### Sections

1. **Date Picker Section**

   - Fixed at top
   - Background: Card background
   - Bottom border separator

2. **Timeline Section**
   - Scrollable content
   - Padding: 16px horizontal, 20px top
   - Bottom padding: 24px

## Responsive Behavior

### Card Width

- Timeline left/right: `flex: 1` (equal width)
- Center: `60px` (fixed)
- Total: Adapts to screen width

### Content Wrapping

- Title: Max 2 lines with ellipsis
- Description: Max 3 lines with ellipsis
- Details: Wraps to multiple rows if needed
- Speakers: Stacks vertically, no limit

## Theme Integration

### Dark Mode

- Modal overlay: `rgba(0, 0, 0, 0.5)`
- Background: `theme.background.primary`
- Cards: `theme.background.card`
- Timeline line: `theme.border.secondary`
- Text: Theme-aware colors

### Light Mode

- Same structure with light theme colors
- Better contrast for readability

## Typography

### Sizes

- Header title: 18px
- Time text: 12px, semibold
- Card title: 15px, semibold
- Card description: 13px
- Type badge: 9px, uppercase, bold
- Detail text: 11px
- Speaker text: 12px
- Difficulty badge: 10px

### Font Families

- Uses consistent `getFontStyle()` for all text
- Maintains app-wide typography system

## Animation

### Modal Entry

```typescript
animationType = 'slide'; // Slides up from bottom
```

### Height

```
height: '90%'  // Takes 90% of screen
borderTopLeftRadius: 24
borderTopRightRadius: 24
```

## Performance Optimizations

### Data Processing

- Filter once per date selection
- Sort items by time once
- Cache dates with events

### Rendering

- Conditional rendering for empty sides
- No unnecessary re-renders
- Efficient ScrollView

## Example Data

### Single-Day Event

```json
{
  "startTime": "2026-06-15T09:00:00.000Z",
  "endTime": "2026-06-15T18:00:00.000Z",
  "scheduleItems": [7 items]  // All on June 15
}
```

### Multi-Day Event

```json
{
  "startTime": "2026-06-15T09:00:00.000Z",
  "endTime": "2026-06-17T18:00:00.000Z",
  "scheduleItems": [
    // June 15: 3 items
    // June 16: 5 items
    // June 17: 4 items
  ]
}
```

## Interaction Flow

1. **User taps "More Info" button**

   - Modal slides up from bottom
   - Date picker shows event date range
   - First date auto-selected (event start date)
   - Schedule items for first date displayed

2. **User selects different date**

   - Timeline updates to show items for that date
   - Smooth transition
   - Empty state if no items

3. **User scrolls timeline**

   - Vertical scroll through schedule items
   - Timeline line connects all items

4. **User closes modal**
   - Tap X button or swipe down
   - Modal slides down
   - Returns to event detail screen

## Edge Cases Handled

### No Schedule Items

- Button doesn't show
- Modal doesn't render

### Single Schedule Item

- Shows on left (index 0)
- No timeline line after dot

### Break Sessions

- Grey color scheme
- Coffee icon
- No speakers section

### Long Speaker List

- All speakers displayed
- Vertically stacked
- No truncation

### Long Descriptions

- Max 3 lines with ellipsis
- Maintains card height consistency

### Dates Without Events

- Empty state displayed
- Date picker still functional
- Can navigate to other dates

## Files Modified

### New Files

- ✅ `src/components/events/EventScheduleModal.tsx`
  - Complete modal component
  - Timeline layout logic
  - Date filtering
  - Type-specific styling

### Updated Files

- ✅ `src/screens/EventDetailScreen.tsx`
  - Added `showScheduleModal` state
  - Added "More Info" button
  - Added modal integration
  - Added button styles
  - Imported EventScheduleModal

## Button Placement

The "More Info" button is positioned:

- **After**: Stats section (Registered/Available/Capacity)
- **Before**: Description section
- **Conditional**: Only when scheduleItems exist
- **Style**: Full-width primary button with icons

## Benefits

✅ **Clean Timeline View** - Alternating layout is easy to scan
✅ **Time-Centric Design** - Time displayed prominently in center
✅ **Type Differentiation** - Colors and icons for quick identification
✅ **Complete Information** - All session details in one place
✅ **Speaker Visibility** - Speaker names and titles clearly shown
✅ **Multi-Day Support** - Date picker for events spanning days
✅ **Theme Consistency** - Matches app's dark/light theme
✅ **Empty States** - Graceful handling of dates without sessions
✅ **Responsive Layout** - Adapts to all screen sizes
✅ **Performance** - Efficient filtering and rendering

## Future Enhancements

Potential additions:

- Session registration from modal
- Add to calendar button per session
- Filter by session type
- Search schedule items
- Session detail view (tap to expand)
- Download session materials
- View session recordings
- Reminder notifications

---

**Status**: ✅ COMPLETE

**Design Pattern**: Timeline with Alternating Layout
**Component**: EventScheduleModal
**Integration**: EventDetailScreen
**Last Updated**: March 5, 2026
**Version**: 1.0.0
