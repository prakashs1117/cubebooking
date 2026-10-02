import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Checkmark Circle Icon - Checkmark inside a circle
 */
const CheckmarkCircleIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M8 12l3 3 5-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheckmarkCircleIcon;
