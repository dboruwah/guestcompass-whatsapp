-- =============================================================
-- WHATSAPP MARKETING CRM PLATFORM
-- Initial Database Schema Migration
-- Version: 2.1.0 (Enhanced CRM)
-- =============================================================

-- ─── Enums ──────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'agent', 'viewer');
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE contact_status AS ENUM ('active', 'inactive', 'blocked', 'opted_out');
CREATE TYPE opt_in_status AS ENUM ('opted_in', 'pending', 'opted_out');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed');
CREATE TYPE campaign_type AS ENUM ('promotional', 'transactional', 'engagement', 'feedback', 'announcement', 'broadcast');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE message_content_type AS ENUM ('text', 'image', 'document', 'template', 'interactive');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'resolved');

-- ─── Trigger Function ───────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Businesses (for future multi-tenant SaaS) ──────────────

CREATE TABLE businesses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  default_language TEXT NOT NULL DEFAULT 'en',
  whatsapp_business_phone TEXT,
  settings      JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_slug ON businesses (slug);
CREATE INDEX idx_businesses_is_active ON businesses (is_active);

-- ─── Profiles (extends Supabase auth.users) ─────────────────

CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  avatar_url     TEXT,
  role           user_role NOT NULL DEFAULT 'viewer',
  phone          TEXT,
  business_id    UUID REFERENCES businesses(id) ON DELETE SET NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_sign_in_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_role ON profiles (role);
CREATE INDEX idx_profiles_business_id ON profiles (business_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Staff ──────────────────────────────────────────────────

CREATE TABLE staff (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role                user_role NOT NULL,
  position            TEXT,
  department          TEXT,
  status              staff_status NOT NULL DEFAULT 'active',
  permissions         TEXT[] NOT NULL DEFAULT '{}',
  avg_response_time   INTEGER,
  conversations_handled INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, business_id)
);

CREATE INDEX idx_staff_user_id ON staff (user_id);
CREATE INDEX idx_staff_business_id ON staff (business_id);
CREATE INDEX idx_staff_role ON staff (role);
CREATE INDEX idx_staff_status ON staff (status);

CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Contacts ───────────────────────────────────────────────

CREATE TABLE contacts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  email                   TEXT,
  phone                   TEXT NOT NULL,
  country_code            TEXT,
  language                TEXT NOT NULL DEFAULT 'en',
  tags                    TEXT[] NOT NULL DEFAULT '{}',
  custom_fields           JSONB NOT NULL DEFAULT '{}',
  opt_in_status           opt_in_status NOT NULL DEFAULT 'pending',
  opt_in_date             TIMESTAMPTZ,
  opt_in_source           TEXT,
  engagement_score        INTEGER NOT NULL DEFAULT 0,
  total_messages_received INTEGER NOT NULL DEFAULT 0,
  total_messages_sent     INTEGER NOT NULL DEFAULT 0,
  last_message_at         TIMESTAMPTZ,
  last_campaign_id        UUID,
  lifetime_value          DECIMAL(12,2) NOT NULL DEFAULT 0,
  conversion_count        INTEGER NOT NULL DEFAULT 0,
  assigned_to             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes                   TEXT,
  status                  contact_status NOT NULL DEFAULT 'active',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_business_id ON contacts (business_id);
CREATE INDEX idx_contacts_email ON contacts (email);
CREATE INDEX idx_contacts_phone ON contacts (phone);
CREATE INDEX idx_contacts_status ON contacts (status);
CREATE INDEX idx_contacts_opt_in ON contacts (opt_in_status);
CREATE INDEX idx_contacts_tags ON contacts USING GIN (tags);
CREATE INDEX idx_contacts_engagement ON contacts (engagement_score DESC);
CREATE INDEX idx_contacts_lifetime_value ON contacts (lifetime_value DESC);
CREATE INDEX idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX idx_contacts_last_message ON contacts (last_message_at DESC);
CREATE INDEX idx_contacts_name ON contacts (last_name, first_name);
CREATE INDEX idx_contacts_assigned_to ON contacts (assigned_to);
CREATE INDEX idx_contacts_conversion_count ON contacts (conversion_count DESC);

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Contact Tags ───────────────────────────────────────────

CREATE TABLE contact_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#c9a84c',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, name)
);

CREATE INDEX idx_contact_tags_business_id ON contact_tags (business_id);

-- ─── Segments ───────────────────────────────────────────────

CREATE TABLE segments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  criteria      JSONB NOT NULL DEFAULT '{"rules":[],"logic":"and"}',
  contact_count INTEGER NOT NULL DEFAULT 0,
  is_dynamic    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_segments_business_id ON segments (business_id);
CREATE INDEX idx_segments_created_by ON segments (created_by);

CREATE TRIGGER trg_segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Campaigns ──────────────────────────────────────────────

CREATE TABLE campaigns (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  description             TEXT,
  type                    campaign_type NOT NULL,
  status                  campaign_status NOT NULL DEFAULT 'draft',
  message_template        TEXT NOT NULL,
  scheduled_at            TIMESTAMPTZ,
  sent_at                 TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  segment_id              UUID REFERENCES segments(id) ON DELETE SET NULL,
  target_audience_count   INTEGER NOT NULL DEFAULT 0,
  sent_count              INTEGER NOT NULL DEFAULT 0,
  delivered_count         INTEGER NOT NULL DEFAULT 0,
  read_count              INTEGER NOT NULL DEFAULT 0,
  failed_count            INTEGER NOT NULL DEFAULT 0,
  replied_count           INTEGER NOT NULL DEFAULT 0,
  clicked_count           INTEGER NOT NULL DEFAULT 0,
  conversion_count        INTEGER NOT NULL DEFAULT 0,
  revenue_attributed      DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_business_id ON campaigns (business_id);
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_type ON campaigns (type);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns (scheduled_at);
CREATE INDEX idx_campaigns_created_by ON campaigns (created_by);
CREATE INDEX idx_campaigns_created_at ON campaigns (created_at DESC);
CREATE INDEX idx_campaigns_revenue ON campaigns (revenue_attributed DESC);

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Campaign Recipients ────────────────────────────────────

CREATE TABLE campaign_recipients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status        message_status,
  delivered_at  TIMESTAMPTZ,
  read_at       TIMESTAMPTZ,
  replied_at    TIMESTAMPTZ,
  clicked_at    TIMESTAMPTZ,
  converted     BOOLEAN NOT NULL DEFAULT FALSE,
  revenue       DECIMAL(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients (campaign_id);
CREATE INDEX idx_campaign_recipients_contact_id ON campaign_recipients (contact_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients (status);
CREATE INDEX idx_campaign_recipients_converted ON campaign_recipients (converted);
CREATE INDEX idx_campaign_recipients_revenue ON campaign_recipients (revenue DESC);

-- ─── Conversations ──────────────────────────────────────────

CREATE TABLE conversations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id              UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_to             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status                  conversation_status NOT NULL DEFAULT 'active',
  last_message_at         TIMESTAMPTZ,
  last_message_preview    TEXT,
  unread_count            INTEGER NOT NULL DEFAULT 0,
  response_time_avg       INTEGER,
  whatsapp_conversation_id TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_business_id ON conversations (business_id);
CREATE INDEX idx_conversations_contact_id ON conversations (contact_id);
CREATE INDEX idx_conversations_assigned_to ON conversations (assigned_to);
CREATE INDEX idx_conversations_status ON conversations (status);
CREATE INDEX idx_conversations_last_message_at ON conversations (last_message_at DESC);
CREATE INDEX idx_conversations_unread_count ON conversations (unread_count DESC);

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── Messages ───────────────────────────────────────────────

CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_type         TEXT NOT NULL CHECK (sender_type IN ('staff', 'contact', 'system')),
  direction           message_direction NOT NULL,
  content             TEXT NOT NULL,
  content_type        message_content_type NOT NULL DEFAULT 'text',
  media_url           TEXT,
  status              message_status NOT NULL DEFAULT 'queued',
  whatsapp_message_id TEXT,
  metadata            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_status ON messages (status);
CREATE INDEX idx_messages_created_at ON messages (created_at ASC);
CREATE INDEX idx_messages_whatsapp_id ON messages (whatsapp_message_id);

-- ─── Contact Activity Logs ──────────────────────────────────

CREATE TABLE contact_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  description   TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_activity_business_id ON contact_activity_logs (business_id);
CREATE INDEX idx_contact_activity_contact_id ON contact_activity_logs (contact_id);
CREATE INDEX idx_contact_activity_action ON contact_activity_logs (action);
CREATE INDEX idx_contact_activity_created_at ON contact_activity_logs (created_at DESC);

-- ─── Audit Logs ─────────────────────────────────────────────

CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  actor_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  changes       JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_business_id ON audit_logs (business_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs (entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ─── Activity Logs (user-facing activity feed) ──────────────

CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  action        TEXT NOT NULL,
  description   TEXT NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_business_id ON activity_logs (business_id);
CREATE INDEX idx_activity_logs_actor_id ON activity_logs (actor_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs (entity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- ─── Row Level Security ─────────────────────────────────────

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own business"
  ON businesses FOR SELECT
  USING (id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Staff can view contacts"
  ON contacts FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can update contacts"
  ON contacts FOR UPDATE
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can view campaigns"
  ON campaigns FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can manage campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can update campaigns"
  ON campaigns FOR UPDATE
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can view conversations"
  ON conversations FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can manage conversations"
  ON conversations FOR INSERT
  WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can update conversations"
  ON conversations FOR UPDATE
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can view messages"
  ON messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM conversations WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Staff can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_type = 'staff');

CREATE POLICY "Staff can view contact activity"
  ON contact_activity_logs FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Staff can view audit logs"
  ON audit_logs FOR SELECT
  USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- ─── Functions & Triggers ───────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_sign_in_at = NEW.last_sign_in_at WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_sign_in();

-- Auto-update engagement score based on activity
CREATE OR REPLACE FUNCTION update_contact_engagement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts SET
    engagement_score = LEAST(100,
      (NEW.total_messages_received * 2) +
      (NEW.total_messages_sent * 5) +
      (NEW.conversion_count * 10) +
      (NEW.lifetime_value / 100)
    ),
    last_message_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
