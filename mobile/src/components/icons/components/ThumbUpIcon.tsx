import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const ThumbUpIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M7 22V12M7 12L11 3C11.5523 3 12 3.44772 12 4V8H18.3846C19.2719 8 20 8.72808 20 9.61538C20 9.90561 19.9454 10.1933 19.8395 10.4617L17.1605 17.5383C16.9488 18.0753 16.4268 18.4286 15.8437 18.4286H7.57143C7.25583 18.4286 7 18.1727 7 17.8571V12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M2 13H7V22H2V13Z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);
