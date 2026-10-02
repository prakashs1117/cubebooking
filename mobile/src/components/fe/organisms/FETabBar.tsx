import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Pressable from '@components/fe/atoms/Pressable';
import FEGlyph from '@components/fe/atoms/FEGlyph';
import { useFETheme } from '@theme/useFETheme';

/** Route name → FEGlyph icon. Center (Practice) renders as the mic FAB. */
const ICONS: Record<string, string> = {
  Today: 'home',
  Community: 'users',
  Practice: 'mic',
  Progress: 'chart',
  Profile: 'person',
};

const CENTER_ROUTE = 'Practice';

/**
 * FluentEdge floating glass tab bar with a raised center mic FAB and a
 * glowing-dot active indicator. Mirrors design/fe/fe-shell.jsx `FENav`.
 */
export default function FETabBar({ state, navigation }: BottomTabBarProps) {
  const t = useFETheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(bottom, 12) + 14 }]}>
      <View style={[styles.bar, { backgroundColor: t.nav, borderColor: t.stroke2 }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (route.name === CENTER_ROUTE) {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <Pressable onPress={onPress} scale={0.9}>
                  <LinearGradient
                    colors={[t.a1, t.a2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.fab,
                      {
                        borderColor: t.nav,
                        shadowColor: t.a2,
                      },
                      focused && { shadowOpacity: 0.9 },
                    ]}
                  >
                    <FEGlyph name="mic" size={26} color="#fff" />
                  </LinearGradient>
                </Pressable>
              </View>
            );
          }

          return (
            <Pressable key={route.key} onPress={onPress} scale={0.92} style={styles.item}>
              <FEGlyph
                name={ICONS[route.name] ?? 'home'}
                size={22}
                color={focused ? t.aText : t.text3}
                sw={focused ? 2.1 : 1.9}
              />
              <View
                style={[
                  styles.dot,
                  {
                    width: focused ? 5 : 4,
                    height: focused ? 5 : 4,
                    backgroundColor: focused ? t.aText : 'transparent',
                    shadowColor: focused ? t.a1 : 'transparent',
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    height: 68,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#141438',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dot: {
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  centerSlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 56,
    height: 56,
    marginTop: -22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 10,
  },
});
