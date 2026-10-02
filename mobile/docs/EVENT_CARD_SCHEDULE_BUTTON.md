# Event Card Schedule Button

## Overview

Added a **schedule button** to the EventCard component that opens the EventScheduleModal directly from the event card, allowing users to quickly view session schedules without navigating to the event detail screen first.

## Design Philosophy

Quick access to schedule information:

- ✅ Button appears on event card when scheduleItems exist
- ✅ Shows session count (e.g., "7 Sessions")
- ✅ Opens modal with timeline view
- ✅ Non-blocking - doesn't interfere with card tap
- ✅ Theme-aware styling
- ✅ Compact button design

## Visual Design

### EventCard with Schedule Button

```
┌─────────────────────────────────┐
│        Event Image              │
│        [STATUS BADGE]           │
├─────────────────────────────────┤
│ JUN 15 - JUN 17                 │
│                                 │
│ Event Title                     │
│ Here in two lines               │
│                                 │
│ 👤 500  [AI/ML] [Tech]          │
│ ┌─────────────────────────────┐ │
│ │ 📅 7 Sessions           >   │ │ ← Schedule Button
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Button States

- **Default**: Primary color background
- **Active**: 0.8 opacity on press
- **Disabled**: Hidden (only shows when scheduleItems exist)

## Implementation

### 1. EventCard Component Updates

**File**: `src/components/events/EventCard.tsx`

#### Interface Changes

Added to `EventCardData`:

```typescript
interface Speaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  photo?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  speakers: Speaker[] | null;
  capacity: number | null;
  isHighlight: boolean;
  tags?: string[] | null;
  difficultyLevel?: string | null;
}

export interface EventCardData {
  // ... existing fields
  scheduleItems?: ScheduleItem[];
  onSchedulePress?: () => void;
}
```

Added to `EventCardProps`:

```typescript
interface EventCardProps {
  event: EventCardData;
  onPress?: () => void;
  onSchedulePress?: () => void; // NEW
}
```

#### Handler Implementation

```typescript
const handleSchedulePress = (e: any) => {
  e.stopPropagation(); // Prevent card press event
  if (event.onSchedulePress) {
    event.onSchedulePress();
  } else if (onSchedulePress) {
    onSchedulePress();
  }
};
```

**Key Features**:

- `stopPropagation()` prevents triggering the card's main onPress
- Checks both `event.onSchedulePress` (from data) and `onSchedulePress` (from props)
- Allows flexible callback handling

#### Button UI

```tsx
{
  event.scheduleItems && event.scheduleItems.length > 0 && (
    <TouchableOpacity
      style={styles.scheduleButton}
      onPress={handleSchedulePress}
      activeOpacity={0.8}
    >
      <Icon name="calendar" size={14} />
      <Text>{event.scheduleItems.length} Sessions</Text>
      <Icon name="chevron-right" size={14} />
    </TouchableOpacity>
  );
}
```

**Conditional Rendering**:

- Only shows when `scheduleItems` exists and has items
- Displays session count dynamically

#### Button Styles

```typescript
scheduleButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginTop: 8,
  gap: 6,
  borderWidth: 1,
  backgroundColor: theme.button.primary.background,
  borderColor: glassBorder,
},
scheduleButtonText: {
  fontSize: 11,
  fontWeight: '600',
  letterSpacing: 0.3,
  color: theme.button.primary.text,
}
```

**Styling Features**:

- Primary brand color background
- Subtle border with glass effect
- Compact padding (8px vertical)
- 6px gap between icons and text
- Small font (11px) with increased letter spacing

### 2. HorizontalEventsList Updates

**File**: `src/components/events/HorizontalEventsList.tsx`

#### State Management

```typescript
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [selectedEvent, setSelectedEvent] = useState<EventCardData | null>(null);
```

**Purpose**:

- `showScheduleModal`: Controls modal visibility
- `selectedEvent`: Stores the event whose schedule is being viewed

#### Schedule Handler

```typescript
const handleSchedulePress = useCallback((event: EventCardData) => {
  setSelectedEvent(event);
  setShowScheduleModal(true);
}, []);
```

**Flow**:

1. Receives event data from EventCard
2. Stores in `selectedEvent` state
3. Opens modal by setting `showScheduleModal` to true

#### EventCard Integration

```typescript
const renderEventCard = useCallback(
  ({ item }: { item: EventCardData }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item.slug)}
      onSchedulePress={() => handleSchedulePress(item)} // NEW
    />
  ),
  [handleEventPress, handleSchedulePress],
);
```

**Updates**:

- Added `onSchedulePress` callback
- Passes full event object to handler
- Updated dependencies array

#### Modal Rendering

```tsx
{
  selectedEvent && selectedEvent.scheduleItems && (
    <EventScheduleModal
      visible={showScheduleModal}
      onClose={() => setShowScheduleModal(false)}
      eventTitle={selectedEvent.title}
      startTime={selectedEvent.startTime || selectedEvent.date}
      endTime={selectedEvent.endTime || selectedEvent.date}
      scheduleItems={selectedEvent.scheduleItems}
    />
  );
}
```

**Features**:

- Conditional rendering (only when selectedEvent has scheduleItems)
- Fallback to `date` field if `startTime`/`endTime` not available
- Closes modal by setting state to false

### 3. Event Transformers Updates

**File**: `src/utils/eventTransformers.ts`

#### API Event Interface

```typescript
interface Speaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  photo?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  speakers: Speaker[] | null;
  capacity: number | null;
  isHighlight: boolean;
  tags?: string[] | null;
  difficultyLevel?: string | null;
}

export interface APIEvent {
  // ... existing fields
  scheduleItems?: ScheduleItem[]; // NEW
}
```

#### Transformer Update

```typescript
export const transformAPIEventsToCards = (
  apiResponse: EventsAPIResponse,
): EventCardData[] => {
  return apiResponse.events.map(event => ({
    // ... existing fields
    scheduleItems: event.scheduleItems, // NEW - Pass through
  }));
};
```

**Purpose**:

- Pass schedule data from API to EventCard
- Optional field - works with or without scheduleItems
- No transformation needed, passes through as-is

## User Flow

### From Event Card to Schedule

1. **User sees event card** with session count button
2. **User taps "7 Sessions" button**
   - Event propagation stopped
   - Modal state updated
   - Selected event stored
3. **Modal opens** with schedule timeline
4. **User views schedule** in alternating layout
5. **User closes modal** with X button
6. **Returns to event list** - no navigation occurred

### Event Propagation

```
Event Card TouchableOpacity (main)
  └─ Content Container
       └─ Schedule Button TouchableOpacity
            └─ handleSchedulePress(e)
                 └─ e.stopPropagation()  ← Prevents card press
```

**Why stopPropagation?**

- Prevents the main card `onPress` from firing
- Allows two separate actions on same card:
  - Tap card → Navigate to detail screen
  - Tap button → Open schedule modal

## Button Placement

Positioned at the bottom of EventCard:

- **After**: Meta row (capacity + tags)
- **Before**: End of card
- **Margin Top**: 8px gap from meta row
- **Full Width**: Spans content container width

## Responsive Behavior

### Button Width

- Full width within card padding
- Adapts to card width (280px max)
- Content centered within button

### Text Handling

- Session count updates dynamically
- Format: "{count} Sessions"
- Examples: "1 Session", "7 Sessions", "12 Sessions"

### Icons

- Left: Calendar icon (14px)
- Right: Chevron-right icon (14px)
- Color: Matches button text (primary.text)

## Theme Integration

### Dark Mode

```typescript
backgroundColor: theme.button.primary.background;
borderColor: 'rgba(255, 255, 255, 0.1)'; // Glass border
color: theme.button.primary.text;
```

### Light Mode

```typescript
backgroundColor: theme.button.primary.background;
borderColor: 'rgba(0, 0, 0, 0.05)'; // Glass border
color: theme.button.primary.text;
```

### Glass Morphism Effect

- Uses same `glassBorder` variable as card
- Maintains consistency with card styling
- Subtle border enhances button visibility

## Data Flow

```
API Response
    ↓
APIEvent (with scheduleItems)
    ↓
transformAPIEventsToCards()
    ↓
EventCardData (with scheduleItems)
    ↓
HorizontalEventsList
    ↓
EventCard (render button if scheduleItems exist)
    ↓
User taps button
    ↓
handleSchedulePress(event)
    ↓
setSelectedEvent(event)
setShowScheduleModal(true)
    ↓
EventScheduleModal (visible)
```

## Edge Cases Handled

### No Schedule Items

- Button doesn't render
- Card still functional (tap to navigate)
- No error if scheduleItems is undefined/null

### Empty Schedule Array

- Condition checks `scheduleItems.length > 0`
- Button hidden if array is empty
- Modal won't open without items

### Single Schedule Item

- Shows "1 Session" (singular)
- Modal still displays timeline
- Works same as multiple items

### API Without scheduleItems

- Optional field in interface
- Transformer handles undefined gracefully
- Backward compatible with existing API

### Modal Already Open

- State prevents multiple modals
- Button press updates selectedEvent
- Switches to new event's schedule

## Benefits

✅ **Quick Access** - View schedule without navigating away
✅ **Non-Intrusive** - Doesn't block card tap action
✅ **Visual Feedback** - Shows session count on card
✅ **Consistent Design** - Matches app's glass morphism style
✅ **Theme Aware** - Works with dark and light themes
✅ **Responsive** - Adapts to different card sizes
✅ **Performant** - No unnecessary re-renders
✅ **Backward Compatible** - Works with or without scheduleItems

## Comparison with Detail Screen

### Event Card Button

- Shows in event list (horizontal scroll)
- Opens modal overlay
- Doesn't navigate
- Quick preview of schedule
- Stays in current context

### Detail Screen Button

- Shows in detail screen (after navigation)
- Opens same modal
- Full event context visible
- More detailed event info first

Both use the same `EventScheduleModal` component for consistency.

## Performance Considerations

### Event Handler

- Uses `useCallback` in HorizontalEventsList
- Prevents recreation on every render
- Memoized dependencies

### Modal Rendering

- Only renders when selectedEvent exists
- Conditional rendering prevents unnecessary DOM
- Modal unmounts when closed

### State Updates

- Minimal state changes (2 state variables)
- No prop drilling
- Local state management

## Future Enhancements

Potential improvements:

- Badge showing "new" sessions
- Quick registration from button
- Preview of next session time
- Color-coded button based on event status
- Animation on button press
- Haptic feedback on mobile

## Files Modified

### Updated Files

1. ✅ **src/components/events/EventCard.tsx**

   - Added scheduleItems interfaces
   - Updated EventCardData interface
   - Added onSchedulePress to props
   - Implemented handleSchedulePress
   - Added schedule button UI
   - Added button styles

2. ✅ **src/components/events/HorizontalEventsList.tsx**

   - Imported EventScheduleModal
   - Added modal state management
   - Added handleSchedulePress callback
   - Updated renderEventCard
   - Added modal rendering

3. ✅ **src/utils/eventTransformers.ts**
   - Added Speaker interface
   - Added ScheduleItem interface
   - Updated APIEvent interface
   - Updated transformAPIEventsToCards

### No Changes Needed

- ✅ EventScheduleModal - Already implemented
- ✅ EventsScreen - Uses HorizontalEventsList (automatic support)
- ✅ API service - scheduleItems already in response

## Testing Scenarios

### Test 1: Event with Schedule Items

```
Event: Tech Summit
Schedule Items: 7 sessions
Expected: Button shows "7 Sessions"
Result: Modal opens with timeline
```

### Test 2: Event without Schedule Items

```
Event: Workshop
Schedule Items: undefined
Expected: No button rendered
Result: Card still tappable for navigation
```

### Test 3: Button Press

```
Action: Tap schedule button
Expected: Card onPress doesn't fire
Result: Modal opens, no navigation
```

### Test 4: Card Press

```
Action: Tap card (not button)
Expected: Navigate to detail screen
Result: Navigation works normally
```

### Test 5: Multiple Events

```
Events: 3 cards with schedules
Action: Tap button on 2nd card
Expected: Modal shows 2nd event's schedule
Result: Correct event data displayed
```

## UI Examples

### Button Text Variations

```
1 Session       ← Singular
7 Sessions      ← Multiple
12 Sessions     ← Double digits
100 Sessions    ← Large numbers
```

### Button in Different Themes

**Dark Mode**:

```
┌───────────────────────┐
│ [Purple Background]   │
│ 📅 7 Sessions    >    │
│ [White Text]          │
└───────────────────────┘
```

**Light Mode**:

```
┌───────────────────────┐
│ [Purple Background]   │
│ 📅 7 Sessions    >    │
│ [White Text]          │
└───────────────────────┘
```

## Layout Measurements

```
Schedule Button:
├─ Height: Auto (based on padding)
├─ Padding Vertical: 8px
├─ Padding Horizontal: 12px
├─ Border Radius: 8px
├─ Border Width: 1px
├─ Gap (between items): 6px
└─ Margin Top: 8px

Icons:
├─ Size: 14px
└─ Color: theme.button.primary.text

Text:
├─ Font Size: 11px
├─ Font Weight: 600
├─ Letter Spacing: 0.3px
└─ Color: theme.button.primary.text
```

---

**Status**: ✅ COMPLETE

**Feature**: Schedule Button on Event Card
**Integration**: HorizontalEventsList → EventCard → EventScheduleModal
**Last Updated**: March 5, 2026
**Version**: 1.0.0
