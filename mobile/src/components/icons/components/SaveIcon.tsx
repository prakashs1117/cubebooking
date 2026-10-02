import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { IconComponentProps } from '../types';

const SaveIcon: React.FC<IconComponentProps> = ({ size = 24, color = '#000', ...props }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 6L7.5 5.25H16.5L17.25 6V19.3162L12 16.2051L6.75 19.3162V6ZM8.25 6.75V16.6838L12 14.4615L15.75 16.6838V6.75H8.25Z"
      fill={color}
    />
  </Svg>
);

export default SaveIcon;
