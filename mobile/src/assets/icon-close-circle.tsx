import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconCloseCircleProps {
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
}

const IconCloseCircle: React.FC<IconCloseCircleProps> = ({
  width = 24,
  height = 24,
  fill = 'none',
  stroke = '#1C274C',
  strokeWidth = 1.5,
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <Circle cx="12" cy="12" r="10" stroke={stroke} strokeWidth={strokeWidth} />
    <Path
      d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export default IconCloseCircle;
