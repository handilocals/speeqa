import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ExpandableFAB } from '../components/marketplace/ExpandableFAB';
import { MarketplaceDrawerMenu } from '../components/marketplace/MarketplaceDrawerMenu';
import MarketplaceBanner from '../components/marketplace/MarketplaceBanner';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  reference_number: string;
  is_bargainable: boolean;
  is_reserved: boolean;
  location: {
    state: string;
    city: string;
    locality: string;
    zipcode: string;
  };
  images: Array<{
    id: string;
    url: string;
    display_order: number;
  }>;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
}

// Default theme values
const defaultTheme = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#000000',
  border: '#EEEEEE',
};

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 48) / numColumns; // 48 = padding (16) * 2 + gap between items (16)

export function MarketplaceScreen({ navigation }: { navigation: any }) {
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const fetchListings = async () => {
    try {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          images:marketplace_listing_images(*),
          user:profiles(id, username, avatar)
        `)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.textSearch('search_vector', searchQuery);
      }

      if (filterState) {
        query = query.eq('location->state', filterState);
      }

      if (filterCity) {
        query = query.eq('location->city', filterCity);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchQuery, filterState, filterCity]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleLearnMore = () => {
    navigation.navigate('LearnMore');
  };

  const renderItem = ({ item }: { item: MarketplaceListing }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: theme.colors.neutral[100] }]}
      onPress={() => navigation.navigate('ListingDetails', { listing: item })}
    >
      {item.images?.[0] && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.gridItemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.gridItemInfo}>
        <Text style={[styles.gridItemPrice, { color: theme.colors.neutral[900] }]}>
          {item.price.toFixed(0)} €
        </Text>
        <Text style={[styles.gridItemTitle, { color: theme.colors.neutral[900] }]}>
          {item.title}
        </Text>
        <Text style={[styles.gridItemShipping, { color: theme.colors.neutral[500] }]}>
          Shipping available
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const handleCreatePost = () => {
    navigation.navigate('Compose');
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsDrawerVisible(true)}
        >
          <Ionicons name="menu-outline" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <View style={[styles.searchWrapper, { backgroundColor: theme.colors.neutral[100] }]}>
          <Ionicons name="search-outline" size={20} color={theme.colors.neutral[500]} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.neutral[900] }]}
            placeholder="Search lamps"
            placeholderTextColor={theme.colors.neutral[500]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => navigation.navigate('Search')}
          />
        </View>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => {/* Handle logo press */}}
        >
          <View style={[styles.logo, { backgroundColor: theme.colors.primary[500] }]}>
            <Ionicons name="add-outline" size={20} color={theme.colors.neutral[50]} />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
        The best, at the best price
      </Text>
    </>
  );

  if (loading && listings.length === 0) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <MarketplaceBanner
        theme={theme}
        onLearnMore={handleLearnMore}
      />
      
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            No listings found
          </Text>
        }
      />

      <ExpandableFAB
        onCreateListing={handleCreateListing}
        onCreatePost={handleCreatePost}
      />

      <MarketplaceDrawerMenu 
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  logoContainer: {
    padding: 8,
    borderRadius: 20,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    marginHorizontal: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  bannerContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '500',
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 16,
  },
  gridItem: {
    width: itemWidth,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridItemImage: {
    width: '100%',
    height: itemWidth,
  },
  gridItemInfo: {
    padding: 12,
  },
  gridItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridItemTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  gridItemShipping: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});