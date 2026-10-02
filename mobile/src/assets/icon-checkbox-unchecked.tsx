import React from 'react';
import Svg, { G, Path, SvgProps } from 'react-native-svg';

interface CheckboxUncheckedIconProps extends SvgProps {
  size?: number;
  color?: string;
  width?: number;
  height?: number;
}

/**
 * Checkbox Unchecked Icon
 * Modern checkbox without checkmark - theme-aware
 * Source: SVG Repo - checkbox-unchecked-svgrepo-com.svg
 */
const CheckboxUncheckedIcon: React.FC<CheckboxUncheckedIconProps> = ({
  size = 24,
  color = '#000000',
  width,
  height,
  ...props
}) => {
  const iconWidth = width || size;
  const iconHeight = height || size;

  return (
    <Svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <G id="Interface / Checkbox_Unchecked">
        <Path
          id="Vector"
          d="M4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V7.19691C20 6.07899 20 5.5192 19.7822 5.0918C19.5905 4.71547 19.2837 4.40973 18.9074 4.21799C18.4796 4 17.9203 4 16.8002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export default CheckboxUncheckedIcon;
