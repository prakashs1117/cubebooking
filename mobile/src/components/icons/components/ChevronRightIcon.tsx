import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const ChevronRightIcon: React.FC<IconComponentProps> = ({
  color = '#09090B',
  size = 24,
  width,
  height,
  ...props
}) => (
  <Svg
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Polyline
      points="9 18 15 12 9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
