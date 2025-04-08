import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { ModalComponent } from '../common/Modal';
import { RatingStars } from './RatingStars';
import { Rating } from '../../types/rating';
import { Button } from '../common/Button';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  currentRating?: number;
  currentComment?: string;
  onRatingChange?: (rating: number) => void;
  onCommentChange?: (comment: string) => void;
  entityType: 'politician' | 'party';
}

export function RatingModal({
  visible,
  onClose,
  onSubmit,
  title,
  subtitle,
  imageUrl,
  currentRating,
  currentComment,
  onRatingChange,
  onCommentChange,
  entityType,
}: RatingModalProps) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(currentRating || 0);
  const [comment, setComment] = useState(currentComment || '');

  const handleSubmit = () => {
    if (rating < 1) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (rating < 2) {
      Alert.alert(
        'Low Rating',
        'Are you sure you want to give a low rating?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Submit',
            onPress: () => onSubmit(rating, comment.trim()),
          },
        ]
      );
    } else {
      onSubmit(rating, comment.trim());
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleCommentChange = (text: string) => {
    setComment(text);
    onCommentChange?.(text);
  };

  return (
    <ModalComponent
      visible={visible}
      onClose={onClose}
      title={title}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.colors.neutral[500] }]}>
          {subtitle}
        </Text>
      )}
      <View style={styles.ratingContainer}>
        <RatingStars
          rating={rating}
          onRatingChange={handleRatingChange}
          size={24}
        />
      </View>
      <TextInput
        style={[
          styles.commentInput,
          {
            color: theme.colors.neutral[900],
            backgroundColor: theme.colors.neutral[100],
            borderColor: theme.colors.neutral[200],
          },
        ]}
        placeholder="Add a comment (optional)"
        placeholderTextColor={theme.colors.neutral[500]}
        value={comment}
        onChangeText={handleCommentChange}
        multiline
        numberOfLines={4}
      />
      <View style={styles.buttonContainer}>
        <Button
          variant="secondary"
          onPress={onClose}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!rating}
        >
          Submit Rating
        </Button>
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing.lg,
  },
  subtitle: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  },
  commentInput: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  button: {
    flex: 1,
  },
}); 