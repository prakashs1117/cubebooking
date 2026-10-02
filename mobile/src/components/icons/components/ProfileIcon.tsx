import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Profile Icon Component (Filled)
 */
export const ProfileIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="8" r="4" fill={color} />
    <Path
      d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V20Z"
      fill={color}
    />
  </Svg>
);

/**
 * Profile Icon Outline Component
 */
export const ProfileOutlineIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V20Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * User Icon (Alias for Profile)
 */
export const UserIcon: React.FC<IconComponentProps> = ProfileIcon;
export const UserOutlineIcon: React.FC<IconComponentProps> = ProfileOutlineIcon;
