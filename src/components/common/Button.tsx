import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onPress,
  children,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme, isDark } = useTheme();

  const getButtonStyles = () => {
    const baseStyles: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing[size === 'small' ? 'xs' : size === 'large' ? 'md' : 'sm'],
      paddingHorizontal: theme.spacing[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'md'],
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary[500],
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral[isDark ? 700 : 200],
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary[500],
        };
      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          paddingVertical: theme.spacing.xs,
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = () => {
    const baseStyles: TextStyle = {
      fontSize: theme.typography.fontSize[size === 'small' ? 'sm' : size === 'large' ? 'lg' : 'base'],
      fontWeight: theme.typography.fontWeight.medium,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          color: theme.colors.neutral[50],
        };
      case 'secondary':
        return {
          ...baseStyles,
          color: theme.colors.neutral[isDark ? 50 : 900],
        };
      case 'outline':
        return {
          ...baseStyles,
          color: theme.colors.primary[500],
        };
      case 'text':
        return {
          ...baseStyles,
          color: theme.colors.primary[500],
        };
      default:
        return baseStyles;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[getTextStyles(), textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}; 