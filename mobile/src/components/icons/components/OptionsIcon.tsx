import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Options Icon - Horizontal lines with dots (like the screenshot)
 */
const OptionsIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Top line with circle */}
      <Circle cx="7" cy="6" r="2" fill={color} />
      <Line
        x1="11"
        y1="6"
        x2="21"
        y2="6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Middle line with circle */}
      <Circle cx="17" cy="12" r="2" fill={color} />
      <Line
        x1="3"
        y1="12"
        x2="13"
        y2="12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Bottom line with circle */}
      <Circle cx="10" cy="18" r="2" fill={color} />
      <Line
        x1="14"
        y1="18"
        x2="21"
        y2="18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default OptionsIcon;
