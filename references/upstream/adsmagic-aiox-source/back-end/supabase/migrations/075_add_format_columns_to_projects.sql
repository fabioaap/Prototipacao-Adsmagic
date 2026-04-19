-- Migration 075: Add format columns to projects
-- Data: 2026-03-05
-- Descrição: Move configurações de formatação (date_format, time_format, separadores)
--            de company_settings para projects, permitindo configuração por projeto.

BEGIN;

-- Adicionar colunas de formatação à tabela projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY'
  CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'));

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS time_format VARCHAR(10) NOT NULL DEFAULT '24h'
  CHECK (time_format IN ('12h', '24h'));

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS thousands_separator VARCHAR(5) NOT NULL DEFAULT '.';

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS decimal_separator VARCHAR(5) NOT NULL DEFAULT ',';

-- Copiar valores existentes de company_settings para os projetos correspondentes
UPDATE projects p
SET
  date_format = COALESCE(cs.date_format, 'DD/MM/YYYY'),
  time_format = COALESCE(cs.time_format, '24h'),
  thousands_separator = COALESCE(cs.thousands_separator, '.'),
  decimal_separator = COALESCE(cs.decimal_separator, ',')
FROM company_settings cs
WHERE cs.company_id = p.company_id;

-- Comentários descritivos
COMMENT ON COLUMN projects.date_format IS 'Formato de data do projeto (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)';
COMMENT ON COLUMN projects.time_format IS 'Formato de hora do projeto (12h, 24h)';
COMMENT ON COLUMN projects.thousands_separator IS 'Separador de milhares para exibição numérica';
COMMENT ON COLUMN projects.decimal_separator IS 'Separador decimal para exibição numérica';

COMMIT;
