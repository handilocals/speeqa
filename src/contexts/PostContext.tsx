import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Post {
  id: string;
  content: string;
  user_id: string;
  image_url?: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  reposts_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  is_disliked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  original_post_id?: string;
  is_repost?: boolean;
  username?: string;
  avatar_url?: string;
}

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  dislikePost: (postId: string) => Promise<void>;
  repostPost: (postId: string) => Promise<void>;
  bookmarkPost: (postId: string) => Promise<void>;
  editPost: (postId: string, content: string, image_url?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  createPost: (content: string, imageUrl?: string, quotePostId?: string) => Promise<Post>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // First fetch all posts with user information
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then fetch the user's interactions
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      const { data: dislikesData, error: dislikesError } = await supabase
        .from('post_dislikes')
        .select('post_id')
        .eq('user_id', user.id);

      const { data: repostsData, error: repostsError } = await supabase
        .from('post_reposts')
        .select('post_id')
        .eq('user_id', user.id);

      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', user.id);

      if (likesError || dislikesError || repostsError || bookmarksError) {
        throw new Error('Failed to fetch interactions');
      }

      // Create Sets for efficient lookup
      const likedPostIds = new Set(likesData?.map(like => like.post_id));
      const dislikedPostIds = new Set(dislikesData?.map(dislike => dislike.post_id));
      const repostedPostIds = new Set(repostsData?.map(repost => repost.post_id));
      const bookmarkedPostIds = new Set(bookmarksData?.map(bookmark => bookmark.post_id));

      // Combine the data
      const postsWithInteractions = postsData?.map(post => ({
        ...post,
        username: post.user?.username,
        avatar_url: post.user?.avatar_url,
        is_liked: likedPostIds.has(post.id),
        is_disliked: dislikedPostIds.has(post.id),
        is_reposted: repostedPostIds.has(post.id),
        is_bookmarked: bookmarkedPostIds.has(post.id)
      })) || [];

      setPosts(postsWithInteractions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const dislikePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_disliked) {
        // Undislike the post
        const { error } = await supabase
          .from('post_dislikes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_disliked: false, dislikes_count: p.dislikes_count - 1 }
            : p
        ));
      } else {
        // Dislike the post
        const { error } = await supabase
          .from('post_dislikes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_disliked: true, dislikes_count: p.dislikes_count + 1 }
            : p
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const repostPost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_reposted) {
        // Unrepost the post
        const { error } = await supabase
          .from('post_reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_reposted: false, reposts_count: p.reposts_count - 1 }
            : p
        ));
      } else {
        // Create a new repost
        const { error: repostError } = await supabase
          .from('posts')
          .insert([
            {
              content: post.content,
              image_url: post.image_url,
              user_id: user.id,
              original_post_id: postId,
              is_repost: true
            }
          ]);

        if (repostError) throw repostError;

        // Add to reposts table
        const { error: interactionError } = await supabase
          .from('post_reposts')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (interactionError) throw interactionError;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_reposted: true, reposts_count: p.reposts_count + 1 }
            : p
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const bookmarkPost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_bookmarked) {
        // Unbookmark the post
        const { error } = await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_bookmarked: false }
            : p
        ));
      } else {
        // Bookmark the post
        const { error } = await supabase
          .from('post_bookmarks')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_bookmarked: true }
            : p
        ));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editPost = async (postId: string, content: string, image_url?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          content,
          image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createPost = async (content: string, imageUrl?: string, quotePostId?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const postData = {
        content,
        image_url: imageUrl,
        user_id: user.id,
        likes_count: 0,
        dislikes_count: 0,
        comments_count: 0,
        reposts_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          user:profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      // Update local state with the new post
      setPosts(currentPosts => [
        {
          ...data,
          username: data.user?.username,
          avatar_url: data.user?.avatar_url,
          is_liked: false,
          is_disliked: false,
          is_reposted: false,
          is_bookmarked: false,
          likes_count: 0,
          dislikes_count: 0,
          comments_count: 0,
          reposts_count: 0
        },
        ...currentPosts
      ]);

      return data;
    } catch (err: any) {
      console.error('Error in createPost:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    likePost,
    dislikePost,
    repostPost,
    bookmarkPost,
    editPost,
    deletePost,
    createPost,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}