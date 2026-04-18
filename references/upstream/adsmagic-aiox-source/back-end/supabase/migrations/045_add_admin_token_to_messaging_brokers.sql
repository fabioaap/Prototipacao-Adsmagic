-- Migration 045: Add admin_token to messaging_brokers
-- Data: 2025-01-XX
-- Descrição: Adiciona coluna admin_token para armazenar tokens administrativos de brokers
--             como uazapi (AdminToken) e futuros outros tokens administrativos
-- Baseado em: Análise da integração WhatsApp uazapi

BEGIN;

-- ============================================================================
-- ADICIONAR COLUNA: admin_token
-- ============================================================================
-- Armazena token administrativo do broker (ex: AdminToken do uazapi)
-- Tokens devem ser criptografados antes de serem salvos usando pgcrypto
-- Campo nullable pois nem todos os brokers requerem admin_token
ALTER TABLE messaging_brokers
ADD COLUMN IF NOT EXISTS admin_token TEXT;

-- ============================================================================
-- ADICIONAR COLUNA: admin_token_encrypted
-- ============================================================================
-- Flag para indicar se o admin_token já está criptografado
-- Útil para migrações e validações
ALTER TABLE messaging_brokers
ADD COLUMN IF NOT EXISTS admin_token_encrypted BOOLEAN DEFAULT false;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON COLUMN messaging_brokers.admin_token IS 
'Token administrativo do broker (ex: AdminToken do uazapi para criar instâncias). 
Deve ser criptografado antes de salvar usando pgcrypto. 
Campo nullable pois nem todos os brokers requerem admin_token.';

COMMENT ON COLUMN messaging_brokers.admin_token_encrypted IS 
'Indica se o admin_token já está criptografado. 
Útil para validações e migrações de dados existentes.';

-- ============================================================================
-- TRIGGER: updated_at
-- ============================================================================
-- Garantir que updated_at é atualizado automaticamente quando colunas são modificadas
-- Usa a função update_updated_at_column() criada na migration 003
DO $$
BEGIN
    -- Criar trigger apenas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_messaging_brokers_updated_at'
    ) THEN
        CREATE TRIGGER trigger_messaging_brokers_updated_at
            BEFORE UPDATE ON messaging_brokers
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- VALIDAÇÃO
-- ============================================================================
-- Garantir que se admin_token_encrypted = true, admin_token não seja null
-- (lógica deve ser implementada na aplicação, não via constraint para flexibilidade)

-- ============================================================================
-- ÍNDICES (se necessário no futuro)
-- ============================================================================
-- Não necessário por enquanto, pois admin_token não será usado em queries diretas
-- (será descriptografado apenas quando necessário para uso)

COMMIT;
