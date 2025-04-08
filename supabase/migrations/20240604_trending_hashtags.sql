-- Create hashtags table to track trending topics
CREATE TABLE IF NOT EXISTS hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS hashtags_name_idx ON hashtags(name);
CREATE INDEX IF NOT EXISTS hashtags_post_count_idx ON hashtags(post_count DESC);

-- Enable row level security
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Public hashtags read access";
CREATE POLICY "Public hashtags read access"
ON hashtags FOR SELECT
USING (true);

-- Create policy for authenticated users to insert
DROP POLICY IF EXISTS "Auth users can insert hashtags";
CREATE POLICY "Auth users can insert hashtags"
ON hashtags FOR INSERT
TO authenticated
USING (true);

-- Create policy for authenticated users to update post_count
DROP POLICY IF EXISTS "Auth users can update hashtags";
CREATE POLICY "Auth users can update hashtags"
ON hashtags FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Add realtime support
alter publication supabase_realtime add table hashtags;

-- Create function to extract and update hashtags from post content
CREATE OR REPLACE FUNCTION update_hashtags()
RETURNS TRIGGER AS $$
DECLARE
  hashtag TEXT;
  hashtags TEXT[];
BEGIN
  -- Extract hashtags from content (simple regex for hashtags)
  hashtags := ARRAY(
    SELECT DISTINCT substring(word from 2)
    FROM regexp_matches(NEW.content, '#([a-zA-Z0-9_]+)', 'g') AS match(word)
  );
  
  -- For each hashtag, insert or update the hashtags table
  FOREACH hashtag IN ARRAY hashtags
  LOOP
    INSERT INTO hashtags (name, post_count)
    VALUES (hashtag, 1)
    ON CONFLICT (name)
    DO UPDATE SET 
      post_count = hashtags.post_count + 1,
      updated_at = NOW();
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on posts table to update hashtags
DROP TRIGGER IF EXISTS update_hashtags_trigger ON posts;
CREATE TRIGGER update_hashtags_trigger
AFTER INSERT OR UPDATE OF content ON posts
FOR EACH ROW
EXECUTE FUNCTION update_hashtags();
