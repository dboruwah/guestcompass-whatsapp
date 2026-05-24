-- =============================================================
-- Messaging Infrastructure Migration
-- Adds queue, events, delivery logs, batches, templates, runs and event logs
-- Designed for partitioning and high volume workloads
-- =============================================================

-- Job states for the internal queue (used by message_queue)
CREATE TYPE queue_job_status AS ENUM ('queued','processing','completed','failed','delayed','scheduled');

-- Template approval status
CREATE TYPE template_approval_status AS ENUM ('draft','submitted','approved','rejected');

-- Message Queue (queue of jobs to be executed by workers)
CREATE TABLE message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status queue_job_status NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_queue_status ON message_queue (status);
CREATE INDEX idx_message_queue_available_at ON message_queue (available_at);
CREATE INDEX idx_message_queue_priority ON message_queue (priority DESC);
CREATE INDEX idx_message_queue_campaign_id ON message_queue (campaign_id);

-- Message Events (per-message lifecycle events: sent, delivered, read, failed, replied)
CREATE TABLE message_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_events_message_id ON message_events (message_id);
CREATE INDEX idx_message_events_event_type ON message_events (event_type);

-- Delivery Logs (raw delivery receipts & normalized rows)
CREATE TABLE delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_recipient_id UUID REFERENCES campaign_recipients(id) ON DELETE SET NULL,
  whatsapp_message_id TEXT,
  status TEXT,
  raw_payload JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_logs_whatsapp_id ON delivery_logs (whatsapp_message_id);
CREATE INDEX idx_delivery_logs_processed ON delivery_logs (processed);

-- Webhook Events (raw capture of incoming webhook payloads)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  headers JSONB,
  raw_payload JSONB,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_source ON webhook_events (source);
CREATE INDEX idx_webhook_events_processed ON webhook_events (processed);

-- Processing Batches (logical batches used during campaign runs)
CREATE TABLE processing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  batch_index INTEGER NOT NULL,
  total_in_batch INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_processing_batches_campaign_id ON processing_batches (campaign_id);
CREATE INDEX idx_processing_batches_status ON processing_batches (status);

-- Template Library (enterprise template management)
CREATE TABLE template_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  language TEXT NOT NULL DEFAULT 'en_US',
  template_body JSONB NOT NULL,
  variables JSONB DEFAULT '{}',
  buttons JSONB DEFAULT '[]',
  media_headers JSONB DEFAULT '{}',
  approval_status template_approval_status NOT NULL DEFAULT 'draft',
  approval_meta JSONB,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_template_library_business_id ON template_library (business_id);
CREATE INDEX idx_template_library_approval_status ON template_library (approval_status);

-- Campaign Runs (execution metadata for campaigns)
CREATE TABLE campaign_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  run_status TEXT NOT NULL DEFAULT 'pending',
  total_recipients INTEGER NOT NULL DEFAULT 0,
  queued_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  progress JSONB DEFAULT '{}',
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaign_runs_campaign_id ON campaign_runs (campaign_id);
CREATE INDEX idx_campaign_runs_run_status ON campaign_runs (run_status);

-- Event Logs (generic event log for event replay / audit)
CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  reference_id UUID,
  payload JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_logs_event_type ON event_logs (event_type);
CREATE INDEX idx_event_logs_reference_id ON event_logs (reference_id);

-- Notes:
-- - For high-volume workloads partitioning strategies are recommended. Consider
--   range partitioning by created_at or list partitioning by business_id or campaign_id.
-- - Add materialized views for aggregated campaign metrics and refresh them periodically.
-- - Sensitive indexing choices (GIN on JSONB fields) are deliberate for flexible querying.
