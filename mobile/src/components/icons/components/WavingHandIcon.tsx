import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const WavingHandIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M7 11L9.5 8.5M18 13L16.5 14.5M20.5 9.5L19 11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M12 2V3M12 21V22M2 12H3M21 12H22M4.93 4.93L5.64 5.64M18.36 18.36L19.07 19.07M19.07 4.93L18.36 5.64M5.64 18.36L4.93 19.07"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M11 8C10.4477 8 10 8.44772 10 9V15C10 16.6569 11.3431 18 13 18C14.6569 18 16 16.6569 16 15V11C16 10.4477 15.5523 10 15 10C14.4477 10 14 10.4477 14 11V15C14 15.5523 13.5523 16 13 16C12.4477 16 12 15.5523 12 15V9C12 8.44772 11.5523 8 11 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
);
