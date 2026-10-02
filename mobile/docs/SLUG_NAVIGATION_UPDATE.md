# Navigation Update: ID → Slug

## ✅ Changes Made

All event navigation now uses `slug` instead of `id` for event details, matching your API structure.

---

## 📝 Files Modified

### 1. **Navigation Types**

**File**: `src/types/navigation.ts`

**Before**:

```typescript
EventDetail: {
  sessionId: string;
}
```

**After**:

```typescript
EventDetail: {
  slug: string;
}
```

---

### 2. **EventsScreen**

**File**: `src/screens/EventsScreen.tsx`

**Before**:

```typescript
const handleEventPress = (eventId: string) => {
  navigation.navigate('EventDetail', { sessionId: eventId });
};
```

**After**:

```typescript
const handleEventPress = (slug: string) => {
  console.log('Event pressed with slug:', slug);
  navigation.navigate('EventDetail', { slug });
};
```

---

### 3. **AllEventsScreen**

**File**: `src/screens/AllEventsScreen.tsx`

**Before**:

```typescript
const handleEventPress = (event: any) => {
  navigation.navigate('EventDetail', { sessionId: event.id });
};
```

**After**:

```typescript
const handleEventPress = (event: any) => {
  navigation.navigate('EventDetail', { slug: event.slug });
};
```

---

### 4. **EventDetailScreen**

**File**: `src/screens/EventDetailScreen.tsx`

**Before**:

```typescript
const { sessionId } = route.params;

useEffect(() => {
  loadEventDetails();
}, [sessionId]);

const loadEventDetails = async () => {
  const response = await getEventById(sessionId);
  setEvent(response.event);
};
```

**After**:

```typescript
const { slug } = route.params;

useEffect(() => {
  loadEventDetails();
}, [slug]);

const loadEventDetails = async () => {
  const response = await getEventById(slug);
  setEvent(response.event);
};
```

---

### 5. **Events API Service**

**File**: `src/services/api/events.service.ts`

**Before**:

```typescript
/**
 * Get a single event by ID
 */
export const getEventById = async (id: string): Promise<any> => {
  const response = await apiClient<any>(`/events/${id}`);
  return response;
};
```

**After**:

```typescript
/**
 * Get a single event by slug
 */
export const getEventById = async (slug: string): Promise<any> => {
  console.log('@123 getEventById with slug:', slug);
  const response = await apiClient<any>(`/events/${slug}`);
  return response;
};
```

---

## 🗺️ API Endpoints

### Events List

```
GET http://localhost:3000/api/v1/events
```

Returns:

```json
{
  "events": [
    {
      "id": "cmm3iizp1001d12m25vfp4edg",
      "slug": "old-seminar-2021",  // ← Use this for details
      "title": "Old Seminar 2021",
      ...
    }
  ]
}
```

### Event Details (by slug)

```
GET http://localhost:3000/api/v1/events/{slug}
```

Example:

```
GET http://localhost:3000/api/v1/events/old-seminar-2021
```

Returns:

```json
{
  "event": {
    "id": "cmm3iizp1001d12m25vfp4edg",
    "slug": "old-seminar-2021",
    "title": "Old Seminar 2021",
    "description": "...",
    ...
  }
}
```

---

## 🔄 Navigation Flow

### Before (using ID)

```
EventsScreen
  ↓ User taps event
  Pass: { sessionId: "cmm3iizp1001d12m25vfp4edg" }
  ↓
EventDetailScreen
  ↓ API call
  GET /events/cmm3iizp1001d12m25vfp4edg
```

### After (using slug)

```
EventsScreen
  ↓ User taps event
  Pass: { slug: "old-seminar-2021" }
  ↓
EventDetailScreen
  ↓ API call
  GET /events/old-seminar-2021
```

---

## ✅ Component Chain

The slug flows correctly through the component chain:

1. **HorizontalEventsList** component:

   ```typescript
   // Already using slug ✅
   <EventCard event={item} onPress={() => handleEventPress(item.slug)} />
   ```

2. **EventsScreen**:

   ```typescript
   const handleEventPress = (slug: string) => {
     navigation.navigate('EventDetail', { slug });
   };
   ```

3. **AllEventsScreen**:

   ```typescript
   const handleEventPress = (event: any) => {
     navigation.navigate('EventDetail', { slug: event.slug });
   };
   ```

4. **EventDetailScreen**:

   ```typescript
   const { slug } = route.params;
   const response = await getEventById(slug);
   ```

5. **API Service**:
   ```typescript
   export const getEventById = async (slug: string) => {
     const response = await apiClient(`/events/${slug}`);
     return response;
   };
   ```

---

## 🧪 Testing

### Test Event Navigation

1. **From EventsScreen**:

   ```typescript
   // Tap any event card
   // Should navigate with slug: "old-seminar-2021"
   // API call: GET /events/old-seminar-2021
   ```

2. **From AllEventsScreen**:

   ```typescript
   // Select a date
   // Tap any event card
   // Should navigate with slug
   // API call: GET /events/{slug}
   ```

3. **Check Navigation Params**:

   ```typescript
   // In EventDetailScreen
   console.log('@123 route ', route);
   // Should show: { slug: "old-seminar-2021" }
   ```

4. **Verify API Call**:
   ```typescript
   // Check console logs
   '@123 getEventById with slug: old-seminar-2021';
   ```

---

## 🔍 Debugging

### Check if slug is being passed correctly:

**EventsScreen**:

```typescript
const handleEventPress = (slug: string) => {
  console.log('Event pressed with slug:', slug); // ← Check this
  navigation.navigate('EventDetail', { slug });
};
```

**AllEventsScreen**:

```typescript
const handleEventPress = (event: any) => {
  console.log('Event slug:', event.slug); // ← Add this
  navigation.navigate('EventDetail', { slug: event.slug });
};
```

**EventDetailScreen**:

```typescript
const { slug } = route.params;
console.log('Received slug:', slug); // ← Add this
```

**API Service**:

```typescript
export const getEventById = async (slug: string) => {
  console.log('getEventById with slug:', slug); // ← Already there
  const response = await apiClient(`/events/${slug}`);
  return response;
};
```

---

## 📊 Summary

| Aspect               | Before                      | After              |
| -------------------- | --------------------------- | ------------------ |
| **Navigation Param** | `sessionId`                 | `slug`             |
| **Param Type**       | ID string                   | Slug string        |
| **API Endpoint**     | `/events/{id}`              | `/events/{slug}`   |
| **Example Value**    | `cmm3iizp1001d12m25vfp4edg` | `old-seminar-2021` |
| **URL Friendly**     | ❌ No                       | ✅ Yes             |
| **Human Readable**   | ❌ No                       | ✅ Yes             |

---

## ✅ Benefits of Using Slug

1. **SEO Friendly**: Slugs are readable URLs
2. **User Friendly**: Easy to understand what the event is about
3. **API Standard**: Common practice for REST APIs
4. **Shareable**: URLs can be shared and understood
5. **Consistent**: Matches your backend API design

---

## 🎯 Ready to Test!

All changes are complete. The navigation now correctly uses `slug` throughout the entire flow:

```
User taps event
  ↓
Pass slug to EventDetail
  ↓
Receive slug in EventDetailScreen
  ↓
Call API with slug: GET /events/{slug}
  ↓
Display event details
```

Run your app and test event navigation! 🚀
