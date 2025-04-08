-- Add location field to marketplace_listings table
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS location JSONB DEFAULT '{"state": "", "city": "", "locality": "", "zipcode": ""}';  

-- Create index for faster queries on location data
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location ON marketplace_listings USING gin (location);

-- Add display_order field to marketplace_listing_images table
ALTER TABLE marketplace_listing_images ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for ordering images
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images_order ON marketplace_listing_images (listing_id, display_order);

-- Update the marketplace_listings table to add a full-text search vector
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_marketplace_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.location->>'state', '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.location->>'city', '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.location->>'locality', '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.location->>'zipcode', '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector
DROP TRIGGER IF EXISTS trigger_update_marketplace_listing_search_vector ON marketplace_listings;
CREATE TRIGGER trigger_update_marketplace_listing_search_vector
BEFORE INSERT OR UPDATE ON marketplace_listings
FOR EACH ROW EXECUTE FUNCTION update_marketplace_listing_search_vector();

-- Create an index on the search vector
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_search ON marketplace_listings USING gin(search_vector);

-- Update existing records to populate the search vector
UPDATE marketplace_listings SET search_vector = 
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(location->>'state', '')), 'C') ||
  setweight(to_tsvector('english', coalesce(location->>'city', '')), 'C') ||
  setweight(to_tsvector('english', coalesce(location->>'locality', '')), 'C') ||
  setweight(to_tsvector('english', coalesce(location->>'zipcode', '')), 'C');

-- Add realtime for marketplace_listings (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'marketplace_listings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_listings';
  END IF;
END
$$;

-- Add realtime for marketplace_listing_images (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'marketplace_listing_images'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_listing_images';
  END IF;
END
$$;