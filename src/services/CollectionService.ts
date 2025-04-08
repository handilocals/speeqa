import { supabase } from '../lib/supabase';
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

class CollectionService {
  private static instance: CollectionService;

  private constructor() {}

  public static getInstance(): CollectionService {
    if (!CollectionService.instance) {
      CollectionService.instance = new CollectionService();
    }
    return CollectionService.instance;
  }

  // Collection CRUD operations
  public async createCollection(input: CreateCollectionInput): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .insert([{
        name: input.name,
        description: input.description,
        is_private: input.is_private || false,
        cover_image_url: input.cover_image_url,
      }])
      .select()
      .single();

    if (error) throw error;

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      await this.addTagsToCollection(data.id, input.tags);
    }

    return data;
  }

  public async getCollection(id: string): Promise<Collection> {
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
      .eq('id', id)
      .single();

    if (error) throw error;
    return this.transformCollection(data);
  }

  public async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .update({
        name: input.name,
        description: input.description,
        is_private: input.is_private,
        cover_image_url: input.cover_image_url,
        order_index: input.order_index,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update tags if provided
    if (input.tags) {
      await this.updateCollectionTags(id, input.tags);
    }

    return data;
  }

  public async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Collection items operations
  public async addItemToCollection(input: AddCollectionItemInput): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from('collection_items')
      .insert([{
        collection_id: input.collection_id,
        item_id: input.item_id,
        item_type: input.item_type,
        notes: input.notes,
        order_index: input.order_index,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async updateCollectionItem(id: string, input: UpdateCollectionItemInput): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from('collection_items')
      .update({
        notes: input.notes,
        order_index: input.order_index,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async removeItemFromCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Collaboration operations
  public async addCollaborator(input: AddCollaboratorInput): Promise<CollectionCollaborator> {
    const { data, error } = await supabase
      .from('collection_collaborators')
      .insert([{
        collection_id: input.collection_id,
        user_id: input.user_id,
        role: input.role,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async removeCollaborator(id: string): Promise<void> {
    const { error } = await supabase
      .from('collection_collaborators')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Sharing operations
  public async shareCollection(input: ShareCollectionInput): Promise<CollectionShare> {
    const { data, error } = await supabase
      .from('collection_shares')
      .insert([{
        collection_id: input.collection_id,
        shared_by: (await supabase.auth.getUser()).data.user?.id,
        shared_with: input.user_id,
        permission: input.permission,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async unshareCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('collection_shares')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Like operations
  public async likeCollection(collectionId: string): Promise<CollectionLike> {
    const { data, error } = await supabase
      .from('collection_likes')
      .insert([{
        collection_id: collectionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async unlikeCollection(collectionId: string): Promise<void> {
    const { error } = await supabase
      .from('collection_likes')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  }

  // Comment operations
  public async addComment(collectionId: string, comment: string): Promise<CollectionComment> {
    const { data, error } = await supabase
      .from('collection_comments')
      .insert([{
        collection_id: collectionId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        comment,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async updateComment(id: string, comment: string): Promise<CollectionComment> {
    const { data, error } = await supabase
      .from('collection_comments')
      .update({ comment })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('collection_comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Tag operations
  private async addTagsToCollection(collectionId: string, tagNames: string[]): Promise<void> {
    // First, get or create tags
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const { data } = await supabase
          .from('collection_tags')
          .select()
          .eq('name', name)
          .single();

        if (data) return data;

        const { data: newTag } = await supabase
          .from('collection_tags')
          .insert([{ name }])
          .select()
          .single();

        return newTag;
      })
    );

    // Then, create relations
    await supabase
      .from('collection_tag_relations')
      .insert(
        tags.map((tag) => ({
          collection_id: collectionId,
          tag_id: tag.id,
        }))
      );
  }

  private async updateCollectionTags(collectionId: string, tagNames: string[]): Promise<void> {
    // Delete existing relations
    await supabase
      .from('collection_tag_relations')
      .delete()
      .eq('collection_id', collectionId);

    // Add new tags
    await this.addTagsToCollection(collectionId, tagNames);
  }

  // Helper methods
  private transformCollection(data: any): Collection {
    return {
      ...data,
      items: data.items || [],
      collaborators: data.collaborators || [],
      shares: data.shares || [],
      likes: data.likes || [],
      comments: data.comments || [],
      tags: data.tags?.map((t: any) => t.tag) || [],
      is_liked: data.likes?.some((l: any) => l.user_id === (supabase.auth.getUser()).data.user?.id),
      is_shared: data.shares?.some((s: any) => s.shared_with === (supabase.auth.getUser()).data.user?.id),
      is_collaborator: data.collaborators?.some((c: any) => c.user_id === (supabase.auth.getUser()).data.user?.id),
      collaborator_role: data.collaborators?.find((c: any) => c.user_id === (supabase.auth.getUser()).data.user?.id)?.role,
    };
  }
}

export const collectionService = CollectionService.getInstance(); 