-- Migration 031: Link Accesses Table
-- Data: 2026-01-17
-- Descrição: Criar tabela de acessos a links para tracking detalhado
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 2)

BEGIN;

-- ============================================================================
-- TABELA: link_accesses
-- ============================================================================
-- Registra cada acesso individual a um link rastreável.
-- Captura informações de tracking, geo data e click IDs.
-- Permite atribuição posterior a contatos quando conversão ocorre.

CREATE TABLE link_accesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES trackable_links(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Tracking único do acesso
    access_uuid VARCHAR(36) NOT NULL,
    
    -- Relacionamento com contato (quando atribuído depois)
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    
    -- Protocolo único gerado para WhatsApp (para matching posterior)
    whatsapp_protocol VARCHAR(100),
    
    -- User info (capturado no momento do acesso)
    user_agent TEXT,
    ip_address VARCHAR(45),
    city VARCHAR(100),
    country VARCHAR(2),
    state VARCHAR(100),
    device VARCHAR(50),
    
    -- Click IDs de plataformas de ads (capturados na URL)
    fbclid VARCHAR(255),
    gclid VARCHAR(255),
    msclkid VARCHAR(255),
    gbraid VARCHAR(255),
    wbraid VARCHAR(255),
    yclid VARCHAR(255),
    ttclid VARCHAR(255),
    
    -- UTMs capturados no momento do acesso (podem diferir dos configurados no link)
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Referrer e página de origem
    referrer TEXT,
    landing_page TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Comentário da tabela
COMMENT ON TABLE link_accesses IS 'Registra cada acesso individual a links rastreáveis para tracking e atribuição.';

-- Comentários das colunas
COMMENT ON COLUMN link_accesses.access_uuid IS 'UUID único do acesso (gerado via cookie para tracking cross-session)';
COMMENT ON COLUMN link_accesses.contact_id IS 'ID do contato atribuído (preenchido quando ocorre conversão)';
COMMENT ON COLUMN link_accesses.whatsapp_protocol IS 'Protocolo único gerado para matching de conversão WhatsApp';
COMMENT ON COLUMN link_accesses.device IS 'Tipo de dispositivo: mobile, desktop, tablet';
COMMENT ON COLUMN link_accesses.fbclid IS 'Facebook Click ID para atribuição Meta Ads';
COMMENT ON COLUMN link_accesses.gclid IS 'Google Click ID para atribuição Google Ads';
COMMENT ON COLUMN link_accesses.msclkid IS 'Microsoft Click ID para atribuição Microsoft Ads';
COMMENT ON COLUMN link_accesses.gbraid IS 'Google App Campaign Click ID (iOS)';
COMMENT ON COLUMN link_accesses.wbraid IS 'Google Web Campaign Click ID (iOS)';
COMMENT ON COLUMN link_accesses.yclid IS 'Yandex Click ID';
COMMENT ON COLUMN link_accesses.ttclid IS 'TikTok Click ID para atribuição TikTok Ads';
COMMENT ON COLUMN link_accesses.converted_at IS 'Timestamp de quando o acesso foi convertido em contato';

-- ============================================================================
-- CONSTRAINTS DE UNICIDADE
-- ============================================================================

-- Access UUID deve ser único
ALTER TABLE link_accesses ADD CONSTRAINT link_accesses_access_uuid_unique 
    UNIQUE (access_uuid);

-- WhatsApp protocol deve ser único quando presente
ALTER TABLE link_accesses ADD CONSTRAINT link_accesses_whatsapp_protocol_unique 
    UNIQUE (whatsapp_protocol);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice por link_id (buscar acessos de um link)
CREATE INDEX idx_link_accesses_link_id ON link_accesses(link_id);

-- Índice por project_id (buscar acessos de um projeto)
CREATE INDEX idx_link_accesses_project_id ON link_accesses(project_id);

-- Índice por contact_id (buscar acessos de um contato)
CREATE INDEX idx_link_accesses_contact_id ON link_accesses(contact_id) 
    WHERE contact_id IS NOT NULL;

-- Índice por access_uuid (busca rápida por UUID)
CREATE INDEX idx_link_accesses_access_uuid ON link_accesses(access_uuid);

-- Índice por whatsapp_protocol (matching de conversão)
CREATE INDEX idx_link_accesses_whatsapp_protocol ON link_accesses(whatsapp_protocol) 
    WHERE whatsapp_protocol IS NOT NULL;

-- Índice por created_at (ordenação e filtros de período)
CREATE INDEX idx_link_accesses_created_at ON link_accesses(created_at);

-- Índice composto para analytics (link + data)
CREATE INDEX idx_link_accesses_link_created ON link_accesses(link_id, created_at DESC);

-- Índice composto para analytics por projeto (projeto + data)
CREATE INDEX idx_link_accesses_project_created ON link_accesses(project_id, created_at DESC);

-- Índice por fbclid (busca por click ID Meta)
CREATE INDEX idx_link_accesses_fbclid ON link_accesses(fbclid) 
    WHERE fbclid IS NOT NULL;

-- Índice por gclid (busca por click ID Google)
CREATE INDEX idx_link_accesses_gclid ON link_accesses(gclid) 
    WHERE gclid IS NOT NULL;

-- Índice por acessos não convertidos (para matching)
CREATE INDEX idx_link_accesses_unconverted 
    ON link_accesses(link_id, created_at DESC) 
    WHERE contact_id IS NULL;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE link_accesses ENABLE ROW LEVEL SECURITY;

COMMIT;
