-- Migration 038: Tags System Tables
-- Data: 2026-01-20
-- Descrição: Criar tabelas de tags e contact_tags para categorização de contatos
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 5)

BEGIN;

-- ============================================================================
-- TABELA: tags
-- ============================================================================
-- Representa tags para categorização de contatos por projeto.
-- Permite organizar contatos com tags coloridas e descritivas.

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Dados da tag
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Cor hexadecimal (#RRGGBB)
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Nome único por projeto
    CONSTRAINT tags_project_name_unique UNIQUE(project_id, name),
    
    -- Constraint: Validar formato de cor hexadecimal
    CONSTRAINT tags_color_format_check 
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Comentários da tabela
COMMENT ON TABLE tags IS 'Tags para categorização de contatos por projeto';
COMMENT ON COLUMN tags.project_id IS 'Projeto ao qual a tag pertence';
COMMENT ON COLUMN tags.name IS 'Nome da tag (único por projeto, máximo 50 caracteres)';
COMMENT ON COLUMN tags.color IS 'Cor hexadecimal da tag (#RRGGBB)';
COMMENT ON COLUMN tags.description IS 'Descrição opcional da tag';

-- ============================================================================
-- TABELA: contact_tags
-- ============================================================================
-- Tabela de junção que associa tags a contatos.
-- Permite múltiplas tags por contato (many-to-many).

CREATE TABLE contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Uma tag só pode ser associada uma vez ao mesmo contato
    CONSTRAINT contact_tags_contact_tag_unique UNIQUE(contact_id, tag_id)
);

-- Comentários da tabela
COMMENT ON TABLE contact_tags IS 'Associação entre contatos e tags (many-to-many)';
COMMENT ON COLUMN contact_tags.contact_id IS 'Contato ao qual a tag está associada';
COMMENT ON COLUMN contact_tags.tag_id IS 'Tag associada ao contato';

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índice primário por projeto (queries mais comuns)
CREATE INDEX idx_tags_project_id ON tags(project_id);

-- Índice por nome (busca por nome)
CREATE INDEX idx_tags_name ON tags(name);

-- Índice por contato (buscar tags de um contato)
CREATE INDEX idx_contact_tags_contact_id ON contact_tags(contact_id);

-- Índice por tag (buscar contatos com uma tag)
CREATE INDEX idx_contact_tags_tag_id ON contact_tags(tag_id);

-- Índice composto para queries de busca (projeto + nome)
CREATE INDEX idx_tags_project_name ON tags(project_id, name);

-- Índice composto para queries de contatos com tags (contato + tag)
CREATE INDEX idx_contact_tags_contact_tag ON contact_tags(contact_id, tag_id);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
-- Reutiliza a função update_updated_at_column() já existente no banco

CREATE TRIGGER set_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

COMMIT;
