/**
 * UAZAPI types — ported from Deno Edge Function
 */

export interface UazapiWebhookData {
  BaseUrl?: string
  EventType: 'messages' | 'status' | 'connection'
  chat?: {
    id?: string; phone?: string; name?: string; wa_name?: string
    owner?: string; wa_chatid?: string; wa_isGroup?: boolean
    [key: string]: unknown
  }
  message: {
    id?: string; messageid?: string; chatid: string; text?: string
    fromMe: boolean; isGroup?: boolean; groupName?: string
    messageType?: string; type?: string; messageTimestamp?: number
    sender?: string; senderName?: string
    sender_lid?: string; sender_pn?: string; source?: string
    content?: {
      text?: string; mediaUrl?: string; caption?: string
      contextInfo?: {
        conversionSource?: string; conversionData?: string
        conversionDelaySeconds?: number; entryPointConversionSource?: string
        entryPointConversionApp?: string
        externalAdReply?: {
          title?: string; body?: string; mediaType?: number
          thumbnailURL?: string; mediaURL?: string
          sourceType?: string; sourceID?: string; sourceURL?: string
          containsAutoReply?: boolean; renderLargerThumbnail?: boolean
          showAdAttribution?: boolean; ctwaClid?: string
          clickToWhatsappCall?: boolean; adContextPreviewDismissed?: boolean
          sourceApp?: string; automatedGreetingMessageShown?: boolean
          greetingMessageBody?: string; disableNudge?: boolean
          originalImageURL?: string; wtwaAdFormat?: boolean; fbclid?: string
          [key: string]: unknown
        }
        entryPointConversionDelaySeconds?: number
        trustBannerAction?: number; ctwaSignals?: string; ctwaPayload?: string
        [key: string]: unknown
      }
      previewType?: number; inviteLinkGroupTypeV2?: number
      [key: string]: unknown
    }
    buttonOrListid?: string; edited?: string; quoted?: string
    reaction?: string; status?: string; track_id?: string
    track_source?: string; vote?: string; wasSentByApi?: boolean
    [key: string]: unknown
  }
  instanceName?: string
  owner: string
  token: string
}

export interface UazapiProfileResponse {
  wa_name?: string; wa_image?: string; number?: string
  [key: string]: unknown
}

export interface UazapiSendResponse {
  id: string; status: string; timestamp?: number
}
