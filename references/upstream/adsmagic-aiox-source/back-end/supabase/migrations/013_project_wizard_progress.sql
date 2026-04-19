-- Migration 013: Project Wizard Progress
-- Data: 2025-01-27
-- Descrição: Adicionar campos para progresso do assistente de projetos
-- Baseado em: Plano de implementação do sistema de progresso do wizard

BEGIN;

-- ============================================================================
-- ADICIONAR CAMPOS À TABELA PROJECTS
-- ============================================================================

-- Campo para armazenar progresso do wizard (JSONB)
ALTER TABLE projects ADD COLUMN wizard_progress JSONB DEFAULT NULL;

-- Campo para step atual do wizard
ALTER TABLE projects ADD COLUMN wizard_current_step INTEGER DEFAULT 1;

-- Campo para timestamp de conclusão do wizard
ALTER TABLE projects ADD COLUMN wizard_completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice para queries de projetos com wizard pendente
CREATE INDEX idx_projects_wizard_pending 
ON projects(status, wizard_progress) 
WHERE status = 'draft' AND wizard_progress IS NOT NULL;

-- Índice para cleanup de drafts abandonados
CREATE INDEX idx_projects_draft_cleanup 
ON projects(status, updated_at) 
WHERE status = 'draft';

-- ============================================================================
-- FUNÇÃO DE LIMPEZA DE DRAFTS ABANDONADOS
-- ============================================================================

-- Função para limpar projetos draft abandonados (>30 dias sem update)
CREATE OR REPLACE FUNCTION cleanup_abandoned_draft_projects()
RETURNS void AS $$
BEGIN
  DELETE FROM projects 
  WHERE status = 'draft' 
  AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Log da operação
  RAISE NOTICE 'Cleanup executado: projetos draft abandonados removidos';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW PARA PROJETOS ATIVOS (SEM DRAFTS)
-- ============================================================================

-- View que exclui projetos draft das consultas normais
CREATE VIEW active_projects AS
SELECT * FROM projects 
WHERE status IN ('active', 'paused', 'archived');

-- ============================================================================
-- RLS POLICIES PARA WIZARD PROGRESS
-- ============================================================================

-- Policy: usuário vê drafts apenas se for membro do projeto
CREATE POLICY "Users can view their draft projects"
ON projects FOR SELECT
USING (
  status = 'draft' AND
  user_has_project_access(auth.uid(), id)
);

-- Policy: usuário pode atualizar drafts apenas se for membro
CREATE POLICY "Users can update their draft projects"
ON projects FOR UPDATE
USING (
  status = 'draft' AND
  user_has_project_access(auth.uid(), id)
);

-- Policy: usuário pode inserir drafts na sua empresa
CREATE POLICY "Users can create draft projects in their company"
ON projects FOR INSERT
WITH CHECK (
  status = 'draft' AND
  user_has_company_access(auth.uid(), company_id)
);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- Constraint: wizard_current_step deve estar entre 1 e 6
ALTER TABLE projects ADD CONSTRAINT projects_wizard_step_range 
CHECK (wizard_current_step IS NULL OR (wizard_current_step >= 1 AND wizard_current_step <= 6));

-- Constraint: wizard_completed_at só pode existir se wizard_progress for NULL
ALTER TABLE projects ADD CONSTRAINT projects_wizard_completion_check 
CHECK (
  (wizard_progress IS NULL AND wizard_completed_at IS NOT NULL) OR
  (wizard_progress IS NOT NULL AND wizard_completed_at IS NULL) OR
  (wizard_progress IS NULL AND wizard_completed_at IS NULL)
);

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON COLUMN projects.wizard_progress IS 'Progresso do assistente de criação de projetos (JSONB)';
COMMENT ON COLUMN projects.wizard_current_step IS 'Etapa atual do wizard (1-6)';
COMMENT ON COLUMN projects.wizard_completed_at IS 'Timestamp de conclusão do wizard';

COMMENT ON FUNCTION cleanup_abandoned_draft_projects() IS 'Remove projetos draft abandonados há mais de 30 dias';
COMMENT ON VIEW active_projects IS 'View que exclui projetos draft das consultas normais';

COMMIT;
