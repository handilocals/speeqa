import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../lib/supabase';
import { SearchResult } from '../types/search';
import { SearchHeader } from '../components/search/SearchHeader';
import { FiltersBar } from '../components/search/FiltersBar';
import { SearchResults } from '../components/search/SearchResults';
import { RecentSearches } from '../components/search/RecentSearches';
import { EmptyState } from '../components/search/EmptyState';
import { FilterModal } from '../components/search/FilterModal';
import { SortModal } from '../components/search/SortModal';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [shippingAvailable, setShippingAvailable] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState(24);
  const [sortBy, setSortBy] = useState('relevance');
  const [location, setLocation] = useState('Spain, Madrid');
  const backgroundColor = theme.colors.neutral[50];

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('recent_searches')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSearches(data.map(item => item.query));
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('marketplace_listings')
        .select(`
          id,
          title,
          description,
          price,
          image_url,
          category,
          created_at,
          user:profiles(id, username, avatar_url)
        `);

      // Apply text search
      if (query.trim()) {
        queryBuilder = queryBuilder.textSearch('search_vector', query);
      }

      // Apply category filters
      if (activeFilters.length > 0) {
        queryBuilder = queryBuilder.in('category', activeFilters);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          queryBuilder = queryBuilder.order('price', { ascending: true });
          break;
        case 'price_high':
          queryBuilder = queryBuilder.order('price', { ascending: false });
          break;
        case 'newest':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        default:
          // For relevance, we'll use the text search ranking
          break;
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;
      setResults(data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        category: item.category || 'other',
        created_at: item.created_at || new Date().toISOString(),
        user: {
          id: item.user[0].id,
          username: item.user[0].username,
          avatar_url: item.user[0].avatar_url
        },
        images: [{
          id: item.id,
          url: item.image_url
        }],
        location: {
          city: 'Madrid',
          state: 'Spain'
        },
        is_reserved: false,
        is_bargainable: true
      })) || []);

      if (user) {
        await supabase
          .from('recent_searches')
          .upsert({
            user_id: user.id,
            query: query.trim(),
          });
        loadRecentSearches();
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const handleSearchItemPress = (item: SearchResult) => {
    navigation.navigate('ListingDetails', { listing: item });
  };

  const handleRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <EmptyState
          loading={true}
          hasSearchQuery={searchQuery.length > 0}
        />
      );
    }

    if (results.length > 0) {
      return (
        <SearchResults
          results={results}
          onItemPress={handleSearchItemPress}
        />
      );
    }

    if (searchQuery.length === 0 && recentSearches.length > 0) {
      return (
        <RecentSearches
          searches={recentSearches}
          onSearchPress={handleRecentSearchPress}
        />
      );
    }

    return (
      <EmptyState
        loading={false}
        hasSearchQuery={searchQuery.length > 0}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={(text) => {
          setSearchQuery(text);
          handleSearch(text);
        }}
        onClearSearch={handleClearSearch}
      />
      <FiltersBar
        onFilterPress={() => setShowFilters(true)}
        onSortPress={() => setShowSort(true)}
        activeFiltersCount={activeFilters.length}
        sortBy={sortBy}
      />
      {renderContent()}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => {
          setShowFilters(false);
          handleSearch(searchQuery);
        }}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        shippingAvailable={shippingAvailable}
        setShippingAvailable={setShippingAvailable}
        selectedTimeFilter={selectedTimeFilter}
        setSelectedTimeFilter={setSelectedTimeFilter}
        location={location}
      />
      <SortModal
        visible={showSort}
        onClose={() => setShowSort(false)}
        sortBy={sortBy}
        onSortChange={(newSort) => {
          setSortBy(newSort);
          handleSearch(searchQuery);
        }}
      />
    </View>
  );
}; 