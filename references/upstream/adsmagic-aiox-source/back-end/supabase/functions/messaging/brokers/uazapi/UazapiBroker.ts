/**
 * Broker não oficial: UAZAPI
 * https://uazapi.com
 */

import { BaseWhatsAppBroker } from '../base/WhatsAppBroker.ts'
import type {
  BrokerConfig,
  SendTextParams,
  SendMediaParams,
  SendMessageResult,
  NormalizedWebhookData,
  NormalizedMessage,
  ConnectionStatus,
  AccountInfo,
} from '../../types.ts'
import type { 
  UazapiWebhookData, 
  UazapiSendResponse,
  UazapiQRCodeResponse,
  UazapiPairCodeResponse,
  UazapiInstanceStatus,
  UazapiInitInstanceResponse,
  UazapiConnectResponse,
  UazapiProfileResponse,
} from './types.ts'
import { QR_CODE_TIMEOUT_MS, PAIR_CODE_TIMEOUT_MS, DEFAULT_UAZAPI_URL } from '../../constants/connection.ts'
import { 
  normalizeWebhookIdentifier, 
  generateCanonicalIdentifier,
  extractPhoneNumber,
  type WebhookContactIdentifierData 
} from '../../utils/identifier-normalizer.ts'
import { decodeWhatsAppProtocol } from '../../../_shared/whatsapp-protocol.ts'

export class UazapiBroker extends BaseWhatsAppBroker {
  readonly brokerId = 'uazapi'
  readonly brokerName = 'UAZAPI'
  readonly brokerType = 'unofficial' as const
  
  private readonly apiUrl: string
  private readonly apiKey: string
  private readonly accessToken: string // Token da instância (para conectar)
  private readonly instanceId: string
  
  constructor(config: BrokerConfig, accountId: string) {
    super(config, accountId)
    // URL base padrão: usar constante centralizada
    this.apiUrl = (config.apiBaseUrl as string) || DEFAULT_UAZAPI_URL
    this.apiKey = (config.apiKey as string) || ''
    this.accessToken = (config.accessToken as string) || '' // Token da instância
    this.instanceId = (config.instanceId as string) || ''
    
    // apiKey e instanceId podem ser vazios apenas para criar nova instância
    // Se não estiver criando instância, apiKey ou accessToken é necessário
  }
  
  /**
   * Retorna headers padrão para requisições UAZAPI
   * 
   * @param includeAuth - Se true, inclui header Authorization com apiKey
   * @returns Headers padrão para requisições
   */
  private getDefaultHeaders(includeAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth && this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }
    
    return headers
  }
  
  /**
   * Retorna headers para requisições de conexão
   * 
   * Usa o token da instância no header 'token' conforme documentação UAZAPI
   * 
   * @returns Headers para conexão
   */
  private getConnectionHeaders(): Record<string, string> {
    const instanceToken = this.apiKey || this.accessToken
    
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': instanceToken, // Header 'token' conforme documentação UAZAPI
    }
  }
  
  async sendTextMessage(params: SendTextParams): Promise<SendMessageResult> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/send-text`,
        {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: {
            instance: this.instanceId,
            number: params.to,
            text: params.text,
          },
        }
      ) as UazapiSendResponse
      
      return {
        messageId: response.id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[UazapiBroker] Error sending text message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async sendMediaMessage(params: SendMediaParams): Promise<SendMessageResult> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/send-media`,
        {
          method: 'POST',
          headers: this.getDefaultHeaders(),
          body: {
            instance: this.instanceId,
            number: params.to,
            mediaUrl: params.mediaUrl,
            type: params.type,
            caption: params.caption,
            fileName: params.fileName,
          },
        }
      ) as UazapiSendResponse
      
      return {
        messageId: response.id,
        status: 'sent',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('[UazapiBroker] Error sending media message:', error)
      return {
        messageId: '',
        status: 'failed',
        timestamp: new Date(),
        error: this.handleError(error).message,
      }
    }
  }
  
  async normalizeWebhookData(rawData: unknown): Promise<NormalizedWebhookData> {
    // Validar e extrair dados do webhook
    const data = this.validateWebhookData(rawData)
    const message = data.message
    
    // Extrair informações em paralelo quando possível
    const [contactInfo, protocolInfo, conversionData] = await Promise.all([
      this.extractContactInfo(message, data.token),
      Promise.resolve(this.extractProtocolInfo(message)),
      Promise.resolve(this.extractConversionData(message.content?.contextInfo as {
        conversionSource?: string
        externalAdReply?: {
          title?: string
          body?: string
          sourceType?: string
          sourceID?: string
          sourceURL?: string
          sourceApp?: string
          ctwaClid?: string
          fbclid?: string
          [key: string]: unknown
        }
      })),
    ])
    
    // Construir mensagem normalizada
    const normalizedMessage = this.buildNormalizedMessage({
      message,
      contactInfo,
      protocolInfo,
      conversionData,
      data,
    })
    
    // Mapear tipo de evento
    const eventType = this.mapEventType(data.EventType)
    
    return {
      eventType,
      message: normalizedMessage,
      timestamp: new Date(),
      rawData: data,
    }
  }
  
  /**
   * Valida estrutura do webhook UAZAPI
   * @throws Error se dados inválidos
   */
  private validateWebhookData(rawData: unknown): UazapiWebhookData {
    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid webhook data: expected object')
    }
    
    const data = rawData as UazapiWebhookData
    
    if (!data.message || !data.message.chatid) {
      throw new Error('Invalid webhook data: missing required fields (message.chatid)')
    }
    
    return data
  }
  
  /**
   * Extrai informações do contato (telefone, nome, JID, LID)
   * Busca nome via API se mensagem foi enviada por nós
   * Usa normalizador para extrair JID, LID e canonicalIdentifier
   */
  private async extractContactInfo(
    message: UazapiWebhookData['message'],
    instanceToken?: string
  ): Promise<{ 
    phoneNumber: string
    name: string
    jid?: string
    lid?: string
    canonicalIdentifier?: string
  }> {
    // Preparar dados do webhook para normalização
    const webhookData: WebhookContactIdentifierData = {
      chatid: message.chatid,
      sender_lid: message.sender_lid,
      sender_pn: message.sender_pn,
    }
    
    // Normalizar identificadores usando o normalizador
    const normalized = normalizeWebhookIdentifier(webhookData)
    const canonicalId = generateCanonicalIdentifier(normalized)
    
    // Sempre manter o número completo (DDI + número nacional) para evitar
    // perda de informação em normalizações subsequentes.
    const preferredIdentifier =
      message.chatid?.includes('@g.us') ? (message.sender_pn || message.chatid) : message.chatid

    let phoneNumber = ''
    if (preferredIdentifier) {
      try {
        const parsed = extractPhoneNumber(preferredIdentifier)
        phoneNumber = `${parsed.countryCode}${parsed.phone}`
      } catch {
        // fallback abaixo
      }
    }

    if (!phoneNumber && normalized.normalizedPhone) {
      phoneNumber = `${normalized.normalizedPhone.countryCode}${normalized.normalizedPhone.phone}`
    }

    if (!phoneNumber) {
      phoneNumber = message.chatid
        .replace('@s.whatsapp.net', '')
        .replace('@c.us', '')
    }
    
    let name = message.senderName || ''
    
    // Se mensagem foi enviada por nós, buscar nome via API externa
    if (message.fromMe && instanceToken) {
      try {
        const apiResponse = await this.fetchProfileName(instanceToken, phoneNumber)
        name = apiResponse?.wa_name || 'Nao consta'
      } catch (error) {
        console.error('[UazapiBroker] Error fetching profile name:', error)
        name = 'Nao consta'
      }
    }
    
    return { 
      phoneNumber, 
      name,
      jid: normalized.originalJid,
      lid: normalized.originalLid,
      canonicalIdentifier: canonicalId,
    }
  }
  
  /**
   * Extrai protocolo invisível da mensagem
   * Retorna protocolo extraído e flag indicando se há protocolo
   */
  private extractProtocolInfo(
    message: UazapiWebhookData['message']
  ): { protocolNumber: string; isProtocol: boolean } {
    const messageBody = message.text || message.content?.text || ''
    const captionBody = message.content?.caption || ''
    const protocolNumber =
      decodeWhatsAppProtocol(messageBody) ||
      decodeWhatsAppProtocol(captionBody) ||
      ''
    const isProtocol = protocolNumber.length > 0
    
    return { protocolNumber, isProtocol }
  }
  
  /**
   * Extrai dados de conversão (origem de campanha)
   * Inclui conversionSource e externalAdReply com todos os campos de origem
   */
  private extractConversionData(
    contextInfo?: {
      conversionSource?: string
      externalAdReply?: {
        title?: string
        body?: string
        sourceType?: string
        sourceID?: string
        sourceURL?: string
        sourceApp?: string
        ctwaClid?: string
        fbclid?: string
        [key: string]: unknown
      }
    }
  ): {
    conversionSource: string
    externalAdReply?: {
      title?: string
      body?: string
      sourceType?: string
      sourceID?: string
      sourceURL?: string
      sourceApp?: string
      ctwaClid?: string
      fbclid?: string
      [key: string]: unknown
    }
  } {
    const conversionSource = contextInfo?.conversionSource || ''
    const externalAdReply = contextInfo?.externalAdReply
    
    return {
      conversionSource,
      externalAdReply: externalAdReply ? {
        title: externalAdReply.title,
        body: externalAdReply.body,
        sourceType: externalAdReply.sourceType,
        sourceID: externalAdReply.sourceID,
        sourceURL: externalAdReply.sourceURL,
        sourceApp: externalAdReply.sourceApp,
        ctwaClid: externalAdReply.ctwaClid,
        fbclid: externalAdReply.fbclid,
        // Preservar outros campos desconhecidos
        ...(Object.keys(externalAdReply).reduce((acc, key) => {
          if (!['title', 'body', 'sourceType', 'sourceID', 'sourceURL', 'sourceApp', 'ctwaClid', 'fbclid'].includes(key)) {
            acc[key] = externalAdReply[key]
          }
          return acc
        }, {} as Record<string, unknown>)),
      } : undefined,
    }
  }
  
  /**
   * Constrói mensagem normalizada a partir dos dados extraídos
   */
  private buildNormalizedMessage(params: {
    message: UazapiWebhookData['message']
    contactInfo: { 
      phoneNumber: string
      name: string
      jid?: string
      lid?: string
      canonicalIdentifier?: string
    }
    protocolInfo: { protocolNumber: string; isProtocol: boolean }
    conversionData: {
      conversionSource: string
      externalAdReply?: {
        title?: string
        body?: string
        sourceType?: string
        sourceID?: string
        sourceURL?: string
        sourceApp?: string
        ctwaClid?: string
        fbclid?: string
        [key: string]: unknown
      }
    }
    data: UazapiWebhookData
  }): NormalizedMessage {
    const { message, contactInfo, protocolInfo, conversionData, data } = params
    const messageBody = message.text || message.content?.text || ''
    const messageType = this.mapMessageType(message.messageType || message.type || 'text')
    
    return {
      messageId: message.id || message.messageid || '',
      externalMessageId: message.id || message.messageid || '',
      brokerId: this.brokerId,
      accountId: this.accountId,
      from: {
        phoneNumber: contactInfo.phoneNumber,
        name: contactInfo.name,
        jid: contactInfo.jid,
        lid: contactInfo.lid,
        canonicalIdentifier: contactInfo.canonicalIdentifier,
      },
      to: {
        phoneNumber: data.owner || '',
        accountName: this.config.accountName,
      },
      content: {
        type: messageType,
        text: messageBody,
        mediaUrl: message.content?.mediaUrl,
        caption: message.content?.caption,
      },
      timestamp: new Date(message.messageTimestamp || Date.now()),
      status: 'delivered',
      isGroup: message.isGroup === true,
      groupId: message.isGroup ? message.chatid : undefined,
      groupName: message.groupName,
      context: {
        metadata: {
          conversionSource: conversionData.conversionSource,
          isProtocol: protocolInfo.isProtocol,
          protocolNumber: protocolInfo.protocolNumber,
          messageDevice: message.source,
          owner: data.owner,
          instanceToken: data.token,
          // Manter externalAdReply completo para compatibilidade
          externalAdReply: conversionData.externalAdReply,
          
          // ✅ FASE 7: Campos de origem individuais para extração facilitada
          // Click IDs
          ctwaClid: conversionData.externalAdReply?.ctwaClid,
          fbclid: conversionData.externalAdReply?.fbclid, // Se disponível
          
          // Metadados de origem
          sourceType: conversionData.externalAdReply?.sourceType,
          sourceID: conversionData.externalAdReply?.sourceID,
          sourceApp: conversionData.externalAdReply?.sourceApp,
          sourceURL: conversionData.externalAdReply?.sourceURL,
          
          // Parâmetros UTM (mapeados para facilitar extração)
          utm_source: conversionData.externalAdReply?.sourceApp || 
                     (conversionData.externalAdReply ? 'facebook' : undefined), // Fallback para Meta Ads
          utm_medium: conversionData.externalAdReply?.sourceType === 'ad' 
                     ? 'paid_social' 
                     : undefined,
          utm_campaign: conversionData.externalAdReply?.sourceID,
        },
      },
    }
  }
  
  /**
   * Mapeia tipo de evento UAZAPI para tipo normalizado
   */
  private mapEventType(eventType: string): 'message' | 'status' | 'delivery' | 'read' | 'connection' {
    switch (eventType) {
      case 'messages':
        return 'message'
      case 'status':
        return 'status'
      case 'connection':
        return 'connection'
      default:
        return 'message' // Default para mensagem
    }
  }
  
  /**
   * Busca nome e imagem do perfil via API UAZAPI
   * Endpoint: POST /chat/GetNameAndImageURL
   * 
   * @param instanceToken - Token da instância UAZAPI
   * @param contactPhone - Número do contato (sem @s.whatsapp.net)
   * @returns Dados do perfil ou null em caso de erro
   */
  private async fetchProfileName(
    instanceToken: string,
    contactPhone: string
  ): Promise<UazapiProfileResponse | null> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/chat/GetNameAndImageURL`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': instanceToken, // Header 'token' conforme documentação UAZAPI
          },
          body: {
            number: contactPhone,
            preview: true,
          },
        }
      ) as UazapiProfileResponse
      
      return response
    } catch (error) {
      console.error('[UazapiBroker] Error fetching profile:', {
        error: this.handleError(error).message,
        token: instanceToken.substring(0, 10) + '...', // Log parcial do token
        phone: contactPhone,
      })
      return null
    }
  }
  
  /**
   * Mapeia tipo de mensagem UAZAPI para tipo normalizado
   */
  private mapMessageType(uazapiType: string): NormalizedMessage['content']['type'] {
    const mapping: Record<string, NormalizedMessage['content']['type']> = {
      'ExtendedTextMessage': 'text',
      'ImageMessage': 'image',
      'VideoMessage': 'video',
      'AudioMessage': 'audio',
      'DocumentMessage': 'document',
      'LocationMessage': 'location',
      'ContactMessage': 'contact',
      'text': 'text',
      'image': 'image',
      'video': 'video',
      'audio': 'audio',
      'document': 'document',
      'location': 'location',
      'contact': 'contact',
    }
    
    return mapping[uazapiType] || 'text'
  }
  
  /**
   * Cria uma nova instância UAZAPI
   * Documentação: https://docs.uazapi.com/
   * Endpoint: POST /instance/init
   */
  async createInstance(params: {
    name: string
    adminToken: string
    systemName?: string
    adminField01?: string
    adminField02?: string
  }): Promise<{ 
    instanceId: string
    instanceName: string
    token?: string
    apikey?: string
    status?: string
    instanceData?: unknown
  }> {
    try {
      const response = await this.makeRequest(
        `${this.apiUrl}/instance/init`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'admintoken': params.adminToken, // Header correto da UAZAPI
          },
          body: {
            name: params.name,
            systemName: params.systemName || 'apilocal',
            adminField01: params.adminField01,
            adminField02: params.adminField02,
          },
        }
      ) as UazapiInitInstanceResponse
      
      // Extrair informações da resposta real da API
      const instanceId = response.instance?.id || response.instance?.instanceName || response.instance?.name || params.name
      const instanceName = response.instance?.instanceName || response.instance?.name || response.name || params.name
      // Priorizar token/apikey do instance, depois do response raiz
      const token = response.instance?.token || response.token
      const apikey = response.instance?.apikey || response.apikey
      const status = response.instance?.status || (response.connected ? 'connected' : 'disconnected')
      
      return {
        instanceId,
        instanceName,
        token,
        apikey,
        status,
        instanceData: response.instance || response, // Salvar dados completos
      }
    } catch (error) {
      console.error('[UazapiBroker] Error creating instance:', error)
      throw new Error(`Falha ao criar instância: ${this.handleError(error).message}`)
    }
  }
  
  /**
   * Conecta instância ao WhatsApp (gera QR Code ou Pair Code)
   * Documentação: https://docs.uazapi.com/
   * Endpoint: POST /instance/connect
   * 
   * - Sem phone: gera QR Code (timeout 2 minutos)
   * - Com phone: gera Pair Code (timeout 5 minutos)
   * - Requer token de autenticação da instância
   */
  async generateQRCode(phone?: string): Promise<{ 
    qrCode?: string
    code?: string // Pair Code
    expiresAt: Date
    instanceId: string
    type: 'qrcode' | 'paircode'
  }> {
    try {
      // Para UAZAPI, o token da instância está no apiKey (campo principal)
      // Priorizar apiKey sobre accessToken
      const instanceToken = this.apiKey || this.accessToken
      if (!instanceToken) {
        throw new Error('Token de autenticação da instância é obrigatório para conectar. Para UAZAPI, o token deve estar no campo api_key.')
      }
      
      if (!this.instanceId) {
        throw new Error('ID da instância é obrigatório para conectar')
      }
      
      // Endpoint: POST /instance/connect
      // Autenticação: token da instância no header 'token'
      // CORRETO: UAZAPI usa header 'token' (não 'apikey' e não precisa de instanceId na URL)
      const headers = this.getConnectionHeaders()
      
      // Body: phone opcional (se não passar, gera QR Code; se passar, gera Pair Code)
      // NÃO enviar instanceId no body - a UAZAPI não espera esse campo
      const body: Record<string, unknown> = {}
      if (phone) {
        body.phone = phone
      }
      
      // CORRETO: UAZAPI usa POST /instance/connect (SEM instanceId na URL)
      // O token da instância é identificado pelo header 'token'
      const response = await this.makeRequest(
        `${this.apiUrl}/instance/connect`,
        {
          method: 'POST',
          headers,
          body: Object.keys(body).length > 0 ? body : undefined,
        }
      ) as UazapiConnectResponse
      
      // Extrair dados da resposta
      // A resposta pode ter instance.qrcode (string direta) ou qrcode.base64
      const instanceData = response.instance || {}
      
      // Se phone foi passado, retorna Pair Code (timeout 5 minutos)
      if (phone) {
        const pairCode = instanceData.paircode || 
                        response.code || 
                        response.qrcode?.code || 
                        ''
        
        if (!pairCode) {
          throw new Error('Código de pareamento não foi retornado pela API')
        }
        
        // Pair Code expira em 5 minutos conforme documentação
        const expiresAt = new Date(Date.now() + PAIR_CODE_TIMEOUT_MS)
        
        return {
          code: pairCode,
          expiresAt,
          instanceId: this.instanceId,
          type: 'paircode',
        }
      }
      
      // Sem phone, retorna QR Code (timeout 2 minutos)
      // A UAZAPI retorna o QR Code em instance.qrcode como string direta (data:image/png;base64,...)
      const qrCodeBase64 = (instanceData.qrcode as string) || // Formato real: string direta em instance.qrcode
                          response.qrcode?.base64 || 
                          response.qrcode?.qr || 
                          response.base64 || 
                          response.qr || 
                          ''
      
      if (!qrCodeBase64) {
        throw new Error('QR Code não foi retornado pela API')
      }
      
      // QR Code expira em 2 minutos conforme documentação UAZAPI
      const expiresAt = new Date(Date.now() + QR_CODE_TIMEOUT_MS)
      
      return {
        qrCode: qrCodeBase64,
        expiresAt,
        instanceId: this.instanceId,
        type: 'qrcode',
      }
    } catch (error) {
      console.error('[UazapiBroker] Error generating QR Code/Pair Code:', error)
      throw new Error(`Falha ao conectar instância: ${this.handleError(error).message}`)
    }
  }
  
  /**
   * Gera Pair Code para conexão da instância
   * Alternativa ao QR Code - usuário insere código manualmente
   * 
   * NOTA: Conforme documentação UAZAPI, o Pair Code é gerado quando
   * phone é passado no POST /instance/connect. Este método é mantido
   * para compatibilidade, mas usa o mesmo endpoint.
   */
  async generatePairCode(phone?: string): Promise<{ code: string; expiresAt: Date; instanceId: string }> {
    try {
      // Usar o mesmo endpoint POST /instance/connect com phone no body
      // Isso gera Pair Code conforme documentação
      const result = await this.generateQRCode(phone)
      
      if (!result.code) {
        throw new Error('Pair Code não foi retornado pela API')
      }
      
      return {
        code: result.code,
        expiresAt: result.expiresAt,
        instanceId: result.instanceId,
      }
    } catch (error) {
      console.error('[UazapiBroker] Error generating Pair Code:', error)
      throw new Error(`Falha ao gerar Pair Code: ${this.handleError(error).message}`)
    }
  }
  
  /**
   * Tenta obter status de conexão via endpoint /instance/info como fallback
   * Segue SRP: responsabilidade única de verificar conexão via fallback
   * Segue DRY: reutiliza isInstanceConnectedFromInfo para evitar duplicação
   * 
   * @returns ConnectionStatus se conseguir determinar, null caso contrário
   */
  private async tryGetConnectionStatusViaInfoFallback(): Promise<ConnectionStatus | null> {
    try {
      const infoResponse = await this.makeRequest(
        `${this.apiUrl}/instance/info/${this.instanceId}`,
        {
          method: 'GET',
          headers: this.getConnectionHeaders(),
        }
      ) as UazapiInstanceStatus & { number?: string; name?: string }
      
      if (this.isInstanceConnectedFromInfo(infoResponse)) {
        console.log('[UazapiBroker] Instância conectada detectada via /instance/info fallback')
        return {
          connected: true,
          lastConnectedAt: new Date(),
          error: undefined,
        }
      }
      
      return null
    } catch (fallbackError) {
      console.warn('[UazapiBroker] Fallback /instance/info também falhou:', this.handleError(fallbackError).message)
      return null
    }
  }

  /**
   * Verifica se o erro é um 404 (Not Found)
   * Segue SRP: responsabilidade única de verificar tipo de erro
   */
  private is404Error(errorMessage: string): boolean {
    return errorMessage.includes('404') || errorMessage.includes('Not Found')
  }

  /**
   * Determina se um status textual da UAZAPI representa conexão ativa.
   */
  private isConnectedStatus(status?: string): boolean {
    if (!status) return false
    const normalizedStatus = status.toLowerCase()
    return normalizedStatus === 'connected' || normalizedStatus === 'open' || normalizedStatus === 'active'
  }

  /**
   * Resolve o status de conexão a partir de múltiplas formas de payload.
   * Prioridade: status raiz > instance.status.
   */
  private resolveConnectionStatusValue(response: UazapiInstanceStatus): string | undefined {
    if (typeof response.status === 'string' && response.status.length > 0) {
      return response.status
    }

    if (typeof response.instance?.status === 'string' && response.instance.status.length > 0) {
      return response.instance.status
    }

    return undefined
  }

  /**
   * Busca status da instância tentando primeiro o endpoint documentado pela UAZAPI
   * (sem instanceId na URL), com fallback para o formato antigo com instanceId.
   */
  private async fetchInstanceStatus(): Promise<UazapiInstanceStatus> {
    const headers = this.getConnectionHeaders()

    try {
      // Endpoint documentado: GET /instance/status
      return await this.makeRequest(
        `${this.apiUrl}/instance/status`,
        {
          method: 'GET',
          headers,
        }
      ) as UazapiInstanceStatus
    } catch (error) {
      const errorMessage = this.handleError(error).message
      console.warn('[UazapiBroker] /instance/status falhou, tentando /instance/status/:instanceId', {
        instanceId: this.instanceId,
        error: errorMessage,
      })

      // Compatibilidade retroativa
      return await this.makeRequest(
        `${this.apiUrl}/instance/status/${this.instanceId}`,
        {
          method: 'GET',
          headers,
        }
      ) as UazapiInstanceStatus
    }
  }

  /**
   * Sobrescreve getConnectionStatus da classe base para usar método específico do UAZAPI
   * Usa fallback para /instance/info quando /instance/status retorna 404
   * Segue SRP: responsabilidade única de obter status de conexão
   */
  override async getConnectionStatus(): Promise<ConnectionStatus> {
    try {
      const response = await this.fetchInstanceStatus()
      
      const rawStatus = this.resolveConnectionStatusValue(response)
      const isConnected = this.isConnectedStatus(rawStatus) || response.connected === true

      console.log('[UazapiBroker] /instance/status resolved:', {
        instanceId: this.instanceId,
        rawStatus,
        connectedFlag: response.connected === true,
        resolvedConnected: isConnected,
      })

      // Quando a API não retorna status claro, tentar fallback via /instance/info.
      if (!rawStatus && response.connected !== true) {
        const fallbackStatus = await this.tryGetConnectionStatusViaInfoFallback()
        if (fallbackStatus) {
          return fallbackStatus
        }
      }
      
      return {
        connected: isConnected,
        lastConnectedAt: isConnected ? new Date() : undefined,
        error: rawStatus === 'timeout' ? 'Conexão expirada' : undefined,
      }
    } catch (error) {
      const errorMessage = this.handleError(error).message
      
      // Se for 404, tentar usar /instance/info como fallback
      if (this.is404Error(errorMessage)) {
        console.log('[UazapiBroker] /instance/status retornou 404, tentando /instance/info como fallback')
        const fallbackStatus = await this.tryGetConnectionStatusViaInfoFallback()
        
        if (fallbackStatus) {
          return fallbackStatus
        }
      }
      
      console.error('[UazapiBroker] Error getting connection status:', errorMessage)
      return {
        connected: false,
        error: errorMessage,
      }
    }
  }
  
  /**
   * Determina se a instância está conectada baseado na resposta do /instance/info
   * Segue SRP: responsabilidade única de determinar conexão a partir de dados
   */
  private isInstanceConnectedFromInfo(infoResponse: UazapiInstanceStatus & { number?: string }): boolean {
    const rawStatus = this.resolveConnectionStatusValue(infoResponse)
    return !!infoResponse.number || this.isConnectedStatus(rawStatus) || infoResponse.connected === true
  }

  /**
   * Obtém informações da conta/conexão
   * Inclui número de telefone conectado, status, etc.
   * Se tem número de telefone, considera como conectado
   * Segue SRP: responsabilidade única de obter informações da conta
   */
  override async getAccountInfo(): Promise<AccountInfo> {
    try {
      // Endpoint: GET /instance/info/:instanceId
      const statusResponse = await this.makeRequest(
        `${this.apiUrl}/instance/info/${this.instanceId}`,
        {
          method: 'GET',
          headers: this.getConnectionHeaders(),
        }
      ) as UazapiInstanceStatus & { number?: string; name?: string }
      
      const isConnected = this.isInstanceConnectedFromInfo(statusResponse)
      
      return {
        phoneNumber: statusResponse.number || '',
        name: statusResponse.name || this.config.accountName,
        status: isConnected ? 'active' : 'disconnected',
      }
    } catch (error) {
      console.error('[UazapiBroker] Error getting account info:', error)
      
      // Tentar verificar status via getConnectionStatus como fallback
      try {
        const connectionStatus = await this.getConnectionStatus()
        return {
          phoneNumber: '',
          name: this.config.accountName,
          status: connectionStatus.connected ? 'active' : 'disconnected',
        }
      } catch {
        // Se ambos falharem, retornar desconectado
        return {
          phoneNumber: '',
          name: this.config.accountName,
          status: 'disconnected',
        }
      }
    }
  }
  
  /**
   * Desconecta a instância
   */
  async disconnect(): Promise<void> {
    try {
      await this.makeRequest(
        `${this.apiUrl}/instance/logout/${this.instanceId}`,
        {
          method: 'DELETE',
          headers: this.getDefaultHeaders(),
        }
      )
    } catch (error) {
      console.error('[UazapiBroker] Error disconnecting:', error)
      throw new Error(`Falha ao desconectar: ${this.handleError(error).message}`)
    }
  }
}
