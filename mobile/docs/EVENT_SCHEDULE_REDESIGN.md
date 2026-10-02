# Event Schedule Modal & Card - Clean Redesign

## Overview

Redesigned the EventScheduleModal and EventCard for a cleaner, more elegant appearance:

- ✅ **Timeline**: All cards on right, time on left (no alternating)
- ✅ **Time Display**: Shows start and end times
- ✅ **Tags Inline**: Limited width with proper wrapping
- ✅ **Full Height Modal**: 95% screen coverage
- ✅ **Corner Badge**: Session count shown as small badge instead of large button

## Design Changes

### EventScheduleModal Timeline

#### Before (Alternating Layout)

```
09:00   ┌─────────────┐
        │ Keynote     │
        └─────────────┘
10:30                   ┌─────────────┐
                        │ Workshop    │
                        └─────────────┘
```

#### After (Clean Right-Aligned)

```
09:00 AM    ●   ┌─────────────────────────┐
09:30 AM    │   │ Opening Keynote         │
            │   │ Dr. Emily Chen          │
            │   │ 📍 Hall  👤 100  KEYNOTE │
            │   └─────────────────────────┘
            │
10:30 AM    ●   ┌─────────────────────────┐
12:00 PM    │   │ React Workshop          │
            │   │ Alex Rivera             │
            │   │ 📍 Room A  WORKSHOP      │
            │   └─────────────────────────┘
```

### Key Visual Improvements

#### 1. Time Display

**Before**: Single start time

```
09:00
```

**After**: Time range (start to end)

```
09:00 AM
10:00 AM
```

**Implementation**:

```typescript
const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return `${start}\n${end}`;
};
```

#### 2. Layout Structure

```
[Time]  [Dot]  [Card]
 65px    20px   Flex(1)

09:00 AM  ●    ┌──────────────┐
10:00 AM  │    │ Session Card │
          │    └──────────────┘
```

**Widths**:

- Time column: `65px` (fixed)
- Timeline center: `20px` (fixed)
- Card area: `flex: 1` (flexible)

#### 3. Inline Tags/Details

All session details in one compact row:

```
📍 Main Hall  👤 100  KEYNOTE  INTERMEDIATE
```

**Features**:

- Icons + text for location and capacity
- Type badge (colored)
- Difficulty badge (color-coded)
- All inline with wrapping
- Max width per badge: 100px

#### 4. Modal Height

**Before**: 90% screen height
**After**: 95% screen height

More content visible, less wasted space.

## Component Updates

### EventScheduleModal.tsx

#### Timeline Item Structure

```tsx
<View style={styles.timelineItem}>
  {/* Left Time */}
  <View style={styles.timelineLeft}>
    <Text style={styles.timeText}>
      {formatTimeRange(item.startTime, item.endTime)}
    </Text>
  </View>

  {/* Center Line */}
  <View style={styles.timelineCenter}>
    <View style={[styles.timelineDot, { backgroundColor: typeColor }]} />
    {!isLastItem && <View style={styles.timelineLine} />}
  </View>

  {/* Right Card */}
  <View style={styles.timelineRight}>
    <View style={styles.scheduleCard}>
      {/* Title + Icon */}
      {/* Description */}
      {/* Details Row (inline) */}
      {/* Speakers */}
    </View>
  </View>
</View>
```

**No More Alternating**:

- Removed `isLeft` logic
- Removed conditional rendering
- Single card layout for all items

#### Style Changes

**Timeline Item**:

```typescript
timelineItem: {
  flexDirection: 'row',
  marginBottom: 20,  // Reduced from 24
}
```

**Time Column**:

```typescript
timelineLeft: {
  width: 65,           // Fixed width
  paddingRight: 12,
  alignItems: 'flex-end',
  paddingTop: 4,
}

timeText: {
  fontSize: 11,        // Smaller
  fontWeight: '600',
  textAlign: 'right',  // Right aligned
  lineHeight: 16,      // Multiline support
}
```

**Timeline Center**:

```typescript
timelineCenter: {
  width: 20,          // Narrower
  alignItems: 'center',
}

timelineDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
}

timelineLine: {
  width: 2,
  flex: 1,
  backgroundColor: theme.border.secondary,
}
```

**Card**:

```typescript
scheduleCard: {
  backgroundColor: theme.background.card,
  borderRadius: 10,      // Slightly smaller
  padding: 12,           // Reduced from 14
  borderLeftWidth: 3,    // Thinner from 4
  shadowOpacity: 0.08,   // Lighter shadow
  shadowRadius: 3,       // Softer shadow
  elevation: 2,          // Lower elevation
}
```

#### Details Row (Inline)

```typescript
detailsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',      // Allows wrapping
  gap: 6,
  marginTop: 8,
  marginBottom: 8,
}

detailBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 7,  // Compact
  paddingVertical: 3,    // Compact
  borderRadius: 6,
  gap: 4,
  maxWidth: 100,         // Prevents overflow
}

detailText: {
  fontSize: 10,          // Small text
  color: theme.text.secondary,
}
```

**Type Badge**:

```typescript
typeBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 8,
  backgroundColor: typeColor,  // Colored
}

typeBadgeText: {
  fontSize: 9,
  fontWeight: '700',
  color: '#FFFFFF',
  textTransform: 'uppercase',
  letterSpacing: 0.3,
}
```

**Difficulty Badge**:

```typescript
difficultyBadge: {
  paddingHorizontal: 7,
  paddingVertical: 3,
  borderRadius: 6,
  // backgroundColor set dynamically
}

difficultyText: {
  fontSize: 9,
  fontWeight: '700',
  color: '#FFFFFF',
  textTransform: 'uppercase',
  letterSpacing: 0.3,
}
```

#### Speaker Display

```typescript
speakersContainer: {
  marginTop: 8,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: theme.border.secondary,
}

speakerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 3,
}

speakerDot: {
  width: 3,              // Smaller dot
  height: 3,
  borderRadius: 1.5,
  marginRight: 6,
}

speakerText: {
  flex: 1,               // Takes remaining space
  fontSize: 11,          // Smaller text
  numberOfLines: 1,      // Truncate if needed
}
```

### EventCard.tsx

#### Session Badge (Corner)

**Before**: Large button at bottom

```
┌─────────────────────────────┐
│ Card Content                │
│ ┌─────────────────────────┐ │
│ │ 📅 7 Sessions        >  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**After**: Small badge at top-left corner

```
┌─────────────────────────────┐
│ 📅 7                        │ ← Badge
│                             │
│ Event Content               │
│                             │
└─────────────────────────────┘
```

#### Implementation

```tsx
{
  event.scheduleItems && event.scheduleItems.length > 0 && (
    <TouchableOpacity
      style={styles.scheduleBadge}
      onPress={handleSchedulePress}
      activeOpacity={0.8}
    >
      <Icon name="calendar" size={12} />
      <Text>{event.scheduleItems.length}</Text>
    </TouchableOpacity>
  );
}
```

**Position**: Absolute positioning at top-left

#### Style

```typescript
scheduleBadge: {
  position: 'absolute',
  top: 12,
  left: 12,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  gap: 4,
  borderWidth: 1,
  backgroundColor: theme.button.primary.background + 'E6',  // 90% opacity
  borderColor: 'rgba(255, 255, 255, 0.2)',
}

scheduleBadgeText: {
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.5,
  color: theme.button.primary.text,
}
```

**Features**:

- Small and unobtrusive
- Still interactive (tappable)
- Shows only session count (e.g., "7")
- Semi-transparent background
- Consistent with status badge styling

## Visual Comparison

### Modal Timeline

**Before**:

- Alternating left-right cards
- Single time display
- Separate rows for details
- 90% height
- Busy layout

**After**:

- All cards on right
- Start-end time range
- Inline details row
- 95% height
- Clean, scannable layout

### Event Card

**Before**:

- Large button at bottom
- Takes vertical space
- Shows "X Sessions" text

**After**:

- Small badge at corner
- Doesn't affect layout
- Shows count only

## Benefits

✅ **Cleaner Layout** - Right-aligned cards easier to scan
✅ **Better Time Context** - See duration at a glance
✅ **Space Efficient** - Inline tags save vertical space
✅ **More Content** - 95% height shows more sessions
✅ **Subtle Badge** - Doesn't dominate event card
✅ **Consistent Design** - Matches status badge pattern
✅ **Improved Readability** - Clear visual hierarchy
✅ **Faster Scanning** - All info in predictable location

## Responsive Behavior

### Timeline Layout

- Time column: Fixed 65px
- Timeline: Fixed 20px
- Card: Flexible (adapts to screen width)
- Wrapping: Details wrap to multiple lines if needed

### Event Card Badge

- Always positioned at top-left (12px from edges)
- Overlays image area
- Size adapts to content (count)

## Theme Support

### Dark Mode

```typescript
Modal Background: theme.background.primary
Cards: theme.background.card
Time Text: theme.text.secondary
Badge: theme.button.primary.background (90% opacity)
```

### Light Mode

Same structure with light theme colors.

## Typography

### Modal

- Time: 11px, semibold
- Title: 15px, semibold
- Description: 13px
- Details: 10px
- Type badge: 9px, uppercase, bold
- Difficulty: 9px, uppercase, bold
- Speakers: 11px

### Card Badge

- Count: 10px, bold, 0.5 letter spacing

## Performance

### Removed Complexity

- No alternating logic
- No conditional left/right rendering
- Simpler component tree
- Faster render time

### Optimizations

- Fixed widths for time/timeline
- Flex for card (single calculation)
- Absolute positioning for badge (no layout shift)

## Edge Cases

### Long Time Ranges

```
09:00 AM
11:30 AM
```

- Wraps to two lines
- Right-aligned
- Consistent spacing

### Many Tags

- Wraps to multiple rows
- Max width 100px per badge
- Maintains readability

### Short Sessions

```
09:00 AM
09:15 AM
```

- Still shows both times
- Clear duration indication

### No Speakers

- Speaker section hidden
- Card height adapts

## Files Modified

### Updated Files

1. ✅ **src/components/events/EventScheduleModal.tsx**

   - Removed alternating layout logic
   - Updated time display to show range
   - Moved all cards to right
   - Made details row inline
   - Updated all styles for cleaner look
   - Increased modal height to 95%

2. ✅ **src/components/events/EventCard.tsx**
   - Replaced large button with small corner badge
   - Changed to absolute positioning
   - Updated styles for compact display
   - Shows count only (no "Sessions" text)

## Testing Scenarios

### Test 1: Modal Timeline

```
Action: Open schedule modal
Expected: All cards on right, time on left
Result: Clean vertical timeline
```

### Test 2: Time Display

```
Session: 9:00 AM - 10:30 AM
Expected: Two lines showing start and end
Result: Both times visible, right-aligned
```

### Test 3: Inline Details

```
Session: Keynote with location, capacity, type, difficulty
Expected: All badges in one row, wrapping if needed
Result: Compact inline display
```

### Test 4: Card Badge

```
Event: 7 sessions
Expected: Small badge at top-left showing "7"
Result: Badge visible, tappable, opens modal
```

## Future Enhancements

Potential improvements:

- Duration calculation (e.g., "1h 30m")
- Color-coded time based on session type
- Sticky date header on scroll
- Session bookmarking
- Filter by track/type

---

**Status**: ✅ COMPLETE

**Design**: Clean Right-Aligned Timeline
**Badge**: Corner Session Count
**Modal**: 95% Height
**Last Updated**: March 5, 2026
**Version**: 2.0.0
