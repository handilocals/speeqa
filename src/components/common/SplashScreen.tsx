import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { LoadingIndicator } from './LoadingIndicator';

interface SplashScreenProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export function SplashScreen({ children, isLoading }: SplashScreenProps) {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <LoadingIndicator fullScreen />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 