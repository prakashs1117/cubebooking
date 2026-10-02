import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * WizardReviewScreen
 * Review screen before submitting new request
 * TODO: Implement review/confirmation UI with submit button
 */
const WizardReviewScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Request</Text>
      <Text style={styles.placeholder}>Wizard Review Screen</Text>
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

export default WizardReviewScreen;
