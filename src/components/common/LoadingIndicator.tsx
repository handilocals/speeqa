import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
  color?: string;
}

export function LoadingIndicator({ 
  size = 'large', 
  fullScreen = false,
  color
}: LoadingIndicatorProps) {
  const { theme } = useTheme();
  const indicatorColor = color || theme.colors.primary[500];

  const containerStyle = fullScreen 
    ? [styles.fullScreenContainer, { backgroundColor: theme.colors.neutral[50] }]
    : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={indicatorColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.md,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 