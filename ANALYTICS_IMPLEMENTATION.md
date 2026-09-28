# Firebase Analytics Implementation Guide

## Overview
Comprehensive analytics tracking for the Curiosity Booking app with user impressions and custom events. **No user-identifying data is tracked** — only behavior patterns, page views, and custom events.

## Architecture

### Core Files

#### 1. **analyticsService.ts** (`src/services/analyticsService.ts`)
Main service for all analytics operations. Exports:

- **Initialization**: `initAnalytics()`, `trackPageView()`, `trackScreenView()`
- **Authentication**: `trackUserSignIn()`, `trackUserSignOut()`, `setCurrentUser()`, `setUserProps()`
- **Booking Funnel**: `trackBookingInitiated()`, `trackProgramSelected()`, `trackTimeSlotSelected()`, `trackBookingDetailsSubmitted()`, `trackBookingReviewed()`, `trackBookingConfirmed()`, `trackBookingCancelled()`, `trackRescheduleInitiated()`
- **User Interactions**: `trackProfileViewed()`, `trackProfileUpdated()`, `trackKitViewed()`, `trackKitItemSelected()`, `trackNotificationReceived()`
- **Search & Filter**: `trackSearchPerformed()`, `trackFilterApplied()`
- **Forms**: `trackFormStarted()`, `trackFormSubmitted()`, `trackFormAbandoned()`
- **UI Interactions**: `trackButtonClick()`, `trackImpressionView()`
- **Error Tracking**: `trackError()`, `trackPerformanceMetric()`
- **Custom Events**: `trackCustomEvent()`, `trackFeatureUsed()`

#### 2. **useAnalytics.ts** (`src/hooks/useAnalytics.ts`)
React hooks for analytics:

- `useAnalyticsInit()` - Initializes Firebase Analytics on app load
- `usePageTracking()` - Automatically tracks page views based on route changes

#### 3. **firebase.ts** (`src/shared/firebase.ts`)
Updated to export `initializeAnalytics()` for async initialization support.

### Integration Points

#### App Initialization
- `main.tsx` - Initializes analytics before React render
- `App.tsx` - `<AnalyticsTracker>` component handles page view tracking

#### Authentication Context
- `AuthContext.tsx` - Tracks sign-in/sign-out events and sets user properties (school name, role)

#### Booking Funnel
- `BookPage.tsx` - Tracks booking initiation and visit type impressions
- *Ready for integration in*: `BookProgramsPage.tsx`, `BookTimePage.tsx`, `BookDetailsPage.tsx`, `ReviewPage.tsx`, `ConfirmedPage.tsx`

---

## Event Taxonomy

### **Impression Events** (User sees content)
```typescript
trackImpressionView(contentId, contentType, contentName)
// Example:
trackImpressionView('program_123', 'program', 'Biology Basics')
```
- Auto-collects: page URL, timestamp
- Use: Track what users see on each screen

### **Booking Funnel Events**
```typescript
trackBookingInitiated(programId, programName)     // Step 0
trackProgramSelected(programId, programName)      // Step 1
trackTimeSlotSelected(timeSlot, date)             // Step 2
trackBookingDetailsSubmitted(details)              // Step 3
trackBookingReviewed(bookingId)                    // Step 4
trackBookingConfirmed(bookingId, programId, total) // Step 5 (conversion)
```
- Funnel analysis: measure drop-off at each step
- `totalAmount` in confirmation enables revenue tracking

### **Engagement Events**
```typescript
trackProfileViewed()                       // Profile page impression
trackKitViewed()                           // Kit page impression
trackKitItemSelected(itemId, itemName)     // Item selection
trackSearchPerformed(query, resultCount)   // Search query & results
```

### **Form Events**
```typescript
trackFormStarted(formName)           // Form focus/load
trackFormSubmitted(formName, success) // Form submission
trackFormAbandoned(formName, percent) // User leaves mid-form
```

### **UI Events**
```typescript
trackButtonClick(buttonName, location)   // Any button click
trackFeatureUsed(featureName, metadata)  // Feature usage
```

### **System Events**
```typescript
trackError(errorName, message)                    // Client errors
trackPerformanceMetric(name, value, unit)         // Perf data
```

### **Custom Events**
```typescript
trackCustomEvent(eventName, eventData)  // For anything else
```

---

## Data Model: What Gets Sent

### Session Scope (Automatic)
```
- User agent & browser info
- Device type (mobile/tablet/desktop)
- Screen resolution
- Language preference
- Timezone
- Session ID
- Session duration
```

### User Scope (When Signed In)
```
user_id         (Firebase UID, not email)
school_name     (if provided)
user_role       (e.g., "admin", "user")
language        (UI language preference)
```

### Event Scope (Per Event)
```
timestamp
event_name
event_parameters (custom data, varies by event)
page_location (URL)
page_title
```

### NO Personal Data Tracked
✗ Email, phone, real name, school address, passwords
✗ Booking PII (student names, contact info)
✗ Financial data (payment methods, amounts beyond total spend)

---

## Firebase Console Access

### Location
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **mer-booking-tool**
3. Left sidebar → **Analytics**

### Key Views

#### **Real-time Dashboard**
- See live user activity
- Current active users by country/device

#### **Events**
- `page_view` - Page navigation
- `sign_in` - User authentication
- `booking_completed` - Conversion events
- All custom events listed with parameter breakdown

#### **Audiences**
- Users who completed booking ("Bookers")
- Users who visited kit page ("Kit Explorers")
- Users who abandoned forms ("Form Abandoners")

#### **Funnels** (Setup in Firebase)
```
1. booking_initiated
2. program_selected
3. time_slot_selected
4. booking_details_submitted
5. booking_completed
```
Measures drop-off percentage at each step.

#### **Retention**
- Day 1, 3, 7, 14, 30 return rates
- Cohort analysis by first session date

---

## Implementation Checklist

### Phase 1: Core (✅ Complete)
- [x] Analytics service initialization
- [x] Firebase Analytics integration
- [x] Page view tracking
- [x] Auth event tracking
- [x] Impression event framework

### Phase 2: Booking Funnel (Implement in These Files)
- [ ] `BookProgramsPage.tsx` - Add `trackProgramSelected()`
- [ ] `BookTimePage.tsx` - Add `trackTimeSlotSelected()`
- [ ] `BookDetailsPage.tsx` - Add `trackBookingDetailsSubmitted()`
- [ ] `ReviewPage.tsx` - Add `trackBookingReviewed()`
- [ ] `ConfirmedPage.tsx` - Add `trackBookingConfirmed()` with booking details

### Phase 3: User Interactions (Implement in These Files)
- [ ] `ProfilePage.tsx` - Add `trackProfileViewed()`, `trackProfileUpdated()`
- [ ] `KitPage.tsx` - Add `trackKitViewed()`, `trackKitItemSelected()`
- [ ] All form components - Add `trackFormStarted()`, `trackFormSubmitted()`, `trackFormAbandoned()`

### Phase 4: Advanced (Optional)
- [ ] Error boundary - Add `trackError()` for caught exceptions
- [ ] Performance monitoring - Add Core Web Vitals tracking
- [ ] Custom audiences in Firebase console
- [ ] Funnel analysis setup
- [ ] Attribution modeling

---

## Usage Examples

### Example 1: Track Program Selection
```typescript
import { trackProgramSelected } from '../services/analyticsService'

// In BookProgramsPage.tsx
const handleSelectProgram = (program: Program) => {
  trackProgramSelected(program.id, program.name)
  navigate('/book/time')
}
```

### Example 2: Track Profile Update
```typescript
import { trackProfileUpdated } from '../services/analyticsService'

// In ProfilePage.tsx
const handleSaveProfile = async (updates: { displayName?: string; schoolName?: string }) => {
  await updateProfile(updates)
  trackProfileUpdated(Object.keys(updates))
}
```

### Example 3: Track Form Abandonment
```typescript
import { trackFormAbandoned } from '../services/analyticsService'

// In BookingDetailsPage.tsx
useEffect(() => {
  return () => {
    if (!isSubmitted) {
      const percent = (filledFields / totalFields) * 100
      trackFormAbandoned('booking_details_form', percent)
    }
  }
}, [])
```

### Example 4: Custom Event
```typescript
import { trackCustomEvent } from '../services/analyticsService'

// Track a unique business metric
trackCustomEvent('kit_item_added_to_cart', {
  item_id: 'kit_123',
  item_category: 'equipment',
  quantity: 3,
  cart_total: 5
})
```

---

## Dashboard Queries

### "How many users completed a booking this week?"
1. Events → `booking_completed`
2. Filter by date range
3. View unique users

### "Where do users drop off in the booking funnel?"
1. Create Funnel
2. Add events in order: `booking_initiated` → `program_selected` → ... → `booking_completed`
3. View drop-off percentage at each step

### "Which programs are most viewed?"
1. Events → `view_item`
2. Breakdown by `item_name` parameter
3. Sort by event count (descending)

### "How long does an average session last?"
1. Analytics → Overview
2. Look at "Average session duration"
3. Cross-reference with user cohorts

---

## Privacy & Compliance

### GDPR Compliance
- ✅ No PII collected (no emails, names stored in Firebase)
- ✅ User can opt-out via analytics settings
- ✅ Data retention policy: 14 months (Firebase default)

### User Consent
- Currently no explicit consent needed for analytics
- If required, create consent context and skip `initAnalytics()` until user opts in:
  ```typescript
  export const initializeAnalytics = async () => {
    const hasConsent = localStorage.getItem('analytics-consent') === 'true'
    if (hasConsent && await isSupported()) {
      getAnalytics(app)
    }
  }
  ```

---

## Debugging

### Check if Analytics is Active
1. Open browser DevTools → Network
2. Look for requests to `google-analytics.com`
3. Filter for `POST` requests with `batch` in name

### Enable Debug Mode (Dev Only)
```typescript
// In analyticsService.ts
import { setAnalyticsCollectionEnabled } from 'firebase/analytics'

if (import.meta.env.DEV) {
  setAnalyticsCollectionEnabled(true)
}
```

### View Events in Console
```typescript
// Add temporary console log
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  console.log('📊 Analytics:', eventName, eventParams)
  if (!analytics) initAnalytics()
  if (analytics) logEvent(analytics, eventName, eventParams)
}
```

---

## Next Steps

1. **Implement Phase 2** - Add booking funnel tracking to `BookProgramsPage`, `BookTimePage`, `BookDetailsPage`, `ReviewPage`, `ConfirmedPage`
2. **Implement Phase 3** - Add user interaction tracking to profile, kit, and form components
3. **Set up Funnels** - In Firebase console, create booking funnel to track drop-off
4. **Create Audiences** - Segment users by behavior (e.g., "Booking Completers", "Kit Viewers")
5. **Monitor Dashboard** - Check weekly for key metrics and insights
