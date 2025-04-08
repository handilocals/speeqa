export interface PoliticalParty {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  founded_year: number;
  ideology: string[];
  average_rating: number;
  total_ratings: number;
  politician_count: number;
  rating_distribution: number[];
  current_leader?: string;
  website?: string;
  social_media?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface PartyMember {
  id: string;
  party_id: string;
  politician_id: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
}

export interface PartyAchievement {
  id: string;
  party_id: string;
  title: string;
  description: string;
  date: string;
  category: string;
} 