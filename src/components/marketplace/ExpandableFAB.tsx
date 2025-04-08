import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpandableFABProps {
  onCreateListing: () => void;
  onCreatePost: () => void;
}

const defaultTheme = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#000000',
  border: '#EEEEEE',
};

export function ExpandableFAB({ onCreateListing, onCreatePost }: ExpandableFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const listingTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const postTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const handleListingPress = () => {
    toggleExpand();
    setTimeout(() => {
      onCreateListing();
    }, 200);
  };

  const handlePostPress = () => {
    toggleExpand();
    setTimeout(() => {
      onCreatePost();
    }, 200);
  };

  const handleBackdropPress = () => {
    if (isExpanded) {
      toggleExpand();
    }
  };

  const renderFABOption = (
    translateY: Animated.AnimatedInterpolation<string | number>,
    icon: keyof typeof Ionicons.glyphMap,
    onPress: () => void
  ) => (
    <Animated.View
      style={[
        styles.fabOption,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.fabOptionButton, { backgroundColor: theme.colors.primary[500] }]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={24} color={theme.colors.neutral[50]} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      {isExpanded && (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={handleBackdropPress}
        />
      )}
      <View style={styles.container} pointerEvents="box-none">
        {renderFABOption(
          postTranslateY,
          'create-outline',
          handlePostPress
        )}
        {renderFABOption(
          listingTranslateY,
          'pricetag-outline',
          handleListingPress
        )}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary[500] }]}
          onPress={toggleExpand}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={24} color={theme.colors.neutral[50]} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 2,
  },
  fabOption: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  fabOptionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
}); 