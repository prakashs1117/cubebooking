/**
 * Notification Test Data Utilities
 * Use these functions to easily trigger test notifications in development
 */

import {
  createNotification,
  notifyEvent,
  notifyReminder,
  notifyAlert,
  notifyMessage,
  clearAllNotifications,
} from '@services/notificationService';

/**
 * Sample Notification Data
 * Import this into any screen to test notifications
 */

// Event Notifications
export const triggerEventHighPriority = () => {
  notifyEvent(
    'Upcoming Event: Annual Medical Conference',
    "The 2026 Pharma Innovation Summit starts in 2 hours. Keynote speaker: Dr. Sarah Johnson on 'Future of Precision Medicine'",
    'event_2026_conf_001',
    'high',
  );
};

export const triggerEventNormalPriority = () => {
  notifyEvent(
    'Workshop Reminder',
    "Tomorrow's workshop on Clinical Data Analysis begins at 10:00 AM. Room: Conference Hall B",
    'event_workshop_042',
    'normal',
  );
};

export const triggerEventLowPriority = () => {
  notifyEvent(
    'Event Recording Available',
    "The recording of 'Introduction to Clinical Trials' is now available in your library.",
    'event_recording_089',
    'low',
  );
};

// Message Notifications
export const triggerMessageNotification = () => {
  notifyMessage(
    'New Message from Dr. Michael Chen',
    "Hi! I reviewed your research proposal. Let's schedule a meeting to discuss the methodology section. Are you free tomorrow?",
    {
      type: 'navigate',
      screen: 'Messages',
      params: {
        conversationId: 'conv_12345',
        userId: 'user_dr_chen',
      },
    },
  );
};

export const triggerMessageSimple = () => {
  notifyMessage(
    'New Message from Dr. Sarah',
    'Can we discuss the research findings?',
  );
};

// Alert Notifications
export const triggerAlertCritical = () => {
  notifyAlert(
    'Critical System Update Required',
    'A security update is available. Please update your app within 24 hours to continue using all features.',
    {
      type: 'navigate',
      screen: 'Settings',
      params: {
        tab: 'updates',
      },
    },
  );
};

export const triggerAlertExternal = () => {
  notifyAlert(
    'Important Policy Update',
    'New data privacy policy is now in effect. Please review the changes.',
    {
      type: 'external',
      url: 'https://example.com/privacy-policy',
    },
  );
};

export const triggerSecurityAlert = () => {
  notifyAlert(
    'Security Alert',
    'Unusual login detected from a new device. If this was not you, please secure your account immediately.',
  );
};

// Reminder Notifications
export const triggerReminderProfile = () => {
  notifyReminder(
    'Complete Your Profile',
    'Add your specialization and research interests to connect with relevant colleagues and events.',
    'Profile',
    { section: 'edit' },
  );
};

export const triggerReminderDailyCheckin = () => {
  notifyReminder(
    'Daily Health Check-in',
    "Don't forget to log your daily health metrics. Consistency is key!",
  );
};

export const triggerReminderMedication = () => {
  notifyReminder(
    'Medication Reminder',
    'Time to take your evening medication. Stay healthy!',
  );
};

// General Notifications
export const triggerGeneralWelcome = () => {
  createNotification({
    title: 'Welcome to TodoApp!',
    message:
      'Thank you for joining our community. Explore events, connect with peers, and manage your schedule efficiently.',
    type: 'general',
    priority: 'low',
    icon: 'checkbox-checked',
  });
};

export const triggerGeneralAchievement = () => {
  createNotification({
    title: 'Achievement Unlocked!',
    message:
      "You've attended 10 events this month. Keep up the great networking!",
    type: 'general',
    priority: 'low',
    icon: 'sparkle',
    action: {
      type: 'navigate',
      screen: 'Profile',
      params: {
        tab: 'achievements',
      },
    },
  });
};

export const triggerGeneralUpdate = () => {
  createNotification({
    title: 'New Feature Available',
    message:
      'Check out the new event discovery feature. Find events tailored to your interests!',
    type: 'general',
    priority: 'normal',
    icon: 'sparkle',
  });
};

// Bulk Test Functions
export const triggerAllPriorityLevels = () => {
  createNotification({
    title: 'Low Priority Notification',
    message: 'This is a low priority notification example',
    type: 'general',
    priority: 'low',
    icon: 'bell',
  });

  setTimeout(() => {
    createNotification({
      title: 'Normal Priority Notification',
      message: 'This is a normal priority notification example',
      type: 'general',
      priority: 'normal',
      icon: 'bell',
    });
  }, 500);

  setTimeout(() => {
    createNotification({
      title: 'High Priority Notification',
      message: 'This is a high priority notification example',
      type: 'alert',
      priority: 'high',
      icon: 'bell',
    });
  }, 1000);
};

export const triggerAllNotificationTypes = () => {
  // Event
  notifyEvent(
    'Event Type Test',
    'This is an event notification',
    'test_event_001',
  );

  setTimeout(() => {
    // Message
    notifyMessage('Message Type Test', 'This is a message notification');
  }, 500);

  setTimeout(() => {
    // Alert
    notifyAlert('Alert Type Test', 'This is an alert notification');
  }, 1000);

  setTimeout(() => {
    // Reminder
    notifyReminder('Reminder Type Test', 'This is a reminder notification');
  }, 1500);

  setTimeout(() => {
    // General
    createNotification({
      title: 'General Type Test',
      message: 'This is a general notification',
      type: 'general',
      priority: 'normal',
      icon: 'bell',
    });
  }, 2000);
};

export const triggerMultipleNotifications = () => {
  notifyEvent(
    'Event Starting Soon',
    'Workshop begins in 15 minutes',
    'event_1',
    'high',
  );

  setTimeout(() => {
    notifyMessage('New Connection', 'Dr. Johnson wants to connect with you', {
      type: 'navigate',
      screen: 'Home',
    });
  }, 300);

  setTimeout(() => {
    notifyReminder('Daily Check-in', "Don't forget your daily health check-in");
  }, 600);

  setTimeout(() => {
    notifyAlert('System Update', 'A new version is available');
  }, 900);
};

export const triggerStressTest = () => {
  // Create 10 notifications rapidly
  for (let i = 1; i <= 10; i++) {
    setTimeout(() => {
      createNotification({
        title: `Stress Test Notification #${i}`,
        message: `This is notification number ${i} in the stress test`,
        type: i % 2 === 0 ? 'event' : 'message',
        priority: i > 7 ? 'high' : i > 3 ? 'normal' : 'low',
        icon: 'bell',
      });
    }, i * 200);
  }
};

// Clear all
export const clearAll = () => {
  clearAllNotifications();
};

// Export all triggers as an object for easy access
export const notificationTriggers = {
  // Events
  eventHighPriority: triggerEventHighPriority,
  eventNormalPriority: triggerEventNormalPriority,
  eventLowPriority: triggerEventLowPriority,

  // Messages
  messageDetailed: triggerMessageNotification,
  messageSimple: triggerMessageSimple,

  // Alerts
  alertCritical: triggerAlertCritical,
  alertExternal: triggerAlertExternal,
  alertSecurity: triggerSecurityAlert,

  // Reminders
  reminderProfile: triggerReminderProfile,
  reminderDailyCheckin: triggerReminderDailyCheckin,
  reminderMedication: triggerReminderMedication,

  // General
  generalWelcome: triggerGeneralWelcome,
  generalAchievement: triggerGeneralAchievement,
  generalUpdate: triggerGeneralUpdate,

  // Bulk tests
  allPriorityLevels: triggerAllPriorityLevels,
  allNotificationTypes: triggerAllNotificationTypes,
  multipleNotifications: triggerMultipleNotifications,
  stressTest: triggerStressTest,

  // Clear
  clearAll,
};

// Default export
export default notificationTriggers;
