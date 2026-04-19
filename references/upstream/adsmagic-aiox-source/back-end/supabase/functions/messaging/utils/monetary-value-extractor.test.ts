import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { extractMonetaryValue } from './monetary-value-extractor.ts'

Deno.test('extracts simple R$ value with comma decimals', () => {
  const result = extractMonetaryValue('R$240,00 no pix')
  assertEquals(result?.value, 240)
  assertEquals(result?.currency, 'BRL')
})

Deno.test('extracts R$ with thousand separator and decimals', () => {
  const result = extractMonetaryValue('Total: R$ 1.240,50')
  assertEquals(result?.value, 1240.5)
})

Deno.test('extracts R$ with space and integer value', () => {
  const result = extractMonetaryValue('Valor: R$ 240')
  assertEquals(result?.value, 240)
})

Deno.test('extracts en-US dot decimals after R$', () => {
  const result = extractMonetaryValue('R$ 1240.50')
  assertEquals(result?.value, 1240.5)
})

Deno.test('extracts BRL prefix', () => {
  const result = extractMonetaryValue('Cobrei BRL 500 hoje')
  assertEquals(result?.value, 500)
})

Deno.test('extracts "X reais" suffix', () => {
  const result = extractMonetaryValue('paguei 240 reais ontem')
  assertEquals(result?.value, 240)
})

Deno.test('returns largest value when multiple matches', () => {
  const result = extractMonetaryValue('Sinal R$100, total R$240')
  assertEquals(result?.value, 240)
})

Deno.test('returns null when no monetary token present', () => {
  const result = extractMonetaryValue('higienização de sofa 2 lugares retrátil')
  assertEquals(result, null)
})

Deno.test('returns null for empty string', () => {
  assertEquals(extractMonetaryValue(''), null)
})

Deno.test('parses real-world WhatsApp confirmation message', () => {
  const message = `Que ótima notícia! 😊 Fico feliz que o agendamento esteja confirmado.

Aqui está o resumo para você guardar:
📅 Data e horário: 12/04 (segundafeira) às 09:00
👤 Cliente: vieira
📍Endereço: rua Anastácio 103 cep 06160265
🛋️ Serviço: higienização de sofa 2lugares retrátil
💳 Valor e forma de pagamento: R$240,00 no pix

Se precisar alterar ou confirmar algo mais, é só entrar em contato!`
  const result = extractMonetaryValue(message)
  assertEquals(result?.value, 240)
  assertEquals(result?.currency, 'BRL')
})
