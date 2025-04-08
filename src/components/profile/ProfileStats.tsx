import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { tokens } from '../../theme/tokens';

interface ProfileStatsProps {
  userId: string;
  onFollowersPress: () => void;
  onFollowingPress: () => void;
}

export function ProfileStats({ userId, onFollowersPress, onFollowingPress }: ProfileStatsProps) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    listingsCount: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    checkIfFollowing();
  }, [userId]);

  const fetchStats = async () => {
    try {
      const [followers, following, posts, listings] = await Promise.all([
        supabase.from('user_followers').select('*').eq('following_id', userId),
        supabase.from('user_followers').select('*').eq('follower_id', userId),
        supabase.from('posts').select('*').eq('user_id', userId),
        supabase.from('marketplace_listings').select('*').eq('user_id', userId),
      ]);

      setStats({
        followersCount: followers.data?.length || 0,
        followingCount: following.data?.length || 0,
        postsCount: posts.data?.length || 0,
        listingsCount: listings.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkIfFollowing = async () => {
    if (user?.id === userId) return;
    try {
      const { data } = await supabase
        .from('user_followers')
        .select('*')
        .eq('follower_id', user?.id)
        .eq('following_id', userId)
        .single();
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (user?.id === userId) return;
    setLoading(true);

    try {
      if (isFollowing) {
        await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', user?.id)
          .eq('following_id', userId);
      } else {
        await supabase
          .from('user_followers')
          .insert([{ follower_id: user?.id, following_id: userId }]);
      }

      setIsFollowing(!isFollowing);
      await fetchStats();
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.neutral[200] }]}>
      <View style={styles.statsRow}>
        <Button
          variant="text"
          style={styles.statItem}
          onPress={onFollowersPress}
        >
          <Text style={[styles.statNumber, { color: theme.colors.neutral[900] }]}>
            {stats.followersCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.neutral[500] }]}>
            Followers
          </Text>
        </Button>

        <Button
          variant="text"
          style={styles.statItem}
          onPress={onFollowingPress}
        >
          <Text style={[styles.statNumber, { color: theme.colors.neutral[900] }]}>
            {stats.followingCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.neutral[500] }]}>
            Following
          </Text>
        </Button>

        <View style={[styles.statDivider, { backgroundColor: theme.colors.neutral[200] }]} />

        <View style={styles.statItem}>
          <View style={styles.inlineStats}>
            <Text style={[styles.statNumber, { color: theme.colors.neutral[900] }]}>
              {stats.postsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.neutral[500] }]}>
              Posts
            </Text>
            <Text style={[styles.statNumber, { color: theme.colors.neutral[900] }]}>
              {stats.listingsCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.neutral[500] }]}>
              Listings
            </Text>
          </View>
        </View>
      </View>

      {user?.id !== userId && (
        <Button
          variant={isFollowing ? 'outline' : 'primary'}
          onPress={handleFollowToggle}
          disabled={loading}
          style={styles.followButton}
        >
          {isFollowing ? (
            <View style={styles.followingContent}>
              <Ionicons name="checkmark" size={16} color={theme.colors.primary[500]} />
              <Text style={[styles.followButtonText, { color: theme.colors.primary[500] }]}>
                Following
              </Text>
            </View>
          ) : (
            <Text style={[styles.followButtonText, { color: theme.colors.neutral[50] }]}>
              Follow
            </Text>
          )}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    borderBottomWidth: 1,
    marginBottom: tokens.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  statDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  inlineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: tokens.typography.fontSize.xs,
    marginRight: 8,
  },
  followButton: {
    marginTop: tokens.spacing.md,
    minWidth: 120,
  },
  followingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButtonText: {
    fontWeight: tokens.typography.fontWeight.semibold,
    fontSize: tokens.typography.fontSize.sm,
    marginLeft: tokens.spacing.xs,
  },
});