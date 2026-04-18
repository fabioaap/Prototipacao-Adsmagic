/**
 * Feature flags e configurações da aplicação
 * Controla comportamentos baseados em ambiente
 */
export const FEATURES = {
  // Modos de desenvolvimento
  USE_MOCK_API: false, // ✅ Migrado para API real
  USE_MOCK_QUEUE: import.meta.env.VITE_USE_MOCK_QUEUE === 'true',
  USE_SUPABASE: true, // ✅ Habilitar Supabase

  // Job polling
  ENABLE_JOB_POLLING: import.meta.env.VITE_ENABLE_JOB_POLLING !== 'false',
  JOB_POLLING_INTERVAL: Number(import.meta.env.VITE_JOB_POLLING_INTERVAL) || 3000,
} as const
