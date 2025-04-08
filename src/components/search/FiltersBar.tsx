import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../common/Button';
import { tokens } from '../../theme/tokens';

interface FiltersBarProps {
  onFilterPress: () => void;
  onSortPress: () => void;
  activeFiltersCount: number;
  sortBy: string;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  onFilterPress,
  onSortPress,
  activeFiltersCount,
  sortBy,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.filtersBar, { 
      borderBottomColor: theme.colors.neutral[200],
      backgroundColor: theme.colors.neutral[50] 
    }]}>
      <Button
        variant="text"
        onPress={onFilterPress}
        style={styles.filterButton}
      >
        <Ionicons 
          name="people-outline" 
          size={20} 
          color={theme.colors.neutral[900]} 
        />
        <Text style={[styles.filterButtonText, { color: theme.colors.neutral[900] }]}>
          Filters
          {activeFiltersCount > 0 && (
            <Text style={[styles.filterCount, { 
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.neutral[50]
            }]}>
              {activeFiltersCount}
            </Text>
          )}
        </Text>
      </Button>
      <Button
        variant="text"
        onPress={onSortPress}
        style={styles.sortButton}
      >
        <Ionicons 
          name="funnel-outline" 
          size={20} 
          color={theme.colors.neutral[900]} 
        />
        <Text style={[styles.sortButtonText, { color: theme.colors.neutral[900] }]}>
          {sortBy === 'relevance' ? 'Relevance' : sortBy}
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderBottomWidth: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  filterButtonText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  filterCount: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.bold,
    paddingHorizontal: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.full,
    marginLeft: tokens.spacing.xs,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  },
  sortButtonText: {
    fontSize: tokens.typography.fontSize.base,
  },
}); 