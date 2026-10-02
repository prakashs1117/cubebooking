# Horizontal Events List - Usage Guide

## Overview

The `HorizontalEventsList` component is a reusable component that displays events in a horizontal scrolling list. It can be easily added to any screen in the app.

## Features

✅ Horizontal scrolling with snap-to-card
✅ Customizable header with "See All" button
✅ Empty state handling
✅ Dark/Light theme support
✅ Fully localized
✅ Easy to integrate anywhere

## Basic Usage

### 1. Import the Component

```typescript
import { HorizontalEventsList } from '@components/events';
import {
  transformAPIEventsToCards,
  getUpcomingEvents,
} from '@utils/eventTransformers';
import eventsData from '@/data/eventsData.json';
```

### 2. Transform Data

```typescript
const eventCards = useMemo(() => {
  const allCards = transformAPIEventsToCards(eventsData);
  return getUpcomingEvents(allCards);
}, []);
```

### 3. Add to Your Screen

```typescript
<HorizontalEventsList
  title="Upcoming Events"
  events={eventCards}
  onEventPress={eventId => console.log('Event:', eventId)}
  onSeeAllPress={() => console.log('See All')}
  showHeader={true}
  showSeeAll={true}
/>
```

## Example: Adding to HomeScreen

```typescript
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { HorizontalEventsList } from '@components/events';
import {
  transformAPIEventsToCards,
  getUpcomingEvents,
} from '@utils/eventTransformers';
import eventsData from '@/data/eventsData.json';

const HomeScreen: React.FC = () => {
  // Transform events data
  const upcomingEvents = useMemo(() => {
    const allCards = transformAPIEventsToCards(eventsData);
    return getUpcomingEvents(allCards).slice(0, 5); // Show only 5 events
  }, []);

  return (
    <ScrollView>
      {/* Your existing home content */}

      {/* Add Events Section */}
      <HorizontalEventsList
        title="Upcoming Events"
        events={upcomingEvents}
        onEventPress={eventId => {
          // Navigate to event details
          // navigation.navigate('EventDetails', { eventId });
        }}
        onSeeAllPress={() => {
          // Navigate to events screen
          // navigation.navigate('Events');
        }}
      />

      {/* More content */}
    </ScrollView>
  );
};
```

## Props

| Prop             | Type                      | Required | Default               | Description                         |
| ---------------- | ------------------------- | -------- | --------------------- | ----------------------------------- |
| `title`          | string                    | No       | "Upcoming Events"     | Section title                       |
| `events`         | EventCardData[]           | Yes      | -                     | Array of event data                 |
| `onEventPress`   | (eventId: string) => void | No       | -                     | Callback when event card is pressed |
| `onSeeAllPress`  | () => void                | No       | -                     | Callback when "See All" is pressed  |
| `showHeader`     | boolean                   | No       | true                  | Show/hide section header            |
| `showSeeAll`     | boolean                   | No       | true                  | Show/hide "See All" button          |
| `emptyMessage`   | string                    | No       | "No events available" | Message when no events              |
| `containerStyle` | ViewStyle                 | No       | -                     | Custom container styles             |

## Data Structure

### Input: API Event Data

The component expects data from `eventsData.json` which follows this structure:

```json
{
  "events": [
    {
      "id": "event-123",
      "title": "Tech Summit 2026",
      "description": "...",
      "startTime": "2026-06-15T09:00:00.000Z",
      "endTime": "2026-06-17T18:00:00.000Z",
      "venue": "Tech Convention Center",
      "status": "PUBLISHED",
      "venueModel": {
        "city": "San Francisco",
        "state": "CA"
      }
    }
  ]
}
```

### Output: EventCardData

The transformer converts API data to:

```typescript
interface EventCardData {
  id: string;
  title: string;
  imageUrl?: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL';
  date: string; // "Jun 15, 2026"
  time: string; // "09:00 AM"
  location: string; // "San Francisco, CA"
}
```

## Filter Functions

```typescript
// Get only upcoming events
const upcoming = getUpcomingEvents(allEvents);

// Filter by specific status
const liveEvents = filterEventsByStatus(allEvents, 'LIVE');
const pastEvents = filterEventsByStatus(allEvents, 'COMPLETED');
```

## Customization Examples

### Minimal Version (No Header)

```typescript
<HorizontalEventsList events={eventCards} showHeader={false} />
```

### Custom Empty Message

```typescript
<HorizontalEventsList
  events={eventCards}
  emptyMessage="No events scheduled at the moment"
/>
```

### With Custom Styling

```typescript
<HorizontalEventsList
  events={eventCards}
  containerStyle={{ marginTop: 20, marginBottom: 20 }}
/>
```

## Multiple Sections

You can easily show multiple event sections:

```typescript
<ScrollView>
  {/* Upcoming Events */}
  <HorizontalEventsList title="Upcoming Events" events={upcomingEvents} />

  {/* Live Events */}
  <HorizontalEventsList
    title="Happening Now"
    events={liveEvents}
    containerStyle={{ marginTop: 20 }}
  />

  {/* Past Events */}
  <HorizontalEventsList
    title="Past Events"
    events={pastEvents}
    containerStyle={{ marginTop: 20 }}
  />
</ScrollView>
```

## Status Badge Colors

- 🔴 **LIVE** - Red
- 🟣 **UPCOMING** - Purple (Merck Purple)
- ⚫ **COMPLETED** - Gray
- 🔴 **CANCELLED** - Red
- 🟡 **FULL** - Orange/Warning

## Data Location

Event data is stored in: `src/data/eventsData.json`

You can update this file or replace it with API calls in the future.

## Future Enhancements

- [ ] Connect to real API endpoint
- [ ] Add image support (bannerPath)
- [ ] Add loading skeleton screens
- [ ] Add event details navigation
- [ ] Add event registration functionality
