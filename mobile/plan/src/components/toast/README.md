# Toast Notification System

Beautiful, clean, and easy-to-use toast notifications for React Native.

## Features

- 4 variants: Success, Error, Info, Warning
- Custom icons and colors for each variant
- Clean, minimal design
- Easy-to-use API
- TypeScript support
- Automatic dismiss with customizable duration
- Manual dismiss option
- Custom actions on press

## Usage

### Basic Usage

Import the toast utility functions:

```typescript
import { showSuccess, showError, showInfo, showWarning } from '@utils/toast';
```

### Show Different Toast Types

```typescript
// Success Toast
showSuccess({
  title: 'Success!',
  message: 'Your changes have been saved',
});

// Error Toast
showError({
  title: 'Error',
  message: 'Something went wrong',
});

// Info Toast
showInfo({
  title: 'Information',
  message: 'New updates are available',
});

// Warning Toast
showWarning({
  title: 'Warning',
  message: 'Please complete all required fields',
});
```

### Quick Toasts (Title Only)

For quick notifications, use the `toast` object:

```typescript
import { toast } from '@utils/toast';

toast.success('Done!');
toast.error('Failed!');
toast.info('FYI');
toast.warning('Careful!');
```

### Advanced Options

```typescript
showSuccess({
  title: 'Upload Complete',
  message: 'Your file has been uploaded successfully',
  duration: 5000, // Show for 5 seconds
  position: 'bottom', // Show at bottom of screen
  onPress: () => {
    // Handle tap on toast
    console.log('Toast pressed!');
  },
});
```

### Hide Toast Manually

```typescript
import { hideToast } from '@utils/toast';

hideToast();
```

## Toast Options

| Option     | Type                | Default     | Description                    |
| ---------- | ------------------- | ----------- | ------------------------------ |
| `title`    | `string`            | Required    | Main title text                |
| `message`  | `string`            | Optional    | Subtitle/description text      |
| `duration` | `number`            | 3000-4000ms | How long to show the toast     |
| `position` | `'top' \| 'bottom'` | `'top'`     | Where to show the toast        |
| `onPress`  | `() => void`        | Optional    | Callback when toast is pressed |

## Variants

### Success

- **Icon**: Checkbox checked
- **Color**: Green (#10B981)
- **Use**: Successful operations, confirmations

### Error

- **Icon**: Close/X
- **Color**: Red (#EF4444)
- **Use**: Errors, failed operations

### Info

- **Icon**: Info circle
- **Color**: Blue (#3B82F6)
- **Use**: Informational messages, updates

### Warning

- **Icon**: Alert circle
- **Color**: Orange (#F59E0B)
- **Use**: Warnings, cautions, validation messages

## Examples

See `ToastExamples.tsx` for interactive examples you can use in your app.

## Customization

To customize toast appearance, edit:

- `src/components/toast/CustomToast.tsx` - Component and styling
- `src/utils/toast.ts` - Default durations and behavior

## Dependencies

- `react-native-toast-message`: ^2.x.x
