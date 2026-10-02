# Notification Templates Guide

This guide explains the standard notification JSON structure and how to use notification templates.

## 📁 File Location

```
src/data/notificationTemplates.json
```

## 🎨 Available Icons

The following icons are available for notifications:

### Notification Icons

- `bell` / `bell-outline` - General notifications, alerts
- `mail` / `mail-outline` - Messages, emails
- `calendar` / `calendar-outline` - Events, appointments
- `clock` / `time` - Reminders, time-sensitive
- `alert-circle` - Important alerts
- `info` / `info-circle` - Informational
- `checkmark-circle` - Success, confirmations

### Additional Icons

- `user` / `user-outline` / `profile` - User-related
- `location` / `location-outline` - Location, venue
- `image` / `image-outline` - Media, photos
- `trash` / `trash-outline` - Delete actions
- `heart` / `heart-outline` - Favorites, likes
- `star` - Ratings, important
- `download` - Downloads
- `search` - Search-related
- `settings` - Settings, preferences

All icons are SVG-based and fully themeable.

## 🎯 Notification Types

The system supports 4 notification types:

| Type       | Icon        | Use Case                    | Examples                                    |
| ---------- | ----------- | --------------------------- | ------------------------------------------- |
| `event`    | 📅 calendar | Event-related notifications | Registration, updates, feedback             |
| `message`  | ✉️ mail     | Messaging and communication | New messages, mentions, connection requests |
| `alert`    | 🔔 bell     | Important alerts            | Cancellations, waitlist, certificates       |
| `reminder` | ⏰ clock    | Time-sensitive reminders    | Event starting soon, payment due, check-in  |

## 🎨 Priority Levels

| Priority | Color   | Use Case               |
| -------- | ------- | ---------------------- | ----------------------------------------------- |
| `high`   | 🔴 Red  | Urgent/time-sensitive  | Event cancellations, payment due, spots opening |
| `normal` | 🔵 Blue | Standard notifications | Registrations, updates, messages                |
| `low`    | ⚪ Gray | Informational          | Certificates, feedback requests                 |

## 📊 Standard Notification Structure

```json
{
  "id": "unique-notification-id",
  "type": "event|message|alert|reminder",
  "priority": "high|normal|low",
  "title": "Short notification title",
  "message": "Detailed notification message",
  "timestamp": "2026-03-04T10:30:00Z",
  "read": false,
  "isNew": true,
  "icon": "calendar|mail|bell|clock|custom-icon",
  "imageUrl": "https://example.com/image.jpg",
  "action": {
    "type": "navigate|external",
    "screen": "ScreenName",
    "params": {
      "key": "value"
    }
  },
  "metadata": {
    "custom": "fields",
    "for": "additional data"
  }
}
```

## 📋 Field Descriptions

### Required Fields

| Field       | Type     | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| `id`        | string   | Unique identifier for the notification              |
| `type`      | enum     | Notification type (event, message, alert, reminder) |
| `priority`  | enum     | Priority level (high, normal, low)                  |
| `title`     | string   | Short, descriptive title (max 50 chars recommended) |
| `message`   | string   | Detailed message (max 200 chars recommended)        |
| `timestamp` | ISO 8601 | When the notification was created                   |
| `read`      | boolean  | Whether the notification has been read              |
| `isNew`     | boolean  | Whether the notification is new (shows NEW badge)   |

### Optional Fields

| Field      | Type   | Description                                                                 |
| ---------- | ------ | --------------------------------------------------------------------------- |
| `icon`     | string | Icon name to display (defaults based on type). Falls back if imageUrl fails |
| `imageUrl` | string | URL to image to display (e.g., event poster, user avatar, product image)    |
| `action`   | object | Deep linking action when notification is tapped                             |
| `metadata` | object | Additional data for the notification                                        |

### Action Object

```json
{
  "type": "navigate", // "navigate" or "external"
  "screen": "EventDetail", // Screen name to navigate to
  "params": {
    // Parameters to pass to screen
    "slug": "event-slug"
  }
}
```

For external URLs:

```json
{
  "type": "external",
  "url": "https://example.com"
}
```

## 🖼️ Image vs Icon Usage

Notifications support both images and icons:

### When to use imageUrl

- **User avatars**: For messages, mentions, connection requests
- **Event posters**: For event-related notifications
- **Product images**: For purchase confirmations, wishlist alerts
- **Speaker photos**: For speaker announcements
- **Branded content**: For promotional notifications

### When to use icon only

- **System notifications**: Alerts, reminders, status updates
- **Generic events**: When no specific image is available
- **Low bandwidth**: Icons load faster and use less data
- **Fallback**: Icon is used if image fails to load

### Image Requirements

- **Size**: 200x200px minimum (square format preferred)
- **Format**: JPEG, PNG, WebP
- **Aspect Ratio**: 1:1 (square) works best in circular container
- **CDN**: Use CDN URLs for faster loading
- **Fallback**: Always provide an `icon` as fallback

## 🚀 Usage Examples

### 1. Event Registration Success (with image)

```json
{
  "id": "event-reg-001",
  "type": "event",
  "priority": "normal",
  "title": "Registration Confirmed",
  "message": "You're registered for Startup Week 2026!",
  "timestamp": "2026-03-04T10:30:00Z",
  "read": false,
  "isNew": true,
  "icon": "calendar",
  "imageUrl": "https://cdn.example.com/events/startup-week-2026.jpg",
  "action": {
    "type": "navigate",
    "screen": "EventDetail",
    "params": {
      "slug": "startup-week-2026"
    }
  },
  "metadata": {
    "eventId": "evt_123",
    "registrationId": "reg_456"
  }
}
```

### 2. High Priority Reminder

```json
{
  "id": "reminder-001",
  "type": "reminder",
  "priority": "high",
  "title": "Event Starting Soon",
  "message": "Your event starts in 1 hour. See you there!",
  "timestamp": "2026-03-04T09:15:00Z",
  "read": false,
  "isNew": true,
  "icon": "clock",
  "action": {
    "type": "navigate",
    "screen": "EventDetail",
    "params": {
      "slug": "my-event"
    }
  }
}
```

### 3. New Message (with user avatar)

```json
{
  "id": "msg-001",
  "type": "message",
  "priority": "normal",
  "title": "New Message",
  "message": "Sarah sent you a message about the event.",
  "timestamp": "2026-03-03T14:20:00Z",
  "read": false,
  "isNew": false,
  "icon": "mail",
  "imageUrl": "https://cdn.example.com/avatars/user_123.jpg",
  "action": {
    "type": "navigate",
    "screen": "Messages",
    "params": {
      "conversationId": "conv_789"
    }
  },
  "metadata": {
    "senderId": "user_123",
    "senderName": "Sarah"
  }
}
```

### 4. Critical Alert

```json
{
  "id": "alert-001",
  "type": "alert",
  "priority": "high",
  "title": "Event Cancelled",
  "message": "Unfortunately, the event has been cancelled.",
  "timestamp": "2026-03-04T08:00:00Z",
  "read": false,
  "isNew": true,
  "icon": "bell",
  "action": {
    "type": "navigate",
    "screen": "Events"
  }
}
```

## 🔌 API Integration

### Send Notification (Backend)

```typescript
POST /api/v1/notifications
Content-Type: application/json

{
  "userId": "user_123",
  "notification": {
    "type": "event",
    "priority": "normal",
    "title": "Registration Confirmed",
    "message": "You're registered for the event!",
    "icon": "calendar",
    "imageUrl": "https://cdn.example.com/events/event-slug.jpg",
    "action": {
      "type": "navigate",
      "screen": "EventDetail",
      "params": {
        "slug": "event-slug"
      }
    }
  }
}
```

### Fetch Notifications (Mobile App)

```typescript
GET /api/v1/notifications?userId=user_123&limit=20&offset=0
```

Response:

```json
{
  "notifications": [
    {
      "id": "notif_001",
      "type": "event",
      "priority": "normal",
      "title": "Registration Confirmed",
      "message": "You're registered!",
      "timestamp": "2026-03-04T10:30:00Z",
      "read": false,
      "isNew": true,
      "icon": "calendar",
      "imageUrl": "https://cdn.example.com/event.jpg",
      "action": {
        "type": "navigate",
        "screen": "EventDetail",
        "params": { "slug": "event-slug" }
      }
    }
  ],
  "unreadCount": 5,
  "total": 42,
  "hasMore": true
}
```

### Mark Notification as Read

```typescript
PUT / api / v1 / notifications / { notificationId } / read;
```

### Mark All as Read

```typescript
PUT / api / v1 / notifications / mark - all - read;
```

### Delete Notification

```typescript
DELETE / api / v1 / notifications / { notificationId };
```

### Clear All Notifications

```typescript
DELETE / api / v1 / notifications / clear - all;
```

### Get Unread Count

```typescript
GET / api / v1 / notifications / unread - count;
```

Response:

```json
{
  "unreadCount": 5
}
```

## 📱 Mobile App Usage

### Fetch Notifications from API

```typescript
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@services/api/notifications.service';
import { useNotificationStore } from '@stores/notificationStore';

// In your component
const { data, isLoading, refetch } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => getNotifications('user_123', 20, 0),
  staleTime: 60000, // 1 minute
  onSuccess: data => {
    // Sync with local store if needed
    data.notifications.forEach(notification => {
      store.addNotification(notification);
    });
  },
});
```

### Trigger Local Notification in App

```typescript
import { useNotificationStore } from '@stores/notificationStore';

const store = useNotificationStore.getState();

store.addNotification({
  type: 'event',
  priority: 'normal',
  title: 'Registration Confirmed',
  message: "You're registered for the event!",
  icon: 'calendar',
  imageUrl: 'https://cdn.example.com/event.jpg', // Optional
  action: {
    type: 'navigate',
    screen: 'EventDetail',
    params: { slug: 'event-slug' },
  },
});
```

### Mark as Read

```typescript
store.markAsRead('notification-id');
```

### Mark All as Read

```typescript
store.markAllAsRead();
```

### Clear All Notifications

```typescript
store.clearAllNotifications();
```

## 🎨 Visual Representation

### Notification Item UI

```
┌─────────────────────────────────────────┐
│ 📅 Registration Confirmed          [NEW]│
│ You're registered for Startup Week!     │
│ 2 hours ago                       ✓  ✕ │
└─────────────────────────────────────────┘
```

### With Priority Colors

```
High Priority (Red border):
│ Event Cancelled
│ Unfortunately, the event...

Normal Priority (No special border):
│ Registration Confirmed
│ You're registered for...

Low Priority (Gray):
│ Certificate Available
│ Your completion certificate...
```

## 🧪 Testing Notifications

### Using Demo Component

```typescript
import { NotificationDemo } from '@components/notifications';

// In your screen
<NotificationDemo />;
```

This will show buttons to trigger all notification types for testing.

### Manual Testing

1. Import notification templates
2. Use `addNotification` from store
3. Check notification popup
4. Test navigation actions
5. Verify read/unread states

## 🎯 Best Practices

### ✅ Do's

- Keep titles under 50 characters
- Keep messages under 200 characters
- Use appropriate priority levels
- Include meaningful metadata
- Add deep linking for all notifications
- Use ISO 8601 for timestamps
- Generate unique IDs
- Provide both `icon` and `imageUrl` (icon as fallback)
- Use CDN URLs for images
- Optimize images (200x200px, square format)
- Use consistent image aspect ratios

### ❌ Don'ts

- Don't use excessive emojis
- Don't send duplicate notifications
- Don't use HTML in messages
- Don't ignore priority levels
- Don't forget to mark as read
- Don't use generic titles like "Notification"
- Don't use unoptimized or large images
- Don't rely solely on imageUrl without icon fallback
- Don't use images from untrusted sources

## 📊 Notification Categories

### Event Lifecycle

1. **Registration** - Confirmation, waitlist
2. **Reminders** - 24h, 1h, starting soon
3. **Updates** - Venue change, schedule change
4. **Post-Event** - Feedback, certificate, recordings

### User Interactions

1. **Messages** - New message, mention, reply
2. **Connections** - Request, acceptance
3. **Activity** - Like, comment, share

### System Notifications

1. **Alerts** - Cancellation, issues, important updates
2. **Payments** - Due, completed, refund
3. **Account** - Settings changed, security alerts

## 🔔 Push Notification Mapping

When sending push notifications, map to this structure:

```json
{
  "notification": {
    "title": "notification.title",
    "body": "notification.message",
    "sound": "default",
    "badge": "unreadCount"
  },
  "data": {
    "notificationId": "notification.id",
    "type": "notification.type",
    "priority": "notification.priority",
    "action": "JSON.stringify(notification.action)",
    "metadata": "JSON.stringify(notification.metadata)"
  }
}
```

## 📈 Analytics

Track notification metrics:

```typescript
{
  "notificationId": "notif_123",
  "userId": "user_456",
  "events": [
    { "type": "sent", "timestamp": "..." },
    { "type": "delivered", "timestamp": "..." },
    { "type": "viewed", "timestamp": "..." },
    { "type": "clicked", "timestamp": "..." },
    { "type": "dismissed", "timestamp": "..." }
  ]
}
```

## 🌍 Internationalization

Support multiple languages:

```json
{
  "title": {
    "en": "Registration Confirmed",
    "fr": "Inscription confirmée",
    "ar": "تم تأكيد التسجيل"
  },
  "message": {
    "en": "You're registered for the event!",
    "fr": "Vous êtes inscrit à l'événement!",
    "ar": "تم تسجيلك في الحدث!"
  }
}
```

## 🔗 Related Files

### Core Files

- `src/stores/notificationStore.ts` - Notification state management
- `src/components/notifications/NotificationModal.tsx` - Notification UI with image/icon support
- `src/services/api/notifications.service.ts` - Notification API service
- `src/types/notification.ts` - TypeScript types
- `src/data/notificationTemplates.json` - Notification templates

### Icon Files

- `src/components/icons/Icon.tsx` - Icon component
- `src/components/icons/iconRegistry.tsx` - Icon registry
- `src/components/icons/types.ts` - Icon types
- `src/components/icons/components/BellIcon.tsx` - Bell/notification icon
- `src/components/icons/components/MailIcon.tsx` - Mail/message icon
- `src/components/icons/components/ClockIcon.tsx` - Clock/reminder icon
- `src/components/icons/components/TrashIcon.tsx` - Trash/delete icon
- `src/components/icons/components/ImageIcon.tsx` - Image icon
- `src/components/icons/components/LocationIcon.tsx` - Location icon
