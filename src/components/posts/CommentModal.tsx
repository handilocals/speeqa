import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
}

export function CommentModal({ visible, onClose, postId }: CommentModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([
          {
            content: newComment,
            post_id: postId,
            user_id: user.id,
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
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, postId]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.neutral[50] }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
            Comments
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={comments}
          renderItem={({ item }) => (
            <View style={[styles.commentContainer, { backgroundColor: theme.colors.neutral[100] }]}>
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

        <View style={[styles.inputContainer, { borderTopColor: theme.colors.neutral[200] }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.neutral[900] }]}
            placeholder="Write a comment..."
            placeholderTextColor={theme.colors.neutral[500]}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            <Ionicons name="send-outline" size={20} color={theme.colors.neutral[50]} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
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
  closeButton: {
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