import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const MessageCircleIcon: React.FC<IconComponentProps> = ({
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
    <Path
      d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
