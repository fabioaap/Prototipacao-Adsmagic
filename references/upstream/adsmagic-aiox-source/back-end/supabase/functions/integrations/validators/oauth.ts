/**
 * Validators for OAuth requests using Zod
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

export const oauthStartSchema = z.object({
  platform: z.enum(['meta', 'google', 'tiktok']),
})

export const oauthCallbackSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
})

export type OAuthStartInput = z.infer<typeof oauthStartSchema>
export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>

