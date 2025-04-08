import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  icon = 'alert-circle-outline',
  onRetry,
  retryText = 'Try Again',
  fullScreen = false,
}: ErrorStateProps) {
  const { theme } = useTheme();

  const containerStyle = fullScreen 
    ? [styles.fullScreenContainer, { backgroundColor: theme.colors.neutral[50] }]
    : styles.container;

  return (
    <View style={containerStyle}>
      <Ionicons
        name={icon as any}
        size={48}
        color={theme.colors.error[500]}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.colors.neutral[500] }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="primary"
          onPress={onRetry}
          style={styles.button}
        >
          {retryText}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.lg,
  },
  icon: {
    marginBottom: tokens.spacing.lg,
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  message: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  button: {
    minWidth: 120,
  },
}); 