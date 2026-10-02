import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@theme/index';
import { BodyText, Heading3 } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import {
  createNotification,
  notifyEvent,
  notifyReminder,
  notifyAlert,
  notifyMessage,
  clearAllNotifications,
} from '@services/notificationService';

/**
 * NotificationDemo Component
 * Demonstrates different types of notifications
 * Add this to any screen to test notifications
 */
const NotificationDemo: React.FC = () => {
  const { theme } = useTheme();

  const handleEventNotification = () => {
    notifyEvent(
      'Upcoming Event: Medical Conference',
      "The Annual Pharma Conference starts in 2 hours. Don't miss the keynote!",
      'event_123',
      'high',
    );
  };

  const handleReminderNotification = () => {
    notifyReminder(
      'Reminder: Complete Profile',
      'Complete your profile to unlock all features',
      'Profile',
    );
  };

  const handleAlertNotification = () => {
    notifyAlert(
      'Important Update',
      'A new version of the app is available. Please update to continue.',
      {
        type: 'navigate',
        screen: 'Settings',
      },
    );
  };

  const handleMessageNotification = () => {
    notifyMessage(
      'New Message from Dr. Smith',
      'Hi! I wanted to discuss the upcoming research project with you.',
      {
        type: 'navigate',
        screen: 'Home',
      },
    );
  };

  const handleGeneralNotification = () => {
    createNotification({
      title: 'Welcome!',
      message:
        'Thank you for using our app. Explore all the features available.',
      type: 'general',
      priority: 'low',
      icon: 'checkbox-checked',
    });
  };

  const handleMultipleNotifications = () => {
    // Create multiple notifications at once
    notifyEvent(
      'Event Starting Soon',
      'Workshop begins in 15 minutes',
      'event_1',
      'high',
    );
    notifyMessage(
      'New Connection',
      'Dr. Johnson wants to connect with you',
      'msg_1',
    );
    notifyReminder('Daily Check-in', "Don't forget your daily health check-in");
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <View style={styles.section}>
        <Heading3 color={theme.text.primary} style={styles.title}>
          Notification System Demo
        </Heading3>
        <BodyText color={theme.text.secondary} style={styles.description}>
          Test different types of notifications. Click the notification bell in
          the header to view them.
        </BodyText>
      </View>

      <View style={styles.buttonGrid}>
        {/* Event Notification */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleEventNotification}
        >
          <Icon
            name="calendar"
            size={32}
            color={theme.button.primary.background}
          />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            Event Notification
          </BodyText>
        </TouchableOpacity>

        {/* Reminder Notification */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleReminderNotification}
        >
          <Icon
            name="clock"
            size={32}
            color={theme.button.warning.background}
          />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            Reminder
          </BodyText>
        </TouchableOpacity>

        {/* Alert Notification */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleAlertNotification}
        >
          <Icon name="bell" size={32} color={theme.button.error.background} />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            Alert (High Priority)
          </BodyText>
        </TouchableOpacity>

        {/* Message Notification */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleMessageNotification}
        >
          <Icon name="mail" size={32} color={theme.button.success.background} />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            Message
          </BodyText>
        </TouchableOpacity>

        {/* General Notification */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleGeneralNotification}
        >
          <Icon name="checkbox-checked" size={32} color={theme.text.tertiary} />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            General
          </BodyText>
        </TouchableOpacity>

        {/* Multiple Notifications */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.background.card }]}
          onPress={handleMultipleNotifications}
        >
          <Icon
            name="sparkle"
            size={32}
            color={theme.button.primary.background}
          />
          <BodyText color={theme.text.primary} style={styles.buttonText}>
            Multiple at Once
          </BodyText>
        </TouchableOpacity>
      </View>

      {/* Clear All Button */}
      <TouchableOpacity
        style={[
          styles.clearButton,
          { backgroundColor: theme.button.error.background },
        ]}
        onPress={handleClearAll}
      >
        <Icon name="close" size={24} color="#FFFFFF" />
        <BodyText color="#FFFFFF" style={styles.clearButtonText}>
          Clear All Notifications
        </BodyText>
      </TouchableOpacity>

      {/* Usage Instructions */}
      <View
        style={[styles.infoBox, { backgroundColor: theme.background.card }]}
      >
        <Heading3 color={theme.text.primary} style={styles.infoTitle}>
          Features:
        </Heading3>
        <BodyText color={theme.text.secondary} style={styles.infoText}>
          • Click notification bell to view all notifications{'\n'}• Red badge
          shows unread count{'\n'}• Click notification to navigate (deep
          linking){'\n'}• Swipe or click X to delete individual notifications
          {'\n'}• "Mark all read" to clear unread status{'\n'}• "Clear all" to
          remove all notifications{'\n'}• NEW badge highlights recent
          notifications{'\n'}• Priority colors (red=high, blue=normal, gray=low)
        </BodyText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  button: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default NotificationDemo;
