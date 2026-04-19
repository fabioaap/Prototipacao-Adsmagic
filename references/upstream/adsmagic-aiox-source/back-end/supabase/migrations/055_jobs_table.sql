-- Migration: Create jobs table for async job processing
-- This table implements a queue system for background tasks like conversion events

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Job metadata
    queue_name VARCHAR(50) NOT NULL,  -- 'conversion_events', 'webhooks', 'analytics', 'integrations'
    job_type VARCHAR(100) NOT NULL,   -- 'send_event', 'refresh_analytics', 'sync_integration', etc.

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

    -- Payload and results
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,

    -- Error tracking
    error_message TEXT,
    error_stack TEXT,

    -- Retry logic
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    retry_after TIMESTAMP WITH TIME ZONE,

    -- Processing information
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT,  -- Worker instance identifier
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Priority and scheduling
    priority INTEGER DEFAULT 0,  -- Higher = more priority
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE jobs IS 'Queue table for async job processing (conversion events, analytics refresh, etc.)';
COMMENT ON COLUMN jobs.queue_name IS 'Queue category: conversion_events, webhooks, analytics, integrations';
COMMENT ON COLUMN jobs.job_type IS 'Specific job type within the queue';
COMMENT ON COLUMN jobs.priority IS 'Job priority (higher = more priority)';
COMMENT ON COLUMN jobs.locked_by IS 'Worker instance ID that has locked this job';

-- Indexes for efficient job processing
-- Primary query: Find pending jobs by queue, ordered by priority and schedule time
CREATE INDEX idx_jobs_queue_pending ON jobs(queue_name, priority DESC, scheduled_at ASC)
    WHERE status = 'pending';

-- Find jobs ready for retry (failed but under max_retries)
CREATE INDEX idx_jobs_retry_ready ON jobs(retry_after)
    WHERE status = 'failed' AND retry_count < max_retries;

-- Find processing jobs (for stuck job detection)
CREATE INDEX idx_jobs_processing ON jobs(locked_at)
    WHERE status = 'processing';

-- Project-scoped queries (dashboard, listing)
CREATE INDEX idx_jobs_project_status ON jobs(project_id, status, created_at DESC);

-- Queue stats
CREATE INDEX idx_jobs_queue_status ON jobs(queue_name, status);

-- Scheduled jobs (future execution)
CREATE INDEX idx_jobs_scheduled ON jobs(scheduled_at)
    WHERE status = 'pending';

-- Trigger to update updated_at
CREATE TRIGGER set_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
