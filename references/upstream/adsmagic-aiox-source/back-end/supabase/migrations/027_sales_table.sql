-- Migration 027: Sales Table
-- Data: 2026-01-10
-- Descrição: Criar tabela de vendas com suporte a tracking e atribuição
-- Baseado em: doc/IMPLEMENTACAO_SALES_BACKEND.md

BEGIN;

-- ============================================================================
-- TABELA: sales
-- ============================================================================
-- Representa vendas/conversões associadas a contatos.
-- Suporta status 'completed' (ganhas) e 'lost' (perdidas).
-- Inclui tracking parameters para atribuição de campanhas.

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Dados da venda
    value DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Status e motivo de perda
    status VARCHAR(20) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('completed', 'lost')),
    lost_reason VARCHAR(100),
    lost_observations TEXT,
    
    -- Atribuição de origem (pode ser null se não atribuída)
    origin_id UUID REFERENCES origins(id) ON DELETE SET NULL,
    
    -- Notas e observações
    notes TEXT,
    
    -- Tracking parameters (UTMs, click IDs: gclid, fbclid, etc)
    tracking_params JSONB DEFAULT '{}'::jsonb,
    
    -- Metadados adicionais (device, location, browser, etc)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário da tabela
COMMENT ON TABLE sales IS 'Vendas/conversões associadas a contatos. Suporta tracking e atribuição de origem.';

-- Comentários das colunas
COMMENT ON COLUMN sales.value IS 'Valor da venda em decimal (até 12 dígitos, 2 casas decimais)';
COMMENT ON COLUMN sales.currency IS 'Código da moeda ISO 4217 (BRL, USD, EUR, etc)';
COMMENT ON COLUMN sales.status IS 'Status da venda: completed (ganhou) ou lost (perdeu)';
COMMENT ON COLUMN sales.lost_reason IS 'Motivo da perda (obrigatório quando status = lost)';
COMMENT ON COLUMN sales.origin_id IS 'ID da origem atribuída (Google Ads, Meta, etc)';
COMMENT ON COLUMN sales.tracking_params IS 'Parâmetros de tracking: gclid, fbclid, utm_source, utm_medium, etc';
COMMENT ON COLUMN sales.metadata IS 'Metadados: device, browser, city, country, etc';

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice primário por projeto (queries mais comuns)
CREATE INDEX idx_sales_project_id ON sales(project_id);

-- Índice por contato (buscar vendas de um contato)
CREATE INDEX idx_sales_contact_id ON sales(contact_id);

-- Índice por origem (análise de performance por origem)
CREATE INDEX idx_sales_origin_id ON sales(origin_id);

-- Índice por status (filtro comum)
CREATE INDEX idx_sales_status ON sales(status);

-- Índice por data (ordenação e filtros de período)
CREATE INDEX idx_sales_date ON sales(date);

-- Índice por created_at (ordenação padrão)
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- Índice composto para queries de dashboard (projeto + status)
CREATE INDEX idx_sales_project_status ON sales(project_id, status);

-- Índice composto para queries de período (projeto + data)
CREATE INDEX idx_sales_project_date ON sales(project_id, date);

-- Índice composto para métricas por origem (projeto + origem + status)
CREATE INDEX idx_sales_project_origin_status ON sales(project_id, origin_id, status);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- Valor deve ser >= 0 (vendas perdidas podem ter valor 0)
ALTER TABLE sales ADD CONSTRAINT sales_value_non_negative 
    CHECK (value >= 0);

-- Motivo de perda é obrigatório quando status = 'lost'
ALTER TABLE sales ADD CONSTRAINT sales_lost_reason_required 
    CHECK (status != 'lost' OR lost_reason IS NOT NULL);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
-- Reutiliza a função update_updated_at_column() já existente no banco

CREATE TRIGGER set_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

COMMIT;
