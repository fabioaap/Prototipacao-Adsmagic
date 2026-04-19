-- 078_fix_stripe_webhook_events_billing_schema.sql
-- Recria stripe_webhook_events para idempotência de webhooks Stripe por stripe_event_id.
-- Schema anterior: id varchar, type, status, payload, created_at (incompatível).
-- Novo schema: id uuid, stripe_event_id UNIQUE, event_type, processed_at, payload.

DROP TABLE IF EXISTS stripe_webhook_events;

CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB
);

CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);

ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- Sem policy de SELECT = apenas service_role (processamento de webhooks).
