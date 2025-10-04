-- Create note_chat_messages table for real-time collaboration chat
CREATE TABLE note_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_chat_messages_note_id ON note_chat_messages(note_id);
CREATE INDEX idx_chat_messages_created_at ON note_chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE note_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chat messages
-- Users can view chat messages for notes they have access to
CREATE POLICY "Users can view chat for their notes" ON note_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
      UNION
      SELECT note_id FROM note_collaborators WHERE user_id = auth.uid()
    )
  );

-- Users can insert chat messages for notes they have access to
CREATE POLICY "Users can send chat for their notes" ON note_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    note_id IN (
      SELECT id FROM notes WHERE user_id = auth.uid()
      UNION
      SELECT note_id FROM note_collaborators WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can delete their own chat messages
CREATE POLICY "Users can delete their own messages" ON note_chat_messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_note_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_note_chat_messages_updated_at
  BEFORE UPDATE ON note_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_note_chat_messages_updated_at();
