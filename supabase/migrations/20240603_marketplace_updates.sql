-- Add reference_number column to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS reference_number VARCHAR(20) UNIQUE;

-- Add is_bargainable column to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_bargainable BOOLEAN DEFAULT false;

-- Add is_reserved column to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS is_reserved BOOLEAN DEFAULT false;

-- Add reserved_for_user_id column to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS reserved_for_user_id UUID REFERENCES auth.users(id) NULL;

-- Create marketplace_messages table
CREATE TABLE IF NOT EXISTS marketplace_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Add the tables to realtime publication if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'marketplace_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_messages;
  END IF;
END
$$;

-- Create messages table for general conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- Add the messages table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END
$$;

-- Update function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_marketplace_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a reference number with format MKT-XXXXX where X is a random alphanumeric character
  NEW.reference_number := 'MKT-' || 
                         substring(md5(random()::text), 1, 5) || 
                         substring(md5(NEW.id::text), 1, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate reference numbers for new listings
DROP TRIGGER IF EXISTS generate_marketplace_reference_trigger ON marketplace_listings;
CREATE TRIGGER generate_marketplace_reference_trigger
BEFORE INSERT ON marketplace_listings
FOR EACH ROW
WHEN (NEW.reference_number IS NULL)
EXECUTE FUNCTION generate_marketplace_reference();

-- Backfill existing listings with reference numbers if they don't have one
UPDATE marketplace_listings
SET reference_number = 'MKT-' || 
                      substring(md5(random()::text), 1, 5) || 
                      substring(md5(id::text), 1, 5)
WHERE reference_number IS NULL;
