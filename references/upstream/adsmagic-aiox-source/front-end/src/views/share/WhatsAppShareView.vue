<script setup lang="ts">
/**
 * Página pública de compartilhamento de QR Code do WhatsApp
 *
 * Rota: /share/whatsapp/:token
 * Sem autenticação — segurança via token criptográfico de 256 bits.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = computed(() => route.params.token as string)

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
const POLL_INTERVAL_MS = 4000
const TOTAL_SECONDS = 5 * 60

// State
const qrCode = ref('')
const expiresAt = ref('')
const status = ref<'loading' | 'waiting' | 'connected' | 'expired' | 'revoked' | 'error'>('loading')
const errorMessage = ref('')
const refreshing = ref(false)
const secondsRemaining = ref(0)

let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Computed
const progressPercent = computed(() =>
  Math.max(0, Math.min(100, (secondsRemaining.value / TOTAL_SECONDS) * 100))
)

const formattedTime = computed(() => {
  const m = Math.floor(secondsRemaining.value / 60)
  const s = secondsRemaining.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// Methods
function updateCountdown() {
  if (!expiresAt.value) return
  const now = Date.now()
  const expires = new Date(expiresAt.value).getTime()
  const remaining = Math.max(0, Math.floor((expires - now) / 1000))
  secondsRemaining.value = remaining

  if (remaining <= 0 && status.value === 'waiting') {
    status.value = 'expired'
    stopTimers()
  }
}

function stopTimers() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

function startTimers() {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
  pollTimer = setInterval(checkStatus, POLL_INTERVAL_MS)
}

async function fetchInitialData() {
  try {
    const res = await fetch(`${API_BASE}/whatsapp-share/${token.value}`)
    const data = await res.json()

    if (!res.ok) {
      if (res.status === 404) {
        status.value = 'error'
        errorMessage.value = 'Link invalido ou expirado. Solicite um novo link.'
        return
      }
      if (res.status === 410) {
        status.value = data.status === 'revoked' ? 'revoked' : 'expired'
        return
      }
      status.value = 'error'
      errorMessage.value = data.error || 'Erro ao carregar dados.'
      return
    }

    qrCode.value = data.qrCode || ''
    expiresAt.value = data.expiresAt || ''

    if (data.status === 'connected') {
      status.value = 'connected'
      return
    }
    if (data.status === 'revoked') {
      status.value = 'revoked'
      return
    }
    if (data.status === 'expired') {
      status.value = 'expired'
      return
    }

    status.value = 'waiting'
    startTimers()
    checkStatus()
  } catch {
    status.value = 'error'
    errorMessage.value = 'Erro de conexao. Verifique sua internet e tente novamente.'
  }
}

async function checkStatus() {
  try {
    const res = await fetch(`${API_BASE}/whatsapp-share/${token.value}/status`)
    if (!res.ok) {
      if (res.status === 410) {
        status.value = 'expired'
        stopTimers()
      }
      return
    }
    const data = await res.json()
    if (data.status === 'connected') {
      status.value = 'connected'
      stopTimers()
    } else if (data.status === 'expired') {
      status.value = 'expired'
      stopTimers()
    }
  } catch {
    // Silently retry on next poll
  }
}

async function refreshQR() {
  refreshing.value = true
  try {
    const res = await fetch(`${API_BASE}/whatsapp-share/${token.value}/refresh`, {
      method: 'POST',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Erro ao gerar novo QR Code')
    }
    const data = await res.json()

    if (data.status === 'connected') {
      status.value = 'connected'
      stopTimers()
      return
    }

    qrCode.value = data.qrCode || ''
    expiresAt.value = data.expiresAt || ''
    status.value = 'waiting'
    stopTimers()
    startTimers()
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : 'Erro ao gerar novo QR Code.'
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

onUnmounted(() => {
  stopTimers()
})
</script>

<template>
  <div class="share-page">
    <div class="container">
      <div class="logo">AdsMagic</div>

      <div class="icon-circle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      <h1>Conectar WhatsApp Business</h1>
      <p class="subtitle">Escaneie o QR Code abaixo com seu WhatsApp Business</p>

      <!-- Loading -->
      <div v-if="status === 'loading'" class="status-box status-waiting">
        <svg class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Carregando...
      </div>

      <!-- QR Code Section -->
      <div v-if="status === 'waiting'" id="qr-section">
        <div class="qr-wrapper">
          <img :src="qrCode" alt="QR Code do WhatsApp" />
        </div>

        <div class="timer" :class="{ warning: secondsRemaining > 0, expired: secondsRemaining <= 0 }">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>{{ formattedTime }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Status: Waiting -->
      <div v-if="status === 'waiting'" class="status-box status-waiting">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Aguardando escaneamento do QR Code...
      </div>

      <!-- Status: Connected -->
      <div v-if="status === 'connected'" class="status-box status-success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        WhatsApp conectado com sucesso!
      </div>

      <!-- Status: Expired -->
      <div v-if="status === 'expired'" class="status-box status-expired">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        QR Code expirado.
      </div>

      <!-- Status: Revoked -->
      <div v-if="status === 'revoked'" class="status-box status-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        Este link foi revogado pelo administrador.
      </div>

      <!-- Status: Error -->
      <div v-if="status === 'error'" class="status-box status-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ errorMessage }}
      </div>

      <!-- Refresh Button -->
      <div v-if="status === 'expired'" style="margin-bottom: 1rem;">
        <button class="btn btn-primary" :disabled="refreshing" @click="refreshQR">
          <svg v-if="refreshing" class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          {{ refreshing ? 'Gerando...' : 'Gerar novo QR Code' }}
        </button>
      </div>

      <!-- Instructions -->
      <div v-if="status === 'waiting' || status === 'expired'" class="instructions">
        <h3>Como conectar:</h3>
        <ol>
          <li>Abra o <strong>WhatsApp Business</strong> no seu celular</li>
          <li>Toque em <strong>Menu</strong> &rarr; <strong>Dispositivos conectados</strong></li>
          <li>Toque em <strong>Conectar um dispositivo</strong></li>
          <li>Escaneie o QR Code acima</li>
          <li>Aguarde a confirmacao</li>
        </ol>
      </div>

      <div class="footer">Powered by AdsMagic</div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --bg: #ffffff;
  --bg-card: #f9fafb;
  --text: #111827;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --green: #16a34a;
  --green-bg: #dcfce7;
  --yellow: #ca8a04;
  --yellow-bg: #fef9c3;
  --red: #dc2626;
  --red-bg: #fee2e2;
  --blue: #2563eb;
  --blue-bg: #dbeafe;
  --brand: #7c3aed;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --bg-card: #1f2937;
    --text: #f9fafb;
    --text-muted: #9ca3af;
    --border: #374151;
    --green-bg: #052e16;
    --yellow-bg: #422006;
    --red-bg: #450a0a;
    --blue-bg: #1e3a5f;
  }
}

.share-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.container {
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--brand);
  margin-bottom: 2rem;
}

.icon-circle {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--green-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.icon-circle svg {
  width: 2rem;
  height: 2rem;
  color: var(--green);
}

h1 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.qr-wrapper {
  background: #fff;
  border: 2px dashed var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  display: inline-block;
  margin-bottom: 1rem;
}

.qr-wrapper img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  display: block;
}

.timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.timer.warning {
  color: var(--yellow);
}

.timer.expired {
  color: var(--red);
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: var(--bg-card);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--yellow);
  border-radius: 9999px;
  transition: width 1s linear;
}

.instructions {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.instructions h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.instructions ol {
  font-size: 0.875rem;
  color: var(--text-muted);
  padding-left: 1.25rem;
}

.instructions li {
  margin-bottom: 0.25rem;
}

.instructions strong {
  color: var(--text);
}

.status-box {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.status-waiting {
  background: var(--blue-bg);
  color: var(--blue);
  border: 1px solid var(--blue);
}

.status-success {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid var(--green);
}

.status-expired {
  background: var(--yellow-bg);
  color: var(--yellow);
  border: 1px solid var(--yellow);
}

.status-error {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid var(--red);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--green);
  color: #fff;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2rem;
}
</style>
