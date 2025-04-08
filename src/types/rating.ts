export interface Rating {
  id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface PoliticianRating extends Rating {
  politician_id: string;
}

export interface PartyRating extends Rating {
  party_id: string;
}

export interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: number]: number;
  };
  recent_trend: number;
}

export interface RatingHistory {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  entity_type: 'politician' | 'party';
  entity_id: string;
  entity_name: string;
} 