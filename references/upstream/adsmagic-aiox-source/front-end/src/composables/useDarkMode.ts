/**
 * Composable para gerenciar dark mode
 */

import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'adsmagic_dark_mode'

// Estado global compartilhado
const isDark = ref(false)

export function useDarkMode() {
  /**
   * Inicializa o dark mode a partir do localStorage
   */
  const initialize = () => {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      // Usa preferência salva
      isDark.value = saved === 'true'
    } else {
      // Usa preferência do sistema
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()
  }

  /**
   * Aplica o tema ao documento
   */
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  /**
   * Alterna entre dark e light mode
   */
  const toggle = () => {
    isDark.value = !isDark.value
  }

  /**
   * Define o modo manualmente
   */
  const setDarkMode = (value: boolean) => {
    isDark.value = value
  }

  // Observa mudanças e salva no localStorage
  watch(isDark, (value) => {
    localStorage.setItem(STORAGE_KEY, String(value))
    applyTheme()
  })

  onMounted(() => {
    initialize()
  })

  return {
    isDark,
    toggle,
    setDarkMode,
    initialize,
  }
}
