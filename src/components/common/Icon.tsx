import React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';

export type IconName = keyof typeof Ionicons.glyphMap;

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  variant?: 'filled' | 'outline';
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: number | string;
  badgeColor?: string;
  badgeTextColor?: string;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

export function Icon({
  name,
  size = 'md',
  color,
  variant = 'outline',
  style,
  containerStyle,
  onPress,
  disabled = false,
  loading = false,
  badge,
  badgeColor,
  badgeTextColor,
}: IconProps) {
  const { theme } = useTheme();
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  
  // Determine icon name based on variant
  const iconName = variant === 'filled' 
    ? name.replace('-outline', '') as IconName
    : name.endsWith('-outline') 
      ? name as IconName 
      : `${name}-outline` as IconName;

  // Determine icon color
  const iconColor = disabled 
    ? theme.colors.neutral[400]
    : color || theme.colors.neutral[900];

  const iconStyle = {
    opacity: disabled ? theme.opacity[60] : theme.opacity[100],
  };

  return (
    <View 
      style={[
        styles.container,
        containerStyle,
        onPress && !disabled && styles.pressable,
      ]}
    >
      <Ionicons
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={[iconStyle, style]}
      />
      {badge !== undefined && (
        <View 
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor || theme.colors.primary[500],
              borderColor: theme.colors.neutral[50],
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: badgeTextColor || theme.colors.neutral[50],
                fontSize: iconSize * 0.4,
              },
            ]}
          >
            {badge}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressable: {
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontWeight: tokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
}); 