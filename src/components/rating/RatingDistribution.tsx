import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RatingDistributionProps {
  distribution: { [key: number]: number };
  total: number;
  showLabels?: boolean;
  height?: number;
}

export function RatingDistribution({
  distribution,
  total,
  showLabels = true,
  height = 8,
}: RatingDistributionProps) {
  const { theme } = useTheme();

  const getPercentage = (count: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  return (
    <View style={styles.container}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <View key={rating} style={styles.barContainer}>
          {showLabels && (
            <Text style={[styles.label, { color: theme.colors.neutral[500] }]}>
              {rating}
            </Text>
          )}
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${getPercentage(distribution[rating] || 0)}%`,
                  backgroundColor: theme.colors.primary[500],
                  height,
                },
              ]}
            />
          </View>
          {showLabels && (
            <Text style={[styles.count, { color: theme.colors.neutral[500] }]}>
              {distribution[rating] || 0}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  label: {
    width: 20,
    fontSize: 12,
    textAlign: 'center',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
  count: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
  },
}); 