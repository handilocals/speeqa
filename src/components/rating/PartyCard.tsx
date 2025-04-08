import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { PoliticalParty } from '../../types/party';
import { RatingStars } from './RatingStars';
import { RatingDistribution } from './RatingDistribution';

interface PartyCardProps {
  party: PoliticalParty;
  onPress: () => void;
  onCommentPress: () => void;
  showDistribution?: boolean;
}

export function PartyCard({
  party,
  onPress,
  onCommentPress,
  showDistribution = false,
}: PartyCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: theme.colors.neutral[200] }]}
      onPress={onPress}
    >
      <Image
        source={{ uri: party.logo_url }}
        style={styles.logo}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.neutral[900] }]}>
            {party.name}
          </Text>
          <TouchableOpacity
            style={styles.commentButton}
            onPress={onCommentPress}
          >
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={theme.colors.neutral[500]}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, { color: theme.colors.neutral[500] }]}>
          {party.description}
        </Text>
        <View style={styles.stats}>
          <View style={styles.ratingContainer}>
            <RatingStars rating={party.average_rating} size={16} />
            <Text style={[styles.ratingText, { color: theme.colors.neutral[900] }]}>
              {party.average_rating.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: theme.colors.neutral[500] }]}>
              ({party.total_ratings})
            </Text>
          </View>
          <View style={styles.politicianCount}>
            <Ionicons name="people" size={16} color={theme.colors.neutral[500]} />
            <Text style={[styles.countText, { color: theme.colors.neutral[500] }]}>
              {party.politician_count} Politicians
            </Text>
          </View>
        </View>
        {showDistribution && (
          <View style={styles.distributionContainer}>
            <RatingDistribution
              distribution={party.rating_distribution}
              total={party.total_ratings}
              showLabels={false}
              height={4}
            />
          </View>
        )}
        <View style={styles.ideologyContainer}>
          {party.ideology.map((ideology, index) => (
            <View
              key={index}
              style={[styles.ideologyTag, { backgroundColor: theme.colors.neutral[100] }]}
            >
              <Text style={[styles.ideologyText, { color: theme.colors.neutral[900] }]}>
                {ideology}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
  },
  politicianCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  countText: {
    marginLeft: 4,
    fontSize: 14,
  },
  distributionContainer: {
    marginBottom: 12,
  },
  ideologyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ideologyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ideologyText: {
    fontSize: 12,
  },
}); 