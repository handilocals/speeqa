import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { PostProvider } from './src/contexts/PostContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { CollectionProvider, Collection } from './src/contexts/CollectionContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { SplashScreen } from './src/components/common/SplashScreen';
import { supabase, isOnlineStatus } from './src/lib/supabase';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';
import { LoadingScreen } from './src/components/auth/LoadingScreen';
import { ComposePostScreen } from './src/screens/ComposePostScreen';
import { PostDetailsScreen } from './src/screens/PostDetailsScreen';
import { FollowersListScreen } from './src/screens/FollowersListScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { ListingDetailsScreen, Listing } from './src/screens/ListingDetailsScreen';
import { CreateListingScreen } from './src/screens/CreateListingScreen';
import { MarketplaceFiltersScreen } from './src/screens/MarketplaceFiltersScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SupportScreen } from './src/screens/SupportScreen';
import { DiscoverCollectionsScreen } from './src/screens/DiscoverCollectionsScreen';
import CollectionDetailsScreen from './src/screens/CollectionDetailsScreen';
import { CollectionsScreen } from './src/screens/CollectionsScreen';
import { CreatePollScreen } from './src/screens/CreatePollScreen';
import { RatingScreen } from './src/screens/RatingScreen';
import { AdminPoliticiansScreen } from './src/screens/AdminPoliticiansScreen';
import { PoliticianCommentsScreen } from './src/screens/PoliticianCommentsScreen';
import { PartyRatingScreen } from './src/screens/PartyRatingScreen';
import { tokens } from './src/theme/tokens';
import { NotificationsScreen } from './src/screens/NotificationsScreen';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  Profile: { userId?: string };
  Compose: undefined;
  PostDetails: { postId: string };
  FollowersList: { userId: string; type: 'followers' | 'following' };
  ListingDetails: { listing: Listing };
  CreateListing: undefined;
  MarketplaceFilters: { 
    currentState: string; 
    currentCity: string;
    onApply: (state: string, city: string) => void 
  };
  Chat: { userId: string; username: string; listingId?: string; type?: 'general' | 'marketplace' };
  Search: { category?: string };
  Settings: undefined;
  Privacy: undefined;
  Language: undefined;
  Location: undefined;
  Help: undefined;
  Contact: undefined;
  Terms: undefined;
  About: undefined;
  Support: undefined;
  DiscoverCollections: undefined;
  CollectionDetails: { collection: Collection };
  Collections: undefined;
  Messages: undefined;
  Marketplace: undefined;
  LearnMore: undefined;
  CreatePoll: undefined;
  Rating: undefined;
  AdminPoliticians: undefined;
  PoliticianComments: {
    politician: {
      id: string;
      name: string;
      position: string;
      image_url: string;
    };
  };
  PartyRating: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      const status = await isOnlineStatus();
      setIsOnline(status);
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  const navigationTheme = {
    ...(isDark ? NavigationDarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? NavigationDarkTheme : DefaultTheme).colors,
      background: theme.colors.neutral[50],
      card: theme.colors.neutral[50],
      text: theme.colors.neutral[900],
      border: theme.colors.neutral[200],
      primary: theme.colors.primary[500],
      notification: theme.colors.primary[500],
    },
  };

  return (
    <SplashScreen isLoading={isLoading}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <PostProvider>
          <CollectionProvider>
            <Stack.Navigator 
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'fade',
                headerStyle: {
                  backgroundColor: theme.colors.neutral[50],
                },
                headerTintColor: theme.colors.neutral[900],
                contentStyle: {
                  backgroundColor: theme.colors.neutral[50],
                },
              }}
            >
              {!user ? (
                // Auth Stack
                <>
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen}
                  />
                  <Stack.Screen 
                    name="SignUp" 
                    component={SignUpScreen}
                  />
                </>
              ) : (
                // Main App Stack
                <>
                  <Stack.Screen 
                    name="MainTabs" 
                    component={TabNavigator}
                  />
                  <Stack.Screen
                    name="Compose"
                    component={ComposePostScreen}
                    options={{
                      headerShown: true,
                      title: 'Create Post',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="CreatePoll"
                    component={CreatePollScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="ListingDetails"
                    component={ListingDetailsScreen}
                    options={{
                      headerShown: true,
                      title: 'Listing Details',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="CreateListing"
                    component={CreateListingScreen}
                    options={{
                      headerShown: true,
                      title: 'Create Listing',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="MarketplaceFilters"
                    component={MarketplaceFiltersScreen}
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
                    }}
                  />
                  <Stack.Screen
                    name="FollowersList"
                    component={FollowersListScreen}
                    options={({ route }) => ({
                      headerShown: true,
                      title: route.params.type === 'followers' ? 'Followers' : 'Following',
                    })}
                  />
                  <Stack.Screen
                    name="PostDetails"
                    component={PostDetailsScreen}
                    options={{
                      headerShown: true,
                      title: 'Post',
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="Support"
                    component={SupportScreen}
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="DiscoverCollections"
                    component={DiscoverCollectionsScreen}
                    options={{
                      title: 'Discover Collections',
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen
                    name="CollectionDetails"
                    component={CollectionDetailsScreen}
                    options={{
                      headerShown: true,
                      title: 'Collection Details',
                    }}
                  />
                  <Stack.Screen
                    name="Collections"
                    component={CollectionsScreen}
                    options={{
                      headerShown: true,
                      title: 'My Collections',
                    }}
                  />
                  <Stack.Screen
                    name="Rating"
                    component={RatingScreen}
                    options={{
                      headerShown: true,
                      title: 'Rate Politician',
                    }}
                  />
                  <Stack.Screen
                    name="AdminPoliticians"
                    component={AdminPoliticiansScreen}
                    options={{
                      headerShown: true,
                      title: 'Manage Politicians',
                    }}
                  />
                  <Stack.Screen
                    name="PoliticianComments"
                    component={PoliticianCommentsScreen}
                    options={{
                      headerShown: true,
                      title: 'Comments',
                    }}
                  />
                  <Stack.Screen
                    name="PartyRating"
                    component={PartyRatingScreen}
                    options={{
                      headerShown: true,
                      title: 'Rate Party',
                    }}
                  />
                  <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{
                      headerShown: true,
                      title: 'Notifications',
                      animation: 'slide_from_right',
                    }}
                  />
                </>
              )}
            </Stack.Navigator>
          </CollectionProvider>
        </PostProvider>
      </NavigationContainer>
    </SplashScreen>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
