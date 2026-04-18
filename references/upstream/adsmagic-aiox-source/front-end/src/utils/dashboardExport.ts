/**
 * Dashboard Export Utilities
 * 
 * G5.3: Export Dashboard (PNG/PDF)
 * 
 * Captura o conteúdo do dashboard como imagem PNG usando html2canvas
 */
import html2canvas from 'html2canvas'
import { downloadBlob, generateFilename } from './download'

export interface ExportOptions {
  format?: 'png' | 'jpeg'
  quality?: number
  backgroundColor?: string
  scale?: number
}

/**
 * Captura um elemento HTML e faz download como imagem
 */
export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#ffffff',
    scale = 2 // Alta resolução para melhor qualidade
  } = options

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    logging: false,
    useCORS: true,
    allowTaint: true,
    // Ignora elementos fixos que não fazem parte do conteúdo
    ignoreElements: (el) => {
      return el.classList.contains('app-sidebar') || 
             el.classList.contains('app-header') ||
             el.tagName === 'SCRIPT'
    }
  })

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar imagem'))
          return
        }
        
        const filename = generateFilename('dashboard', format)
        downloadBlob(blob, filename)
        resolve()
      },
      mimeType,
      quality
    )
  })
}

/**
 * Captura o dashboard completo
 * Procura pelo elemento com id="dashboard-content" ou usa o main
 */
export async function exportDashboard(
  elementId: string = 'dashboard-content',
  options: ExportOptions = {}
): Promise<void> {
  const element = document.getElementById(elementId) || document.querySelector('main')
  
  if (!element) {
    throw new Error('Elemento do dashboard não encontrado')
  }

  return exportElementAsImage(element as HTMLElement, options)
}
