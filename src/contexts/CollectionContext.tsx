import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collectionService } from '../services/CollectionService';
import {
  Collection,
  CollectionItem,
  CollectionCollaborator,
  CollectionShare,
  CollectionLike,
  CollectionComment,
  CollectionTag,
  CreateCollectionInput,
  UpdateCollectionInput,
  AddCollectionItemInput,
  UpdateCollectionItemInput,
  AddCollaboratorInput,
  ShareCollectionInput,
} from '../types/collections';
import { supabase } from '../lib/supabase';

export interface Collection {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  cover_image?: string;
  items?: CollectionItem[];
  collaborators?: CollectionCollaborator[];
  shares?: CollectionShare[];
  likes?: CollectionLike[];
  comments?: CollectionComment[];
  tags?: CollectionTag[];
  is_liked?: boolean;
  is_shared?: boolean;
  is_collaborator?: boolean;
  collaborator_role?: string;
}

interface CollectionContextType {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  selectedCollection: Collection | null;
  fetchCollections: () => Promise<void>;
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  updateCollection: (id: string, input: UpdateCollectionInput) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  selectCollection: (id: string) => Promise<void>;
  addItemToCollection: (input: AddCollectionItemInput) => Promise<CollectionItem>;
  updateCollectionItem: (id: string, input: UpdateCollectionItemInput) => Promise<CollectionItem>;
  removeItemFromCollection: (id: string) => Promise<void>;
  addCollaborator: (input: AddCollaboratorInput) => Promise<CollectionCollaborator>;
  removeCollaborator: (id: string) => Promise<void>;
  shareCollection: (input: ShareCollectionInput) => Promise<CollectionShare>;
  unshareCollection: (id: string) => Promise<void>;
  likeCollection: (collectionId: string) => Promise<CollectionLike>;
  unlikeCollection: (collectionId: string) => Promise<void>;
  addComment: (collectionId: string, comment: string) => Promise<CollectionComment>;
  updateComment: (id: string, comment: string) => Promise<CollectionComment>;
  deleteComment: (id: string) => Promise<void>;
  clearError: () => void;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          user:profiles(id, username, avatar_url),
          items:collection_items(*),
          collaborators:collection_collaborators(*, user:profiles(id, username, avatar_url)),
          shares:collection_shares(*, user:profiles(id, username, avatar_url)),
          likes:collection_likes(*, user:profiles(id, username, avatar_url)),
          comments:collection_comments(*, user:profiles(id, username, avatar_url)),
          tags:collection_tag_relations(tag:collection_tags(*))
        `)
        .or(`user_id.eq.${user.user.id},collection_collaborators.user_id.eq.${user.user.id},collection_shares.shared_with.eq.${user.user.id}`);

      if (error) throw error;

      const transformedCollections = data.map((collection: any) => ({
        ...collection,
        items: collection.items || [],
        collaborators: collection.collaborators || [],
        shares: collection.shares || [],
        likes: collection.likes || [],
        comments: collection.comments || [],
        tags: collection.tags?.map((t: any) => t.tag) || [],
        is_liked: collection.likes?.some((l: any) => l.user_id === user.user.id),
        is_shared: collection.shares?.some((s: any) => s.shared_with === user.user.id),
        is_collaborator: collection.collaborators?.some((c: any) => c.user_id === user.user.id),
        collaborator_role: collection.collaborators?.find((c: any) => c.user_id === user.user.id)?.role,
      }));

      setCollections(transformedCollections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = async (input: CreateCollectionInput): Promise<Collection> => {
    try {
      const collection = await collectionService.createCollection(input);
      await fetchCollections();
      return collection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      throw err;
    }
  };

  const updateCollection = async (id: string, input: UpdateCollectionInput): Promise<Collection> => {
    try {
      const collection = await collectionService.updateCollection(id, input);
      await fetchCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(collection);
      }
      return collection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
      throw err;
    }
  };

  const deleteCollection = async (id: string): Promise<void> => {
    try {
      await collectionService.deleteCollection(id);
      await fetchCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
      throw err;
    }
  };

  const selectCollection = async (id: string): Promise<void> => {
    try {
      const collection = await collectionService.getCollection(id);
      setSelectedCollection(collection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection');
      throw err;
    }
  };

  const addItemToCollection = async (input: AddCollectionItemInput): Promise<CollectionItem> => {
    try {
      const item = await collectionService.addItemToCollection(input);
      await fetchCollections();
      if (selectedCollection?.id === input.collection_id) {
        await selectCollection(input.collection_id);
      }
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to collection');
      throw err;
    }
  };

  const updateCollectionItem = async (id: string, input: UpdateCollectionItemInput): Promise<CollectionItem> => {
    try {
      const item = await collectionService.updateCollectionItem(id, input);
      await fetchCollections();
      if (selectedCollection?.id === item.collection_id) {
        await selectCollection(item.collection_id);
      }
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection item');
      throw err;
    }
  };

  const removeItemFromCollection = async (id: string): Promise<void> => {
    try {
      await collectionService.removeItemFromCollection(id);
      await fetchCollections();
      if (selectedCollection) {
        await selectCollection(selectedCollection.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from collection');
      throw err;
    }
  };

  const addCollaborator = async (input: AddCollaboratorInput): Promise<CollectionCollaborator> => {
    try {
      const collaborator = await collectionService.addCollaborator(input);
      await fetchCollections();
      if (selectedCollection?.id === input.collection_id) {
        await selectCollection(input.collection_id);
      }
      return collaborator;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add collaborator');
      throw err;
    }
  };

  const removeCollaborator = async (id: string): Promise<void> => {
    try {
      await collectionService.removeCollaborator(id);
      await fetchCollections();
      if (selectedCollection) {
        await selectCollection(selectedCollection.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator');
      throw err;
    }
  };

  const shareCollection = async (input: ShareCollectionInput): Promise<CollectionShare> => {
    try {
      const share = await collectionService.shareCollection(input);
      await fetchCollections();
      if (selectedCollection?.id === input.collection_id) {
        await selectCollection(input.collection_id);
      }
      return share;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share collection');
      throw err;
    }
  };

  const unshareCollection = async (id: string): Promise<void> => {
    try {
      await collectionService.unshareCollection(id);
      await fetchCollections();
      if (selectedCollection) {
        await selectCollection(selectedCollection.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unshare collection');
      throw err;
    }
  };

  const likeCollection = async (collectionId: string): Promise<CollectionLike> => {
    try {
      const like = await collectionService.likeCollection(collectionId);
      await fetchCollections();
      if (selectedCollection?.id === collectionId) {
        await selectCollection(collectionId);
      }
      return like;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like collection');
      throw err;
    }
  };

  const unlikeCollection = async (collectionId: string): Promise<void> => {
    try {
      await collectionService.unlikeCollection(collectionId);
      await fetchCollections();
      if (selectedCollection?.id === collectionId) {
        await selectCollection(collectionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlike collection');
      throw err;
    }
  };

  const addComment = async (collectionId: string, comment: string): Promise<CollectionComment> => {
    try {
      const newComment = await collectionService.addComment(collectionId, comment);
      await fetchCollections();
      if (selectedCollection?.id === collectionId) {
        await selectCollection(collectionId);
      }
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  };

  const updateComment = async (id: string, comment: string): Promise<CollectionComment> => {
    try {
      const updatedComment = await collectionService.updateComment(id, comment);
      await fetchCollections();
      if (selectedCollection) {
        await selectCollection(selectedCollection.id);
      }
      return updatedComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    }
  };

  const deleteComment = async (id: string): Promise<void> => {
    try {
      await collectionService.deleteComment(id);
      await fetchCollections();
      if (selectedCollection) {
        await selectCollection(selectedCollection.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  const clearError = () => setError(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const value = {
    collections,
    loading,
    error,
    selectedCollection,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    selectCollection,
    addItemToCollection,
    updateCollectionItem,
    removeItemFromCollection,
    addCollaborator,
    removeCollaborator,
    shareCollection,
    unshareCollection,
    likeCollection,
    unlikeCollection,
    addComment,
    updateComment,
    deleteComment,
    clearError,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};