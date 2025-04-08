import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { MessageReaction } from '../../types/messages';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageReactionsProps {
  messageId: string;
  onReactionSelect?: (reaction: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  onReactionSelect,
}) => {
  const { theme } = useTheme();
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReaction = async (reaction: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_message_reactions')
        .upsert({
          message_id: messageId,
          reaction,
        });

      if (error) throw error;
      loadReactions();
      onReactionSelect?.(reaction);
      setShowReactions(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const getReactionCount = (reaction: string) => {
    return reactions.filter(r => r.reaction === reaction).length;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.reactionButton, { backgroundColor: theme.surface }]}
        onPress={() => setShowReactions(true)}
      >
        <Ionicons name="happy-outline" size={20} color={theme.text} />
      </TouchableOpacity>

      <View style={styles.reactionsList}>
        {REACTIONS.map(reaction => {
          const count = getReactionCount(reaction);
          if (count === 0) return null;
          
          return (
            <TouchableOpacity
              key={reaction}
              style={[styles.reactionItem, { backgroundColor: theme.surface }]}
              onPress={() => handleReaction(reaction)}
            >
              <Text style={styles.reactionText}>{reaction}</Text>
              {count > 0 && (
                <Text style={[styles.reactionCount, { color: theme.text }]}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactions(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background + '80' }]}>
          <View style={[styles.reactionsModal, { backgroundColor: theme.surface }]}>
            {REACTIONS.map(reaction => (
              <TouchableOpacity
                key={reaction}
                style={styles.reactionOption}
                onPress={() => handleReaction(reaction)}
              >
                <Text style={styles.reactionText}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  reactionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  reactionText: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionsModal: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reactionOption: {
    padding: 8,
    marginHorizontal: 4,
  },
});

export default MessageReactions; 