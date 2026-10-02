import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const SVGComponent = props => (
  <Svg
    width="40px"
    height="40px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M4 7L7 7M20 7L11 7"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M20 17H17M4 17L13 17"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M4 12H7L20 12"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
export default SVGComponent;
