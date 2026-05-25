-- Chatbot builder tables for no-code WhatsApp auto-reply flows

CREATE TABLE IF NOT EXISTS chatbots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  welcome_message TEXT,
  fallback_message TEXT DEFAULT 'Sorry, I didn''t understand that.',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbots_business_id ON chatbots (business_id);

CREATE TABLE IF NOT EXISTS chatbot_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id      UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  trigger_type    TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'exact_match', 'regex', 'welcome', 'fallback')),
  trigger_value   TEXT,
  response_type   TEXT NOT NULL CHECK (response_type IN ('text', 'template', 'interactive')),
  response_config JSONB NOT NULL DEFAULT '{}',
  position        INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_rules_chatbot_id ON chatbot_rules (chatbot_id);

ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chatbots in their business"
  ON chatbots FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert chatbots in their business"
  ON chatbots FOR INSERT
  WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update chatbots in their business"
  ON chatbots FOR UPDATE
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete chatbots in their business"
  ON chatbots FOR DELETE
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view rules for their chatbots"
  ON chatbot_rules FOR SELECT
  USING (chatbot_id IN (SELECT id FROM chatbots WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can insert rules for their chatbots"
  ON chatbot_rules FOR INSERT
  WITH CHECK (chatbot_id IN (SELECT id FROM chatbots WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update rules for their chatbots"
  ON chatbot_rules FOR UPDATE
  USING (chatbot_id IN (SELECT id FROM chatbots WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Users can delete rules for their chatbots"
  ON chatbot_rules FOR DELETE
  USING (chatbot_id IN (SELECT id FROM chatbots WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())));

CREATE TRIGGER trg_chatbots_updated_at
  BEFORE UPDATE ON chatbots
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_chatbot_rules_updated_at
  BEFORE UPDATE ON chatbot_rules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
