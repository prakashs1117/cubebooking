import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ShieldPersonIconProps {
  size?: number;
  color?: string;
}

const ShieldPersonIcon: React.FC<ShieldPersonIconProps> = ({
  size = 48,
  color = '#503291',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H18C17.47 16.11 15.27 19.41 12 20.79C8.73 19.41 6.53 16.11 6 11.99H12V6.3L17.13 9V10.99H12V11.99Z"
        fill={color}
      />
      <Path
        d="M12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8Z"
        fill={color}
      />
      <Path
        d="M12 13C10.33 13 7 13.84 7 15.5V17H17V15.5C17 13.84 13.67 13 12 13Z"
        fill={color}
      />
    </Svg>
  );
};

export default ShieldPersonIcon;
