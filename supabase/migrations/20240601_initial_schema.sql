-- Create custom functions for incrementing and decrementing counters
CREATE OR REPLACE FUNCTION increment(x integer) RETURNS integer AS $$
  BEGIN
    RETURN x + 1;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(x integer) RETURNS integer AS $$
  BEGIN
    RETURN GREATEST(0, x - 1);
  END;
$$ LANGUAGE plpgsql;

-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for microblogging
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post interactions tables
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_reposts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create marketplace tables
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES marketplace_categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_saved_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

-- Create user relationships tables
CREATE TABLE IF NOT EXISTS user_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Enable realtime for all tables
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table post_likes;
alter publication supabase_realtime add table post_dislikes;
alter publication supabase_realtime add table post_comments;
alter publication supabase_realtime add table post_reposts;
alter publication supabase_realtime add table post_bookmarks;
alter publication supabase_realtime add table marketplace_categories;
alter publication supabase_realtime add table marketplace_listings;
alter publication supabase_realtime add table marketplace_listing_images;
alter publication supabase_realtime add table marketplace_saved_listings;
alter publication supabase_realtime add table user_followers;

-- Create triggers to update user profile on auth.users changes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || split_part(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_dislikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reposts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" 
ON posts FOR DELETE 
USING (auth.uid() = user_id);

-- Post interactions policies
-- Likes
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON post_likes;
CREATE POLICY "Post likes are viewable by everyone" 
ON post_likes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own likes" ON post_likes;
CREATE POLICY "Users can insert their own likes" 
ON post_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON post_likes;
CREATE POLICY "Users can delete their own likes" 
ON post_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Dislikes
DROP POLICY IF EXISTS "Post dislikes are viewable by everyone" ON post_dislikes;
CREATE POLICY "Post dislikes are viewable by everyone" 
ON post_dislikes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own dislikes" ON post_dislikes;
CREATE POLICY "Users can insert their own dislikes" 
ON post_dislikes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own dislikes" ON post_dislikes;
CREATE POLICY "Users can delete their own dislikes" 
ON post_dislikes FOR DELETE 
USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Post comments are viewable by everyone" ON post_comments;
CREATE POLICY "Post comments are viewable by everyone" 
ON post_comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON post_comments;
CREATE POLICY "Users can insert their own comments" 
ON post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" 
ON post_comments FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" 
ON post_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Reposts
DROP POLICY IF EXISTS "Post reposts are viewable by everyone" ON post_reposts;
CREATE POLICY "Post reposts are viewable by everyone" 
ON post_reposts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own reposts" ON post_reposts;
CREATE POLICY "Users can insert their own reposts" 
ON post_reposts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reposts" ON post_reposts;
CREATE POLICY "Users can delete their own reposts" 
ON post_reposts FOR DELETE 
USING (auth.uid() = user_id);

-- Bookmarks
DROP POLICY IF EXISTS "Post bookmarks are viewable by the owner" ON post_bookmarks;
CREATE POLICY "Post bookmarks are viewable by the owner" 
ON post_bookmarks FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON post_bookmarks;
CREATE POLICY "Users can insert their own bookmarks" 
ON post_bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON post_bookmarks;
CREATE POLICY "Users can delete their own bookmarks" 
ON post_bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Marketplace policies
-- Categories
DROP POLICY IF EXISTS "Marketplace categories are viewable by everyone" ON marketplace_categories;
CREATE POLICY "Marketplace categories are viewable by everyone" 
ON marketplace_categories FOR SELECT 
USING (true);

-- Listings
DROP POLICY IF EXISTS "Marketplace listings are viewable by everyone" ON marketplace_listings;
CREATE POLICY "Marketplace listings are viewable by everyone" 
ON marketplace_listings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own listings" ON marketplace_listings;
CREATE POLICY "Users can insert their own listings" 
ON marketplace_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own listings" ON marketplace_listings;
CREATE POLICY "Users can update their own listings" 
ON marketplace_listings FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own listings" ON marketplace_listings;
CREATE POLICY "Users can delete their own listings" 
ON marketplace_listings FOR DELETE 
USING (auth.uid() = user_id);

-- Listing images
DROP POLICY IF EXISTS "Listing images are viewable by everyone" ON marketplace_listing_images;
CREATE POLICY "Listing images are viewable by everyone" 
ON marketplace_listing_images FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert images for their own listings" ON marketplace_listing_images;
CREATE POLICY "Users can insert images for their own listings" 
ON marketplace_listing_images FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE id = marketplace_listing_images.listing_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete images for their own listings" ON marketplace_listing_images;
CREATE POLICY "Users can delete images for their own listings" 
ON marketplace_listing_images FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE id = marketplace_listing_images.listing_id AND user_id = auth.uid()
  )
);

-- Saved listings
DROP POLICY IF EXISTS "Saved listings are viewable by the owner" ON marketplace_saved_listings;
CREATE POLICY "Saved listings are viewable by the owner" 
ON marketplace_saved_listings FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved listings" ON marketplace_saved_listings;
CREATE POLICY "Users can insert their own saved listings" 
ON marketplace_saved_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved listings" ON marketplace_saved_listings;
CREATE POLICY "Users can delete their own saved listings" 
ON marketplace_saved_listings FOR DELETE 
USING (auth.uid() = user_id);

-- User followers
DROP POLICY IF EXISTS "User followers are viewable by everyone" ON user_followers;
CREATE POLICY "User followers are viewable by everyone" 
ON user_followers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON user_followers;
CREATE POLICY "Users can follow others" 
ON user_followers FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON user_followers;
CREATE POLICY "Users can unfollow others" 
ON user_followers FOR DELETE 
USING (auth.uid() = follower_id);

-- Insert some initial marketplace categories
INSERT INTO marketplace_categories (name, description)
VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Home & Garden', 'Items for home and garden'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Toys & Games', 'Toys, games, and entertainment items'),
('Vehicles', 'Cars, motorcycles, and other vehicles'),
('Services', 'Professional and personal services')
ON CONFLICT (name) DO NOTHING;
