-- Migration: Allow web tracking events without contact/sale and add 'web' platform
-- Fixes: events/track 401 — enables public tracking endpoint for tag snippet

BEGIN;

-- Allow tracking events without contact_id or sale_id
ALTER TABLE conversion_events DROP CONSTRAINT IF EXISTS conversion_events_contact_or_sale_check;

-- Add 'web' as a valid platform
ALTER TABLE conversion_events DROP CONSTRAINT IF EXISTS conversion_events_platform_check;
ALTER TABLE conversion_events ADD CONSTRAINT conversion_events_platform_check
  CHECK (platform IN ('meta', 'google', 'tiktok', 'web'));

COMMIT;
