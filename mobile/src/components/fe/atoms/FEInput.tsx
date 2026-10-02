import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useFETheme } from '@theme/useFETheme';
import { FE_FONT_FAMILY } from '@demand/shared/fe';

export interface FEInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Themed text input with label + inline error. Atom. */
export default function FEInput({ label, error, style, ...rest }: FEInputProps) {
  const t = useFETheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={[styles.label, { color: t.text2 }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={t.text3}
        style={[
          styles.input,
          {
            backgroundColor: t.chip,
            borderColor: error ? '#E11D48' : t.stroke,
            color: t.text,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: FE_FONT_FAMILY, fontSize: 12.5, fontWeight: '600' },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FE_FONT_FAMILY,
    fontSize: 15,
  },
  error: { fontFamily: FE_FONT_FAMILY, fontSize: 11.5, color: '#E11D48' },
});
