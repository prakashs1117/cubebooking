import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Close Circle Icon - X inside a circle
 */
const CloseCircleIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.2} />
      <Path
        d="M8 8l8 8M16 8l-8 8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CloseCircleIcon;
