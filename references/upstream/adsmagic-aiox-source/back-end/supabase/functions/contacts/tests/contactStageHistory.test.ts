import {
  assert,
  assertEquals,
  assertRejects
} from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { insertContactStageHistory } from '../services/contactStageHistory.ts'
import type { SupabaseDbClient } from '../types-db.ts'

interface StageHistoryInsertPayload {
  contact_id: string
  stage_id: string
  moved_by: string
  moved_at: string
}

Deno.test('insertContactStageHistory - insere payload esperado com moved_at e moved_by', async () => {
  let insertedPayload: StageHistoryInsertPayload | undefined

  const supabaseClient = {
    from(table: string) {
      assertEquals(table, 'contact_stage_history')

      return {
        insert(payload: StageHistoryInsertPayload) {
          insertedPayload = payload
          return Promise.resolve({ error: null })
        }
      }
    }
  } as unknown as SupabaseDbClient

  await insertContactStageHistory(supabaseClient, {
    contactId: 'contact-1',
    stageId: 'stage-1',
    movedBy: 'user:test'
  })

  assert(insertedPayload !== undefined)
  const payload = insertedPayload as StageHistoryInsertPayload

  assertEquals(payload.contact_id, 'contact-1')
  assertEquals(payload.stage_id, 'stage-1')
  assertEquals(payload.moved_by, 'user:test')
  assert(typeof payload.moved_at === 'string')
})

Deno.test('insertContactStageHistory - lança erro quando insert falha', async () => {
  const supabaseClient = {
    from() {
      return {
        insert() {
          return Promise.resolve({
            error: {
              message: 'write failed'
            }
          })
        }
      }
    }
  } as unknown as SupabaseDbClient

  await assertRejects(
    () => insertContactStageHistory(supabaseClient, {
      contactId: 'contact-1',
      stageId: 'stage-1',
      movedBy: 'user:test'
    }),
    Error,
    'Failed to insert contact stage history: write failed'
  )
})
