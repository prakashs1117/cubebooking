import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const BarcodeIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x="2" y="4" width="2" height="16" fill={color} />
    <Rect x="5" y="4" width="1" height="16" fill={color} />
    <Rect x="7" y="4" width="2" height="16" fill={color} />
    <Rect x="10" y="4" width="1" height="16" fill={color} />
    <Rect x="12" y="4" width="3" height="16" fill={color} />
    <Rect x="16" y="4" width="1" height="16" fill={color} />
    <Rect x="18" y="4" width="2" height="16" fill={color} />
    <Rect x="21" y="4" width="1" height="16" fill={color} />
  </Svg>
);
