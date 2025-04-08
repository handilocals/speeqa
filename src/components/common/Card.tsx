import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  style,
  onPress,
  disabled = false,
}) => {
  const { theme, isDark } = useTheme();

  const getCardStyles = () => {
    const baseStyles: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral[isDark ? 800 : 50],
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.neutral[isDark ? 700 : 200],
        };
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral[isDark ? 800 : 100],
        };
      default:
        return baseStyles;
    }
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      style={[getCardStyles(), style]}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </Container>
  );
}; 