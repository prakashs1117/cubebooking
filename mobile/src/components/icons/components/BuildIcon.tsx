import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const BuildIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M14.7 6.3C15.9 7.5 15.9 9.5 14.7 10.7L14 11.4L9.9 7.3L10.6 6.6C11.8 5.4 13.8 5.4 15 6.6L14.7 6.3Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M9.2 7.9L4.5 12.6C3.9 13.2 3.9 14.2 4.5 14.8L9.2 19.5C9.8 20.1 10.8 20.1 11.4 19.5L16.1 14.8L9.2 7.9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M17 8L19 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);
