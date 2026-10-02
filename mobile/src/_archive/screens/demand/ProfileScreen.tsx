import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ProfileScreen
 * User profile page (visible to all authenticated users)
 * TODO: Implement profile view/edit, preferences, logout
 */
const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.placeholder}>Profile Screen</Text>
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

export default ProfileScreen;
