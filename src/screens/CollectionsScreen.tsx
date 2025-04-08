import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCollections } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Collection } from '../contexts/CollectionContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { LoadingIndicator } from '../components/common/LoadingIndicator';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import { tokens } from '../theme/tokens';

type CollectionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Collections'>;

export function CollectionsScreen() {
  const { theme } = useTheme();
  const { collections, createCollection, deleteCollection } = useCollections();
  const { user } = useAuth();
  const navigation = useNavigation<CollectionsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCollection = async (name: string, description: string, isPrivate: boolean) => {
    try {
      await createCollection({ name, description, is_private: isPrivate });
      setShowCreateModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
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
              await deleteCollection(collection.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete collection');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <Text style={[styles.errorText, { color: theme.colors.neutral[900] }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.neutral[50] }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
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
          My Collections
        </Text>
        <View style={{ width: 24 }} /> {/* Placeholder for layout balance */}
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.neutral[100] }]}>
        <Ionicons name="search-outline" size={20} color={theme.colors.neutral[500]} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.neutral[900] }]}
          placeholder="Search collections..."
          placeholderTextColor={theme.colors.neutral[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCollections}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.collectionItem, { backgroundColor: theme.colors.neutral[100] }]}
            onPress={() => navigation.navigate('CollectionDetails', { collection: item })}
          >
            <View style={styles.collectionInfo}>
              <Text style={[styles.collectionName, { color: theme.colors.neutral[900] }]}>
                {item.name}
              </Text>
              <Text style={[styles.collectionDescription, { color: theme.colors.neutral[500] }]}>
                {item.description}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteCollection(item)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.error[500]} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            No collections found
          </Text>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary[500] }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color={theme.colors.neutral[50]} />
      </TouchableOpacity>

      <CreateCollectionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(name, description) => handleCreateCollection(name, description, false)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
  },
  backButton: {
    padding: tokens.spacing.sm,
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.full,
  },
  searchInput: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.base,
  },
  list: {
    padding: tokens.spacing.md,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.lg,
    marginBottom: tokens.spacing.sm,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    marginBottom: tokens.spacing.xs,
  },
  collectionDescription: {
    fontSize: tokens.typography.fontSize.sm,
  },
  deleteButton: {
    padding: tokens.spacing.sm,
  },
  errorText: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginBottom: tokens.spacing.md,
  },
  retryButton: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  emptyText: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: tokens.spacing.lg,
    bottom: tokens.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});