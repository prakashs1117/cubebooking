# Modern OTP Input Component

A beautiful, modern OTP (One-Time Password) input component with individual square boxes for each digit.

---

## ✨ Features

### Visual Design

- ✅ **Square Boxes** - Clean, modern square boxes for each digit
- ✅ **Visible Numbers** - Large, clear numbers in each box
- ✅ **Center Aligned** - Perfectly centered layout
- ✅ **Animated Focus** - Smooth scale animation on focus
- ✅ **Color States** - Different colors for empty, filled, focused, and error states
- ✅ **Shadow Effects** - Subtle shadows for depth
- ✅ **Blinking Cursor** - Visual cursor indicator in focused box

### Functionality

- ✅ **Auto-Focus** - Automatically focuses first box on mount
- ✅ **Auto-Advance** - Moves to next box when digit is entered
- ✅ **Auto-Backspace** - Intelligent backspace navigation
- ✅ **Paste Support** - Can paste entire code at once
- ✅ **Number Only** - Only accepts numeric input
- ✅ **Error Handling** - Shows error message below boxes
- ✅ **Helper Text** - Informative helper text
- ✅ **Customizable Length** - Support for any length (default 6)

---

## 📸 Visual States

### Empty State

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
     Enter the 6-digit code sent to your email
```

### Focused State (with cursor)

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ |  │ │    │ │    │ │    │ │    │ │    │  ← Focused (blue border)
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

### Partially Filled

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ |  │ │    │ │    │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

### Fully Filled

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

### Error State

```
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │ │ 4  │ │ 5  │ │ 6  │  ← Red border
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
       ❌ Invalid verification code
```

---

## 🎨 Design Specifications

### Box Dimensions

- **Width**: 52px
- **Height**: 60px
- **Border Radius**: 12px
- **Gap Between Boxes**: 12px

### Typography

- **Font Size**: 24px
- **Font Weight**: 700 (Bold)
- **Font Family**: Urbanist (from getFontStyle)

### Colors (Theme-Aware)

#### Light Mode

- **Empty Box**: Light gray border (#E5E7EB)
- **Filled Box**: Primary border color
- **Focused Box**: Primary color border (2px, with shadow)
- **Error Box**: Error color border (red)
- **Text**: Primary text color (dark)

#### Dark Mode

- **Empty Box**: Dark gray border
- **Filled Box**: Primary border color
- **Focused Box**: Primary color border (2px, with shadow)
- **Error Box**: Error color border (red)
- **Text**: Primary text color (light)

### Animations

- **Focus Scale**: 1.0 → 1.05 (spring animation)
- **Duration**: Spring animation with friction: 3
- **Cursor Blink**: Opacity animation (optional)

---

## 📝 Usage

### Basic Usage

```typescript
import OTPInput from '@components/auth/OTPInput';

const MyComponent = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  return <OTPInput value={code} onChangeText={setCode} error={error} />;
};
```

### With Custom Length (4-digit code)

```typescript
<OTPInput value={code} onChangeText={setCode} length={4} error={error} />
```

### Disable Auto-Focus

```typescript
<OTPInput value={code} onChangeText={setCode} autoFocus={false} />
```

### Complete Example with Validation

```typescript
import React, { useState } from 'react';
import OTPInput from '@components/auth/OTPInput';
import CustomButton from '@components/common/CustomButton';

const OTPVerification = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    setError('');

    // Validation
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // API call to verify OTP
      await verifyOTP(code);
      // Success handling
    } catch (err) {
      setError('Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <OTPInput
        value={code}
        onChangeText={setCode}
        error={error}
        length={6}
        autoFocus={true}
      />

      <CustomButton
        title="Verify"
        onPress={handleVerify}
        loading={isLoading}
        disabled={code.length !== 6}
      />
    </View>
  );
};
```

---

## 🎯 Props

| Prop           | Type                     | Default     | Description                   |
| -------------- | ------------------------ | ----------- | ----------------------------- |
| `value`        | `string`                 | Required    | Current OTP value             |
| `onChangeText` | `(text: string) => void` | Required    | Callback when OTP changes     |
| `length`       | `number`                 | `6`         | Number of digits (boxes)      |
| `error`        | `string`                 | `undefined` | Error message to display      |
| `autoFocus`    | `boolean`                | `true`      | Auto-focus first box on mount |

---

## 🔄 Behavior

### Auto-Advance

When a digit is entered, focus automatically moves to the next box:

```
User types "1" in box 1 → Focus moves to box 2
User types "2" in box 2 → Focus moves to box 3
...and so on
```

### Backspace Navigation

Intelligent backspace handling:

```
Backspace in filled box → Clears digit, stays in current box
Backspace in empty box → Moves to previous box and clears it
```

### Paste Support

Full OTP can be pasted at once:

```
User pastes "123456" → All boxes fill automatically
                      → Focus moves to last box
```

### Digit Filtering

Only numeric digits are allowed:

```
User types "1a2b3" → Result: "123" (letters ignored)
```

---

## 🎨 Customization

### Changing Box Size

Edit the `box` style in the component:

```typescript
box: {
  width: 60,    // Increase width
  height: 70,   // Increase height
  borderRadius: 16, // More rounded
  ...
}
```

### Changing Gap Between Boxes

Edit the `boxesContainer` style:

```typescript
boxesContainer: {
  gap: 16, // Increase gap
  ...
}
```

### Changing Font Size

Edit the `text` style:

```typescript
text: {
  fontSize: 28, // Larger font
  ...
}
```

---

## ♿ Accessibility

- ✅ **Keyboard Support**: Full keyboard navigation
- ✅ **Number Pad**: Numeric keyboard on mobile
- ✅ **Focus Management**: Proper focus handling
- ✅ **Error Announcements**: Error messages clearly visible
- ✅ **Large Touch Targets**: 52x60px boxes are easily tappable

---

## 🧪 Testing

### Test Scenarios

1. **Enter OTP Digit by Digit**

   - Type each digit
   - Verify auto-advance works
   - Verify all digits are captured

2. **Paste Full OTP**

   - Copy "123456"
   - Paste in any box
   - Verify all boxes fill correctly

3. **Backspace Navigation**

   - Fill some boxes
   - Press backspace multiple times
   - Verify proper navigation

4. **Error Display**

   - Trigger validation error
   - Verify error message appears
   - Verify boxes have error border

5. **Focus States**
   - Click each box
   - Verify focus indicator shows
   - Verify animation works

---

## 🐛 Troubleshooting

### Cursor Not Showing on iOS

This is intentional. The cursor is hidden on iOS for a cleaner look. A custom blinking cursor indicator is shown instead.

### Boxes Not Aligned

Ensure the parent container has proper width:

```typescript
<View style={{ width: '100%', alignItems: 'center' }}>
  <OTPInput ... />
</View>
```

### Paste Not Working

Ensure the TextInput has proper permissions. This should work by default in React Native.

### Animation Lag

Reduce the spring friction value for faster animation:

```typescript
Animated.spring(animatedValues[index], {
  friction: 2, // Lower = faster
  ...
})
```

---

## 📱 Platform-Specific Behavior

### iOS

- Cursor is hidden (caretHidden)
- Custom cursor indicator shown
- Native number pad keyboard

### Android

- Context menu hidden (contextMenuHidden)
- Native number pad keyboard
- Standard cursor visible

### Web

- Outline styles disabled
- Desktop keyboard support
- Click-to-focus works

---

## 🎯 Best Practices

1. **Always validate the complete code** before submission
2. **Clear error on new input** to improve UX
3. **Provide helpful error messages** (e.g., "Invalid code" not "Error")
4. **Show loading state** during verification
5. **Disable submit button** until code is complete
6. **Auto-submit** when 6 digits are entered (optional)

---

## 🔗 Related Components

- **CustomButton** - Used for verify button
- **AuthLayout** - Wrapper layout for auth screens
- **CustomText** - Typography components

---

## 📄 Files

- **Component**: `src/components/auth/OTPInput.tsx`
- **Screen**: `src/screens/OTPVerificationScreen.tsx`
- **Types**: Uses theme types from `@theme/index`

---

## 🚀 Future Enhancements

Potential improvements:

- [ ] Auto-submit when complete
- [ ] Haptic feedback on digit entry
- [ ] Sound effects (optional)
- [ ] Biometric authentication option
- [ ] Show/hide password-style toggle
- [ ] Timer countdown in component
- [ ] Different box shapes (circle, hexagon)
- [ ] Gradient borders on focus

---

## 📚 Examples

### Auto-Submit Example

```typescript
const [code, setCode] = useState('');

const handleCodeChange = (text: string) => {
  setCode(text);

  // Auto-submit when complete
  if (text.length === 6) {
    handleVerify(text);
  }
};

<OTPInput value={code} onChangeText={handleCodeChange} />;
```

### With Timer Countdown

```typescript
const [timer, setTimer] = useState(60);

useEffect(() => {
  if (timer > 0) {
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }
}, [timer]);

<View>
  <OTPInput value={code} onChangeText={setCode} />
  <Text>Code expires in {timer}s</Text>
</View>;
```

---

**Created**: 2026-03-04
**Component Version**: 1.0
**Designed for**: Email OTP verification
