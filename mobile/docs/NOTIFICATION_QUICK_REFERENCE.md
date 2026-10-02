# 🔔 Notification Testing - Quick Reference Card

## 🚀 Fastest Way to Test

```typescript
import notificationTriggers from '@utils/notificationTestData';

// Trigger any notification
notificationTriggers.eventHighPriority();
notificationTriggers.messageDetailed();
notificationTriggers.alertCritical();
```

Or navigate to: **NotificationTestScreen**

---

## 📱 Notification Types

| Type       | Icon        | Use Case                       | Priority        |
| ---------- | ----------- | ------------------------------ | --------------- |
| `event`    | 📅 calendar | Events, conferences, workshops | high/normal/low |
| `message`  | ✉️ mail     | Messages, chats                | normal          |
| `alert`    | 🔔 bell     | Critical updates, security     | high            |
| `reminder` | ⏰ clock    | Daily tasks, medication        | normal          |
| `general`  | ✨ sparkle  | Welcome, achievements          | low             |

---

## 🎨 Priority Levels

| Priority | Color   | Badge      | Use When               |
| -------- | ------- | ---------- | ---------------------- |
| `high`   | 🔴 Red  | Large dot  | Urgent, time-sensitive |
| `normal` | 🔵 Blue | Medium dot | Standard notifications |
| `low`    | ⚪ Gray | Small dot  | Info, non-urgent       |

---

## ⚡ Quick Triggers

### Single Notifications

```typescript
// Event
notificationTriggers.eventHighPriority();

// Message
notificationTriggers.messageSimple();

// Alert
notificationTriggers.alertCritical();

// Reminder
notificationTriggers.reminderDailyCheckin();

// General
notificationTriggers.generalWelcome();
```

### Bulk Tests

```typescript
// All types at once (5 notifications)
notificationTriggers.allNotificationTypes();

// All priorities (3 notifications)
notificationTriggers.allPriorityLevels();

// Multiple (4 notifications)
notificationTriggers.multipleNotifications();

// Stress test (10 notifications)
notificationTriggers.stressTest();

// Clear everything
notificationTriggers.clearAll();
```

---

## 🔧 Direct Service Usage

```typescript
import {
  notifyEvent,
  notifyMessage,
  notifyAlert,
  notifyReminder,
  createNotification,
} from '@services/notificationService';

// Event with ID and priority
notifyEvent('Title', 'Message', 'event_123', 'high');

// Message with action
notifyMessage('Title', 'Message', {
  type: 'navigate',
  screen: 'Messages',
  params: { id: '123' },
});

// Alert
notifyAlert('Title', 'Message');

// Reminder
notifyReminder('Title', 'Message', 'Profile');

// Custom
createNotification({
  title: 'Title',
  message: 'Message',
  type: 'general',
  priority: 'low',
  icon: 'bell',
  action: { type: 'navigate', screen: 'Home' },
});
```

---

## 🌐 FCM Testing (Backend)

### Get Your Device Token

```typescript
import messaging from '@react-native-firebase/messaging';

const token = await messaging().getToken();
console.log('FCM Token:', token);
```

### Send via cURL

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "DEVICE_TOKEN",
    "notification": {
      "title": "Test",
      "body": "Test message"
    },
    "data": {
      "notificationType": "event",
      "priority": "high"
    }
  }'
```

### Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Fill in title and body
4. Select test device by token
5. Add custom data from samples

---

## 📊 Check Notification State

```typescript
import { useNotificationStore } from '@stores/notificationStore';

// In component
const notifications = useNotificationStore(state => state.notifications);
const unreadCount = useNotificationStore(state => state.unreadCount);

console.log('Total:', notifications.length);
console.log('Unread:', unreadCount);
```

---

## 🎯 Test Scenarios

### App States

- ✅ **Foreground**: App open → In-app notification
- ✅ **Background**: App minimized → System tray
- ✅ **Quit**: App closed → System tray

### Features to Test

- ✅ Badge count updates
- ✅ Mark as read
- ✅ Delete notification
- ✅ Clear all
- ✅ Tap notification → Navigate
- ✅ Persistence (close/reopen app)

---

## 🗂️ File Locations

```
📄 Sample Data
   NOTIFICATION_SAMPLE_DATA.json

📄 Testing Guide
   NOTIFICATION_TESTING_GUIDE.md

📄 Backend Plan
   NOTIFICATION_BACKEND_DEVELOPMENT_PLAN.md

🔧 Utilities
   src/utils/notificationTestData.ts

📱 Test Screen
   src/screens/NotificationTestScreen.tsx

💾 Store
   src/stores/notificationStore.ts

⚙️ Service
   src/services/notificationService.ts

📋 Types
   src/types/notification.ts

📮 Postman Collection
   FCM_POSTMAN_COLLECTION.json
```

---

## 🔍 Debugging

### Console Logs

```typescript
// Log notification action
console.log('Notification triggered');

// Log store state
console.log(useNotificationStore.getState());
```

### AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// View stored data
const data = await AsyncStorage.getItem('notification-storage');
console.log(JSON.parse(data));

// Clear storage
await AsyncStorage.removeItem('notification-storage');
```

### React Native Debugger

1. Open debugger
2. Check Zustand state
3. Monitor state changes

---

## ⚠️ Common Issues

| Issue                  | Solution                             |
| ---------------------- | ------------------------------------ |
| Not appearing          | Check permissions, verify store init |
| Badge not updating     | Verify notification added to store   |
| Navigation not working | Check screen name matches nav config |
| FCM not received       | Verify token, check Firebase console |
| Deep link fails        | Test with simple screen first        |

---

## 📝 Sample Payloads

### Event Notification

```json
{
  "title": "Conference Starts Soon",
  "message": "Begins in 30 minutes",
  "type": "event",
  "priority": "high",
  "icon": "calendar",
  "action": {
    "type": "navigate",
    "screen": "EventDetail",
    "params": { "eventId": "event_123" }
  }
}
```

### Message Notification

```json
{
  "title": "New Message",
  "message": "Dr. Sarah: Can we discuss?",
  "type": "message",
  "priority": "normal",
  "icon": "mail",
  "action": {
    "type": "navigate",
    "screen": "Messages",
    "params": { "conversationId": "conv_123" }
  }
}
```

---

## 🎓 Best Practices

✅ **DO**

- Test on real devices (push notifications)
- Test all app states (foreground, background, quit)
- Test navigation actions
- Clear old notifications regularly
- Use appropriate priority levels

❌ **DON'T**

- Send too many notifications (spam)
- Use high priority for non-urgent items
- Forget to handle navigation edge cases
- Ignore notification permissions

---

## 🚀 Quick Start Checklist

- [ ] Import notification triggers
- [ ] Test one notification type
- [ ] Test navigation action
- [ ] Test badge count
- [ ] Test mark as read
- [ ] Test delete
- [ ] Test clear all
- [ ] Test persistence
- [ ] Set up FCM (if needed)
- [ ] Test push notifications

---

## 📞 Need Help?

1. Check `NOTIFICATION_TESTING_GUIDE.md` for detailed instructions
2. Review `NOTIFICATION_SAMPLE_DATA.json` for payload examples
3. Follow `NOTIFICATION_BACKEND_DEVELOPMENT_PLAN.md` for FCM setup
4. Check console logs for errors
5. Verify Firebase Console for FCM delivery

---

**Pro Tip**: Use `NotificationTestScreen` for the easiest testing experience!

**Last Updated**: 2026-03-04
