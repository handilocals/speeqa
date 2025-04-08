-- Create collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create collection items table for both posts and listings
CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT one_item_type_only CHECK (
        (post_id IS NOT NULL AND listing_id IS NULL) OR
        (listing_id IS NOT NULL AND post_id IS NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_post_id ON collection_items(post_id);
CREATE INDEX idx_collection_items_listing_id ON collection_items(listing_id);

-- Add RLS policies
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to create their own collections
CREATE POLICY "Users can create their own collections"
    ON collections FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to view their own collections and public collections
CREATE POLICY "Users can view their own and public collections"
    ON collections FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR NOT is_private);

-- Policy to allow users to update their own collections
CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own collections
CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy to allow users to add items to their collections
CREATE POLICY "Users can add items to their collections"
    ON collection_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE id = collection_id
            AND user_id = auth.uid()
        )
    );

-- Policy to allow users to view items in their collections and public collections
CREATE POLICY "Users can view items in their collections and public collections"
    ON collection_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE id = collection_id
            AND (user_id = auth.uid() OR NOT is_private)
        )
    );

-- Policy to allow users to remove items from their collections
CREATE POLICY "Users can remove items from their collections"
    ON collection_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE id = collection_id
            AND user_id = auth.uid()
        )
    );