import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const SystemUpdateIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Path
      d="M12 7V13M12 13L9 10M12 13L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
