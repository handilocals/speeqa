import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={[styles.logo, { backgroundColor: theme.colors.primary[500] }]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={theme.colors.neutral[50]} 
        />
      </View>
      <View style={[styles.searchInputContainer, { 
        backgroundColor: theme.colors.neutral[100] 
      }]}>
        <TextInput
          style={[styles.searchInput, { 
            color: theme.colors.neutral[900]
          }]}
          placeholder="Search listings..."
          placeholderTextColor={theme.colors.neutral[500]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={theme.colors.neutral[500]}
            onPress={onClearSearch}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
  },
  logo: {
    width: tokens.spacing.xl,
    height: tokens.spacing.xl,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.spacing['2xl'],
    borderRadius: tokens.borderRadius.full,
    paddingHorizontal: tokens.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: tokens.typography.fontSize.base,
    marginRight: tokens.spacing.xs,
  },
}); 