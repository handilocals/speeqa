import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Card } from '../common/Card';
import { SearchResult } from '../../types/search';

interface SearchResultsProps {
  results: SearchResult[];
  onItemPress: (item: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onItemPress,
}) => {
  const { theme } = useTheme();

  const renderSearchItem = ({ item }: { item: SearchResult }) => (
    <Card
      variant="elevated"
      onPress={() => onItemPress(item)}
      style={styles.resultItem}
    >
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: theme.colors.neutral[900] }]}>
            {item.title}
          </Text>
          <Text style={[styles.resultPrice, { color: theme.colors.primary[500] }]}>
            ${item.price}
          </Text>
        </View>
        <Text
          style={[styles.resultDescription, { color: theme.colors.neutral[500] }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.resultFooter}>
          <View style={styles.userInfo}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={theme.colors.neutral[500]}
            />
            <Text style={[styles.username, { color: theme.colors.neutral[500] }]}>
              {item.user.username}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <FlatList
      data={results}
      renderItem={renderSearchItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.resultsList}
    />
  );
};

const styles = StyleSheet.create({
  resultsList: {
    padding: tokens.spacing.md,
    gap: tokens.spacing.md,
  },
  resultItem: {
    padding: tokens.spacing.md,
  },
  resultContent: {
    gap: tokens.spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    flex: 1,
    marginRight: tokens.spacing.xs,
  },
  resultPrice: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  resultDescription: {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  username: {
    fontSize: 12,
    marginLeft: 4,
  },
}); 