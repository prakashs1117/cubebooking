import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * UsersScreen
 * User management screen (Admin/Super Admin only)
 * TODO: Implement user list, roles management, enable/disable users
 */
const UsersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <Text style={styles.placeholder}>Users Screen</Text>
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

export default UsersScreen;
