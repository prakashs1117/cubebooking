import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const BellIcon: React.FC<IconComponentProps> = ({
  color = '#503291',
  size = 32,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M9 17v1a3 3 0 006 0v-1m3-8c0 3 2 8 2 8H4s2-4 2-8c0-3.268 2.732-6 6-6s6 2.732 6 6z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellOutlineIcon: React.FC<IconComponentProps> = ({
  color = '#503291',
  size = 32,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <Path
      d="M9 17v1a3 3 0 006 0v-1m3-8c0 3 2 8 2 8H4s2-4 2-8c0-3.268 2.732-6 6-6s6 2.732 6 6z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
