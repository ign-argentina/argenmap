/**
 * @file message-bridge.js
 * @description Puente de comunicación bidireccional mediante `window.postMessage`
 * entre Argenmap (cuando se ejecuta embebido en un `<iframe>`) y una aplicación
 * anfitriona externa como `editor-argenmap`.
 *
 * Responsabilidades:
 * - Detectar si el visor se encuentra embebido en un iframe o en modo standalone.
 * - Validar estrictamente `event.origin` contra una lista configurable de orígenes permitidos.
 * - Validar que `event.source` corresponda exclusivamente a `window.parent`.
 * - Validar el contrato del protocolo versionado (`protocol: "argenmap"`, `version: 1`).
 * - Emitir `VIEWER_READY` una única vez cuando la instancia de Leaflet (`mapa`) y
 *   los módulos `ConfigProcessor` y `LiveUpdater` estén disponibles.
 * - Procesar mensajes `UPDATE_CONFIG` (completos y parciales) delegando en `LiveUpdater`
 *   y respondiendo con `CONFIG_UPDATED` preservando el `messageId`.
 * - Procesar mensajes `GET_CONFIG` devolviendo `CONFIG_STATE` con la configuración
 *   declarativa actual obtenida desde `LiveUpdater.getCurrentConfig()`.
 *
 * Implementado en JavaScript Vanilla puro. Compatible con entornos de navegador
 * (`globalThis.MessageBridge`) y Node.js para pruebas automatizadas.
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(root);
  } else {
    root.MessageBridge = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  // =========================================================================
  // Constantes del protocolo
  // =========================================================================

  /** Nombre identificador del protocolo de mensajería. */
  const PROTOCOL_NAME = "argenmap";

  /** Versión soportada del protocolo. */
  const PROTOCOL_VERSION = 1;

  /** Tipos de mensajes admitidos en el protocolo. */
  const MESSAGE_TYPES = Object.freeze({
    VIEWER_READY: "VIEWER_READY",
    UPDATE_CONFIG: "UPDATE_CONFIG",
    CONFIG_UPDATED: "CONFIG_UPDATED",
    GET_CONFIG: "GET_CONFIG",
    CONFIG_STATE: "CONFIG_STATE",
  });

  /** Subconjunto de tipos de mensaje que el visor acepta como entrantes desde el padre. */
  const INCOMING_MESSAGE_TYPES = new Set([
    MESSAGE_TYPES.UPDATE_CONFIG,
    MESSAGE_TYPES.GET_CONFIG,
  ]);

  /** Longitud máxima permitida para `messageId`. */
  const MAX_MESSAGE_ID_LENGTH = 128;

  /** Patrón seguro para validar `messageId` (caracteres alfanuméricos y separadores estándar). */
  const MESSAGE_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/;

  /**
   * Orígenes locales explícitos permitidos únicamente cuando el visor se ejecuta
   * en entorno de desarrollo y no se definió una lista personalizada.
   */
  const DEFAULT_DEV_ALLOWED_ORIGINS = Object.freeze([
    "http://localhost:3000",
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:8080",
  ]);

  /** Claves internas o sensibles que nunca deben exponerse en `CONFIG_STATE`. */
  const INTERNAL_STRIP_KEYS = new Set([
    "_wmsServiceKey",
    "token",
    "accessToken",
    "password",
    "secret",
    "credentials",
  ]);

  // =========================================================================
  // Estado interno del puente de comunicación
  // =========================================================================

  /** Conjunto de orígenes normalizados autorizados. @type {Set<string>} */
  let _allowedOrigins = new Set();

  /** Indica si la lista de orígenes fue provista explícitamente por opciones. @type {boolean} */
  let _explicitOriginsConfigured = false;

  /** Opciones vigentes de inicialización. @type {Object} */
  let _initOptions = {};

  /** Indica si el listener `window.addEventListener("message", ...)` ya fue registrado. @type {boolean} */
  let _listenerRegistered = false;

  /** Indica si el listener para `argenmap:map-ready` ya fue registrado. @type {boolean} */
  let _mapReadyListenerRegistered = false;

  /** Indica si ya se emitió `VIEWER_READY` en el ciclo de vida actual. @type {boolean} */
  let _viewerReadySent = false;

  /** Origen del documento padre ya validado contra `_allowedOrigins`. @type {string|null} */
  let _validatedParentOrigin = null;

  /** Referencia a la función manejadora de mensajes registrada en `window`. @type {Function|null} */
  let _boundMessageHandler = null;

  /** Referencia a la función manejadora del evento `argenmap:map-ready`. @type {Function|null} */
  let _boundMapReadyHandler = null;

  // =========================================================================
  // Helpers de acceso seguro al entorno
  // =========================================================================

  function getWindow() {
    if (typeof window !== "undefined" && window) return window;
    if (root && root.window) return root.window;
    if (root && typeof root.addEventListener === "function") return root;
    return null;
  }

  function getDocument() {
    if (typeof document !== "undefined" && document) return document;
    if (root && root.document) return root.document;
    const win = getWindow();
    if (win && win.document) return win.document;
    return null;
  }

  function getApp() {
    if (typeof app !== "undefined" && app) return app;
    if (root && root.app) return root.app;
    const win = getWindow();
    if (win && win.app) return win.app;
    return null;
  }

  function getMapa() {
    if (typeof mapa !== "undefined" && mapa && typeof mapa === "object") return mapa;
    if (root && root.mapa && typeof root.mapa === "object") return root.mapa;
    const win = getWindow();
    if (win && win.mapa && typeof win.mapa === "object") return win.mapa;
    return null;
  }

  function getConfigProcessor() {
    if (typeof ConfigProcessor !== "undefined" && ConfigProcessor) {
      return ConfigProcessor;
    }
    if (root && root.ConfigProcessor) {
      return root.ConfigProcessor;
    }
    const win = getWindow();
    if (win && win.ConfigProcessor) {
      return win.ConfigProcessor;
    }
    return null;
  }

  function getLiveUpdater() {
    if (typeof LiveUpdater !== "undefined" && LiveUpdater) {
      return LiveUpdater;
    }
    if (root && root.LiveUpdater) {
      return root.LiveUpdater;
    }
    const win = getWindow();
    if (win && win.LiveUpdater) {
      return win.LiveUpdater;
    }
    return null;
  }

  function getMapReadyEventName() {
    if (
      typeof ARGENMAP_EVENTS !== "undefined" &&
      ARGENMAP_EVENTS &&
      typeof ARGENMAP_EVENTS.MAP_READY === "string"
    ) {
      return ARGENMAP_EVENTS.MAP_READY;
    }
    if (
      root &&
      root.ARGENMAP_EVENTS &&
      typeof root.ARGENMAP_EVENTS.MAP_READY === "string"
    ) {
      return root.ARGENMAP_EVENTS.MAP_READY;
    }
    return "argenmap:map-ready";
  }

  /**
   * Determina si un valor es un objeto plano.
   * @param {*} value - Valor a evaluar.
   * @returns {boolean}
   */
  function isPlainObject(value) {
    return (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      Object.prototype.toString.call(value) === "[object Object]"
    );
  }

  /**
   * Sanitiza recursivamente un objeto o arreglo clonándolo sin claves internas ni funciones.
   * @param {*} value - Valor a sanitizar.
   * @returns {*}
   */
  function sanitizeDeclarativeData(value) {
    if (value === null || typeof value !== "object") {
      return typeof value === "function" ? undefined : value;
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeDeclarativeData);
    }
    const clean = {};
    for (const key of Object.keys(value)) {
      if (INTERNAL_STRIP_KEYS.has(key) || key.startsWith("_")) {
        continue;
      }
      const propVal = value[key];
      if (typeof propVal === "function") {
        continue;
      }
      clean[key] = sanitizeDeclarativeData(propVal);
    }
    return clean;
  }

  // =========================================================================
  // Detección de contexto embebido y disponibilidad del visor
  // =========================================================================

  /**
   * Determina si Argenmap se está ejecutando embebido dentro de un `<iframe>`
   * con una ventana padre válida y distinta de la propia ventana.
   *
   * @param {Window} [win] - Objeto ventana a inspeccionar.
   * @returns {boolean} `true` si está embebido en un iframe; `false` en ejecución standalone.
   */
  function isEmbedded(win = getWindow()) {
    if (!win || typeof win !== "object") {
      return false;
    }
    try {
      if (!win.parent || typeof win.parent.postMessage !== "function") {
        return false;
      }
      const selfRef = win.self || win;
      if (win.parent === win || win.parent === selfRef) {
        return false;
      }
      if (win.top !== undefined && (win.top === win || win.top === selfRef)) {
        return false;
      }
      return true;
    } catch (_securityError) {
      // Un SecurityError al acceder a propiedades de jerarquía de ventanas indica iframe cross-origin
      return Boolean(win.parent && win.parent !== win);
    }
  }

  /**
   * Verifica si la instancia de Leaflet (`mapa`) y los módulos requeridos
   * (`ConfigProcessor` y `LiveUpdater`) están inicializados y listos.
   *
   * @returns {boolean}
   */
  function isViewerReady() {
    const currentMapa = getMapa();
    const processor = getConfigProcessor();
    const updater = getLiveUpdater();

    const mapInitialized = Boolean(
      currentMapa &&
        typeof currentMapa === "object" &&
        (Object.prototype.hasOwnProperty.call(currentMapa, "_leaflet_id") ||
          currentMapa._leaflet_id !== undefined)
    );

    const modulesReady = Boolean(
      processor &&
        typeof processor.prepareConfigUpdate === "function" &&
        updater &&
        typeof updater.applyConfiguration === "function" &&
        typeof updater.getCurrentConfig === "function"
    );

    return mapInitialized && modulesReady;
  }

  // =========================================================================
  // Gestión y validación de orígenes permitidos
  // =========================================================================

  /**
   * Normaliza y valida una cadena de origen (`http://` o `https://`).
   * Rechaza comodines (`"*"`), `"null"`, esquemas no seguros y rutas con path/query/hash.
   *
   * @param {*} rawOrigin - Origen a normalizar.
   * @param {Object} [options={}] - Opciones (`{ allowTrailingSlash: boolean }`).
   * @returns {string|null} Origen normalizado (ej. `"https://editor.ign.gob.ar"`) o `null` si es inválido.
   */
  function normalizeOrigin(rawOrigin, options = {}) {
    if (typeof rawOrigin !== "string") {
      return null;
    }
    const trimmed = rawOrigin.trim();
    if (
      !trimmed ||
      trimmed === "*" ||
      trimmed.toLowerCase() === "null" ||
      trimmed.includes("*")
    ) {
      return null;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      if (!parsed.origin || parsed.origin === "null") {
        return null;
      }
      if (parsed.username || parsed.password || parsed.search || parsed.hash) {
        return null;
      }
      if (options.allowTrailingSlash) {
        if (parsed.pathname !== "/" && parsed.pathname !== "") {
          return null;
        }
      } else {
        // Para event.origin, no debe incluir barra final ni ruta
        if (trimmed !== parsed.origin) {
          return null;
        }
      }
      return parsed.origin;
    } catch (_err) {
      return null;
    }
  }

  /**
   * Determina si el entorno actual corresponde a desarrollo local.
   *
   * @param {Window} [win] - Ventana actual.
   * @param {Document} [doc] - Documento actual.
   * @returns {boolean}
   */
  function isDevelopmentEnvironment(win = getWindow(), doc = getDocument()) {
    if (doc && typeof doc.querySelector === "function") {
      const buildMeta = doc.querySelector('meta[name="argenmap-build"]');
      const buildContent = buildMeta?.content || buildMeta?.getAttribute?.("content");
      if (buildContent === "production") {
        return false;
      }
      if (buildContent === "development") {
        return true;
      }
    }

    const hostname = win?.location?.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    return false;
  }

  /**
   * Extrae una lista de cadenas de origen a partir de un valor (arreglo o string separado por comas).
   * @param {*} rawList - Lista de entrada.
   * @returns {string[]}
   */
  function parseOriginListInput(rawList) {
    if (Array.isArray(rawList)) {
      return rawList
        .map((item) => normalizeOrigin(item, { allowTrailingSlash: true }))
        .filter(Boolean);
    }
    if (typeof rawList === "string" && rawList.trim()) {
      return rawList
        .split(",")
        .map((item) => normalizeOrigin(item, { allowTrailingSlash: true }))
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Resuelve el conjunto de orígenes permitidos a partir de las opciones provistas,
   * variables de configuración de Argenmap (`app`, `<meta>`, `window.ARGENMAP_ALLOWED_ORIGINS`)
   * o la política explícita de desarrollo local.
   *
   * Si no existe una política de orígenes configurada y no se está en modo desarrollo,
   * devuelve un conjunto vacío (deshabilitando cualquier comunicación externa).
   *
   * @param {Object} [options={}] - Opciones de configuración.
   * @returns {Set<string>}
   */
  function resolveAllowedOrigins(options = {}) {
    const win = getWindow();
    const doc = getDocument();
    const currentApp = getApp();

    // 1. Si se proporcionó explícitamente `options.allowedOrigins`, usar exclusivamente esa lista
    if (options && Object.prototype.hasOwnProperty.call(options, "allowedOrigins")) {
      return new Set(parseOriginListInput(options.allowedOrigins));
    }

    // 2. Buscar configuración explícita en el entorno de Argenmap
    const configuredOrigins = [];

    if (win && win.ARGENMAP_ALLOWED_ORIGINS !== undefined) {
      configuredOrigins.push(...parseOriginListInput(win.ARGENMAP_ALLOWED_ORIGINS));
    }

    if (doc && typeof doc.querySelector === "function") {
      const originsMeta = doc.querySelector('meta[name="argenmap-allowed-origins"]');
      const metaContent =
        originsMeta?.content || originsMeta?.getAttribute?.("content");
      if (metaContent) {
        configuredOrigins.push(...parseOriginListInput(metaContent));
      }
    }

    if (currentApp) {
      if (currentApp.messaging?.allowedOrigins !== undefined) {
        configuredOrigins.push(
          ...parseOriginListInput(currentApp.messaging.allowedOrigins)
        );
      }
      if (currentApp.allowedOrigins !== undefined) {
        configuredOrigins.push(...parseOriginListInput(currentApp.allowedOrigins));
      }
    }

    if (configuredOrigins.length > 0) {
      return new Set(configuredOrigins);
    }

    // 3. En entorno de desarrollo, permitir orígenes locales explícitos si no se deshabilitó
    const allowDevDefaults = options?.allowDefaultDevOrigins !== false;
    if (allowDevDefaults && isDevelopmentEnvironment(win, doc)) {
      const devOrigins = [...DEFAULT_DEV_ALLOWED_ORIGINS];
      const selfOrigin = normalizeOrigin(win?.location?.origin, {
        allowTrailingSlash: true,
      });
      if (selfOrigin) {
        devOrigins.push(selfOrigin);
      }
      return new Set(devOrigins);
    }

    // 4. Sin política configurada en producción: no habilitar orígenes indiscriminadamente
    return new Set();
  }

  /**
   * Establece explícitamente la lista de orígenes permitidos.
   * Ignora comodines `"*"` o valores inválidos.
   *
   * @param {string[]|string} origins - Lista de orígenes permitidos.
   * @returns {string[]} Lista de orígenes normalizados activos.
   */
  function setAllowedOrigins(origins) {
    _explicitOriginsConfigured = true;
    _allowedOrigins = new Set(parseOriginListInput(origins));
    if (_validatedParentOrigin && !_allowedOrigins.has(_validatedParentOrigin)) {
      _validatedParentOrigin = null;
    }
    return Array.from(_allowedOrigins);
  }

  /**
   * Obtiene la lista actual de orígenes permitidos.
   * @returns {string[]}
   */
  function getAllowedOrigins() {
    return Array.from(_allowedOrigins);
  }

  /**
   * Comprueba si un `origin` está autorizado por la política vigente.
   * Nunca acepta `"*"` ni orígenes no incluidos en `_allowedOrigins`.
   *
   * @param {*} origin - Origen a verificar (ej. `event.origin`).
   * @returns {boolean}
   */
  function isOriginAllowed(origin) {
    const normalized = normalizeOrigin(origin, { allowTrailingSlash: false });
    if (!normalized) {
      return false;
    }
    return _allowedOrigins.has(normalized);
  }

  /**
   * Comprueba que el emisor del evento (`event.source`) sea estrictamente `window.parent`
   * y que el visor se encuentre efectivamente embebido.
   *
   * @param {MessageEvent} event - Evento `message` recibido.
   * @param {Window} [win] - Ventana actual.
   * @returns {boolean}
   */
  function isValidSource(event, win = getWindow()) {
    if (!event || !win || !isEmbedded(win)) {
      return false;
    }
    return Boolean(
      event.source &&
        event.source === win.parent &&
        event.source !== win &&
        event.source !== (win.self || win)
    );
  }

  /**
   * Determina de manera segura el `targetOrigin` validado del documento padre
   * para emitir `VIEWER_READY` sin utilizar jamás `"*"`.
   *
   * Si se detecta que el documento padre real (`ancestorOrigins` o `document.referrer`)
   * posee un origen que NO pertenece a `_allowedOrigins`, retorna `null` y bloquea el envío.
   *
   * @returns {string|null} Origen validado del padre o `null` si no puede verificarse.
   */
  function resolveParentTargetOrigin() {
    if (_allowedOrigins.size === 0) {
      return null;
    }

    // 1. Si ya se validó el origen del padre (por mensaje previo o configuración explícita validada)
    if (_validatedParentOrigin && _allowedOrigins.has(_validatedParentOrigin)) {
      return _validatedParentOrigin;
    }

    const win = getWindow();
    const doc = getDocument();

    // 2. Verificar `location.ancestorOrigins[0]` cuando el navegador lo provee
    const ancestorOrigins = win?.location?.ancestorOrigins;
    if (ancestorOrigins && ancestorOrigins.length > 0 && ancestorOrigins[0]) {
      const normalizedAncestor = normalizeOrigin(ancestorOrigins[0], {
        allowTrailingSlash: true,
      });
      if (normalizedAncestor && _allowedOrigins.has(normalizedAncestor)) {
        return normalizedAncestor;
      }
      // El padre real no está en la lista de orígenes permitidos
      return null;
    }

    // 3. Verificar `document.referrer` cuando está disponible
    if (doc && typeof doc.referrer === "string" && doc.referrer.trim()) {
      try {
        const referrerOrigin = normalizeOrigin(new URL(doc.referrer).origin, {
          allowTrailingSlash: false,
        });
        if (referrerOrigin && _allowedOrigins.has(referrerOrigin)) {
          return referrerOrigin;
        }
        // El referrer existe pero no pertenece a los orígenes autorizados
        return null;
      } catch (_err) {
        return null;
      }
    }

    // 4. Si se configuró un único origen permitido explícito
    if (_allowedOrigins.size === 1) {
      return Array.from(_allowedOrigins)[0];
    }

    // 5. Si el origen propio está dentro de los permitidos (mismo origen en entorno local)
    const selfOrigin = normalizeOrigin(win?.location?.origin, {
      allowTrailingSlash: true,
    });
    if (selfOrigin && _allowedOrigins.has(selfOrigin)) {
      return selfOrigin;
    }

    return null;
  }

  // =========================================================================
  // Validación del protocolo de mensajes
  // =========================================================================

  /**
   * Valida la estructura, versión y campos requeridos de un mensaje entrante.
   *
   * @param {*} message - Datos del mensaje (`event.data`).
   * @returns {{ isValid: boolean, error: string|null }}
   */
  function validateMessage(message) {
    if (!isPlainObject(message)) {
      return {
        isValid: false,
        error: "El mensaje debe ser un objeto plano.",
      };
    }

    if (message.protocol !== PROTOCOL_NAME) {
      return {
        isValid: false,
        error: `El campo 'protocol' debe ser '${PROTOCOL_NAME}'.`,
      };
    }

    if (
      typeof message.version !== "number" ||
      !Number.isInteger(message.version) ||
      message.version !== PROTOCOL_VERSION
    ) {
      return {
        isValid: false,
        error: `Versión de protocolo incompatible: se esperaba ${PROTOCOL_VERSION}.`,
      };
    }

    if (
      typeof message.type !== "string" ||
      !INCOMING_MESSAGE_TYPES.has(message.type)
    ) {
      return {
        isValid: false,
        error: "El campo 'type' no corresponde a un mensaje entrante admitido.",
      };
    }

    if (
      typeof message.messageId !== "string" ||
      message.messageId.length === 0 ||
      message.messageId.length > MAX_MESSAGE_ID_LENGTH ||
      !MESSAGE_ID_PATTERN.test(message.messageId)
    ) {
      return {
        isValid: false,
        error: "El campo 'messageId' es obligatorio y debe tener un formato válido (1-128 caracteres).",
      };
    }

    if (message.type === MESSAGE_TYPES.UPDATE_CONFIG) {
      if (!isPlainObject(message.payload)) {
        return {
          isValid: false,
          error: "El mensaje 'UPDATE_CONFIG' requiere un objeto 'payload'.",
        };
      }

      if (
        message.payload.partial !== undefined &&
        typeof message.payload.partial !== "boolean"
      ) {
        return {
          isValid: false,
          error: "El campo 'payload.partial' debe ser un valor booleano.",
        };
      }

      if (!isPlainObject(message.payload.config)) {
        return {
          isValid: false,
          error: "El mensaje 'UPDATE_CONFIG' requiere un objeto 'payload.config'.",
        };
      }
    } else if (message.type === MESSAGE_TYPES.GET_CONFIG) {
      if (
        message.payload !== undefined &&
        message.payload !== null &&
        !isPlainObject(message.payload)
      ) {
        return {
          isValid: false,
          error: "El campo 'payload' en 'GET_CONFIG' debe omitirse o ser un objeto plano.",
        };
      }
    }

    return { isValid: true, error: null };
  }

  // =========================================================================
  // Envío seguro de mensajes al documento padre
  // =========================================================================

  /**
   * Envía un mensaje del protocolo Argenmap a la ventana padre validada.
   * Garantiza que nunca se utilice `targetOrigin: "*"` ni se envíe a una ventana
   * distinta de `window.parent`.
   *
   * @param {Window} targetWindow - Ventana destino (`event.source` o `window.parent`).
   * @param {string} targetOrigin - Origen validado del destinatario.
   * @param {Object} messageFields - Campos del mensaje (`type`, `messageId`, `payload`).
   * @returns {boolean} `true` si el mensaje fue enviado; `false` si fue bloqueado por seguridad.
   */
  function sendToParent(targetWindow, targetOrigin, messageFields) {
    const win = getWindow();
    if (!win || !isEmbedded(win)) {
      return false;
    }

    if (
      !targetWindow ||
      targetWindow !== win.parent ||
      targetWindow === win ||
      typeof targetWindow.postMessage !== "function"
    ) {
      return false;
    }

    const normalizedTargetOrigin = normalizeOrigin(targetOrigin, {
      allowTrailingSlash: false,
    });
    if (
      !normalizedTargetOrigin ||
      normalizedTargetOrigin === "*" ||
      !_allowedOrigins.has(normalizedTargetOrigin)
    ) {
      return false;
    }

    const envelope = {
      protocol: PROTOCOL_NAME,
      version: PROTOCOL_VERSION,
      type: messageFields.type,
    };

    if (messageFields.messageId !== undefined) {
      envelope.messageId = messageFields.messageId;
    }
    if (messageFields.payload !== undefined) {
      envelope.payload = messageFields.payload;
    }

    targetWindow.postMessage(envelope, normalizedTargetOrigin);
    return true;
  }

  /**
   * Emite el mensaje `VIEWER_READY` al documento padre una única vez por inicialización,
   * siempre que el visor esté embebido, el mapa y módulos estén listos y exista un
   * origen destino validado.
   *
   * @returns {boolean} `true` si se emitió en esta llamada; `false` en caso contrario.
   */
  function notifyViewerReady() {
    if (_viewerReadySent) {
      return false;
    }

    const win = getWindow();
    if (!isEmbedded(win) || !isViewerReady()) {
      return false;
    }

    // Si los orígenes no fueron fijados manualmente, refrescar desde `app` por si `preferences.json`
    // terminó de cargarse justo antes de `argenmap:map-ready`.
    if (!_explicitOriginsConfigured) {
      const refreshed = resolveAllowedOrigins(_initOptions);
      if (refreshed.size > 0) {
        _allowedOrigins = refreshed;
      }
    }

    if (_allowedOrigins.size === 0) {
      return false;
    }

    // Asegurar que la configuración declarativa inicial quede capturada en LiveUpdater
    const updater = getLiveUpdater();
    if (updater && typeof updater.getCurrentConfig === "function") {
      try {
        updater.getCurrentConfig();
      } catch (_err) {
        // Ignorar si ocurre algún problema no crítico al pre-capturar estado inicial
      }
    }

    const targetOrigin = resolveParentTargetOrigin();
    if (!targetOrigin) {
      return false;
    }

    const sent = sendToParent(win.parent, targetOrigin, {
      type: MESSAGE_TYPES.VIEWER_READY,
    });

    if (sent) {
      _viewerReadySent = true;
    }
    return sent;
  }

  // =========================================================================
  // Procesamiento de mensajes entrantes
  // =========================================================================

  /**
   * Procesa un mensaje `UPDATE_CONFIG` delegando la validación de contenido,
   * normalización y reconciliación en `LiveUpdater.applyConfiguration()`, y
   * responde al padre con `CONFIG_UPDATED`.
   *
   * @param {MessageEvent} event - Evento original.
   * @param {string} validatedOrigin - Origen ya validado del mensaje.
   * @param {Object} message - Mensaje validado.
   * @returns {Promise<Object>} Resultado enviado en `CONFIG_UPDATED`.
   */
  async function handleUpdateConfig(event, validatedOrigin, message) {
    const { messageId, payload } = message;

    if (!isViewerReady()) {
      const notReadyPayload = {
        success: false,
        hasChanges: false,
        appliedSections: [],
        warnings: [],
        errors: [
          "El visor aún no está inicializado para aplicar configuraciones.",
        ],
      };
      sendToParent(event.source, validatedOrigin, {
        type: MESSAGE_TYPES.CONFIG_UPDATED,
        messageId,
        payload: notReadyPayload,
      });
      return notReadyPayload;
    }

    const updater = getLiveUpdater();
    const partial = payload.partial === true;
    const incomingConfig = payload.config;

    try {
      const updateResult = await updater.applyConfiguration(incomingConfig, {
        partial,
      });

      const responsePayload = {
        success: Boolean(updateResult && updateResult.success),
        hasChanges: Boolean(updateResult && updateResult.hasChanges),
        appliedSections: Array.isArray(updateResult?.appliedSections)
          ? [...updateResult.appliedSections]
          : [],
        warnings: Array.isArray(updateResult?.warnings)
          ? [...updateResult.warnings]
          : [],
        errors: Array.isArray(updateResult?.errors)
          ? [...updateResult.errors]
          : [],
      };

      sendToParent(event.source, validatedOrigin, {
        type: MESSAGE_TYPES.CONFIG_UPDATED,
        messageId,
        payload: responsePayload,
      });

      return responsePayload;
    } catch (_unexpectedError) {
      const errorPayload = {
        success: false,
        hasChanges: false,
        appliedSections: [],
        warnings: [],
        errors: [
          "Se produjo un error inesperado al aplicar la configuración en el visor.",
        ],
      };

      sendToParent(event.source, validatedOrigin, {
        type: MESSAGE_TYPES.CONFIG_UPDATED,
        messageId,
        payload: errorPayload,
      });

      return errorPayload;
    }
  }

  /**
   * Procesa un mensaje `GET_CONFIG` obteniendo la configuración declarativa actual
   * mediante `LiveUpdater.getCurrentConfig()` y enviando `CONFIG_STATE` al padre.
   *
   * @param {MessageEvent} event - Evento original.
   * @param {string} validatedOrigin - Origen ya validado del mensaje.
   * @param {Object} message - Mensaje validado.
   * @returns {Object|null} Payload enviado en `CONFIG_STATE`.
   */
  function handleGetConfig(event, validatedOrigin, message) {
    const { messageId } = message;

    if (!isViewerReady()) {
      return null;
    }

    const updater = getLiveUpdater();

    try {
      let currentConfig = updater.getCurrentConfig();
      if (
        !isPlainObject(currentConfig) ||
        (!isPlainObject(currentConfig.data) &&
          !isPlainObject(currentConfig.preferences))
      ) {
        if (typeof updater.extractRuntimeConfig === "function") {
          const processor = getConfigProcessor();
          const extracted = updater.extractRuntimeConfig();
          currentConfig =
            processor && typeof processor.normalizeConfig === "function"
              ? processor.normalizeConfig(extracted)
              : extracted;
        }
      }

      const safePayload = {
        data: isPlainObject(currentConfig?.data)
          ? sanitizeDeclarativeData(currentConfig.data)
          : {},
        preferences: isPlainObject(currentConfig?.preferences)
          ? sanitizeDeclarativeData(currentConfig.preferences)
          : {},
      };

      sendToParent(event.source, validatedOrigin, {
        type: MESSAGE_TYPES.CONFIG_STATE,
        messageId,
        payload: safePayload,
      });

      return safePayload;
    } catch (_unexpectedError) {
      return null;
    }
  }

  /**
   * Manejador principal de eventos `message` recibidos en `window`.
   *
   * @param {MessageEvent} event - Evento `message` del navegador.
   * @returns {Promise<{ handled: boolean, reason?: string, type?: string }>}
   */
  async function handleMessageEvent(event) {
    const win = getWindow();

    // 1. Verificar contexto embebido y emisor (`event.source === window.parent`)
    if (!isValidSource(event, win)) {
      return { handled: false, reason: "invalid_source" };
    }

    // 2. Validar estrictamente `event.origin`
    if (!isOriginAllowed(event.origin)) {
      return { handled: false, reason: "unauthorized_origin" };
    }

    const validatedOrigin = normalizeOrigin(event.origin, {
      allowTrailingSlash: false,
    });

    // 3. Validar estructura y contrato del mensaje
    const validation = validateMessage(event.data);
    if (!validation.isValid) {
      return { handled: false, reason: "invalid_message", error: validation.error };
    }

    // Registrar el origen validado del documento padre
    _validatedParentOrigin = validatedOrigin;

    const message = event.data;

    // 4. Despachar según tipo de mensaje admitido
    if (message.type === MESSAGE_TYPES.UPDATE_CONFIG) {
      await handleUpdateConfig(event, validatedOrigin, message);
      return { handled: true, type: MESSAGE_TYPES.UPDATE_CONFIG };
    }

    if (message.type === MESSAGE_TYPES.GET_CONFIG) {
      handleGetConfig(event, validatedOrigin, message);
      return { handled: true, type: MESSAGE_TYPES.GET_CONFIG };
    }

    return { handled: false, reason: "unsupported_type" };
  }

  // =========================================================================
  // Ciclo de vida: inicialización y limpieza del puente
  // =========================================================================

  /**
   * Registra el listener de `window.addEventListener("message", ...)` una única vez.
   * @param {Window} win - Ventana donde registrar el listener.
   */
  function ensureMessageListenerRegistered(win) {
    if (_listenerRegistered || !win || typeof win.addEventListener !== "function") {
      return;
    }
    _boundMessageHandler = function onWindowMessage(event) {
      return handleMessageEvent(event);
    };
    win.addEventListener("message", _boundMessageHandler);
    _listenerRegistered = true;
  }

  /**
   * Inicializa el puente de comunicación bidireccional.
   *
   * - En modo standalone (`window.parent === window`), no registra listeners ni
   *   emite mensajes.
   * - En modo embebido (`<iframe>`), configura la política de orígenes permitidos,
   *   registra el listener una sola vez y emite `VIEWER_READY` cuando el mapa está listo.
   *
   * @param {Object} [options={}] - Opciones de inicialización (`{ allowedOrigins, parentOrigin, allowDefaultDevOrigins }`).
   * @returns {{ initialized: boolean, embedded: boolean, listenerRegistered: boolean, viewerReadySent: boolean, reason?: string }}
   */
  function init(options = {}) {
    const win = getWindow();
    _initOptions = isPlainObject(options) ? { ...options } : {};

    if (!isEmbedded(win)) {
      return {
        initialized: false,
        embedded: false,
        listenerRegistered: false,
        viewerReadySent: false,
        reason: "standalone",
      };
    }

    if (Object.prototype.hasOwnProperty.call(_initOptions, "allowedOrigins")) {
      _explicitOriginsConfigured = true;
      _allowedOrigins = new Set(parseOriginListInput(_initOptions.allowedOrigins));
    } else if (!_explicitOriginsConfigured) {
      _allowedOrigins = resolveAllowedOrigins(_initOptions);
    }

    if (_initOptions.parentOrigin) {
      const normalizedParent = normalizeOrigin(_initOptions.parentOrigin, {
        allowTrailingSlash: true,
      });
      if (normalizedParent && _allowedOrigins.has(normalizedParent)) {
        _validatedParentOrigin = normalizedParent;
      }
    }

    // Si ya existen orígenes permitidos configurados, registrar el receptor una sola vez
    if (_allowedOrigins.size > 0) {
      ensureMessageListenerRegistered(win);
    }

    // Si el visor ya está completamente disponible, anunciar VIEWER_READY inmediatamente
    if (isViewerReady()) {
      if (_allowedOrigins.size > 0) {
        ensureMessageListenerRegistered(win);
        notifyViewerReady();
      }
    } else if (!_mapReadyListenerRegistered && typeof win.addEventListener === "function") {
      // Esperar al evento de disponibilidad del mapa sin usar intervalos de sondeo
      const mapReadyEvent = getMapReadyEventName();
      _boundMapReadyHandler = function onArgenmapMapReady() {
        _mapReadyListenerRegistered = false;
        if (!_explicitOriginsConfigured) {
          const refreshed = resolveAllowedOrigins(_initOptions);
          if (refreshed.size > 0) {
            _allowedOrigins = refreshed;
          }
        }
        if (_allowedOrigins.size > 0) {
          ensureMessageListenerRegistered(win);
          notifyViewerReady();
        }
      };
      win.addEventListener(mapReadyEvent, _boundMapReadyHandler, { once: true });
      _mapReadyListenerRegistered = true;
    }

    if (_allowedOrigins.size === 0 && !_mapReadyListenerRegistered) {
      return {
        initialized: false,
        embedded: true,
        listenerRegistered: _listenerRegistered,
        viewerReadySent: _viewerReadySent,
        reason: "no_allowed_origins",
      };
    }

    return {
      initialized: _listenerRegistered || _mapReadyListenerRegistered,
      embedded: true,
      listenerRegistered: _listenerRegistered,
      viewerReadySent: _viewerReadySent,
    };
  }

  /**
   * Desregistra los listeners activos y reinicia el estado interno del puente.
   */
  function destroy() {
    const win = getWindow();
    if (win && typeof win.removeEventListener === "function") {
      if (_listenerRegistered && _boundMessageHandler) {
        win.removeEventListener("message", _boundMessageHandler);
      }
      if (_mapReadyListenerRegistered && _boundMapReadyHandler) {
        win.removeEventListener(getMapReadyEventName(), _boundMapReadyHandler);
      }
    }

    _listenerRegistered = false;
    _mapReadyListenerRegistered = false;
    _viewerReadySent = false;
    _validatedParentOrigin = null;
    _boundMessageHandler = null;
    _boundMapReadyHandler = null;
    _explicitOriginsConfigured = false;
    _initOptions = {};
    _allowedOrigins.clear();
  }

  /**
   * Devuelve el estado diagnóstico actual del puente de comunicación.
   * @returns {{
   *   embedded: boolean,
   *   viewerReady: boolean,
   *   listenerRegistered: boolean,
   *   viewerReadySent: boolean,
   *   allowedOrigins: string[],
   *   validatedParentOrigin: string|null
   * }}
   */
  function getStatus() {
    return {
      embedded: isEmbedded(),
      viewerReady: isViewerReady(),
      listenerRegistered: _listenerRegistered,
      viewerReadySent: _viewerReadySent,
      allowedOrigins: getAllowedOrigins(),
      validatedParentOrigin: _validatedParentOrigin,
    };
  }

  // Auto-inicialización cuando se carga como script en el navegador
  const currentWin = getWindow();
  if (
    currentWin &&
    typeof currentWin.addEventListener === "function" &&
    currentWin.ARGENMAP_DISABLE_AUTO_MESSAGE_BRIDGE !== true
  ) {
    init();
  }

  return {
    PROTOCOL_NAME,
    PROTOCOL_VERSION,
    MESSAGE_TYPES,
    init,
    destroy,
    getStatus,
    isEmbedded,
    isViewerReady,
    normalizeOrigin,
    isOriginAllowed,
    setAllowedOrigins,
    getAllowedOrigins,
    isValidSource,
    validateMessage,
    notifyViewerReady,
    handleMessageEvent,
  };
});
