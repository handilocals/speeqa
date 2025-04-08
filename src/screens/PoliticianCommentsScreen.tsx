import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import { tokens } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PoliticianComments'>;

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export function PoliticianCommentsScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { politician } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [politician.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('politician_id', politician.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content: newComment,
            politician_id: politician.id,
            user_id: user?.id,
          },
        ])
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .single();

      if (error) throw error;
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
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
              const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

              if (error) throw error;
              setComments(comments.filter((comment) => comment.id !== commentId));
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
          Comments
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentContainer,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
          >
            <View style={styles.commentHeader}>
              <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
                {item.user.username}
              </Text>
              <Text style={[styles.date, { color: theme.colors.neutral[500] }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.commentText, { color: theme.colors.neutral[900] }]}>
              {item.content}
            </Text>
            {item.user.id === user?.id && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteComment(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error[500]} />
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            No comments yet
          </Text>
        }
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.neutral[100] }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.neutral[900] }]}
          placeholder="Write a comment..."
          placeholderTextColor={theme.colors.neutral[500]}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
        >
          <Ionicons
            name="send-outline"
            size={20}
            color={theme.colors.neutral[50]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
  },
  backButton: {
    padding: tokens.spacing.xs,
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  list: {
    padding: tokens.spacing.md,
  },
  commentContainer: {
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing.xs,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  username: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  date: {
    fontSize: tokens.typography.fontSize.sm,
  },
  commentText: {
    fontSize: tokens.typography.fontSize.base,
    lineHeight: tokens.typography.lineHeight.normal,
  },
  deleteButton: {
    position: 'absolute',
    top: tokens.spacing.xs,
    right: tokens.spacing.xs,
    padding: tokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.neutral[200],
  },
  input: {
    flex: 1,
    fontSize: tokens.typography.fontSize.base,
    maxHeight: 100,
  },
  submitButton: {
    padding: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.full,
    marginLeft: tokens.spacing.xs,
  },
  emptyText: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
  },
}); 