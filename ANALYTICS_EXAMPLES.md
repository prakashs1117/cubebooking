# Firebase Analytics - Implementation Examples

Complete, copy-paste ready examples for integrating analytics into your pages.

## BookTimePage.tsx

### Current Implementation
Check your current file at `src/components/booking/BookTimePage.tsx`

### Add Analytics
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { trackTimeSlotSelected, trackImpressionView } from '../../services/analyticsService'

export default function BookTimePage() {
  const navigate = useNavigate()
  const { slots, setSlots, programSelection } = useBookingStore()

  useEffect(() => {
    // Track that user saw the time selection screen
    trackImpressionView('time_selection_screen', 'booking_step', 'Select Time Slot')
  }, [])

  const handleSelectSlot = (slot: any) => {
    // Track which time slot was selected
    const dateString = format(slot.start, 'yyyy-MM-dd')
    const timeString = format(slot.start, 'HH:mm')
    trackTimeSlotSelected(`${dateString}_${timeString}`, dateString)
    
    setSlots([slot])
  }

  const handleContinue = () => {
    navigate('/book/details')
  }

  return (
    <BookingLayout
      title="Select a date & time"
      step={3}
      totalSteps={4}
      onBack="/book/programs"
      footer={
        <ContinueButton
          disabled={!slots.length}
          onClick={handleContinue}
        />
      }
    >
      {/* Your JSX */}
    </BookingLayout>
  )
}
```

---

## BookDetailsPage.tsx

### Add Analytics
```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookingLayout, { ContinueButton } from './BookingLayout'
import { useBookingStore } from '../../stores/bookingStore'
import { trackFormStarted, trackFormSubmitted, trackFormAbandoned, trackBookingDetailsSubmitted } from '../../services/analyticsService'

export default function BookDetailsPage() {
  const navigate = useNavigate()
  const { classDetails, setClassDetails } = useBookingStore()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formCompletion, setFormCompletion] = useState(0)

  // Track form start
  useEffect(() => {
    trackFormStarted('booking_details_form')
  }, [])

  // Track form completion percentage
  const updateFormCompletion = (grade?: string, studentCount?: number, schoolName?: string) => {
    const filled = [grade, studentCount, schoolName].filter(Boolean).length
    const percent = (filled / 3) * 100
    setFormCompletion(percent)
  }

  // Track if user leaves without submitting
  useEffect(() => {
    return () => {
      if (!isSubmitted && formCompletion > 0 && formCompletion < 100) {
        trackFormAbandoned('booking_details_form', formCompletion)
      }
    }
  }, [isSubmitted, formCompletion])

  const handleSubmit = async (grade: string, studentCount: number) => {
    try {
      setClassDetails({ grade, studentCount })
      
      // Track form submission with details
      trackBookingDetailsSubmitted({
        grade,
        student_count: studentCount,
        form_completed: true,
      })
      
      setIsSubmitted(true)
      trackFormSubmitted('booking_details_form', true)
      navigate('/book/review')
    } catch (error) {
      trackFormSubmitted('booking_details_form', false)
      // Handle error
    }
  }

  return (
    <BookingLayout
      title="Your class details"
      step={4}
      totalSteps={4}
      onBack="/book/time"
      footer={
        <ContinueButton
          disabled={!classDetails.grade || !classDetails.studentCount}
          onClick={() => handleSubmit(classDetails.grade, classDetails.studentCount)}
        />
      }
    >
      {/* Your form JSX */}
    </BookingLayout>
  )
}
```

---

## ReviewPage.tsx

### Add Analytics
```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '../../stores/bookingStore'
import { trackBookingReviewed, trackButtonClick } from '../../services/analyticsService'

export default function ReviewPage() {
  const navigate = useNavigate()
  const { slots, classDetails, programSelection } = useBookingStore()
  
  const bookingId = `booking_${Date.now()}`

  // Track when user reviews their booking
  useEffect(() => {
    trackBookingReviewed(bookingId)
  }, [])

  const handleConfirm = () => {
    trackButtonClick('confirm_booking', 'review_page')
    navigate('/book/confirmed')
  }

  const handleEdit = () => {
    trackButtonClick('edit_booking', 'review_page')
    navigate('/book/details')
  }

  return (
    <div>
      {/* Review summary of booking */}
      <button onClick={handleConfirm}>Confirm</button>
      <button onClick={handleEdit}>Edit</button>
    </div>
  )
}
```

---

## ProfilePage.tsx

### Add Analytics
```typescript
import { useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { trackProfileViewed, trackProfileUpdated, trackFormStarted, trackFormSubmitted } from '../../services/analyticsService'

export default function ProfilePage() {
  const { profile, updateProfile } = useAuthContext()
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Track when profile is viewed
  useEffect(() => {
    trackProfileViewed()
    trackFormStarted('profile_form')
  }, [])

  const handleUpdateProfile = async (fields: { displayName?: string; schoolName?: string }) => {
    try {
      await updateProfile(fields)
      
      // Track what fields were updated
      const updatedFields = Object.keys(fields).filter(key => fields[key as keyof typeof fields])
      trackProfileUpdated(updatedFields)
      trackFormSubmitted('profile_form', true)
      
      setIsSubmitted(true)
    } catch (error) {
      trackFormSubmitted('profile_form', false)
    }
  }

  return (
    <div>
      {/* Profile form JSX */}
      <button onClick={() => handleUpdateProfile({ displayName: 'John' })}>
        Save Profile
      </button>
    </div>
  )
}
```

---

## KitPage.tsx

### Add Analytics
```typescript
import { useEffect } from 'react'
import { trackKitViewed, trackKitItemSelected, trackImpressionView } from '../../services/analyticsService'

interface KitItem {
  id: string
  name: string
  category: string
}

export default function KitPage() {
  const kitItems: KitItem[] = [
    { id: 'kit_001', name: 'Microscope Set', category: 'equipment' },
    { id: 'kit_002', name: 'Chemistry Kit', category: 'supplies' },
    // ... more items
  ]

  // Track that user viewed the kit page
  useEffect(() => {
    trackKitViewed()
    
    // Track impression of each kit item visible
    kitItems.forEach(item => {
      trackImpressionView(item.id, 'kit_item', item.name)
    })
  }, [])

  const handleSelectItem = (item: KitItem) => {
    trackKitItemSelected(item.id, item.name)
    // Handle selection
  }

  return (
    <div>
      {kitItems.map(item => (
        <button key={item.id} onClick={() => handleSelectItem(item)}>
          {item.name}
        </button>
      ))}
    </div>
  )
}
```

---

## HomePage.tsx

### Add Analytics
```typescript
import { useEffect } from 'react'
import { trackImpressionView, trackButtonClick, trackFeatureUsed } from '../../services/analyticsService'

export default function HomePage() {
  // Track impressions of featured programs when page loads
  useEffect(() => {
    trackImpressionView('featured_programs', 'section', 'Featured Programs')
    trackImpressionView('upcoming_bookings', 'section', 'Upcoming Bookings')
    trackImpressionView('quick_stats', 'section', 'Quick Stats')
  }, [])

  const handleBookNew = () => {
    trackButtonClick('book_new_button', 'home_page')
    navigate('/book')
  }

  const handleViewPastBooking = (bookingId: string) => {
    trackFeatureUsed('view_past_booking', { booking_id: bookingId })
    navigate(`/bookings/${bookingId}`)
  }

  return (
    <div>
      {/* Home page content */}
      <button onClick={handleBookNew}>Book a Visit</button>
    </div>
  )
}
```

---

## BookingsPage.tsx (My Bookings)

### Add Analytics
```typescript
import { useEffect, useState } from 'react'
import { trackImpressionView, trackFilterApplied, trackSearchPerformed } from '../../services/analyticsService'

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    trackImpressionView('bookings_list', 'page', 'My Bookings')
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const results = performSearch(query)
    trackSearchPerformed(query, results.length)
  }

  const handleFilterChange = (filterValue: string) => {
    setFilter(filterValue)
    trackFilterApplied('booking_status', filterValue)
  }

  return (
    <div>
      <input 
        placeholder="Search bookings..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      <select onChange={(e) => handleFilterChange(e.target.value)}>
        <option value="all">All</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
      </select>
    </div>
  )
}
```

---

## Error Handling

### Global Error Tracking
```typescript
// In main.tsx or App.tsx
import { trackError } from '../services/analyticsService'

window.addEventListener('error', (event) => {
  trackError(event.error?.name || 'UnknownError', event.error?.message)
})

// For async errors
window.addEventListener('unhandledrejection', (event) => {
  trackError('UnhandledPromiseRejection', event.reason?.message)
})
```

### Component Error Boundary
```typescript
import { trackError } from '../services/analyticsService'

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    trackError(error.name, error.message)
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    return this.props.children
  }
}

export default ErrorBoundary
```

---

## Copy-Paste Snippets

### Quick Button Click
```typescript
<button onClick={() => {
  trackButtonClick('action_name', 'location')
  handleAction()
}}>
  Action
</button>
```

### Quick Form Start
```typescript
useEffect(() => {
  trackFormStarted('form_name')
}, [])
```

### Quick Form Submit
```typescript
const handleSubmit = async (data) => {
  const success = await submit(data)
  trackFormSubmitted('form_name', success)
  if (success) navigate('/next')
}
```

### Quick Search
```typescript
const handleSearch = (query: string) => {
  const results = search(query)
  trackSearchPerformed(query, results.length)
}
```

### Quick Selection
```typescript
const handleSelect = (item: Item) => {
  trackImpressionView(item.id, 'item_type', item.name)
  setSelected(item)
}
```

---

## Firebase Console Verification

After implementing, verify events appear:

1. **Go to Firebase Console** → Analytics → Events
2. **Look for your event** (e.g., `booking_completed`)
3. **Check parameters** show expected values
4. **Click event** to see user breakdown

```
Example: If you implemented booking completion tracking:
- Event: booking_completed
- Count: 5 events (if 5 bookings completed)
- Top parameter: program_id = "cube" (3), "lab" (2)
```

---

## Performance Monitoring

Optional: Track page load performance
```typescript
useEffect(() => {
  if (window.performance) {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    
    trackPerformanceMetric('page_load_time', pageLoadTime, 'ms')
    trackPerformanceMetric('time_to_interactive', pageLoadTime * 0.8, 'ms')
  }
}, [])
```

---

## Testing Checklist

- [ ] Button clicks tracked in console (DevTools)
- [ ] Page views show in Firebase Analytics
- [ ] Sign in/out events appear in Firebase
- [ ] Booking completion shows as conversion
- [ ] Form abandonment tracked when leaving page
- [ ] All custom events have parameters
- [ ] No sensitive data in event parameters
- [ ] Events visible in Firebase console after 15-30 min
