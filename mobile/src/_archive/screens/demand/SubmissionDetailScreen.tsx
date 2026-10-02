/**
 * SubmissionDetailScreen
 * Detailed view of a single submission with fields, timeline, chat, and role-based actions
 * Features:
 * - Load submission by ID from route params
 * - Display all 9-step fields with organized layout
 * - Timeline section showing submission history/status changes
 * - Chat/messaging thread with messages and send functionality
 * - Role-based actions (approve/reject if Approver, status change if Admin)
 * - TanStack Query for data management with pull-to-refresh
 * - Responsive mobile layout
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  FlatList,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';
import { submissionService } from '@services/api/demand';
import { useAuthStore } from '@stores/authStore';
import type { ChatMessage } from '@demand/shared';
import type { RequestsStackScreenProps } from '@navigation/demand';

/**
 * SubmissionDetailScreen Component
 */
const SubmissionDetailScreen: React.FC<
  RequestsStackScreenProps<'SubmissionDetail'>
> = ({ route }) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { id } = route.params;

  const [messageText, setMessageText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch submission data
  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError,
    refetch: refetchSubmission,
    isFetching: isFetchingSubmission,
  } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const result = await submissionService.getById(id);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnReconnect: true,
  });

  // Fetch messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
    isFetching: isFetchingMessages,
  } = useQuery({
    queryKey: ['submission-messages', id],
    queryFn: async () => {
      const result = await submissionService.getMessages(id);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnReconnect: true,
  });

  // Post message mutation
  const postMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const result = await submissionService.postMessage(id, text);
      return result;
    },
    onSuccess: newMessages => {
      queryClient.setQueryData(['submission-messages', id], newMessages);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to send message');
    },
  });

  // Change status mutation
  const changeStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const result = await submissionService.changeStatus(id, status as any);
      return result;
    },
    onSuccess: updatedSubmission => {
      queryClient.setQueryData(['submission', id], updatedSubmission);
      Alert.alert('Success', `Status changed to ${selectedStatus}`);
      setSelectedStatus(null);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to change status');
    },
  });

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!messageText.trim()) return;
    postMessageMutation.mutate(messageText);
    setMessageText('');
    Keyboard.dismiss();
  }, [messageText, postMessageMutation]);

  // Handle status change
  const handleStatusChange = useCallback(
    (status: string) => {
      setSelectedStatus(status);
      Alert.alert('Confirm Status Change', `Change status to ${status}?`, [
        { text: 'Cancel', onPress: () => setSelectedStatus(null) },
        {
          text: 'Confirm',
          onPress: () => {
            changeStatusMutation.mutate(status);
          },
        },
      ]);
    },
    [changeStatusMutation],
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchSubmission();
    refetchMessages();
  }, [refetchSubmission, refetchMessages]);

  // Check if current user can approve
  const canApprove = useMemo(
    () => user?.role === 'Approver' || user?.role === 'Super Admin',
    [user?.role],
  );

  // Check if current user can change status
  const canChangeStatus = useMemo(
    () => user?.role === 'Admin' || user?.role === 'Super Admin',
    [user?.role],
  );

  // Status options for admin
  const statusOptions = [
    'Draft',
    'Under Review',
    'Awaiting Input',
    'Approved',
    'Rejected',
  ];

  // Loading state
  if (submissionLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={theme.button.primary.background}
          />
          <Text
            style={[
              styles.loadingText,
              {
                color: theme.text.secondary,
                fontFamily: getFontStyle('body').fontFamily,
              },
            ]}
          >
            Loading submission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (submissionError || !submission) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text
            style={[
              styles.errorText,
              {
                color: theme.text.primary,
                fontFamily: getFontStyle('h4').fontFamily,
              },
            ]}
          >
            Failed to load submission
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.button.primary.background },
            ]}
            onPress={() => refetchSubmission()}
          >
            <Text
              style={[
                styles.retryButtonText,
                {
                  color: theme.button.primary.text,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isFetchingSubmission || isFetchingMessages}
              onRefresh={handleRefresh}
              tintColor={theme.button.primary.background}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text
                  style={[
                    styles.reference,
                    {
                      color: theme.text.secondary,
                      fontFamily: getFontStyle('caption').fontFamily,
                    },
                  ]}
                >
                  {submission.ref}
                </Text>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.text.primary,
                      fontFamily: getFontStyle('h3').fontFamily,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {submission.title || 'Untitled'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(submission.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { fontFamily: getFontStyle('caption').fontFamily },
                  ]}
                >
                  {submission.status}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <MetaItem
                label="Priority"
                value={submission.priority}
                theme={theme}
              />
              <MetaItem
                label="Department"
                value={submission.department}
                theme={theme}
              />
            </View>
            <View style={styles.metaRow}>
              <MetaItem
                label="Requestor"
                value={submission.requestorName}
                theme={theme}
              />
              <MetaItem
                label="Updated"
                value={formatDate(submission.updatedAt)}
                theme={theme}
              />
            </View>
          </View>

          {/* Submission Fields Section */}
          <View style={styles.fieldsSection}>
            <SectionTitle title="Submission Details" theme={theme} />

            {/* Business Context */}
            {submission.appName && (
              <FieldGroup title="Business Context" theme={theme}>
                <Field
                  label="App Name"
                  value={submission.appName}
                  theme={theme}
                />
                <Field
                  label="Sponsor"
                  value={submission.sponsorName}
                  theme={theme}
                />
                <Field
                  label="Contact Email"
                  value={submission.contactEmail}
                  theme={theme}
                />
                <Field
                  label="Problem Statement"
                  value={submission.problemStatement}
                  theme={theme}
                />
                <Field
                  label="Business Benefits"
                  value={submission.businessBenefits}
                  theme={theme}
                />
              </FieldGroup>
            )}

            {/* App Type */}
            {(submission.appType || submission.category) && (
              <FieldGroup title="Application Type" theme={theme}>
                <Field
                  label="Category"
                  value={submission.category}
                  theme={theme}
                />
                <Field
                  label="App Type"
                  value={
                    Array.isArray(submission.appType)
                      ? submission.appType.join(', ')
                      : submission.appType
                  }
                  theme={theme}
                />
                <Field
                  label="Access Type"
                  value={submission.accessType}
                  theme={theme}
                />
                <Field
                  label="Mobile Platforms"
                  value={
                    Array.isArray(submission.mobilePlatforms)
                      ? submission.mobilePlatforms.join(', ')
                      : ''
                  }
                  theme={theme}
                />
              </FieldGroup>
            )}

            {/* Audience */}
            {(submission.userGroups || submission.userCount) && (
              <FieldGroup title="Audience & Geography" theme={theme}>
                <Field
                  label="User Groups"
                  value={
                    Array.isArray(submission.userGroups)
                      ? submission.userGroups.join(', ')
                      : ''
                  }
                  theme={theme}
                />
                <Field
                  label="User Count"
                  value={submission.userCount}
                  theme={theme}
                />
                <Field
                  label="Geography"
                  value={submission.geography}
                  theme={theme}
                />
                <Field
                  label="Tech Level"
                  value={submission.techLevel}
                  theme={theme}
                />
              </FieldGroup>
            )}

            {/* Features */}
            {(submission.features || submission.hasDashboard) && (
              <FieldGroup title="Features" theme={theme}>
                <Field
                  label="Features"
                  value={
                    Array.isArray(submission.features)
                      ? submission.features.join(', ')
                      : ''
                  }
                  theme={theme}
                />
                <Field
                  label="Capabilities"
                  value={[
                    submission.hasDashboard ? 'Dashboard' : '',
                    submission.hasReporting ? 'Reporting' : '',
                    submission.hasNotifications ? 'Notifications' : '',
                    submission.hasFileUpload ? 'File Upload' : '',
                    submission.hasPayments ? 'Payments' : '',
                    submission.hasWorkflow ? 'Workflow' : '',
                    submission.hasOffline ? 'Offline' : '',
                    submission.hasRealtime ? 'Real-time' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  theme={theme}
                />
              </FieldGroup>
            )}

            {/* Security & Compliance */}
            {(submission.dataSensitivity || submission.requiresEncryption) && (
              <FieldGroup title="Security & Compliance" theme={theme}>
                <Field
                  label="Data Sensitivity"
                  value={submission.dataSensitivity}
                  theme={theme}
                />
                <Field
                  label="Compliance Requirements"
                  value={
                    Array.isArray(submission.complianceRequirements)
                      ? submission.complianceRequirements.join(', ')
                      : ''
                  }
                  theme={theme}
                />
                <Field
                  label="Security Features"
                  value={[
                    submission.requiresEncryption ? 'Encryption' : '',
                    submission.requiresAuditLog ? 'Audit Log' : '',
                    submission.requiresPenTest ? 'Pen Test' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  theme={theme}
                />
              </FieldGroup>
            )}

            {/* Design & Integration */}
            {(submission.designStyle || submission.hasIntegrations) && (
              <FieldGroup title="Design & Integration" theme={theme}>
                <Field
                  label="Design Style"
                  value={submission.designStyle}
                  theme={theme}
                />
                <Field
                  label="Responsive"
                  value={submission.isResponsive ? 'Yes' : 'No'}
                  theme={theme}
                />
                <Field
                  label="Integrations"
                  value={[
                    submission.needsEmail ? 'Email' : '',
                    submission.needsSMS ? 'SMS' : '',
                    submission.needsCRM ? 'CRM' : '',
                    submission.needsERP ? 'ERP' : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  theme={theme}
                />
              </FieldGroup>
            )}
          </View>

          {/* Timeline Section */}
          {submission.timeline && submission.timeline.length > 0 && (
            <View style={styles.timelineSection}>
              <SectionTitle title="Timeline" theme={theme} />
              {submission.timeline.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={index === submission.timeline!.length - 1}
                  theme={theme}
                />
              ))}
            </View>
          )}

          {/* Messages Section */}
          <View style={styles.messagesSection}>
            <SectionTitle title="Discussion" theme={theme} />
            {messagesLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator color={theme.button.primary.background} />
              </View>
            ) : messages.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.text.secondary,
                    fontFamily: getFontStyle('body').fontFamily,
                  },
                ]}
              >
                No messages yet
              </Text>
            ) : (
              <FlatList
                data={messages}
                keyExtractor={msg => msg.id}
                scrollEnabled={false}
                renderItem={({ item: message }) => (
                  <MessageBubble
                    message={message}
                    isOwn={message.self || message.author === user?.email}
                    theme={theme}
                  />
                )}
              />
            )}
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Message Input Section */}
        <View
          style={[
            styles.messageInputContainer,
            {
              backgroundColor: theme.background.secondary,
              borderTopColor: theme.text.tertiary,
            },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: theme.background.primary,
                color: theme.text.primary,
                borderColor: theme.text.tertiary,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={theme.text.secondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.button.primary.background,
                opacity: messageText.trim() ? 1 : (0.5 as any),
              },
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || postMessageMutation.isPending}
          >
            {postMessageMutation.isPending ? (
              <ActivityIndicator
                color={theme.button.primary.text}
                size="small"
              />
            ) : (
              <Text
                style={[
                  styles.sendButtonText,
                  {
                    color: theme.button.primary.text,
                    fontFamily: getFontStyle('body').fontFamily,
                  },
                ]}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Role-Based Actions */}
        {(canApprove || canChangeStatus) && (
          <View
            style={[
              styles.actionsContainer,
              {
                backgroundColor: theme.background.secondary,
                borderTopColor: theme.text.tertiary,
              },
            ]}
          >
            {canApprove && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleStatusChange('Approved')}
                  disabled={changeStatusMutation.isPending}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      { fontFamily: getFontStyle('body').fontFamily },
                    ]}
                  >
                    Approve
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleStatusChange('Rejected')}
                  disabled={changeStatusMutation.isPending}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color: '#FFF' as any,
                        fontFamily: getFontStyle('body').fontFamily,
                      },
                    ]}
                  >
                    Reject
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {canChangeStatus && (
              <TouchableOpacity
                style={[styles.actionButton, styles.statusButton]}
                onPress={() => {
                  Alert.alert('Change Status', 'Select a new status', [
                    ...statusOptions.map(status => ({
                      text: status,
                      onPress: () => handleStatusChange(status),
                    })),
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
                disabled={changeStatusMutation.isPending}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    {
                      color: '#FFF' as any,
                      fontFamily: getFontStyle('body').fontFamily,
                    },
                  ]}
                >
                  Change Status
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Meta Item Component
 */
interface MetaItemProps {
  label: string;
  value: string | undefined;
  theme: any;
}

const MetaItem: React.FC<MetaItemProps> = ({ label, value, theme }) => (
  <View style={styles.metaItem}>
    <Text
      style={[
        styles.metaLabel,
        {
          color: theme.text.secondary,
          fontFamily: getFontStyle('caption').fontFamily,
        },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.metaValue,
        {
          color: theme.text.primary,
          fontFamily: getFontStyle('body').fontFamily,
        },
      ]}
      numberOfLines={1}
    >
      {value || 'N/A'}
    </Text>
  </View>
);

/**
 * Section Title Component
 */
interface SectionTitleProps {
  title: string;
  theme: any;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, theme }) => (
  <Text
    style={[
      styles.sectionTitle,
      { color: theme.text.primary, fontFamily: getFontStyle('h4').fontFamily },
    ]}
  >
    {title}
  </Text>
);

/**
 * Field Group Component
 */
interface FieldGroupProps {
  title: string;
  theme: any;
  children: React.ReactNode;
}

const FieldGroup: React.FC<FieldGroupProps> = ({ title, theme, children }) => (
  <View
    style={[styles.fieldGroup, { backgroundColor: theme.background.secondary }]}
  >
    <Text
      style={[
        styles.fieldGroupTitle,
        {
          color: theme.text.primary,
          fontFamily: getFontStyle('body').fontFamily,
        },
      ]}
    >
      {title}
    </Text>
    {children}
  </View>
);

/**
 * Field Component
 */
interface FieldProps {
  label: string;
  value: string | undefined;
  theme: any;
}

const Field: React.FC<FieldProps> = ({ label, value, theme }) => {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text
        style={[
          styles.fieldLabel,
          {
            color: theme.text.secondary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.fieldValue,
          {
            color: theme.text.primary,
            fontFamily: getFontStyle('body').fontFamily,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

/**
 * Timeline Item Component
 */
interface TimelineItemProps {
  event: any;
  isLast: boolean;
  theme: any;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  isLast,
  theme,
}) => (
  <View style={styles.timelineItem}>
    <View
      style={[
        styles.timelineDot,
        { backgroundColor: theme.button.primary.background },
      ]}
    />
    {!isLast && (
      <View
        style={[styles.timelineLine, { backgroundColor: theme.text.tertiary }]}
      />
    )}
    <View style={styles.timelineContent}>
      <Text
        style={[
          styles.timelineAction,
          {
            color: theme.text.primary,
            fontFamily: getFontStyle('body').fontFamily,
          },
        ]}
      >
        {event.action}
      </Text>
      <Text
        style={[
          styles.timelineActor,
          {
            color: theme.text.secondary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        {event.actor} • {formatDate(event.time)}
      </Text>
    </View>
  </View>
);

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  theme: any;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  theme,
}) => (
  <View
    style={[
      styles.messageBubbleContainer,
      isOwn && styles.messageBubbleContainerOwn,
    ]}
  >
    <View
      style={[
        styles.messageBubble,
        {
          backgroundColor: isOwn
            ? theme.button.primary.background
            : theme.background.secondary,
        },
      ]}
    >
      <Text
        style={[
          styles.messageRole,
          {
            color: isOwn ? theme.button.primary.text : theme.text.secondary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        {message.role}
      </Text>
      <Text
        style={[
          styles.messageText,
          {
            color: isOwn ? theme.button.primary.text : theme.text.primary,
            fontFamily: getFontStyle('body').fontFamily,
          },
        ]}
      >
        {message.text}
      </Text>
      <Text
        style={[
          styles.messageTime,
          {
            color: isOwn ? theme.button.primary.text : theme.text.secondary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        {formatDate(message.time)}
      </Text>
    </View>
  </View>
);

/**
 * Utility Functions
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'Draft':
    case 'Under Review':
      return '#F59E0B';
    case 'Approved':
      return '#10B981';
    case 'Rejected':
      return '#EF4444';
    case 'Awaiting Input':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Header Section
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  reference: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Fields Section
  fieldsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldGroup: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  fieldGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
  },
  fieldValue: {
    fontSize: 13,
  },

  // Timeline Section
  timelineSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
    marginRight: 12,
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    left: 5,
    top: 12,
    bottom: -16,
  },
  timelineContent: {
    flex: 1,
    gap: 4,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: '500',
  },
  timelineActor: {
    fontSize: 12,
  },

  // Messages Section
  messagesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  messageBubbleContainer: {
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  messageBubbleContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '85%',
    gap: 2,
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13,
  },
  messageTime: {
    fontSize: 10,
  },

  // Message Input
  messageInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  statusButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom Padding
  bottomPadding: {
    height: 32,
  },
});

export default SubmissionDetailScreen;
