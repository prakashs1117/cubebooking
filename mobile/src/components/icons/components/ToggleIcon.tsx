import React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Toggle/Switch Icon Component (Feature Flags)
 */
export const ToggleIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="2"
      y="8"
      width="20"
      height="8"
      rx="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="16" cy="12" r="3" fill={color} />
  </Svg>
);

/**
 * Toggle On Icon
 */
export const ToggleOnIcon: React.FC<IconComponentProps> = ToggleIcon;

/**
 * Vibrant Icon (Alias for Toggle)
 */
export const VibrantIcon: React.FC<IconComponentProps> = ToggleIcon;
