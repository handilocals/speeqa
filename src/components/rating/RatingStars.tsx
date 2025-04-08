import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  interactive?: boolean;
  showHalfStars?: boolean;
}

export function RatingStars({
  rating,
  onRatingChange,
  size = 24,
  interactive = false,
  showHalfStars = false,
}: RatingStarsProps) {
  const { theme } = useTheme();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handlePress = async (star: number) => {
    if (!interactive) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRatingChange?.(star);
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }
  };

  const renderStar = (index: number) => {
    const currentRating = hoverRating || rating;
    const isHalfStar = showHalfStars && currentRating % 1 !== 0;
    const isFilled = index <= currentRating;
    const isHalf = isHalfStar && index === Math.ceil(currentRating);

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePress(index)}
        onPressIn={() => interactive && setHoverRating(index)}
        onPressOut={() => interactive && setHoverRating(null)}
        activeOpacity={interactive ? 0.7 : 1}
        style={styles.starContainer}
      >
        <Ionicons
          name={
            isFilled
              ? 'star'
              : isHalf
              ? 'star-half'
              : 'star-outline'
          }
          size={size}
          color="#FFD700"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
}); 