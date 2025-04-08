-- Add media support to messages
ALTER TABLE messages ADD COLUMN media_url TEXT;
ALTER TABLE messages ADD COLUMN media_type TEXT;
ALTER TABLE messages ADD COLUMN media_thumbnail TEXT;

-- Add media support to marketplace_messages
ALTER TABLE marketplace_messages ADD COLUMN media_url TEXT;
ALTER TABLE marketplace_messages ADD COLUMN media_type TEXT;
ALTER TABLE marketplace_messages ADD COLUMN media_thumbnail TEXT;

-- Create message notifications table
CREATE TABLE message_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID,
    message_type TEXT CHECK (message_type IN ('general', 'marketplace')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX idx_message_notifications_message_id ON message_notifications(message_id);
CREATE INDEX idx_message_notifications_is_read ON message_notifications(is_read);

-- Add RLS policies for message_notifications
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON message_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON message_notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Add message_notifications to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE message_notifications;

-- Create function to handle message notifications
CREATE OR REPLACE FUNCTION handle_message_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert notification for receiver
    INSERT INTO message_notifications (user_id, message_id, message_type)
    VALUES (
        NEW.receiver_id,
        NEW.id,
        CASE 
            WHEN TG_TABLE_NAME = 'messages' THEN 'general'
            ELSE 'marketplace'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for message notifications
CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_notification();

CREATE TRIGGER on_marketplace_message_insert
    AFTER INSERT ON marketplace_messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_message_notification(); 