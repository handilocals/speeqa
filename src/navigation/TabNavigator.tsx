import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../contexts/ThemeContext';
import { tokens } from '../theme/tokens';
import { Icon } from '../components/common/Icon';
import { ICONS } from '../constants/icons';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.neutral[50],
            borderTopColor: theme.colors.neutral[200],
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.colors.primary[500],
          tabBarInactiveTintColor: theme.colors.neutral[500],
          tabBarLabelStyle: {
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? ICONS.homeFilled : ICONS.home}
                size={size}
                color={color}
                variant={focused ? 'filled' : 'outline'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? ICONS.marketplaceFilled : ICONS.marketplace}
                size={size}
                color={color}
                variant={focused ? 'filled' : 'outline'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? ICONS.messagesFilled : ICONS.messages}
                size={size}
                color={color}
                variant={focused ? 'filled' : 'outline'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Collections"
          component={CollectionsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? ICONS.collectionsFilled : ICONS.collections}
                size={size}
                color={color}
                variant={focused ? 'filled' : 'outline'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Icon
                name={focused ? ICONS.profileFilled : ICONS.profile}
                size={size}
                color={color}
                variant={focused ? 'filled' : 'outline'}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});