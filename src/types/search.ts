export interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
  images: {
    id: string;
    url: string;
  }[];
  location: {
    city: string;
    state: string;
  };
  is_reserved: boolean;
  is_bargainable: boolean;
} 