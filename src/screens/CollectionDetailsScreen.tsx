import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCollections, Collection, CollectionItem, CollectionShare } from '../contexts/CollectionContext';
import { PostCard } from '../components/posts/PostCard';
import { MarketplaceListingCard } from '../components/marketplace/MarketplaceListingCard';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type definitions
interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  reposts_count: number;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  status: string;
  category: string;
}

interface CollectionItemWithDetails extends CollectionItem {
  post?: Post;
  listing?: Listing;
}

interface User {
  id: string;
  username: string;
  avatar_url: string;
}

type RootStackParamList = {
  CollectionDetails: { collection: Collection };
  PostDetails: { postId: string };
  ListingDetails: { listingId: string };
};

type CollectionDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CollectionDetails'>;

interface CollectionDetailsScreenProps {
  route: {
    params: {
      collection: Collection;
    };
  };
}

export default function CollectionDetailsScreen({ route }: CollectionDetailsScreenProps) {
  const { collection } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    getCollectionItems,
    removeFromCollection,
    shareCollection,
    revokeShare,
    getCollectionShares,
  } = useCollections();
  const [items, setItems] = useState<CollectionItemWithDetails[]>([]);
  const [shares, setShares] = useState<CollectionShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation<CollectionDetailsScreenNavigationProp>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, sharesData] = await Promise.all([
        getCollectionItems(collection.id),
        getCollectionShares(collection.id),
      ]);

      const itemsWithDetails = await Promise.all(
        itemsData.map(async (item) => {
          try {
            if (item.post_id) {
              const { data: post, error: postError } = await supabase
                .from('posts')
                .select('*')
                .eq('id', item.post_id)
                .single();

              if (postError) throw postError;
              return { ...item, post };
            }
            if (item.listing_id) {
              const { data: listing, error: listingError } = await supabase
                .from('marketplace_listings')
                .select('*')
                .eq('id', item.listing_id)
                .single();

              if (listingError) throw listingError;
              return { ...item, listing };
            }
            return item;
          } catch (error) {
            console.error('Error loading item details:', error);
            return item;
          }
        })
      );

      setItems(itemsWithDetails);
      setShares(sharesData);
    } catch (error) {
      console.error('Error loading collection data:', error);
      setError('Failed to load collection data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (item: CollectionItemWithDetails) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from the collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCollection(collection.id, item.id);
              await loadData();
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShare = async (userId: string, canEdit: boolean) => {
    try {
      await shareCollection(collection.id, userId, canEdit);
      await loadData();
      setShowShareModal(false);
      setSearchQuery('');
      setSearchResults([]);
      Alert.alert('Success', 'Collection shared successfully');
    } catch (error) {
      console.error('Error sharing collection:', error);
      Alert.alert('Error', 'Failed to share collection. Please try again.');
    }
  };

  const handleRevokeShare = async (userId: string) => {
    try {
      await revokeShare(collection.id, userId);
      await loadData();
      Alert.alert('Success', 'Share access revoked');
    } catch (error) {
      console.error('Error revoking share:', error);
      Alert.alert('Error', 'Failed to revoke share access. Please try again.');
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderItem = ({ item }: { item: CollectionItemWithDetails }) => {
    if (!item.post && !item.listing) {
      return null;
    }

    return (
      <View style={styles.itemContainer}>
        {item.post && (
          <PostCard
            post={item.post}
            onPress={() => {
              if (item.post_id) {
                navigation.navigate('PostDetails', { postId: item.post_id });
              }
            }}
          />
        )}
        {item.listing && (
          <MarketplaceListingCard
            listing={item.listing}
            onPress={() => {
              if (item.listing_id) {
                navigation.navigate('ListingDetails', { listingId: item.listing_id });
              }
            }}
          />
        )}
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.colors.error[500] }]}
          onPress={() => handleRemoveItem(item)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.neutral[50]} />
          <Text style={[styles.removeButtonText, { color: theme.colors.neutral[50] }]}>
            Remove from Collection
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderShareItem = ({ item }: { item: CollectionShare }) => (
    <View style={[styles.shareItem, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.shareInfo}>
        <Text style={[styles.shareText, { color: theme.colors.neutral[900] }]}>
          User ID: {item.shared_with}
        </Text>
        <Text style={[styles.shareText, { color: theme.colors.neutral[900] }]}>
          {item.can_edit ? 'Can Edit' : 'View Only'}
        </Text>
      </View>
      {collection.user_id === user?.id && (
        <TouchableOpacity
          onPress={() => handleRevokeShare(item.shared_with)}
          style={styles.revokeButton}
        >
          <Ionicons name="close" size={20} color={theme.colors.error[500]} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.neutral[900] }]}>
            Share Collection
          </Text>
          
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: theme.colors.neutral[50],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[200],
            }]}
            placeholder="Search users..."
            placeholderTextColor={theme.colors.neutral[500]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchUsers(text);
            }}
          />

          {isSearching ? (
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.userItem, { backgroundColor: theme.colors.neutral[50] }]}
                  onPress={() => handleShare(item.id, false)}
                >
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={styles.userAvatar}
                  />
                  <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
                    {item.username}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
                  {searchQuery ? 'No users found' : 'Search for users to share with'}
                </Text>
              }
            />
          )}

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.error[500] }]}
            onPress={() => setShowShareModal(false)}
          >
            <Text style={[styles.buttonText, { color: theme.colors.neutral[50] }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.collectionName, { color: theme.colors.neutral[900] }]}>
            {collection.name}
          </Text>
          {collection.user_id === user?.id && (
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setShowShareModal(true)}
            >
              <Ionicons name="share-outline" size={20} color={theme.colors.neutral[50]} />
              <Text style={[styles.shareButtonText, { color: theme.colors.neutral[50] }]}>
                Share
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {collection.description && (
          <Text style={[styles.collectionDescription, { color: theme.colors.neutral[500] }]}>
            {collection.description}
          </Text>
        )}
        <View style={styles.collectionInfo}>
          <Text style={[styles.itemCount, { color: theme.colors.neutral[500] }]}>
            {items.length} items
          </Text>
          {collection.is_private && (
            <View style={styles.privacyBadge}>
              <Ionicons name="lock-closed" size={16} color={theme.colors.neutral[500]} />
              <Text style={[styles.privacyText, { color: theme.colors.neutral[500] }]}>
                Private
              </Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            {loading ? 'Loading...' : 'No items in this collection'}
          </Text>
        }
      />

      {collection.user_id === user?.id && shares.length > 0 && (
        <View style={[styles.sharesSection, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.sharesTitle, { color: theme.colors.neutral[900] }]}>
            Shared With
          </Text>
          <FlatList
            data={shares}
            renderItem={renderShareItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {renderShareModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 16,
    marginBottom: 12,
  },
  collectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCount: {
    fontSize: 14,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyText: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  removeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  shareButtonText: {
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 4,
  },
  buttonText: {
    fontWeight: '500',
  },
  sharesSection: {
    padding: 16,
    marginTop: 16,
  },
  sharesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  shareInfo: {
    flex: 1,
  },
  shareText: {
    fontSize: 14,
  },
  revokeButton: {
    padding: 8,
  },
});