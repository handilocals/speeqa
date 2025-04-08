import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileContent } from '../components/profile/ProfileContent';
import { ThemeSettings } from '../components/profile/ThemeSettings';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { tokens } from '../theme/tokens';

export function ProfileScreen({ navigation, route }: { navigation: any; route: any }) {
  const { profile, updateProfile, signOut } = useAuth();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const userId = route.params?.userId || profile?.id;
  const isOwnProfile = userId === profile?.id;

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const pickImage = async () => {
    if (!isOwnProfile) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        };

        const formData = new FormData();
        formData.append('file', file as any);

        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${profile?.id}/${Date.now()}.jpg`, formData);

        if (uploadError) throw uploadError;

        const avatarUrl = `${supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl}`;
        await updateProfile({ avatar: avatarUrl });

        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickCoverImage = async () => {
    if (!isOwnProfile) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        const file = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'cover.jpg',
        };

        const formData = new FormData();
        formData.append('file', file as any);

        const { data, error: uploadError } = await supabase.storage
          .from('covers')
          .upload(`${profile?.id}/${Date.now()}.jpg`, formData);

        if (uploadError) throw uploadError;

        const coverUrl = `${supabase.storage.from('covers').getPublicUrl(data.path).data.publicUrl}`;
        await updateProfile({ cover_image: coverUrl });

        Alert.alert('Success', 'Cover image updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleShowFollowers = () => {
    navigation.navigate('FollowersList', { userId, type: 'followers' });
  };

  const handleShowFollowing = () => {
    navigation.navigate('FollowersList', { userId, type: 'following' });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', { postId });
  };

  const handleListingPress = (listingId: string) => {
    navigation.navigate('ListingDetails', { listingId });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        {/* Cover Photo */}
        <Card variant="filled" style={styles.coverContainer}>
          <Image
            source={{ 
              uri: profile?.cover_image || 
              'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1000' 
            }}
            style={styles.coverImage}
          />
          {isOwnProfile && (
            <Button
              variant="primary"
              size="small"
              style={styles.editCoverButton}
              onPress={pickCoverImage}
            >
              <Ionicons name="camera" size={20} color={theme.colors.neutral[50]} />
            </Button>
          )}
        </Card>

        <ProfileContent
          userId={userId}
          onPostPress={handlePostPress}
          onListingPress={handleListingPress}
          ListHeaderComponent={
            <View>
              <View style={styles.profileHeader}>
                <View style={styles.avatarSection}>
                  <Button
                    variant="text"
                    onPress={pickImage}
                    disabled={!isOwnProfile}
                    style={styles.avatarContainer}
                  >
                    {profile?.avatar ? (
                      <Image
                        source={{ uri: profile.avatar }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary[500] }]}>
                        <Text style={[styles.avatarInitial, { color: theme.colors.neutral[50] }]}>
                          {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                        </Text>
                      </View>
                    )}
                    {isOwnProfile && (
                      <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary[500] }]}>
                        <Ionicons name="camera" size={14} color={theme.colors.neutral[50]} />
                      </View>
                    )}
                  </Button>
                  <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
                    @{profile?.username || 'username'}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  {profile?.full_name && (
                    <Text style={[styles.fullName, { color: theme.colors.neutral[900] }]}>
                      {profile.full_name}
                    </Text>
                  )}
                  {profile?.bio && (
                    <Text style={[styles.bio, { color: theme.colors.neutral[500] }]} numberOfLines={3}>
                      {profile.bio}
                    </Text>
                  )}
                  {profile?.website && (
                    <Button variant="text" onPress={() => {}}>
                      <Text style={[styles.website, { color: theme.colors.primary[500] }]}>
                        {profile.website}
                      </Text>
                    </Button>
                  )}
                  
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      onPress={handleEditProfile}
                      style={styles.editButton}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onPress={() => {}}
                      style={styles.followButton}
                    >
                      Follow
                    </Button>
                  )}
                </View>
              </View>

              <ProfileStats
                userId={userId}
                onFollowersPress={handleShowFollowers}
                onFollowingPress={handleShowFollowing}
              />

              {/* Theme Settings (only for own profile) */}
              {isOwnProfile && <ThemeSettings />}
            </View>
          }
        />

        {/* FAB Button (only for own profile) */}
        {isOwnProfile && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => navigation.navigate('Compose')}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        )}

        {/* Sign Out Button (only for own profile) */}
        {isOwnProfile && (
          <Button
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.colors.error[500]} style={styles.signOutIcon} />
            <Text style={[styles.signOutButtonText, { color: theme.colors.error[500] }]}>
              Sign Out
            </Text>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 0,
  },
  container: {
    flex: 1,
  },
  coverContainer: {
    height: 180,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editCoverButton: {
    position: 'absolute',
    bottom: tokens.spacing.sm,
    right: tokens.spacing.sm,
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.full,
  },
  profileHeader: {
    padding: tokens.spacing.md,
    flexDirection: 'row',
    marginTop: -60,
  },
  avatarSection: {
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.spacing.xs,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: tokens.borderRadius.full,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarInitial: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginTop: 100,
  },
  username: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
    textAlign: 'center',
  },
  fullName: {
    fontSize: tokens.typography.fontSize.base,
    marginBottom: tokens.spacing.xs,
  },
  bio: {
    fontSize: tokens.typography.fontSize.sm,
    marginBottom: tokens.spacing.xs,
  },
  website: {
    fontSize: tokens.typography.fontSize.sm,
    marginBottom: tokens.spacing.xs,
  },
  editButton: {
    marginTop: 0,
  },
  followButton: {
    marginTop: 0,
  },
  fab: {
    position: 'absolute',
    right: tokens.spacing.md,
    bottom: 80,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.full,
    borderWidth: 1,
  },
  signOutIcon: {
    marginRight: tokens.spacing.xs,
  },
  signOutButtonText: {
    fontWeight: tokens.typography.fontWeight.bold,
  },
});