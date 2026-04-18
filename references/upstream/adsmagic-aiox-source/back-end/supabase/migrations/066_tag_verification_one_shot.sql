-- Migration 066: Tag verification one-shot
-- Data: 2026-02-24
-- Descrição: Fluxo de verificação manual da tag com token temporário e status agregado por projeto

BEGIN;

-- ============================================================================
-- TABELA: tag_verifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS tag_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired', 'failed')),
  created_by UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  verified_page_url TEXT,
  runtime_version VARCHAR(50),
  error_message TEXT,
  consumed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tag_verifications IS 'Verificações one-shot da tag por projeto com token temporário';
COMMENT ON COLUMN tag_verifications.token_hash IS 'Hash SHA-256 do token de verificação';
COMMENT ON COLUMN tag_verifications.site_url IS 'URL informada pelo usuário para validação';
COMMENT ON COLUMN tag_verifications.verified_page_url IS 'URL real enviada pelo ping da tag';

CREATE INDEX IF NOT EXISTS idx_tag_verifications_project_created
  ON tag_verifications(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tag_verifications_project_status
  ON tag_verifications(project_id, status);

CREATE INDEX IF NOT EXISTS idx_tag_verifications_expires_at
  ON tag_verifications(expires_at);

DROP TRIGGER IF EXISTS set_tag_verifications_updated_at ON tag_verifications;
CREATE TRIGGER set_tag_verifications_updated_at
  BEFORE UPDATE ON tag_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tag_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tag_verifications_select_policy ON tag_verifications;
CREATE POLICY tag_verifications_select_policy ON tag_verifications
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS tag_verifications_insert_policy ON tag_verifications;
CREATE POLICY tag_verifications_insert_policy ON tag_verifications
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS tag_verifications_update_policy ON tag_verifications;
CREATE POLICY tag_verifications_update_policy ON tag_verifications
  FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- TABELA: tag_installation_status
-- ============================================================================
CREATE TABLE IF NOT EXISTS tag_installation_status (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  is_installed BOOLEAN NOT NULL DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  last_verified_url TEXT,
  runtime_version VARCHAR(50),
  verification_count INTEGER NOT NULL DEFAULT 0 CHECK (verification_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tag_installation_status IS 'Status agregado da instalação da tag por projeto';
COMMENT ON COLUMN tag_installation_status.last_verified_url IS 'Última URL validada com sucesso';

CREATE INDEX IF NOT EXISTS idx_tag_installation_status_installed
  ON tag_installation_status(is_installed);

DROP TRIGGER IF EXISTS set_tag_installation_status_updated_at ON tag_installation_status;
CREATE TRIGGER set_tag_installation_status_updated_at
  BEFORE UPDATE ON tag_installation_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE tag_installation_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tag_installation_status_select_policy ON tag_installation_status;
CREATE POLICY tag_installation_status_select_policy ON tag_installation_status
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS tag_installation_status_insert_policy ON tag_installation_status;
CREATE POLICY tag_installation_status_insert_policy ON tag_installation_status
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS tag_installation_status_update_policy ON tag_installation_status;
CREATE POLICY tag_installation_status_update_policy ON tag_installation_status
  FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id
      FROM project_users
      WHERE user_id = auth.uid()
        AND is_active = true
        AND role IN ('owner', 'admin')
    )
  );

COMMIT;
