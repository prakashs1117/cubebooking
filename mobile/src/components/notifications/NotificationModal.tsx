import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@theme/index';
import { useMerckTokens } from '@theme/merckTokens';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import { IconName } from '@components/icons/types';
import { useNotificationStore } from '@stores/notificationStore';
import { Notification, NotificationType } from '@/types/notification';
import { formatRelativeTime } from '@utils/dateUtils';
import { useNotifications } from '@hooks/useNotifications';
import { useNotificationMutations } from '@hooks/useNotificationMutations';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * NotificationModal Component
 * Displays all notifications with read/unread status, delete, and deep linking
 */
const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme, isDark } = useTheme();
  const T = useMerckTokens();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Fetch notifications from API with auto-polling (20 seconds when modal is open)
  const { localNotifications, localUnreadCount, isRefetching, refetch } =
    useNotifications({
      enabled: visible, // Only fetch when modal is visible
      pollingInterval: 20000, // Poll every 20 seconds for real-time feel
      autoSync: true, // Auto-sync with local store
    });

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  // Get notification data from synced store
  const notifications = localNotifications; // Use synced local notifications
  const unreadCount = localUnreadCount; // Use synced unread count

  // Get mutation actions (with backend sync)
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationMutations();

  // Get local-only actions (no backend sync needed)
  const markAllAsOld = useNotificationStore(state => state.markAllAsOld);

  // Animate modal
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Mark all as old when modal opens
      markAllAsOld();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, markAllAsOld]);

  // Get icon based on notification type
  const getNotificationIcon = (
    type: NotificationType,
    customIcon?: string,
  ): IconName => {
    // If API provides a custom icon, use it directly (now we support all API icon names)
    if (customIcon) {
      // Check if the icon exists in our registry, otherwise fallback to type-based icon
      const supportedIcons: IconName[] = [
        'alarm',
        'warning',
        'how_to_reg',
        'campaign',
        'add_circle',
        'system_update',
        'build',
        'rate_review',
        'event',
        'schedule_send',
        'poll',
        'person_add',
        'thumb_up',
        'confirmation_number',
        'waving_hand',
        'bell',
        'mail',
        'calendar',
        'clock',
      ];

      if (supportedIcons.includes(customIcon as IconName)) {
        return customIcon as IconName;
      }
    }

    // Fallback to type-based icon
    switch (type) {
      case 'event':
        return 'calendar';
      case 'message':
        return 'mail';
      case 'alert':
        return 'bell';
      case 'reminder':
        return 'clock';
      default:
        return 'bell';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.button.error.background;
      case 'normal':
        return theme.button.primary.background;
      case 'low':
        return theme.text.tertiary;
      default:
        return theme.text.tertiary;
    }
  };

  // Handle notification click (deep linking)
  const handleNotificationPress = (notification: Notification) => {
    // Mark as read (with backend sync)
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle deep linking
    if (notification.action) {
      const { type, screen, params, url } = notification.action;

      switch (type) {
        case 'navigate':
          if (screen) {
            onClose();
            // Navigate to the specified screen with params
            navigation.navigate(screen, params || {});
          }
          break;

        case 'external':
        case 'open_url':
          if (url) {
            // Handle external URLs (could open browser)
            console.log('Open external URL:', url);
            // TODO: Use Linking.openURL(url) for actual URL opening
          }
          break;

        case 'dismiss':
          // Just close the modal
          onClose();
          break;

        default:
          console.warn('Unknown action type:', type);
      }
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  // Handle mark as read/unread
  const handleToggleRead = (notification: Notification) => {
    markAsRead(notification.id);
  };

  // Component to render icon or image
  const NotificationIconOrImage: React.FC<{
    notification: Notification;
    isUnread: boolean;
    priorityColor: string;
  }> = ({ notification, isUnread, priorityColor }) => {
    const [imageError, setImageError] = useState(false);
    const iconName = getNotificationIcon(notification.type, notification.icon);

    // If notification has imageUrl and no error, show image
    if (notification.imageUrl && !imageError) {
      return (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isUnread
                ? `${priorityColor}20`
                : theme.background.tertiary,
              overflow: 'hidden',
            },
          ]}
        >
          <Image
            source={{ uri: notification.imageUrl }}
            style={styles.notificationImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        </View>
      );
    }

    // Otherwise, show icon
    return (
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isUnread
              ? `${priorityColor}20`
              : theme.background.tertiary,
          },
        ]}
      >
        <Icon name={iconName} size={24} color={priorityColor} />
      </View>
    );
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.read;
    const priorityColor = getPriorityColor(item.priority);

    return (
      <View
        style={[
          styles.notificationItem,
          {
            backgroundColor: isUnread
              ? theme.background.card
              : theme.background.secondary,
            borderLeftColor: isUnread ? priorityColor : 'transparent',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          {/* Icon or Image */}
          <NotificationIconOrImage
            notification={item}
            isUnread={isUnread}
            priorityColor={priorityColor}
          />

          {/* Content */}
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text.primary,
                    fontFamily: getFontStyle('body').fontFamily,
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
                {item.isNew && (
                  <View
                    style={[
                      styles.newBadge,
                      { backgroundColor: theme.button.error.background },
                    ]}
                  >
                    <Text style={[styles.newBadgeText, { color: '#FFFFFF' }]}>
                      NEW
                    </Text>
                  </View>
                )}
              </Text>
              {isUnread && (
                <View
                  style={[styles.unreadDot, { backgroundColor: priorityColor }]}
                />
              )}
            </View>

            <Text
              style={[
                styles.message,
                {
                  color: theme.text.secondary,
                  fontFamily: getFontStyle('body').fontFamily,
                },
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            <Text
              style={[
                styles.timestamp,
                {
                  color: theme.text.tertiary,
                  fontFamily: getFontStyle('caption').fontFamily,
                },
              ]}
            >
              {formatRelativeTime(item.timestamp, t, i18n.language)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actions}>
          {isUnread && (
            <TouchableOpacity
              onPress={() => handleToggleRead(item)}
              style={styles.actionButton}
            >
              <Icon
                name="checkbox-checked"
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          >
            <Icon name="close" size={20} color={theme.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="bell-outline" size={64} color={theme.text.tertiary} />
      <Text
        style={[
          styles.emptyText,
          {
            color: theme.text.secondary,
            fontFamily: getFontStyle('body').fontFamily,
          },
        ]}
      >
        No notifications
      </Text>
      <Text
        style={[
          styles.emptySubtext,
          {
            color: theme.text.tertiary,
            fontFamily: getFontStyle('caption').fontFamily,
          },
        ]}
      >
        You're all caught up!
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.background.primary,
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              backgroundColor: T.headerBackground,
              borderBottomWidth: 1,
              borderBottomColor: T.borderDefault,
            },
          ]}
        >
          {/* Close button in top right */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={26} color={T.headerText} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            {/* Title with loading indicator */}
            <View style={styles.headerTitleRow}>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: T.headerText,
                    fontFamily: getFontStyle('h3').fontFamily,
                  },
                ]}
              >
                Notifications
                {unreadCount > 0 && (
                  <Text
                    style={[styles.unreadCount, { color: T.tabInactive }]}
                  >
                    {' '}
                    ({unreadCount})
                  </Text>
                )}
              </Text>
              {isRefetching && !isManualRefreshing && (
                <ActivityIndicator
                  size="small"
                  color={T.green}
                  style={styles.loadingIndicator}
                />
              )}
            </View>

            {/* Tag-style action buttons */}
            {(unreadCount > 0 || notifications.length > 0) && (
              <View style={styles.tagContainer}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={markAllAsRead}
                    style={[
                      styles.tagButton,
                      { backgroundColor: T.green + '18', borderWidth: 1, borderColor: T.green + '40' },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="checkbox-checked"
                      size={14}
                      color={T.green}
                    />
                    <Text
                      style={[
                        styles.tagButtonText,
                        {
                          color: T.green,
                          fontFamily: getFontStyle('caption').fontFamily,
                        },
                      ]}
                    >
                      Mark all read
                    </Text>
                  </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                  <TouchableOpacity
                    onPress={clearAllNotifications}
                    style={[
                      styles.tagButton,
                      { backgroundColor: T.error + '18', borderWidth: 1, borderColor: T.error + '40' },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="trash"
                      size={14}
                      color={T.error}
                    />
                    <Text
                      style={[
                        styles.tagButtonText,
                        {
                          color: T.error,
                          fontFamily: getFontStyle('caption').fontFamily,
                        },
                      ]}
                    >
                      Clear all
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isManualRefreshing}
              onRefresh={handleManualRefresh}
              tintColor={isDark ? '#FFFFFF' : theme.button.primary.background}
              colors={[theme.button.primary.background]}
            />
          }
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    position: 'relative',
  },
  headerContent: {
    paddingRight: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    bottom: 14,
    padding: 4,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  newBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 12,
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NotificationModal;
