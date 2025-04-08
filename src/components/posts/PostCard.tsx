import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Post, usePosts } from '../../contexts/PostContext';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { CommentModal } from './CommentModal';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Default theme values as fallback
const defaultTheme = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#000000',
  border: '#EEEEEE',
};

interface PostCardProps {
  post: Post;
  onPress: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { likePost, dislikePost, repostPost, bookmarkPost, editPost, deletePost } = usePosts();
  const [showRepostOptions, setShowRepostOptions] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const handleLike = () => likePost(post.id);
  const handleDislike = () => dislikePost(post.id);
  const handleRepost = () => repostPost(post.id);
  const handleBookmark = () => bookmarkPost(post.id);
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: post.content,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRepostPress = () => {
    Alert.alert(
      'Repost',
      'Choose how you want to share this post',
      [
        {
          text: 'Repost',
          onPress: handleRepost,
        },
        {
          text: 'Quote',
          onPress: () => {
            navigation.navigate('Compose', { 
              quotePost: post,
              initialContent: '',
              isQuote: true
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('Compose', { 
      postId: post.id,
      initialContent: post.content,
      initialImageUrl: post.image_url
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ],
    );
  };

  const isOwnPost = user?.id === post.user_id;

  return (
    <>
      <TouchableOpacity 
        style={[styles.container, { 
          backgroundColor: theme.colors.neutral[50],
          borderBottomColor: theme.colors.neutral[200] 
        }]} 
        onPress={onPress}
      >
        <View style={styles.content}>
          <Text style={[styles.text, { color: theme.colors.neutral[900] }]}>
            {post.content}
          </Text>
          {post.image_url && (
            <Image source={{ uri: post.image_url }} style={styles.image} />
          )}
        </View>
        
        <View style={styles.interactions}>
          <TouchableOpacity style={styles.button} onPress={handleLike}>
            <Ionicons 
              name={post.is_liked ? "heart" : "heart-outline"}
              size={20} 
              color={post.is_liked ? "#FF3B30" : theme.colors.neutral[900]} 
            />
            <Text style={[styles.count, { color: theme.colors.neutral[900] }]}>
              {post.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => setShowCommentModal(true)}>
            <Ionicons 
              name="chatbubble-outline" 
              size={20} 
              color={theme.colors.neutral[900]} 
            />
            <Text style={[styles.count, { color: theme.colors.neutral[900] }]}>
              {post.comments_count}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleDislike}>
            <FontAwesome5 
              name="heart-broken" 
              size={20} 
              color={post.is_disliked ? "#FF3B30" : theme.colors.neutral[900]} 
            />
            <Text style={[styles.count, { color: theme.colors.neutral[900] }]}>
              {post.dislikes_count}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleRepostPress}>
            <Ionicons 
              name={post.is_reposted ? "repeat" : "repeat-outline"}
              size={20} 
              color={post.is_reposted ? theme.colors.primary[500] : theme.colors.neutral[900]} 
            />
            <Text style={[styles.count, { color: theme.colors.neutral[900] }]}>
              {post.reposts_count}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <Ionicons 
              name="share-outline" 
              size={20} 
              color={theme.colors.neutral[900]} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleBookmark}>
            <Ionicons 
              name={post.is_bookmarked ? "bookmark" : "bookmark-outline"}
              size={20} 
              color={post.is_bookmarked ? theme.colors.primary[500] : theme.colors.neutral[900]} 
            />
          </TouchableOpacity>

          {isOwnPost && (
            <>
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color={theme.colors.neutral[900]} 
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleDelete}>
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color={theme.colors.error[500]} 
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>

      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={post.id}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    padding: 15,
  },
  content: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  count: {
    marginLeft: 4,
    fontSize: 14,
  },
});