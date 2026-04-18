-- Migration: Add revenue_goal column to projects table
-- This allows users to set a monthly revenue target per project

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS revenue_goal NUMERIC(12, 2) DEFAULT NULL;

COMMENT ON COLUMN projects.revenue_goal IS 'Monthly revenue goal in currency units';
