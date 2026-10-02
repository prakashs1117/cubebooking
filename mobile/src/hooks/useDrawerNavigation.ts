import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '@navigation/types';

export function useDrawerNavigation() {
  return useNavigation<DrawerNavigationProp<DrawerParamList>>();
}
