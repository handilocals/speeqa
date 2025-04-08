import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Conversation } from '../../types/messages';
import { Ionicons } from '@expo/vector-icons';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const { theme } = useTheme();

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));

      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString();
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return '';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}
      onPress={onPress}
    >
      <Image
        source={{ uri: conversation.otherUser.avatar_url || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
            {conversation.otherUser.username}
          </Text>
          {conversation.lastMessage && (
            <Text style={[styles.timestamp, { color: theme.colors.neutral[500] }]}>
              {formatTimestamp(conversation.lastMessage.created_at)}
            </Text>
          )}
        </View>
        <View style={styles.messageContainer}>
          {conversation.listing && (
            <View style={styles.listingContainer}>
              <Ionicons 
                name="cart" 
                size={16} 
                color={theme.colors.primary[500]} 
                style={styles.listingIcon}
              />
              <Text 
                style={[styles.listingTitle, { color: theme.colors.primary[500] }]}
                numberOfLines={1}
              >
                {conversation.listing.title}
              </Text>
            </View>
          )}
          {conversation.lastMessage && (
            <Text 
              style={[
                styles.message,
                { 
                  color: conversation.unreadCount > 0 
                    ? theme.colors.neutral[900] 
                    : theme.colors.neutral[500]
                }
              ]}
              numberOfLines={2}
            >
              {conversation.lastMessage.content}
            </Text>
          )}
        </View>
      </View>
      {conversation.unreadCount > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary[500] }]}>
          <Text style={[styles.unreadCount, { color: theme.colors.neutral[50] }]}>
            {conversation.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  messageContainer: {
    flex: 1,
  },
  listingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingIcon: {
    marginRight: 4,
  },
  listingTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 