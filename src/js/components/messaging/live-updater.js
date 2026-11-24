/**
 * @file live-updater.js
 * @description Módulo de actualización cartográfica y de interfaz en caliente
 * para Argenmap. Aplica configuraciones validadas y preparadas por ConfigProcessor
 * sobre la instancia existente de Leaflet (mapa), el estado global (app) y el
 * gestor de menú (gestorMenu), sin recargar el documento ni recrear L.Map.
 *
 * Implementado en JavaScript Vanilla puro. Compatible con entornos de navegador
 * (globalThis.LiveUpdater) y Node.js para pruebas automatizadas.
 */

(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(root);
  } else {
    root.LiveUpdater = factory(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  /**
   * Obtiene la instancia de ConfigProcessor disponible en el entorno.
   * @returns {Object} Instancia de ConfigProcessor.
   */
  function getConfigProcessor() {
    if (typeof ConfigProcessor !== "undefined" && ConfigProcessor) {
      return ConfigProcessor;
    }
    if (root && root.ConfigProcessor) {
      return root.ConfigProcessor;
    }
    throw new Error(
      "ConfigProcessor no está disponible. Debe cargarse antes de LiveUpdater."
    );
  }

  /**
   * Determina si un valor es un objeto plano.
   * @param {*} value - Valor a evaluar.
   * @returns {boolean}
   */
  function isPlainObject(value) {
    const processor = getConfigProcessor();
    return processor.isPlainObject(value);
  }

  /**
   * Clona profundamente un valor.
   * @param {*} value - Valor a clonar.
   * @returns {*}
   */
  function deepClone(value) {
    const processor = getConfigProcessor();
    return processor.deepClone(value);
  }

  /**
   * Compara estructuralmente dos valores serializables.
   * @param {*} a - Primer valor.
   * @param {*} b - Segundo valor.
   * @returns {boolean} Verdadero si son equivalentes.
   */
  function isDeepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== typeof b) return false;
    if (typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!isDeepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!isDeepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // =========================================================================
  // Estado interno del actualizador en caliente
  // =========================================================================

  /** @type {{ data: Object, preferences: Object } | null} */
  let _currentConfig = null;

  /**
   * Contador monotónico de generación para descartar respuestas asíncronas
   * tardías (ej. GetCapabilities lentos superados por una actualización posterior).
   * @type {number}
   */
  let _updateGeneration = 0;

  /**
   * Registro interno de metadatos y claves de servicios WMS activos para
   * reconciliación determinística.
   * @type {Map<string, Object>}
   */
  const _wmsRegistry = new Map();

  /**
   * Lista de definiciones de servicios WMS efectivamente aplicados en el menú/mapa,
   * utilizada como base de comparación real ante operaciones asíncronas concurrentes.
   * @type {Array<Object>|null}
   */
  let _appliedWmsItems = null;

  // =========================================================================
  // Helpers de acceso seguro a globales de Argenmap
  // =========================================================================

  function getApp() {
    if (typeof app !== "undefined" && app) return app;
    if (root && root.app) return root.app;
    return null;
  }

  function getMapa() {
    if (typeof mapa !== "undefined" && mapa && typeof mapa === "object") return mapa;
    if (root && root.mapa && typeof root.mapa === "object") return root.mapa;
    return null;
  }

  function getGestorMenu() {
    if (typeof gestorMenu !== "undefined" && gestorMenu) return gestorMenu;
    if (root && root.gestorMenu) return root.gestorMenu;
    return null;
  }

  function getBaseLayers() {
    if (typeof baseLayers !== "undefined" && baseLayers) return baseLayers;
    if (root && root.baseLayers) return root.baseLayers;
    return null;
  }

  function getBaseLayersInfo() {
    if (typeof baseLayersInfo !== "undefined" && baseLayersInfo) return baseLayersInfo;
    if (root && root.baseLayersInfo) return root.baseLayersInfo;
    return null;
  }

  function getOverlayMaps() {
    if (typeof overlayMaps !== "undefined" && overlayMaps) return overlayMaps;
    if (root && root.overlayMaps) return root.overlayMaps;
    return null;
  }

  function getCurrentBaseMap() {
    if (typeof currentBaseMap !== "undefined" && currentBaseMap) return currentBaseMap;
    if (root && root.currentBaseMap) return root.currentBaseMap;
    return null;
  }

  function setCurrentBaseMapRef(layerInstance) {
    try {
      if (typeof currentBaseMap !== "undefined") {
        // eslint-disable-next-line no-global-assign
        currentBaseMap = layerInstance;
      }
    } catch (_e) {
      // Ignorar si currentBaseMap es solo accesible en root
    }
    if (root) {
      root.currentBaseMap = layerInstance;
    }
  }

  function getSelectedBasemap() {
    if (typeof selectedBasemap !== "undefined" && selectedBasemap) return selectedBasemap;
    if (root && root.selectedBasemap) return root.selectedBasemap;
    return null;
  }

  function setSelectedBasemapRef(basemapObj) {
    try {
      if (typeof selectedBasemap !== "undefined") {
        // eslint-disable-next-line no-global-assign
        selectedBasemap = basemapObj;
      }
    } catch (_e) {
      // Ignorar si selectedBasemap es solo accesible en root
    }
    if (root) {
      root.selectedBasemap = basemapObj;
    }
  }

  // =========================================================================
  // Extracción e inicialización del estado declarativo actual
  // =========================================================================

  /**
   * Extrae una instantánea de la configuración declarativa actual a partir
   * del objeto global `app` cuando aún no se ha registrado una configuración base.
   * @returns {{ data: Object, preferences: Object }}
   */
  function extractRuntimeConfig() {
    const currentApp = getApp();
    if (!currentApp) {
      return { data: { items: [] }, preferences: {} };
    }

    const data = {};
    if (typeof currentApp.template === "string") {
      data.template = currentApp.template;
    } else if (typeof currentApp.template_id === "string") {
      data.template = currentApp.template_id;
    }
    if (Array.isArray(currentApp.items)) {
      data.items = deepClone(currentApp.items);
    } else {
      data.items = [];
    }

    const preferenceKeys = [
      "mapConfig",
      "title",
      "website",
      "favicon",
      "theme",
      "logo",
      "logoText",
      "referencias",
      "showSearchBar",
      "searchbar",
      "geocoder",
      "onInit",
      "excluded_plugins",
      "analytics_ids",
      "table",
      "charts",
      "HILLSHADE",
      "hillshade",
      "elevation",
      "strings",
      "geoprocessing",
      "metaTags",
      "service",
    ];

    const preferences = {};
    for (const key of preferenceKeys) {
      if (currentApp[key] !== undefined) {
        preferences[key] = deepClone(currentApp[key]);
      }
    }

    return { data, preferences };
  }

  /**
   * Obtiene una copia profunda de la configuración declarativa vigente.
   * @returns {{ data: Object, preferences: Object }}
   */
  function getCurrentConfig() {
    if (!_currentConfig) {
      const processor = getConfigProcessor();
      _currentConfig = processor.normalizeConfig(extractRuntimeConfig());
      _appliedWmsItems = Array.isArray(_currentConfig.data?.items)
        ? deepClone(_currentConfig.data.items.filter(isWmsItem))
        : [];
      syncWmsRegistryFromItems(_currentConfig.data.items);
    }
    return deepClone(_currentConfig);
  }

  /**
   * Establece explícitamente la configuración declarativa base del actualizador.
   * @param {{ data?: Object, preferences?: Object }} config - Configuración base.
   */
  function setCurrentConfig(config) {
    if (isPlainObject(config)) {
      const processor = getConfigProcessor();
      _currentConfig = processor.normalizeConfig({
        data: isPlainObject(config.data) ? deepClone(config.data) : { items: [] },
        preferences: isPlainObject(config.preferences) ? deepClone(config.preferences) : {},
      });
      _appliedWmsItems = Array.isArray(_currentConfig.data?.items)
        ? deepClone(_currentConfig.data.items.filter(isWmsItem))
        : [];
      // Sincronizar el registro interno de servicios WMS con la configuración inicial
      syncWmsRegistryFromItems(_currentConfig.data?.items);
    }
  }

  // =========================================================================
  // 4.1. Actualización de preferences.mapConfig (Centro y Zoom)
  // =========================================================================

  /**
   * Reconcilia y aplica cambios de centro y niveles de zoom sobre la instancia Leaflet `mapa`.
   *
   * Regla crítica: compara contra el `mapConfig` declarativo anterior (y no contra
   * `mapa.getCenter()`/`mapa.getZoom()`), de modo que si el usuario navegó manualmente
   * en el mapa y llega una actualización parcial de otra propiedad (ej. `title`),
   * no se sobreescribe la vista actual del usuario.
   *
   * @param {Object} prevPreferences - Preferencias declarativas anteriores.
   * @param {Object} nextPreferences - Preferencias declarativas nuevas.
   * @returns {{ appliedSections: string[], warnings: string[] }}
   */
  function reconcileMapConfig(prevPreferences, nextPreferences) {
    const appliedSections = [];
    const warnings = [];

    const prevMapConfig = prevPreferences?.mapConfig || {};
    const nextMapConfig = nextPreferences?.mapConfig;

    if (!isPlainObject(nextMapConfig)) {
      return { appliedSections, warnings };
    }

    const currentMapa = getMapa();
    const currentApp = getApp();

    const prevCenter = prevMapConfig.center || {};
    const nextCenter = nextMapConfig.center || {};
    const prevZoom = prevMapConfig.zoom || {};
    const nextZoom = nextMapConfig.zoom || {};

    const hasValidNextCenter =
      typeof nextCenter.latitude === "number" &&
      Number.isFinite(nextCenter.latitude) &&
      typeof nextCenter.longitude === "number" &&
      Number.isFinite(nextCenter.longitude);

    const centerChanged =
      hasValidNextCenter &&
      (nextCenter.latitude !== prevCenter.latitude ||
        nextCenter.longitude !== prevCenter.longitude);

    const initialZoomChanged =
      typeof nextZoom.initial === "number" &&
      Number.isFinite(nextZoom.initial) &&
      nextZoom.initial !== prevZoom.initial;

    const minZoomChanged =
      typeof nextZoom.min === "number" &&
      Number.isFinite(nextZoom.min) &&
      nextZoom.min !== prevZoom.min;

    const maxZoomChanged =
      typeof nextZoom.max === "number" &&
      Number.isFinite(nextZoom.max) &&
      nextZoom.max !== prevZoom.max;

    const zoomChanged = initialZoomChanged || minZoomChanged || maxZoomChanged;

    // 1. Actualizar límites de zoom primero para no restringir un nuevo zoom inicial válido
    if (currentMapa) {
      if (minZoomChanged) {
        if (typeof currentMapa.setMinZoom === "function") {
          currentMapa.setMinZoom(nextZoom.min);
        } else if (currentMapa.options) {
          currentMapa.options.minZoom = nextZoom.min;
        }
      }

      if (maxZoomChanged) {
        if (typeof currentMapa.setMaxZoom === "function") {
          currentMapa.setMaxZoom(nextZoom.max);
        } else if (currentMapa.options) {
          currentMapa.options.maxZoom = nextZoom.max;
        }
      }

      // Si cambiaron solo los límites min/max (y no zoom.initial), ajustar zoom actual solo si quedó fuera de rango
      if ((minZoomChanged || maxZoomChanged) && !initialZoomChanged) {
        if (typeof currentMapa.getZoom === "function" && typeof currentMapa.setZoom === "function") {
          const currentZoom = currentMapa.getZoom();
          if (typeof nextZoom.min === "number" && currentZoom < nextZoom.min) {
            currentMapa.setZoom(nextZoom.min);
          } else if (typeof nextZoom.max === "number" && currentZoom > nextZoom.max) {
            currentMapa.setZoom(nextZoom.max);
          }
        }
      }

      // 2. Actualizar centro y/o zoom inicial sobre la misma instancia de Leaflet
      if (centerChanged && initialZoomChanged) {
        if (typeof currentMapa.setView === "function") {
          currentMapa.setView(
            [nextCenter.latitude, nextCenter.longitude],
            nextZoom.initial
          );
        }
      } else if (centerChanged) {
        const preservedZoom =
          typeof currentMapa.getZoom === "function"
            ? currentMapa.getZoom()
            : nextZoom.initial ?? prevZoom.initial;
        if (typeof currentMapa.setView === "function") {
          currentMapa.setView(
            [nextCenter.latitude, nextCenter.longitude],
            preservedZoom
          );
        } else if (typeof currentMapa.panTo === "function") {
          currentMapa.panTo([nextCenter.latitude, nextCenter.longitude]);
        }
      } else if (initialZoomChanged) {
        if (typeof currentMapa.setZoom === "function") {
          currentMapa.setZoom(nextZoom.initial);
        } else if (
          typeof currentMapa.setView === "function" &&
          typeof currentMapa.getCenter === "function"
        ) {
          const currentCenter = currentMapa.getCenter();
          const lat = currentCenter?.lat ?? currentCenter?.[0] ?? nextCenter.latitude;
          const lng = currentCenter?.lng ?? currentCenter?.[1] ?? nextCenter.longitude;
          currentMapa.setView([lat, lng], nextZoom.initial);
        }
      }
    }

    // 3. Sincronizar app.mapConfig para que mapa.resetView() utilice los nuevos valores
    if (currentApp && (centerChanged || zoomChanged || !currentApp.mapConfig)) {
      currentApp.mapConfig = deepClone(nextMapConfig);
    }

    if (centerChanged) {
      appliedSections.push("mapConfig.center");
    }
    if (zoomChanged) {
      appliedSections.push("mapConfig.zoom");
    }

    return { appliedSections, warnings };
  }

  // =========================================================================
  // 4.2. Actualización de preferencias visuales y funcionales
  // =========================================================================

  /**
   * Propiedades de `preferences` que solo tienen efecto durante el arranque inicial
   * de la aplicación (inyección de scripts de plugins o analíticas).
   */
  const INIT_ONLY_PREFERENCE_KEYS = new Set(["excluded_plugins", "analytics_ids"]);

  /**
   * Sincroniza los elementos DOM de estilo, cabecera, logos y título de página
   * reutilizando StylesUI cuando está disponible y asegurando ausencia de nodos duplicados.
   *
   * @param {Object} nextPreferences - Nuevas preferencias aplicadas.
   * @param {Set<string>} changedPrefKeys - Conjunto de claves de preferencias que cambiaron.
   */
  function syncPreferencesDOM(nextPreferences, changedPrefKeys) {
    const doc = typeof document !== "undefined" ? document : root?.document;
    if (!doc) return;

    const styleRelatedKeys = [
      "theme",
      "title",
      "website",
      "favicon",
      "logo",
      "logoText",
      "referencias",
    ];
    const hasStyleChanges = styleRelatedKeys.some((k) => changedPrefKeys.has(k));

    if (!hasStyleChanges) return;

    // 1. Si StylesUI existe en el entorno, eliminar #main-style-ui previo para evitar duplicados
    // y regenerar los estilos dinámicos.
    const StylesUIClass =
      typeof StylesUI === "function"
        ? StylesUI
        : typeof root?.StylesUI === "function"
          ? root.StylesUI
          : null;

    if (StylesUIClass) {
      const existingStyle = doc.getElementById?.("main-style-ui");
      if (existingStyle && typeof existingStyle.remove === "function") {
        existingStyle.remove();
      }
      // Si existe un link[rel="icon"] previo y StylesUI crearía otro si no coincide el selector,
      // asegurar que solo quede uno.
      try {
        const stylesInstance = new StylesUIClass();
        if (typeof stylesInstance.createstyles === "function") {
          stylesInstance.createstyles();
        }
      } catch (_err) {
        // Fallback a actualización DOM directa abajo si StylesUI requiere nodos ausentes en tests
      }
    }

    // 2. Sincronización directa garantizada de nodos DOM clave
    if (changedPrefKeys.has("title") && typeof nextPreferences.title === "string") {
      if (nextPreferences.title !== "") {
        doc.title = nextPreferences.title;
      }
      const logoLink = doc.getElementById?.("top-left-logo-link");
      if (logoLink) {
        logoLink.title = nextPreferences.title;
        if (typeof logoLink.setAttribute === "function") {
          logoLink.setAttribute("title", nextPreferences.title);
        }
      }
    }

    if (changedPrefKeys.has("website") && typeof nextPreferences.website === "string") {
      const logoLink = doc.getElementById?.("top-left-logo-link");
      if (logoLink) {
        logoLink.href = nextPreferences.website;
        if (typeof logoLink.setAttribute === "function") {
          logoLink.setAttribute("href", nextPreferences.website);
        }
      }
    }

    if (changedPrefKeys.has("favicon") && typeof nextPreferences.favicon === "string") {
      let faviconLink = doc.querySelector?.('link[rel="icon"], link[rel="shortcut icon"]');
      if (!faviconLink && nextPreferences.favicon && doc.head && typeof doc.createElement === "function") {
        faviconLink = doc.createElement("link");
        faviconLink.rel = "icon";
        doc.head.appendChild(faviconLink);
      }
      if (faviconLink) {
        faviconLink.href = nextPreferences.favicon;
      }
    }

    if (changedPrefKeys.has("logo") && isPlainObject(nextPreferences.logo)) {
      const topLeftLogo = doc.getElementById?.("top-left-logo");
      if (topLeftLogo) {
        if (nextPreferences.logo.src !== undefined) {
          topLeftLogo.src = nextPreferences.logo.src;
        }
        if (nextPreferences.logo.title !== undefined) {
          topLeftLogo.alt = nextPreferences.logo.title;
          topLeftLogo.title = nextPreferences.logo.title;
        }
        if (nextPreferences.logo.style !== undefined && topLeftLogo.style) {
          topLeftLogo.style.cssText = nextPreferences.logo.style;
        }
      }
    }

    if (changedPrefKeys.has("logoText") && nextPreferences.logoText !== undefined) {
      const logoTextNode = doc.getElementById?.("logoText");
      if (logoTextNode) {
        if (isPlainObject(nextPreferences.logoText)) {
          if (nextPreferences.logoText.content !== undefined) {
            logoTextNode.innerHTML = nextPreferences.logoText.content;
            logoTextNode.textContent = nextPreferences.logoText.content;
          }
          if (nextPreferences.logoText.link !== undefined || nextPreferences.website !== undefined) {
            logoTextNode.href = nextPreferences.logoText.link || nextPreferences.website || "#";
          }
          if (nextPreferences.logoText.title !== undefined) {
            logoTextNode.title = nextPreferences.logoText.title;
          }
        } else if (typeof nextPreferences.logoText === "string") {
          logoTextNode.innerHTML = nextPreferences.logoText;
          logoTextNode.textContent = nextPreferences.logoText;
        }
      }
    }

    if (changedPrefKeys.has("referencias") && isPlainObject(nextPreferences.referencias)) {
      const topRightLogo = doc.getElementById?.("top-right-logo");
      if (topRightLogo) {
        if (nextPreferences.referencias.show) {
          if (nextPreferences.referencias.icon !== undefined) {
            topRightLogo.src = nextPreferences.referencias.icon;
          }
          if (topRightLogo.style) {
            if (nextPreferences.referencias.width !== undefined) {
              topRightLogo.style.width = `${nextPreferences.referencias.width}px`;
            }
            if (nextPreferences.referencias.height !== undefined) {
              topRightLogo.style.height = `${nextPreferences.referencias.height}px`;
            }
            topRightLogo.style.display = "";
          }
        } else if (topRightLogo.style) {
          topRightLogo.style.display = "none";
        }
      }
    }

    if (changedPrefKeys.has("theme") && isPlainObject(nextPreferences.theme) && !StylesUIClass) {
      let styleTag = doc.getElementById?.("main-style-ui");
      if (!styleTag && doc.head && typeof doc.createElement === "function") {
        styleTag = doc.createElement("style");
        styleTag.id = "main-style-ui";
        doc.head.appendChild(styleTag);
      }
      if (styleTag) {
        const theme = nextPreferences.theme;
        styleTag.innerHTML = `
          :root {
            --primary-color: ${theme.headerBackground || ""};
            --secondary-color: ${theme.menuBackground || ""};
            --active-layer-color: ${theme.activeLayer || ""};
          }
        `;
      }
    }
  }

  /**
   * Reconcilia y aplica las preferencias visuales y funcionales sobre `app`,
   * `gestorMenu` y el DOM.
   *
   * @param {Object} prevPreferences - Preferencias anteriores.
   * @param {Object} nextPreferences - Preferencias nuevas.
   * @returns {{ appliedSections: string[], warnings: string[], requiresMenuReprint: boolean }}
   */
  function reconcilePreferences(prevPreferences, nextPreferences) {
    const appliedSections = [];
    const warnings = [];
    let requiresMenuReprint = false;

    if (!isPlainObject(nextPreferences)) {
      return { appliedSections, warnings, requiresMenuReprint };
    }

    const prev = prevPreferences || {};
    const currentApp = getApp();
    const currentGestorMenu = getGestorMenu();
    const changedPrefKeys = new Set();

    for (const key of Object.keys(nextPreferences)) {
      if (key === "mapConfig" || key === "schemaVersion") continue;

      if (!isDeepEqual(prev[key], nextPreferences[key])) {
        changedPrefKeys.add(key);
        appliedSections.push(`preferences.${key}`);

        if (INIT_ONLY_PREFERENCE_KEYS.has(key)) {
          warnings.push(
            `La propiedad 'preferences.${key}' solo se aplica durante la inicialización del visor y no puede modificarse completamente en caliente sin recargar.`
          );
        }
      }
    }

    if (changedPrefKeys.size === 0) {
      return { appliedSections, warnings, requiresMenuReprint };
    }

    // 1. Actualizar estado global `app`
    if (currentApp) {
      for (const key of changedPrefKeys) {
        currentApp[key] = deepClone(nextPreferences[key]);
      }
      if (changedPrefKeys.has("strings") && isPlainObject(nextPreferences.strings)) {
        const stringsGlobal =
          typeof STRINGS !== "undefined" ? STRINGS : root?.STRINGS;
        if (stringsGlobal && isPlainObject(stringsGlobal)) {
          Object.assign(stringsGlobal, deepClone(nextPreferences.strings));
        }
      }
    }

    // 2. Actualizar buscador de capas (showSearchBar)
    if (changedPrefKeys.has("showSearchBar") && currentGestorMenu) {
      if (typeof currentGestorMenu.setShowSearcher === "function") {
        currentGestorMenu.setShowSearcher(Boolean(nextPreferences.showSearchBar));
        requiresMenuReprint = true;
      }
    }

    // 3. Actualizar geocodificador / barra de búsqueda geográfica
    if (changedPrefKeys.has("geocoder") || changedPrefKeys.has("searchbar")) {
      const geocoderEnabled =
        nextPreferences?.geocoder?.enabled ??
        nextPreferences?.geocoder?.isActive ??
        nextPreferences?.searchbar?.isActive ??
        false;
      const setGeocoderFn =
        typeof setGeocoder === "function" ? setGeocoder : root?.setGeocoder;
      if (typeof setGeocoderFn === "function") {
        setGeocoderFn(Boolean(geocoderEnabled));
      }
    }

    // 4. Sincronizar DOM visual (título, tema, logos, referencias, favicon)
    syncPreferencesDOM(nextPreferences, changedPrefKeys);

    return { appliedSections, warnings, requiresMenuReprint };
  }

  // =========================================================================
  // 4.3. Actualización y reconciliación de mapas base
  // =========================================================================

  /**
   * Extrae el elemento de configuración de mapas base desde `data.items`.
   * @param {Array} items - Arreglo `data.items`.
   * @returns {Object|null}
   */
  function findBasemapGroupItem(items) {
    if (!Array.isArray(items)) return null;
    return (
      items.find(
        (item) =>
          isPlainObject(item) &&
          ((item.type || item.servicio || "").toLowerCase() === "basemap" ||
            item.seccion === "mapasbase")
      ) || null
    );
  }

  /**
   * Determina si dos definiciones de capa base tienen exactamente los mismos parámetros
   * de teselas/renderizado en Leaflet.
   * @param {Object} a - Capa base anterior.
   * @param {Object} b - Capa base nueva.
   * @returns {boolean}
   */
  function isSameBasemapTileDefinition(a, b) {
    if (!a || !b) return false;
    return (
      a.nombre === b.nombre &&
      (a.host || a.url || "") === (b.host || b.url || "") &&
      (a.servicio || "tms").toLowerCase() === (b.servicio || "tms").toLowerCase() &&
      (a.key || "") === (b.key || "") &&
      (a.attribution || "") === (b.attribution || "") &&
      (a.version || "") === (b.version || "") &&
      isDeepEqual(a.zoom || {}, b.zoom || {})
    );
  }

  /**
   * Selecciona la capa base activa siguiendo la regla canónica de Argenmap:
   * 1. La primera capa marcada con `selected: true`.
   * 2. En su defecto, la primera capa disponible en el arreglo `capas`.
   *
   * @param {Array<Object>} capas - Lista de capas base.
   * @returns {{ layer: Object|null, index: number }}
   */
  function resolveSelectedBasemapLayer(capas) {
    if (!Array.isArray(capas) || capas.length === 0) {
      return { layer: null, index: -1 };
    }
    const explicitIndex = capas.findIndex((c) => c && c.selected === true);
    if (explicitIndex >= 0) {
      return { layer: capas[explicitIndex], index: explicitIndex };
    }
    return { layer: capas[0], index: 0 };
  }

  /**
   * Reemplaza la capa base activa (`currentBaseMap`) sobre `mapa` sin recrear `L.Map`.
   * Asegura que la nueva capa base quede en el fondo del panel de teselas.
   *
   * @param {Object} targetLayer - Definición de la capa base a activar.
   */
  function replaceActiveLeafletBasemap(targetLayer) {
    const currentMapa = getMapa();
    if (!currentMapa || !targetLayer) return;

    const servicio = (targetLayer.servicio || "tms").toLowerCase();
    const hostUrl = targetLayer.host || targetLayer.url || "";
    const layerName = targetLayer.nombre;
    const attribution = targetLayer.attribution || "";

    const loadMapaBaseFn =
      typeof loadMapaBase === "function" ? loadMapaBase : root?.loadMapaBase;
    const loadMapaBaseTplFn =
      typeof loadMapaBaseTpl === "function" ? loadMapaBaseTpl : root?.loadMapaBaseTpl;
    const loadMapaBaseBingTplFn =
      typeof loadMapaBaseBingTpl === "function"
        ? loadMapaBaseBingTpl
        : root?.loadMapaBaseBingTpl;

    if (servicio === "bing" && typeof loadMapaBaseBingTplFn === "function") {
      loadMapaBaseBingTplFn(targetLayer.key, layerName, attribution);
    } else if (typeof loadMapaBaseTplFn === "function") {
      loadMapaBaseTplFn(hostUrl, layerName, attribution);
    } else if (typeof loadMapaBaseFn === "function") {
      loadMapaBaseFn(hostUrl, layerName, attribution);
    } else {
      // Fallback directo con Leaflet L.tileLayer
      const prevBaseMap = getCurrentBaseMap();
      if (prevBaseMap) {
        if (typeof currentMapa.removeLayer === "function") {
          currentMapa.removeLayer(prevBaseMap);
        } else if (typeof prevBaseMap.removeFrom === "function") {
          prevBaseMap.removeFrom(currentMapa);
        }
      }

      const leafletGlobal = typeof L !== "undefined" ? L : root?.L;
      if (leafletGlobal && typeof leafletGlobal.tileLayer === "function") {
        const zoomOpts = targetLayer.zoom || {};
        const newBaseMap = leafletGlobal.tileLayer(hostUrl, {
          attribution,
          minZoom: zoomOpts.min,
          maxZoom: zoomOpts.max,
          minNativeZoom: zoomOpts.nativeMin,
          maxNativeZoom: zoomOpts.nativeMax,
        });
        if (typeof newBaseMap.addTo === "function") {
          newBaseMap.addTo(currentMapa);
        } else if (typeof currentMapa.addLayer === "function") {
          currentMapa.addLayer(newBaseMap);
        }
        setCurrentBaseMapRef(newBaseMap);
      }
    }

    // Asegurar que la capa base permanezca detrás de cualquier overlay activo
    const updatedBaseMap = getCurrentBaseMap();
    if (updatedBaseMap && typeof updatedBaseMap.bringToBack === "function") {
      updatedBaseMap.bringToBack();
    }
  }

  /**
   * Sincroniza el grupo de mapas base en `gestorMenu` y actualiza el selector DOM `#basemap-selector`.
   *
   * @param {Object} basemapGroupItem - Elemento `basemap` de `data.items`.
   * @param {Object} selectedLayer - Capa base seleccionada.
   * @param {number} selectedIndex - Índice de la capa seleccionada.
   */
  function syncBasemapMenuAndDOM(basemapGroupItem, selectedLayer, selectedIndex) {
    const currentGestorMenu = getGestorMenu();
    const currentApp = getApp();
    const capas = basemapGroupItem.capas || [];
    const seccion = basemapGroupItem.seccion || "mapasbase";

    if (currentGestorMenu) {
      // 1. Limpiar los nombres de mapas base anteriores de activeLayers y availableBaseLayers
      const oldAvailableBaseLayers = Array.isArray(currentGestorMenu.availableBaseLayers)
        ? [...currentGestorMenu.availableBaseLayers]
        : [];

      oldAvailableBaseLayers.forEach((oldName) => {
        if (typeof currentGestorMenu.removeActiveLayer === "function") {
          currentGestorMenu.removeActiveLayer(oldName);
        } else if (Array.isArray(currentGestorMenu.activeLayers)) {
          const idx = currentGestorMenu.activeLayers.indexOf(oldName);
          if (idx >= 0) currentGestorMenu.activeLayers.splice(idx, 1);
        }
      });

      currentGestorMenu.availableBaseLayers = [];
      capas.forEach((layer) => {
        if (typeof currentGestorMenu.setAvailableBaseLayer === "function") {
          currentGestorMenu.setAvailableBaseLayer(layer.nombre);
        } else {
          currentGestorMenu.availableBaseLayers.push(layer.nombre);
        }
      });

      if (typeof currentGestorMenu.setBaseMapDependencies === "function") {
        currentGestorMenu.baseMapDependencies = {};
        currentGestorMenu.setBaseMapDependencies(capas);
      }

      // 2. Limpiar entradas de capas base antiguas en app.layers y app.layerNameByDomId
      if (currentApp) {
        oldAvailableBaseLayers.forEach((oldName) => {
          if (currentApp.layers && currentApp.layers[oldName]) {
            const oldChildId = currentApp.layers[oldName].childid;
            if (oldChildId && currentApp.layerNameByDomId) {
              delete currentApp.layerNameByDomId[oldChildId];
            }
            delete currentApp.layers[oldName];
          }
        });
      }

      // 3. Reconstruir el ItemGroupBaseMap en gestorMenu.items[seccion]
      const TabClass = typeof Tab === "function" ? Tab : root?.Tab;
      if (
        currentApp &&
        typeof currentApp.createBaseMapGroup === "function" &&
        typeof currentApp.createCapa === "function" &&
        typeof currentApp.createBasemapItem === "function" &&
        typeof currentApp.setBasemapProperties === "function" &&
        TabClass
      ) {
        const tab = new TabClass(basemapGroupItem.tab);
        const groupAux = currentApp.createBaseMapGroup(basemapGroupItem, tab);

        capas.forEach((layer, index) => {
          const capa = currentApp.createCapa(layer);
          const basemapItem = currentApp.createBasemapItem(
            capa,
            seccion + index,
            layer
          );
          currentApp.setBasemapProperties(basemapItem, layer);
          if (selectedLayer && layer.nombre === selectedLayer.nombre) {
            basemapItem.visible = true;
            if (basemapItem.capas && basemapItem.capas[0]) {
              basemapItem.capas[0].visible = true;
            }
          }
          groupAux.setItem(basemapItem);
        });

        if (typeof currentGestorMenu.addTab === "function") {
          currentGestorMenu.addTab(tab);
        }
        if (typeof currentGestorMenu.addItemGroup === "function") {
          currentGestorMenu.addItemGroup(groupAux);
        } else if (currentGestorMenu.items) {
          currentGestorMenu.items[seccion] = groupAux;
        }
      } else if (currentGestorMenu.items) {
        // Fallback ligero para entornos de prueba sin todas las clases de UI cargadas
        const itemsComposite = {};
        capas.forEach((layer, index) => {
          const childId = `child-${seccion}${index}`;
          const itemObj = {
            nombre: layer.nombre,
            titulo: layer.titulo || layer.nombre,
            seccion: `${seccion}${index}`,
            visible: Boolean(selectedLayer && layer.nombre === selectedLayer.nombre),
            capa: deepClone(layer),
            capas: [deepClone(layer)],
            getId: () => childId,
            getVisible: function () {
              return this.visible;
            },
          };
          itemsComposite[`${seccion}${index}`] = itemObj;
          if (currentApp) {
            if (!currentApp.layers) currentApp.layers = {};
            if (!currentApp.layerNameByDomId) currentApp.layerNameByDomId = {};
            currentApp.layers[layer.nombre] = { ...itemObj, childid: childId, type: layer.servicio || "tms" };
            currentApp.layerNameByDomId[childId] = layer.nombre;
          }
        });
        currentGestorMenu.items[seccion] = {
          nombre: basemapGroupItem.nombre || "Mapas base",
          seccion,
          peso: basemapGroupItem.peso ?? 1,
          itemsComposite,
          isBaseLayer: () => true,
          muestraCantidadCapasVisibles: () => {},
          hideAllLayers: () => {
            Object.values(itemsComposite).forEach((it) => {
              it.visible = false;
            });
          },
        };
      }

      // 4. Registrar la capa base seleccionada como activa en gestorMenu
      if (selectedLayer) {
        const selectedDomId = `child-${seccion}${selectedIndex}`;
        if (typeof currentGestorMenu.addActiveLayer === "function") {
          currentGestorMenu.addActiveLayer(selectedLayer.nombre);
        } else if (Array.isArray(currentGestorMenu.activeLayers)) {
          if (!currentGestorMenu.activeLayers.includes(selectedLayer.nombre)) {
            currentGestorMenu.activeLayers.push(selectedLayer.nombre);
          }
        }
        if (typeof currentGestorMenu.setLastBaseMapSelected === "function") {
          currentGestorMenu.setLastBaseMapSelected(selectedLayer.nombre);
        } else {
          currentGestorMenu.lastBaseMapSelected = selectedLayer.nombre;
        }
        if (typeof currentGestorMenu.setBasemapSelected === "function") {
          currentGestorMenu.setBasemapSelected(selectedDomId);
        } else {
          currentGestorMenu.basemapSelected = selectedDomId;
        }
      }
    }

    // 5. Re-renderizar el selector DOM #basemap-selector
    const doc = typeof document !== "undefined" ? document : root?.document;
    if (doc) {
      const selectorContainer =
        doc.getElementById?.("basemap-selector") ||
        doc.querySelector?.("div#basemap-selector");

      if (selectorContainer) {
        selectorContainer.innerHTML = "";
        const basemapGroup = currentGestorMenu?.items?.[seccion];
        if (basemapGroup && typeof basemapGroup.imprimir === "function") {
          const rendered = basemapGroup.imprimir();
          if (rendered) {
            if (typeof rendered === "object" && typeof selectorContainer.appendChild === "function") {
              selectorContainer.appendChild(rendered);
            } else if (typeof selectorContainer.insertAdjacentHTML === "function") {
              selectorContainer.insertAdjacentHTML("beforeend", String(rendered));
            } else {
              selectorContainer.innerHTML = String(rendered);
            }
          }
        } else {
          // Renderizado DOM directo de respaldo para #collapseBaseMapLayers
          const listHtml = capas
            .map((layer, index) => {
              const childId = `child-${seccion}${index}`;
              const activeClass =
                selectedLayer && layer.nombre === selectedLayer.nombre ? " active" : "";
              const title = layer.titulo || layer.nombre;
              return `<li id="${childId}" title="${layer.nombre}" class="list-group-item${activeClass}">${title}</li>`;
            })
            .join("");
          selectorContainer.innerHTML = `<ul id="collapseBaseMapLayers" class="list-inline">${listHtml}</ul>`;
        }

        // Asegurar clase 'active' en el elemento seleccionado
        if (selectedLayer && selectedIndex >= 0) {
          const selectedDomId = `child-${seccion}${selectedIndex}`;
          const activeLi = doc.getElementById?.(selectedDomId);
          if (activeLi && activeLi.classList) {
            activeLi.classList.add("active");
          }
        }
      }
    }
  }

  /**
   * Reconcilia y aplica cambios en la configuración de mapas base (`type: "basemap"`).
   *
   * - Preserva la instancia `currentBaseMap` en Leaflet si el mapa base activo y sus
   *   parámetros de teselas (`host`, `servicio`, `key`, `attribution`, `zoom`) no cambiaron.
   * - Reemplaza `currentBaseMap` únicamente cuando cambia la selección o cambia la
   *   definición de la capa base activa.
   * - Limpia mapas base eliminados de `baseLayers`, `baseLayersInfo` y `gestorMenu`.
   *
   * @param {Object} prevData - Objeto `data` anterior.
   * @param {Object} nextData - Objeto `data` nuevo.
   * @param {Object} [options={}] - Opciones adicionales (`mapZoomUpdated`).
   * @returns {{ appliedSections: string[], warnings: string[], changed: boolean }}
   */
  function reconcileBasemaps(prevData, nextData, options = {}) {
    const appliedSections = [];
    const warnings = [];

    const prevBasemapItem = findBasemapGroupItem(prevData?.items);
    const nextBasemapItem = findBasemapGroupItem(nextData?.items);

    if (!nextBasemapItem) {
      return { appliedSections, warnings, changed: false };
    }

    if (isDeepEqual(prevBasemapItem, nextBasemapItem)) {
      return { appliedSections, warnings, changed: false };
    }

    const prevCapas = Array.isArray(prevBasemapItem?.capas) ? prevBasemapItem.capas : [];
    const nextCapas = Array.isArray(nextBasemapItem.capas) ? nextBasemapItem.capas : [];

    // Verificar cuál era la capa base activa previamente en tiempo de ejecución
    const currentSelectedObj = getSelectedBasemap();
    const currentGestorMenu = getGestorMenu();
    const prevResolved = resolveSelectedBasemapLayer(prevCapas);
    const activeBasemapName =
      currentSelectedObj?.nombre ||
      currentGestorMenu?.lastBaseMapSelected ||
      (typeof currentGestorMenu?.getActiveBasemap === "function"
        ? currentGestorMenu.getActiveBasemap()
        : null) ||
      prevResolved.layer?.nombre ||
      null;

    const prevActiveLayerDef =
      prevCapas.find((c) => c && c.nombre === activeBasemapName) ||
      (currentSelectedObj && currentSelectedObj.nombre === activeBasemapName
        ? currentSelectedObj
        : prevResolved.layer);

    // Resolver la nueva capa base seleccionada (selected: true o primera disponible)
    const { layer: targetSelectedLayer, index: targetSelectedIndex } =
      resolveSelectedBasemapLayer(nextCapas);

    // 1. Actualizar estructuras globales baseLayersInfo y baseLayers eliminando capas borradas
    const globalBaseLayersInfo = getBaseLayersInfo();
    const globalBaseLayers = getBaseLayers();
    const nextNamesSet = new Set(nextCapas.map((c) => c.nombre));

    if (globalBaseLayersInfo) {
      for (const existingKey of Object.keys(globalBaseLayersInfo)) {
        if (!nextNamesSet.has(existingKey)) {
          delete globalBaseLayersInfo[existingKey];
        }
      }
      const setBaseLayersInfoFn =
        typeof setBaseLayersInfo === "function"
          ? setBaseLayersInfo
          : root?.setBaseLayersInfo;
      if (typeof setBaseLayersInfoFn === "function") {
        setBaseLayersInfoFn(deepClone(nextCapas));
      } else {
        nextCapas.forEach((layer) => {
          globalBaseLayersInfo[layer.nombre] = deepClone(layer);
        });
      }
    }

    if (globalBaseLayers) {
      for (const existingKey of Object.keys(globalBaseLayers)) {
        if (!nextNamesSet.has(existingKey)) {
          delete globalBaseLayers[existingKey];
        }
      }
      const setBaseLayersZoomLevelsFn =
        typeof setBaseLayersZoomLevels === "function"
          ? setBaseLayersZoomLevels
          : root?.setBaseLayersZoomLevels;
      if (typeof setBaseLayersZoomLevelsFn === "function") {
        setBaseLayersZoomLevelsFn(deepClone(nextCapas));
      } else {
        nextCapas.forEach((layer) => {
          globalBaseLayers[layer.nombre] = layer.zoom
            ? { zoom: deepClone(layer.zoom) }
            : {};
        });
      }
    }

    // 2. Evaluar si la capa base activa en Leaflet debe ser reemplazada o preservada
    const activeTileNeedsReplacement =
      targetSelectedLayer &&
      (!getCurrentBaseMap() ||
        targetSelectedLayer.nombre !== activeBasemapName ||
        !isSameBasemapTileDefinition(prevActiveLayerDef, targetSelectedLayer));

    if (targetSelectedLayer) {
      const updatedSelectedRef =
        (globalBaseLayersInfo && globalBaseLayersInfo[targetSelectedLayer.nombre]) ||
        deepClone(targetSelectedLayer);
      setSelectedBasemapRef(updatedSelectedRef);

      if (activeTileNeedsReplacement) {
        replaceActiveLeafletBasemap(targetSelectedLayer);

        // Si no hubo una actualización explícita de mapConfig.zoom en este mismo ciclo,
        // validar niveles de zoom del nuevo mapa base como hace Argenmap al cambiar de capa base.
        if (!options.mapZoomUpdated) {
          const setValidZoomLevelFn =
            typeof setValidZoomLevel === "function"
              ? setValidZoomLevel
              : root?.setValidZoomLevel;
          if (typeof setValidZoomLevelFn === "function" && getMapa()) {
            setValidZoomLevelFn(targetSelectedLayer.nombre);
          }
        }
      }
    }

    // 3. Sincronizar menú y selector DOM #basemap-selector
    syncBasemapMenuAndDOM(nextBasemapItem, targetSelectedLayer, targetSelectedIndex);

    appliedSections.push("data.basemaps");
    return { appliedSections, warnings, changed: true };
  }

  // =========================================================================
  // 4.4, 7 y 8. Actualización y reconciliación de servicios y capas WMS
  // =========================================================================

  /**
   * Determina si un elemento de `data.items` corresponde a un servicio WMS.
   * @param {Object} item - Elemento de `data.items`.
   * @returns {boolean}
   */
  function isWmsItem(item) {
    if (!isPlainObject(item)) return false;
    const rawType = String(item.type || item.servicio || "").toLowerCase();
    if (rawType === "basemap" || rawType === "file" || rawType === "file-layer") {
      return false;
    }
    return (
      rawType === "wms" ||
      rawType === "wmslayer" ||
      rawType === "wmslayer_mapserver" ||
      String(item.servicio || "").toLowerCase() === "wms"
    );
  }

  /**
   * Normaliza un host WMS para comparaciones consistentes.
   * @param {string} host - URL del host WMS.
   * @returns {string}
   */
  function normalizeWmsHost(host) {
    if (typeof host !== "string") return "";
    return host.trim().replace(/\?+$/, "").replace(/\/+$/, "");
  }

  /**
   * Construye el endpoint OWS para GetCapabilities replicando `LayersInfoWMS.getHostOWS()`.
   * @param {string} host - Host configurado.
   * @param {string} service - Tipo de servicio (`wms`).
   * @returns {string}
   */
  function buildWmsOwsEndpoint(host, service = "wms") {
    let owsHost = String(host || "").trim();
    if (
      String(service || "wms").toLowerCase() === "wms" &&
      owsHost.includes("/geoserver") &&
      !owsHost.endsWith("/wms") &&
      !owsHost.endsWith("/wms?")
    ) {
      owsHost += "/wms";
    }
    return owsHost;
  }

  /**
   * Serializa `allowed_layers` de forma canónica para la clave de identidad del servicio.
   * @param {*} allowedLayers
   * @returns {string}
   */
  function serializeAllowedLayers(allowedLayers) {
    if (!Array.isArray(allowedLayers)) return "*";
    return [...allowedLayers].map(String).sort().join(",");
  }

  /**
   * Serializa `customize_layers` de forma canónica.
   * @param {*} customizeLayers
   * @returns {string}
   */
  function serializeCustomizeLayers(customizeLayers) {
    if (!isPlainObject(customizeLayers)) return "";
    const sortedKeys = Object.keys(customizeLayers).sort();
    const normalized = {};
    for (const key of sortedKeys) {
      normalized[key] = customizeLayers[key];
    }
    return JSON.stringify(normalized);
  }

  /**
   * Genera una clave compuesta determinística para identificar un servicio WMS
   * contemplando `seccion`, `host`, `servicio`, `version`, `allowed_layers`,
   * `customize_layers` y `feature_info_format`.
   *
   * @param {Object} item - Elemento WMS de `data.items`.
   * @param {number} [occurrence=0] - Desambiguador numérico en caso de duplicados exactos.
   * @returns {string}
   */
  function computeWmsServiceKey(item, occurrence = 0) {
    const seccion = String(item.seccion || item.nombre || "wms").trim();
    const host = normalizeWmsHost(item.host || item.url || "");
    const servicio = String(item.servicio || "wms").toLowerCase().trim();
    const rawType = String(item.type || "wms").toLowerCase().trim();
    const typeVariant = rawType === "wmslayer_mapserver" ? "mapserver" : "wms";
    const version = String(item.version || "1.3.0").trim();
    const allowed = serializeAllowedLayers(item.allowed_layers);
    const customized = serializeCustomizeLayers(item.customize_layers);
    const infoFormat = String(item.feature_info_format || "application/json").trim();

    return `${seccion}|${host}|${servicio}:${typeVariant}|${version}|${allowed}|${customized}|${infoFormat}#${occurrence}`;
  }

  /**
   * Determina si dos definiciones de servicio WMS tienen exactamente los mismos parámetros
   * operativos de consulta OGC (sin requerir un nuevo GetCapabilities).
   *
   * @param {Object} a - Servicio WMS anterior.
   * @param {Object} b - Servicio WMS nuevo.
   * @returns {boolean}
   */
  function hasSameWmsOgcParameters(a, b) {
    if (!a || !b) return false;
    const rawTypeA = String(a.type || "wms").toLowerCase();
    const rawTypeB = String(b.type || "wms").toLowerCase();
    const isMapserverA = rawTypeA === "wmslayer_mapserver";
    const isMapserverB = rawTypeB === "wmslayer_mapserver";

    return (
      String(a.seccion || "") === String(b.seccion || "") &&
      normalizeWmsHost(a.host || a.url || "") ===
        normalizeWmsHost(b.host || b.url || "") &&
      String(a.servicio || "wms").toLowerCase() ===
        String(b.servicio || "wms").toLowerCase() &&
      isMapserverA === isMapserverB &&
      String(a.version || "1.3.0") === String(b.version || "1.3.0") &&
      serializeAllowedLayers(a.allowed_layers) ===
        serializeAllowedLayers(b.allowed_layers) &&
      serializeCustomizeLayers(a.customize_layers) ===
        serializeCustomizeLayers(b.customize_layers) &&
      String(a.feature_info_format || "application/json") ===
        String(b.feature_info_format || "application/json") &&
      isDeepEqual(a.icons || null, b.icons || null)
    );
  }

  /**
   * Determina si cambió algún metadato de presentación de un servicio WMS
   * (`nombre`, `peso`, `short_abstract`, `tab`, `section_style`).
   *
   * @param {Object} a - Servicio WMS anterior.
   * @param {Object} b - Servicio WMS nuevo.
   * @returns {boolean}
   */
  function hasWmsMetadataChanged(a, b) {
    return (
      (a.nombre || "") !== (b.nombre || "") ||
      (a.peso ?? 0) !== (b.peso ?? 0) ||
      (a.short_abstract || "") !== (b.short_abstract || "") ||
      !isDeepEqual(a.tab || null, b.tab || null) ||
      !isDeepEqual(a.section_style || null, b.section_style || null)
    );
  }

  /**
   * Sincroniza el registro interno `_wmsRegistry` a partir de una lista inicial de items.
   * @param {Array} items - Lista `data.items`.
   */
  function syncWmsRegistryFromItems(items) {
    _wmsRegistry.clear();
    if (!Array.isArray(items)) return;

    const currentGestorMenu = getGestorMenu();
    const occurrenceCounts = new Map();

    items.filter(isWmsItem).forEach((item) => {
      const baseSig = computeWmsServiceKey(item, 0);
      const occ = occurrenceCounts.get(baseSig) || 0;
      occurrenceCounts.set(baseSig, occ + 1);
      const serviceKey = computeWmsServiceKey(item, occ);

      // Etiquetar subcapas existentes en gestorMenu.items[seccion] que provengan de este host
      const sectionGroup = currentGestorMenu?.items?.[item.seccion];
      if (sectionGroup && isPlainObject(sectionGroup.itemsComposite)) {
        const normalizedHost = normalizeWmsHost(item.host || item.url || "");
        for (const subItem of Object.values(sectionGroup.itemsComposite)) {
          if (
            subItem &&
            !subItem._wmsServiceKey &&
            normalizeWmsHost(subItem.capa?.host || "") === normalizedHost
          ) {
            subItem._wmsServiceKey = serviceKey;
          }
        }
      }

      _wmsRegistry.set(serviceKey, {
        key: serviceKey,
        item: deepClone(item),
      });
    });
  }

  /**
   * Planifica la reconciliación entre la lista anterior y la nueva lista de servicios WMS.
   *
   * Contempla:
   * - Servicios sin cambios (conservan subcapas y overlays activos).
   * - Servicios con cambios solo de metadatos (`nombre`, `peso`, `short_abstract`).
   * - Servicios modificados en su misma sección (`host`, `version`, `allowed_layers`, etc.).
   * - Múltiples servicios en la misma `seccion` o con el mismo `host` y distintas `allowed_layers`.
   * - Detección de definiciones ambiguas o colisiones, registrando advertencias.
   *
   * @param {Array<Object>} prevWmsItems - Servicios WMS anteriores.
   * @param {Array<Object>} nextWmsItems - Servicios WMS nuevos.
   * @returns {{
   *   unchanged: Array<{ prev: Object, next: Object, prevKey: string, nextKey: string }>,
   *   metadataUpdated: Array<{ prev: Object, next: Object, prevKey: string, nextKey: string }>,
   *   modified: Array<{ prev: Object, next: Object, prevKey: string, nextKey: string }>,
   *   removed: Array<{ prev: Object, prevKey: string }>,
   *   added: Array<{ next: Object, nextKey: string }>,
   *   warnings: string[]
   * }}
   */
  function planWmsReconciliation(prevWmsItems, nextWmsItems) {
    const warnings = [];
    const unchanged = [];
    const metadataUpdated = [];
    const modified = [];
    const removed = [];
    const added = [];

    // Numerar ocurrencias para claves únicas
    const prevOccurrences = new Map();
    const prevAnnotated = prevWmsItems.map((item) => {
      const baseSig = computeWmsServiceKey(item, 0);
      const occ = prevOccurrences.get(baseSig) || 0;
      prevOccurrences.set(baseSig, occ + 1);
      return {
        item,
        key: computeWmsServiceKey(item, occ),
        matched: false,
      };
    });

    const nextOccurrences = new Map();
    const sectionHostSeen = new Map();
    const nextAnnotated = nextWmsItems.map((item) => {
      const baseSig = computeWmsServiceKey(item, 0);
      const occ = nextOccurrences.get(baseSig) || 0;
      nextOccurrences.set(baseSig, occ + 1);
      if (occ > 0) {
        warnings.push(
          `Se detectó un servicio WMS duplicado en la sección '${item.seccion}' con el host '${item.host}'.`
        );
      } else {
        const secHostKey = `${item.seccion}|${normalizeWmsHost(item.host || item.url || "")}`;
        const prevSecHost = sectionHostSeen.get(secHostKey);
        if (
          prevSecHost &&
          serializeAllowedLayers(prevSecHost.allowed_layers) ===
            serializeAllowedLayers(item.allowed_layers)
        ) {
          warnings.push(
            `Posible ambigüedad: múltiples servicios WMS comparten la sección '${item.seccion}' y el host '${item.host}' sin diferenciarse en 'allowed_layers'.`
          );
        }
        sectionHostSeen.set(secHostKey, item);
      }

      return {
        item,
        key: computeWmsServiceKey(item, occ),
        matched: false,
      };
    });

    // Pasada 1: Coincidencia exacta de parámetros OGC (sin cambios o solo cambio de metadatos)
    for (const nextEntry of nextAnnotated) {
      const match = prevAnnotated.find(
        (prevEntry) =>
          !prevEntry.matched &&
          hasSameWmsOgcParameters(prevEntry.item, nextEntry.item)
      );
      if (match) {
        match.matched = true;
        nextEntry.matched = true;
        if (hasWmsMetadataChanged(match.item, nextEntry.item)) {
          metadataUpdated.push({
            prev: match.item,
            next: nextEntry.item,
            prevKey: match.key,
            nextKey: nextEntry.key,
          });
        } else {
          unchanged.push({
            prev: match.item,
            next: nextEntry.item,
            prevKey: match.key,
            nextKey: nextEntry.key,
          });
        }
      }
    }

    // Pasada 2: Servicios modificados (misma sección + mismo host con distinta versión/capas,
    // o misma sección con cambio de host)
    const unmatchedPrev = prevAnnotated.filter((e) => !e.matched);
    const unmatchedNext = nextAnnotated.filter((e) => !e.matched);

    // 2a. Primero emparejar los que comparten (seccion + host) pero cambiaron version/allowed_layers
    for (const nextEntry of unmatchedNext) {
      if (nextEntry.matched) continue;
      const sameSectionAndHostCandidates = unmatchedPrev.filter(
        (prevEntry) =>
          !prevEntry.matched &&
          prevEntry.item.seccion === nextEntry.item.seccion &&
          normalizeWmsHost(prevEntry.item.host || prevEntry.item.url || "") ===
            normalizeWmsHost(nextEntry.item.host || nextEntry.item.url || "")
      );
      if (sameSectionAndHostCandidates.length > 0) {
        if (sameSectionAndHostCandidates.length > 1) {
          warnings.push(
            `Ambigüedad al reconciliar servicios WMS con la misma sección '${nextEntry.item.seccion}' y host '${nextEntry.item.host}'. Se emparejó en orden de declaración.`
          );
        }
        const match = sameSectionAndHostCandidates[0];
        match.matched = true;
        nextEntry.matched = true;
        modified.push({
          prev: match.item,
          next: nextEntry.item,
          prevKey: match.key,
          nextKey: nextEntry.key,
        });
      }
    }

    // 2b. Emparejar los que comparten `seccion` pero cambiaron su `host`
    for (const nextEntry of unmatchedNext) {
      if (nextEntry.matched) continue;
      const sameSectionCandidates = unmatchedPrev.filter(
        (prevEntry) =>
          !prevEntry.matched &&
          prevEntry.item.seccion === nextEntry.item.seccion
      );
      if (sameSectionCandidates.length > 0) {
        if (sameSectionCandidates.length > 1) {
          warnings.push(
            `Ambigüedad al reconciliar múltiples servicios WMS modificados en la sección '${nextEntry.item.seccion}'. Se resolvió por orden de declaración.`
          );
        }
        const match = sameSectionCandidates[0];
        match.matched = true;
        nextEntry.matched = true;
        modified.push({
          prev: match.item,
          next: nextEntry.item,
          prevKey: match.key,
          nextKey: nextEntry.key,
        });
      }
    }

    // Pasada 3: Eliminados y agregados netos
    for (const prevEntry of unmatchedPrev) {
      if (!prevEntry.matched) {
        removed.push({ prev: prevEntry.item, prevKey: prevEntry.key });
      }
    }
    for (const nextEntry of unmatchedNext) {
      if (!nextEntry.matched) {
        added.push({ next: nextEntry.item, nextKey: nextEntry.key });
      }
    }

    return {
      unchanged,
      metadataUpdated,
      modified,
      removed,
      added,
      warnings,
    };
  }

  /**
   * Parser XML ligero de respaldo para entornos de prueba (como Node.js puro)
   * donde `DOMParser` no está definido globalmente. En el navegador utiliza
   * siempre el `DOMParser` nativo.
   *
   * @param {string} xmlText - Contenido XML de GetCapabilities.
   * @returns {Object} Documento XML compatible con los selectores de LayersInfoWMS.
   */
  function parseCapabilitiesXml(xmlText) {
    if (typeof xmlText !== "string" || !xmlText.trim()) {
      throw new Error("Empty GetCapabilities XML response");
    }

    const DOMParserClass =
      typeof DOMParser === "function" ? DOMParser : root?.DOMParser;

    if (DOMParserClass) {
      const xmlDoc = new DOMParserClass().parseFromString(xmlText, "text/xml");
      const parserErrors =
        typeof xmlDoc.getElementsByTagName === "function"
          ? Array.from(xmlDoc.getElementsByTagName("*")).filter(
              (el) => (el.localName || el.nodeName || "").toLowerCase() === "parsererror"
            )
          : [];
      if (parserErrors.length > 0) {
        throw new Error("Invalid GetCapabilities XML response");
      }
      return xmlDoc;
    }

    // Fallback XML parser sin dependencias externas para pruebas en Node.js
    const trimmed = xmlText.trim();
    if (
      !trimmed.startsWith("<") ||
      trimmed.includes("<parsererror") ||
      (!trimmed.includes("Capabilities") && !trimmed.includes("WMT_MS_Capabilities"))
    ) {
      throw new Error("Invalid GetCapabilities XML response");
    }

    function parseAttributes(attrString) {
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      let match;
      while ((match = attrRegex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2] !== undefined ? match[2] : match[3];
      }
      return attrs;
    }

    function createNode(tagName, attrs, parent = null) {
      const localName = tagName.includes(":") ? tagName.split(":")[1] : tagName;
      const attributeList = Object.entries(attrs).map(([name, value]) => ({
        name,
        value,
      }));
      return {
        nodeName: tagName,
        localName,
        attributes: attributeList,
        _attrs: attrs,
        children: [],
        textContent: "",
        parentElement: parent,
        getAttribute(name) {
          if (Object.prototype.hasOwnProperty.call(this._attrs, name)) {
            return this._attrs[name];
          }
          const lower = String(name).toLowerCase();
          const found = Object.keys(this._attrs).find(
            (k) => k.toLowerCase() === lower
          );
          return found ? this._attrs[found] : null;
        },
        getAttributeNS(_ns, localAttr) {
          return (
            this.getAttribute(`xlink:${localAttr}`) ||
            this.getAttribute(localAttr)
          );
        },
        getElementsByTagName(targetName) {
          const results = [];
          const wantAll = targetName === "*";
          const targetLower = String(targetName).toLowerCase();
          function walk(node) {
            for (const child of node.children) {
              if (
                wantAll ||
                child.localName.toLowerCase() === targetLower ||
                child.nodeName.toLowerCase() === targetLower
              ) {
                results.push(child);
              }
              walk(child);
            }
          }
          walk(this);
          return results;
        },
        querySelector(selector) {
          const clean = selector.replace(/^[^a-zA-Z0-9_-]+/, "").toLowerCase();
          return (
            this.getElementsByTagName("*").find(
              (el) => el.localName.toLowerCase() === clean
            ) || null
          );
        },
      };
    }

    const cleanedXml = trimmed
      .replace(/<\?xml[\s\S]*?\?>/gi, "")
      .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const rootWrapper = createNode("#document", {});
    const stack = [rootWrapper];
    const tokenRegex = /<\/?([a-zA-Z0-9_:-]+)([^>]*?)(\/?)>|([^<]+)/g;
    let match;

    while ((match = tokenRegex.exec(cleanedXml)) !== null) {
      const fullToken = match[0];
      const tagName = match[1];
      const attrStr = match[2] || "";
      const selfClosing = match[3] === "/";
      const textNode = match[4];

      const currentParent = stack[stack.length - 1];

      if (textNode !== undefined) {
        if (currentParent) {
          currentParent.textContent += textNode;
        }
        continue;
      }

      if (fullToken.startsWith("</")) {
        if (stack.length > 1) {
          const closed = stack.pop();
          if (stack[stack.length - 1] && stack[stack.length - 1] !== rootWrapper) {
            stack[stack.length - 1].textContent += closed.textContent;
          }
        }
      } else {
        const node = createNode(tagName, parseAttributes(attrStr), currentParent === rootWrapper ? null : currentParent);
        currentParent.children.push(node);
        if (!selfClosing) {
          stack.push(node);
        }
      }
    }

    if (stack.length !== 1 || rootWrapper.children.length === 0) {
      throw new Error("Malformed GetCapabilities XML document");
    }

    rootWrapper.documentElement = rootWrapper.children[0];
    return rootWrapper;
  }

  /**
   * Determina si una subcapa del GetCapabilities pertenece a un servicio WMS específico.
   *
   * @param {Object} subItem - Item de subcapa en `gestorMenu.items[seccion].itemsComposite`.
   * @param {string} serviceKey - Clave compuesta del servicio WMS.
   * @param {Object} wmsServiceDef - Definición del servicio WMS.
   * @param {boolean} [isOnlyServiceInSection=false] - Si es el único servicio en esa sección.
   * @returns {boolean}
   */
  function doesSubItemBelongToWmsService(
    subItem,
    serviceKey,
    wmsServiceDef,
    isOnlyServiceInSection = false
  ) {
    if (!subItem) return false;
    if (subItem._wmsServiceKey) {
      return subItem._wmsServiceKey === serviceKey;
    }
    const itemHost = normalizeWmsHost(subItem.capa?.host || "");
    const serviceHost = normalizeWmsHost(wmsServiceDef.host || wmsServiceDef.url || "");
    if (itemHost && serviceHost && itemHost === serviceHost) {
      if (Array.isArray(wmsServiceDef.allowed_layers)) {
        return wmsServiceDef.allowed_layers.includes(subItem.nombre || subItem.capa?.nombre);
      }
      return true;
    }
    return isOnlyServiceInSection;
  }

  /**
   * Desactiva y elimina las subcapas asociadas a un servicio WMS tanto del mapa (`overlayMaps`)
   * como de `gestorMenu` y `app.layers`, retornando el estado previo de las subcapas que
   * estaban activas (visibles y su opacidad) por si deben restaurarse tras modificar el servicio.
   *
   * @param {Object} wmsServiceDef - Definición del servicio WMS a remover.
   * @param {string} serviceKey - Clave del servicio WMS.
   * @param {boolean} [keepSectionIfShared=false] - Indica si otros servicios comparten la sección.
   * @returns {Map<string, { opacity: number }>} Mapa de subcapas que estaban activas (`layerName -> { opacity }`).
   */
  function removeWmsServiceSublayers(wmsServiceDef, serviceKey, keepSectionIfShared = false) {
    const previouslyActive = new Map();
    const currentGestorMenu = getGestorMenu();
    const currentApp = getApp();
    const currentMapa = getMapa();
    const currentOverlayMaps = getOverlayMaps();
    const seccion = wmsServiceDef.seccion;

    const sectionGroup = currentGestorMenu?.items?.[seccion];
    if (sectionGroup && isPlainObject(sectionGroup.itemsComposite)) {
      const compositeKeys = Object.keys(sectionGroup.itemsComposite);

      for (const compKey of compositeKeys) {
        const subItem = sectionGroup.itemsComposite[compKey];
        if (
          !doesSubItemBelongToWmsService(
            subItem,
            serviceKey,
            wmsServiceDef,
            !keepSectionIfShared
          )
        ) {
          continue;
        }

        const layerName = subItem.nombre || subItem.capa?.nombre;
        const childId = typeof subItem.getId === "function" ? subItem.getId() : `child-${compKey}`;
        const overlayLayer = currentOverlayMaps ? currentOverlayMaps[layerName] : null;
        const isCurrentlyActive =
          Boolean(subItem.visible) ||
          (typeof subItem.getVisible === "function" && Boolean(subItem.getVisible())) ||
          Boolean(overlayLayer) ||
          Boolean(currentGestorMenu?.activeLayers?.includes(layerName));

        if (isCurrentlyActive && layerName) {
          const currentOpacity =
            subItem.capa?.opacity ??
            overlayLayer?.options?.opacity ??
            overlayLayer?._opacity ??
            1;
          previouslyActive.set(layerName, { opacity: Number(currentOpacity) });
        }

        // 1. Remover capa superpuesta activa de Leaflet y de overlayMaps
        if (layerName && currentOverlayMaps && currentOverlayMaps[layerName]) {
          const mapLayer = currentOverlayMaps[layerName];
          if (currentMapa) {
            if (typeof mapLayer.removeFrom === "function") {
              mapLayer.removeFrom(currentMapa);
            } else if (typeof currentMapa.removeLayer === "function") {
              currentMapa.removeLayer(mapLayer);
            }
          }
          delete currentOverlayMaps[layerName];
        }

        // 2. Remover de gestorMenu.activeLayers y availableLayers
        if (currentGestorMenu && layerName) {
          if (typeof currentGestorMenu.removeActiveLayer === "function") {
            currentGestorMenu.removeActiveLayer(layerName);
          } else if (Array.isArray(currentGestorMenu.activeLayers)) {
            const actIdx = currentGestorMenu.activeLayers.indexOf(layerName);
            if (actIdx >= 0) currentGestorMenu.activeLayers.splice(actIdx, 1);
          }

          if (Array.isArray(currentGestorMenu.availableLayers)) {
            const availIdx = currentGestorMenu.availableLayers.indexOf(layerName);
            if (availIdx >= 0) currentGestorMenu.availableLayers.splice(availIdx, 1);
          }
        }

        if (currentMapa && typeof currentMapa.activeLayerHasChanged === "function" && layerName) {
          currentMapa.activeLayerHasChanged(layerName, false);
        }

        // 3. Limpiar referencias en app.layers y app.layerNameByDomId
        if (currentApp) {
          if (currentApp.layers && layerName) {
            delete currentApp.layers[layerName];
          }
          if (currentApp.layerNameByDomId && childId) {
            delete currentApp.layerNameByDomId[childId];
          }
        }

        // 4. Eliminar del itemsComposite de la sección
        delete sectionGroup.itemsComposite[compKey];
      }

      // Si la sección quedó sin subcapas y no está compartida, eliminar el grupo de gestorMenu.items
      const remainingSubItems = Object.keys(sectionGroup.itemsComposite).length;
      if (remainingSubItems === 0 && !keepSectionIfShared) {
        delete currentGestorMenu.items[seccion];
        if (currentGestorMenu._existsIndexes) {
          delete currentGestorMenu._existsIndexes[seccion];
        }
        const doc = typeof document !== "undefined" ? document : root?.document;
        const sectionPanel = doc?.getElementById?.(`lista-${seccion}`);
        if (sectionPanel && typeof sectionPanel.remove === "function") {
          sectionPanel.remove();
        }
      }
    }

    // 5. Eliminar la instancia LayersInfoWMS correspondiente de gestorMenu.layersInfo
    if (currentGestorMenu && Array.isArray(currentGestorMenu.layersInfo)) {
      const targetHost = normalizeWmsHost(wmsServiceDef.host || wmsServiceDef.url || "");
      currentGestorMenu.layersInfo = currentGestorMenu.layersInfo.filter((info) => {
        if (info._wmsServiceKey) {
          return info._wmsServiceKey !== serviceKey;
        }
        return !(
          info.section === seccion &&
          normalizeWmsHost(info.host || "") === targetHost
        );
      });
    }

    _wmsRegistry.delete(serviceKey);
    return previouslyActive;
  }

  /**
   * Activa una subcapa WMS en el mapa y restaura su opacidad (utilizado cuando un
   * servicio WMS modificado conserva una subcapa que ya estaba activa en el visor).
   *
   * @param {Object} subItem - Item de subcapa creado tras el nuevo GetCapabilities.
   * @param {number} opacity - Opacidad a restaurar (0..1).
   */
  function activateAndRestoreWmsSublayer(subItem, opacity) {
    if (!subItem || !subItem.capa) return;
    const layerName = subItem.nombre || subItem.capa.nombre;
    const safeOpacity =
      typeof opacity === "number" && Number.isFinite(opacity) ? opacity : 1;

    subItem.visible = true;
    subItem.capa.opacity = safeOpacity;
    if (Array.isArray(subItem.capas) && subItem.capas[0]) {
      subItem.capas[0].visible = true;
      subItem.capas[0].opacity = safeOpacity;
    }

    const currentGestorMenu = getGestorMenu();
    const currentOverlayMaps = getOverlayMaps();
    const currentMapa = getMapa();

    if (currentGestorMenu) {
      if (typeof currentGestorMenu.addActiveLayer === "function") {
        currentGestorMenu.addActiveLayer(layerName);
      } else if (
        Array.isArray(currentGestorMenu.activeLayers) &&
        !currentGestorMenu.activeLayers.includes(layerName)
      ) {
        currentGestorMenu.activeLayers.push(layerName);
      }
    }

    const loadWmsTplAuxFn =
      typeof loadWmsTplAux === "function" ? loadWmsTplAux : root?.loadWmsTplAux;
    const loadWmsTplFn =
      typeof loadWmsTpl === "function" ? loadWmsTpl : root?.loadWmsTpl;
    const createWmsLayerFn =
      typeof createWmsLayer === "function" ? createWmsLayer : root?.createWmsLayer;

    // Si existía una instancia residual en overlayMaps, removerla primero
    if (currentOverlayMaps && currentOverlayMaps[layerName]) {
      const existing = currentOverlayMaps[layerName];
      if (currentMapa) {
        if (typeof existing.removeFrom === "function") {
          existing.removeFrom(currentMapa);
        } else if (typeof currentMapa.removeLayer === "function") {
          currentMapa.removeLayer(existing);
        }
      }
      delete currentOverlayMaps[layerName];
    }

    if (typeof loadWmsTplAuxFn === "function") {
      loadWmsTplAuxFn(subItem);
    } else if (typeof loadWmsTplFn === "function") {
      loadWmsTplFn(subItem);
    } else if (typeof createWmsLayerFn === "function" && currentOverlayMaps && currentMapa) {
      createWmsLayerFn(subItem);
      if (currentOverlayMaps[layerName]) {
        if (typeof currentOverlayMaps[layerName].setOpacity === "function") {
          currentOverlayMaps[layerName].setOpacity(safeOpacity);
        }
        if (typeof currentOverlayMaps[layerName].addTo === "function") {
          currentOverlayMaps[layerName].addTo(currentMapa);
        } else if (typeof currentMapa.addLayer === "function") {
          currentMapa.addLayer(currentOverlayMaps[layerName]);
        }
      }
    } else if (currentOverlayMaps && currentMapa) {
      // Fallback directo en entornos de prueba con mock de Leaflet
      const leafletGlobal = typeof L !== "undefined" ? L : root?.L;
      let createdOverlay = null;
      const hostUrl =
        typeof subItem.capa.getHostWMS === "function"
          ? subItem.capa.getHostWMS()
          : buildWmsOwsEndpoint(subItem.capa.host, subItem.capa.servicio);

      if (leafletGlobal?.tileLayer?.wms) {
        createdOverlay = leafletGlobal.tileLayer.wms(hostUrl, {
          layers: layerName,
          opacity: safeOpacity,
          version: subItem.capa.version || "1.3.0",
        });
      } else {
        createdOverlay = {
          _name: layerName,
          options: {
            layer: layerName,
            opacity: safeOpacity,
            version: subItem.capa.version || "1.3.0",
          },
          _url: hostUrl,
          setOpacity(val) {
            this.options.opacity = val;
          },
          addTo(mapInstance) {
            if (typeof mapInstance.addLayer === "function") {
              mapInstance.addLayer(this);
            }
            return this;
          },
          removeFrom(mapInstance) {
            if (typeof mapInstance.removeLayer === "function") {
              mapInstance.removeLayer(this);
            }
          },
        };
      }

      if (typeof createdOverlay.setOpacity === "function") {
        createdOverlay.setOpacity(safeOpacity);
      }
      if (typeof createdOverlay.addTo === "function") {
        createdOverlay.addTo(currentMapa);
      } else if (typeof currentMapa.addLayer === "function") {
        currentMapa.addLayer(createdOverlay);
      }
      currentOverlayMaps[layerName] = createdOverlay;
    }

    if (currentGestorMenu && typeof currentGestorMenu.setLayerOpacity === "function") {
      currentGestorMenu.setLayerOpacity(layerName, safeOpacity);
    } else if (
      currentOverlayMaps &&
      currentOverlayMaps[layerName] &&
      typeof currentOverlayMaps[layerName].setOpacity === "function"
    ) {
      currentOverlayMaps[layerName].setOpacity(safeOpacity);
    }
  }

  /**
   * Descarga y procesa el documento `GetCapabilities` de un servicio WMS nuevo o modificado.
   *
   * Protecciones asíncronas:
   * - Verifica `generationId === _updateGeneration` tras cada `await` para descartar
   *   respuestas obsoletas sin tocar `gestorMenu` ni `overlayMaps`.
   * - Propaga errores de red, estado HTTP no exitoso o XML malformado sin dejar
   *   estructuras corruptas.
   *
   * @param {Object} wmsItem - Configuración del servicio WMS.
   * @param {string} serviceKey - Clave única del servicio WMS.
   * @param {number} generationId - Identificador de generación de la actualización.
   * @returns {Promise<{
   *   stale: boolean,
   *   wmsLayerInfo: Object|null,
   *   subItems: Array<Object>,
   *   keyword: string,
   *   abstract: string
   * }>}
   */
  async function fetchAndBuildWmsCapabilities(wmsItem, serviceKey, generationId) {
    const fetchFn = typeof fetch === "function" ? fetch : root?.fetch;
    if (typeof fetchFn !== "function") {
      throw new Error(
        `No existe implementación de 'fetch' disponible para consultar GetCapabilities de '${wmsItem.host}'.`
      );
    }

    const service = String(wmsItem.servicio || "wms").toLowerCase();
    const version = String(wmsItem.version || "1.3.0");
    const featureInfoFormat = wmsItem.feature_info_format || "application/json";
    const normalizedType =
      wmsItem.type === "wmslayer_mapserver" ? "wmslayer_mapserver" : "wms";

    const TabClass = typeof Tab === "function" ? Tab : root?.Tab;
    const LayersInfoWMSClass =
      typeof LayersInfoWMS === "function" ? LayersInfoWMS : root?.LayersInfoWMS;
    const ImpresorGrupoHTMLClass =
      typeof ImpresorGrupoHTML === "function"
        ? ImpresorGrupoHTML
        : root?.ImpresorGrupoHTML;
    const ImpresorGroupWMSSelectorClass =
      typeof ImpresorGroupWMSSelector === "function"
        ? ImpresorGroupWMSSelector
        : root?.ImpresorGroupWMSSelector;
    const ImpresorItemHTMLClass =
      typeof ImpresorItemHTML === "function"
        ? ImpresorItemHTML
        : root?.ImpresorItemHTML;

    const tab = TabClass ? new TabClass(wmsItem.tab) : { listType: "accordion", getId: () => "", getExtendedId: () => "main-menu-tab-" };
    const listType = tab.listType || "default";

    let impresorGroupTemp = ImpresorGrupoHTMLClass ? new ImpresorGrupoHTMLClass() : null;
    if (listType === "combobox" && ImpresorGroupWMSSelectorClass) {
      impresorGroupTemp = new ImpresorGroupWMSSelectorClass();
    }

    let wmsLayerInfo = null;
    if (LayersInfoWMSClass) {
      wmsLayerInfo = new LayersInfoWMSClass(
        wmsItem.host,
        service,
        version,
        tab,
        wmsItem.seccion,
        wmsItem.peso,
        wmsItem.nombre,
        wmsItem.short_abstract,
        featureInfoFormat,
        normalizedType,
        wmsItem.icons,
        wmsItem.customize_layers || "",
        impresorGroupTemp || ""
      );
      if (wmsItem.allowed_layers) {
        wmsLayerInfo.setAllowebLayers(wmsItem.allowed_layers);
      }
      if (wmsItem.customize_layers) {
        wmsLayerInfo.setCustomizedLayers(wmsItem.customize_layers);
      }
      wmsLayerInfo._wmsServiceKey = serviceKey;
      wmsLayerInfo._executed = true;
    }

    const owsEndpoint =
      wmsLayerInfo && typeof wmsLayerInfo.getHostOWS === "function"
        ? wmsLayerInfo.getHostOWS()
        : buildWmsOwsEndpoint(wmsItem.host, service);
    const separator = owsEndpoint.includes("?") ? "&" : "?";
    const capabilitiesUrl = `${owsEndpoint}${separator}service=${service.toUpperCase()}&version=${version}&request=GetCapabilities`;

    const response = await fetchFn(capabilitiesUrl);

    if (generationId !== _updateGeneration) {
      return { stale: true, wmsLayerInfo: null, subItems: [], keyword: "", abstract: "" };
    }

    if (!response || !response.ok) {
      const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "Network error";
      throw new Error(
        `GetCapabilities request failed for '${wmsItem.seccion}' (${wmsItem.host}): ${status}`
      );
    }

    const responseText = await response.text();

    if (generationId !== _updateGeneration) {
      return { stale: true, wmsLayerInfo: null, subItems: [], keyword: "", abstract: "" };
    }

    // Parsear y validar XML
    const xmlDoc =
      wmsLayerInfo &&
      typeof wmsLayerInfo.parseXmlDocument === "function" &&
      (typeof DOMParser === "function" || typeof root?.DOMParser === "function")
        ? wmsLayerInfo.parseXmlDocument(responseText)
        : parseCapabilitiesXml(responseText);

    const getDescendants = (element, localName) => {
      if (!element || typeof element.getElementsByTagName !== "function") return [];
      const expected = localName.toLowerCase();
      return Array.from(element.getElementsByTagName("*")).filter(
        (child) => (child.localName || child.nodeName || "").toLowerCase() === expected
      );
    };

    const getDirectChildren = (element, localName) => {
      if (!element) return [];
      const expected = localName.toLowerCase();
      return Array.from(element.children || []).filter(
        (child) => (child.localName || child.nodeName || "").toLowerCase() === expected
      );
    };

    const getDirectChild = (element, localName) =>
      getDirectChildren(element, localName)[0] || null;

    const getElementText = (element) => element?.textContent?.trim() || "";

    const capability = getDescendants(xmlDoc, "Capability")[0] || null;
    const rootLayer = getDirectChild(capability, "Layer");

    if (!capability || !rootLayer) {
      throw new Error(
        `Invalid GetCapabilities XML structure for '${wmsItem.seccion}' (${wmsItem.host}): missing Capability/Layer.`
      );
    }

    const currentGestorMenu = getGestorMenu();
    const subItems = [];
    let keyword = "";
    let abstract = "";

    if (
      wmsLayerInfo &&
      typeof wmsLayerInfo._parseWmsServiceMetadata === "function" &&
      typeof wmsLayerInfo._createMenuItem === "function" &&
      ImpresorItemHTMLClass
    ) {
      wmsLayerInfo.serviceMetadata = wmsLayerInfo._parseWmsServiceMetadata(
        xmlDoc,
        capability,
        rootLayer
      );
      keyword = wmsLayerInfo.serviceMetadata?.keywords?.[0] || "";
      abstract = wmsLayerInfo.serviceMetadata?.abstract || "";

      const impresorItem = new ImpresorItemHTMLClass();
      const leafLayers = getDescendants(rootLayer, "Layer").filter((layer) => {
        if (getDirectChildren(layer, "Layer").length > 0) return false;
        const iName = getElementText(getDirectChild(layer, "Name"));
        return Boolean(iName) && wmsLayerInfo.isAllowedLayer(iName);
      });

      leafLayers.forEach((layerEl, index) => {
        const menuItem = wmsLayerInfo._createMenuItem(
          layerEl,
          index,
          impresorItem,
          listType === "default" ? null : listType,
          rootLayer
        );
        if (menuItem) {
          menuItem._wmsServiceKey = serviceKey;
          subItems.push(menuItem);
        }
      });
    } else {
      // Construcción directa compatible cuando las clases de UI completas no están cargadas
      const serviceNode =
        getDescendants(xmlDoc, "ServiceIdentification")[0] ||
        getDescendants(xmlDoc, "Service")[0];
      abstract = getElementText(getDirectChild(serviceNode, "Abstract"));
      const kwNode = getDescendants(serviceNode, "Keyword")[0];
      keyword = getElementText(kwNode);

      const allowedSet = Array.isArray(wmsItem.allowed_layers)
        ? new Set(wmsItem.allowed_layers)
        : null;
      const customizedMap = isPlainObject(wmsItem.customize_layers)
        ? wmsItem.customize_layers
        : null;

      const isAllowed = (layerName) => {
        if (!layerName) return false;
        if (allowedSet) return allowedSet.has(layerName);
        if (customizedMap) return Object.prototype.hasOwnProperty.call(customizedMap, layerName);
        return true;
      };

      const leafLayers = getDescendants(rootLayer, "Layer").filter((layer) => {
        if (getDirectChildren(layer, "Layer").length > 0) return false;
        const iName = getElementText(getDirectChild(layer, "Name"));
        return isAllowed(iName);
      });

      const CapaClass = typeof Capa === "function" ? Capa : root?.Capa;
      const ItemClass = typeof Item === "function" ? Item : root?.Item;

      leafLayers.forEach((layerEl, index) => {
        const iName = getElementText(getDirectChild(layerEl, "Name"));
        const rawTitle = getElementText(getDirectChild(layerEl, "Title")) || iName;
        const rawAbstract = getElementText(getDirectChild(layerEl, "Abstract")) || "";
        const iTitle = customizedMap?.[iName]?.new_title || rawTitle;
        const iAbstract = customizedMap?.[iName]?.new_abstract || rawAbstract;

        const capaObj = CapaClass
          ? new CapaClass(
              iName,
              iTitle,
              "CRS:84",
              wmsItem.host,
              service,
              version,
              featureInfoFormat,
              [],
              null,
              null,
              null,
              null,
              null,
              null,
              {}
            )
          : {
              nombre: iName,
              titulo: iTitle,
              host: wmsItem.host,
              servicio: service,
              version,
              featureInfoFormat,
              opacity: 1,
              getHostWMS() {
                return buildWmsOwsEndpoint(this.host, this.servicio);
              },
            };

        const itemId = `${wmsItem.seccion}${index}`;
        const childId = `child-${itemId}`;
        const subItem = ItemClass
          ? new ItemClass(
              iName,
              itemId,
              [],
              iAbstract,
              iTitle,
              capaObj,
              "loadWmsTpl",
              null,
              null,
              listType
            )
          : {
              nombre: iName,
              seccion: itemId,
              titulo: iTitle,
              descripcion: iAbstract,
              capa: capaObj,
              capas: [capaObj],
              visible: false,
              getId: () => childId,
              getVisible: function () {
                return this.visible;
              },
              imprimir: () => `<li id="${childId}">${iTitle}</li>`,
            };

        subItem._wmsServiceKey = serviceKey;
        if (currentGestorMenu) {
          if (typeof currentGestorMenu.setAvailableLayer === "function") {
            currentGestorMenu.setAvailableLayer(iName);
          } else if (
            Array.isArray(currentGestorMenu.availableLayers) &&
            !currentGestorMenu.availableLayers.includes(iName)
          ) {
            currentGestorMenu.availableLayers.push(iName);
          }
        }
        subItems.push(subItem);
      });

      if (!wmsLayerInfo) {
        wmsLayerInfo = {
          _wmsServiceKey: serviceKey,
          _executed: true,
          host: wmsItem.host,
          service,
          version,
          section: wmsItem.seccion,
          weight: wmsItem.peso,
          name: wmsItem.nombre,
          short_abstract: wmsItem.short_abstract,
        };
      }
    }

    return {
      stale: false,
      wmsLayerInfo,
      subItems,
      keyword,
      abstract,
    };
  }

  /**
   * Registra las subcapas parseadas de un servicio WMS en `gestorMenu.items[seccion]`,
   * `gestorMenu.layersInfo` y `app.layers`.
   *
   * @param {Object} wmsItem - Definición del servicio WMS.
   * @param {string} serviceKey - Clave del servicio WMS.
   * @param {Object} fetchedData - Resultado de `fetchAndBuildWmsCapabilities`.
   */
  function registerWmsServiceInMenu(wmsItem, serviceKey, fetchedData) {
    const currentGestorMenu = getGestorMenu();
    const currentApp = getApp();
    const seccion = wmsItem.seccion;
    const { wmsLayerInfo, subItems, keyword, abstract } = fetchedData;

    if (currentGestorMenu) {
      if (Array.isArray(currentGestorMenu.layersInfo) && wmsLayerInfo) {
        currentGestorMenu.layersInfo.push(wmsLayerInfo);
      }

      const ItemGroupClass =
        typeof ItemGroup === "function" ? ItemGroup : root?.ItemGroup;
      const ImpresorGrupoHTMLClass =
        typeof ImpresorGrupoHTML === "function"
          ? ImpresorGrupoHTML
          : root?.ImpresorGrupoHTML;
      const ImpresorGroupWMSSelectorClass =
        typeof ImpresorGroupWMSSelector === "function"
          ? ImpresorGroupWMSSelector
          : root?.ImpresorGroupWMSSelector;
      const TabClass = typeof Tab === "function" ? Tab : root?.Tab;

      const tab = TabClass
        ? new TabClass(wmsItem.tab)
        : {
            id: wmsItem.tab?.id || "",
            listType:
              wmsItem.tab?.listType || wmsItem.tab?.list_type || "accordion",
            getId: function () {
              return this.id;
            },
            getExtendedId: function () {
              return `main-menu-tab-${this.id}`;
            },
          };

      if (typeof currentGestorMenu.addTab === "function" && TabClass) {
        currentGestorMenu.addTab(tab);
      }

      if (ItemGroupClass && typeof currentGestorMenu.addItemGroup === "function") {
        const groupAux = new ItemGroupClass(
          tab,
          wmsItem.nombre,
          seccion,
          wmsItem.peso,
          keyword || "",
          abstract || "",
          wmsItem.short_abstract || ""
        );
        if (tab.listType === "combobox" && ImpresorGroupWMSSelectorClass) {
          groupAux.setImpresor(new ImpresorGroupWMSSelectorClass());
        } else if (ImpresorGrupoHTMLClass) {
          groupAux.setImpresor(new ImpresorGrupoHTMLClass());
        }
        if (typeof currentGestorMenu.getItemsGroupDOM === "function") {
          groupAux.setObjDom(currentGestorMenu.getItemsGroupDOM());
        }
        subItems.forEach((subItem) => {
          groupAux.setItem(subItem);
        });
        currentGestorMenu.addItemGroup(groupAux);
        const registeredGroup = currentGestorMenu.items?.[seccion];
        if (registeredGroup && registeredGroup !== groupAux) {
          registeredGroup.tab = tab;
          if (typeof registeredGroup.setImpresor === "function") {
            if (tab.listType === "combobox" && ImpresorGroupWMSSelectorClass) {
              registeredGroup.setImpresor(new ImpresorGroupWMSSelectorClass());
            } else if (ImpresorGrupoHTMLClass) {
              registeredGroup.setImpresor(new ImpresorGrupoHTMLClass());
            }
          }
        }
      } else {
        // Registro directo cuando ItemGroup no está disponible en un entorno de prueba mínimo
        if (!currentGestorMenu.items) currentGestorMenu.items = {};
        let targetGroup = currentGestorMenu.items[seccion];
        if (!targetGroup) {
          targetGroup = {
            tab,
            nombre: wmsItem.nombre,
            title: wmsItem.nombre,
            seccion,
            peso: wmsItem.peso ?? 0,
            weight: wmsItem.peso ?? 0,
            resumen: wmsItem.short_abstract || "",
            shortDescription: wmsItem.short_abstract || "",
            itemsComposite: {},
            isBaseLayer: () => false,
            getId: () => `lista-${seccion}`,
            getTab: () => tab,
            setQuerySearch: () => {},
            muestraCantidadCapasVisibles: () => {},
            hideAllLayers: function () {
              Object.values(this.itemsComposite).forEach((it) => {
                it.visible = false;
              });
            },
            setItem: function (it) {
              this.itemsComposite[it.seccion] = it;
            },
            imprimir: function () {
              return Object.values(this.itemsComposite)
                .map((it) => (typeof it.imprimir === "function" ? it.imprimir() : ""))
                .join("");
            },
          };
          currentGestorMenu.items[seccion] = targetGroup;
        } else {
          targetGroup.nombre = wmsItem.nombre;
          targetGroup.title = wmsItem.nombre;
          targetGroup.peso = wmsItem.peso ?? targetGroup.peso;
          targetGroup.weight = wmsItem.peso ?? targetGroup.weight;
        }

        const existingCount = Object.keys(targetGroup.itemsComposite).length;
        subItems.forEach((subItem, idx) => {
          const compKey =
            existingCount > 0 ? `${subItem.seccion}_${existingCount + idx}` : subItem.seccion;
          subItem.seccion = compKey;
          targetGroup.itemsComposite[compKey] = subItem;
        });
      }
    }

    // Registrar cada subcapa en app.layers y app.layerNameByDomId
    if (currentApp) {
      if (!currentApp.layers) currentApp.layers = {};
      if (!currentApp.layerNameByDomId) currentApp.layerNameByDomId = {};
      subItems.forEach((subItem) => {
        const childId =
          typeof subItem.getId === "function"
            ? subItem.getId()
            : `child-${subItem.seccion}`;
        currentApp.layers[subItem.nombre] = {
          ...subItem,
          childid: childId,
          display_options: false,
          type: subItem.capa?.servicio || "wms",
        };
        currentApp.layerNameByDomId[childId] = subItem.nombre;
      });
    }

    _wmsRegistry.set(serviceKey, {
      key: serviceKey,
      item: deepClone(wmsItem),
    });
  }

  /**
   * Reconcilia todos los servicios WMS entre `prevData.items` y `nextData.items`.
   *
   * @param {Object} prevData - Objeto `data` anterior.
   * @param {Object} nextData - Objeto `data` nuevo.
   * @param {number} generationId - Identificador de generación asíncrona.
   * @returns {Promise<{
   *   appliedSections: string[],
   *   warnings: string[],
   *   errors: string[],
   *   changed: boolean,
   *   stale: boolean
   * }>}
   */
  async function reconcileWmsLayers(prevData, nextData, generationId) {
    const appliedSections = [];
    const warnings = [];
    const errors = [];

    const prevItems = Array.isArray(prevData?.items) ? prevData.items : [];
    const nextItems = Array.isArray(nextData?.items) ? nextData.items : [];

    const prevWmsItems = Array.isArray(_appliedWmsItems)
      ? _appliedWmsItems
      : prevItems.filter(isWmsItem);
    const nextWmsItems = nextItems.filter(isWmsItem);

    if (isDeepEqual(prevWmsItems, nextWmsItems)) {
      return {
        appliedSections,
        warnings,
        errors,
        changed: false,
        stale: false,
      };
    }

    const plan = planWmsReconciliation(prevWmsItems, nextWmsItems);
    warnings.push(...plan.warnings);

    const hasStructuralChanges =
      plan.metadataUpdated.length > 0 ||
      plan.modified.length > 0 ||
      plan.removed.length > 0 ||
      plan.added.length > 0;

    if (!hasStructuralChanges) {
      return {
        appliedSections,
        warnings,
        errors,
        changed: false,
        stale: false,
      };
    }

    // Contabilizar cuántos servicios en nextWmsItems usan cada sección
    const nextSectionCounts = new Map();
    for (const item of nextWmsItems) {
      nextSectionCounts.set(
        item.seccion,
        (nextSectionCounts.get(item.seccion) || 0) + 1
      );
    }

    // 1. Primero ejecutar las peticiones asíncronas GetCapabilities de servicios modificados y agregados
    // ANTES de mutar el estado de gestorMenu u overlayMaps.
    const tasks = [
      ...plan.modified.map((entry) => ({
        kind: "modified",
        prev: entry.prev,
        next: entry.next,
        prevKey: entry.prevKey,
        nextKey: entry.nextKey,
      })),
      ...plan.added.map((entry) => ({
        kind: "added",
        prev: null,
        next: entry.next,
        prevKey: null,
        nextKey: entry.nextKey,
      })),
    ];

    let fetchResults = [];
    if (tasks.length > 0) {
      fetchResults = await Promise.all(
        tasks.map(async (task) => {
          try {
            const fetched = await fetchAndBuildWmsCapabilities(
              task.next,
              task.nextKey,
              generationId
            );
            return { task, fetched, error: null };
          } catch (err) {
            return {
              task,
              fetched: null,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        })
      );

      // Si durante las peticiones llegó una actualización más reciente, abortar sin mutar estado
      if (
        generationId !== _updateGeneration ||
        fetchResults.some((res) => res.fetched?.stale)
      ) {
        return {
          appliedSections: [],
          warnings,
          errors,
          changed: false,
          stale: true,
        };
      }
    }

    const currentGestorMenu = getGestorMenu();

    // 2. Actualizar claves en servicios sin cambios si cambió su índice de ocurrencia
    for (const entry of plan.unchanged) {
      if (entry.prevKey !== entry.nextKey) {
        const sectionGroup = currentGestorMenu?.items?.[entry.next.seccion];
        if (sectionGroup && isPlainObject(sectionGroup.itemsComposite)) {
          for (const subItem of Object.values(sectionGroup.itemsComposite)) {
            if (subItem && subItem._wmsServiceKey === entry.prevKey) {
              subItem._wmsServiceKey = entry.nextKey;
            }
          }
        }
        _wmsRegistry.delete(entry.prevKey);
        _wmsRegistry.set(entry.nextKey, {
          key: entry.nextKey,
          item: deepClone(entry.next),
        });
      }
    }

    // 3. Aplicar cambios de solo metadatos en el lugar (sin pedir GetCapabilities ni tocar capas activas)
    const TabClass = typeof Tab === "function" ? Tab : root?.Tab;
    const ImpresorGrupoHTMLClass =
      typeof ImpresorGrupoHTML === "function"
        ? ImpresorGrupoHTML
        : root?.ImpresorGrupoHTML;
    const ImpresorGroupWMSSelectorClass =
      typeof ImpresorGroupWMSSelector === "function"
        ? ImpresorGroupWMSSelector
        : root?.ImpresorGroupWMSSelector;

    for (const entry of plan.metadataUpdated) {
      const { prev, next, prevKey, nextKey } = entry;
      const tabChanged =
        next.tab !== undefined && !isDeepEqual(prev?.tab || null, next.tab || null);
      const updatedTab = tabChanged
        ? TabClass
          ? new TabClass(next.tab)
          : {
              id: next.tab?.id || "",
              listType:
                next.tab?.listType || next.tab?.list_type || "accordion",
              getId: function () {
                return this.id;
              },
              getExtendedId: function () {
                return `main-menu-tab-${this.id}`;
              },
            }
        : null;
      if (
        updatedTab &&
        currentGestorMenu &&
        typeof currentGestorMenu.addTab === "function" &&
        TabClass
      ) {
        currentGestorMenu.addTab(updatedTab);
      }

      const sectionGroup = currentGestorMenu?.items?.[next.seccion];
      if (sectionGroup) {
        sectionGroup.nombre = next.nombre;
        sectionGroup.title = next.nombre;
        sectionGroup.peso = next.peso ?? sectionGroup.peso;
        sectionGroup.weight = next.peso ?? sectionGroup.weight;
        sectionGroup.resumen = next.short_abstract ?? sectionGroup.resumen;
        sectionGroup.shortDescription =
          next.short_abstract ?? sectionGroup.shortDescription;
        if (updatedTab) {
          sectionGroup.tab = updatedTab;
          if (typeof sectionGroup.setImpresor === "function") {
            if (updatedTab.listType === "combobox" && ImpresorGroupWMSSelectorClass) {
              sectionGroup.setImpresor(new ImpresorGroupWMSSelectorClass());
            } else if (ImpresorGrupoHTMLClass) {
              sectionGroup.setImpresor(new ImpresorGrupoHTMLClass());
            }
          }
        }
        if (next.section_style) {
          sectionGroup.sectionStyle = deepClone(next.section_style);
        }
        if (prevKey !== nextKey && isPlainObject(sectionGroup.itemsComposite)) {
          for (const subItem of Object.values(sectionGroup.itemsComposite)) {
            if (subItem && subItem._wmsServiceKey === prevKey) {
              subItem._wmsServiceKey = nextKey;
            }
          }
        }
      }
      if (currentGestorMenu && Array.isArray(currentGestorMenu.layersInfo)) {
        const info = currentGestorMenu.layersInfo.find(
          (li) =>
            li._wmsServiceKey === prevKey ||
            (li.section === next.seccion &&
              normalizeWmsHost(li.host || "") ===
                normalizeWmsHost(next.host || next.url || ""))
        );
        if (info) {
          info.name = next.nombre;
          info.weight = next.peso;
          info.short_abstract = next.short_abstract;
          info._wmsServiceKey = nextKey;
          if (updatedTab) {
            info.tab = updatedTab;
            if (updatedTab.listType === "combobox" && ImpresorGroupWMSSelectorClass) {
              info.itemGroupPrinter = new ImpresorGroupWMSSelectorClass();
            } else if (ImpresorGrupoHTMLClass) {
              info.itemGroupPrinter = new ImpresorGrupoHTMLClass();
            }
          }
        }
      }
      _wmsRegistry.delete(prevKey);
      _wmsRegistry.set(nextKey, { key: nextKey, item: deepClone(next) });
    }

    // 4. Eliminar servicios WMS removidos
    for (const removedEntry of plan.removed) {
      const { prev, prevKey } = removedEntry;
      const sectionStillUsed = (nextSectionCounts.get(prev.seccion) || 0) > 0;
      removeWmsServiceSublayers(prev, prevKey, sectionStillUsed);
    }

    // 5. Aplicar los servicios modificados y agregados cuyos GetCapabilities ya fueron validados
    for (const { task, fetched, error } of fetchResults) {
      if (error) {
        // Registrar advertencia/error sin corromper las estructuras internas ni abortar otras secciones
        warnings.push(
          `No se pudo cargar GetCapabilities para el servicio WMS '${task.next.seccion}' (${task.next.host}): ${error}`
        );
        if (task.kind === "modified" && task.prev) {
          const sectionShared = (nextSectionCounts.get(task.prev.seccion) || 0) > 1;
          removeWmsServiceSublayers(task.prev, task.prevKey, sectionShared);
        }
        continue;
      }

      let previouslyActive = new Map();
      if (task.kind === "modified" && task.prev) {
        const sectionShared = (nextSectionCounts.get(task.prev.seccion) || 0) > 1;
        previouslyActive = removeWmsServiceSublayers(
          task.prev,
          task.prevKey,
          sectionShared
        );
      }

      // Registrar las nuevas subcapas del servicio en gestorMenu y app.layers
      registerWmsServiceInMenu(task.next, task.nextKey, fetched);

      // Si el servicio fue modificado y tenía subcapas activas que siguen existiendo
      // en el nuevo GetCapabilities, restaurar su visibilidad y opacidad
      if (previouslyActive.size > 0) {
        for (const subItem of fetched.subItems) {
          const layerName = subItem.nombre || subItem.capa?.nombre;
          if (layerName && previouslyActive.has(layerName)) {
            const savedState = previouslyActive.get(layerName);
            activateAndRestoreWmsSublayer(subItem, savedState.opacity);
          }
        }
      }
    }

    _appliedWmsItems = deepClone(nextWmsItems);
    appliedSections.push("data.wms");
    return {
      appliedSections,
      warnings,
      errors,
      changed: true,
      stale: false,
    };
  }

  // =========================================================================
  // Orquestación principal de actualización en caliente
  // =========================================================================

  /**
   * Aplica sobre el visor una configuración ya preparada por `ConfigProcessor.prepareConfigUpdate()`.
   *
   * @param {Object} preparedResult - Resultado devuelto por `ConfigProcessor.prepareConfigUpdate()`.
   * @param {Object} [options={}] - Opciones adicionales.
   * @returns {Promise<{
   *   success: boolean,
   *   hasChanges: boolean,
   *   isPartial: boolean,
   *   appliedSections: string[],
   *   warnings: string[],
   *   errors: string[]
   * }>}
   */
  async function applyPreparedUpdate(preparedResult, _options = {}) {
    if (!isPlainObject(preparedResult)) {
      return {
        success: false,
        hasChanges: false,
        isPartial: false,
        appliedSections: [],
        warnings: [],
        errors: ["El resultado preparado debe ser un objeto válido."],
      };
    }

    const isPartial = Boolean(preparedResult.isPartial);

    if (!preparedResult.isValid || !isPlainObject(preparedResult.prepared)) {
      return {
        success: false,
        hasChanges: false,
        isPartial,
        appliedSections: [],
        warnings: Array.isArray(preparedResult.warnings)
          ? [...preparedResult.warnings]
          : [],
        errors:
          Array.isArray(preparedResult.errors) && preparedResult.errors.length > 0
            ? [...preparedResult.errors]
            : ["La configuración preparada no es válida."],
      };
    }

    const generationId = ++_updateGeneration;
    const prevConfig = getCurrentConfig();
    const nextConfig = deepClone(preparedResult.prepared);

    const appliedSections = [];
    const warnings = Array.isArray(preparedResult.warnings)
      ? [...preparedResult.warnings]
      : [];
    const errors = [];

    try {
      // 1. Reconciliar preferencias visuales y funcionales
      const prefResult = reconcilePreferences(
        prevConfig.preferences,
        nextConfig.preferences
      );
      appliedSections.push(...prefResult.appliedSections);
      warnings.push(...prefResult.warnings);

      // 2. Detectar si mapConfig.zoom va a actualizarse en este ciclo
      const prevZoom = prevConfig.preferences?.mapConfig?.zoom || {};
      const nextZoom = nextConfig.preferences?.mapConfig?.zoom || {};
      const mapZoomUpdated =
        nextZoom.initial !== prevZoom.initial ||
        nextZoom.min !== prevZoom.min ||
        nextZoom.max !== prevZoom.max;

      // 3. Reconciliar mapas base
      const basemapResult = reconcileBasemaps(prevConfig.data, nextConfig.data, {
        mapZoomUpdated,
      });
      appliedSections.push(...basemapResult.appliedSections);
      warnings.push(...basemapResult.warnings);

      // 4. Reconciliar mapConfig (centro y niveles de zoom)
      const mapConfigResult = reconcileMapConfig(
        prevConfig.preferences,
        nextConfig.preferences
      );
      appliedSections.push(...mapConfigResult.appliedSections);
      warnings.push(...mapConfigResult.warnings);

      // Persistir inmediatamente el estado declarativo para las secciones síncronas
      _currentConfig = deepClone(nextConfig);

      // 5. Reconciliar servicios y capas WMS (asíncrono con control de generación)
      const wmsResult = await reconcileWmsLayers(
        prevConfig.data,
        nextConfig.data,
        generationId
      );

      // Si durante el await de WMS entró una actualización más reciente, abortar silenciosamente
      // la sobreescritura del estado final y reportar advertencia de actualización desplazada
      if (wmsResult.stale || generationId !== _updateGeneration) {
        warnings.push(
          "Actualización asíncrona desplazada por una configuración más reciente."
        );
        return {
          success: true,
          hasChanges: false,
          isPartial,
          appliedSections,
          warnings,
          errors,
        };
      }

      appliedSections.push(...wmsResult.appliedSections);
      warnings.push(...wmsResult.warnings);
      errors.push(...wmsResult.errors);

      // 6. Sincronizar data.items y data.template en `app`
      const currentApp = getApp();
      if (currentApp && isPlainObject(nextConfig.data)) {
        if (Array.isArray(nextConfig.data.items)) {
          currentApp.items = deepClone(nextConfig.data.items);
          if (! appliedSections.includes("data.items") &&
              (basemapResult.changed || wmsResult.changed || !isDeepEqual(prevConfig.data?.items, nextConfig.data.items))) {
            appliedSections.push("data.items");
          }
        }
        if (
          typeof nextConfig.data.template === "string" &&
          nextConfig.data.template !== prevConfig.data?.template
        ) {
          currentApp.template = nextConfig.data.template;
          appliedSections.push("data.template");
        }
      }

      // 7. Reimprimir el menú de capas si cambiaron servicios WMS o el buscador
      const currentGestorMenu = getGestorMenu();
      if (
        currentGestorMenu &&
        (wmsResult.changed || prefResult.requiresMenuReprint)
      ) {
        if (typeof currentGestorMenu.printMenu === "function") {
          try {
            currentGestorMenu.printMenu();
          } catch (_err) {
            // Ignorar errores de nodos DOM opcionales en entornos de prueba parciales
          }
        }
      }

      // Actualizar contador total de capas activas si la función global está disponible
      const showTotalFn =
        typeof showTotalNumberofLayers === "function"
          ? showTotalNumberofLayers
          : root?.showTotalNumberofLayers;
      if (typeof showTotalFn === "function" && wmsResult.changed) {
        try {
          showTotalFn();
        } catch (_err) {
          // Ignorar en entornos de prueba sin DOM completo
        }
      }

      // 8. Persistir el nuevo estado declarativo vigente
      _currentConfig = deepClone(nextConfig);

      const uniqueAppliedSections = [...new Set(appliedSections)];
      return {
        success: errors.length === 0,
        hasChanges: uniqueAppliedSections.length > 0,
        isPartial,
        appliedSections: uniqueAppliedSections,
        warnings,
        errors,
      };
    } catch (unexpectedError) {
      errors.push(
        unexpectedError instanceof Error
          ? unexpectedError.message
          : String(unexpectedError)
      );
      return {
        success: false,
        hasChanges: false,
        isPartial,
        appliedSections,
        warnings,
        errors,
      };
    }
  }

  /**
   * Punto de entrada principal para validar, preparar (mediante `ConfigProcessor`)
   * y aplicar en caliente una configuración completa o parcial sobre Argenmap.
   *
   * @param {*} incomingPayload - Payload de configuración recibido (`{ data, preferences }` o `{ config, partial }`).
   * @param {Object} [options={}] - Opciones de preparación (`{ partial, adapter }`).
   * @returns {Promise<{
   *   success: boolean,
   *   hasChanges: boolean,
   *   isPartial: boolean,
   *   appliedSections: string[],
   *   warnings: string[],
   *   errors: string[]
   * }>}
   */
  async function applyConfiguration(incomingPayload, options = {}) {
    const processor = getConfigProcessor();
    const baseConfig = getCurrentConfig();
    const preparedResult = processor.prepareConfigUpdate(
      baseConfig,
      incomingPayload,
      options
    );

    if (!preparedResult.isValid) {
      return {
        success: false,
        hasChanges: false,
        isPartial: Boolean(preparedResult.isPartial),
        appliedSections: [],
        warnings: [...(preparedResult.warnings || [])],
        errors: [...(preparedResult.errors || [])],
      };
    }

    return applyPreparedUpdate(preparedResult, options);
  }

  return {
    getCurrentConfig,
    setCurrentConfig,
    extractRuntimeConfig,
    reconcileMapConfig,
    reconcilePreferences,
    reconcileBasemaps,
    reconcileWmsLayers,
    applyPreparedUpdate,
    applyConfiguration,
  };
});
