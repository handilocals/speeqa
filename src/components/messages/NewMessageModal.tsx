import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Follower } from '../../types/messages';
import { useTheme } from '../../contexts/ThemeContext';

interface NewMessageModalProps {
  visible: boolean;
  onClose: () => void;
  users: Follower[];
  loading: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
  onSelectUser: (userId: string) => void;
}

export function NewMessageModal({
  visible,
  onClose,
  users,
  loading,
  searchQuery,
  onSearch,
  onSelectUser,
}: NewMessageModalProps) {
  const { theme } = useTheme();

  const renderUser = ({ item }: { item: Follower }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: theme.colors.neutral[50] }]}
      onPress={() => onSelectUser(item.id)}
    >
      <Image
        source={{ uri: item.avatar_url || 'https://via.placeholder.com/40' }}
        style={styles.avatar}
      />
      <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.neutral[50] }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
            New Message
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.neutral[900]} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[200]
            }]}
            placeholder="Search mutual followers..."
            placeholderTextColor={theme.colors.neutral[500]}
            value={searchQuery}
            onChangeText={onSearch}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="people" 
              size={48} 
              color={theme.colors.neutral[300]} 
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
              {searchQuery
                ? 'No mutual followers found'
                : 'No mutual followers yet. Follow users to start conversations.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 