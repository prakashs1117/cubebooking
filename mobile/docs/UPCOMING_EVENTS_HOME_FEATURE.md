# Upcoming Events on Home Screen - Feature Summary

## Overview

Added a horizontal scrollable list of upcoming events to the Home screen, providing users quick access to upcoming events without navigating to the Events tab.

## What Was Added

### 1. New Component: `UpcomingEventsCarousel.tsx`

**Location**: `src/components/events/UpcomingEventsCarousel.tsx`

**Features**:

- Horizontal scrollable list of upcoming events
- Shows up to 10 upcoming/live events
- Prioritizes LIVE events first, then upcoming by date
- Beautiful card design with event details
- "View All" button to navigate to full events list
- Responsive design (adapts to screen size)
- Snap-to-interval scrolling for smooth UX

**Event Card Includes**:

- Event image placeholder with calendar icon
- Event title (max 2 lines)
- Status badge (LIVE/UPCOMING)
- Date, time, and location
- Tap to view event details

### 2. Updated Home Screen

**Location**: `src/screens/HomeScreen.tsx`

**Changes**:

- Added `UpcomingEventsCarousel` import
- Placed carousel between main carousel and content sections
- Shows immediately after the home banner carousel

## Visual Structure

```
┌─────────────────────────────────────┐
│     Home Screen                      │
├─────────────────────────────────────┤
│  [Home Banner Carousel]              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  📅 Upcoming Events  [View All]│ │
│  ├────────────────────────────────┤ │
│  │ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │
│  │ │Evt1│ │Evt2│ │Evt3│ │Evt4│  │ │ ← Horizontal Scroll
│  │ └────┘ └────┘ └────┘ └────┘  │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Other Home Screen Content]         │
└─────────────────────────────────────┘
```

## Event Card Design

Each event card shows:

```
┌──────────────────────────────┐
│     [Calendar Icon]           │  ← Image placeholder
│        140px height           │
├──────────────────────────────┤
│  [LIVE] or [UPCOMING]         │  ← Status badge
│                               │
│  Event Title Here             │  ← Title (2 lines max)
│  Can Span Two Lines           │
│                               │
│  📅 Mar 15, 2026             │  ← Date
│  🕐 9:00 AM - 5:00 PM        │  ← Time
│  📍 Convention Center, NY     │  ← Location
└──────────────────────────────┘
    75% of screen width
```

## Data Source

- Loads from: `src/data/eventsData.json`
- Uses existing event transformers
- Filters for UPCOMING and LIVE events only
- Sorts: LIVE first → then by date (earliest first)
- Limits to 10 events maximum

## User Interactions

1. **Scroll Horizontally**: Swipe left/right to browse events
2. **Tap Event Card**: Opens event detail screen
3. **Tap "View All"**: Navigates to full events list (AllEvents screen)

## Navigation Flow

```
Home Screen
    │
    ├─→ [Tap Event Card] → Event Detail Screen
    │
    └─→ [Tap "View All"] → All Events Screen
```

## Status Badges

- **LIVE** 🔴: Red badge - Event happening now
- **UPCOMING** 🟣: Purple badge - Future event

## Responsive Design

- **Phone**: Card width = 75% of screen
- **Tablet/iPad**: Card width = 75% of screen (better for multi-card view)
- **Card spacing**: 16px between cards
- **Smooth scrolling**: Snap to card edges

## Technical Details

### Props & Configuration

```typescript
// No props required - fully self-contained
<UpcomingEventsCarousel />
```

### Filtering Logic

```typescript
// Shows only UPCOMING and LIVE events
const filtered = allEvents.filter(
  event => event.status === 'UPCOMING' || event.status === 'LIVE',
);

// Sorts LIVE first, then by date
filtered.sort((a, b) => {
  if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
  if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
  return a.date.localeCompare(b.date);
});
```

### Performance

- **Memoized**: Event filtering uses `useMemo` to prevent re-renders
- **FlatList**: Optimized for horizontal scrolling
- **Lazy Loading**: Only renders visible cards + buffer
- **Snap Scrolling**: Smooth UX with snap-to-interval

## Theme Support

- ✅ **Light Mode**: Full support with appropriate colors
- ✅ **Dark Mode**: Adjusted colors for dark theme
- ✅ **RTL Support**: Works with right-to-left languages

## Error Handling

- If no events: Component returns null (doesn't show empty section)
- If data load fails: Logs error and shows empty array
- Graceful fallbacks for missing data

## Future Enhancements

Potential improvements:

1. **Pull to Refresh**: Refresh events by pulling down
2. **Skeleton Loading**: Show skeleton while loading
3. **Custom Images**: Replace placeholder with actual event images
4. **Registration CTA**: Add "Register" button on cards
5. **Filters**: Filter by category/tag
6. **Saved Events**: Show saved/favorited events
7. **Calendar Integration**: Add to calendar button
8. **Share Event**: Share event with others

## Testing

### Manual Testing Steps

1. **Open Home Screen**

   - Should see "Upcoming Events" section
   - Should show horizontal scrollable list

2. **Scroll Events**

   - Swipe left/right
   - Should snap to card edges smoothly

3. **Tap Event Card**

   - Should navigate to event detail screen
   - Should show correct event details

4. **Tap "View All"**

   - Should navigate to All Events screen

5. **No Events Scenario**

   - If no upcoming events, section should not appear

6. **Theme Toggle**
   - Switch between light/dark mode
   - Cards should adapt colors

### Edge Cases Tested

- ✅ Empty events list
- ✅ Single event
- ✅ Many events (10+ limit)
- ✅ LIVE events (show first)
- ✅ Past events (filtered out)
- ✅ Long event titles (truncated)
- ✅ Theme switching
- ✅ Navigation errors

## Files Modified/Created

### Created

- `src/components/events/UpcomingEventsCarousel.tsx` (New component)

### Modified

- `src/screens/HomeScreen.tsx` (Added carousel import and component)

### Dependencies Used

- Existing event data from `eventsData.json`
- Existing event transformers
- Existing event types and navigation
- Existing Icon component
- Existing theme system

## Summary

✅ **Completed**: Upcoming Events horizontal carousel on Home screen
✅ **Zero Breaking Changes**: Uses existing data and components
✅ **Seamless Integration**: Fits naturally in Home screen flow
✅ **Production Ready**: Error handling, theming, and navigation included

The feature provides users with immediate visibility of upcoming events without leaving the Home screen, improving discoverability and engagement! 🎉

## Screenshots

When you run the app, you'll see:

1. **Home Screen** with new events carousel
2. **Horizontal scrolling** with smooth animations
3. **Event cards** with status badges
4. **Tapping** navigates to event details

The carousel appears right after the home banner carousel for maximum visibility! 📅
