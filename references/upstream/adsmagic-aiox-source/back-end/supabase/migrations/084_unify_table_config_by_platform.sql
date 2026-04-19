-- ============================================================================
-- Migration 084: Unificar config de tabela Ad Insights por plataforma
--
-- Remove a dimensão 'level' (campaign/adset/ad) da chave primária.
-- Uma única config por (project_id, platform) se aplica a todas as tabs.
-- ============================================================================

-- 1. Manter apenas o registro de 'campaign' para cada (project_id, platform)
--    (mais provável de ter sido editado pelo usuário)
DELETE FROM public.project_ad_insights_table_config
WHERE level != 'campaign';

-- 2. Remover constraint de level e alterar PK
ALTER TABLE public.project_ad_insights_table_config
  DROP CONSTRAINT ad_insights_level_check;

ALTER TABLE public.project_ad_insights_table_config
  DROP CONSTRAINT project_ad_insights_table_config_pkey;

ALTER TABLE public.project_ad_insights_table_config
  DROP COLUMN level;

ALTER TABLE public.project_ad_insights_table_config
  ADD PRIMARY KEY (project_id, platform);

-- 3. Atualizar comentário
COMMENT ON TABLE public.project_ad_insights_table_config IS
  'Configuracao de colunas e ordenacao da tabela de campanhas por projeto/plataforma.';
