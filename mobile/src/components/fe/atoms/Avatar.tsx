import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

const AV_GRADS: [string, string][] = [
  ['#FF9A76', '#D84315'],
  ['#A98BF0', '#5B2EBC'],
  ['#5FC9F8', '#0277BD'],
  ['#7FD491', '#2E7D32'],
  ['#F582AC', '#AD1457'],
  ['#FFD45F', '#E8930C'],
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % AV_GRADS.length;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

export interface AvatarProps {
  name: string;
  size?: number;
  ring?: boolean;
}

/** Initials avatar with a name-hashed gradient and optional ring. */
export default function Avatar({ name, size = 44, ring }: AvatarProps) {
  const grad = AV_GRADS[hashName(name)];
  const inner = ring ? size - 6 : size;

  const tile = (
    <LinearGradient
      colors={grad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: inner, height: inner, borderRadius: inner / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontFamily: FE_FONT_FAMILY, fontWeight: '700', color: '#fff', fontSize: inner * 0.36 }}>
        {initials(name)}
      </Text>
    </LinearGradient>
  );

  if (!ring) return tile;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: grad[0],
      }}
    >
      {tile}
    </View>
  );
}
