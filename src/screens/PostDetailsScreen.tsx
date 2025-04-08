import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { Post } from '../contexts/PostContext';
import { PostCard } from '../components/posts/PostCard';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

export function PostDetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const { theme } = useTheme();
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (!post) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <PostCard 
        post={post}
        onPress={() => {}} // Disable navigation on press since we're already in details
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});