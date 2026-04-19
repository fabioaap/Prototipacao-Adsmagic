-- Previne criação de origens project-scoped duplicando nomes reservados ao sistema.
--
-- Contexto: origens do sistema (project_id IS NULL, type = 'system') são seeded
-- em 053_seed_system_stages_and_origins.sql. Um bug em FunnelMessageMatcherService
-- criou origens custom "WhatsApp" em 6 projetos, duplicando a do sistema. O fix
-- no código já foi aplicado; este índice é a salvaguarda para regressões futuras.
--
-- O índice único parcial garante que, dentro de um mesmo projeto, não pode haver
-- mais de uma linha com um nome reservado. Combinado com o helper
-- `findOrCreateSystemOrProjectOrigin` (que prioriza a origem do sistema), fica
-- impossível inserir custom com esses nomes.

CREATE UNIQUE INDEX IF NOT EXISTS uq_origins_project_system_name
  ON origins (project_id, name)
  WHERE project_id IS NOT NULL
    AND name IN ('WhatsApp', 'Meta Ads', 'Google Ads', 'TikTok Ads', 'Orgânico', 'Direto');
