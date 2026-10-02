# Event Feedback Modal - Survey Component

## Overview

Created a beautiful full-height modal for collecting event feedback with:

- ✅ 5-star rating system with interactive animations
- ✅ Optional comment field (500 characters max)
- ✅ Modern, clean design
- ✅ Close button at top right
- ✅ Thank you screen after submission
- ✅ Smooth animations
- ✅ Keyboard handling
- ✅ Form validation

## Visual Design

### Feedback Form Layout

```
┌──────────────────────────────────────┐
│ Event Feedback               [X]     │
├──────────────────────────────────────┤
│                                      │
│        YOUR FEEDBACK FOR             │
│     Tech Summit 2026                 │
│                                      │
│  How would you rate this event?      │
│  ┌──────────────────────────────┐   │
│  │  ⭐ ⭐ ⭐ ⭐ ⭐               │   │
│  │                              │   │
│  │        Excellent             │   │
│  │      5 out of 5 stars        │   │
│  └──────────────────────────────┘   │
│                                      │
│  Share your experience (Optional)    │
│  ┌──────────────────────────────┐   │
│  │ Tell us what you liked...    │   │
│  │                              │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│          150 / 500                   │
│                                      │
│     [Submit Feedback]                │
│                                      │
└──────────────────────────────────────┘
```

### Thank You Screen

```
┌──────────────────────────────────────┐
│ Event Feedback               [X]     │
├──────────────────────────────────────┤
│                                      │
│                                      │
│           ✓                          │
│        (Green checkmark)             │
│                                      │
│        Thank You!                    │
│                                      │
│  Your feedback has been submitted    │
│  successfully. We appreciate you     │
│  taking the time to share your       │
│  experience.                         │
│                                      │
└──────────────────────────────────────┘
```

## Component API

### Props

```typescript
interface EventFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  eventId: string;
  onSubmit: (feedback: {
    rating: number;
    comment: string;
    eventId: string;
  }) => void;
}
```

### Usage Example

```tsx
import EventFeedbackModal from '@components/events/EventFeedbackModal';

const MyComponent = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFeedbackSubmit = feedback => {
    console.log('Feedback received:', feedback);
    // Send to API
    // API.submitEventFeedback(feedback);
  };

  return (
    <>
      <Button onPress={() => setShowFeedback(true)}>Give Feedback</Button>

      <EventFeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        eventTitle="Tech Summit 2026"
        eventId="event-123"
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};
```

## Key Features

### 1. Star Rating System

**Interactive States**:

- **Default**: Gray outlined stars
- **Hovered/Pressed**: Yellow filled stars
- **Selected**: Yellow filled stars (persistent)

**Rating Labels**:

```typescript
1 star  → "Poor" (Red #e74c3c)
2 stars → "Fair" (Orange #e67e22)
3 stars → "Good" (Yellow #f39c12)
4 stars → "Very Good" (Green #27ae60)
5 stars → "Excellent" (Bright Green #2ecc71)
```

**Visual Feedback**:

- Large stars (40px)
- Smooth color transitions
- Shows "X out of 5 stars" below
- Color-coded rating label

### 2. Comment Field

**Features**:

- Multiline text input
- 500 character limit
- Character counter
- Optional field
- Auto-growing height
- Keyboard-aware scrolling

**Styling**:

- Card background
- Rounded corners
- Border highlights on focus (purple)
- Placeholder text
- Minimum height: 120px

### 3. Submit Button

**States**:

- **Disabled**: Gray, no shadow (when rating = 0)
- **Enabled**: Purple, shadow, hover effect
- **Submitting**: Shows thank you screen

**Validation**:

- Rating is required (1-5 stars)
- Comment is optional

### 4. Thank You Screen

**Display**:

- Large green checkmark icon (80px)
- "Thank You!" title
- Confirmation message
- Auto-closes after 500ms

## Implementation Details

### State Management

```typescript
const [rating, setRating] = useState<number>(0);
const [comment, setComment] = useState<string>('');
const [hoveredStar, setHoveredStar] = useState<number>(0);
const [isSubmitting, setIsSubmitting] = useState(false);
```

**State Flow**:

1. Modal opens → Reset all states
2. User selects stars → `rating` updates
3. User types comment → `comment` updates
4. User submits → `isSubmitting` = true
5. Thank you screen shows → Auto-close after 500ms

### Animations

**Modal Entry**:

```typescript
Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 250,
    useNativeDriver: true,
  }),
  Animated.spring(slideAnim, {
    toValue: 0,
    tension: 65,
    friction: 10,
    useNativeDriver: true,
  }),
]).start();
```

**Effects**:

- Fade in from 0 to 1 opacity
- Slide up from 50px offset
- Spring animation for natural feel

**Modal Exit**:

- Fade out in 200ms
- Slide down 50px
- Smooth closing transition

### Star Rating Logic

```typescript
const handleStarPress = (star: number) => {
  setRating(star);
};

const handleStarPressIn = (star: number) => {
  setHoveredStar(star);
};

const handleStarPressOut = () => {
  setHoveredStar(0);
};
```

**Visual States**:

```typescript
const isActive = star <= (hoveredStar || rating);

<Icon
  name={isActive ? 'star' : 'star-outline'}
  size={40}
  color={isActive ? '#f39c12' : theme.text.tertiary}
/>;
```

**Behavior**:

- Tap star → Set rating
- Hold star → Show preview (hover effect)
- Release → Revert to selected rating

### Form Submission

```typescript
const handleSubmit = () => {
  if (rating === 0) {
    return; // Validation failed
  }

  setIsSubmitting(true);
  onSubmit({
    rating,
    comment: comment.trim(),
    eventId,
  });

  // Auto-close after showing thank you
  setTimeout(() => {
    onClose();
  }, 500);
};
```

**Validation**:

- Rating must be selected (1-5)
- Comment is optional
- Trim whitespace from comment

**Submission Data**:

```typescript
{
  rating: 4,
  comment: "Great event! Learned a lot...",
  eventId: "event-123"
}
```

### Keyboard Handling

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={0}
>
  {/* Content */}
</KeyboardAvoidingView>
```

**Features**:

- iOS: Padding behavior
- Android: Native handling
- Dismiss on tap outside input
- ScrollView adapts to keyboard

## Styling Details

### Color System

**Rating Colors**:

```typescript
Poor (1):       #e74c3c (Red)
Fair (2):       #e67e22 (Orange)
Good (3):       #f39c12 (Yellow)
Very Good (4):  #27ae60 (Green)
Excellent (5):  #2ecc71 (Bright Green)
```

**Card Styling**:

```typescript
ratingContainer: {
  backgroundColor: theme.background.card,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.border.secondary,
  paddingVertical: 24,
}
```

### Typography

```typescript
Header Title:     20px, bold
Event Title:      22px, bold
Section Title:    16px, semibold
Rating Label:     18px, semibold (colored)
Rating Subtext:   13px
Input Text:       15px
Character Count:  12px
Submit Button:    16px, semibold
```

### Spacing

```typescript
Padding (content):     20px horizontal
Padding (top):         32px
Padding (bottom):      40px
Section margin:        32px
Star gap:              12px
Input min height:      120px
Button padding:        16px vertical
```

### Shadows

**Submit Button**:

```typescript
shadowColor: theme.button.primary.background,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 4,
```

**Close Button**:

```typescript
backgroundColor: theme.background.secondary,
borderRadius: 20,
width: 40,
height: 40,
```

## User Flow

### Complete Feedback Flow

```
1. User opens modal
   ↓
2. Sees event title
   ↓
3. Taps stars to rate (required)
   ↓
4. Sees rating label and color
   ↓
5. Optionally types comment
   ↓
6. Sees character count update
   ↓
7. Taps "Submit Feedback"
   ↓
8. Thank you screen appears
   ↓
9. Modal auto-closes (500ms)
   ↓
10. Parent receives feedback data
```

### Quick Feedback (Minimal)

```
1. Open modal
   ↓
2. Tap 5 stars
   ↓
3. Tap Submit
   ↓
4. Done (< 5 seconds)
```

### Detailed Feedback (Maximum)

```
1. Open modal
   ↓
2. Read event title
   ↓
3. Consider rating
   ↓
4. Select 4 stars
   ↓
5. Write detailed comment (500 chars)
   ↓
6. Review feedback
   ↓
7. Submit
   ↓
8. Done (~ 1-2 minutes)
```

## Integration Examples

### In EventDetailScreen

```tsx
import EventFeedbackModal from '@components/events/EventFeedbackModal';

const EventDetailScreen = () => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <ScrollView>
        {/* Event details */}

        <TouchableOpacity onPress={() => setShowFeedback(true)}>
          <Text>Give Feedback</Text>
        </TouchableOpacity>
      </ScrollView>

      <EventFeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        eventTitle={event.title}
        eventId={event.id}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};
```

### In EventCard

```tsx
const EventCard = ({ event }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <View style={styles.card}>
        {/* Card content */}

        {event.status === 'COMPLETED' && (
          <TouchableOpacity onPress={() => setShowFeedback(true)}>
            <Icon name="star" />
            <Text>Rate Event</Text>
          </TouchableOpacity>
        )}
      </View>

      <EventFeedbackModal
        visible={showFeedback}
        onClose={() => setShowFeedback(false)}
        eventTitle={event.title}
        eventId={event.id}
        onSubmit={submitFeedback}
      />
    </>
  );
};
```

### API Integration

```typescript
const handleFeedbackSubmit = async feedback => {
  try {
    const response = await fetch('/api/events/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    });

    if (response.ok) {
      console.log('Feedback submitted successfully');
      // Show success toast
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    // Show error toast
  }
};
```

## Accessibility Features

✅ **Large Touch Targets**: Stars are 40px with padding
✅ **Clear Labels**: Rating descriptions and instructions
✅ **Visual Feedback**: Color changes on interaction
✅ **Keyboard Support**: Text input with proper keyboard handling
✅ **Validation**: Clear disabled state when rating not selected
✅ **Confirmation**: Thank you screen confirms submission

## Theme Support

### Dark Mode

- Dark background
- Light text
- Card backgrounds with subtle borders
- Purple accent colors
- Proper contrast ratios

### Light Mode

- Light background
- Dark text
- White cards with borders
- Same purple accents
- High readability

## Performance

### Optimizations

- Uses `useNativeDriver` for animations
- Efficient state management
- No unnecessary re-renders
- Lightweight form validation
- Minimal dependencies

### Memory

- Cleans up animations on unmount
- Resets state when modal closes
- No memory leaks

## Future Enhancements

Potential improvements:

- Add photos/images to feedback
- Category-based ratings (venue, content, speakers)
- Emoji reactions in addition to stars
- Pre-filled comment suggestions
- Share feedback publicly option
- Edit submitted feedback
- View others' feedback

## Files Created

### New Files

1. ✅ **src/components/events/EventFeedbackModal.tsx**
   - Complete feedback modal component
   - Star rating system
   - Comment input
   - Thank you screen
   - Animations and keyboard handling

## Testing Scenarios

### Test 1: Basic Submission

```
Action: Select 5 stars, tap submit
Expected: Thank you screen appears, modal closes
Result: Feedback data sent to parent
```

### Test 2: With Comment

```
Action: Select 4 stars, type comment, submit
Expected: Both rating and comment included in data
Result: Complete feedback object sent
```

### Test 3: Validation

```
Action: Tap submit without selecting stars
Expected: Button disabled, no submission
Result: Form validation prevents empty submission
```

### Test 4: Close Without Submitting

```
Action: Open modal, select stars, tap close
Expected: Modal closes, no data sent
Result: State resets on next open
```

### Test 5: Star Hover Effect

```
Action: Press and hold on 4th star
Expected: First 4 stars fill with yellow
Result: Visual preview of selection
```

### Test 6: Character Limit

```
Action: Type 500+ characters
Expected: Input stops at 500, counter shows limit
Result: Validation enforced
```

## Best Practices

### When to Show

- ✅ After event ends (status: COMPLETED)
- ✅ After user attends event
- ✅ In event detail screen
- ✅ In notification prompt

### When NOT to Show

- ❌ Before event starts
- ❌ For cancelled events
- ❌ If already submitted feedback
- ❌ Immediately after registration

### UX Tips

- Show once per event per user
- Allow editing within time window
- Send reminder notification
- Make it quick and easy
- Don't make it mandatory

---

**Status**: ✅ COMPLETE

**Component**: EventFeedbackModal
**Type**: Full-height modal overlay
**Purpose**: Event survey and feedback collection
**Last Updated**: March 5, 2026
**Version**: 1.0.0
