import React, { useEffect } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { PostCard } from '../components/posts/PostCard';
import { usePosts } from '../contexts/PostContext';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import { useTheme } from '../contexts/ThemeContext';
import { HomeFAB } from '../components/home/HomeFAB';

// Default theme values as fallback
const defaultTheme = {
  background: '#FFFFFF',
  primary: '#000000',
};

export function HomeScreen({ navigation }: { navigation: any }) {
  const { posts, loading, fetchPosts } = usePosts();
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading && posts.length === 0) {
    return <LoadingIndicator fullScreen />;
  }

  const handleCreatePost = () => {
    navigation.navigate('Compose');
  };

  const handleCreatePoll = () => {
    navigation.navigate('CreatePoll');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchPosts}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
      />
      <HomeFAB
        onCreatePost={handleCreatePost}
        onCreatePoll={handleCreatePoll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});