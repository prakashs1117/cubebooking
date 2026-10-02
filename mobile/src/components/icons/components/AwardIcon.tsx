import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const AwardIcon: React.FC<IconComponentProps> = ({
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
    <Circle cx="12" cy="8" r="6" stroke={color} strokeWidth="2" />
    <Path
      d="M15.5 13 17 22l-5-3-5 3 1.5-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
