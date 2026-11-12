import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Cargar código fuente real de los módulos del repositorio
const processorSource = fs.readFileSync(
  "src/js/components/messaging/config-processor.js",
  "utf8"
);
const updaterSource = fs.readFileSync(
  "src/js/components/messaging/live-updater.js",
  "utf8"
);
const bridgeSource = fs.readFileSync(
  "src/js/components/messaging/message-bridge.js",
  "utf8"
);
const indexHtmlSource = fs.readFileSync("index.html", "utf8");
const appSource = fs.readFileSync("src/js/app.js", "utf8");
const adapterStart = appSource.indexOf("const CURRENT_CONFIG_SCHEMA_VERSION");
const adapterEnd = appSource.indexOf("function normalizeConfigSectionsAndLayers");
assert.ok(
  adapterStart >= 0 && adapterEnd > adapterStart,
  "ConfigurationAdapter existe en src/js/app.js"
);

const SAMPLE_CAPABILITIES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0">
  <Service>
    <Name>WMS</Name>
    <Title>Servicio WMS IGN</Title>
    <Abstract>Capas geográficas del IGN</Abstract>
    <KeywordList><Keyword>IGN</Keyword></KeywordList>
  </Service>
  <Capability>
    <Layer>
      <Title>Root</Title>
      <Layer queryable="1">
        <Name>ign:provincias</Name>
        <Title>Provincias</Title>
        <Abstract>Límites provinciales</Abstract>
      </Layer>
      <Layer queryable="1">
        <Name>ign:rutas</Name>
        <Title>Rutas Nacionales</Title>
        <Abstract>Red vial</Abstract>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

/**
 * Crea un entorno aislado (VM) que simula el navegador, la jerarquía de ventanas
 * (`window`, `window.parent`), Leaflet (`mapa`), `app`, `gestorMenu`, `ConfigProcessor`,
 * `LiveUpdater` y `MessageBridge`.
 */
function createBridgeTestHarness({
  embedded = true,
  mapInitiallyReady = true,
  buildEnv = "development",
  locationOrigin = "http://localhost:8080",
  locationHostname = "localhost",
  referrer = "http://localhost:3000/editor",
  ancestorOrigins = null,
  metaAllowedOrigins = null,
  globalAllowedOrigins = undefined,
  appAllowedOrigins = undefined,
  autoInitBridge = false,
  customFetch = null,
} = {}) {
  let nextLeafletId = 5001;
  const sentMessages = [];
  const windowEventListeners = new Map();

  // Mock DOM básico
  const domElements = new Map();
  function createMockElement(tagName, id = "") {
    const attrs = new Map();
    const classes = new Set();
    const el = {
      tagName: String(tagName).toUpperCase(),
      id,
      title: "",
      href: "",
      src: "",
      alt: "",
      rel: "",
      content: "",
      innerHTML: "",
      textContent: "",
      style: { cssText: "", width: "", height: "", display: "", top: "" },
      children: [],
      classList: {
        add(...tokens) {
          tokens.forEach((t) => classes.add(t));
        },
        remove(...tokens) {
          tokens.forEach((t) => classes.delete(t));
        },
        contains(token) {
          return classes.has(token);
        },
      },
      setAttribute(name, val) {
        attrs.set(name, String(val));
        if (name === "id") {
          this.id = String(val);
          domElements.set(this.id, this);
        }
        if (name === "content") this.content = String(val);
      },
      getAttribute(name) {
        return attrs.get(name) ?? null;
      },
      appendChild(child) {
        this.children.push(child);
        if (child.id) domElements.set(child.id, child);
        return child;
      },
      insertAdjacentHTML(_pos, html) {
        this.innerHTML += html;
      },
      remove() {
        if (this.id) domElements.delete(this.id);
      },
    };
    if (id) domElements.set(id, el);
    return el;
  }

  const headEl = createMockElement("head", "head");
  createMockElement("a", "top-left-logo-link");
  createMockElement("img", "top-left-logo");
  createMockElement("img", "top-right-logo");
  createMockElement("a", "logoText");
  const basemapSelectorEl = createMockElement("div", "basemap-selector");
  createMockElement("div", "sidebar");
  const faviconEl = createMockElement("link", "favicon-link");
  faviconEl.rel = "icon";
  headEl.appendChild(faviconEl);

  const buildMetaEl = createMockElement("meta");
  buildMetaEl.setAttribute("name", "argenmap-build");
  buildMetaEl.setAttribute("content", buildEnv);

  const allowedOriginsMetaEl = metaAllowedOrigins
    ? createMockElement("meta")
    : null;
  if (allowedOriginsMetaEl) {
    allowedOriginsMetaEl.setAttribute("name", "argenmap-allowed-origins");
    allowedOriginsMetaEl.setAttribute("content", metaAllowedOrigins);
  }

  const mockDocument = {
    title: "Argenmap",
    referrer: referrer || "",
    head: headEl,
    body: createMockElement("body", "body"),
    documentElement: {
      dataset: {
        argenmapMapReady: mapInitiallyReady ? "true" : "false",
      },
    },
    createElement(tag) {
      return createMockElement(tag);
    },
    getElementById(id) {
      return domElements.get(id) || null;
    },
    querySelector(selector) {
      if (selector === 'meta[name="argenmap-build"]') {
        return buildMetaEl;
      }
      if (selector === 'meta[name="argenmap-allowed-origins"]') {
        return allowedOriginsMetaEl;
      }
      if (selector === "div#basemap-selector" || selector === "#basemap-selector") {
        return basemapSelectorEl;
      }
      if (selector.includes('link[rel="icon"]')) {
        return faviconEl;
      }
      if (selector.startsWith("#")) {
        return domElements.get(selector.slice(1)) || null;
      }
      return null;
    },
  };

  function createTileLayer(url, options = {}) {
    return {
      _leaflet_id: nextLeafletId++,
      _url: url,
      options: { ...options },
      _onMap: false,
      _broughtToBack: false,
      addTo(mapInstance) {
        mapInstance.addLayer(this);
        return this;
      },
      removeFrom(mapInstance) {
        mapInstance.removeLayer(this);
        return this;
      },
      bringToBack() {
        this._broughtToBack = true;
        return this;
      },
      setOpacity(val) {
        this.options.opacity = Number(val);
      },
    };
  }

  const L = {
    tileLayer: Object.assign(
      function (url, options) {
        return createTileLayer(url, options);
      },
      {
        wms(url, options) {
          return createTileLayer(url, { ...options, isWms: true });
        },
        bing(options) {
          return createTileLayer("bing://tiles", { ...options, isBing: true });
        },
      }
    ),
  };

  function createMapaInstance() {
    const initialBaseLayer = createTileLayer(
      "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
      { attribution: "IGN", minZoom: 3, maxZoom: 21 }
    );
    const mapObj = {
      _leaflet_id: 4242,
      _center: { lat: -40, lng: -59 },
      _zoom: 4,
      _minZoom: 3,
      _maxZoom: 21,
      _layers: { [initialBaseLayer._leaflet_id]: initialBaseLayer },
      options: { minZoom: 3, maxZoom: 21 },
      getCenter() {
        return { ...this._center };
      },
      getZoom() {
        return this._zoom;
      },
      getMinZoom() {
        return this._minZoom;
      },
      getMaxZoom() {
        return this._maxZoom;
      },
      setView(centerArr, zoomVal) {
        this._center = Array.isArray(centerArr)
          ? { lat: Number(centerArr[0]), lng: Number(centerArr[1]) }
          : { lat: Number(centerArr.lat), lng: Number(centerArr.lng) };
        if (typeof zoomVal === "number" && Number.isFinite(zoomVal)) {
          this._zoom = zoomVal;
        }
      },
      setZoom(zoomVal) {
        this._zoom = Number(zoomVal);
      },
      setMinZoom(minVal) {
        this._minZoom = Number(minVal);
        this.options.minZoom = Number(minVal);
      },
      setMaxZoom(maxVal) {
        this._maxZoom = Number(maxVal);
        this.options.maxZoom = Number(maxVal);
      },
      hasLayer(layer) {
        return Boolean(layer && this._layers[layer._leaflet_id]);
      },
      addLayer(layer) {
        if (layer) {
          if (!layer._leaflet_id) layer._leaflet_id = nextLeafletId++;
          layer._onMap = true;
          this._layers[layer._leaflet_id] = layer;
        }
        return this;
      },
      removeLayer(layer) {
        if (layer && this._layers[layer._leaflet_id]) {
          layer._onMap = false;
          delete this._layers[layer._leaflet_id];
        }
        return this;
      },
      activeLayerHasChanged() {},
    };
    return { mapObj, initialBaseLayer };
  }

  const initialMapBundle = mapInitiallyReady ? createMapaInstance() : null;

  const initialItems = [
    {
      type: "basemap",
      peso: 1,
      nombre: "Mapas base",
      short_abstract: "",
      seccion: "mapasbase",
      capas: [
        {
          titulo: "Argenmap",
          nombre: "argenmap",
          servicio: "tms",
          version: "1.0.0",
          attribution: "IGN",
          host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png",
          zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 },
          selected: true,
        },
        {
          titulo: "Argenmap Gris",
          nombre: "argenmap_gris",
          servicio: "tms",
          version: "1.0.0",
          attribution: "IGN",
          host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png",
          zoom: { min: 3, max: 19, nativeMin: 3, nativeMax: 19 },
          selected: false,
        },
      ],
    },
  ];

  const app = {
    template: "ign-geoportal-basic",
    items: JSON.parse(JSON.stringify(initialItems)),
    layers: {},
    layerNameByDomId: {},
    title: "IGN - Argenmap",
    website: "https://www.ign.gob.ar/",
    favicon: "src/config/styles/images/favicon.ico",
    showSearchBar: true,
    mapConfig: {
      center: { latitude: -40, longitude: -59 },
      zoom: { initial: 4, min: 3, max: 21 },
    },
    theme: {
      headerBackground: "#157DB9",
      menuBackground: "#157DB9",
      bodyBackground: "#0094d4",
      activeLayer: "#33b560",
      iconBar: "#4f4f4f",
    },
    logo: {
      title: "IGN",
      src: "https://static.ign.gob.ar/img/logo.svg",
      link: "https://www.ign.gob.ar/",
    },
  };

  if (appAllowedOrigins !== undefined) {
    app.messaging = { allowedOrigins: appAllowedOrigins };
  }

  const gestorMenu = {
    items: {
      mapasbase: {
        seccion: "mapasbase",
        nombre: "Mapas base",
        itemsComposite: {},
        isBaseLayer: () => true,
        setItem(it) {
          this.itemsComposite[it.seccion] = it;
        },
      },
    },
    availableBaseLayers: ["argenmap", "argenmap_gris"],
    availableLayers: [],
    activeLayers: ["argenmap"],
    basemapSelected: "mapasbase0",
    lastBaseMapSelected: "argenmap",
    layersInfo: [],
    showSearcher: true,
    setAvailableBaseLayer(name) {
      if (!this.availableBaseLayers.includes(name)) {
        this.availableBaseLayers.push(name);
      }
    },
    setBasemapSelected(id) {
      this.basemapSelected = id;
    },
    setLastBaseMapSelected(name) {
      this.lastBaseMapSelected = name;
    },
    setBaseMapDependencies() {},
    addActiveLayer(name) {
      if (!this.activeLayers.includes(name)) this.activeLayers.push(name);
    },
    removeActiveLayer(name) {
      const idx = this.activeLayers.indexOf(name);
      if (idx >= 0) this.activeLayers.splice(idx, 1);
    },
    setShowSearcher(flag) {
      this.showSearcher = Boolean(flag);
    },
    printOnlySection() {},
    printMenu() {},
    getItemsGroupDOM: () => "#sidebar",
  };

  const parentWindow = embedded
    ? {
        postMessage(message, targetOrigin) {
          sentMessages.push({
            message: JSON.parse(JSON.stringify(message)),
            targetOrigin,
          });
        },
      }
    : null;

  const mockWindow = {
    location: {
      origin: locationOrigin,
      hostname: locationHostname,
      ancestorOrigins: ancestorOrigins,
    },
    document: mockDocument,
    ARGENMAP_DISABLE_AUTO_MESSAGE_BRIDGE: !autoInitBridge,
    ARGENMAP_ALLOWED_ORIGINS: globalAllowedOrigins,
    addEventListener(eventName, listener, options) {
      if (!windowEventListeners.has(eventName)) {
        windowEventListeners.set(eventName, []);
      }
      windowEventListeners.get(eventName).push({
        listener,
        once: Boolean(options?.once),
      });
    },
    removeEventListener(eventName, listener) {
      const list = windowEventListeners.get(eventName);
      if (!list) return;
      const idx = list.findIndex((entry) => entry.listener === listener);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      const eventName = event?.type || event;
      const list = windowEventListeners.get(eventName);
      if (!list) return true;
      const snapshot = [...list];
      for (const entry of snapshot) {
        if (entry.once) {
          this.removeEventListener(eventName, entry.listener);
        }
        entry.listener(event);
      }
      return true;
    },
    postMessage() {},
  };

  // En modo standalone: window.parent === window y window.top === window
  mockWindow.self = mockWindow;
  mockWindow.parent = embedded ? parentWindow : mockWindow;
  mockWindow.top = embedded ? parentWindow : mockWindow;

  const fetchImpl =
    customFetch ||
    (async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      text: async () => SAMPLE_CAPABILITIES_XML,
    }));

  const contextObj = {
    console,
    setTimeout,
    clearTimeout,
    URL,
    Promise,
    window: mockWindow,
    self: mockWindow,
    parent: mockWindow.parent,
    top: mockWindow.top,
    document: mockDocument,
    L,
    app,
    mapa: initialMapBundle ? initialMapBundle.mapObj : "",
    currentBaseMap: initialMapBundle ? initialMapBundle.initialBaseLayer : null,
    selectedBasemap: initialItems[0].capas[0],
    baseLayers: {
      argenmap: {
        attribution: "IGN",
        zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 },
      },
      argenmap_gris: {
        attribution: "IGN",
        zoom: { min: 3, max: 19, nativeMin: 3, nativeMax: 19 },
      },
    },
    baseLayersInfo: {
      argenmap: initialItems[0].capas[0],
      argenmap_gris: initialItems[0].capas[1],
    },
    overlayMaps: {},
    gestorMenu,
    fetch: fetchImpl,
    ARGENMAP_EVENTS: Object.freeze({
      RUNTIME_READY: "argenmap:runtime-ready",
      MAP_READY: "argenmap:map-ready",
      ACTIVE_LAYER_HANDLER_READY: "argenmap:active-layer-handler-ready",
    }),
    DEFAULT_MIN_ZOOM_LEVEL: 3,
    DEFAULT_MAX_ZOOM_LEVEL: 21,
    DEFAULT_MIN_NATIVE_ZOOM_LEVEL: 3,
    DEFAULT_MAX_NATIVE_ZOOM_LEVEL: 21,
    StylesUI: function () {
      this.createstyles = function () {
        const prev = mockDocument.getElementById("main-style-ui");
        if (prev) prev.remove();
        const styleEl = mockDocument.createElement("style");
        styleEl.id = "main-style-ui";
        styleEl.innerHTML = `body { background: ${app.theme?.bodyBackground || "#0094d4"}; }`;
        mockDocument.head.appendChild(styleEl);
        mockDocument.title = app.title || mockDocument.title;
      };
    },
  };

  const context = vm.createContext(contextObj);
  mockWindow.app = app;
  mockWindow.mapa = contextObj.mapa;

  // Ejecutar ConfigurationAdapter, ConfigProcessor, LiveUpdater y MessageBridge
  vm.runInContext(
    `${appSource.slice(adapterStart, adapterEnd)}\nglobalThis.ConfigurationAdapter = ConfigurationAdapter;`,
    context
  );
  vm.runInContext(processorSource, context);
  vm.runInContext(updaterSource, context);
  vm.runInContext(bridgeSource, context);

  mockWindow.ConfigProcessor = context.ConfigProcessor;
  mockWindow.LiveUpdater = context.LiveUpdater;
  mockWindow.MessageBridge = context.MessageBridge;

  // Función auxiliar para inicializar el mapa tardíamente y emitir argenmap:map-ready
  function triggerMapReady() {
    const bundle = createMapaInstance();
    context.mapa = bundle.mapObj;
    context.currentBaseMap = bundle.initialBaseLayer;
    mockWindow.mapa = bundle.mapObj;
    mockDocument.documentElement.dataset.argenmapMapReady = "true";
    mockWindow.dispatchEvent({
      type: "argenmap:map-ready",
      detail: { map: bundle.mapObj },
    });
    return bundle.mapObj;
  }

  // Función auxiliar para despachar un MessageEvent simulado
  async function dispatchParentMessage(opts = {}) {
    const data = opts.data;
    const origin = Object.prototype.hasOwnProperty.call(opts, "origin")
      ? opts.origin
      : "http://localhost:3000";
    const source = Object.prototype.hasOwnProperty.call(opts, "source")
      ? opts.source
      : parentWindow;
    const listeners = windowEventListeners.get("message") || [];
    const results = [];
    for (const entry of [...listeners]) {
      const res = await entry.listener({
        data,
        origin,
        source,
      });
      results.push(res);
    }
    return results;
  }

  return {
    context,
    mockWindow,
    mockDocument,
    parentWindow,
    sentMessages,
    windowEventListeners,
    app,
    gestorMenu,
    getMapa: () => context.mapa,
    ConfigProcessor: context.ConfigProcessor,
    LiveUpdater: context.LiveUpdater,
    MessageBridge: context.MessageBridge,
    triggerMapReady,
    dispatchParentMessage,
  };
}

// ============================================================================
// Suite de Pruebas de TASK-03 (18 escenarios requeridos + casos adicionales)
// ============================================================================

async function runTests() {
  // --------------------------------------------------------------------------
  // 1. Inicialización del puente cuando el visor está embebido
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    assert.equal(
      h.MessageBridge.isEmbedded(),
      true,
      "Escenario 1: isEmbedded() debe ser true cuando window.parent !== window"
    );

    const initResult = h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    assert.equal(initResult.initialized, true);
    assert.equal(initResult.embedded, true);
    assert.equal(initResult.listenerRegistered, true);
    assert.equal(initResult.viewerReadySent, true);
    assert.deepEqual(
      [...h.MessageBridge.getAllowedOrigins()],
      ["http://localhost:3000"]
    );
  }

  // --------------------------------------------------------------------------
  // 2. Ausencia de errores y no registro de listener en ejecución standalone
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: false,
      mapInitiallyReady: true,
    });
    assert.equal(
      h.MessageBridge.isEmbedded(),
      false,
      "Escenario 2: isEmbedded() debe ser false en modo standalone"
    );

    const initResult = h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    assert.equal(initResult.initialized, false);
    assert.equal(initResult.embedded, false);
    assert.equal(initResult.listenerRegistered, false);
    assert.equal(initResult.viewerReadySent, false);
    assert.equal(initResult.reason, "standalone");
    assert.equal(
      (h.windowEventListeners.get("message") || []).length,
      0,
      "En modo standalone no debe registrarse el listener de message"
    );
    assert.equal(
      h.sentMessages.length,
      0,
      "En modo standalone no debe enviarse ningún mensaje"
    );
  }

  // --------------------------------------------------------------------------
  // 3. Emisión de VIEWER_READY únicamente cuando el mapa está disponible
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: false,
      referrer: "http://localhost:3000/editor",
    });

    const initResult = h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    assert.equal(initResult.initialized, true);
    assert.equal(
      initResult.viewerReadySent,
      false,
      "Escenario 3: VIEWER_READY no debe emitirse antes de que el mapa exista"
    );
    assert.equal(h.sentMessages.length, 0);

    // Ahora se crea el mapa y se emite el evento argenmap:map-ready
    h.triggerMapReady();

    assert.equal(
      h.sentMessages.length,
      1,
      "Escenario 3: VIEWER_READY debe emitirse exactamente una vez tras argenmap:map-ready"
    );
    assert.deepEqual(h.sentMessages[0].message, {
      protocol: "argenmap",
      version: 1,
      type: "VIEWER_READY",
    });
    assert.equal(
      h.sentMessages[0].targetOrigin,
      "http://localhost:3000",
      "Escenario 3: VIEWER_READY debe usar el targetOrigin validado y nunca '*'"
    );
  }

  // --------------------------------------------------------------------------
  // 4, 5 y 6. Recepción de UPDATE_CONFIG completo, UPDATE_CONFIG parcial y
  //           respuesta CONFIG_UPDATED con el mismo messageId
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    // Limpiar el VIEWER_READY inicial de la bandeja para inspeccionar UPDATE_CONFIG
    h.sentMessages.length = 0;

    const initialMapId = h.getMapa()._leaflet_id;

    // Escenario 4: UPDATE_CONFIG completo (partial: false)
    const fullConfigPayload = {
      data: {
        template: "ign-geoportal-basic",
        items: [
          {
            type: "basemap",
            peso: 1,
            nombre: "Mapas base",
            seccion: "mapasbase",
            capas: [
              {
                titulo: "Argenmap Gris",
                nombre: "argenmap_gris",
                servicio: "tms",
                version: "1.0.0",
                attribution: "IGN",
                host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png",
                zoom: { min: 3, max: 19, nativeMin: 3, nativeMax: 19 },
                selected: true,
              },
            ],
          },
          {
            type: "wmslayer",
            peso: 10,
            nombre: "Capas IGN",
            seccion: "ign-wms",
            servicio: "wms",
            version: "1.3.0",
            host: "https://wms.ign.gob.ar/geoserver/ows",
            allowed_layers: ["ign:provincias"],
          },
        ],
      },
      preferences: {
        title: "Visor Configurado Completo",
        mapConfig: {
          center: { latitude: -34.6, longitude: -58.4 },
          zoom: { initial: 10, min: 4, max: 19 },
        },
        theme: {
          headerBackground: "#222222",
          menuBackground: "#333333",
          bodyBackground: "#111111",
          activeLayer: "#00aa55",
          iconBar: "#444444",
        },
      },
    };

    await h.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "update-001",
        payload: {
          partial: false,
          config: fullConfigPayload,
        },
      },
    });

    assert.equal(h.sentMessages.length, 1);
    const fullReply = h.sentMessages[0];
    assert.equal(fullReply.targetOrigin, "http://localhost:3000");
    assert.equal(fullReply.message.protocol, "argenmap");
    assert.equal(fullReply.message.version, 1);
    assert.equal(fullReply.message.type, "CONFIG_UPDATED");
    assert.equal(
      fullReply.message.messageId,
      "update-001",
      "Escenario 6: CONFIG_UPDATED debe preservar el messageId exacto"
    );
    assert.equal(fullReply.message.payload.success, true);
    assert.equal(fullReply.message.payload.hasChanges, true);
    assert.ok(fullReply.message.payload.appliedSections.includes("preferences.title"));
    assert.ok(fullReply.message.payload.appliedSections.includes("mapConfig.center"));
    assert.ok(fullReply.message.payload.appliedSections.includes("mapConfig.zoom"));
    assert.ok(fullReply.message.payload.appliedSections.includes("data.basemaps"));
    assert.ok(fullReply.message.payload.appliedSections.includes("data.wms"));
    assert.deepEqual(fullReply.message.payload.errors, []);

    assert.equal(h.mockDocument.title, "Visor Configurado Completo");
    assert.deepEqual(h.getMapa().getCenter(), { lat: -34.6, lng: -58.4 });
    assert.equal(h.getMapa().getZoom(), 10);
    assert.equal(h.getMapa()._leaflet_id, initialMapId);

    // Escenario 5: UPDATE_CONFIG parcial (partial: true)
    h.sentMessages.length = 0;
    await h.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "update-partial-002",
        payload: {
          partial: true,
          config: {
            preferences: {
              title: "Título Parcialmente Actualizado",
            },
          },
        },
      },
    });

    assert.equal(h.sentMessages.length, 1);
    const partialReply = h.sentMessages[0];
    assert.equal(partialReply.message.type, "CONFIG_UPDATED");
    assert.equal(partialReply.message.messageId, "update-partial-002");
    assert.equal(partialReply.message.payload.success, true);
    assert.equal(partialReply.message.payload.hasChanges, true);
    assert.deepEqual(partialReply.message.payload.appliedSections, [
      "preferences.title",
    ]);
    assert.equal(h.mockDocument.title, "Título Parcialmente Actualizado");
    // Debe preservar el centro, zoom y capas WMS de la configuración anterior
    assert.deepEqual(h.getMapa().getCenter(), { lat: -34.6, lng: -58.4 });
    assert.equal(h.getMapa().getZoom(), 10);
    assert.ok(h.gestorMenu.items["ign-wms"], "La sección WMS previa se preserva");
  }

  // --------------------------------------------------------------------------
  // 7 y 8. Solicitud GET_CONFIG y respuesta CONFIG_STATE
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    h.sentMessages.length = 0;

    // Simular que el usuario desplazó el mapa manualmente (navegación efectiva != declarativa)
    h.getMapa().setView([-25.0, -65.0], 14);

    await h.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "GET_CONFIG",
        messageId: "request-001",
      },
    });

    assert.equal(h.sentMessages.length, 1);
    const stateReply = h.sentMessages[0];
    assert.equal(stateReply.targetOrigin, "http://localhost:3000");
    assert.equal(stateReply.message.protocol, "argenmap");
    assert.equal(stateReply.message.version, 1);
    assert.equal(stateReply.message.type, "CONFIG_STATE");
    assert.equal(stateReply.message.messageId, "request-001");
    assert.ok(stateReply.message.payload.data);
    assert.ok(stateReply.message.payload.preferences);
    assert.equal(stateReply.message.payload.preferences.title, "IGN - Argenmap");
    // CONFIG_STATE devuelve la configuración declarativa (-40, -59, zoom 4), no la navegación temporal del usuario
    assert.deepEqual(stateReply.message.payload.preferences.mapConfig.center, {
      latitude: -40,
      longitude: -59,
    });
    assert.equal(
      stateReply.message.payload.preferences.mapConfig.zoom.initial,
      4
    );
  }

  // --------------------------------------------------------------------------
  // 9 y 16. Rechazo de orígenes no autorizados y verificación de no respuesta
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["https://editor.ign.gob.ar"],
      parentOrigin: "https://editor.ign.gob.ar",
    });
    h.sentMessages.length = 0;

    const unauthorizedOrigins = [
      "https://malicioso.example.com",
      "http://editor.ign.gob.ar", // esquema distinto (http vs https)
      "https://editor.ign.gob.ar:8443", // puerto distinto
      "*",
      "null",
      "",
      null,
    ];

    for (const badOrigin of unauthorizedOrigins) {
      const [res] = await h.dispatchParentMessage({
        origin: badOrigin,
        data: {
          protocol: "argenmap",
          version: 1,
          type: "UPDATE_CONFIG",
          messageId: "msg-unauth",
          payload: {
            partial: true,
            config: { preferences: { title: "Hackeado" } },
          },
        },
      });
      assert.equal(res.handled, false);
      assert.equal(res.reason, "unauthorized_origin");
    }

    assert.equal(
      h.mockDocument.title,
      "Argenmap",
      "Escenario 9: El estado del visor no debe alterarse por orígenes no autorizados"
    );
    assert.equal(
      h.sentMessages.length,
      0,
      "Escenario 16: Nunca se debe responder a un origen no validado"
    );
  }

  // --------------------------------------------------------------------------
  // 10. Rechazo de emisores distintos de window.parent
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    h.sentMessages.length = 0;

    const childIframeWindow = { postMessage() {} };
    const invalidSources = [h.mockWindow, childIframeWindow, null, undefined];

    for (const badSource of invalidSources) {
      const [res] = await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        source: badSource,
        data: {
          protocol: "argenmap",
          version: 1,
          type: "GET_CONFIG",
          messageId: "req-bad-source",
        },
      });
      assert.equal(res.handled, false);
      assert.equal(
        res.reason,
        "invalid_source",
        "Escenario 10: Debe rechazar emisores que no sean estrictamente window.parent"
      );
    }

    assert.equal(h.sentMessages.length, 0);
  }

  // --------------------------------------------------------------------------
  // 11, 12 y 13. Rechazo de mensajes malformados, versiones incompatibles y
  //              tipos de mensaje desconocidos
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    h.sentMessages.length = 0;

    // Escenario 11: Mensajes malformados
    const malformedMessages = [
      null,
      undefined,
      "UPDATE_CONFIG",
      12345,
      [],
      {},
      { protocol: "otro-visor", version: 1, type: "GET_CONFIG", messageId: "1" },
      { protocol: "argenmap", version: 1, type: "GET_CONFIG", messageId: "" },
      {
        protocol: "argenmap",
        version: 1,
        type: "GET_CONFIG",
        messageId: "a".repeat(129),
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "GET_CONFIG",
        messageId: "id con espacios invalidos",
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "upd-1",
        payload: null,
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "upd-2",
        payload: { partial: "true", config: {} },
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "upd-3",
        payload: { partial: false, config: null },
      },
    ];

    for (const badMsg of malformedMessages) {
      const [res] = await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        data: badMsg,
      });
      assert.equal(res.handled, false);
      assert.equal(res.reason, "invalid_message");
    }

    // Escenario 12: Versiones de protocolo incompatibles
    const incompatibleVersions = [0, 2, -1, 1.5, "1", null, undefined];
    for (const badVersion of incompatibleVersions) {
      const [res] = await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        data: {
          protocol: "argenmap",
          version: badVersion,
          type: "GET_CONFIG",
          messageId: "ver-check",
        },
      });
      assert.equal(res.handled, false);
      assert.equal(res.reason, "invalid_message");
    }

    // Escenario 13: Tipos de mensaje desconocidos o uso de 'tipo' en vez de 'type'
    const unknownTypeMessages = [
      {
        protocol: "argenmap",
        version: 1,
        type: "UNKNOWN_TYPE",
        messageId: "type-1",
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "VIEWER_READY",
        messageId: "type-2",
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "CONFIG_UPDATED",
        messageId: "type-3",
      },
      {
        protocol: "argenmap",
        version: 1,
        type: "CONFIG_STATE",
        messageId: "type-4",
      },
      {
        protocol: "argenmap",
        version: 1,
        tipo: "GET_CONFIG",
        messageId: "type-5",
      },
    ];

    for (const badTypeMsg of unknownTypeMessages) {
      const [res] = await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        data: badTypeMsg,
      });
      assert.equal(res.handled, false);
      assert.equal(res.reason, "invalid_message");
    }

    assert.equal(
      h.sentMessages.length,
      0,
      "Mensajes malformados, con versión incompatible o tipo desconocido no deben producir respuestas ni cambios"
    );
  }

  // --------------------------------------------------------------------------
  // 14. Manejo de errores de validación/aplicación devueltos por LiveUpdater
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    h.sentMessages.length = 0;

    await h.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "update-invalid-coords",
        payload: {
          partial: true,
          config: {
            preferences: {
              mapConfig: {
                center: { latitude: 135, longitude: -58 },
              },
            },
          },
        },
      },
    });

    assert.equal(h.sentMessages.length, 1);
    const errReply = h.sentMessages[0].message;
    assert.equal(errReply.type, "CONFIG_UPDATED");
    assert.equal(errReply.messageId, "update-invalid-coords");
    assert.equal(errReply.payload.success, false);
    assert.equal(errReply.payload.hasChanges, false);
    assert.deepEqual(errReply.payload.appliedSections, []);
    assert.ok(
      errReply.payload.errors.length > 0,
      "Escenario 14: Debe transmitir los errores devueltos por LiveUpdater"
    );
    assert.deepEqual(
      h.getMapa().getCenter(),
      { lat: -40, lng: -59 },
      "El centro del mapa debe permanecer intacto tras una configuración inválida"
    );
  }

  // --------------------------------------------------------------------------
  // 15. Manejo de excepciones inesperadas sin exponer datos internos sensibles
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({
      allowedOrigins: ["http://localhost:3000"],
    });
    h.sentMessages.length = 0;

    const originalApply = h.LiveUpdater.applyConfiguration;
    h.LiveUpdater.applyConfiguration = async () => {
      throw new Error("INTERNAL_SECRET_TOKEN_XYZ_CRASH");
    };

    try {
      await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        data: {
          protocol: "argenmap",
          version: 1,
          type: "UPDATE_CONFIG",
          messageId: "update-exception-001",
          payload: {
            partial: true,
            config: {
              preferences: { title: "Intento con Excepción" },
            },
          },
        },
      });
    } finally {
      h.LiveUpdater.applyConfiguration = originalApply;
    }

    assert.equal(h.sentMessages.length, 1);
    const exReply = h.sentMessages[0].message;
    assert.equal(exReply.type, "CONFIG_UPDATED");
    assert.equal(exReply.messageId, "update-exception-001");
    assert.equal(exReply.payload.success, false);
    assert.equal(exReply.payload.hasChanges, false);
    assert.equal(exReply.payload.errors.length, 1);
    assert.ok(
      !exReply.payload.errors[0].includes("INTERNAL_SECRET_TOKEN_XYZ_CRASH"),
      "Escenario 15: No debe exponer detalles internos sensibles de excepciones inesperadas"
    );
  }

  // --------------------------------------------------------------------------
  // 17. Verificación de que el listener se registra una sola vez
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });

    h.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });
    h.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });
    h.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });

    const messageListeners = h.windowEventListeners.get("message") || [];
    assert.equal(
      messageListeners.length,
      1,
      "Escenario 17: El listener de message debe registrarse una sola vez"
    );
    assert.equal(
      h.sentMessages.length,
      1,
      "Escenario 17: VIEWER_READY debe haberse enviado una sola vez"
    );
  }

  // --------------------------------------------------------------------------
  // 18. Verificación de que mapa._leaflet_id permanece estable en toda la sesión
  // --------------------------------------------------------------------------
  {
    const h = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
    });
    h.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });

    const mapRefBefore = h.getMapa();
    const leafletIdBefore = mapRefBefore._leaflet_id;

    for (let i = 1; i <= 3; i++) {
      await h.dispatchParentMessage({
        origin: "http://localhost:3000",
        data: {
          protocol: "argenmap",
          version: 1,
          type: "UPDATE_CONFIG",
          messageId: `seq-${i}`,
          payload: {
            partial: true,
            config: {
              preferences: {
                title: `Iteración ${i}`,
                mapConfig: {
                  center: { latitude: -34 - i, longitude: -58 - i },
                  zoom: { initial: 5 + i },
                },
              },
            },
          },
        },
      });
    }

    assert.equal(
      h.getMapa(),
      mapRefBefore,
      "Escenario 18: La referencia al objeto mapa (L.Map) debe ser exactamente la misma"
    );
    assert.equal(
      h.getMapa()._leaflet_id,
      leafletIdBefore,
      "Escenario 18: mapa._leaflet_id debe permanecer inmutable"
    );
  }

  // --------------------------------------------------------------------------
  // 19. Protección contra actualizaciones prematuras y concurrencia asíncrona
  // --------------------------------------------------------------------------
  {
    // 19a. Actualización prematura antes de que el mapa esté creado
    const hEarly = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: false,
    });
    hEarly.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });

    await hEarly.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "early-001",
        payload: {
          partial: true,
          config: { preferences: { title: "Demasiado pronto" } },
        },
      },
    });

    assert.equal(hEarly.sentMessages.length, 1);
    assert.equal(hEarly.sentMessages[0].message.type, "CONFIG_UPDATED");
    assert.equal(hEarly.sentMessages[0].message.messageId, "early-001");
    assert.equal(hEarly.sentMessages[0].message.payload.success, false);
    assert.ok(hEarly.sentMessages[0].message.payload.errors.length > 0);

    // 19b. Concurrencia de dos UPDATE_CONFIG con WMS donde el primero tarda más que el segundo
    let resolveSlowFetch;
    const hConcurrent = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
      customFetch: (url) => {
        if (url.includes("slow-host")) {
          return new Promise((resolve) => {
            resolveSlowFetch = () =>
              resolve({
                ok: true,
                status: 200,
                text: async () => SAMPLE_CAPABILITIES_XML,
              });
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => SAMPLE_CAPABILITIES_XML,
        });
      },
    });
    hConcurrent.MessageBridge.init({ allowedOrigins: ["http://localhost:3000"] });
    hConcurrent.sentMessages.length = 0;

    const p1 = hConcurrent.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "msg-slow-1",
        payload: {
          partial: true,
          config: {
            data: {
              items: [
                ...hConcurrent.app.items,
                {
                  type: "wmslayer",
                  peso: 10,
                  nombre: "Lento",
                  seccion: "sec-lenta",
                  servicio: "wms",
                  version: "1.3.0",
                  host: "https://slow-host.example.com/ows",
                },
              ],
            },
          },
        },
      },
    });

    const p2 = hConcurrent.dispatchParentMessage({
      origin: "http://localhost:3000",
      data: {
        protocol: "argenmap",
        version: 1,
        type: "UPDATE_CONFIG",
        messageId: "msg-fast-2",
        payload: {
          partial: true,
          config: {
            data: {
              items: [
                ...hConcurrent.app.items,
                {
                  type: "wmslayer",
                  peso: 20,
                  nombre: "Rápido",
                  seccion: "sec-rapida",
                  servicio: "wms",
                  version: "1.3.0",
                  host: "https://fast-host.example.com/ows",
                },
              ],
            },
          },
        },
      },
    });

    await p2;
    resolveSlowFetch();
    await p1;

    const replyFast = hConcurrent.sentMessages.find(
      (m) => m.message.messageId === "msg-fast-2"
    );
    const replySlow = hConcurrent.sentMessages.find(
      (m) => m.message.messageId === "msg-slow-1"
    );
    assert.ok(replyFast, "Debe existir respuesta para msg-fast-2");
    assert.ok(replySlow, "Debe existir respuesta para msg-slow-1");
    assert.equal(replySlow.message.payload.hasChanges, false);
    assert.ok(
      replySlow.message.payload.warnings.some((w) => w.includes("desplazada")),
      "El mensaje desplazado por concurrencia debe incluir la advertencia correspondiente"
    );
  }

  // --------------------------------------------------------------------------
  // 20. Verificación de política de orígenes en producción y orden en index.html
  // --------------------------------------------------------------------------
  {
    const hProdNoOrigins = createBridgeTestHarness({
      embedded: true,
      mapInitiallyReady: true,
      buildEnv: "production",
      locationOrigin: "https://mapa.ign.gob.ar",
      locationHostname: "mapa.ign.gob.ar",
      referrer: "https://desconocido.example.com",
    });

    const initProd = hProdNoOrigins.MessageBridge.init();
    assert.equal(
      initProd.initialized,
      false,
      "En producción sin política de orígenes configurada no se debe habilitar la comunicación externa"
    );
    assert.equal(initProd.reason, "no_allowed_origins");
    assert.equal(hProdNoOrigins.sentMessages.length, 0);

    // Verificar orden de carga en index.html
    const idxProcessor = indexHtmlSource.indexOf(
      "src/js/components/messaging/config-processor.js"
    );
    const idxUpdater = indexHtmlSource.indexOf(
      "src/js/components/messaging/live-updater.js"
    );
    const idxBridge = indexHtmlSource.indexOf(
      "src/js/components/messaging/message-bridge.js"
    );
    const idxApp = indexHtmlSource.indexOf("src/js/app.js");

    assert.ok(idxApp > 0, "index.html incluye app.js");
    assert.ok(idxProcessor > idxApp, "config-processor.js se carga después de app.js");
    assert.ok(
      idxUpdater > idxProcessor,
      "live-updater.js se carga después de config-processor.js"
    );
    assert.ok(
      idxBridge > idxUpdater,
      "message-bridge.js se carga después de live-updater.js"
    );
  }

  console.log("All 20 MessageBridge test scenarios passed.");
}

await runTests();
