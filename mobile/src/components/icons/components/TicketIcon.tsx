import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const TicketIcon: React.FC<IconComponentProps> = ({
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
      d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="13" y1="5" x2="13" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="13" y1="15" x2="13" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="13" y1="11" x2="13" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
