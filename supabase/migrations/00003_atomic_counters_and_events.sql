-- =============================================================
-- Atomic counter function and message_events enhancements
-- =============================================================

-- Add whatsapp_message_id column to message_events to support external IDs
ALTER TABLE IF EXISTS message_events ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;
CREATE INDEX IF NOT EXISTS idx_message_events_whatsapp_id ON message_events (whatsapp_message_id);

-- Prevent duplicate event insertion for same whatsapp_message_id and event_type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_message_event_whatsapp_event') THEN
    CREATE UNIQUE INDEX uniq_message_event_whatsapp_event ON message_events (whatsapp_message_id, event_type);
  END IF;
END$$;

-- Create an atomic increment function to safely update campaign counters
CREATE OR REPLACE FUNCTION increment_campaign_counters(
  p_campaign_id UUID,
  p_sent INTEGER DEFAULT 0,
  p_delivered INTEGER DEFAULT 0,
  p_read INTEGER DEFAULT 0,
  p_failed INTEGER DEFAULT 0,
  p_replied INTEGER DEFAULT 0,
  p_clicked INTEGER DEFAULT 0,
  p_conversion INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
  UPDATE campaigns SET
    sent_count = COALESCE(sent_count, 0) + p_sent,
    delivered_count = COALESCE(delivered_count, 0) + p_delivered,
    read_count = COALESCE(read_count, 0) + p_read,
    failed_count = COALESCE(failed_count, 0) + p_failed,
    replied_count = COALESCE(replied_count, 0) + p_replied,
    clicked_count = COALESCE(clicked_count, 0) + p_clicked,
    conversion_count = COALESCE(conversion_count, 0) + p_conversion
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure index on campaign_recipients.whatsapp_message_id for fast lookups
-- Make sure the column exists before creating an index (some installs may not have added it)
ALTER TABLE IF EXISTS campaign_recipients ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_whatsapp_id ON campaign_recipients (whatsapp_message_id);
