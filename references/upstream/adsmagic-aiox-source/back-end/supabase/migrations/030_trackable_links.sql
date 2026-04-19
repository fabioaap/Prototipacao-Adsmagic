-- Migration 030: Trackable Links Table
-- Data: 2026-01-17
-- Descrição: Criar tabela de links rastreáveis com suporte a WhatsApp, UTMs e short codes
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 2)

BEGIN;

-- ============================================================================
-- TABELA: trackable_links
-- ============================================================================
-- Representa links rastreáveis para campanhas de marketing.
-- Suporta links WhatsApp, landing pages e redirecionamentos diretos.
-- Inclui tracking de UTMs, short codes e contadores automáticos.

CREATE TABLE trackable_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Identificação do link
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    
    -- URLs de destino
    destination_url TEXT,
    tracking_url TEXT,
    
    -- Mensagem inicial (para WhatsApp ou landing pages)
    initial_message TEXT,
    
    -- Origem vinculada (para atribuição de contatos)
    origin_id UUID REFERENCES origins(id) ON DELETE SET NULL,
    
    -- Campos WhatsApp (migração do Xano)
    whatsapp_number VARCHAR(20),
    whatsapp_message_template TEXT,
    
    -- Tipo do link
    link_type VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
        CHECK (link_type IN ('whatsapp', 'landing_page', 'direct')),
    
    -- UTMs configurados no link
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Short URL
    short_code VARCHAR(20),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Contadores (atualizados via triggers)
    clicks_count INTEGER NOT NULL DEFAULT 0,
    contacts_count INTEGER NOT NULL DEFAULT 0,
    sales_count INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário da tabela
COMMENT ON TABLE trackable_links IS 'Links rastreáveis para campanhas de marketing. Suporta WhatsApp, landing pages e redirecionamentos.';

-- Comentários das colunas
COMMENT ON COLUMN trackable_links.name IS 'Nome identificador do link (único por projeto)';
COMMENT ON COLUMN trackable_links.slug IS 'Slug único global para URL amigável';
COMMENT ON COLUMN trackable_links.destination_url IS 'URL de destino para links tipo landing_page ou direct';
COMMENT ON COLUMN trackable_links.tracking_url IS 'URL completa de tracking gerada automaticamente';
COMMENT ON COLUMN trackable_links.initial_message IS 'Mensagem inicial pré-preenchida';
COMMENT ON COLUMN trackable_links.origin_id IS 'Origem vinculada para atribuição automática de contatos';
COMMENT ON COLUMN trackable_links.whatsapp_number IS 'Número WhatsApp no formato internacional (ex: 5511999999999)';
COMMENT ON COLUMN trackable_links.whatsapp_message_template IS 'Template de mensagem WhatsApp com placeholders';
COMMENT ON COLUMN trackable_links.link_type IS 'Tipo: whatsapp (abre WhatsApp), landing_page (redireciona), direct (redireciona direto)';
COMMENT ON COLUMN trackable_links.short_code IS 'Código curto único para short URL (ex: abc123)';
COMMENT ON COLUMN trackable_links.clicks_count IS 'Total de cliques (atualizado via trigger)';
COMMENT ON COLUMN trackable_links.contacts_count IS 'Total de contatos gerados (atualizado via trigger)';
COMMENT ON COLUMN trackable_links.sales_count IS 'Total de vendas atribuídas (atualizado via trigger)';
COMMENT ON COLUMN trackable_links.revenue IS 'Receita total atribuída (atualizado via trigger)';

-- ============================================================================
-- CONSTRAINTS DE UNICIDADE
-- ============================================================================

-- Slug deve ser único globalmente
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_slug_unique 
    UNIQUE (slug);

-- Short code deve ser único globalmente (quando presente)
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_short_code_unique 
    UNIQUE (short_code);

-- Nome deve ser único por projeto
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_project_name_unique 
    UNIQUE (project_id, name);

-- ============================================================================
-- CONSTRAINTS DE VALIDAÇÃO
-- ============================================================================

-- WhatsApp number é obrigatório quando link_type = 'whatsapp'
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_whatsapp_check 
    CHECK (
        (link_type = 'whatsapp' AND whatsapp_number IS NOT NULL) OR 
        (link_type != 'whatsapp')
    );

-- Destination URL é obrigatório quando link_type != 'whatsapp'
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_destination_check 
    CHECK (
        (link_type = 'whatsapp') OR 
        (link_type != 'whatsapp' AND destination_url IS NOT NULL)
    );

-- Contadores não podem ser negativos
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_clicks_non_negative 
    CHECK (clicks_count >= 0);
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_contacts_non_negative 
    CHECK (contacts_count >= 0);
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_sales_non_negative 
    CHECK (sales_count >= 0);
ALTER TABLE trackable_links ADD CONSTRAINT trackable_links_revenue_non_negative 
    CHECK (revenue >= 0);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice primário por projeto (queries mais comuns)
CREATE INDEX idx_trackable_links_project_id ON trackable_links(project_id);

-- Índice por slug (busca por URL amigável)
CREATE INDEX idx_trackable_links_slug ON trackable_links(slug);

-- Índice por short_code (busca por short URL)
CREATE INDEX idx_trackable_links_short_code ON trackable_links(short_code) 
    WHERE short_code IS NOT NULL;

-- Índice por origin_id (relacionamento com origens)
CREATE INDEX idx_trackable_links_origin_id ON trackable_links(origin_id) 
    WHERE origin_id IS NOT NULL;

-- Índice por link_type (filtro comum)
CREATE INDEX idx_trackable_links_type ON trackable_links(link_type);

-- Índice por status (filtro comum)
CREATE INDEX idx_trackable_links_active ON trackable_links(is_active);

-- Índice composto para listagem (projeto + ativo + criado)
CREATE INDEX idx_trackable_links_project_active_created 
    ON trackable_links(project_id, is_active, created_at DESC);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
-- Reutiliza a função update_updated_at_column() já existente no banco

CREATE TRIGGER set_trackable_links_updated_at
    BEFORE UPDATE ON trackable_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE trackable_links ENABLE ROW LEVEL SECURITY;

COMMIT;
