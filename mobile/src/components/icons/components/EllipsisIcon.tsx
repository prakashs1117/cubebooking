import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const EllipsisIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 511.992 511.992" {...props}>
    <Circle cx="67.919" cy="255.996" r="67.919" fill={color} />
    <Circle cx="255.996" cy="255.996" r="67.919" fill={color} />
    <Circle cx="444.073" cy="255.996" r="67.919" fill={color} />
  </Svg>
);
