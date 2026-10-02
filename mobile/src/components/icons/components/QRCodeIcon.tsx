import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const QRCodeIcon: React.FC<IconComponentProps> = ({
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
    <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
    <Path
      d="M14 14h3v3h-3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 21h-3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 14v3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
