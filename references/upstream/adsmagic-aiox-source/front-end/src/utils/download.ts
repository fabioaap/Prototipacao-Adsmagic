/**
 * Utilitários para download de arquivos
 * 
 * Funções auxiliares para fazer download de blobs como arquivos.
 */

/**
 * Faz download de um Blob como arquivo
 * 
 * @param blob - O blob para download
 * @param filename - Nome do arquivo (incluindo extensão)
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Gera um nome de arquivo com timestamp
 * 
 * @param prefix - Prefixo do arquivo (ex: 'contatos', 'vendas')
 * @param extension - Extensão do arquivo (ex: 'csv', 'pdf')
 * @returns Nome do arquivo formatado
 */
export function generateFilename(prefix: string, extension: string): string {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  return `${prefix}_${timestamp}.${extension}`
}

/**
 * Converte array de objetos para CSV
 * 
 * @param data - Array de objetos
 * @param headers - Mapeamento de chaves para headers (opcional)
 * @returns String CSV
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (data.length === 0) return ''

  const keys = Object.keys(data[0]!) as (keyof T)[]
  
  // Gerar linha de headers
  const headerLine = keys
    .map(key => headers?.[key] || String(key))
    .map(h => `"${String(h).replace(/"/g, '""')}"`)
    .join(',')

  // Gerar linhas de dados
  const dataLines = data.map(row =>
    keys
      .map(key => {
        const value = row[key]
        const strValue = value === null || value === undefined ? '' : String(value)
        return `"${strValue.replace(/"/g, '""')}"`
      })
      .join(',')
  )

  return [headerLine, ...dataLines].join('\n')
}

/**
 * Cria um Blob CSV com BOM para Excel
 * 
 * @param csvContent - Conteúdo CSV como string
 * @returns Blob pronto para download
 */
export function createCSVBlob(csvContent: string): Blob {
  // Adiciona BOM para compatibilidade com Excel
  return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
}
