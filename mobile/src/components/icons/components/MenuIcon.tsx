import React from 'react';
import Svg, { Line } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const MenuIcon: React.FC<IconComponentProps> = ({
  color = '#09090B',
  size = 24,
  width,
  height,
  ...props
}) => (
  <Svg
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
