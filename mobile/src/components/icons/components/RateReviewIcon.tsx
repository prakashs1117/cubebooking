import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const RateReviewIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M3 18V21H6L17 10L14 7L3 18Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M14 7L17 10L19 8L16 5L14 7Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2L14.5 7L20 7.5L16 11L17 17L12 14L7 17L8 11L4 7.5L9.5 7L12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
