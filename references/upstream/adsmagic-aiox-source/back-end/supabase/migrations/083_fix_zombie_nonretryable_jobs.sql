-- Fix: zombie jobs marcados 'failed' que eram nonRetryable (deviam ser 'cancelled')
-- Assinatura: status='failed', retry_count=0, completed_at NOT NULL

UPDATE jobs
SET status = 'cancelled',
    retry_count = max_retries
WHERE status = 'failed'
  AND retry_count = 0
  AND completed_at IS NOT NULL;

-- Caso extra: failJob chamado sem completed_at mas com error prefix
UPDATE jobs
SET status = 'cancelled',
    retry_count = max_retries,
    completed_at = NOW()
WHERE status = 'failed'
  AND retry_count = 0
  AND retry_after IS NULL
  AND completed_at IS NULL
  AND error_message LIKE 'Max retries exceeded:%';
