import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * NotificationsScreen
 * List of notifications for user
 * TODO: Implement notifications list with filtering and actions
 */
const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.placeholder}>Notifications Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationsScreen;
