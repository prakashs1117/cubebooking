# Toast Notification System - Usage Examples

## Simple Examples

### 1. Success Message

```typescript
import { toast } from '@utils/toast';

// Quick success
toast.success('Saved!');

// With message
showSuccess({
  title: 'Changes Saved',
  message: 'Your profile has been updated successfully',
});
```

### 2. Error Message

```typescript
// Quick error
toast.error('Failed!');

// With details
showError({
  title: 'Upload Failed',
  message: 'Please check your internet connection and try again',
  duration: 5000,
});
```

### 3. Info Message

```typescript
// Quick info
toast.info('New update available');

// With details
showInfo({
  title: 'Maintenance Scheduled',
  message: 'System will be down for maintenance on Sunday',
  position: 'bottom',
});
```

### 4. Warning Message

```typescript
// Quick warning
toast.warning('Low battery');

// With details
showWarning({
  title: 'Unsaved Changes',
  message: 'You have unsaved changes. Do you want to continue?',
});
```

## Real-World Integration Examples

### Form Validation

```typescript
const handleSubmit = () => {
  if (!email) {
    showWarning({
      title: 'Email Required',
      message: 'Please enter your email address',
    });
    return;
  }

  if (!password || password.length < 8) {
    showWarning({
      title: 'Invalid Password',
      message: 'Password must be at least 8 characters',
    });
    return;
  }

  // Submit form
  submitForm();
};
```

### API Calls with Error Handling

```typescript
const fetchUserData = async () => {
  try {
    const response = await api.getUserProfile();
    showSuccess({
      title: 'Profile Loaded',
      message: 'Welcome back!',
    });
    return response;
  } catch (error) {
    if (error.status === 401) {
      showError({
        title: 'Session Expired',
        message: 'Please log in again',
      });
    } else if (error.status === 500) {
      showError({
        title: 'Server Error',
        message: 'Please try again later',
      });
    } else {
      showError({
        title: 'Network Error',
        message: 'Please check your internet connection',
      });
    }
  }
};
```

### File Upload Progress

```typescript
const uploadFile = async (file: File) => {
  showInfo({
    title: 'Uploading...',
    message: 'Please wait while we upload your file',
  });

  try {
    await api.upload(file);
    showSuccess({
      title: 'Upload Complete',
      message: `${file.name} has been uploaded successfully`,
    });
  } catch (error) {
    showError({
      title: 'Upload Failed',
      message: 'Failed to upload file. Please try again',
    });
  }
};
```

### Delete Confirmation

```typescript
const handleDelete = (itemName: string) => {
  Alert.alert(
    'Confirm Delete',
    `Are you sure you want to delete ${itemName}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteItem(itemId);
            showSuccess({
              title: 'Deleted',
              message: `${itemName} has been deleted`,
            });
          } catch (error) {
            showError({
              title: 'Delete Failed',
              message: 'Unable to delete item',
            });
          }
        },
      },
    ],
  );
};
```

### Settings Updates

```typescript
const toggleNotifications = async (enabled: boolean) => {
  try {
    await api.updateSettings({ notifications: enabled });
    showSuccess({
      title: enabled ? 'Notifications Enabled' : 'Notifications Disabled',
      message: enabled
        ? 'You will receive push notifications'
        : 'You will not receive push notifications',
    });
  } catch (error) {
    showError({
      title: 'Update Failed',
      message: 'Could not update notification settings',
    });
  }
};
```

### Navigation with Toast

```typescript
const handleSave = async () => {
  try {
    await saveChanges();
    showSuccess({
      title: 'Saved Successfully',
      message: 'Tap to view details',
      onPress: () => {
        navigation.navigate('Details');
      },
    });
  } catch (error) {
    showError({
      title: 'Save Failed',
      message: 'Please try again',
    });
  }
};
```

### Multiple Operations

```typescript
const syncData = async () => {
  showInfo({
    title: 'Syncing...',
    message: 'Synchronizing your data',
  });

  try {
    await api.syncContacts();
    toast.success('Contacts synced');

    await api.syncPhotos();
    toast.success('Photos synced');

    await api.syncDocuments();
    showSuccess({
      title: 'Sync Complete',
      message: 'All data has been synchronized',
    });
  } catch (error) {
    showError({
      title: 'Sync Failed',
      message: 'Some items could not be synced',
    });
  }
};
```

### Timer-based Toasts

```typescript
const startTimer = () => {
  showInfo({
    title: 'Timer Started',
    message: '25 minutes focus session',
  });

  setTimeout(() => {
    showWarning({
      title: '5 Minutes Remaining',
      message: 'Start wrapping up your work',
    });
  }, 20 * 60 * 1000);

  setTimeout(() => {
    showSuccess({
      title: 'Timer Complete',
      message: 'Great job! Time for a break',
      duration: 10000,
    });
  }, 25 * 60 * 1000);
};
```

## Custom Durations by Type

```typescript
// Quick flash (1 second)
toast.success('Done!');

// Normal (3 seconds) - default for success/info
showSuccess({ title: 'Updated', duration: 3000 });

// Long (5 seconds) - for important messages
showError({ title: 'Error', message: 'Details...', duration: 5000 });

// Very long (10 seconds) - for critical info
showWarning({
  title: 'Important',
  message: 'Read this carefully',
  duration: 10000,
});
```

## Position Options

```typescript
// Top of screen (default)
showSuccess({ title: 'Success', position: 'top' });

// Bottom of screen
showInfo({ title: 'Info', position: 'bottom' });
```

## Manual Dismiss

```typescript
import { hideToast } from '@utils/toast';

// Show a toast
showInfo({ title: 'Processing...', duration: 10000 });

// Later, dismiss it manually
hideToast();
```

## Implemented Examples in App

Check these files to see toast notifications in action:

1. **HomeScreen.tsx** - Interactive toast examples
2. **SettingsScreen.tsx** - Logout success/error toasts
3. **EventDetailScreen.tsx** - Registration and calendar toasts

## Best Practices

1. **Keep titles short** - 2-5 words max
2. **Messages should be clear** - Explain what happened and what to do next
3. **Use appropriate variants** - Match the toast type to the message severity
4. **Don't overuse** - Too many toasts can annoy users
5. **Time appropriately** - Quick success, longer errors
6. **Actionable when needed** - Use onPress for follow-up actions

## Tips

- Use success toasts to confirm user actions
- Use error toasts to explain what went wrong
- Use info toasts for FYI messages
- Use warning toasts for validation and cautions
- Keep error messages helpful and actionable
- Test toasts on both light and dark themes
