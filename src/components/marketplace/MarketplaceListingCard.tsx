import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../common/Card';
import { tokens } from '../../theme/tokens';

interface MarketplaceListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    image_url?: string;
    description?: string;
    condition?: string;
    created_at?: string;
  };
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - tokens.spacing.xl) / 2;

export function MarketplaceListingCard({ listing, onPress }: MarketplaceListingCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <Card
      variant="elevated"
      onPress={onPress}
      style={styles.container}
    >
      {listing.image_url ? (
        <Image
          source={{ uri: listing.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage, { backgroundColor: theme.colors.neutral[100] }]}>
          <Text style={[styles.placeholderText, { color: theme.colors.neutral[500] }]}>
            No Image
          </Text>
        </View>
      )}
      <View style={styles.details}>
        <Text 
          style={[styles.title, { color: theme.colors.neutral[900] }]} 
          numberOfLines={2}
        >
          {listing.title}
        </Text>
        {listing.description && (
          <Text 
            style={[styles.description, { color: theme.colors.neutral[500] }]} 
            numberOfLines={2}
          >
            {listing.description}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.colors.primary[500] }]}>
            ${listing.price.toFixed(2)}
          </Text>
          {listing.condition && (
            <Text style={[styles.condition, { color: theme.colors.neutral[500] }]}>
              {listing.condition}
            </Text>
          )}
        </View>
        {listing.created_at && (
          <Text style={[styles.date, { color: theme.colors.neutral[500] }]}>
            {new Date(listing.created_at).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: tokens.spacing.xs,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: tokens.borderRadius.md,
    borderTopRightRadius: tokens.borderRadius.md,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: tokens.typography.fontSize.sm,
  },
  details: {
    padding: tokens.spacing.md,
  },
  title: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    marginBottom: tokens.spacing.xs,
  },
  description: {
    fontSize: tokens.typography.fontSize.sm,
    marginBottom: tokens.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  price: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  condition: {
    fontSize: tokens.typography.fontSize.sm,
  },
  date: {
    fontSize: tokens.typography.fontSize.xs,
  },
});