import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorState } from '../common/ErrorState';

interface EmptyStateProps {
  loading: boolean;
  hasSearchQuery: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  loading,
  hasSearchQuery,
  error,
  onRetry,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <ErrorState
        title="Search Error"
        message={error.message || 'Failed to load search results'}
        icon="search-outline"
        onRetry={onRetry}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <Ionicons
        name="search-outline"
        size={48}
        color={theme.colors.neutral[500]}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.colors.neutral[500] }]}>
        {hasSearchQuery ? 'No results found' : 'Search for listings...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacing.md,
  },
  icon: {
    marginBottom: tokens.spacing.md,
  },
  text: {
    fontSize: tokens.typography.fontSize.lg,
    textAlign: 'center',
  },
}); 