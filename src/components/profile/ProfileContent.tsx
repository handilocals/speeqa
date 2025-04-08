import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../contexts/ThemeContext";
import { PostCard } from "../posts/PostCard";
import { Post, usePosts } from "../../contexts/PostContext";
import { MarketplaceListingCard } from "../marketplace/MarketplaceListingCard";
import { Button } from "../common/Button";
import { tokens } from "../../theme/tokens";
import { useNotifications } from "../../contexts/NotificationContext";

interface ProfileContentProps {
  userId: string;
  onPostPress: (postId: string) => void;
  onListingPress: (listingId: string) => void;
  ListHeaderComponent?: React.ReactNode;
}

export function ProfileContent({
  userId,
  onPostPress,
  onListingPress,
  ListHeaderComponent,
}: ProfileContentProps) {
  const { theme } = useTheme();
  const { posts: allPosts, loading: postsLoading, fetchPosts } = usePosts();
  const {
    notifications,
    loading: notificationsLoading,
    fetchNotifications,
  } = useNotifications();
  const [activeTab, setActiveTab] = useState<
    "posts" | "listings" | "notifications"
  >("posts");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter posts for the current user
  const posts = allPosts.filter((post) => post.user_id === userId);

  useEffect(() => {
    if (activeTab === "posts") {
      fetchPosts();
    } else if (activeTab === "listings") {
      fetchListings();
    } else if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab, userId]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabBar = () => (
    <View
      style={[styles.tabBar, { borderBottomColor: theme.colors.neutral[200] }]}
    >
      <Button
        variant="text"
        style={{
          ...styles.tab,
          ...(activeTab === "posts" ? styles.activeTab : {}),
        }}
        onPress={() => setActiveTab("posts")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "posts"
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[500],
            },
          ]}
        >
          Posts
        </Text>
        {activeTab === "posts" && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary[500] },
            ]}
          />
        )}
      </Button>
      <Button
        variant="text"
        style={{
          ...styles.tab,
          ...(activeTab === "listings" ? styles.activeTab : {}),
        }}
        onPress={() => setActiveTab("listings")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "listings"
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[500],
            },
          ]}
        >
          Listings
        </Text>
        {activeTab === "listings" && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary[500] },
            ]}
          />
        )}
      </Button>
      <Button
        variant="text"
        style={{
          ...styles.tab,
          ...(activeTab === "notifications" ? styles.activeTab : {}),
        }}
        onPress={() => setActiveTab("notifications")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "notifications"
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[500],
            },
          ]}
        >
          Notifications
        </Text>
        {activeTab === "notifications" && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary[500] },
            ]}
          />
        )}
      </Button>
    </View>
  );

  const renderListHeaderComponent = () => (
    <>
      {ListHeaderComponent}
      {renderTabBar()}
    </>
  );

  if (activeTab === "posts") {
    return (
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => onPostPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={fetchPosts}
        refreshing={postsLoading}
        ListHeaderComponent={renderListHeaderComponent}
        ListEmptyComponent={
          <Text
            style={[styles.emptyText, { color: theme.colors.neutral[500] }]}
          >
            No posts yet
          </Text>
        }
      />
    );
  }

  if (activeTab === "listings") {
    return (
      <FlatList
        data={listings}
        renderItem={({ item }) => (
          <MarketplaceListingCard
            listing={item}
            onPress={() => onListingPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={fetchListings}
        refreshing={loading}
        ListHeaderComponent={renderListHeaderComponent}
        ListEmptyComponent={
          <Text
            style={[styles.emptyText, { color: theme.colors.neutral[500] }]}
          >
            No listings yet
          </Text>
        }
      />
    );
  }

  return (
    <FlatList
      data={notifications || []}
      renderItem={({ item }) => <NotificationItem notification={item} />}
      keyExtractor={(item) => item.id}
      onRefresh={fetchNotifications}
      refreshing={notificationsLoading}
      ListHeaderComponent={renderListHeaderComponent}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
          No notifications yet
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    alignItems: "center",
  },
  activeTab: {
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
  },
  tabText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  emptyText: {
    textAlign: "center",
    padding: tokens.spacing.lg,
  },
  listingsRow: {
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xs,
  },
});
