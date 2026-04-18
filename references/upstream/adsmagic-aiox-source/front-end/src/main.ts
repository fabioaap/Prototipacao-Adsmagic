import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { i18n } from './i18n'
import './assets/styles/tokens.css'
import './assets/styles/main.css'

const isSuspenseExperimentalWarning = (value: unknown): boolean => {
  return typeof value === 'string'
    && value.includes('Suspense')
    && value.includes('experimental feature')
}

if (import.meta.env.DEV) {
  const originalWarn = console.warn.bind(console)
  const originalInfo = console.info.bind(console)
  const originalError = console.error.bind(console)
  console.warn = (...args: unknown[]) => {
    if (args.some(isSuspenseExperimentalWarning)) {
      return
    }
    originalWarn(...args)
  }
  console.info = (...args: unknown[]) => {
    if (args.some(isSuspenseExperimentalWarning)) {
      return
    }
    originalInfo(...args)
  }
  console.error = (...args: unknown[]) => {
    if (args.some(isSuspenseExperimentalWarning)) {
      return
    }
    originalError(...args)
  }
}

const app = createApp(App)
const pinia = createPinia()

if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    if (isSuspenseExperimentalWarning(msg)) {
      return
    }
    // Preserve default behavior for all other warnings in development.
    console.warn(msg, instance, trace)
  }
}

app.use(pinia)
app.use(i18n)
app.use(router)

// Inicializa stores após criar o app
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'

const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Sincroniza idioma do store com i18n
const locale = i18n.global.locale
if (typeof locale === 'object' && 'value' in locale) {
  locale.value = languageStore.currentLocale
}

authStore.initialize()

// Carregar utilitários de teste apenas em desenvolvimento
if (import.meta.env.DEV) {
  import('./utils/testSession').then(() => {
    console.log('🧪 Utilitários de teste de sessão carregados')
  })
}

app.mount('#app')

const hideBootSplash = () => {
  const splash = document.getElementById('app-boot-splash')
  document.body.classList.remove('boot-loading')
  if (!splash) return
  splash.classList.add('is-hidden')
  window.setTimeout(() => splash.remove(), 220)
}

const BOOT_SPLASH_MIN_MS = 320
const bootStartedAt = performance.now()

const scheduleHideBootSplash = () => {
  const elapsed = performance.now() - bootStartedAt
  const waitMs = Math.max(0, BOOT_SPLASH_MIN_MS - elapsed)
  window.setTimeout(() => {
    // Duplo frame para garantir que o primeiro paint do app já está pronto.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(hideBootSplash)
    })
  }, waitMs)
}

void router.isReady().then(() => {
  scheduleHideBootSplash()
})

// Fail-safe para evitar splash preso em caso de erro de navegação inicial.
window.setTimeout(hideBootSplash, 8000)
