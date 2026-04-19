-- Migration: Add indexes for contact_stage_history to improve pipeline-stats performance
-- Fixes: N+1 query pattern in dashboard/pipeline-stats handler

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_stage_history_stage_moved
  ON contact_stage_history(stage_id, moved_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_stage_history_contact_id
  ON contact_stage_history(contact_id);
