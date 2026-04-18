/**
 * Camada de Envio
 * 
 * Gerencia envio de mensagens através dos brokers
 */

import type { IWhatsAppBroker, NormalizedMessage, SendMessageResult, MessagingAccount } from '../types.ts'
import { WhatsAppBrokerFactory } from '../brokers/WhatsAppBrokerFactory.ts'

export class WhatsAppSender {
  /**
   * Envia mensagem através do broker da conta
   */
  async sendMessage(
    account: MessagingAccount,
    message: NormalizedMessage
  ): Promise<SendMessageResult> {
    try {
      // 1. Cria broker específico
      const broker = WhatsAppBrokerFactory.create(
        account.broker_type,
        {
          ...account.broker_config,
          accountName: account.account_name,
          apiKey: account.api_key || undefined,
          accessToken: account.access_token || undefined,
        },
        account.id
      )
      
      // 2. Converte mensagem normalizada para formato do broker
      const brokerParams = this.convertToBrokerFormat(message)
      
      // 3. Envia através do broker
      const result = await broker.sendTextMessage(brokerParams)
      
      return result
    } catch (error) {
      console.error('[WhatsAppSender] Error sending message:', error)
      throw error
    }
  }
  
  /**
   * Converte mensagem normalizada para formato específico do broker
   */
  private convertToBrokerFormat(message: NormalizedMessage) {
    return {
      to: message.to.phoneNumber,
      text: message.content.text || '',
      context: message.context,
    }
  }
}
