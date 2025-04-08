export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  listing_id?: string;
  reactions?: string[];
  media_url?: string;
  media_type?: string;
  media_thumbnail?: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
  receiver: {
    id: string;
    username: string;
    avatar_url: string;
  };
  listing?: {
    id: string;
    title: string;
    image_url: string;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
    avatar_url: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  listing?: {
    id: string;
    title: string;
    image_url: string;
  };
  type: 'general' | 'marketplace';
}

export interface Follower {
  id: string;
  username: string;
  avatar_url: string;
}

export interface FollowerResponse {
  follower: Follower;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface MessageNotification {
  id: string;
  user_id: string;
  message_id: string;
  message_type: 'general' | 'marketplace';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  message?: Message;
} 