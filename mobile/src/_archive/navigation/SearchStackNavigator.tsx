import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchStackParamList } from '@/types/navigation';

import SearchScreen from '@screens/SearchScreen';
import BarcodeScreen from '@screens/BarcodeScreen';
import ArticleDetailScreen from '@screens/ArticleDetailScreen';
import SafetyLabelScreen from '@screens/SafetyLabelScreen';

const Stack = createStackNavigator<SearchStackParamList>();

const SearchStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchList" component={SearchScreen} />
    <Stack.Screen
      name="BarcodeScanner"
      component={BarcodeScreen}
      options={{ presentation: 'fullScreenModal' }}
    />
    <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
    <Stack.Screen name="SafetyLabel" component={SafetyLabelScreen} />
  </Stack.Navigator>
);

export default SearchStackNavigator;
