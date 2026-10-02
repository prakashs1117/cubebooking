import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import Icon from '@components/icons/Icon';

/**
 * HeaderType2 - Minimal header with only drawer menu button
 * No background, just a simple drawer icon
 */
const HeaderType2: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 60,
      backgroundColor: 'transparent',
    },
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <Icon name="hamburger" size={34} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderType2;
