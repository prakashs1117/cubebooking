import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const ConfirmationNumberIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M2 9C2 7.89543 2.89543 7 4 7H20C21.1046 7 22 7.89543 22 9V10C22 10.5523 21.5523 11 21 11C20.4477 11 20 11.4477 20 12C20 12.5523 20.4477 13 21 13C21.5523 13 22 13.4477 22 14V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V14C2 13.4477 2.44772 13 3 13C3.55228 13 4 12.5523 4 12C4 11.4477 3.55228 11 3 11C2.44772 11 2 10.5523 2 10V9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9" r="0.5" fill={color} />
    <Circle cx="12" cy="12" r="0.5" fill={color} />
    <Circle cx="12" cy="15" r="0.5" fill={color} />
  </Svg>
);
