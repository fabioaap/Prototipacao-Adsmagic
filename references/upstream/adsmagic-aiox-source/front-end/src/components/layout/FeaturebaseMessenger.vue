<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useLanguageStore, type Locale } from '@/stores/language'
import { FEATUREBASE_APP_ID } from '@/lib/featurebase'

type FeaturebaseTheme = 'light' | 'dark'
type FeaturebaseLanguage = Locale

interface FeaturebaseBootOptions {
  appId: string
  theme: FeaturebaseTheme
  language: FeaturebaseLanguage
}

type FeaturebaseCommandArgs =
  | ['boot', FeaturebaseBootOptions]
  | ['setTheme', FeaturebaseTheme]
  | ['setLanguage', FeaturebaseLanguage]
  | ['shutdown']

type FeaturebaseFunction = {
  (command: 'boot', options: FeaturebaseBootOptions): void
  (command: 'setTheme', theme: FeaturebaseTheme): void
  (command: 'setLanguage', language: FeaturebaseLanguage): void
  (command: 'shutdown'): void
  q?: FeaturebaseCommandArgs[]
}

interface FeaturebaseWindow extends Window {
  Featurebase?: FeaturebaseFunction
}

const FEATUREBASE_SDK_ID = 'featurebase-sdk'
const FEATUREBASE_SDK_SRC = 'https://do.featurebase.app/js/sdk.js'

const languageStore = useLanguageStore()

let isBooted = false
let themeObserver: MutationObserver | null = null
let lastTheme: FeaturebaseTheme = 'light'

const getTheme = (): FeaturebaseTheme => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

const getLanguage = (locale: Locale): FeaturebaseLanguage => {
  if (locale === 'en' || locale === 'es') {
    return locale
  }

  return 'pt'
}

const getFeaturebase = (): FeaturebaseFunction => {
  const featurebaseWindow = window as FeaturebaseWindow

  if (typeof featurebaseWindow.Featurebase === 'function') {
    return featurebaseWindow.Featurebase
  }

  const featurebase = ((...args: FeaturebaseCommandArgs) => {
    ;(featurebase.q = featurebase.q || []).push(args)
  }) as FeaturebaseFunction

  featurebaseWindow.Featurebase = featurebase

  return featurebase
}

const ensureFeaturebaseScript = () => {
  if (document.getElementById(FEATUREBASE_SDK_ID)) {
    return
  }

  const script = document.createElement('script')
  script.id = FEATUREBASE_SDK_ID
  script.src = FEATUREBASE_SDK_SRC
  script.async = true
  script.addEventListener(
    'error',
    () => {
      if (import.meta.env.DEV) {
        console.warn('[Featurebase] Failed to load messenger SDK.')
      }
    },
    { once: true },
  )

  document.head.appendChild(script)
}

const bootFeaturebase = () => {
  const featurebase = getFeaturebase()
  ensureFeaturebaseScript()

  lastTheme = getTheme()
  featurebase('boot', {
    appId: FEATUREBASE_APP_ID,
    theme: lastTheme,
    language: getLanguage(languageStore.currentLocale),
  })

  isBooted = true
  themeObserver?.disconnect()
  themeObserver = new MutationObserver(() => {
    if (!isBooted) {
      return
    }

    const nextTheme = getTheme()
    if (nextTheme === lastTheme) {
      return
    }

    lastTheme = nextTheme
    featurebase('setTheme', nextTheme)
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

onMounted(() => {
  bootFeaturebase()
})

watch(
  () => languageStore.currentLocale,
  (locale) => {
    if (!isBooted) {
      return
    }

    getFeaturebase()('setLanguage', getLanguage(locale))
  },
)

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  themeObserver = null

  if (!isBooted) {
    return
  }

  getFeaturebase()('shutdown')
  isBooted = false
})
</script>

<template />
