-- Performance indexes for commonly co-filtered columns
-- These composite indexes improve dashboard, detail pages, and contact lookup queries

-- sales(project_id, contact_id) — used in contact detail pages and dashboard joins
CREATE INDEX IF NOT EXISTS idx_sales_project_contact
  ON sales(project_id, contact_id);

-- contacts(project_id, email) — used for email-based lookups and deduplication
CREATE INDEX IF NOT EXISTS idx_contacts_project_email
  ON contacts(project_id, email)
  WHERE email IS NOT NULL;

-- contacts(project_id, current_stage_id) — used in drill-down and kanban grouping
CREATE INDEX IF NOT EXISTS idx_contacts_project_stage
  ON contacts(project_id, current_stage_id);
