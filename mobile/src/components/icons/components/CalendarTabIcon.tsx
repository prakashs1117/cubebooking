import React from 'react';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const CalendarTabIcon: React.FC<IconComponentProps> = ({
  color = '#999',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} />
    <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M7 13h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill={color} />
  </Svg>
);

export const CalendarTabActiveIcon: React.FC<IconComponentProps> = ({
  color = '#007A5A',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect x="3" y="4" width="18" height="18" rx="2" fill={color} opacity={0.15} stroke={color} strokeWidth={1.5} />
    <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth={1.5} />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M7 13h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill={color} />
  </Svg>
);
