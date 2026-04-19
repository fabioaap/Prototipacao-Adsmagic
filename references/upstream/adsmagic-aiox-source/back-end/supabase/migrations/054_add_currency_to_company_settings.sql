-- Migration 054: Add currency column to company_settings
-- Data: 2025-02-07
-- Descrição: Adiciona coluna currency para permitir configuração de moeda por empresa
-- Corrige erro 500 no endpoint PATCH /settings/currency

BEGIN;

-- Adicionar coluna currency à tabela company_settings
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT NULL;

-- Adicionar constraint para formato ISO 4217 (3 letras maiúsculas)
-- Permite NULL (usa moeda do projeto) ou código de moeda válido
ALTER TABLE company_settings
ADD CONSTRAINT company_settings_currency_format
CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$');

-- Comentário na coluna para documentação
COMMENT ON COLUMN company_settings.currency IS 'Código de moeda ISO 4217 (ex: BRL, USD). NULL = usa moeda do projeto.';

COMMIT;
