-- Migration: RLS policies for jobs table

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT jobs from their projects
CREATE POLICY jobs_select_policy ON jobs
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id FROM project_users
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can INSERT jobs for their projects
CREATE POLICY jobs_insert_policy ON jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_users
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can UPDATE jobs from their projects (for cancellation)
CREATE POLICY jobs_update_policy ON jobs
    FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT project_id FROM project_users
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_users
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Service role can do everything (for job-worker)
-- Note: Service role bypasses RLS by default, but we add explicit policy for clarity
CREATE POLICY jobs_service_all_policy ON jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
