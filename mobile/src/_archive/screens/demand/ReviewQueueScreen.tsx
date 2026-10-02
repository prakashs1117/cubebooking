import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ReviewQueueScreen
 * Review queue for pending approvals (Approver/Super Admin only)
 * TODO: Implement review queue with approval/rejection actions
 */
const ReviewQueueScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Queue</Text>
      <Text style={styles.placeholder}>Review Queue Screen</Text>
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

export default ReviewQueueScreen;
