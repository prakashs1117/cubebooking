import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const AlarmIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="12" cy="13" r="7" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M12 10V13L14 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 3L2 6M19 3L22 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path d="M12 20V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
