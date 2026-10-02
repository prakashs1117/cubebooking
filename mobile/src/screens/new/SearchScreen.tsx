import React, { useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import CustomText from '@/components/common/CustomText';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomHeader from '@/components/navigation/CustomHeader';

type SearchScreenNavigationProp = NativeStackNavigationProp<any>;

const SearchScreenHeader = () => <CustomHeader title="Search" />;

export default function SearchScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: {
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      color: theme.text.secondary,
    },
  });

  useEffect(() => {
    navigation.setOptions({
      header: SearchScreenHeader,
      headerShown: true,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CustomText variant="heading1" style={styles.title}>
          Search
        </CustomText>
        <CustomText variant="bodyText" style={styles.subtitle}>
          Search coming soon
        </CustomText>
      </View>
    </SafeAreaView>
  );
}
