import { errorResponse } from '../utils/response.ts'
import { handleCreate } from '../handlers/create.ts'
import { handleUpdate } from '../handlers/update.ts'
import { handleGet } from '../handlers/get.ts'
import { handleList } from '../handlers/list.ts'
import { handleDelete } from '../handlers/delete.ts'
import { handleStats } from '../handlers/stats.ts'
import { handleGenerateWhatsApp } from '../handlers/whatsapp.ts'
import { handleRegisterAccess } from '../handlers/access.ts'
import type { SupabaseDbClient } from '../types-db.ts'

export interface DispatchRequestParams {
  req: Request
  routeParts: string[]
  supabaseClient: SupabaseDbClient
}

/**
 * Dispatches request to the correct endpoint handler.
 */
export async function dispatchRequest({
  req,
  routeParts,
  supabaseClient
}: DispatchRequestParams): Promise<Response> {
  if (req.method === 'POST' && routeParts.length === 2 && routeParts[1] === 'generate-whatsapp') {
    return await handleGenerateWhatsApp(req, supabaseClient, routeParts[0])
  }

  if (req.method === 'POST' && routeParts.length === 2 && routeParts[1] === 'register-access') {
    return await handleRegisterAccess(req, supabaseClient, routeParts[0])
  }

  if (req.method === 'POST' && routeParts.length === 0) {
    return await handleCreate(req, supabaseClient)
  }

  if (req.method === 'GET' && routeParts.length === 0) {
    return await handleList(req, supabaseClient)
  }

  if (req.method === 'GET' && routeParts.length === 1) {
    return await handleGet(req, supabaseClient, routeParts[0])
  }

  if (req.method === 'GET' && routeParts.length === 2 && routeParts[1] === 'stats') {
    return await handleStats(req, supabaseClient, routeParts[0])
  }

  if (req.method === 'PATCH' && routeParts.length === 1) {
    return await handleUpdate(req, supabaseClient, routeParts[0])
  }

  if (req.method === 'DELETE' && routeParts.length === 1) {
    return await handleDelete(req, supabaseClient, routeParts[0])
  }

  return errorResponse('Not Found: Invalid endpoint', 404)
}
