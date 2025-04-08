import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Icon } from '../components/common/Icon';
import { ICONS } from '../constants/icons';
import { tokens } from '../theme/tokens';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Conversation, Follower, FollowerResponse, Message } from '../types/messages';
import ConversationItem from '../components/messages/ConversationItem';
import { NewMessageModal } from '../components/messages/NewMessageModal';

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function MessagesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation<MessagesScreenNavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'general' | 'marketplace'>('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [users, setUsers] = useState<Follower[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');

  useEffect(() => {
    loadConversations();
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    const marketplaceSubscription = supabase
      .channel('marketplace_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      marketplaceSubscription.unsubscribe();
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Fetch both general and marketplace messages
      const [generalMessages, marketplaceMessages] = await Promise.all([
        supabase
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
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false }),

        supabase
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
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
      ]);

      if (generalMessages.error) {
        console.error('Error loading general messages:', generalMessages.error);
        throw generalMessages.error;
      }
      if (marketplaceMessages.error) {
        console.error('Error loading marketplace messages:', marketplaceMessages.error);
        throw marketplaceMessages.error;
      }

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();

      // Process general messages
      generalMessages.data.forEach((message: any) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
        const conversationKey = `${otherUserId}-general`;
        
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUser,
            lastMessage: {
              id: message.id,
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              content: message.message,
              created_at: message.created_at,
              is_read: message.is_read,
              sender: message.sender,
              receiver: message.receiver
            },
            unreadCount: message.receiver_id === user.id && !message.is_read ? 1 : 0,
            type: 'general'
          });
        } else {
          const existing = conversationMap.get(conversationKey)!;
          if (!existing.lastMessage || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = {
              id: message.id,
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              content: message.message,
              created_at: message.created_at,
              is_read: message.is_read,
              sender: message.sender,
              receiver: message.receiver
            };
            if (message.receiver_id === user.id && !message.is_read) {
              existing.unreadCount++;
            }
          }
        }
      });

      // Process marketplace messages
      marketplaceMessages.data.forEach((message: any) => {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser = message.sender_id === user.id ? message.receiver : message.sender;
        const conversationKey = `${otherUserId}-${message.listing?.id || 'marketplace'}`;
        
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUser,
            lastMessage: {
              id: message.id,
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              content: message.message,
              created_at: message.created_at,
              is_read: message.is_read,
              sender: message.sender,
              receiver: message.receiver,
              listing: message.listing
            },
            unreadCount: message.receiver_id === user.id && !message.is_read ? 1 : 0,
            listing: message.listing,
            type: 'marketplace'
          });
        } else {
          const existing = conversationMap.get(conversationKey)!;
          if (!existing.lastMessage || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = {
              id: message.id,
              sender_id: message.sender_id,
              receiver_id: message.receiver_id,
              content: message.message,
              created_at: message.created_at,
              is_read: message.is_read,
              sender: message.sender,
              receiver: message.receiver,
              listing: message.listing
            };
            if (message.receiver_id === user.id && !message.is_read) {
              existing.unreadCount++;
            }
          }
        }
      });

      const conversations = Array.from(conversationMap.values());
      setConversations(conversations);
      filterConversations(conversations, searchQuery, activeFilter);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Error loading conversations. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterConversations = (conversations: Conversation[], query: string, filter: 'all' | 'general' | 'marketplace') => {
    let filtered = conversations;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(conv => conv.type === filter);
    }

    // Apply search query
    if (query) {
      filtered = filtered.filter(conv =>
        conv.otherUser.username.toLowerCase().includes(query.toLowerCase()) ||
        conv.lastMessage?.content.toLowerCase().includes(query.toLowerCase()) ||
        conv.listing?.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleNewMessage = (userId: string) => {
    setShowNewMessageModal(false);
    navigation.navigate('Chat', { 
      userId,
      username: users.find(u => u.id === userId)?.username || ''
    });
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('Chat', { 
      userId: conversation.otherUser.id,
      username: conversation.otherUser.username,
      listingId: conversation.listing?.id,
      type: conversation.type
    });
  };

  const loadFollowers = async () => {
    try {
      setLoadingFollowers(true);
      setError(null);

      // Get users who follow the current user
      const { data: followers, error: followersError } = await supabase
        .from('followers')
        .select(`
          follower:profiles!followers_follower_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('following_id', user?.id);

      if (followersError) throw followersError;

      // Get users the current user follows
      const { data: following, error: followingError } = await supabase
        .from('followers')
        .select(`
          following:profiles!followers_following_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq('follower_id', user?.id);

      if (followingError) throw followingError;

      // Find mutual followers
      const followerIds = new Set(followers.map(f => f.follower.id));
      const mutualFollowers = following
        .filter(f => followerIds.has(f.following.id))
        .map(f => ({
          id: f.following.id,
          username: f.following.username,
          avatar_url: f.following.avatar_url
        }));

      setUsers(mutualFollowers);
    } catch (error) {
      setError('Error loading followers');
      console.error('Error loading followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const searchForUsers = (query: string) => {
    try {
      if (query.length < 2) {
        setUsers(users);
        return;
      }

      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setUsers(filtered);
    } catch (err) {
      setError('Error searching users');
      console.error('Error searching users:', err);
    }
  };

  const startNewConversation = async (otherUserId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user?.id,
            receiver_id: otherUserId,
            message: '👋',
            is_read: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setShowNewMessageModal(false);
      setSearchUsers('');
      loadConversations();
      
      navigation.navigate('Chat', {
        userId: otherUserId,
        username: users.find(u => u.id === otherUserId)?.username || '',
        type: 'general'
      });
    } catch (error) {
      setError('Error starting conversation');
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
          Messages
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Icon
            name={ICONS.notifications}
            size={24}
            color={theme.colors.neutral[900]}
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.neutral[100],
            color: theme.colors.neutral[900],
            borderColor: theme.colors.neutral[200]
          }]}
          placeholder="Search conversations..."
          placeholderTextColor={theme.colors.neutral[500]}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterConversations(conversations, text, activeFilter);
          }}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && { backgroundColor: theme.colors.primary[100] }
          ]}
          onPress={() => {
            setActiveFilter('all');
            filterConversations(conversations, searchQuery, 'all');
          }}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'all' ? theme.colors.primary[500] : theme.colors.neutral[500] }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'general' && { backgroundColor: theme.colors.primary[100] }
          ]}
          onPress={() => {
            setActiveFilter('general');
            filterConversations(conversations, searchQuery, 'general');
          }}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'general' ? theme.colors.primary[500] : theme.colors.neutral[500] }
          ]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'marketplace' && { backgroundColor: theme.colors.primary[100] }
          ]}
          onPress={() => {
            setActiveFilter('marketplace');
            filterConversations(conversations, searchQuery, 'marketplace');
          }}
        >
          <Text style={[
            styles.filterText,
            { color: activeFilter === 'marketplace' ? theme.colors.primary[500] : theme.colors.neutral[500] }
          ]}>
            Marketplace
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={loadConversations}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.neutral[50] }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            {activeFilter === 'all' ? 'No conversations yet' :
             activeFilter === 'general' ? 'No general messages yet' :
             'No marketplace messages yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => handleConversationPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <NewMessageModal
        visible={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        users={users}
        loading={loadingFollowers}
        searchQuery={searchUsers}
        onSearch={searchForUsers}
        onSelectUser={startNewConversation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});