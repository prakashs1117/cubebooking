import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * WizardScreen
 * Multi-step form for creating new requests (9 steps)
 * TODO: Implement step-based form with field validation
 */
const WizardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Request</Text>
      <Text style={styles.placeholder}>Wizard Screen (Steps 0-9)</Text>
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

export default WizardScreen;
