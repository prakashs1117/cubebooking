import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '@navigation/types';
import FeedScreen from '@screens/new/FeedScreen';
import PostDetailScreen from '@screens/new/PostDetailScreen';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedList" component={FeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
}
