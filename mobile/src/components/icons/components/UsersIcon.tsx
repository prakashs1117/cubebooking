import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const UsersIcon: React.FC<IconComponentProps> = ({
  color = '#999',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    {/* Front person */}
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth={1.5} />
    <Path
      d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Back person (partially visible) */}
    <Circle cx="17" cy="7" r="2.5" stroke={color} strokeWidth={1.5} />
    <Path
      d="M15 20c0-2.5 1.5-4.5 3.5-5.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const UsersOutlineIcon: React.FC<IconComponentProps> = UsersIcon;
