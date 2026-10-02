import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const HowToRegIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="2" fill="none" />
    <Path
      d="M3 20C3 16.6863 5.68629 14 9 14C10.0929 14 11.1175 14.2922 12 14.8027"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M15 15L17 17L21 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
