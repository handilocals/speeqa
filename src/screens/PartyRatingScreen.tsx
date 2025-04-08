import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PartyCard } from '../components/rating/PartyCard';
import { RatingModal } from '../components/rating/RatingModal';
import { supabase } from '../lib/supabase';
import { PoliticalParty } from '../types/party';
import { useAuth } from '../contexts/AuthContext';

export function PartyRatingScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from('political_parties')
        .select(`
          *,
          politician_count:politicians(count),
          total_ratings:ratings(count),
          average_rating:ratings(avg(rating)),
          rating_distribution:ratings(rating)
        `)
        .order('name');

      if (error) throw error;

      const processedParties = data.map(party => ({
        ...party,
        politician_count: party.politician_count[0].count,
        total_ratings: party.total_ratings[0].count,
        average_rating: party.average_rating[0].avg || 0,
        rating_distribution: Array(5).fill(0).map((_, i) => 
          party.rating_distribution.filter((r: { rating: number }) => r.rating === 5 - i).length
        ),
      }));

      setParties(processedParties);
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchParties();
  };

  const handlePartyPress = (party: PoliticalParty) => {
    setSelectedParty(party);
    setCurrentRating(0);
    setCurrentComment('');
    setModalVisible(true);
  };

  const handleCommentPress = (party: PoliticalParty) => {
    // Navigate to comments screen
    // TODO: Implement navigation
  };

  const handleSubmitRating = async () => {
    if (!user || !selectedParty) return;

    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          entity_id: selectedParty.id,
          entity_type: 'party',
          rating: currentRating,
          comment: currentComment,
        });

      if (error) throw error;

      setModalVisible(false);
      fetchParties();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <FlatList
        data={parties}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PartyCard
            party={item}
            onPress={() => handlePartyPress(item)}
            onCommentPress={() => handleCommentPress(item)}
            showDistribution={true}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      />
      {selectedParty && (
        <RatingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmitRating}
          title={selectedParty.name}
          subtitle={selectedParty.description}
          imageUrl={selectedParty.logo_url}
          currentRating={currentRating}
          currentComment={currentComment}
          onRatingChange={setCurrentRating}
          onCommentChange={setCurrentComment}
          entityType="party"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 