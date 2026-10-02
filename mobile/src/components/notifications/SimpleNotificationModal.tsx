import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import CustomText from '@/components/common/CustomText';
import { CloseIcon } from '@/components/icons/components/CloseIcon';

interface SimpleNotificationModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function SimpleNotificationModal({ visible, onDismiss }: SimpleNotificationModalProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: theme.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 40,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text.primary,
    },
    closeButton: {
      padding: 8,
    },
    emptyState: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.text.secondary,
      fontSize: 14,
      marginTop: 12,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.content}>
            <View style={styles.header}>
              <CustomText style={styles.title}>Notifications</CustomText>
              <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
                <CloseIcon width={24} height={24} color={theme.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.emptyState}>
              <CustomText style={styles.emptyText}>No notifications yet</CustomText>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
