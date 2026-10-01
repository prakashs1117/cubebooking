# Firebase Analytics - Quick Reference

## Import Statement
```typescript
import { trackXXX } from '../services/analyticsService'
```

## Common Use Cases

### 1. Page/Screen Views (Automatic ✅)
Already tracked via `usePageTracking()` hook. No action needed.

### 2. Button Clicks
```typescript
import { trackButtonClick } from '../services/analyticsService'

<button onClick={() => {
  trackButtonClick('submit_booking', 'booking_form')
  handleSubmit()
}}>
  Submit
</button>
```

### 3. Selection/Choice Events
```typescript
import { trackImpressionView } from '../services/analyticsService'

const handleSelectOption = (optionId: string, optionName: string) => {
  trackImpressionView(optionId, 'option_type', optionName)
  setSelectedOption(optionId)
}
```

### 4. Form Events
```typescript
import { trackFormStarted, trackFormSubmitted, trackFormAbandoned } from '../services/analyticsService'

// When form loads/focuses
useEffect(() => {
  trackFormStarted('profile_form')
}, [])

// On successful submission
const handleSubmit = async (data) => {
  const success = await updateProfile(data)
  trackFormSubmitted('profile_form', success)
}

// On component unmount if not submitted
useEffect(() => {
  return () => {
    if (!isSubmitted) {
      trackFormAbandoned('profile_form', 75) // 75% completion
    }
  }
}, [])
```

### 5. Search
```typescript
import { trackSearchPerformed } from '../services/analyticsService'

const handleSearch = (query: string) => {
  const results = performSearch(query)
  trackSearchPerformed(query, results.length)
}
```

### 6. Filters
```typescript
import { trackFilterApplied } from '../services/analyticsService'

const handleApplyFilter = (filterType: string, value: string) => {
  trackFilterApplied(filterType, value)
  applyFilter(filterType, value)
}
```

### 7. Custom User Properties (At Sign-In)
```typescript
import { setUserProps } from '../services/analyticsService'

// In AuthContext or after user profile loads
setUserProps({
  school_name: user.schoolName,
  user_role: user.role,
  signup_date: user.createdAt,
})
```

### 8. Custom Events
```typescript
import { trackCustomEvent } from '../services/analyticsService'

trackCustomEvent('video_watched', {
  video_id: '123',
  video_title: 'Lab Tour',
  duration_seconds: 45,
})
```

## Booking Funnel (Exact Implementation)

### 1. BookPage.tsx
```typescript
useEffect(() => {
  trackBookingInitiated('booking_start')
}, [])
```

### 2. BookProgramsPage.tsx
```typescript
const handleSelectProgram = (programId) => {
  trackProgramSelected(programId, programName)
  setSelection(programId)
}
```

### 3. BookTimePage.tsx
```typescript
const handleSelectSlot = (slot) => {
  trackTimeSlotSelected(slot.id, slot.date)
  setSlot(slot)
}
```

### 4. BookDetailsPage.tsx
```typescript
const handleSubmit = (details) => {
  trackBookingDetailsSubmitted({
    grade: details.grade,
    student_count: details.studentCount,
  })
  submitDetails(details)
}
```

### 5. ReviewPage.tsx
```typescript
useEffect(() => {
  trackBookingReviewed(bookingId)
}, [bookingId])
```

### 6. ConfirmedPage.tsx ✅ (Already Implemented)
```typescript
useEffect(() => {
  trackBookingConfirmed(bookingId, programId)
}, [slots, programSelection])
```

## Event Parameters Cheat Sheet

| Event | Required Params | Optional Params |
|-------|-----------------|-----------------|
| `view_item` | `item_id`, `item_category` | `item_name` |
| `program_selected` | `program_id` | `program_name` |
| `time_slot_selected` | `time_slot` | `date` |
| `booking_details_submitted` | *any* | |
| `booking_reviewed` | `booking_id` | |
| `booking_completed` | `booking_id`, `program_id` | `value` (amount) |
| `form_started` | `form_name` | |
| `form_submitted` | `form_name`, `form_success` | |
| `form_abandoned` | `form_name` | `completion_percentage` |
| `button_click` | `button_name` | `button_location` |
| `profile_updated` | `fields_updated` | |
| `search` | `search_term` | `number_of_results` |
| `filter_applied` | `filter_type`, `filter_value` | |

## Testing

### Check if Analytics is Working (DevTools)
1. Open DevTools → Network tab
2. Filter for `google-analytics` or `analytics`
3. Make an action (click button, navigate page)
4. Look for POST requests to `analytics.google.com` with event data

### Console Debugging
```typescript
// Temporarily add to analyticsService.ts
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  console.log('📊 Analytics Event:', {
    name: eventName,
    params: eventParams,
    timestamp: new Date().toISOString(),
  })
  // ... rest of implementation
}
```

## Firebase Console

Check your events are showing up:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **mer-booking-tool** project
3. Left sidebar → **Analytics** → **Events**
4. Look for your custom event name (e.g., `program_selected`, `booking_completed`)
5. Click to see parameters and user breakdown

## Common Gotchas

### ❌ Don't
```typescript
// Don't track the same event multiple times
const handleClick = () => {
  trackButtonClick('submit')
  trackButtonClick('submit') // ❌ Duplicate
  handleSubmit()
}
```

### ✅ Do
```typescript
// Track once per action
const handleClick = () => {
  trackButtonClick('submit')
  handleSubmit()
}
```

### ❌ Don't
```typescript
// Don't track PII
trackCustomEvent('user_data', {
  email: user.email, // ❌ No PII!
  phone: user.phone, // ❌ No PII!
})
```

### ✅ Do
```typescript
// Track behavior, not identity
trackCustomEvent('user_action', {
  action_type: 'profile_update',
  fields_updated: 5,
})
```

## Parameter Size Limits

- Event name: max 40 characters
- Parameter name: max 40 characters
- Parameter value: max 100 characters
- Max 25 parameters per event
- Max 500 unique event names

Keep parameter values concise:
```typescript
✅ trackCustomEvent('booking_flow_step', { step: 'time_selection' })
❌ trackCustomEvent('user_advanced_to_time_slot_selection_screen_from_program_page', {...})
```

## Questions?

See full documentation: `ANALYTICS_IMPLEMENTATION.md`
