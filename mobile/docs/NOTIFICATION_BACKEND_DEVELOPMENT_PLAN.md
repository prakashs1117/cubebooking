# Notification Backend Development Plan

## Current State Analysis

### Existing Implementation

The notification system currently has:

- ✅ Frontend UI components (NotificationModal, NotificationDemo)
- ✅ Local state management (Zustand store with AsyncStorage persistence)
- ✅ Type definitions for notifications
- ✅ Helper functions for creating notifications
- ✅ Deep linking support
- ✅ Firebase Cloud Messaging SDK installed (`@react-native-firebase/messaging`)

### Missing Backend Components

- ❌ FCM token registration
- ❌ Backend notification sending service
- ❌ User notification preferences storage
- ❌ Push notification permissions handling
- ❌ Background/quit state notification handling
- ❌ Notification analytics and tracking
- ❌ Scheduled notifications
- ❌ Server-side notification triggering

---

## Development Plan Overview

### Phase 1: Firebase Cloud Messaging (FCM) Integration

**Duration**: 3-5 days
**Priority**: High

### Phase 2: Backend Notification Service

**Duration**: 5-7 days
**Priority**: High

### Phase 3: User Preferences & Advanced Features

**Duration**: 3-5 days
**Priority**: Medium

### Phase 4: Analytics & Monitoring

**Duration**: 2-3 days
**Priority**: Low

---

## Phase 1: FCM Integration (Frontend)

### 1.1 FCM Service Setup

**File**: `src/services/fcm/fcmService.ts`

**Tasks**:

- [ ] Request notification permissions (iOS & Android)
- [ ] Get FCM device token
- [ ] Handle token refresh
- [ ] Store token in Firestore linked to user
- [ ] Handle foreground notifications
- [ ] Handle background notifications
- [ ] Handle notification tap actions
- [ ] Configure notification channels (Android)

**Implementation Details**:

```typescript
// Functions needed:
- requestUserPermission(): Promise<boolean>
- getFCMToken(): Promise<string | null>
- registerDeviceToken(userId: string, token: string): Promise<void>
- setupNotificationListeners(): void
- handleForegroundNotification(remoteMessage): void
- handleBackgroundNotification(remoteMessage): void
- handleNotificationOpenedApp(remoteMessage): void
- deleteToken(): Promise<void>
```

**Dependencies**:

- `@react-native-firebase/messaging`
- Firebase project with Cloud Messaging enabled
- iOS: APNs certificate setup
- Android: google-services.json (already configured)

---

### 1.2 iOS Configuration

**Files to modify**:

- `ios/TodoApp/AppDelegate.mm`
- `ios/Podfile`
- iOS project settings (capabilities)

**Tasks**:

- [ ] Enable Push Notifications capability in Xcode
- [ ] Configure APNs certificate in Firebase Console
- [ ] Add UserNotifications framework
- [ ] Update AppDelegate for notification handling
- [ ] Add notification service extension (for rich notifications)
- [ ] Test on physical device (push notifications don't work on simulator)

**Required Changes**:

```objective-c
// AppDelegate.mm additions:
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

// Add UNUserNotificationCenterDelegate
// Implement notification delegate methods
```

---

### 1.3 Android Configuration

**Files to modify**:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/build.gradle`
- `android/app/src/main/java/com/todoapp/MainActivity.java`

**Tasks**:

- [ ] Add notification permissions to manifest
- [ ] Configure default notification channel
- [ ] Add notification icon resources
- [ ] Configure background message handler
- [ ] Test notification behavior (foreground, background, quit)

**Required Changes**:

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE"/>

<!-- Add default notification metadata -->
<meta-data
    android:name="com.google.firebase.messaging.default_notification_icon"
    android:resource="@drawable/ic_notification" />
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="default_channel" />
```

---

### 1.4 Integration with Existing Notification Store

**File**: `src/stores/notificationStore.ts`

**Tasks**:

- [ ] Add FCM token state management
- [ ] Sync remote notifications with local store
- [ ] Handle notification received from FCM
- [ ] Map FCM payload to app notification type
- [ ] Persist notification delivery status

**New Store Methods**:

```typescript
- setFCMToken(token: string): void
- addRemoteNotification(fcmPayload): void
- syncNotificationsWithBackend(): Promise<void>
- markNotificationDelivered(notificationId: string): Promise<void>
```

---

## Phase 2: Backend Notification Service

### 2.1 Backend Architecture Decision

**Choose one approach**:

#### Option A: Firebase Cloud Functions (Recommended)

**Pros**:

- Fully managed, serverless
- Tight Firebase integration
- Auto-scaling
- No server maintenance

**Cons**:

- Vendor lock-in
- Cold start latency
- Limited customization

#### Option B: Custom Backend (Node.js/Express)

**Pros**:

- Full control
- Complex business logic support
- Any hosting provider
- Better debugging

**Cons**:

- Server maintenance
- Scaling complexity
- More infrastructure cost

**Recommendation**: Start with Firebase Cloud Functions, migrate later if needed.

---

### 2.2 Firebase Cloud Functions Setup

**Project Structure**:

```
functions/
├── src/
│   ├── index.ts
│   ├── notifications/
│   │   ├── sendNotification.ts
│   │   ├── scheduleNotification.ts
│   │   ├── notificationTriggers.ts
│   │   └── notificationTypes.ts
│   ├── services/
│   │   ├── fcmService.ts
│   │   └── firestoreService.ts
│   └── utils/
│       └── validators.ts
├── package.json
├── tsconfig.json
└── .env
```

**Tasks**:

- [ ] Initialize Firebase Functions project
- [ ] Set up TypeScript configuration
- [ ] Install dependencies (firebase-admin, firebase-functions)
- [ ] Configure environment variables
- [ ] Set up deployment scripts

---

### 2.3 Firestore Database Schema

**Collections to create**:

#### `users/{userId}/devices`

```typescript
interface DeviceToken {
  token: string;
  platform: 'ios' | 'android';
  createdAt: Timestamp;
  lastUsed: Timestamp;
  appVersion: string;
  isActive: boolean;
}
```

#### `users/{userId}/notificationPreferences`

```typescript
interface NotificationPreferences {
  enabled: boolean;
  eventNotifications: boolean;
  messageNotifications: boolean;
  reminderNotifications: boolean;
  alertNotifications: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```

#### `notifications` (global collection)

```typescript
interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduledFor?: Timestamp;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  data?: Record<string, any>;
  error?: string;
}
```

#### `notificationTemplates`

```typescript
interface NotificationTemplate {
  id: string;
  name: string;
  title: string; // Supports {{variable}} syntax
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  icon?: string;
  action?: NotificationAction;
}
```

---

### 2.4 Cloud Functions Implementation

#### Function 1: `registerDeviceToken`

**Trigger**: HTTPS Callable
**Purpose**: Register/update user's FCM token

```typescript
export const registerDeviceToken = functions.https.onCall(
  async (data, context) => {
    // Validate authentication
    // Store/update device token in Firestore
    // Handle multiple devices per user
  },
);
```

#### Function 2: `sendNotification`

**Trigger**: HTTPS Callable
**Purpose**: Send push notification to specific user(s)

```typescript
export const sendNotification = functions.https.onCall(
  async (data, context) => {
    // Validate request
    // Check user preferences
    // Get user device tokens
    // Send via FCM
    // Log delivery status
  },
);
```

#### Function 3: `scheduleNotification`

**Trigger**: Firestore write
**Purpose**: Schedule notification for future delivery

```typescript
export const scheduleNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    // Check if notification is scheduled
    // Use Cloud Tasks or Pub/Sub for scheduling
  });
```

#### Function 4: `onEventCreated`

**Trigger**: Firestore write on events collection
**Purpose**: Auto-send notifications when events are created

```typescript
export const onEventCreated = functions.firestore
  .document('events/{eventId}')
  .onCreate(async (snap, context) => {
    // Get event details
    // Find relevant users
    // Send event notifications
  });
```

#### Function 5: `sendBulkNotifications`

**Trigger**: HTTPS Callable
**Purpose**: Send notifications to multiple users (batch)

```typescript
export const sendBulkNotifications = functions.https.onCall(
  async (data, context) => {
    // Validate admin role
    // Process user list
    // Send to up to 500 devices per batch
    // Use multicast messaging
  },
);
```

#### Function 6: `cleanupExpiredTokens`

**Trigger**: Scheduled (daily)
**Purpose**: Remove invalid/expired FCM tokens

```typescript
export const cleanupExpiredTokens = functions.pubsub
  .schedule('0 2 * * *')
  .onRun(async context => {
    // Query old/inactive tokens
    // Remove from Firestore
  });
```

---

### 2.5 FCM Admin SDK Integration

**File**: `functions/src/services/fcmService.ts`

**Tasks**:

- [ ] Initialize Firebase Admin SDK
- [ ] Create function to send single notification
- [ ] Create function to send multicast notification
- [ ] Handle FCM response (success/failure)
- [ ] Update token validity based on errors
- [ ] Implement retry logic for failures

**Key Functions**:

```typescript
async function sendToDevice(
  token: string,
  notification: NotificationPayload,
  data?: Record<string, string>,
): Promise<void>;

async function sendToMultipleDevices(
  tokens: string[],
  notification: NotificationPayload,
  data?: Record<string, string>,
): Promise<BatchResponse>;

async function sendToTopic(
  topic: string,
  notification: NotificationPayload,
): Promise<void>;
```

---

## Phase 3: User Preferences & Advanced Features

### 3.1 Notification Preferences Screen

**File**: `src/screens/NotificationPreferencesScreen.tsx`

**Tasks**:

- [ ] Create settings UI for notification preferences
- [ ] Toggle switches for each notification type
- [ ] Quiet hours time picker
- [ ] Sound and vibration settings
- [ ] Test notification button
- [ ] Save preferences to Firestore
- [ ] Sync preferences from backend

**UI Components**:

- Toggle for global notifications
- Toggles for each notification type
- Time picker for quiet hours
- Sound/vibration toggles
- "Send Test Notification" button

---

### 3.2 Notification Topics/Channels

**Purpose**: Allow users to subscribe to specific notification categories

**Tasks**:

- [ ] Define notification topics in Firebase
- [ ] Create topic subscription UI
- [ ] Implement subscribe/unsubscribe methods
- [ ] Sync topic subscriptions with backend

**Topics Examples**:

- `events_medical_conferences`
- `events_workshops`
- `reminders_daily`
- `alerts_critical`
- `news_product_updates`

---

### 3.3 Rich Notifications

**Features to add**:

- [ ] Images in notifications
- [ ] Action buttons (e.g., "View", "Dismiss", "Snooze")
- [ ] Progress indicators
- [ ] Large text notifications
- [ ] Inbox-style grouped notifications

**iOS**: Notification Service Extension required
**Android**: Built-in support

---

### 3.4 Notification Scheduling (Local)

**File**: `src/services/fcm/localNotificationService.ts`

**Tasks**:

- [ ] Schedule local notifications
- [ ] Cancel scheduled notifications
- [ ] List scheduled notifications
- [ ] Handle notification actions

**Use Cases**:

- Reminder notifications at specific times
- Event notifications 15 minutes before
- Daily check-in reminders

---

## Phase 4: Analytics & Monitoring

### 4.1 Notification Analytics

**Metrics to track**:

- Notifications sent
- Notifications delivered
- Notifications opened
- Notification dismissals
- Click-through rate by type

**Implementation**:

- [ ] Add analytics tracking to notification service
- [ ] Log events to Firebase Analytics
- [ ] Create dashboard queries
- [ ] Export data for reporting

---

### 4.2 Error Handling & Logging

**Tasks**:

- [ ] Centralized error logging
- [ ] Log notification failures
- [ ] Alert on high failure rates
- [ ] Create error reports

**Tools**:

- Firebase Crashlytics
- Cloud Functions logging
- Error tracking service (Sentry optional)

---

### 4.3 A/B Testing

**Test variations of**:

- Notification timing
- Message content
- Icons and images
- Call-to-action buttons

**Implementation**:

- Use Firebase Remote Config
- Track performance metrics
- Implement winner automatically

---

## Implementation Checklist

### Pre-Development

- [ ] Review Firebase project configuration
- [ ] Verify firebase-messaging dependency versions
- [ ] Set up development/staging/production environments
- [ ] Create Firebase project (if not exists)
- [ ] Enable Cloud Messaging in Firebase Console
- [ ] Set up billing (required for Cloud Functions)

### Phase 1 Checklist

- [ ] Implement FCM service (`fcmService.ts`)
- [ ] Configure iOS project for push notifications
- [ ] Configure Android project for push notifications
- [ ] Test notification permissions
- [ ] Test foreground notifications
- [ ] Test background notifications
- [ ] Test notification tap handling
- [ ] Integrate with existing notification store

### Phase 2 Checklist

- [ ] Initialize Firebase Cloud Functions
- [ ] Create Firestore database schema
- [ ] Implement `registerDeviceToken` function
- [ ] Implement `sendNotification` function
- [ ] Implement notification triggers
- [ ] Test end-to-end notification flow
- [ ] Deploy to staging environment
- [ ] Deploy to production

### Phase 3 Checklist

- [ ] Create notification preferences screen
- [ ] Implement topic subscriptions
- [ ] Add rich notification support
- [ ] Implement local notification scheduling
- [ ] Test all preference combinations

### Phase 4 Checklist

- [ ] Set up analytics tracking
- [ ] Configure error monitoring
- [ ] Create analytics dashboard
- [ ] Document API endpoints

---

## Testing Strategy

### Unit Tests

- [ ] FCM service functions
- [ ] Notification payload formatting
- [ ] Token validation
- [ ] Preference validation

### Integration Tests

- [ ] Device token registration flow
- [ ] Send notification end-to-end
- [ ] Notification store synchronization
- [ ] Preference updates

### Manual Testing

- [ ] iOS foreground notification
- [ ] iOS background notification
- [ ] iOS quit state notification
- [ ] Android foreground notification
- [ ] Android background notification
- [ ] Android quit state notification
- [ ] Deep linking from notification
- [ ] Multiple device handling
- [ ] Notification preferences

---

## Security Considerations

### Authentication

- [ ] Verify user authentication before token registration
- [ ] Validate notification sender permissions
- [ ] Implement rate limiting on Cloud Functions
- [ ] Protect against token abuse

### Data Privacy

- [ ] Store minimal user data
- [ ] Encrypt sensitive notification content
- [ ] Comply with GDPR/privacy regulations
- [ ] Allow users to delete all notification data

### Token Security

- [ ] Rotate tokens on app reinstall
- [ ] Invalidate tokens on logout
- [ ] Clean up orphaned tokens
- [ ] Monitor for suspicious token activity

---

## Performance Optimization

### Frontend

- [ ] Batch notification updates
- [ ] Debounce token registration
- [ ] Optimize notification store queries
- [ ] Use notification batching for multiple events

### Backend

- [ ] Use multicast messaging (up to 500 devices)
- [ ] Implement caching for user preferences
- [ ] Optimize Firestore queries
- [ ] Use Cloud Tasks for scheduled notifications

---

## Deployment Plan

### Staging Environment

1. Deploy Cloud Functions to staging
2. Test with staging Firebase project
3. Validate all notification flows
4. Performance and load testing

### Production Rollout

1. Deploy infrastructure changes
2. Gradual rollout (10% → 50% → 100%)
3. Monitor error rates
4. Monitor notification delivery rates
5. Gather user feedback

### Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous Cloud Functions version
- [ ] Ability to disable notifications globally
- [ ] Backup device tokens before major changes

---

## Documentation Requirements

### For Developers

- [ ] API documentation for Cloud Functions
- [ ] FCM integration guide
- [ ] Database schema documentation
- [ ] Environment setup guide

### For Users

- [ ] Notification preferences guide
- [ ] Privacy policy update (notifications)
- [ ] Troubleshooting guide

---

## Estimated Timeline

| Phase                      | Duration       | Dependencies           |
| -------------------------- | -------------- | ---------------------- |
| Phase 1: FCM Integration   | 3-5 days       | Firebase project setup |
| Phase 2: Backend Service   | 5-7 days       | Phase 1 complete       |
| Phase 3: Advanced Features | 3-5 days       | Phase 2 complete       |
| Phase 4: Analytics         | 2-3 days       | Phase 2 complete       |
| Testing & QA               | 3-4 days       | All phases             |
| Documentation              | 2 days         | All phases             |
| **Total**                  | **18-26 days** |                        |

---

## Cost Estimation

### Firebase Cloud Messaging

- **Free tier**: Unlimited notifications
- **Cost**: $0

### Cloud Functions

- **Free tier**: 2M invocations/month, 400K GB-seconds, 200K CPU-seconds
- **Estimated cost**: $5-20/month (depending on usage)

### Firestore

- **Free tier**: 1GB storage, 50K reads, 20K writes, 20K deletes per day
- **Estimated cost**: $5-15/month

### Total Estimated Cost

- **Development**: Free tier sufficient
- **Production (1000 active users)**: $10-35/month
- **Production (10,000 active users)**: $50-150/month

---

## Success Metrics

### Technical Metrics

- Notification delivery rate > 95%
- Notification open rate > 20%
- Average delivery latency < 5 seconds
- Failed token rate < 5%

### Business Metrics

- User engagement increase
- User retention improvement
- Feature adoption rate
- User satisfaction score

---

## Related Files

### Frontend Files

- `src/components/notifications/NotificationDemo.tsx` (line 1-262)
- `src/components/notifications/NotificationModal.tsx` (line 1-526)
- `src/types/notification.ts` (line 1-41)
- `src/stores/notificationStore.ts` (line 1-86)
- `src/services/notificationService.ts` (line 1-130)

### Files to Create

- `src/services/fcm/fcmService.ts`
- `src/services/fcm/localNotificationService.ts`
- `src/screens/NotificationPreferencesScreen.tsx`
- `functions/src/index.ts`
- `functions/src/notifications/sendNotification.ts`
- `functions/src/services/fcmService.ts`

### Configuration Files to Modify

- `ios/TodoApp/AppDelegate.mm`
- `android/app/src/main/AndroidManifest.xml`
- Firebase Console settings

---

## Next Steps

1. **Review and approve this plan** with the development team
2. **Set up Firebase project** (if not already done)
3. **Start with Phase 1** - FCM integration
4. **Iterative development** - Complete and test each phase before moving to next
5. **Continuous testing** throughout development
6. **Documentation** as you build

---

## Questions to Address Before Starting

1. Do we have a Firebase project set up?
2. Is billing enabled on Firebase project? (required for Cloud Functions)
3. What are the notification use cases priority?
4. Should we implement quiet hours from the start?
5. Do we need admin panel for sending notifications?
6. What is the expected number of daily active users?
7. Do we need notification history/archive?
8. Should notifications be synced across devices?
9. Do we need notification grouping/categories?
10. What are the compliance/privacy requirements?

---

## Additional Resources

### Documentation

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/messaging/usage)
- [FCM Architecture](https://firebase.google.com/docs/cloud-messaging/concept-options)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)

### Example Repositories

- [RNFirebase Messaging Demo](https://github.com/invertase/react-native-firebase/tree/main/packages/messaging)
- [FCM Best Practices](https://firebase.google.com/docs/cloud-messaging/best-practices)

---

**Document Version**: 1.0
**Last Updated**: 2026-03-04
**Author**: Development Team
