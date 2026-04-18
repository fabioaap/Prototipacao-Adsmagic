/**
 * Tipos específicos do broker UAZAPI
 */

/**
 * Formato real do webhook UAZAPI (conforme documentação e payload real)
 */
export interface UazapiWebhookData {
  BaseUrl?: string
  EventType: 'messages' | 'status' | 'connection'
  
  // Dados do chat (opcional)
  chat?: {
    id?: string
    phone?: string
    name?: string
    wa_name?: string
    owner?: string
    wa_chatid?: string
    wa_isGroup?: boolean
    [key: string]: unknown
  }
  
  // Dados da mensagem
  message: {
    id?: string
    messageid?: string
    chatid: string // Formato: "554791662434@s.whatsapp.net"
    text?: string
    fromMe: boolean
    isGroup?: boolean
    groupName?: string
    messageType?: string // "ExtendedTextMessage", "ImageMessage", etc.
    type?: string // "text", "image", etc.
    messageTimestamp?: number
    sender?: string
    senderName?: string
    /** LID (Local ID) - identificador local do WhatsApp no formato: "213709100187796@lid" */
    sender_lid?: string
    /** JID alternativo (Phone Number) */
    sender_pn?: string
    source?: string // "android", "ios", etc.
    content?: {
      text?: string
      mediaUrl?: string
      caption?: string
      contextInfo?: {
        conversionSource?: string // "FB_Ads", "IG_Ads", etc.
        conversionData?: string
        conversionDelaySeconds?: number
        entryPointConversionSource?: string
        entryPointConversionApp?: string
        externalAdReply?: {
          title?: string
          body?: string
          mediaType?: number
          thumbnailURL?: string
          mediaURL?: string
          sourceType?: string
          sourceID?: string
          sourceURL?: string
          containsAutoReply?: boolean
          renderLargerThumbnail?: boolean
          showAdAttribution?: boolean
          ctwaClid?: string
          clickToWhatsappCall?: boolean
          adContextPreviewDismissed?: boolean
          sourceApp?: string
          automatedGreetingMessageShown?: boolean
          greetingMessageBody?: string
          disableNudge?: boolean
          originalImageURL?: string
          wtwaAdFormat?: boolean
          [key: string]: unknown
        }
        entryPointConversionDelaySeconds?: number
        trustBannerAction?: number
        ctwaSignals?: string
        ctwaPayload?: string
        [key: string]: unknown
      }
      previewType?: number
      inviteLinkGroupTypeV2?: number
      [key: string]: unknown
    }
    buttonOrListid?: string
    edited?: string
    quoted?: string
    reaction?: string
    status?: string
    track_id?: string
    track_source?: string
    vote?: string
    wasSentByApi?: boolean
    [key: string]: unknown
  }
  
  // Identificação
  instanceName?: string
  owner: string // Número do dono da conta
  token: string // Token da instância
}

/**
 * Resposta da API UAZAPI para busca de nome e imagem do perfil
 * Endpoint: POST /chat/GetNameAndImageURL
 */
export interface UazapiProfileResponse {
  wa_name?: string
  wa_image?: string
  number?: string
  [key: string]: unknown
}

export interface UazapiSendResponse {
  id: string
  status: string
  timestamp?: number
}

/**
 * Resposta da API UAZAPI para geração de QR Code
 */
export interface UazapiQRCodeResponse {
  qrcode: {
    base64?: string
    code?: string
    qr?: string
  }
  base64?: string
  code?: string
  qr?: string
  number?: string
  instanceId?: string
  status?: 'connected' | 'disconnected' | 'connecting'
  message?: string
}

/**
 * Resposta da API UAZAPI para geração de Pair Code
 */
export interface UazapiPairCodeResponse {
  code: string
  number?: string
  instanceId?: string
  status?: 'connected' | 'disconnected' | 'connecting'
  message?: string
}

/**
 * Status da instância/conexão UAZAPI
 */
export interface UazapiInstanceStatus {
  instanceId?: string
  status?: 'connected' | 'disconnected' | 'connecting' | 'timeout'
  connected?: boolean
  instance?: {
    id?: string
    status?: 'connected' | 'disconnected' | 'connecting' | 'timeout'
  }
  number?: string
  qrcode?: {
    base64?: string
    code?: string
    qr?: string
  }
  message?: string
}

/**
 * Resposta da API UAZAPI para criação de instância
 * Estrutura real baseada na resposta da API
 */
export interface UazapiInitInstanceResponse {
  connected?: boolean
  info?: string
  instance?: {
    id?: string
    instanceName?: string
    name?: string
    token?: string
    apikey?: string
    status?: 'connected' | 'disconnected' | 'connecting'
    paircode?: string
    qrcode?: string
    profileName?: string
    profilePicUrl?: string
    isBusiness?: boolean
    plataform?: string
    systemName?: string
    owner?: string
    current_presence?: string
    lastDisconnect?: string
    lastDisconnectReason?: string
    adminField01?: string
    adminField02?: string
    openai_apikey?: string
    chatbot_enabled?: boolean
    chatbot_ignoreGroups?: boolean
    chatbot_stopConversation?: string
    chatbot_stopMinutes?: number
    chatbot_stopWhenYouSendMsg?: number
    created?: string
    updated?: string
    currentTime?: string
  }
  apikey?: string
  token?: string
  loggedIn?: boolean
  name?: string
  response?: string
  message?: string
  qrcode?: {
    base64?: string
    code?: string
    qr?: string
  }
  base64?: string
  code?: string
  qr?: string
}

/**
 * Resposta da API UAZAPI para conexão (POST /instance/connect)
 * Estrutura real conforme retorno da API
 */
export interface UazapiConnectResponse {
  connected?: boolean
  instance?: {
    id?: string
    token?: string
    status?: 'connected' | 'disconnected' | 'connecting'
    qrcode?: string // QR Code em formato base64 direto (data:image/png;base64,...)
    paircode?: string // Pair Code quando phone é fornecido
    name?: string
    [key: string]: unknown
  }
  qrcode?: {
    base64?: string
    code?: string
    qr?: string
  }
  base64?: string
  code?: string
  qr?: string
  phone?: string
  status?: 'connected' | 'disconnected' | 'connecting'
  message?: string
  loggedIn?: boolean
  jid?: string | null
}
