(function (window, document) {
  'use strict'

  if (!window || !document) {
    return
  }

  // Capture currentScript synchronously — it's only valid during initial script execution
  var _currentScript = document.currentScript

  var RUNTIME_VERSION = '1.3.0'
  var SCHEMA_VERSION = '1.0'

  if (window.AdsmagicTag && window.AdsmagicTag.__runtimeVersion === RUNTIME_VERSION) {
    return
  }

  var STORAGE_SESSION_KEY = 'adsmagic_session_id'
  var STORAGE_TRACKING_KEY = 'adsmagic_tracking_params'
  var STORAGE_VERIFICATION_KEY = 'adsmagic_verification_tokens'
  var CLICK_ID_KEYS = ['fbclid', 'gclid', 'gbraid', 'wbraid', 'ttclid', 'msclkid', 'yclid']
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  var CUSTOM_TRACKING_KEYS = ['campaign_id']
  var TRACKING_KEYS = CLICK_ID_KEYS.concat(UTM_KEYS).concat(CUSTOM_TRACKING_KEYS)
  var REDIRECT_HOSTS = ['r.adsmagic.com.br']
  var REDIRECT_UUID_PATH_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  var VERIFY_TOKEN_QUERY_KEY = 'adsmagic_verify_token'
  var VERIFY_ENDPOINT_QUERY_KEY = 'adsmagic_verify_endpoint'
  var VERIFY_PROJECT_QUERY_KEY = 'adsmagic_verify_project_id'
  var MAX_PROPERTY_KEYS = 50
  var MAX_STRING_LENGTH = 2000

  var DEFAULT_CONFIG = {
    projectId: '',
    apiEndpoint: '',
    debug: false,
    autoInit: true,
    autoTrackPageView: true,
    batchSize: 10,
    flushIntervalMs: 5000,
    maxQueueSize: 200,
    maxRetries: 3,
    eventTtlMs: 24 * 60 * 60 * 1000,
  }

  var state = {
    config: DEFAULT_CONFIG,
    queue: [],
    isInitialized: false,
    isFlushing: false,
    flushTimer: null,
    sessionId: '',
    user: null,
    project: null,
    trackingParams: {},
    listenersAttached: false,
    redirectTrackingAttached: false,
    pageViewSent: false,
  }

  function hasLocalStorage() {
    try {
      return typeof window.localStorage !== 'undefined'
    } catch (_error) {
      return false
    }
  }

  function nowIso() {
    return new Date().toISOString()
  }

  function nowMs() {
    return Date.now()
  }

  function toPositiveInteger(value, fallback) {
    var parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback
    }

    return Math.floor(parsed)
  }

  function createId(prefix) {
    var random = Math.random().toString(36).slice(2, 12)
    var timestamp = nowMs().toString(36)
    return prefix + '_' + timestamp + random
  }

  function debugLog() {
    if (!state.config.debug || typeof console === 'undefined') {
      return
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('[AdsmagicTag]')
    console.log.apply(console, args)
  }

  function errorLog() {
    if (typeof console === 'undefined') {
      return
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('[AdsmagicTag]')
    console.error.apply(console, args)
  }

  function sanitizeString(value) {
    if (typeof value !== 'string') {
      return value
    }

    if (value.length > MAX_STRING_LENGTH) {
      return value.slice(0, MAX_STRING_LENGTH)
    }

    return value
  }

  function sanitizeValue(value, depth) {
    if (depth > 3) {
      return undefined
    }

    if (value === null || value === undefined) {
      return undefined
    }

    if (typeof value === 'string') {
      return sanitizeString(value)
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value
    }

    if (Array.isArray(value)) {
      var outputArray = []
      var maxArrayItems = Math.min(value.length, MAX_PROPERTY_KEYS)

      for (var i = 0; i < maxArrayItems; i += 1) {
        var sanitizedItem = sanitizeValue(value[i], depth + 1)
        if (sanitizedItem !== undefined) {
          outputArray.push(sanitizedItem)
        }
      }

      return outputArray
    }

    if (typeof value === 'object') {
      return sanitizeObject(value, depth + 1)
    }

    return undefined
  }

  function sanitizeObject(input, depth) {
    if (!input || typeof input !== 'object') {
      return {}
    }

    var output = {}
    var keys = Object.keys(input)
    var maxKeys = Math.min(keys.length, MAX_PROPERTY_KEYS)

    for (var i = 0; i < maxKeys; i += 1) {
      var key = keys[i]
      var value = sanitizeValue(input[key], depth || 0)
      if (value !== undefined) {
        output[key] = value
      }
    }

    return output
  }

  function readStorageJson(key) {
    if (!hasLocalStorage()) {
      return {}
    }

    try {
      var raw = window.localStorage.getItem(key)
      if (!raw) {
        return {}
      }

      return sanitizeObject(JSON.parse(raw), 0)
    } catch (_error) {
      return {}
    }
  }

  function writeStorageJson(key, value) {
    if (!hasLocalStorage()) {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (_error) {
      // Ignorar falha de storage (private mode/quota)
    }
  }

  function getQueryParams() {
    if (typeof window.location === 'undefined') {
      return {}
    }

    var params = new URLSearchParams(window.location.search || '')
    var collected = {}
    var allKeys = TRACKING_KEYS

    for (var i = 0; i < allKeys.length; i += 1) {
      var key = allKeys[i]
      var value = params.get(key)
      if (value) {
        collected[key] = sanitizeString(value)
      }
    }

    return collected
  }

  function getCookieParams() {
    var cookies = {}
    if (typeof document === 'undefined' || !document.cookie) {
      return cookies
    }

    var cookiePairs = document.cookie.split(';')
    for (var i = 0; i < cookiePairs.length; i += 1) {
      var pair = cookiePairs[i]
      if (!pair) {
        continue
      }

      var parts = pair.split('=')
      var key = (parts.shift() || '').trim()
      if (!key || TRACKING_KEYS.indexOf(key) < 0) {
        continue
      }

      var value = parts.join('=').trim()
      if (!value) {
        continue
      }

      try {
        cookies[key] = sanitizeString(decodeURIComponent(value))
      } catch (_error) {
        cookies[key] = sanitizeString(value)
      }
    }

    return cookies
  }

  function getVerificationContextFromUrl() {
    if (typeof window.location === 'undefined') {
      return null
    }

    var searchParams = new URLSearchParams(window.location.search || '')
    var token = searchParams.get(VERIFY_TOKEN_QUERY_KEY)
    var endpoint = searchParams.get(VERIFY_ENDPOINT_QUERY_KEY)
    var projectId = searchParams.get(VERIFY_PROJECT_QUERY_KEY)

    if (!token || !endpoint) {
      return null
    }

    return {
      token: sanitizeString(token),
      endpoint: sanitizeString(endpoint),
      projectId: projectId ? sanitizeString(projectId) : '',
    }
  }

  function cleanupVerificationQueryParams() {
    if (
      typeof window.location === 'undefined' ||
      typeof window.history === 'undefined' ||
      typeof window.history.replaceState !== 'function'
    ) {
      return
    }

    try {
      var currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete(VERIFY_TOKEN_QUERY_KEY)
      currentUrl.searchParams.delete(VERIFY_ENDPOINT_QUERY_KEY)
      currentUrl.searchParams.delete(VERIFY_PROJECT_QUERY_KEY)
      window.history.replaceState({}, document.title || '', currentUrl.toString())
    } catch (_error) {
      // Ignorar falha de normalização da URL
    }
  }

  function getCurrentUrlWithoutVerificationParams() {
    if (typeof window.location === 'undefined') {
      return ''
    }

    var currentHref = window.location.href || ''

    try {
      var currentUrl = new URL(currentHref)
      currentUrl.searchParams.delete(VERIFY_TOKEN_QUERY_KEY)
      currentUrl.searchParams.delete(VERIFY_ENDPOINT_QUERY_KEY)
      currentUrl.searchParams.delete(VERIFY_PROJECT_QUERY_KEY)
      return currentUrl.toString()
    } catch (_error) {
      return currentHref
    }
  }

  function readVerificationTokensCache() {
    if (!hasLocalStorage()) {
      return {}
    }

    return readStorageJson(STORAGE_VERIFICATION_KEY)
  }

  function isVerificationTokenHandled(token) {
    if (!token) {
      return false
    }

    var cache = readVerificationTokensCache()
    return !!cache[token]
  }

  function markVerificationTokenHandled(token) {
    if (!token || !hasLocalStorage()) {
      return
    }

    var cache = readVerificationTokensCache()
    cache[token] = nowIso()
    writeStorageJson(STORAGE_VERIFICATION_KEY, cache)
  }

  function sendVerificationPing(context, resolvedProjectId) {
    if (!context || !context.endpoint || !context.token || !resolvedProjectId) {
      return Promise.resolve(false)
    }

    if (!/^https?:\/\//i.test(context.endpoint)) {
      return Promise.resolve(false)
    }

    var payload = {
      token: context.token,
      projectId: resolvedProjectId,
      pageUrl: getCurrentUrlWithoutVerificationParams(),
      runtimeVersion: RUNTIME_VERSION,
    }

    return fetch(context.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
    })
      .then(function (response) {
        return response.ok
      })
      .catch(function () {
        return false
      })
  }

  function processVerificationFromQueryString() {
    var context = getVerificationContextFromUrl()
    if (!context) {
      return
    }

    cleanupVerificationQueryParams()

    if (isVerificationTokenHandled(context.token)) {
      return
    }

    var resolvedProjectId = resolveProjectId() || context.projectId || ''
    if (!resolvedProjectId) {
      return
    }

    sendVerificationPing(context, resolvedProjectId)
      .then(function (success) {
        if (success) {
          markVerificationTokenHandled(context.token)
          debugLog('Ping de verificação da tag enviado com sucesso')
          return
        }

        debugLog('Falha ao enviar ping de verificação da tag')
      })
  }

  function getPageContext() {
    return {
      url: getCurrentUrlWithoutVerificationParams(),
      path: window.location.pathname,
      title: document.title || '',
      referrer: document.referrer || '',
    }
  }

  function resolveApiEndpoint() {
    if (_currentScript && _currentScript.src) {
      try {
        var scriptUrl = new URL(_currentScript.src)
        return scriptUrl.origin + '/api/events/track'
      } catch (_error) {
        // Fallback below
      }
    }

    return ''
  }

  function normalizeConfig(config) {
    var merged = {}
    var defaultKeys = Object.keys(DEFAULT_CONFIG)

    for (var i = 0; i < defaultKeys.length; i += 1) {
      var key = defaultKeys[i]
      merged[key] = DEFAULT_CONFIG[key]
    }

    var globalConfig = window.adsmagicConfig && typeof window.adsmagicConfig === 'object'
      ? window.adsmagicConfig
      : {}

    var globalKeys = Object.keys(globalConfig)
    for (var j = 0; j < globalKeys.length; j += 1) {
      var globalKey = globalKeys[j]
      merged[globalKey] = globalConfig[globalKey]
    }

    if (config && typeof config === 'object') {
      var configKeys = Object.keys(config)
      for (var k = 0; k < configKeys.length; k += 1) {
        var configKey = configKeys[k]
        merged[configKey] = config[configKey]
      }
    }

    merged.projectId = typeof merged.projectId === 'string' ? merged.projectId.trim() : ''
    merged.apiEndpoint = typeof merged.apiEndpoint === 'string' ? merged.apiEndpoint.trim() : ''
    merged.debug = !!merged.debug
    merged.autoInit = merged.autoInit !== false
    merged.autoTrackPageView = merged.autoTrackPageView !== false

    // Auto-resolve apiEndpoint from script src if not explicitly provided
    if (!merged.apiEndpoint) {
      merged.apiEndpoint = resolveApiEndpoint()
    }

    if (merged.flushInterval && !merged.flushIntervalMs) {
      merged.flushIntervalMs = merged.flushInterval
    }

    merged.batchSize = toPositiveInteger(merged.batchSize, DEFAULT_CONFIG.batchSize)
    merged.flushIntervalMs = toPositiveInteger(merged.flushIntervalMs, DEFAULT_CONFIG.flushIntervalMs)
    merged.maxQueueSize = toPositiveInteger(merged.maxQueueSize, DEFAULT_CONFIG.maxQueueSize)
    merged.maxRetries = toPositiveInteger(merged.maxRetries, DEFAULT_CONFIG.maxRetries)
    merged.eventTtlMs = toPositiveInteger(merged.eventTtlMs, DEFAULT_CONFIG.eventTtlMs)

    return merged
  }

  function validateConfig(config) {
    var errors = []

    if (!config.projectId) {
      errors.push('projectId is required')
    }

    if (!config.apiEndpoint) {
      errors.push('apiEndpoint is required. Provide it via window.adsmagicConfig or load the script with a src attribute.')
    }

    return {
      valid: errors.length === 0,
      errors: errors,
    }
  }

  function getOrCreateSessionId() {
    if (state.sessionId) {
      return state.sessionId
    }

    if (hasLocalStorage()) {
      var existing = window.localStorage.getItem(STORAGE_SESSION_KEY)
      if (existing) {
        state.sessionId = existing
        return existing
      }
    }

    var created = createId('sess')
    state.sessionId = created

    if (hasLocalStorage()) {
      try {
        window.localStorage.setItem(STORAGE_SESSION_KEY, created)
      } catch (_error) {
        // Ignora falha de storage
      }
    }

    return created
  }

  function resolveProjectId() {
    if (state.project && state.project.id) {
      return state.project.id
    }

    return state.config.projectId || ''
  }

  function captureTrackingParams() {
    var stored = readStorageJson(STORAGE_TRACKING_KEY)
    var cookieParams = getCookieParams()
    var currentUrlParams = getQueryParams()
    state.trackingParams = sanitizeObject(Object.assign({}, stored, cookieParams, currentUrlParams), 0)
    writeStorageJson(STORAGE_TRACKING_KEY, state.trackingParams)
  }

  function isTrackableRedirectLink(url) {
    if (!url || !url.hostname) {
      return false
    }

    if (REDIRECT_HOSTS.indexOf(url.hostname.toLowerCase()) < 0) {
      return false
    }

    var pathSegments = (url.pathname || '').split('/').filter(Boolean)
    if (pathSegments.length === 0) {
      return false
    }

    return REDIRECT_UUID_PATH_REGEX.test(pathSegments[0])
  }

  function appendContextParams(url) {
    if (!url || !url.searchParams) {
      return
    }

    if (!url.searchParams.get('landing_url')) {
      url.searchParams.set('landing_url', window.location.href || '')
    }

    if (!url.searchParams.get('referrer') && document.referrer) {
      url.searchParams.set('referrer', document.referrer)
    }
  }

  function enrichAnchorHref(anchor) {
    if (!anchor || !anchor.getAttribute) {
      return
    }

    var rawHref = anchor.getAttribute('href')
    if (!rawHref || rawHref.indexOf('#') === 0 || rawHref.indexOf('javascript:') === 0) {
      return
    }

    var parsedUrl
    try {
      parsedUrl = new URL(rawHref, window.location.href)
    } catch (_error) {
      return
    }

    if (!isTrackableRedirectLink(parsedUrl)) {
      return
    }

    for (var i = 0; i < TRACKING_KEYS.length; i += 1) {
      var key = TRACKING_KEYS[i]
      if (parsedUrl.searchParams.get(key)) {
        continue
      }

      var value = state.trackingParams[key]
      if (!value) {
        continue
      }

      parsedUrl.searchParams.set(key, String(value))
    }

    appendContextParams(parsedUrl)
    anchor.setAttribute('href', parsedUrl.toString())
  }

  function enrichAllRedirectLinks() {
    if (!document || typeof document.querySelectorAll !== 'function') {
      return
    }

    var anchors = document.querySelectorAll('a[href]')
    for (var i = 0; i < anchors.length; i += 1) {
      enrichAnchorHref(anchors[i])
    }
  }

  function bindRedirectLinkTracking() {
    if (state.redirectTrackingAttached) {
      return
    }

    document.addEventListener('click', function (event) {
      var rawTarget = event && event.target
      var target = rawTarget && rawTarget.nodeType === 1 ? rawTarget : rawTarget && rawTarget.parentElement

      if (!target || typeof target.closest !== 'function') {
        return
      }

      var anchor = target.closest('a[href]')
      if (!anchor) {
        return
      }

      enrichAnchorHref(anchor)
    }, true)

    state.redirectTrackingAttached = true
  }

  function isEventExpired(event, now) {
    return now - event.createdAtMs > state.config.eventTtlMs
  }

  function computeBackoffMs(retryCount) {
    var base = Math.min(30000, Math.pow(2, retryCount - 1) * 1000)
    var jitter = Math.floor(Math.random() * 400)
    return base + jitter
  }

  function ensureQueueLimit() {
    while (state.queue.length > state.config.maxQueueSize) {
      state.queue.shift()
      debugLog('Queue limit reached: dropping oldest event')
    }
  }

  function createEvent(type, name, properties) {
    return {
      id: createId('evt'),
      type: type,
      name: name,
      timestamp: nowIso(),
      createdAtMs: nowMs(),
      retryCount: 0,
      nextRetryAtMs: 0,
      properties: sanitizeObject(properties || {}, 0),
      page: getPageContext(),
      trackingParams: state.trackingParams,
    }
  }

  function createPayload(event) {
    return {
      schemaVersion: SCHEMA_VERSION,
      runtimeVersion: RUNTIME_VERSION,
      id: event.id,
      type: event.type,
      name: event.name,
      projectId: resolveProjectId(),
      sessionId: state.sessionId,
      userId: state.user && state.user.id ? state.user.id : undefined,
      user: state.user || undefined,
      timestamp: event.timestamp,
      page: event.page,
      trackingParams: event.trackingParams,
      properties: event.properties,
      context: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      },
    }
  }

  function sendPayload(payload, useBeacon) {
    if (!state.config.apiEndpoint) {
      return Promise.resolve(false)
    }

    var body = JSON.stringify(payload)

    if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        var blob = new Blob([body], { type: 'application/json' })
        var sent = navigator.sendBeacon(state.config.apiEndpoint, blob)
        return Promise.resolve(sent)
      } catch (_error) {
        return Promise.resolve(false)
      }
    }

    return fetch(state.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
      keepalive: !!useBeacon,
      mode: 'cors',
      credentials: 'omit',
    })
      .then(function (response) {
        return response.ok
      })
      .catch(function () {
        return false
      })
  }

  function scheduleFlush(delayMs) {
    if (state.flushTimer) {
      window.clearTimeout(state.flushTimer)
      state.flushTimer = null
    }

    var delay = typeof delayMs === 'number' ? delayMs : state.config.flushIntervalMs
    if (delay < 50) {
      delay = 50
    }

    state.flushTimer = window.setTimeout(function () {
      AdsmagicTag.flush()
    }, delay)
  }

  function getNextRetryDelay() {
    var now = nowMs()
    var nextRetryAtMs = null

    for (var i = 0; i < state.queue.length; i += 1) {
      var event = state.queue[i]
      if (event.nextRetryAtMs && event.nextRetryAtMs > now) {
        if (nextRetryAtMs === null || event.nextRetryAtMs < nextRetryAtMs) {
          nextRetryAtMs = event.nextRetryAtMs
        }
      }
    }

    if (nextRetryAtMs === null) {
      return state.config.flushIntervalMs
    }

    return Math.max(50, nextRetryAtMs - now)
  }

  function bindLifecycleEvents() {
    if (state.listenersAttached) {
      return
    }

    window.addEventListener('pagehide', function () {
      AdsmagicTag.flush({ useBeacon: true })
    })

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        AdsmagicTag.flush({ useBeacon: true })
      }
    })

    state.listenersAttached = true
  }

  function ensureInitialized() {
    if (state.isInitialized) {
      return true
    }

    return !!AdsmagicTag.init()
  }

  function enqueueEvent(type, name, properties) {
    if (!ensureInitialized()) {
      return false
    }

    if (!resolveProjectId()) {
      errorLog('Evento ignorado: projectId não configurado')
      return false
    }

    var event = createEvent(type, name, properties)
    state.queue.push(event)
    ensureQueueLimit()

    debugLog('Evento na fila:', event.name, event.type, 'fila=', state.queue.length)

    if (state.queue.length >= state.config.batchSize) {
      AdsmagicTag.flush()
      return true
    }

    scheduleFlush()
    return true
  }

  var AdsmagicTag = {
    __runtimeVersion: RUNTIME_VERSION,

    init: function (config) {
      var nextConfig = normalizeConfig(config)
      var validation = validateConfig(nextConfig)

      if (!validation.valid) {
        state.isInitialized = false
        errorLog('Configuração inválida da tag:', validation.errors.join(', '))
        return false
      }

      state.config = nextConfig
      getOrCreateSessionId()
      captureTrackingParams()
      bindLifecycleEvents()
      bindRedirectLinkTracking()
      enrichAllRedirectLinks()

      state.isInitialized = true
      debugLog('Inicializada com config:', state.config)

      processVerificationFromQueryString()

      if (state.config.autoTrackPageView && !state.pageViewSent) {
        state.pageViewSent = true
        enqueueEvent('pageview', 'pageview', {})
      }

      return true
    },

    track: function (eventName, properties) {
      return enqueueEvent('custom', eventName || 'custom_event', properties || {})
    },

    trackEvent: function (eventName, properties) {
      return this.track(eventName, properties)
    },

    trackConversion: function (conversionType, value, currency) {
      return enqueueEvent('conversion', conversionType || 'conversion', {
        conversionType: conversionType || 'conversion',
        value: typeof value === 'number' ? value : 0,
        currency: currency || 'BRL',
      })
    },

    trackLead: function (leadData) {
      return enqueueEvent('lead', 'lead', leadData || {})
    },

    trackPurchase: function (purchaseData) {
      return enqueueEvent('purchase', 'purchase', purchaseData || {})
    },

    setUser: function (userData) {
      state.user = sanitizeObject(userData || {}, 0)
      debugLog('Usuário definido:', state.user)
    },

    setProject: function (projectData) {
      state.project = sanitizeObject(projectData || {}, 0)
      if (state.project.id) {
        state.config.projectId = String(state.project.id)
      }
      debugLog('Projeto definido:', state.project)
    },

    flush: function (options) {
      if (!ensureInitialized()) {
        return Promise.resolve(false)
      }

      if (state.isFlushing) {
        return Promise.resolve(false)
      }

      if (state.queue.length === 0) {
        return Promise.resolve(true)
      }

      var now = nowMs()
      var readyEvents = []
      var deferredEvents = []

      for (var i = 0; i < state.queue.length; i += 1) {
        var queuedEvent = state.queue[i]

        if (isEventExpired(queuedEvent, now)) {
          debugLog('Evento expirado removido:', queuedEvent.name)
          continue
        }

        if (queuedEvent.nextRetryAtMs && queuedEvent.nextRetryAtMs > now) {
          deferredEvents.push(queuedEvent)
          continue
        }

        if (readyEvents.length < state.config.batchSize) {
          readyEvents.push(queuedEvent)
        } else {
          deferredEvents.push(queuedEvent)
        }
      }

      state.queue = deferredEvents

      if (readyEvents.length === 0) {
        if (state.queue.length > 0) {
          scheduleFlush(getNextRetryDelay())
        }
        return Promise.resolve(false)
      }

      state.isFlushing = true

      var useBeacon = !!(options && options.useBeacon)
      var sendPromises = readyEvents.map(function (event) {
        var payload = createPayload(event)
        return sendPayload(payload, useBeacon).then(function (success) {
          if (success) {
            return
          }

          event.retryCount += 1

          if (event.retryCount > state.config.maxRetries) {
            debugLog('Evento descartado após atingir maxRetries:', event.name)
            return
          }

          if (isEventExpired(event, nowMs())) {
            debugLog('Evento descartado por expiração:', event.name)
            return
          }

          event.nextRetryAtMs = nowMs() + computeBackoffMs(event.retryCount)
          state.queue.push(event)
        })
      })

      return Promise.all(sendPromises)
        .then(function () {
          ensureQueueLimit()
          return state.queue.length === 0
        })
        .finally(function () {
          state.isFlushing = false
          if (state.queue.length > 0) {
            scheduleFlush(getNextRetryDelay())
          }
        })
    },

    getSession: function () {
      return {
        sessionId: state.sessionId,
        userId: state.user && state.user.id ? state.user.id : undefined,
        projectId: resolveProjectId(),
        isInitialized: state.isInitialized,
      }
    },

    destroy: function () {
      if (state.flushTimer) {
        window.clearTimeout(state.flushTimer)
        state.flushTimer = null
      }

      state.queue = []
      state.isInitialized = false
      state.isFlushing = false
      state.user = null
      state.project = null
      state.pageViewSent = false

      debugLog('Instância destruída')
    },
  }

  window.AdsmagicTag = AdsmagicTag
  window.adsmagic = AdsmagicTag

  if (window.adsmagicConfig && window.adsmagicConfig.autoInit !== false) {
    AdsmagicTag.init(window.adsmagicConfig)
  }

  // Fallback: verificação funciona mesmo sem init (ex: GTM)
  if (!state.isInitialized) {
    processVerificationFromQueryString()
  }
})(window, document)
