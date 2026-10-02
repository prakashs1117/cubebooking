# Event Slug Navigation Fix Summary

## Issue Description

The EventDetail screen was receiving `undefined` in the URL when navigating from the events list:

```
http://localhost:3000/api/v1/events/undefined
```

This was happening because the navigation parameter was incorrectly named.

---

## Root Cause

In **EventsListScreen.tsx** (line 143), the navigation was passing `sessionId` instead of `slug`:

### ❌ Before (Incorrect)

```typescript
const handleEventPress = (eventId: string) => {
  console.log('Event pressed:1222', eventId);
  navigation.navigate('EventDetail', { sessionId: eventId }); // ❌ Wrong parameter name
};
```

---

## Fix Applied

### ✅ After (Fixed)

```typescript
const handleEventPress = (slug: string) => {
  console.log('Event pressed with slug:', slug);
  navigation.navigate('EventDetail', { slug }); // ✅ Correct parameter name
};
```

---

## Files Checked & Status

| File                         | Location                 | Status       | Notes                         |
| ---------------------------- | ------------------------ | ------------ | ----------------------------- |
| **EventsListScreen.tsx**     | `src/screens/`           | ✅ **FIXED** | Changed `sessionId` to `slug` |
| **EventsScreen.tsx**         | `src/screens/`           | ✅ Correct   | Already using `slug`          |
| **AllEventsScreen.tsx**      | `src/screens/`           | ✅ Correct   | Already using `slug`          |
| **HorizontalEventsList.tsx** | `src/components/events/` | ✅ Correct   | Passes `slug` correctly       |
| **EventDetailScreen.tsx**    | `src/screens/`           | ✅ Correct   | Expects `slug` parameter      |
| **EventCard.tsx**            | `src/components/events/` | ✅ Correct   | Has `slug` in data            |

---

## Navigation Type Definition

The navigation type is correctly defined in **types/navigation.ts**:

```typescript
export type EventsStackParamList = {
  EventsList: undefined;
  AllEvents: undefined;
  EventDetail: { slug: string }; // ✅ Correctly expects slug
  DatePickerExample: undefined;
};
```

---

## API Service

The API service in **services/api/events.service.ts** correctly uses the slug:

```typescript
export const getEventById = async (slug: string): Promise<any> => {
  console.log('@123 getEventById with slug:', slug);
  try {
    const response = await apiClient<any>(`/events/${slug}`);
    return response;
  } catch (error) {
    console.error(`Error fetching event ${slug}:`, error);
    throw error;
  }
};
```

---

## Event Data Structure

All events have a `slug` field in their data structure:

```typescript
export interface EventCardData {
  id: string;
  title: string;
  slug: string; // ✅ Slug is present in all event objects
  imageUrl?: string;
  status?: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL';
  date: string;
  time: string;
  location: string;
  onDetailsPress?: () => void;
}
```

---

## Testing Checklist

After this fix, test the following scenarios:

- [ ] Click on an event card from **EventsScreen** (Home Events tab)
- [ ] Click on an event from **AllEventsScreen** (See All Events)
- [ ] Click on an event from **EventsListScreen** (Full events list with search/filter)
- [ ] Verify the API URL is correct: `http://localhost:3000/api/v1/events/{slug}`
- [ ] Verify the event detail page loads correctly with all data
- [ ] Check console logs show correct slug value

---

## Expected API URL

### ✅ Correct URL (After Fix)

```
http://localhost:3000/api/v1/events/annual-medical-conference-2026
```

### ❌ Wrong URL (Before Fix)

```
http://localhost:3000/api/v1/events/undefined
```

---

## How Event Navigation Works

### Flow Diagram

```
User Clicks Event Card
        ↓
EventCard component
        ↓
onPress={() => handleEventPress(event.slug)}
        ↓
handleEventPress(slug: string)
        ↓
navigation.navigate('EventDetail', { slug })
        ↓
EventDetailScreen receives route.params.slug
        ↓
getEventById(slug) API call
        ↓
API: GET /api/v1/events/{slug}
```

---

## Common Pitfalls to Avoid

1. **❌ Using `id` instead of `slug`**

   ```typescript
   navigation.navigate('EventDetail', { id: event.id }); // ❌ Wrong
   ```

2. **❌ Using `sessionId` or other names**

   ```typescript
   navigation.navigate('EventDetail', { sessionId: event.slug }); // ❌ Wrong
   ```

3. **❌ Not passing any parameter**

   ```typescript
   navigation.navigate('EventDetail'); // ❌ Wrong - missing slug
   ```

4. **✅ Correct way**
   ```typescript
   navigation.navigate('EventDetail', { slug: event.slug }); // ✅ Correct
   ```

---

## Debugging Tips

### 1. Check Console Logs

Look for these log messages:

```typescript
// In screen file
console.log('Event pressed with slug:', slug);

// In API service
console.log('@123 getEventById with slug:', slug);
```

### 2. Check Route Parameters

In EventDetailScreen, add this debug log:

```typescript
console.log('Route params:', route.params);
console.log('Slug value:', route.params.slug);
```

### 3. Check Event Data

Ensure all event objects have a `slug` field:

```typescript
console.log('Event data:', JSON.stringify(event, null, 2));
```

### 4. Check Navigation State

```typescript
console.log('Navigation state:', navigation.getState());
```

---

## Additional Notes

- The `slug` is a URL-friendly identifier (e.g., `annual-conference-2026`)
- The `id` is typically a UUID or database ID
- The API requires the `slug` for fetching event details, not the `id`
- All event cards correctly include both `id` and `slug` in their data

---

## Related Files

### Core Files

- ✅ `src/screens/EventsListScreen.tsx` - Fixed file
- ✅ `src/screens/EventsScreen.tsx` - Already correct
- ✅ `src/screens/AllEventsScreen.tsx` - Already correct
- ✅ `src/screens/EventDetailScreen.tsx` - Receives slug parameter
- ✅ `src/components/events/EventCard.tsx` - Has slug in data
- ✅ `src/components/events/HorizontalEventsList.tsx` - Passes slug correctly

### Supporting Files

- ✅ `src/types/navigation.ts` - Type definitions
- ✅ `src/services/api/events.service.ts` - API service
- ✅ `src/utils/eventTransformers.ts` - Data transformation

---

## Fix Verification

To verify the fix is working:

1. **Start the app** and navigate to Events screen
2. **Click on any event** card
3. **Check the console logs** - should show:
   ```
   Event pressed with slug: annual-conference-2026
   @123 getEventById with slug: annual-conference-2026
   ```
4. **Check the API network request** - should be:
   ```
   GET http://localhost:3000/api/v1/events/annual-conference-2026
   ```
5. **Verify the event detail page loads** with correct data

---

## Summary

✅ **Issue Fixed**: Changed `sessionId` to `slug` in EventsListScreen.tsx
✅ **All Navigation Points Verified**: Consistent use of `slug` parameter
✅ **Type Safety**: Navigation types correctly enforce `slug` parameter
✅ **API Integration**: API service correctly uses slug in endpoint

The undefined slug issue is now resolved, and all event navigation should work correctly!

---

**Fixed Date**: 2026-03-04
**Fixed By**: Development Team
