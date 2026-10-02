import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface StarFilledIconProps {
  size?: number;
  color?: string;
}

const StarFilledIcon: React.FC<StarFilledIconProps> = ({
  size = 24,
  color = '#FFB800',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32.001,9.188l5.666,17.438l18.335,0l-14.833,10.777l5.666,17.438l-14.834,-10.777l-14.833,10.777l5.666,-17.438l-14.834,-10.777l18.335,0l5.666,-17.438Z"
        fill={color}
      />
    </Svg>
  );
};

export default StarFilledIcon;
