import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Info Icon Component (Circle with 'i')
 */
export const InfoIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 16V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="8"
      r="0.5"
      fill={color}
      stroke={color}
      strokeWidth="1"
    />
  </Svg>
);

/**
 * Info Circle Icon (Alias)
 */
export const InfoCircleIcon: React.FC<IconComponentProps> = InfoIcon;
export const AlertCircleIcon: React.FC<IconComponentProps> = InfoIcon;
