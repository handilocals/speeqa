-- Add new columns to collections table
ALTER TABLE collections ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE collections ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create collection_items table
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  item_id UUID NOT NULL,
  item_type VARCHAR(50) NOT NULL, -- 'post', 'marketplace_listing', etc.
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, item_id, item_type)
);

-- Create collection_collaborators table
CREATE TABLE IF NOT EXISTS collection_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, user_id)
);

-- Create collection_shares table
CREATE TABLE IF NOT EXISTS collection_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  shared_with UUID REFERENCES auth.users(id) NOT NULL,
  permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, shared_with)
);

-- Create collection_likes table
CREATE TABLE IF NOT EXISTS collection_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, user_id)
);

-- Create collection_comments table
CREATE TABLE IF NOT EXISTS collection_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_tags table
CREATE TABLE IF NOT EXISTS collection_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_tag_relations table
CREATE TABLE IF NOT EXISTS collection_tag_relations (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES collection_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (collection_id, tag_id)
);

-- Add RLS policies
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_tag_relations ENABLE ROW LEVEL SECURITY;

-- Collection items policies
CREATE POLICY "Users can view collection items they have access to"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      LEFT JOIN collection_collaborators cc ON c.id = cc.collection_id
      LEFT JOIN collection_shares cs ON c.id = cs.collection_id
      WHERE c.id = collection_items.collection_id
      AND (
        c.user_id = auth.uid()
        OR cc.user_id = auth.uid()
        OR cs.shared_with = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert collection items they can edit"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c
      LEFT JOIN collection_collaborators cc ON c.id = cc.collection_id
      WHERE c.id = collection_items.collection_id
      AND (
        c.user_id = auth.uid()
        OR (cc.user_id = auth.uid() AND cc.role IN ('owner', 'editor'))
      )
    )
  );

-- Collection collaborators policies
CREATE POLICY "Users can view collection collaborators"
  ON collection_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE id = collection_collaborators.collection_id
      AND user_id = auth.uid()
    )
  );

-- Add tables to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'collection_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE collection_items;
  END IF;
END
$$;

-- Create function to update collection item count
CREATE OR REPLACE FUNCTION update_collection_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections
    SET item_count = item_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections
    SET item_count = item_count - 1,
        last_updated_at = NOW()
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for item count updates
CREATE TRIGGER collection_item_count_trigger
AFTER INSERT OR DELETE ON collection_items
FOR EACH ROW
EXECUTE FUNCTION update_collection_item_count(); 