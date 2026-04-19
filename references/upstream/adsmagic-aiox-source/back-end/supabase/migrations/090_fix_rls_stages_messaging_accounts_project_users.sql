-- Migration 090: Fix RLS policies for project-level tables using company_users only
-- Problem: Several tables use company_users for access control, but users can be
-- added via project_users only (without company_users). This blocks their access.
-- Affected: stages, messaging_accounts, origins, contact_origins, contact_stage_history, messaging_webhooks
-- Fix: Add project_users as an alternative access path in all RLS policies.

-- ============================================================================
-- STAGES: Update SELECT policy to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS stages_user_select_policy ON stages;
CREATE POLICY stages_user_select_policy ON stages
  FOR SELECT
  USING (
    (project_id IS NULL)
    OR (project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    ))
    OR (project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    ))
  );

-- STAGES: Update INSERT policy
DROP POLICY IF EXISTS stages_user_insert_policy ON stages;
CREATE POLICY stages_user_insert_policy ON stages
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

-- STAGES: Update UPDATE policy
DROP POLICY IF EXISTS stages_user_update_policy ON stages;
CREATE POLICY stages_user_update_policy ON stages
  FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

-- STAGES: Update DELETE policy
DROP POLICY IF EXISTS stages_user_delete_policy ON stages;
CREATE POLICY stages_user_delete_policy ON stages
  FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- MESSAGING_ACCOUNTS: Update ALL policy to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS messaging_accounts_user_policy ON messaging_accounts;
CREATE POLICY messaging_accounts_user_policy ON messaging_accounts
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  );

-- ============================================================================
-- ORIGINS: Update policies to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS origins_user_select_policy ON origins;
CREATE POLICY origins_user_select_policy ON origins
  FOR SELECT
  USING (
    ((type = 'system') AND (project_id IS NULL))
    OR (project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    ))
    OR (project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    ))
  );

DROP POLICY IF EXISTS origins_user_insert_policy ON origins;
CREATE POLICY origins_user_insert_policy ON origins
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS origins_user_update_policy ON origins;
CREATE POLICY origins_user_update_policy ON origins
  FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin', 'manager')
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin', 'manager')
    )
  );

DROP POLICY IF EXISTS origins_user_delete_policy ON origins;
CREATE POLICY origins_user_delete_policy ON origins
  FOR DELETE
  USING (
    (type = 'custom') AND (
      project_id IN (
        SELECT p.id FROM projects p
        JOIN company_users cu ON cu.company_id = p.company_id
        WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
          AND cu.role IN ('owner', 'admin')
      )
      OR project_id IN (
        SELECT pu.project_id FROM project_users pu
        WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
          AND pu.role IN ('owner', 'admin')
      )
    )
  );

-- ============================================================================
-- CONTACT_ORIGINS: Update policies to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS contact_origins_user_select_policy ON contact_origins;
CREATE POLICY contact_origins_user_select_policy ON contact_origins
  FOR SELECT
  USING (
    contact_id IN (
      SELECT c.id FROM contacts c
      JOIN projects p ON p.id = c.project_id
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR contact_id IN (
      SELECT c.id FROM contacts c
      JOIN project_users pu ON pu.project_id = c.project_id
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  );

DROP POLICY IF EXISTS contact_origins_user_delete_policy ON contact_origins;
CREATE POLICY contact_origins_user_delete_policy ON contact_origins
  FOR DELETE
  USING (
    contact_id IN (
      SELECT c.id FROM contacts c
      JOIN projects p ON p.id = c.project_id
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin')
    )
    OR contact_id IN (
      SELECT c.id FROM contacts c
      JOIN project_users pu ON pu.project_id = c.project_id
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- CONTACT_STAGE_HISTORY: Update policies to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS contact_stage_history_user_select_policy ON contact_stage_history;
CREATE POLICY contact_stage_history_user_select_policy ON contact_stage_history
  FOR SELECT
  USING (
    contact_id IN (
      SELECT c.id FROM contacts c
      JOIN projects p ON p.id = c.project_id
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR contact_id IN (
      SELECT c.id FROM contacts c
      JOIN project_users pu ON pu.project_id = c.project_id
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  );

DROP POLICY IF EXISTS contact_stage_history_user_delete_policy ON contact_stage_history;
CREATE POLICY contact_stage_history_user_delete_policy ON contact_stage_history
  FOR DELETE
  USING (
    contact_id IN (
      SELECT c.id FROM contacts c
      JOIN projects p ON p.id = c.project_id
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
        AND cu.role IN ('owner', 'admin')
    )
    OR contact_id IN (
      SELECT c.id FROM contacts c
      JOIN project_users pu ON pu.project_id = c.project_id
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
        AND pu.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- MESSAGING_WEBHOOKS: Update ALL policy to also accept project_users
-- ============================================================================

DROP POLICY IF EXISTS messaging_webhooks_user_policy ON messaging_webhooks;
CREATE POLICY messaging_webhooks_user_policy ON messaging_webhooks
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN company_users cu ON cu.company_id = p.company_id
      WHERE cu.user_id = ( SELECT auth.uid() AS uid) AND cu.is_active = true
    )
    OR project_id IN (
      SELECT pu.project_id FROM project_users pu
      WHERE pu.user_id = ( SELECT auth.uid() AS uid) AND pu.is_active = true
    )
  );
