-- Migration: Trigger to create job when conversion_event is inserted

-- Function to create job for conversion event
CREATE OR REPLACE FUNCTION create_job_for_conversion_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a job in the jobs table for async processing
    INSERT INTO jobs (
        project_id,
        queue_name,
        job_type,
        payload,
        max_retries,
        priority,
        scheduled_at
    ) VALUES (
        NEW.project_id,
        'conversion_events',
        'send_event',
        jsonb_build_object(
            'event_id', NEW.id,
            'platform', NEW.platform,
            'event_type', NEW.event_type,
            'contact_id', NEW.contact_id,
            'sale_id', NEW.sale_id
        ),
        NEW.max_retries,
        CASE
            WHEN NEW.event_type = 'purchase' THEN 10  -- Higher priority for purchases
            WHEN NEW.event_type = 'lead' THEN 5
            ELSE 0
        END,
        NOW()  -- Process immediately
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Add comment
COMMENT ON FUNCTION create_job_for_conversion_event() IS 'Creates a job in the jobs table when a conversion_event is inserted';

-- Create trigger on conversion_events
CREATE TRIGGER conversion_event_create_job_trigger
    AFTER INSERT ON conversion_events
    FOR EACH ROW
    EXECUTE FUNCTION create_job_for_conversion_event();

-- Also add column to link job to conversion_event (optional, for tracking)
ALTER TABLE conversion_events ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_conversion_events_job_id ON conversion_events(job_id);

-- Function to update conversion_event with job_id after job is created
CREATE OR REPLACE FUNCTION link_job_to_conversion_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Only for conversion_events queue
    IF NEW.queue_name = 'conversion_events' AND NEW.job_type = 'send_event' THEN
        UPDATE conversion_events
        SET job_id = NEW.id
        WHERE id = (NEW.payload->>'event_id')::uuid;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Trigger to link job back to conversion_event
CREATE TRIGGER job_link_to_conversion_event_trigger
    AFTER INSERT ON jobs
    FOR EACH ROW
    WHEN (NEW.queue_name = 'conversion_events')
    EXECUTE FUNCTION link_job_to_conversion_event();
