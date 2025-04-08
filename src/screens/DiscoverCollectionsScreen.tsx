import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { tokens } from '../theme/tokens';
import { useCollections } from '../contexts/CollectionContext';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type definitions
interface Collection {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface CollectionWithStats extends Collection {
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  item_count: number;
  view_count: number;
}

type RootStackParamList = {
  CollectionDetails: { collection: CollectionWithStats };
  // Add other screen params as needed
};

type DiscoverCollectionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CollectionDetails'>;

interface DiscoverCollectionsScreenProps {
  navigation: DiscoverCollectionsScreenNavigationProp;
}

export function DiscoverCollectionsScreen({ navigation }: DiscoverCollectionsScreenProps) {
  const { theme } = useTheme();
  const [trendingCollections, setTrendingCollections] = useState<CollectionWithStats[]>([]);
  const [popularCollections, setPopularCollections] = useState<CollectionWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trending collections (most viewed in the last week)
      const { data: trendingData, error: trendingError } = await supabase
        .from('collections')
        .select(`
          *,
          user:profiles(id, username, avatar_url),
          item_count:items(count),
          view_count:views(count)
        `)
        .eq('is_private', false)
        .order('view_count', { ascending: false })
        .limit(5);

      if (trendingError) throw trendingError;

      // Fetch popular collections (most items)
      const { data: popularData, error: popularError } = await supabase
        .from('collections')
        .select(`
          *,
          user:profiles(id, username, avatar_url),
          item_count:items(count),
          view_count:views(count)
        `)
        .eq('is_private', false)
        .order('item_count', { ascending: false })
        .limit(10);

      if (popularError) throw popularError;

      setTrendingCollections(trendingData || []);
      setPopularCollections(popularData || []);
    } catch (error) {
      console.error('Error loading collections:', error);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const renderCollectionCard = ({ item }: { item: CollectionWithStats }) => (
    <TouchableOpacity
      style={[styles.collectionCard, { backgroundColor: theme.colors.neutral[100] }]}
      onPress={() => navigation.navigate('CollectionDetails', { collection: item })}
    >
      <View style={styles.collectionHeader}>
        <Image
          source={{ uri: item.user.avatar_url }}
          style={styles.avatar}
        />
        <View style={styles.collectionInfo}>
          <Text style={[styles.collectionName, { color: theme.colors.neutral[900] }]}>
            {item.name}
          </Text>
          <Text style={[styles.username, { color: theme.colors.neutral[500] }]}>
            by {item.user.username}
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="images-outline" size={16} color={theme.colors.neutral[500]} />
          <Text style={[styles.statText, { color: theme.colors.neutral[500] }]}>
            {item.item_count} items
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color={theme.colors.neutral[500]} />
          <Text style={[styles.statText, { color: theme.colors.neutral[500] }]}>
            {item.view_count} views
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <Text style={[styles.errorText, { color: theme.colors.neutral[900] }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={loadCollections}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.neutral[50] }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <FlatList
        data={popularCollections}
        renderItem={renderCollectionCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Trending Collections
            </Text>
            <FlatList
              data={trendingCollections}
              renderItem={renderCollectionCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Popular Collections
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            No collections found
          </Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: tokens.spacing.md,
  },
  horizontalList: {
    paddingVertical: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    marginBottom: tokens.spacing.md,
  },
  collectionCard: {
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.full,
    marginRight: tokens.spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.xs,
  },
  username: {
    fontSize: tokens.typography.fontSize.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  statText: {
    fontSize: tokens.typography.fontSize.sm,
  },
  errorText: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  retryButton: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
  },
}); 