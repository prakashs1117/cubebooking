import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const CampaignIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M18 8V6C18 4.89543 17.1046 4 16 4H14M18 8V16M18 8H21M18 16V18C18 19.1046 17.1046 20 16 20H14M18 16H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 4L10 8H7C5.89543 8 5 8.89543 5 10V14C5 15.1046 5.89543 16 7 16H10L14 20V4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
);
