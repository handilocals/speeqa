import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';  
import { RootStackParamList } from '../types/navigation';
import { PartyCard } from '../components/rating/PartyCard';
import { RatingModal } from '../components/rating/RatingModal';
import { PoliticalParty } from '../types/party';

interface Politician {
  id: string;
  name: string;
  position: string;
  image_url: string;
  average_rating: number;
  total_ratings: number;
}

type RatingType = 'politician' | 'party';

export function RatingScreen() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [comment, setComment] = useState('');
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [ratingType, setRatingType] = useState<RatingType>('politician');
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');

  useEffect(() => {
    fetchPoliticians();
    fetchParties();
  }, []);

  const fetchPoliticians = async () => {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setPoliticians(data || []);
    } catch (error) {
      console.error('Error fetching politicians:', error);
      Alert.alert('Error', 'Failed to load politicians. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchParties();
  };

  const handleRating = async (politician: Politician, rating: number) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to rate a politician');
      return;
    }

    try {
      // Submit the rating
      const { error: ratingError } = await supabase
        .from('politician_ratings')
        .insert({
          user_id: user.id,
          politician_id: politician.id,
          rating,
        });

      if (ratingError) throw ratingError;

      // Submit the comment if provided
      if (comment.trim()) {
        const { error: commentError } = await supabase
          .from('politician_comments')
          .insert({
            user_id: user.id,
            politician_id: politician.id,
            comment: comment.trim(),
          });

        if (commentError) throw commentError;
      }

      // Recalculate average rating
      const { data: ratings, error: avgError } = await supabase
        .from('politician_ratings')
        .select('rating')
        .eq('politician_id', politician.id);

      if (avgError) throw avgError;

      const totalRatings = ratings.length;
      const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = sumRatings / totalRatings;

      // Update politician's average rating
      const { error: updateError } = await supabase
        .from('politicians')
        .update({
          average_rating: newAverage,
          total_ratings: totalRatings,
        })
        .eq('id', politician.id);

      if (updateError) throw updateError;

      // Refresh the politicians list
      fetchPoliticians();
      setShowRatingModal(false);
      setUserRating(null);
      setComment('');
      Alert.alert('Success', 'Your rating has been submitted');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };

  const renderPoliticianCard = (politician: Politician) => (
    <TouchableOpacity
      key={politician.id}
      style={[styles.politicianCard, { borderColor: theme.colors.neutral[200] }]}
      onPress={() => {
        setSelectedPolitician(politician);
        setShowRatingModal(true);
      }}
    >
      <Image
        source={{ uri: politician.image_url }}
        style={styles.politicianImage}
      />
      <View style={styles.politicianInfo}>
        <Text style={[styles.politicianName, { color: theme.colors.neutral[900] }]}>
          {politician.name}
        </Text>
        <Text style={[styles.position, { color: theme.colors.neutral[500] }]}>
          {politician.position}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: theme.colors.neutral[900] }]}>
            {politician.average_rating.toFixed(1)}
          </Text>
          <Text style={[styles.totalRatings, { color: theme.colors.neutral[500] }]}>
            ({politician.total_ratings})
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.commentsButton}
        onPress={() => navigation.navigate('PoliticianComments', { politician })}
      >
        <Ionicons name="chatbubble-outline" size={20} color={theme.colors.neutral[500]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            ratingType === 'politician' && { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={() => setRatingType('politician')}
        >
          <Text
            style={[
              styles.toggleText,
              ratingType === 'politician' && { color: theme.colors.neutral[50] },
            ]}
          >
            Politicians
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            ratingType === 'party' && { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={() => setRatingType('party')}
        >
          <Text
            style={[
              styles.toggleText,
              ratingType === 'party' && { color: theme.colors.neutral[50] },
            ]}
          >
            Parties
          </Text>
        </TouchableOpacity>
      </View>

      {ratingType === 'party' ? (
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
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.topThreeContainer}>
            {politicians.slice(0, 3).map((politician, index) => (
              <View
                key={politician.id}
                style={[
                  styles.topThreeCard,
                  { borderColor: getMedalColor(index) },
                ]}
              >
                <View style={styles.medalContainer}>
                  <Ionicons
                    name="medal"
                    size={24}
                    color={getMedalColor(index)}
                  />
                </View>
                <Image
                  source={{ uri: politician.image_url }}
                  style={styles.topThreeImage}
                />
                <Text style={[styles.politicianName, { color: theme.colors.neutral[900] }]}>
                  {politician.name}
                </Text>
                <Text style={[styles.position, { color: theme.colors.neutral[500] }]}>
                  {politician.position}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.rating, { color: theme.colors.neutral[900] }]}>
                    {politician.average_rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.totalRatings, { color: theme.colors.neutral[500] }]}>
                    ({politician.total_ratings})
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.allPoliticiansContainer}>
            {politicians.slice(3).map(renderPoliticianCard)}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral[50] }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.neutral[900] }]}>
              Rate {selectedPolitician?.name}
            </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                >
                  <Ionicons
                    name={star <= (userRating || 0) ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.commentInput, { 
                color: theme.colors.neutral[900],
                borderColor: theme.colors.neutral[200],
                backgroundColor: theme.colors.neutral[50],
              }]}
              placeholder="Add a comment (optional)"
              placeholderTextColor={theme.colors.neutral[500]}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => userRating && handleRating(selectedPolitician!, userRating)}
            >
              <Text style={[styles.submitButtonText, { color: theme.colors.neutral[50] }]}>
                Submit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'transparent' }]}
              onPress={() => setShowRatingModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.neutral[900] }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RatingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitRating}
        title={selectedParty?.name || ''}
        subtitle={selectedParty?.description || ''}
        imageUrl={selectedParty?.logo_url}
        currentRating={currentRating}
        currentComment={currentComment}
        onRatingChange={setCurrentRating}
        onCommentChange={setCurrentComment}
        entityType="party"
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  topThreeCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    width: '30%',
  },
  medalContainer: {
    position: 'absolute',
    top: -12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  topThreeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  politicianCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  politicianImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRatings: {
    marginLeft: 4,
    fontSize: 12,
  },
  allPoliticiansContainer: {
    paddingBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentsButton: {
    padding: 8,
  },
  commentInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 8,
    marginTop: 0,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 