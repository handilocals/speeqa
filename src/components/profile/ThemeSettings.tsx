import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeType } from '../../contexts/ThemeContext';

export function ThemeSettings() {
  const { theme, themeType, setThemeType } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const animHeight = React.useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(animHeight, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const themeOptions = [
    { 
      label: 'System', 
      value: 'system', 
      icon: 'phone-portrait-outline',
      description: 'Match your device settings',
    },
    { 
      label: 'Light', 
      value: 'light', 
      icon: 'sunny-outline',
      description: 'Bright and clean interface',
    },
    { 
      label: 'Dark', 
      value: 'dark', 
      icon: 'moon-outline',
      description: 'Easy on the eyes in low light',
    },
  ];

  const selectedOption = themeOptions.find(option => option.value === themeType);

  const interpolateHeight = animHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 215], // Approximate height of expanded content
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[100] }]}>
      <TouchableOpacity 
        style={[styles.header, { borderBottomColor: expanded ? theme.colors.neutral[200] : 'transparent' }]} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <Ionicons 
            name="color-palette-outline" 
            size={22} 
            color={theme.colors.primary[500]} 
            style={styles.titleIcon}
          />
          <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>Appearance</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.currentSelectionContainer}>
            <Ionicons 
              name={selectedOption?.icon as any} 
              size={16} 
              color={theme.colors.primary[500]} 
            />
            <Text style={[styles.currentSelection, { color: theme.colors.neutral[500] }]}>
              {selectedOption?.label}
            </Text>
          </View>
          
          <Animated.View style={{
            transform: [{
              rotate: animHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg']
              })
            }]
          }}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={theme.colors.neutral[500]} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <Animated.View style={[styles.optionsContainer, { height: interpolateHeight }]}>
        <View style={styles.optionsContent}>
          {themeOptions.map((option) => {
            const isSelected = themeType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected 
                      ? theme.colors.primary[100]  // 10% opacity of primary color
                      : 'transparent',
                    borderColor: isSelected 
                      ? theme.colors.primary[500] 
                      : theme.colors.neutral[200],
                  },
                ]}
                onPress={() => {
                  setThemeType(option.value as ThemeType);
                  // Optionally close the menu after selection
                  // toggleExpand();
                }}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={isSelected ? theme.colors.primary[500] : theme.colors.neutral[500]} 
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? theme.colors.primary[500] : theme.colors.neutral[900] },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: theme.colors.neutral[500] },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={theme.colors.primary[500]} 
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  currentSelection: {
    fontSize: 14,
    marginLeft: 4,
  },
  optionsContainer: {
    overflow: 'hidden',
  },
  optionsContent: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 8,
  },
});