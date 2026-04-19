/**
 * Template HTML para página de compartilhamento de QR Code do WhatsApp
 *
 * Página self-contained (CSS/JS inline) para que terceiros possam
 * escanear o QR Code sem acesso ao sistema.
 *
 * @module utils/share-page-html
 */

interface SharePageParams {
  qrCode: string
  expiresAt: string
  token: string
  baseUrl: string
}

/**
 * Gera HTML completo da página de compartilhamento
 */
export function generateSharePageHtml(params: SharePageParams): string {
  const { qrCode, expiresAt, token, baseUrl } = params

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conectar WhatsApp - AdsMagic</title>
  <style>
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
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
    .icon-circle svg { width: 2rem; height: 2rem; color: var(--green); }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .subtitle { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; }
    .qr-wrapper {
      background: #fff;
      border: 2px dashed var(--border);
      border-radius: 0.75rem;
      padding: 1rem;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .qr-wrapper img { width: 200px; height: 200px; object-fit: contain; display: block; }
    .timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .timer.warning { color: var(--yellow); }
    .timer.expired { color: var(--red); }
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
    .instructions li { margin-bottom: 0.25rem; }
    .instructions strong { color: var(--text); }
    .status-box {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .status-waiting { background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue); }
    .status-success { background: var(--green-bg); color: var(--green); border: 1px solid var(--green); }
    .status-expired { background: var(--yellow-bg); color: var(--yellow); border: 1px solid var(--yellow); }
    .status-error { background: var(--red-bg); color: var(--red); border: 1px solid var(--red); }
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
    .btn:hover { opacity: 0.9; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--green); color: #fff; }
    .btn-outline { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
    .hidden { display: none !important; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .footer { font-size: 0.75rem; color: var(--text-muted); margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">AdsMagic</div>

    <div class="icon-circle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <h1>Conectar WhatsApp Business</h1>
    <p class="subtitle">Escaneie o QR Code abaixo com seu WhatsApp Business</p>

    <!-- QR Code -->
    <div id="qr-section">
      <div class="qr-wrapper">
        <img id="qr-image" src="${qrCode}" alt="QR Code do WhatsApp" />
      </div>

      <div class="timer warning" id="timer-display">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span id="timer-text">--:--</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill" style="width: 100%"></div>
      </div>
    </div>

    <!-- Status Messages -->
    <div id="status-waiting" class="status-box status-waiting hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Aguardando escaneamento do QR Code...
    </div>

    <div id="status-success" class="status-box status-success hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      WhatsApp conectado com sucesso!
    </div>

    <div id="status-expired" class="status-box status-expired hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      QR Code expirado.
    </div>

    <div id="status-error" class="status-box status-error hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span id="error-text">Erro ao verificar conexão.</span>
    </div>

    <!-- Actions -->
    <div id="action-refresh" class="hidden" style="margin-bottom: 1rem;">
      <button class="btn btn-primary" id="btn-refresh" onclick="refreshQR()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Gerar novo QR Code
      </button>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h3>Como conectar:</h3>
      <ol>
        <li>Abra o <strong>WhatsApp Business</strong> no seu celular</li>
        <li>Toque em <strong>Menu</strong> &rarr; <strong>Dispositivos conectados</strong></li>
        <li>Toque em <strong>Conectar um dispositivo</strong></li>
        <li>Escaneie o QR Code acima</li>
        <li>Aguarde a confirmação</li>
      </ol>
    </div>

    <div class="footer">Powered by AdsMagic</div>
  </div>

  <script>
    var TOKEN = '${token}';
    var BASE_URL = '${baseUrl}';
    var expiresAt = '${expiresAt}';
    var TOTAL_SECONDS = 5 * 60;
    var POLL_INTERVAL = 4000;

    var pollTimer = null;
    var countdownTimer = null;
    var currentStatus = 'waiting';

    function getSecondsRemaining() {
      var now = Date.now();
      var expires = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expires - now) / 1000));
    }

    function formatTime(seconds) {
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return m + ':' + String(s).padStart(2, '0');
    }

    function updateTimer() {
      var remaining = getSecondsRemaining();
      var timerText = document.getElementById('timer-text');
      var progressFill = document.getElementById('progress-fill');
      var timerDisplay = document.getElementById('timer-display');

      if (remaining <= 0) {
        timerText.textContent = 'Expirado';
        timerDisplay.className = 'timer expired';
        progressFill.style.width = '0%';
        handleExpired();
        return;
      }

      timerText.textContent = formatTime(remaining);
      var pct = Math.max(0, Math.min(100, (remaining / TOTAL_SECONDS) * 100));
      progressFill.style.width = pct + '%';
    }

    function showStatus(status) {
      ['waiting', 'success', 'expired', 'error'].forEach(function(s) {
        document.getElementById('status-' + s).classList.toggle('hidden', s !== status);
      });
      currentStatus = status;
    }

    function handleExpired() {
      if (currentStatus === 'success') return;
      showStatus('expired');
      stopPolling();
      document.getElementById('action-refresh').classList.remove('hidden');
      document.getElementById('qr-section').classList.add('hidden');
    }

    function handleConnected() {
      showStatus('success');
      stopPolling();
      if (countdownTimer) clearInterval(countdownTimer);
      document.getElementById('qr-section').classList.add('hidden');
      document.getElementById('action-refresh').classList.add('hidden');
    }

    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    }

    function checkStatus() {
      fetch(BASE_URL + '/whatsapp-share/' + TOKEN + '/status')
        .then(function(res) {
          if (!res.ok) {
            if (res.status === 410) handleExpired();
            return null;
          }
          return res.json();
        })
        .then(function(data) {
          if (!data) return;
          if (data.status === 'connected') handleConnected();
          else if (data.status === 'expired') handleExpired();
          else if (data.qrCode) document.getElementById('qr-image').src = data.qrCode;
        })
        .catch(function() {});
    }

    function refreshQR() {
      var btn = document.getElementById('btn-refresh');
      btn.disabled = true;
      btn.textContent = 'Gerando...';

      fetch(BASE_URL + '/whatsapp-share/' + TOKEN + '/refresh', { method: 'POST' })
        .then(function(res) {
          if (!res.ok) return res.json().catch(function() { return {}; }).then(function(e) { throw new Error(e.error || 'Erro'); });
          return res.json();
        })
        .then(function(data) {
          document.getElementById('qr-image').src = data.qrCode;
          document.getElementById('qr-section').classList.remove('hidden');
          document.getElementById('action-refresh').classList.add('hidden');
          showStatus('waiting');
          expiresAt = data.expiresAt;
          stopPolling();
          startTimers();
        })
        .catch(function(err) {
          document.getElementById('error-text').textContent = err.message || 'Erro ao gerar novo QR Code.';
          showStatus('error');
        })
        .finally(function() {
          btn.disabled = false;
          btn.textContent = 'Gerar novo QR Code';
        });
    }

    function startTimers() {
      updateTimer();
      countdownTimer = setInterval(updateTimer, 1000);
      pollTimer = setInterval(checkStatus, POLL_INTERVAL);
    }

    showStatus('waiting');
    startTimers();
    checkStatus();
  </script>
</body>
</html>`
}
