/**
 * useDevice Composable
 *
 * Detecta informações sobre o dispositivo do usuário:
 * - Tipo de dispositivo (mobile, tablet, desktop)
 * - Sistema operacional
 * - Navegador
 * - Tamanho da tela (responsividade)
 *
 * Útil para:
 * - Adaptar UI para diferentes dispositivos
 * - Coletar metadados de contatos
 * - Analytics e tracking
 *
 * @module composables/useDevice
 */

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import type { ComputedRef } from 'vue'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type OS = 'Windows' | 'Mac' | 'Linux' | 'Android' | 'iOS' | 'Unknown'
export type Browser = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Unknown'

interface UseDeviceReturn {
  /**
   * Tipo de dispositivo
   */
  deviceType: Readonly<ReturnType<typeof ref<DeviceType>>>

  /**
   * Sistema operacional
   */
  os: Readonly<ReturnType<typeof ref<OS>>>

  /**
   * Navegador
   */
  browser: Readonly<ReturnType<typeof ref<Browser>>>

  /**
   * Largura da janela
   */
  windowWidth: Readonly<ReturnType<typeof ref<number>>>

  /**
   * Altura da janela
   */
  windowHeight: Readonly<ReturnType<typeof ref<number>>>

  /**
   * É mobile?
   */
  isMobile: ComputedRef<boolean>

  /**
   * É tablet?
   */
  isTablet: ComputedRef<boolean>

  /**
   * É desktop?
   */
  isDesktop: ComputedRef<boolean>

  /**
   * É touchscreen?
   */
  isTouchDevice: ComputedRef<boolean>

  /**
   * Está em modo retrato?
   */
  isPortrait: ComputedRef<boolean>

  /**
   * Está em modo paisagem?
   */
  isLandscape: ComputedRef<boolean>
}

/**
 * Detecta o tipo de dispositivo baseado no user agent e tamanho da tela
 */
function detectDeviceType(width: number): DeviceType {
  const userAgent = navigator.userAgent

  // Verifica mobile first via user agent
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile'
  }

  // Verifica tablet via user agent
  if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
    return 'tablet'
  }

  // Fallback para breakpoints de largura
  if (width < 768) {
    return 'mobile'
  } else if (width >= 768 && width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * Detecta o sistema operacional
 */
function detectOS(): OS {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  if (/Win/i.test(platform)) return 'Windows'
  if (/Mac/i.test(platform) && !('ontouchend' in document)) return 'Mac'
  if (/Linux/i.test(platform)) return 'Linux'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'

  return 'Unknown'
}

/**
 * Detecta o navegador
 */
function detectBrowser(): Browser {
  const userAgent = navigator.userAgent

  if (/Edg/i.test(userAgent)) return 'Edge'
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return 'Chrome'
  if (/Firefox/i.test(userAgent)) return 'Firefox'
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari'
  if (/Opera|OPR/i.test(userAgent)) return 'Opera'

  return 'Unknown'
}

/**
 * Composable para detectar informações do dispositivo
 *
 * @returns Objeto com informações do dispositivo
 *
 * @example
 * ```typescript
 * const {
 *   deviceType,
 *   os,
 *   browser,
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   isTouchDevice
 * } = useDevice()
 *
 * // Uso condicional
 * if (isMobile.value) {
 *   // Renderiza UI mobile
 * }
 *
 * // Coleta de metadados
 * const metadata = {
 *   device: deviceType.value,
 *   os: os.value,
 *   browser: browser.value
 * }
 * ```
 */
export function useDevice(): UseDeviceReturn {
  // State
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  const deviceType = ref<DeviceType>(detectDeviceType(window.innerWidth))
  const os = ref<OS>(detectOS())
  const browser = ref<Browser>(detectBrowser())

  // Computed
  const isMobile = computed(() => deviceType.value === 'mobile')
  const isTablet = computed(() => deviceType.value === 'tablet')
  const isDesktop = computed(() => deviceType.value === 'desktop')
  const isTouchDevice = computed(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0)
  const isPortrait = computed(() => windowHeight.value > windowWidth.value)
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)

  // Event handler
  const handleResize = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    deviceType.value = detectDeviceType(window.innerWidth)
  }

  // Lifecycle
  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    deviceType: readonly(deviceType),
    os: readonly(os),
    browser: readonly(browser),
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isPortrait,
    isLandscape
  }
}

/**
 * Retorna um objeto de metadados do dispositivo
 * Útil para salvar em ContactMetadata
 *
 * @example
 * ```typescript
 * const metadata = getDeviceMetadata()
 * // {
 * //   device: 'desktop',
 * //   os: 'Mac',
 * //   browser: 'Chrome',
 * //   ...
 * // }
 * ```
 */
export function getDeviceMetadata() {
  return {
    device: detectDeviceType(window.innerWidth),
    os: detectOS(),
    browser: detectBrowser(),
    screen: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent: navigator.userAgent,
    language: navigator.language,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }
}
