# Notification Testing Guide

This guide shows you how to test notifications using the sample data and utilities provided.

## Quick Start

### 1. Using the NotificationTestScreen (Recommended)

The easiest way to test notifications:

```typescript
// Navigate to the NotificationTestScreen in your app
navigation.navigate('NotificationTest');
```

This screen provides:

- ✅ Organized buttons for all notification types
- ✅ Individual tests for each priority level
- ✅ Bulk tests for multiple notifications
- ✅ Stress testing
- ✅ Clear all functionality

---

### 2. Using notificationTestData Utilities

Import and use directly in any component:

```typescript
import notificationTriggers from '@utils/notificationTestData';

// Trigger specific notifications
notificationTriggers.eventHighPriority();
notificationTriggers.messageDetailed();
notificationTriggers.alertCritical();
notificationTriggers.reminderDailyCheckin();

// Bulk tests
notificationTriggers.allNotificationTypes();
notificationTriggers.multipleNotifications();
notificationTriggers.stressTest();
```

---

### 3. Using Individual Functions

Import specific trigger functions:

```typescript
import {
  triggerEventHighPriority,
  triggerMessageNotification,
  triggerAlertCritical,
  triggerStressTest,
  clearAll,
} from '@utils/notificationTestData';

// Use in your component
<Button onPress={triggerEventHighPriority} title="Test Event" />;
```

---

### 4. Using notificationService Directly

Create custom notifications on the fly:

```typescript
import {
  createNotification,
  notifyEvent,
  notifyMessage,
  notifyAlert,
  notifyReminder,
} from '@services/notificationService';

// Custom event notification
notifyEvent(
  'My Custom Event',
  'This is a custom event notification',
  'event_custom_123',
  'high',
);

// Custom notification with full control
createNotification({
  title: 'Custom Title',
  message: 'Custom message',
  type: 'general',
  priority: 'normal',
  icon: 'sparkle',
  action: {
    type: 'navigate',
    screen: 'Home',
    params: { customParam: 'value' },
  },
});
```

---

## Testing Different Notification Types

### Event Notifications

```typescript
// High priority (red indicator)
notificationTriggers.eventHighPriority();

// Normal priority (blue indicator)
notificationTriggers.eventNormalPriority();

// Low priority (gray indicator)
notificationTriggers.eventLowPriority();
```

### Message Notifications

```typescript
// With navigation action
notificationTriggers.messageDetailed();

// Simple message
notificationTriggers.messageSimple();
```

### Alert Notifications

```typescript
// Critical system alert
notificationTriggers.alertCritical();

// With external link
notificationTriggers.alertExternal();

// Security alert
notificationTriggers.alertSecurity();
```

### Reminder Notifications

```typescript
// Profile completion
notificationTriggers.reminderProfile();

// Daily check-in
notificationTriggers.reminderDailyCheckin();

// Medication
notificationTriggers.reminderMedication();
```

### General Notifications

```typescript
// Welcome message
notificationTriggers.generalWelcome();

// Achievement
notificationTriggers.generalAchievement();

// Feature update
notificationTriggers.generalUpdate();
```

---

## Testing Scenarios

### Test All Priority Levels

```typescript
notificationTriggers.allPriorityLevels();
// Creates 3 notifications: low, normal, high
```

### Test All Notification Types

```typescript
notificationTriggers.allNotificationTypes();
// Creates 5 notifications: event, message, alert, reminder, general
```

### Test Multiple Notifications

```typescript
notificationTriggers.multipleNotifications();
// Creates 4 different notifications with delays
```

### Stress Test (10 notifications)

```typescript
notificationTriggers.stressTest();
// Creates 10 notifications rapidly to test performance
```

---

## Testing FCM Push Notifications

### Prerequisites

1. Firebase project set up
2. FCM service implemented (see NOTIFICATION_BACKEND_DEVELOPMENT_PLAN.md)
3. Device registered with FCM token
4. Firebase Admin SDK configured

### Using Firebase Console (Manual Testing)

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Fill in notification details
4. Add custom data from `NOTIFICATION_SAMPLE_DATA.json`

**Example Custom Data**:

```json
{
  "notificationType": "event",
  "priority": "high",
  "icon": "calendar",
  "actionType": "navigate",
  "actionScreen": "EventDetail",
  "eventId": "event_456"
}
```

---

### Using cURL (Command Line Testing)

Replace `YOUR_SERVER_KEY` and `DEVICE_TOKEN`:

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test from cURL"
    },
    "data": {
      "notificationType": "event",
      "priority": "high",
      "actionType": "navigate",
      "actionScreen": "EventDetail",
      "eventId": "test_123"
    }
  }'
```

---

### Using Postman/Insomnia

**Endpoint**: `https://fcm.googleapis.com/fcm/send`

**Headers**:

```
Authorization: key=YOUR_SERVER_KEY
Content-Type: application/json
```

**Body** (copy from `NOTIFICATION_SAMPLE_DATA.json`):

```json
{
  "to": "DEVICE_FCM_TOKEN",
  "notification": {
    "title": "Conference Starts Soon",
    "body": "Medical Innovation Conference begins in 30 minutes"
  },
  "data": {
    "notificationType": "event",
    "priority": "high",
    "icon": "calendar",
    "actionType": "navigate",
    "actionScreen": "EventDetail",
    "eventId": "event_456"
  }
}
```

---

### Using Firebase Cloud Functions

Call your Cloud Functions:

```typescript
import functions from '@react-native-firebase/functions';

// Send notification via Cloud Function
const sendNotification = functions().httpsCallable('sendNotification');

await sendNotification({
  userId: 'user_12345',
  title: 'New Event Posted',
  message: 'Medical Conference scheduled for next week',
  type: 'event',
  priority: 'normal',
  data: {
    eventId: 'event_123',
    actionType: 'navigate',
    actionScreen: 'EventDetail',
  },
});
```

---

## Testing in Different App States

### Foreground (App Open)

- Notification appears in in-app notification center
- Badge count updates
- No system notification shown (unless configured)

**Test**: Open app, trigger notification, check bell icon badge

### Background (App Minimized)

- System notification appears in notification tray
- Tapping opens app and navigates to content

**Test**: Minimize app, send FCM notification, tap notification

### Quit (App Closed)

- System notification appears
- Tapping launches app and navigates to content

**Test**: Force quit app, send FCM notification, tap notification

---

## Checking Notification State

### View All Notifications

```typescript
import { useNotificationStore } from '@stores/notificationStore';

const NotificationDebug = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = useNotificationStore(state => state.unreadCount);

  console.log('Total notifications:', notifications.length);
  console.log('Unread count:', unreadCount);
  console.log('All notifications:', JSON.stringify(notifications, null, 2));
};
```

### Clear All Notifications

```typescript
import { clearAllNotifications } from '@services/notificationService';

clearAllNotifications(); // or
notificationTriggers.clearAll();
```

---

## Sample Payloads for Copy-Paste

### Event Notification Payload (FCM)

```json
{
  "token": "YOUR_DEVICE_TOKEN",
  "notification": {
    "title": "Conference Starts Soon",
    "body": "Medical Innovation Conference begins in 30 minutes"
  },
  "data": {
    "notificationType": "event",
    "priority": "high",
    "icon": "calendar",
    "actionType": "navigate",
    "actionScreen": "EventDetail",
    "eventId": "event_456"
  },
  "android": {
    "priority": "high",
    "notification": {
      "channelId": "event_notifications",
      "color": "#4A90E2"
    }
  },
  "apns": {
    "payload": {
      "aps": {
        "alert": {
          "title": "Conference Starts Soon",
          "body": "Medical Innovation Conference begins in 30 minutes"
        },
        "badge": 1,
        "sound": "default"
      }
    }
  }
}
```

### Message Notification Payload (FCM)

```json
{
  "token": "YOUR_DEVICE_TOKEN",
  "notification": {
    "title": "New Message",
    "body": "Dr. Sarah: Can we discuss the research findings?"
  },
  "data": {
    "notificationType": "message",
    "priority": "normal",
    "icon": "mail",
    "actionType": "navigate",
    "actionScreen": "Messages",
    "conversationId": "conv_789"
  }
}
```

### Alert Notification Payload (FCM)

```json
{
  "token": "YOUR_DEVICE_TOKEN",
  "notification": {
    "title": "Security Alert",
    "body": "Unusual login detected from a new device"
  },
  "data": {
    "notificationType": "alert",
    "priority": "high",
    "icon": "bell",
    "actionType": "navigate",
    "actionScreen": "Settings"
  }
}
```

---

## Debugging Tips

### Console Logging

```typescript
// Enable notification debugging
console.log('Notification triggered:', notification);
```

### React Native Debugger

1. Open React Native Debugger
2. Check Redux/Zustand state for `notificationStore`
3. Monitor state changes when notifications are triggered

### AsyncStorage Inspection

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// View stored notifications
const checkStoredNotifications = async () => {
  const stored = await AsyncStorage.getItem('notification-storage');
  console.log('Stored notifications:', JSON.parse(stored));
};
```

### Firebase Console Monitoring

1. Firebase Console → Cloud Messaging
2. Check "Reporting" tab for delivery metrics
3. Monitor failed deliveries

---

## Common Issues & Solutions

### Notifications Not Appearing

**Issue**: Notifications triggered but not showing

**Solutions**:

- Check notification permissions
- Verify notificationStore is properly initialized
- Check console for errors
- Ensure notification bell is visible in header

---

### FCM Notifications Not Received

**Issue**: Push notifications not arriving

**Solutions**:

- Verify FCM token is registered
- Check device token validity
- Ensure Firebase project has Cloud Messaging enabled
- Verify google-services.json (Android) / GoogleService-Info.plist (iOS)
- Check iOS APNs certificate configuration

---

### Deep Linking Not Working

**Issue**: Tapping notification doesn't navigate

**Solutions**:

- Verify screen name matches navigation configuration
- Check navigation params structure
- Ensure navigation is available in NotificationModal
- Test with simple screen first (e.g., 'Home')

---

### Notifications Persisting After Clear

**Issue**: Notifications remain after clearing

**Solutions**:

- Clear AsyncStorage manually
- Check Zustand persist configuration
- Verify clearAllNotifications function is called
- Check for multiple notification stores

---

## Performance Testing

### Memory Usage

```typescript
// Monitor notification count
const MAX_NOTIFICATIONS = 100;

// Implement cleanup in notificationStore
if (notifications.length > MAX_NOTIFICATIONS) {
  // Remove oldest notifications
  notifications = notifications.slice(0, MAX_NOTIFICATIONS);
}
```

### Load Testing

```typescript
// Create many notifications to test performance
for (let i = 0; i < 50; i++) {
  notificationTriggers.eventNormalPriority();
}
```

---

## Integration Testing Checklist

- [ ] Trigger each notification type
- [ ] Test all priority levels
- [ ] Test navigation actions
- [ ] Test external link actions
- [ ] Test mark as read
- [ ] Test delete notification
- [ ] Test clear all
- [ ] Test badge count updates
- [ ] Test persistence (close/reopen app)
- [ ] Test FCM foreground notifications
- [ ] Test FCM background notifications
- [ ] Test FCM quit state notifications
- [ ] Test notification tap handling
- [ ] Test multiple device support
- [ ] Test notification preferences

---

## Automated Testing

### Jest Unit Tests

```typescript
import { useNotificationStore } from '@stores/notificationStore';
import { notifyEvent } from '@services/notificationService';

describe('Notification System', () => {
  it('should add notification to store', () => {
    const initialCount = useNotificationStore.getState().notifications.length;

    notifyEvent('Test', 'Test message', 'test_1');

    const newCount = useNotificationStore.getState().notifications.length;
    expect(newCount).toBe(initialCount + 1);
  });

  it('should increment unread count', () => {
    const initialUnread = useNotificationStore.getState().unreadCount;

    notifyEvent('Test', 'Test message', 'test_2');

    const newUnread = useNotificationStore.getState().unreadCount;
    expect(newUnread).toBe(initialUnread + 1);
  });
});
```

---

## Next Steps

1. **Local Testing**: Use NotificationTestScreen to test all notification types
2. **FCM Setup**: Follow NOTIFICATION_BACKEND_DEVELOPMENT_PLAN.md Phase 1
3. **Backend Integration**: Implement Cloud Functions from Phase 2
4. **Production Testing**: Test on real devices with production FCM setup

---

## Resources

- **Sample Data**: `NOTIFICATION_SAMPLE_DATA.json`
- **Test Utilities**: `src/utils/notificationTestData.ts`
- **Test Screen**: `src/screens/NotificationTestScreen.tsx`
- **Backend Plan**: `NOTIFICATION_BACKEND_DEVELOPMENT_PLAN.md`
- **Type Definitions**: `src/types/notification.ts`
- **Notification Store**: `src/stores/notificationStore.ts`
- **Notification Service**: `src/services/notificationService.ts`

---

## Support

For issues or questions:

1. Check console logs for errors
2. Review Firebase Console for FCM delivery status
3. Verify configuration in `firebase.json` and platform-specific files
4. Test with simple notifications first before complex scenarios

---

**Last Updated**: 2026-03-04
