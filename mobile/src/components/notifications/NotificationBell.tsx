import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useMerckTokens } from '@theme/merckTokens';
import { getFontStyle } from '@utils/fonts';
import Icon from '@components/icons/Icon';
import NotificationModal from './NotificationModal';
import { useNotifications } from '@hooks/useNotifications';
import { useNotificationStore } from '@stores/notificationStore';

interface NotificationBellProps {
  /** Icon size — default 22 */
  size?: number;
  /** Stroke/fill color — defaults to T.headerText */
  color?: string;
  /** Show unread badge — default true */
  showBadge?: boolean;
  /** Enable background polling — default true */
  autoFetch?: boolean;
  /** Polling interval ms — default 30000 */
  pollingInterval?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 22,
  color,
  showBadge = true,
  autoFetch = true,
  pollingInterval = 30_000,
}) => {
  const T = useMerckTokens();
  const [modalVisible, setModalVisible] = useState(false);
  const seedIfEmpty = useNotificationStore(s => s.seedIfEmpty);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  const { localUnreadCount } = useNotifications({
    enabled: autoFetch,
    pollingInterval,
    autoSync: true,
  });

  const iconColor = color ?? T.headerText;
  const hasUnread = localUnreadCount > 0;
  const badgeCount = localUnreadCount > 99 ? '99+' : String(localUnreadCount);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.btn}
      >
        <View style={styles.iconWrap}>
          <Icon
            name={hasUnread ? 'bell' : 'bell-outline'}
            size={size}
            color={iconColor}
          />
          {showBadge && hasUnread && (
            <View style={[styles.badge, { backgroundColor: T.error }]}>
              <Text
                style={[
                  styles.badgeText,
                  { fontSize: localUnreadCount > 9 ? 9 : 10, fontFamily: getFontStyle('caption').fontFamily },
                ]}
              >
                {badgeCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default NotificationBell;
