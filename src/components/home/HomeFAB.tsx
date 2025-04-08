import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { ICONS } from '../../constants/icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface HomeFABProps {
  onCreatePost: () => void;
  onCreatePoll: () => void;
}

type RootStackParamList = {
  Home: {
    screen: 'CreatePoll' | 'Rating';
  };
  Rating: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeFAB({ onCreatePost, onCreatePoll }: HomeFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NavigationProp>();

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

  const postTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const pollTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const rateTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -240],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const handlePostPress = () => {
    if (!isExpanded) return;
    toggleExpand();
    setTimeout(() => {
      onCreatePost();
    }, 200);
  };

  const handlePollPress = () => {
    if (!isExpanded) return;
    toggleExpand();
    setTimeout(() => {
      onCreatePoll();
    }, 200);
  };

  const handleBackdropPress = () => {
    if (isExpanded) {
      toggleExpand();
    }
  };

  const handleRatePolitician = () => {
    if (!isExpanded) return;
    toggleExpand();
    navigation.navigate('Rating');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {isExpanded && (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop, { backgroundColor: `${theme.colors.neutral[900]}80` }]}
          onPress={handleBackdropPress}
        />
      )}
      
      <View style={styles.fabContainer}>
        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: rateTranslateY }],
              opacity,
              backgroundColor: theme.colors.primary[500],
              zIndex: isExpanded ? 1 : 0,
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handleRatePolitician}
            style={styles.actionButtonContent}
            activeOpacity={0.7}
          >
            <Icon name={ICONS.star} size="md" color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: pollTranslateY }],
              opacity,
              backgroundColor: theme.colors.primary[500],
              zIndex: isExpanded ? 1 : 0,
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handlePollPress}
            style={styles.actionButtonContent}
            activeOpacity={0.7}
          >
            <Icon name={ICONS.poll} size="md" color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: postTranslateY }],
              opacity,
              backgroundColor: theme.colors.primary[500],
              zIndex: isExpanded ? 1 : 0,
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handlePostPress}
            style={styles.actionButtonContent}
            activeOpacity={0.7}
          >
            <Icon name="pencil-outline" size="md" color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <Animated.View
          style={[
            styles.fab,
            {
              transform: [{ rotate: rotation }],
              backgroundColor: theme.colors.primary[500],
              zIndex: 2,
            },
          ]}
        >
          <TouchableOpacity
            onPress={toggleExpand}
            style={styles.fabButton}
            activeOpacity={0.7}
          >
            <Icon name={ICONS.add} size="md" color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  fabContainer: {
    position: 'absolute',
    bottom: tokens.spacing.lg,
    right: tokens.spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  actionText: {
    marginLeft: tokens.spacing.xs,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
}); 