-- Requeue de eventos Google cancelados por falta de Enhanced Leads.
-- Uso:
-- 1) Garanta que a conta Google Ads já esteja com enhanced conversions for leads habilitado.
-- 2) Atualize o metadata da conta via endpoint de conversion actions (refresh da capability).
-- 3) Execute este script ajustando filtros de project_id/data/ids.

-- Preview (NÃO altera dados):
SELECT
  id,
  project_id,
  contact_id,
  created_at,
  status,
  error_message,
  response->>'error_code' AS error_code
FROM conversion_events
WHERE platform = 'google'
  AND status = 'cancelled'
  AND (
    response->>'error_code' = 'GOOGLE_ENHANCED_LEADS_REQUIRED'
    OR error_message ILIKE '%enhanced conversions for leads%'
  )
ORDER BY created_at DESC;

-- Requeue:
-- Substitua PROJECT_ID_AQUI por um UUID válido do projeto, ou remova o filtro para múltiplos projetos.
UPDATE conversion_events
SET
  status = 'pending',
  error_message = NULL,
  response = NULL,
  processed_at = NULL,
  sent_at = NULL,
  last_retry_at = NULL
WHERE platform = 'google'
  AND status = 'cancelled'
  AND project_id = 'PROJECT_ID_AQUI'
  AND (
    response->>'error_code' = 'GOOGLE_ENHANCED_LEADS_REQUIRED'
    OR error_message ILIKE '%enhanced conversions for leads%'
  );
