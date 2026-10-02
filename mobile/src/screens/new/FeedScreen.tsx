import React from 'react';
import { Dimensions } from 'react-native';
import FeedScreenMobile from './FeedScreen.mobile';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function FeedScreen() {
  return isTablet ? <FeedScreenMobile /> : <FeedScreenMobile />;
}
