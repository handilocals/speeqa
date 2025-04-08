export type CollectionItemType = 'post' | 'marketplace_listing';

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_id: string;
  item_type: CollectionItemType;
  notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionCollaborator {
  id: string;
  collection_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface CollectionShare {
  id: string;
  collection_id: string;
  shared_by: string;
  shared_with: string;
  permission: 'view' | 'edit';
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface CollectionLike {
  id: string;
  collection_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface CollectionComment {
  id: string;
  collection_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface CollectionTag {
  id: string;
  name: string;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_image_url?: string;
  is_private: boolean;
  view_count: number;
  item_count: number;
  last_updated_at: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  items?: CollectionItem[];
  collaborators?: CollectionCollaborator[];
  shares?: CollectionShare[];
  likes?: CollectionLike[];
  comments?: CollectionComment[];
  tags?: CollectionTag[];
  is_liked?: boolean;
  is_shared?: boolean;
  is_collaborator?: boolean;
  collaborator_role?: 'owner' | 'editor' | 'viewer';
}

export interface CreateCollectionInput {
  name: string;
  description: string;
  is_private?: boolean;
  cover_image_url?: string;
  tags?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  is_private?: boolean;
  cover_image_url?: string;
  tags?: string[];
  order_index?: number;
}

export interface AddCollectionItemInput {
  collection_id: string;
  item_id: string;
  item_type: CollectionItemType;
  notes?: string;
  order_index?: number;
}

export interface UpdateCollectionItemInput {
  notes?: string;
  order_index?: number;
}

export interface AddCollaboratorInput {
  collection_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ShareCollectionInput {
  collection_id: string;
  user_id: string;
  permission: 'view' | 'edit';
} 