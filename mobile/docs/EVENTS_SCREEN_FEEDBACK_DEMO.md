# Events Screen - Feedback Modal Demo

## Overview

Added a demo button in the EventsScreen to showcase the EventFeedbackModal component for testing and demonstration purposes.

## What Was Added

### 1. Demo Button

**Location**: Below the Upcoming Events section

**Visual**:

```
┌──────────────────────────────────────┐
│                                      │
│     [Upcoming Events List]           │
│                                      │
├──────────────────────────────────────┤
│                                      │
│    ⭐ Demo: Event Feedback           │
│                                      │
└──────────────────────────────────────┘
```

**Features**:

- Star icon + text label
- Purple background (primary brand color)
- Shadow effect for depth
- Centered in section
- Easy to tap

### 2. Modal Integration

**Sample Data**:

```typescript
<EventFeedbackModal
  visible={showFeedbackModal}
  onClose={() => setShowFeedbackModal(false)}
  eventTitle="Tech Summit 2026"
  eventId="demo-event-123"
  onSubmit={handleFeedbackSubmit}
/>
```

### 3. Feedback Handler

```typescript
const handleFeedbackSubmit = feedback => {
  console.log('Feedback submitted:', feedback);
  // Output:
  // {
  //   rating: 5,
  //   comment: "Great event!",
  //   eventId: "demo-event-123"
  // }
};
```

## Code Changes

### Imports Added

```typescript
import { useState } from 'react';
import EventFeedbackModal from '@components/events/EventFeedbackModal';
import Icon from '@components/icons/Icon';
```

### State Added

```typescript
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
```

### UI Changes

**Demo Button Section**:

```tsx
<View style={styles.demoSection}>
  <TouchableOpacity
    style={[
      styles.demoButton,
      { backgroundColor: theme.button.primary.background },
    ]}
    onPress={() => setShowFeedbackModal(true)}
    activeOpacity={0.8}
  >
    <Icon name="star" size={20} color={theme.button.primary.text} />
    <Text style={styles.demoButtonText}>Demo: Event Feedback</Text>
  </TouchableOpacity>
</View>
```

### Styles Added

```typescript
demoSection: {
  paddingHorizontal: 20,
  paddingVertical: 32,
  alignItems: 'center',
}

demoButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  gap: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
}

demoButtonText: {
  fontSize: 16,
  fontWeight: '600',
}
```

## How to Test

### Step 1: Navigate to Events Screen

Open the app and go to the Events tab.

### Step 2: Scroll Down

Scroll past the upcoming events list.

### Step 3: Tap Demo Button

Tap the "Demo: Event Feedback" button.

### Step 4: Fill Feedback

1. Tap stars to rate (1-5)
2. Optionally add a comment
3. Tap "Submit Feedback"

### Step 5: See Result

- Thank you screen appears
- Modal auto-closes after 500ms
- Check console for logged feedback data

## Testing Scenarios

### Test 1: Quick Feedback

```
1. Tap demo button
2. Tap 5 stars
3. Tap Submit
4. See thank you screen
5. Modal closes

Time: < 5 seconds
```

### Test 2: Detailed Feedback

```
1. Tap demo button
2. Tap 4 stars
3. Type comment: "Great event, learned a lot!"
4. Tap Submit
5. See thank you screen
6. Check console output

Time: ~ 30 seconds
```

### Test 3: Close Without Submitting

```
1. Tap demo button
2. Tap 3 stars
3. Type partial comment
4. Tap X button (top right)
5. Modal closes
6. No data submitted

Result: Clean cancellation
```

### Test 4: Validation

```
1. Tap demo button
2. Don't select any stars
3. Try to tap Submit button
4. Button is disabled (gray)
5. Can't submit without rating

Result: Validation works
```

## Console Output Example

When feedback is submitted, you'll see:

```javascript
Feedback submitted: {
  rating: 5,
  comment: "Excellent event! The speakers were amazing and I learned so much about AI.",
  eventId: "demo-event-123"
}
```

## Removing Demo Button

To remove the demo button after testing:

1. Delete the demo section JSX:

```tsx
// Remove this:
<View style={styles.demoSection}>
  <TouchableOpacity ... >
    ...
  </TouchableOpacity>
</View>
```

2. Remove the modal:

```tsx
// Remove this:
<EventFeedbackModal ... />
```

3. Remove state:

```typescript
// Remove this:
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
```

4. Remove handler:

```typescript
// Remove this:
const handleFeedbackSubmit = (feedback) => { ... };
```

5. Remove styles:

```typescript
// Remove these from styles:
demoSection: { ... }
demoButton: { ... }
demoButtonText: { ... }
```

## Integration in Production

For production use, add the feedback option in:

### 1. Event Detail Screen

```tsx
<TouchableOpacity onPress={() => setShowFeedback(true)}>
  <Icon name="star" />
  <Text>Give Feedback</Text>
</TouchableOpacity>
```

### 2. Completed Events List

```tsx
{
  event.status === 'COMPLETED' && (
    <Button onPress={() => openFeedback(event)}>Rate Event</Button>
  );
}
```

### 3. Post-Event Notification

```tsx
// Show feedback prompt 1 day after event ends
<Notification
  title="How was the event?"
  action={() => showFeedbackModal(eventId)}
/>
```

## API Integration

Replace console.log with actual API call:

```typescript
const handleFeedbackSubmit = async feedback => {
  try {
    const response = await fetch('/api/events/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedback),
    });

    if (response.ok) {
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Thank you!',
        text2: 'Your feedback has been submitted.',
      });
    } else {
      throw new Error('Failed to submit feedback');
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Show error toast
    Toast.show({
      type: 'error',
      text1: 'Oops!',
      text2: 'Failed to submit feedback. Please try again.',
    });
  }
};
```

## Files Modified

### Updated Files

1. ✅ **src/screens/EventsScreen.tsx**
   - Added import for EventFeedbackModal
   - Added import for Icon
   - Added useState for modal visibility
   - Added handleFeedbackSubmit handler
   - Added demo button section
   - Added EventFeedbackModal component
   - Added demo button styles

## Benefits

✅ **Easy Testing** - Demo button always accessible
✅ **Quick Demo** - Show clients/stakeholders the feature
✅ **No Navigation** - Test without going through event flow
✅ **Console Logging** - See feedback data structure
✅ **Theme Testing** - Works with dark/light themes
✅ **Full Features** - All modal features testable

## Next Steps

1. **Test the modal** - Use the demo button
2. **Integrate API** - Connect to backend
3. **Add to events** - Show for completed events
4. **Remove demo** - Delete demo button when ready
5. **Monitor feedback** - Track user responses

---

**Status**: ✅ DEMO READY

**Location**: Events Screen
**Purpose**: Test and demonstrate feedback modal
**Last Updated**: March 5, 2026
**Version**: Demo 1.0.0
