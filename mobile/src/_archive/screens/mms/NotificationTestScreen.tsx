import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AppModal, ModalConfig } from '@components/modals';
import { useTheme } from '@theme/index';
import { BodyText, Heading3, Caption } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import notificationTriggers from '@utils/notificationTestData';

/**
 * NotificationTestScreen
 * Comprehensive notification testing interface
 * Use this screen to trigger all notification types and test scenarios
 */
const NotificationTestScreen: React.FC = () => {
  const { theme } = useTheme();
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const testSections = [
    {
      title: 'Event Notifications',
      icon: 'calendar' as const,
      color: theme.button.primary.background,
      tests: [
        {
          label: 'High Priority Event',
          description: 'Conference starting soon',
          trigger: notificationTriggers.eventHighPriority,
        },
        {
          label: 'Normal Priority Event',
          description: 'Workshop reminder',
          trigger: notificationTriggers.eventNormalPriority,
        },
        {
          label: 'Low Priority Event',
          description: 'Recording available',
          trigger: notificationTriggers.eventLowPriority,
        },
      ],
    },
    {
      title: 'Message Notifications',
      icon: 'mail' as const,
      color: theme.button.success.background,
      tests: [
        {
          label: 'Detailed Message',
          description: 'Message with navigation',
          trigger: notificationTriggers.messageDetailed,
        },
        {
          label: 'Simple Message',
          description: 'Basic message notification',
          trigger: notificationTriggers.messageSimple,
        },
      ],
    },
    {
      title: 'Alert Notifications',
      icon: 'bell' as const,
      color: theme.button.error.background,
      tests: [
        {
          label: 'Critical Alert',
          description: 'System update required',
          trigger: notificationTriggers.alertCritical,
        },
        {
          label: 'External Link Alert',
          description: 'Policy update with link',
          trigger: notificationTriggers.alertExternal,
        },
        {
          label: 'Security Alert',
          description: 'Security notification',
          trigger: notificationTriggers.alertSecurity,
        },
      ],
    },
    {
      title: 'Reminder Notifications',
      icon: 'clock' as const,
      color: theme.button.warning.background,
      tests: [
        {
          label: 'Profile Reminder',
          description: 'Complete profile',
          trigger: notificationTriggers.reminderProfile,
        },
        {
          label: 'Daily Check-in',
          description: 'Health check-in reminder',
          trigger: notificationTriggers.reminderDailyCheckin,
        },
        {
          label: 'Medication Reminder',
          description: 'Take medication',
          trigger: notificationTriggers.reminderMedication,
        },
      ],
    },
    {
      title: 'General Notifications',
      icon: 'sparkle' as const,
      color: theme.text.secondary,
      tests: [
        {
          label: 'Welcome Message',
          description: 'New user welcome',
          trigger: notificationTriggers.generalWelcome,
        },
        {
          label: 'Achievement',
          description: 'Achievement unlocked',
          trigger: notificationTriggers.generalAchievement,
        },
        {
          label: 'Feature Update',
          description: 'New feature available',
          trigger: notificationTriggers.generalUpdate,
        },
      ],
    },
  ];

  const bulkTests = [
    {
      label: 'All Priority Levels',
      description: 'Test low, normal, and high priority',
      icon: 'sparkle' as const,
      color: '#9333EA',
      trigger: notificationTriggers.allPriorityLevels,
    },
    {
      label: 'All Notification Types',
      description: 'One of each type',
      icon: 'bell' as const,
      color: '#06B6D4',
      trigger: notificationTriggers.allNotificationTypes,
    },
    {
      label: 'Multiple Notifications',
      description: 'Send 4 at once',
      icon: 'sparkle' as const,
      color: '#F59E0B',
      trigger: notificationTriggers.multipleNotifications,
    },
    {
      label: 'Stress Test',
      description: 'Send 10 rapid notifications',
      icon: 'bell' as const,
      color: '#EF4444',
      trigger: () => {
        setModal({
          variant: 'confirm',
          title: 'Stress Test',
          message: 'This will create 10 notifications rapidly. Continue?',
          confirmLabel: 'Start Test',
          onConfirm: notificationTriggers.stressTest,
        });
      },
    },
  ];

  const handleTrigger = (trigger: () => void, label: string) => {
    trigger();
    // Optional: Show a toast or brief feedback
    console.log(`Triggered: ${label}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Heading3 color={theme.text.primary} style={styles.headerTitle}>
          Notification Test Center
        </Heading3>
        <Caption color={theme.text.secondary} style={styles.headerSubtitle}>
          Test all notification types and scenarios
        </Caption>
      </View>

      {/* Individual Test Sections */}
      {testSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name={section.icon} size={20} color={section.color} />
            <BodyText color={theme.text.primary} style={styles.sectionTitle}>
              {section.title}
            </BodyText>
          </View>

          <View style={styles.testGrid}>
            {section.tests.map((test, testIndex) => (
              <TouchableOpacity
                key={testIndex}
                style={[
                  styles.testButton,
                  { backgroundColor: theme.background.card },
                ]}
                onPress={() => handleTrigger(test.trigger, test.label)}
                activeOpacity={0.7}
              >
                <BodyText
                  color={theme.text.primary}
                  style={styles.testLabel}
                  numberOfLines={2}
                >
                  {test.label}
                </BodyText>
                <Caption
                  color={theme.text.tertiary}
                  style={styles.testDescription}
                  numberOfLines={2}
                >
                  {test.description}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Bulk Tests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon
            name="sparkle"
            size={20}
            color={theme.button.primary.background}
          />
          <BodyText color={theme.text.primary} style={styles.sectionTitle}>
            Bulk Tests
          </BodyText>
        </View>

        <View style={styles.bulkTestGrid}>
          {bulkTests.map((test, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.bulkTestButton,
                { backgroundColor: theme.background.card },
              ]}
              onPress={() => handleTrigger(test.trigger, test.label)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.bulkTestIcon,
                  { backgroundColor: `${test.color}20` },
                ]}
              >
                <Icon name={test.icon} size={24} color={test.color} />
              </View>
              <View style={styles.bulkTestText}>
                <BodyText
                  color={theme.text.primary}
                  style={styles.bulkTestLabel}
                >
                  {test.label}
                </BodyText>
                <Caption
                  color={theme.text.tertiary}
                  style={styles.bulkTestDescription}
                >
                  {test.description}
                </Caption>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clear All Button */}
      <TouchableOpacity
        style={[
          styles.clearButton,
          { backgroundColor: theme.button.error.background },
        ]}
        onPress={() => {
          setModal({
            variant: 'confirm',
            title: 'Clear All Notifications',
            message: 'This will remove all notifications. Continue?',
            confirmLabel: 'Clear All',
            onConfirm: notificationTriggers.clearAll,
          });
        }}
        activeOpacity={0.8}
      >
        <Icon name="trash" size={20} color="#FFFFFF" />
        <BodyText color="#FFFFFF" style={styles.clearButtonText}>
          Clear All Notifications
        </BodyText>
      </TouchableOpacity>

      {/* Instructions */}
      <View
        style={[
          styles.instructionsBox,
          { backgroundColor: theme.background.card },
        ]}
      >
        <Caption color={theme.text.secondary} style={styles.instructionsText}>
          💡 Tap any button to trigger a notification
          {'\n'}🔔 Click the bell icon in the header to view notifications
          {'\n'}📱 Test notifications in different app states (foreground,
          background, quit)
        </Caption>
      </View>

      <AppModal config={modal} onClose={() => setModal(null)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  testGrid: {
    gap: 8,
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    minHeight: 70,
    justifyContent: 'center',
  },
  testLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  bulkTestGrid: {
    gap: 12,
  },
  bulkTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  bulkTestIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkTestText: {
    flex: 1,
  },
  bulkTestLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bulkTestDescription: {
    fontSize: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  instructionsBox: {
    padding: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default NotificationTestScreen;
