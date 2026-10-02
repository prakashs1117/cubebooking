/**
 * Patches Text.defaultProps so every <Text> in the app renders with
 * Poppins-Medium by default. Bold weights are handled by AppText.
 * Import this file once in App.tsx (side-effect only).
 */
import { Text } from 'react-native';

(Text as any).defaultProps = {
  ...((Text as any).defaultProps ?? {}),
  style: { fontFamily: 'Poppins-Medium' },
};
