-- Enable Realtime for messaging tables
-- Requires: Supabase project -> Database -> Replication -> Realtime enabled
-- Run via Supabase SQL Editor or supabase CLI

-- Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime on conversations table
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable Realtime on contact_activity_logs for live activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE contact_activity_logs;

-- Optionally enable the replica identity for full change data capture
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE contact_activity_logs REPLICA IDENTITY FULL;

-- Create a secure function to send a message (bypasses RLS via security definer)
CREATE OR REPLACE FUNCTION send_conversation_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_content_type TEXT DEFAULT 'text'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_conversation RECORD;
BEGIN
  -- Verify conversation exists
  SELECT * INTO v_conversation FROM conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, sender_type, direction, content, content_type, status)
  VALUES (p_conversation_id, p_sender_id, 'staff', 'outbound', p_content, p_content_type, 'sent')
  RETURNING id INTO v_message_id;

  -- Update conversation
  UPDATE conversations SET
    last_message_at = NOW(),
    last_message_preview = LEFT(p_content, 100),
    status = 'active'
  WHERE id = p_conversation_id;

  -- Log activity
  INSERT INTO contact_activity_logs (contact_id, action, description, metadata)
  VALUES (v_conversation.contact_id, 'message_sent', 'Staff sent a message', jsonb_build_object('message_id', v_message_id, 'conversation_id', p_conversation_id));

  RETURN jsonb_build_object('id', v_message_id, 'status', 'sent');
END;
$$;
