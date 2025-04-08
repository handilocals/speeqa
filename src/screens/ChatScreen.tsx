import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Message } from '../types/messages';

interface ChatScreenProps {
  route: {
    params: {
      userId: string;
      username: string;
      listingId?: string;
      type: 'general' | 'marketplace';
    };
  };
}

export function ChatScreen({ route }: ChatScreenProps) {
  const { userId, username, listingId, type } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    
    // Load messages
    loadMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(type === 'general' ? 'messages' : 'marketplace_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: type === 'general' ? 'messages' : 'marketplace_messages',
          filter: `(sender_id=eq.${user.id} AND receiver_id=eq.${userId}) OR (sender_id=eq.${userId} AND receiver_id=eq.${user.id})`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, userId, type, listingId]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build the query based on message type
      let query;
      if (type === 'general') {
        query = supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            message,
            created_at,
            is_read,
            sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
            receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
      } else {
        query = supabase
          .from('marketplace_messages')
          .select(`
            id,
            listing_id,
            sender_id,
            receiver_id,
            message,
            created_at,
            is_read,
            listing:marketplace_listings(id, title, image_url),
            sender:profiles!marketplace_messages_sender_id_fkey(id, username, avatar_url),
            receiver:profiles!marketplace_messages_receiver_id_fkey(id, username, avatar_url)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (listingId) {
          query = query.eq('listing_id', listingId);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      // Map to Message type
      const formattedMessages = data.map((msg: any): Message => ({
        id: msg.id,
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.message,
        created_at: msg.created_at,
        is_read: msg.is_read,
        listing_id: msg.listing_id,
        sender: msg.sender,
        receiver: msg.receiver,
        listing: msg.listing,
      }));

      setMessages(formattedMessages);

      // Mark unread messages as read
      const unreadMessages = formattedMessages
        .filter(msg => !msg.is_read && msg.receiver_id === user.id)
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from(type === 'general' ? 'messages' : 'marketplace_messages')
          .update({ is_read: true })
          .in('id', unreadMessages);

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        receiver_id: userId,
        message: newMessage.trim(),
        is_read: false,
      };

      // Add listing_id for marketplace messages
      if (type === 'marketplace' && listingId) {
        messageData.listing_id = listingId;
      }

      const { error } = await supabase
        .from(type === 'general' ? 'messages' : 'marketplace_messages')
        .insert([messageData]);

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      setNewMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer,
      ]}>
        {!isUserMessage && (
          <Image 
            source={{ uri: item.sender.avatar_url || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUserMessage 
              ? theme.colors.primary[500] 
              : theme.colors.neutral[200],
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUserMessage ? theme.colors.neutral[50] : theme.colors.neutral[900] }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isUserMessage ? theme.colors.neutral[100] : theme.colors.neutral[600] }
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUserMessage && (
          <View style={styles.readStatus}>
            {item.is_read ? (
              <Ionicons name="checkmark-done" size={16} color={theme.colors.primary[500]} />
            ) : (
              <Ionicons name="checkmark" size={16} color={theme.colors.neutral[400]} />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.neutral[100] }]}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.neutral[50],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[300]
            }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.neutral[500]}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.neutral[50]} />
            ) : (
              <Ionicons name="send" size={20} color={theme.colors.neutral[50]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  readStatus: {
    alignSelf: 'flex-end',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 