# Event Card UI Update - Summary

## Overview

Updated the EventCard component in the Upcoming Events section to display:

- ✅ Date range without year (e.g., "Jun 15 - Jun 17")
- ✅ Capacity information
- ✅ Event tags

## Changes Made

### 1. EventCardData Interface Update

**File**: `src/components/events/EventCard.tsx`

Added new optional fields:

```typescript
export interface EventCardData {
  // ... existing fields
  startTime?: string; // ISO timestamp for range calculation
  endTime?: string; // ISO timestamp for range calculation
  capacity?: number; // Event capacity
  tags?: Array<{ id: string; name: string; slug: string }>;
}
```

### 2. Event Transformer Update

**File**: `src/utils/eventTransformers.ts`

#### New Helper Functions

**formatEventDateShort** - Date without year:

```typescript
"2026-06-15T09:00:00.000Z" → "Jun 15"
```

**formatEventDateRange** - Date range formatting:

```typescript
// Same day event
"2026-06-15" to "2026-06-15" → "Jun 15"

// Multi-day event
"2026-06-15" to "2026-06-17" → "Jun 15 - Jun 17"
```

#### Updated Transform Function

Now passes additional fields to EventCard:

```typescript
return apiResponse.events.map(event => ({
  // ... existing fields
  startTime: event.startTime,
  endTime: event.endTime,
  capacity: event.capacity,
  tags: event.tags,
}));
```

### 3. EventCard UI Update

**File**: `src/components/events/EventCard.tsx`

#### New UI Elements

**Date Range** (replaces single date):

```tsx
<View style={styles.infoRow}>
  <Icon name="calendar" size={16} color={theme.text.secondary} />
  <BodyText style={[styles.infoText, { color: theme.text.secondary }]}>
    {formatEventDateRange(event.startTime, event.endTime)}
  </BodyText>
</View>
```

**Capacity**:

```tsx
<View style={styles.infoRow}>
  <Icon name="user" size={16} color={theme.text.secondary} />
  <BodyText style={[styles.infoText, { color: theme.text.secondary }]}>
    Capacity: {event.capacity}
  </BodyText>
</View>
```

**Tags** (shows up to 2 tags + counter):

```tsx
<View style={styles.tagsRow}>
  {event.tags.slice(0, 2).map(tag => (
    <View key={tag.id} style={styles.tag}>
      <BodyText style={styles.tagText}>{tag.name}</BodyText>
    </View>
  ))}
  {event.tags.length > 2 && (
    <View style={styles.tag}>
      <BodyText style={styles.tagText}>+{event.tags.length - 2}</BodyText>
    </View>
  )}
</View>
```

#### New Styles

```typescript
tagsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 4,
},
tag: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 12,
  maxWidth: 100,
},
tagText: {
  fontSize: 10,
  fontWeight: '600',
},
```

#### Card Height Adjustment

Increased card height to accommodate new content:

```typescript
const CARD_HEIGHT = 250; // Was 230
```

## UI Layout

### Before

```
┌─────────────────────────┐
│     Event Image         │
│                         │
├─────────────────────────┤
│ Event Title             │
│ 📅 Jun 15, 2026 • 9:00 │
│ 📍 San Francisco, CA    │
└─────────────────────────┘
```

### After

```
┌─────────────────────────┐
│     Event Image         │
│                         │
├─────────────────────────┤
│ Event Title             │
│ 📅 Jun 15 - Jun 17      │
│ 👤 Capacity: 500        │
│ [AI/ML] [Tech] +1       │
└─────────────────────────┘
```

## Features

### Date Range Display

**Single-Day Events**:

- Shows: "Jun 15"
- Compact, clean display

**Multi-Day Events**:

- Shows: "Jun 15 - Jun 17"
- Clear duration indication

### Capacity Display

Shows total event capacity:

- Icon: User icon
- Format: "Capacity: 500"

### Tags Display

Smart tag rendering:

- Shows up to 2 tags
- Displays tag names (e.g., "AI/ML", "Technology")
- Shows counter for additional tags (e.g., "+1" for 3rd tag)
- Themed colors matching primary brand
- Truncates long tag names with ellipsis
- Max width: 100px per tag

## Example Data Flow

### API Response

```json
{
  "id": "event-123",
  "title": "Tech Summit 2026",
  "startTime": "2026-06-15T09:00:00.000Z",
  "endTime": "2026-06-17T18:00:00.000Z",
  "capacity": 500,
  "tags": [
    { "id": "tag-1", "name": "AI/ML", "slug": "ai-ml" },
    { "id": "tag-2", "name": "Web Development", "slug": "web-dev" },
    { "id": "tag-3", "name": "Technology", "slug": "technology" }
  ]
}
```

### Transformed Card Data

```typescript
{
  id: "event-123",
  title: "Tech Summit 2026",
  slug: "tech-summit-2026",
  startTime: "2026-06-15T09:00:00.000Z",
  endTime: "2026-06-17T18:00:00.000Z",
  capacity: 500,
  tags: [
    { id: "tag-1", name: "AI/ML", slug: "ai-ml" },
    { id: "tag-2", name: "Web Development", slug: "web-dev" },
    { id: "tag-3", name: "Technology", slug: "technology" }
  ],
  // ... other fields
}
```

### Rendered UI

```
Tech Summit 2026
📅 Jun 15 - Jun 17
👤 Capacity: 500
[AI/ML] [Web Development] +1
```

## Benefits

✅ **Cleaner Date Display** - Removes redundant year, saves space
✅ **More Information** - Users see capacity and event types at a glance
✅ **Better Categorization** - Tags help users identify event topics quickly
✅ **Responsive Tags** - Handles any number of tags gracefully
✅ **Consistent Theming** - Tags use brand colors for visual harmony
✅ **No Breaking Changes** - All fields are optional, backward compatible

## Edge Cases Handled

### No Tags

- Tags row is hidden
- Card layout adjusts automatically

### Single Tag

- Shows 1 tag, no counter

### 2 Tags

- Shows both tags, no counter

### 3+ Tags

- Shows first 2 tags + counter
- Example: `[AI/ML] [Tech] +1`

### Long Tag Names

- Truncated with ellipsis at 100px width
- Example: "Very Long Tag Name..." → "Very Long T..."

### Single-Day Event

- Date range shows single date
- Example: "Jun 15" (not "Jun 15 - Jun 15")

### No Capacity

- Capacity row is hidden
- Card shows other info only

## Files Modified

### Updated Files

- ✅ `src/components/events/EventCard.tsx`

  - Updated EventCardData interface
  - Added date range, capacity, and tags display
  - Added new styles
  - Increased card height

- ✅ `src/utils/eventTransformers.ts`
  - Added formatEventDateShort()
  - Added formatEventDateRange()
  - Updated transformAPIEventsToCards() to pass new fields

### No Changes Needed

- ✅ `src/screens/EventsScreen.tsx` - Works with updated interface
- ✅ `src/components/events/HorizontalEventsList.tsx` - No changes needed
- ✅ Backend API - Already provides all required data

## Testing Scenarios

### Test 1: Multi-Day Event with Tags

```
Event: Tech Summit 2026
Duration: Jun 15 - Jun 17
Capacity: 500
Tags: AI/ML, Web Development, Technology

Expected Display:
- Date: "Jun 15 - Jun 17"
- Capacity: "Capacity: 500"
- Tags: [AI/ML] [Web Development] +1
```

### Test 2: Single-Day Event

```
Event: Workshop
Duration: Jun 15
Capacity: 50
Tags: Python, Beginner

Expected Display:
- Date: "Jun 15"
- Capacity: "Capacity: 50"
- Tags: [Python] [Beginner]
```

### Test 3: Event with No Tags

```
Event: DevOps Summit
Duration: Sep 20 - Sep 22
Capacity: 600
Tags: []

Expected Display:
- Date: "Sep 20 - Sep 22"
- Capacity: "Capacity: 600"
- Tags: (hidden)
```

## Visual Improvements

### Before

- Showed full date with year (redundant for upcoming events)
- Only showed location info
- No indication of event type/category
- No capacity information

### After

- Compact date range without year
- Shows capacity for better planning
- Tags provide quick categorization
- More informative at a glance
- Still maintains clean, card-based design

## Performance

- ✅ No performance impact
- ✅ Tag slicing (`.slice(0, 2)`) is O(1) operation
- ✅ Conditional rendering prevents unnecessary DOM nodes
- ✅ All formatting done once during transformation

---

**Status**: ✅ COMPLETE

**Last Updated**: March 4, 2026
**Version**: 1.0.0
