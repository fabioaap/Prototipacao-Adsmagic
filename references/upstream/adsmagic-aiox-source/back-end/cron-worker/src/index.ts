/**
 * Cloudflare Worker - Job Trigger
 *
 * Triggera o job-worker do Supabase a cada minuto para processar jobs pendentes.
 *
 * Configuração:
 * 1. Deploy: wrangler deploy
 * 2. Configurar secrets: wrangler secret put SERVICE_ROLE_KEY
 *
 * O cron é configurado no wrangler.toml (triggers.crons)
 */

export interface Env {
  SUPABASE_URL: string
  SERVICE_ROLE_KEY: string
  CRON_SECRET?: string
}

export default {
  /**
   * Handler para cron trigger
   * Executado automaticamente pelo Cloudflare Workers a cada minuto
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('[Job Trigger] Cron triggered at', new Date().toISOString())

    try {
      const response = await fetch(
        `${env.SUPABASE_URL}/functions/v1/job-worker`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            maxJobsPerRun: 10,
            queueNames: ['conversion_events', 'analytics', 'webhooks', 'integrations']
          })
        }
      )

      const result = await response.json()

      console.log('[Job Trigger] Job worker response', {
        status: response.status,
        processed: result.processed,
        success: result.success
      })

      if (!response.ok) {
        console.error('[Job Trigger] Job worker error', result)
      }

    } catch (error) {
      console.error('[Job Trigger] Failed to trigger job worker', error)
    }
  },

  /**
   * Handler para HTTP requests (para testes manuais)
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url)

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Manual trigger (com autenticação)
    if (url.pathname === '/trigger' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization')
      const expectedToken = env.CRON_SECRET || env.SERVICE_ROLE_KEY

      if (!authHeader?.includes(expectedToken)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Simular scheduled event
      await this.scheduled(
        { scheduledTime: Date.now(), cron: '* * * * *' } as ScheduledEvent,
        env,
        ctx
      )

      return new Response(JSON.stringify({
        message: 'Job worker triggered',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stats do job worker
    if (url.pathname === '/stats') {
      try {
        const response = await fetch(
          `${env.SUPABASE_URL}/functions/v1/job-worker/stats`,
          {
            headers: {
              'Authorization': `Bearer ${env.SERVICE_ROLE_KEY}`
            }
          }
        )

        const stats = await response.json()

        return new Response(JSON.stringify(stats), {
          headers: { 'Content-Type': 'application/json' }
        })

      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Failed to get stats',
          message: error instanceof Error ? error.message : 'Unknown error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({
      message: 'AdsMagic Job Trigger',
      endpoints: {
        '/health': 'Health check',
        '/trigger': 'Manual trigger (POST, requires auth)',
        '/stats': 'Job worker stats'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
