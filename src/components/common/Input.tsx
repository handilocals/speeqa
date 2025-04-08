import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type InputVariant = 'outlined' | 'filled' | 'standard';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  size = 'medium',
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const { theme, isDark } = useTheme();

  const getContainerStyles = () => {
    const baseStyles: ViewStyle = {
      marginBottom: theme.spacing.sm,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: error ? theme.colors.error[500] : theme.colors.neutral[isDark ? 700 : 300],
          borderRadius: theme.borderRadius.md,
          backgroundColor: 'transparent',
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral[isDark ? 800 : 100],
          borderRadius: theme.borderRadius.md,
        };
      case 'standard':
        return {
          ...baseStyles,
          borderBottomWidth: 1,
          borderColor: error ? theme.colors.error[500] : theme.colors.neutral[isDark ? 700 : 300],
        };
      default:
        return baseStyles;
    }
  };

  const getInputStyles = () => {
    const baseStyles: TextStyle = {
      fontSize: theme.typography.fontSize[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      color: theme.colors.neutral[isDark ? 50 : 900],
      paddingVertical: theme.spacing[size === 'small' ? 'xs' : size === 'large' ? 'md' : 'sm'],
      paddingHorizontal: theme.spacing[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'],
    };

    if (leftIcon) {
      baseStyles.paddingLeft = theme.spacing[size === 'small' ? 'lg' : size === 'large' ? 'xl' : 'lg'];
    }

    if (rightIcon) {
      baseStyles.paddingRight = theme.spacing[size === 'small' ? 'lg' : size === 'large' ? 'xl' : 'lg'];
    }

    return baseStyles;
  };

  const getLabelStyles = () => ({
    fontSize: theme.typography.fontSize.sm,
    color: error ? theme.colors.error[500] : theme.colors.neutral[isDark ? 400 : 600],
    marginBottom: theme.spacing.xs,
    ...labelStyle,
  });

  const getErrorStyles = () => ({
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
    ...errorStyle,
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={getLabelStyles()}>{label}</Text>}
      <View style={[getContainerStyles(), styles.inputContainer]}>
        {leftIcon && (
          <View style={[styles.icon, styles.leftIcon]}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[getInputStyles(), inputStyle]}
          placeholderTextColor={theme.colors.neutral[isDark ? 400 : 500]}
          {...props}
        />
        {rightIcon && (
          <View style={[styles.icon, styles.rightIcon]}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text style={getErrorStyles()}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    left: 12,
  },
  rightIcon: {
    right: 12,
  },
}); 