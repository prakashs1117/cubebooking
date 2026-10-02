import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface StarOutlineIconProps {
  size?: number;
  color?: string;
}

const StarOutlineIcon: React.FC<StarOutlineIconProps> = ({
  size = 24,
  color = '#000000',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M37.675,26.643l18.335,0l-14.834,10.777l5.666,17.438l-14.833,-10.777l-14.834,10.777l5.666,-17.438l-14.833,-10.777l18.335,0l5.666,-17.438c1.888,5.813 3.777,11.625 5.666,17.438Zm-8.407,4.026l-8.869,0l7.175,5.213l-2.74,8.435l7.175,-5.213l7.175,5.213l-2.741,-8.435l7.175,-5.213l-8.869,0l-2.74,-8.434c-0.914,2.811 -1.827,5.623 -2.741,8.434Z"
        fill={color}
        fillRule="nonzero"
      />
    </Svg>
  );
};

export default StarOutlineIcon;
