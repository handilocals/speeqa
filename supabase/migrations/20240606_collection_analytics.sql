-- Create collection views table for tracking views
CREATE TABLE collection_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(collection_id, user_id)
);

-- Create collection shares table
CREATE TABLE collection_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    can_edit BOOLEAN DEFAULT false,
    UNIQUE(collection_id, shared_with)
);

-- Create indexes for better query performance
CREATE INDEX idx_collection_views_collection_id ON collection_views(collection_id);
CREATE INDEX idx_collection_views_user_id ON collection_views(user_id);
CREATE INDEX idx_collection_shares_collection_id ON collection_shares(collection_id);
CREATE INDEX idx_collection_shares_shared_with ON collection_shares(shared_with);

-- Add RLS policies for collection views
ALTER TABLE collection_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collection views"
    ON collection_views FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create collection views"
    ON collection_views FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for collection shares
ALTER TABLE collection_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their collection shares"
    ON collection_shares FOR SELECT
    TO authenticated
    USING (auth.uid() = shared_with OR auth.uid() = shared_by);

CREATE POLICY "Collection owners can share their collections"
    ON collection_shares FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE id = collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Collection owners can revoke shares"
    ON collection_shares FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE id = collection_id
            AND user_id = auth.uid()
        )
    );

-- Create function to track collection views
CREATE OR REPLACE FUNCTION track_collection_view()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO collection_views (collection_id, user_id)
    VALUES (NEW.collection_id, auth.uid())
    ON CONFLICT (collection_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for collection views
CREATE TRIGGER track_collection_view_trigger
    AFTER INSERT ON collection_items
    FOR EACH ROW
    EXECUTE FUNCTION track_collection_view();

-- Add collection view count to collections table
ALTER TABLE collections
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Create function to update view count
CREATE OR REPLACE FUNCTION update_collection_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE collections
    SET view_count = (
        SELECT COUNT(*)
        FROM collection_views
        WHERE collection_id = NEW.collection_id
    )
    WHERE id = NEW.collection_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for view count updates
CREATE TRIGGER update_collection_view_count_trigger
    AFTER INSERT ON collection_views
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_view_count(); 