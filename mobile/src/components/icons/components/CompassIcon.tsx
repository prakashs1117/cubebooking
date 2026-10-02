import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const CompassIcon: React.FC<IconComponentProps> = ({
  color = '#999',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} />
    {/* Compass needle — north (up-right) points filled, south (down-left) open */}
    <Path
      d="M16.24 7.76l-3.18 6.36L6.7 17.3l3.18-6.36 6.36-3.18z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

export const CompassOutlineIcon: React.FC<IconComponentProps> = CompassIcon;
