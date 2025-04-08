import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';

interface RecentSearchesProps {
  searches: string[];
  onSearchPress: (query: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchPress,
}) => {
  const { theme } = useTheme();

  const renderRecentSearch = (query: string) => (
    <Button
      key={query}
      variant="text"
      onPress={() => onSearchPress(query)}
      style={styles.recentSearchItem}
    >
      <Ionicons
        name="time-outline"
        size={16}
        color={theme.colors.neutral[500]}
        style={styles.recentSearchIcon}
      />
      <Text style={[styles.recentSearchText, { color: theme.colors.neutral[900] }]}>
        {query}
      </Text>
    </Button>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        Recent Searches
      </Text>
      {searches.map(renderRecentSearch)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
  },
  recentSearchIcon: {
    marginRight: tokens.spacing.xs,
  },
  recentSearchText: {
    fontSize: tokens.typography.fontSize.base,
  },
}); 