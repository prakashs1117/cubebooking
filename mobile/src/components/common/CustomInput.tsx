import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@theme/index';
import { getFontStyle } from '@utils/fonts';

interface CustomInputProps extends TextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  onRightIconPress?: () => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  onRightIconPress,
  secureTextEntry,
  autoComplete = 'off',
  textContentType = 'none',
  autoCorrect = false,
  importantForAutofill = 'no',
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      fontFamily: getFontStyle('label').fontFamily,
      fontSize: getFontStyle('label').fontSize,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 6,
      marginLeft: 2,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
      backgroundColor: theme.background.card,
      borderWidth: 1,
      borderColor: isFocused ? theme.text.link : theme.border.secondary,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    inputContainerError: {
      borderColor: '#EF4444',
    },
    inputContainerFocused: {
      borderWidth: 2,
      borderColor: theme.text.link,
    },
    input: {
      flex: 1,
      fontFamily: getFontStyle('input').fontFamily,
      fontSize: getFontStyle('input').fontSize,
      color: theme.text.primary,
      height: '100%',
    },
    leftIconContainer: {
      marginRight: 10,
    },
    rightIconContainer: {
      marginLeft: 10,
    },
    errorText: {
      fontFamily: getFontStyle('error').fontFamily,
      fontSize: getFontStyle('error').fontSize,
      color: '#EF4444',
      marginTop: 3,
      marginLeft: 2,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor="#668583"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={autoCorrect}
          importantForAutofill={importantForAutofill}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;
