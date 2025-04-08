import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MarketplaceBannerProps {
  theme: any;
  onLearnMore: () => void;
}

const { width } = Dimensions.get('window');

const MarketplaceBanner: React.FC<MarketplaceBannerProps> = ({ theme, onLearnMore }) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animate banner entrance
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: theme?.primary },
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.bannerContent}>
        <View style={styles.textContainer}>
          <Text style={[styles.bannerText, { color: theme?.background }]}>
            You can start by listing that which you don't use anymore and earn or list them as a gift to whoever can come pick it up.
          </Text>
          <TouchableOpacity
            style={[styles.learnMoreButton, { borderColor: theme?.background }]}
            onPress={onLearnMore}
          >
            <Text style={[styles.learnMoreText, { color: theme?.background }]}>
              Learn more
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleDismiss}
        >
          <Ionicons name="close" size={24} color={theme?.background} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 16,
    width: width,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  bannerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  learnMoreButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default MarketplaceBanner; 