import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Cargar módulos reales del repositorio
const processorSource = fs.readFileSync(
  "src/js/components/messaging/config-processor.js",
  "utf8"
);
const updaterSource = fs.readFileSync(
  "src/js/components/messaging/live-updater.js",
  "utf8"
);
const appSource = fs.readFileSync("src/js/app.js", "utf8");
const adapterStart = appSource.indexOf("const CURRENT_CONFIG_SCHEMA_VERSION");
const adapterEnd = appSource.indexOf("function normalizeConfigSectionsAndLayers");
assert.ok(adapterStart >= 0 && adapterEnd > adapterStart, "ConfigurationAdapter exists in app.js");

/**
 * Crea un entorno simulado (DOM + Leaflet + Argenmap globals) realista para
 * verificar el comportamiento de LiveUpdater sobre la instancia L.Map y estructuras globales.
 */
function createTestHarness(customFetch = null) {
  let nextLeafletId = 1001;

  // Mock DOM elements
  const domElements = new Map();
  function createMockElement(tagName, id = "") {
    const classes = new Set();
    const attrs = new Map();
    const el = {
      tagName: String(tagName).toUpperCase(),
      id,
      title: "",
      href: "",
      src: "",
      alt: "",
      rel: "",
      innerHTML: "",
      textContent: "",
      style: {
        cssText: "",
        width: "",
        height: "",
        display: "",
        top: "",
      },
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
        toggle(token, force) {
          if (force === true) {
            classes.add(token);
            return true;
          }
          if (force === false) {
            classes.delete(token);
            return false;
          }
          if (classes.has(token)) {
            classes.delete(token);
            return false;
          }
          classes.add(token);
          return true;
        },
      },
      setAttribute(name, val) {
        attrs.set(name, String(val));
        if (name === "id") {
          this.id = String(val);
          domElements.set(this.id, this);
        }
        if (name === "title") this.title = String(val);
        if (name === "href") this.href = String(val);
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
  const logoLinkEl = createMockElement("a", "top-left-logo-link");
  const topLeftLogoEl = createMockElement("img", "top-left-logo");
  const topRightLogoEl = createMockElement("img", "top-right-logo");
  const logoTextEl = createMockElement("a", "logoText");
  const basemapSelectorEl = createMockElement("div", "basemap-selector");
  const sidebarEl = createMockElement("div", "sidebar");
  const faviconEl = createMockElement("link", "favicon-link");
  faviconEl.rel = "icon";
  headEl.appendChild(faviconEl);

  const mockDocument = {
    title: "Argenmap Inicial",
    head: headEl,
    body: createMockElement("body", "body"),
    createElement(tag) {
      return createMockElement(tag);
    },
    getElementById(id) {
      return domElements.get(id) || null;
    },
    querySelector(selector) {
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

  // Mock Leaflet L y L.Map
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

  const initialBaseLayer = L.tileLayer(
    "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap/{z}/{x}/{-y}.png",
    {
      attribution: "IGN",
      minZoom: 3,
      maxZoom: 21,
      minNativeZoom: 3,
      maxNativeZoom: 21,
    }
  );

  const mapLayers = new Set([initialBaseLayer]);
  const mapa = {
    _leaflet_id: 42, // ID inmutable de la instancia L.Map
    _center: { lat: -40, lng: -59 },
    _zoom: 4,
    options: {
      minZoom: 3,
      maxZoom: 21,
    },
    _layers: {
      [initialBaseLayer._leaflet_id]: initialBaseLayer,
    },
    _viewHistory: [],
    getCenter() {
      return { ...this._center };
    },
    getZoom() {
      return this._zoom;
    },
    getMinZoom() {
      return this.options.minZoom;
    },
    getMaxZoom() {
      return this.options.maxZoom;
    },
    setView(centerArr, zoomVal) {
      this._center = { lat: Number(centerArr[0]), lng: Number(centerArr[1]) };
      if (zoomVal !== undefined) {
        this._zoom = Number(zoomVal);
      }
      this._viewHistory.push({
        type: "setView",
        center: { ...this._center },
        zoom: this._zoom,
      });
    },
    panTo(centerArr) {
      this._center = { lat: Number(centerArr[0]), lng: Number(centerArr[1]) };
      this._viewHistory.push({
        type: "panTo",
        center: { ...this._center },
        zoom: this._zoom,
      });
    },
    setZoom(zoomVal) {
      this._zoom = Number(zoomVal);
      this._viewHistory.push({
        type: "setZoom",
        center: { ...this._center },
        zoom: this._zoom,
      });
    },
    setMinZoom(minVal) {
      this.options.minZoom = Number(minVal);
    },
    setMaxZoom(maxVal) {
      this.options.maxZoom = Number(maxVal);
    },
    addLayer(layer) {
      if (!layer) return;
      layer._onMap = true;
      mapLayers.add(layer);
      this._layers[layer._leaflet_id] = layer;
    },
    removeLayer(layer) {
      if (!layer) return;
      layer._onMap = false;
      mapLayers.delete(layer);
      delete this._layers[layer._leaflet_id];
    },
    hasLayer(layer) {
      return mapLayers.has(layer);
    },
    activeLayerHasChanged() {},
    resetView() {
      this.setView(
        [app.mapConfig.center.latitude, app.mapConfig.center.longitude],
        app.mapConfig.zoom.initial
      );
    },
  };

  const baseLayers = {
    argenmap: { zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 } },
    argenmap_gris: { zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 } },
  };

  const baseLayersInfo = {
    argenmap: {
      titulo: "Argenmap",
      nombre: "argenmap",
      servicio: "tms",
      version: "1.0.0",
      attribution: "IGN",
      host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap/{z}/{x}/{-y}.png",
      selected: true,
      zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 },
    },
    argenmap_gris: {
      titulo: "Argenmap gris",
      nombre: "argenmap_gris",
      servicio: "tms",
      version: "1.0.0",
      attribution: "IGN",
      host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris/{z}/{x}/{-y}.png",
      selected: false,
      zoom: { min: 3, max: 21, nativeMin: 3, nativeMax: 21 },
    },
  };

  const overlayMaps = {};

  const gestorMenu = {
    items: {
      mapasbase: {
        nombre: "Mapas base",
        seccion: "mapasbase",
        peso: 1,
        itemsComposite: {},
        isBaseLayer: () => true,
        muestraCantidadCapasVisibles: () => {},
        hideAllLayers: () => {},
      },
      limites: {
        nombre: "Limites",
        seccion: "limites",
        peso: 10,
        itemsComposite: {
          limites0: {
            nombre: "ign:provincia",
            seccion: "limites0",
            titulo: "Provincias",
            visible: false,
            capa: {
              nombre: "ign:provincia",
              titulo: "Provincias",
              host: "https://wms.ign.gob.ar/geoserver/limites/wms",
              servicio: "wms",
              version: "1.3.0",
              opacity: 1,
              getHostWMS() {
                return this.host;
              },
            },
            capas: [
              {
                nombre: "ign:provincia",
                titulo: "Provincias",
                host: "https://wms.ign.gob.ar/geoserver/limites/wms",
                servicio: "wms",
                version: "1.3.0",
                opacity: 1,
              },
            ],
            getId: () => "child-limites0",
            getVisible() {
              return this.visible;
            },
          },
          limites1: {
            nombre: "ign:departamento",
            seccion: "limites1",
            titulo: "Departamentos",
            visible: false,
            capa: {
              nombre: "ign:departamento",
              titulo: "Departamentos",
              host: "https://wms.ign.gob.ar/geoserver/limites/wms",
              servicio: "wms",
              version: "1.3.0",
              opacity: 1,
              getHostWMS() {
                return this.host;
              },
            },
            capas: [
              {
                nombre: "ign:departamento",
                titulo: "Departamentos",
                host: "https://wms.ign.gob.ar/geoserver/limites/wms",
                servicio: "wms",
                version: "1.3.0",
                opacity: 1,
              },
            ],
            getId: () => "child-limites1",
            getVisible() {
              return this.visible;
            },
          },
        },
        isBaseLayer: () => false,
        muestraCantidadCapasVisibles: () => {},
        hideAllLayers: () => {},
      },
    },
    layersInfo: [
      {
        section: "limites",
        host: "https://wms.ign.gob.ar/geoserver/limites/wms",
        service: "wms",
        version: "1.3.0",
        name: "Limites",
        weight: 10,
        _executed: true,
      },
    ],
    availableBaseLayers: ["argenmap", "argenmap_gris"],
    availableLayers: ["ign:provincia", "ign:departamento"],
    activeLayers: ["argenmap"],
    lastBaseMapSelected: "argenmap",
    basemapSelected: "child-mapasbase0",
    baseMapDependencies: {},
    showSearcher: true,
    printMenuCount: 0,
    setAvailableBaseLayer(name) {
      if (!this.availableBaseLayers.includes(name)) {
        this.availableBaseLayers.push(name);
      }
    },
    setAvailableLayer(name) {
      if (!this.availableLayers.includes(name)) {
        this.availableLayers.push(name);
      }
    },
    addActiveLayer(name) {
      if (!this.activeLayers.includes(name)) {
        this.activeLayers.push(name);
      }
    },
    removeActiveLayer(name) {
      const idx = this.activeLayers.indexOf(name);
      if (idx >= 0) this.activeLayers.splice(idx, 1);
    },
    setLastBaseMapSelected(name) {
      this.lastBaseMapSelected = name;
    },
    setBasemapSelected(id) {
      this.basemapSelected = id;
    },
    setBaseMapDependencies(capas) {
      capas.forEach((c) => {
        if (c.hasOwnProperty("dependencies")) {
          this.baseMapDependencies[c.nombre] = c.dependencies;
        }
      });
    },
    setShowSearcher(cond) {
      this.showSearcher = Boolean(cond);
    },
    getActiveBasemap() {
      return this.lastBaseMapSelected;
    },
    setLayerOpacity(layerName, val) {
      const numVal = Number(val);
      if (overlayMaps[layerName] && typeof overlayMaps[layerName].setOpacity === "function") {
        overlayMaps[layerName].setOpacity(numVal);
      }
    },
    printMenu() {
      this.printMenuCount++;
    },
  };

  const initialConfig = {
    data: {
      template: "ign-geoportal-basic",
      items: [
        {
          type: "basemap",
          peso: 1,
          nombre: "Mapas base",
          seccion: "mapasbase",
          capas: [
            { ...baseLayersInfo.argenmap },
            { ...baseLayersInfo.argenmap_gris },
          ],
        },
        {
          type: "wmslayer",
          nombre: "Limites",
          seccion: "limites",
          host: "https://wms.ign.gob.ar/geoserver/limites/wms",
          servicio: "wms",
          version: "1.3.0",
          peso: 10,
          short_abstract: "Limites territoriales",
        },
      ],
    },
    preferences: {
      title: "Argenmap Inicial",
      website: "https://www.ign.gob.ar",
      favicon: "src/styles/images/favicon.ico",
      showSearchBar: true,
      mapConfig: {
        center: { latitude: -40, longitude: -59 },
        zoom: { initial: 4, min: 3, max: 21 },
      },
      theme: {
        headerBackground: "#157DB9",
        menuBackground: "#157DB9",
        activeLayer: "#33b560",
      },
      logo: {
        title: "Logo IGN",
        src: "src/config/default/styles/images/logo.svg",
        style: "height: 40px;",
      },
      logoText: {
        content: "IGN Argentina",
        link: "https://www.ign.gob.ar",
        title: "Sitio IGN",
      },
      referencias: {
        show: true,
        icon: "src/styles/images/referencias.png",
        width: 30,
        height: 30,
      },
      onInit: {
        showToolbar: true,
        showLayerMenu: false,
      },
    },
  };

  const app = {
    ...JSON.parse(JSON.stringify(initialConfig.preferences)),
    template: initialConfig.data.template,
    items: JSON.parse(JSON.stringify(initialConfig.data.items)),
    layers: {
      "ign:provincia": {
        ...gestorMenu.items.limites.itemsComposite.limites0,
        childid: "child-limites0",
        type: "wms",
      },
      "ign:departamento": {
        ...gestorMenu.items.limites.itemsComposite.limites1,
        childid: "child-limites1",
        type: "wms",
      },
    },
    layerNameByDomId: {
      "child-limites0": "ign:provincia",
      "child-limites1": "ign:departamento",
    },
  };

  const defaultWmsXml = (layerNames = ["ign:provincia", "ign:departamento"], serviceTitle = "WMS IGN") => `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0">
  <Service>
    <Name>WMS</Name>
    <Title>${serviceTitle}</Title>
    <Abstract>Servicio OGC WMS</Abstract>
    <KeywordList><Keyword>IGN</Keyword></KeywordList>
  </Service>
  <Capability>
    <Layer>
      <Title>${serviceTitle}</Title>
      ${layerNames
        .map(
          (name, idx) => `
      <Layer queryable="1">
        <Name>${name}</Name>
        <Title>Titulo ${name} (${idx + 1})</Title>
        <Abstract>Resumen de ${name}</Abstract>
        <EX_GeographicBoundingBox>
          <westBoundLongitude>-73.5</westBoundLongitude>
          <eastBoundLongitude>-53.6</eastBoundLongitude>
          <southBoundLatitude>-55.0</southBoundLatitude>
          <northBoundLatitude>-21.7</northBoundLatitude>
        </EX_GeographicBoundingBox>
      </Layer>`
        )
        .join("\n")}
    </Layer>
  </Capability>
</WMS_Capabilities>`;

  const fetchCalls = [];
  const defaultFetch = async (url) => {
    fetchCalls.push(url);
    if (customFetch) {
      return customFetch(url, defaultWmsXml);
    }
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      async text() {
        if (url.includes("transporte")) {
          return defaultWmsXml(["ign:rutas_nacionales", "ign:ferrocarril"], "Transporte WMS");
        }
        if (url.includes("hidrografia")) {
          return defaultWmsXml(["ign:cursos_agua", "ign:espejos_agua"], "Hidrografia WMS");
        }
        return defaultWmsXml(["ign:provincia", "ign:departamento", "ign:pais"], "Limites WMS");
      },
    };
  };

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    Promise,
    document: mockDocument,
    L,
    mapa,
    app,
    gestorMenu,
    baseLayers,
    baseLayersInfo,
    overlayMaps,
    currentBaseMap: initialBaseLayer,
    selectedBasemap: { ...baseLayersInfo.argenmap },
    STRINGS: {},
    fetch: defaultFetch,
    loadMapaBaseTpl(tmsUrl, layer, attribution) {
      if (sandbox.currentBaseMap) {
        mapa.removeLayer(sandbox.currentBaseMap);
      }
      const zoom = baseLayers[layer]?.zoom || {};
      sandbox.currentBaseMap = L.tileLayer(tmsUrl, {
        attribution,
        minZoom: zoom.min,
        maxZoom: zoom.max,
        minNativeZoom: zoom.nativeMin,
        maxNativeZoom: zoom.nativeMax,
      });
      sandbox.currentBaseMap.addTo(mapa);
    },
    setBaseLayersInfo(layers) {
      layers.forEach((l) => {
        baseLayersInfo[l.nombre] = l;
      });
    },
    setBaseLayersZoomLevels(layers) {
      layers.forEach((l) => {
        baseLayers[l.nombre] = l.zoom ? { zoom: l.zoom } : {};
      });
    },
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(
    `${appSource.slice(adapterStart, adapterEnd)}\nglobalThis.ConfigurationAdapter = ConfigurationAdapter;`,
    context
  );
  vm.runInContext(processorSource, context);
  vm.runInContext(updaterSource, context);

  context.LiveUpdater.setCurrentConfig(initialConfig);

  return {
    context,
    LiveUpdater: context.LiveUpdater,
    ConfigProcessor: context.ConfigProcessor,
    mapa,
    app,
    gestorMenu,
    baseLayers,
    baseLayersInfo,
    overlayMaps,
    mockDocument,
    fetchCalls,
    initialConfig,
    defaultWmsXml,
    getCurrentBaseMap: () => sandbox.currentBaseMap,
    getSelectedBasemap: () => sandbox.selectedBasemap,
  };
}

console.log("Iniciando bateria de pruebas de TASK-02 para LiveUpdater...\n");

// =========================================================================
// ESCENARIO 1: Actualización de centro y zoom
// =========================================================================
{
  const h = createTestHarness();
  const initialMapId = h.mapa._leaflet_id;

  const res = await h.LiveUpdater.applyConfiguration(
    {
      preferences: {
        mapConfig: {
          center: { latitude: -34.6037, longitude: -58.3816 },
          zoom: { initial: 11 },
        },
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(res.hasChanges, true);
  assert.ok(res.appliedSections.includes("mapConfig.center"));
  assert.ok(res.appliedSections.includes("mapConfig.zoom"));
  assert.deepEqual(h.mapa.getCenter(), { lat: -34.6037, lng: -58.3816 });
  assert.equal(h.mapa.getZoom(), 11);
  assert.equal(h.app.mapConfig.center.latitude, -34.6037);
  assert.equal(h.app.mapConfig.zoom.initial, 11);
  assert.equal(h.mapa._leaflet_id, initialMapId);
  console.log("  [OK] Escenario 1: Actualizacion de centro y zoom");
}

// =========================================================================
// ESCENARIO 2: Actualización de límites de zoom (min y max)
// =========================================================================
{
  const h = createTestHarness();
  // El usuario hizo zoom a 19 interactivamente
  h.mapa.setZoom(19);

  // Actualizar min=5, max=16 sin cambiar zoom.initial (sigue en 4 declarativamente)
  const res = await h.LiveUpdater.applyConfiguration(
    {
      preferences: {
        mapConfig: {
          zoom: { min: 5, max: 16 },
        },
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.ok(res.appliedSections.includes("mapConfig.zoom"));
  assert.equal(h.mapa.getMinZoom(), 5);
  assert.equal(h.mapa.getMaxZoom(), 16);
  // Como el zoom actual (19) excedía el nuevo max (16), debe haberse ajustado a 16 (y no reseteado a initial=4)
  assert.equal(h.mapa.getZoom(), 16);
  console.log("  [OK] Escenario 2: Actualizacion de limites de zoom (min y max)");
}

// =========================================================================
// ESCENARIO 3: Actualización de preferencias visuales
// =========================================================================
{
  const h = createTestHarness();

  const res = await h.LiveUpdater.applyConfiguration(
    {
      preferences: {
        title: "Visor Geográfico Renovado",
        website: "https://mapas.ign.gob.ar",
        favicon: "https://mapas.ign.gob.ar/favicon.png",
        theme: {
          headerBackground: "#112233",
          menuBackground: "#223344",
          activeLayer: "#55aa77",
        },
        logo: {
          title: "Nuevo Logo",
          src: "https://mapas.ign.gob.ar/logo-nuevo.svg",
          style: "height: 48px;",
        },
        logoText: {
          content: "Nuevo Texto Cabecera",
          link: "https://mapas.ign.gob.ar",
          title: "Ir al portal",
        },
        referencias: {
          show: false,
        },
        excluded_plugins: ["minimap"],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(h.mockDocument.title, "Visor Geográfico Renovado");
  assert.equal(h.mockDocument.getElementById("top-left-logo-link").href, "https://mapas.ign.gob.ar");
  assert.equal(h.mockDocument.getElementById("top-left-logo").src, "https://mapas.ign.gob.ar/logo-nuevo.svg");
  assert.equal(h.mockDocument.getElementById("logoText").textContent, "Nuevo Texto Cabecera");
  assert.equal(h.mockDocument.getElementById("top-right-logo").style.display, "none");
  assert.equal(h.app.theme.headerBackground, "#112233");
  // Propiedad de solo inicialización (excluded_plugins) debe emitir advertencia controlada
  assert.ok(res.warnings.some((w) => w.includes("excluded_plugins")));
  console.log("  [OK] Escenario 3: Actualizacion de preferencias visuales y advertencias init-only");
}

// =========================================================================
// ESCENARIO 4: Incorporación de un mapa base (preservando currentBaseMap activo)
// =========================================================================
{
  const h = createTestHarness();
  const originalBaseMapInstance = h.getCurrentBaseMap();

  const updatedBasemapGroup = JSON.parse(JSON.stringify(h.initialConfig.data.items[0]));
  updatedBasemapGroup.capas.push({
    titulo: "Argenmap Oscuro",
    nombre: "argenmap_oscuro",
    servicio: "tms",
    version: "1.0.0",
    attribution: "IGN",
    host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro/{z}/{x}/{-y}.png",
    selected: false,
    zoom: { min: 3, max: 21 },
  });

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [updatedBasemapGroup, h.initialConfig.data.items[1]],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.ok(res.appliedSections.includes("data.basemaps"));
  assert.equal(h.gestorMenu.availableBaseLayers.length, 3);
  assert.ok(h.gestorMenu.availableBaseLayers.includes("argenmap_oscuro"));
  assert.ok(h.baseLayersInfo.argenmap_oscuro);
  // Como el mapa base activo ('argenmap') no cambió, currentBaseMap debe ser exactamente la misma instancia
  assert.equal(h.getCurrentBaseMap(), originalBaseMapInstance);
  assert.ok(
    h.mockDocument.getElementById("basemap-selector").innerHTML.includes("argenmap_oscuro")
  );
  console.log("  [OK] Escenario 4: Incorporacion de un mapa base preservando instancia activa");
}

// =========================================================================
// ESCENARIO 5: Eliminación de un mapa base
// =========================================================================
{
  const h = createTestHarness();
  const onlyOneBasemapGroup = JSON.parse(JSON.stringify(h.initialConfig.data.items[0]));
  onlyOneBasemapGroup.capas = [onlyOneBasemapGroup.capas[0]]; // Eliminar argenmap_gris

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [onlyOneBasemapGroup, h.initialConfig.data.items[1]],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(h.gestorMenu.availableBaseLayers.length, 1);
  assert.equal(h.baseLayersInfo.argenmap_gris, undefined);
  assert.equal(h.baseLayers.argenmap_gris, undefined);
  assert.ok(
    !h.mockDocument.getElementById("basemap-selector").innerHTML.includes("argenmap_gris")
  );
  console.log("  [OK] Escenario 5: Eliminacion de un mapa base y limpieza de referencias");
}

// =========================================================================
// ESCENARIO 6: Modificación de la URL de un mapa base activo
// =========================================================================
{
  const h = createTestHarness();
  const oldBaseMapInstance = h.getCurrentBaseMap();

  const modifiedBasemapGroup = JSON.parse(JSON.stringify(h.initialConfig.data.items[0]));
  modifiedBasemapGroup.capas[0].host =
    "https://nuevo-servidor.ign.gob.ar/tms/1.0.0/argenmap/{z}/{x}/{-y}.png";

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [modifiedBasemapGroup, h.initialConfig.data.items[1]],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  const newBaseMapInstance = h.getCurrentBaseMap();
  assert.notEqual(newBaseMapInstance, oldBaseMapInstance, "La capa de teselas activa debe actualizarse");
  assert.equal(
    newBaseMapInstance._url,
    "https://nuevo-servidor.ign.gob.ar/tms/1.0.0/argenmap/{z}/{x}/{-y}.png"
  );
  assert.equal(h.mapa.hasLayer(oldBaseMapInstance), false);
  assert.equal(h.mapa.hasLayer(newBaseMapInstance), true);
  assert.equal(newBaseMapInstance._broughtToBack, true);
  console.log("  [OK] Escenario 6: Modificacion de la URL del mapa base activo");
}

// =========================================================================
// ESCENARIO 7: Cambio del mapa base seleccionado (selected) y fallback por defecto
// =========================================================================
{
  const h = createTestHarness();
  const switchedGroup = JSON.parse(JSON.stringify(h.initialConfig.data.items[0]));
  switchedGroup.capas[0].selected = false;
  switchedGroup.capas[1].selected = true; // Seleccionar argenmap_gris

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [switchedGroup, h.initialConfig.data.items[1]],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(h.getSelectedBasemap().nombre, "argenmap_gris");
  assert.equal(h.gestorMenu.lastBaseMapSelected, "argenmap_gris");
  assert.ok(h.gestorMenu.activeLayers.includes("argenmap_gris"));
  assert.ok(!h.gestorMenu.activeLayers.includes("argenmap"));
  assert.ok(h.getCurrentBaseMap()._url.includes("mapabase_gris"));

  // Probar fallback cuando ninguno tiene selected: true (debe elegir el primero)
  switchedGroup.capas[0].selected = false;
  switchedGroup.capas[1].selected = false;
  await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [switchedGroup, h.initialConfig.data.items[1]],
      },
    },
    { partial: true }
  );
  assert.equal(h.getSelectedBasemap().nombre, "argenmap");
  console.log("  [OK] Escenario 7: Cambio de mapa base seleccionado y fallback al primero");
}

// =========================================================================
// ESCENARIO 8: Incorporación de un servicio WMS
// =========================================================================
{
  const h = createTestHarness();

  const newWmsService = {
    type: "wmslayer",
    nombre: "Transporte",
    seccion: "transporte",
    host: "https://wms.ign.gob.ar/geoserver/transporte/wms",
    servicio: "wms",
    version: "1.3.0",
    peso: 20,
  };

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [...h.initialConfig.data.items, newWmsService],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.ok(res.appliedSections.includes("data.wms"));
  // El servicio preexistente 'limites' NO debió volver a consultarse por GetCapabilities
  assert.equal(h.fetchCalls.length, 1);
  assert.ok(h.fetchCalls[0].includes("transporte"));
  assert.ok(h.gestorMenu.items.transporte, "La nueva sección 'transporte' debe existir en gestorMenu.items");
  assert.ok(h.app.layers["ign:rutas_nacionales"], "Las subcapas del nuevo servicio deben registrarse en app.layers");
  assert.ok(h.gestorMenu.availableLayers.includes("ign:rutas_nacionales"));
  console.log("  [OK] Escenario 8: Incorporacion de un servicio WMS sin recargar los existentes");
}

// =========================================================================
// ESCENARIO 9: Eliminación de un servicio WMS (con capa activa en el mapa)
// =========================================================================
{
  const h = createTestHarness();
  // Activar una subcapa de 'limites' en el mapa antes de eliminar el servicio
  const activeWmsOverlay = h.context.L.tileLayer.wms(
    "https://wms.ign.gob.ar/geoserver/limites/wms",
    { layers: "ign:provincia", opacity: 0.8 }
  );
  activeWmsOverlay.addTo(h.mapa);
  h.overlayMaps["ign:provincia"] = activeWmsOverlay;
  h.gestorMenu.items.limites.itemsComposite.limites0.visible = true;
  h.gestorMenu.addActiveLayer("ign:provincia");

  // Eliminar el servicio WMS 'limites', dejando solo mapas base
  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0]],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.ok(res.appliedSections.includes("data.wms"));
  assert.equal(h.gestorMenu.items.limites, undefined, "La sección 'limites' debe eliminarse de gestorMenu.items");
  assert.equal(h.overlayMaps["ign:provincia"], undefined, "La capa activa debe eliminarse de overlayMaps");
  assert.equal(h.mapa.hasLayer(activeWmsOverlay), false, "La capa activa debe removerse de la instancia L.Map");
  assert.ok(!h.gestorMenu.activeLayers.includes("ign:provincia"));
  assert.equal(h.app.layers["ign:provincia"], undefined);
  console.log("  [OK] Escenario 9: Eliminacion de servicio WMS y desactivacion limpia en L.Map");
}

// =========================================================================
// ESCENARIO 10 y 12: Modificación de host/version WMS preservando visibilidad y opacidad
// =========================================================================
{
  const h = createTestHarness();

  // Activar 'ign:provincia' con opacidad personalizada 0.65
  const initialOverlay = h.context.L.tileLayer.wms(
    "https://wms.ign.gob.ar/geoserver/limites/wms",
    { layers: "ign:provincia", opacity: 0.65 }
  );
  initialOverlay.addTo(h.mapa);
  h.overlayMaps["ign:provincia"] = initialOverlay;
  h.gestorMenu.items.limites.itemsComposite.limites0.visible = true;
  h.gestorMenu.items.limites.itemsComposite.limites0.capa.opacity = 0.65;
  h.gestorMenu.addActiveLayer("ign:provincia");

  // Modificar host y version del servicio 'limites'
  const modifiedWms = {
    ...h.initialConfig.data.items[1],
    host: "https://wms2.ign.gob.ar/geoserver/limites/wms",
    version: "1.1.1",
  };

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], modifiedWms],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(h.fetchCalls.length, 1);
  assert.ok(h.fetchCalls[0].includes("wms2.ign.gob.ar"));
  assert.ok(h.fetchCalls[0].includes("version=1.1.1"));

  // La instancia anterior fue reemplazada, pero 'ign:provincia' sigue activa y con opacidad 0.65
  assert.equal(h.mapa.hasLayer(initialOverlay), false);
  const restoredOverlay = h.overlayMaps["ign:provincia"];
  assert.ok(restoredOverlay, "La subcapa 'ign:provincia' que sigue existiendo debe restaurarse en overlayMaps");
  assert.equal(h.mapa.hasLayer(restoredOverlay), true);
  assert.equal(restoredOverlay.options.opacity, 0.65, "La opacidad 0.65 debe haberse preservado");
  assert.ok(h.gestorMenu.activeLayers.includes("ign:provincia"));
  console.log("  [OK] Escenarios 10 y 12: Modificacion de host/version WMS preservando visibilidad y opacidad");
}

// =========================================================================
// ESCENARIO 11: Preservación de capas superpuestas independientes
// =========================================================================
{
  const h = createTestHarness();

  // Agregar una capa vectorial dibujada/independiente en el mapa y otra en overlayMaps
  const independentDrawnLayer = h.context.L.tileLayer("geojson://drawn-polygon", {
    isIndependent: true,
  });
  independentDrawnLayer.addTo(h.mapa);
  h.overlayMaps["custom_user_geojson"] = independentDrawnLayer;

  // Ejecutar actualización de WMS y mapas base
  const newWmsService = {
    type: "wmslayer",
    nombre: "Hidrografia",
    seccion: "hidrografia",
    host: "https://wms.ign.gob.ar/geoserver/hidrografia/wms",
    servicio: "wms",
    version: "1.3.0",
    peso: 30,
  };

  const res = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [...h.initialConfig.data.items, newWmsService],
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(
    h.mapa.hasLayer(independentDrawnLayer),
    true,
    "La capa independiente debe permanecer intacta en L.Map"
  );
  assert.equal(h.overlayMaps["custom_user_geojson"], independentDrawnLayer);
  console.log("  [OK] Escenario 11: Preservacion de capas superpuestas independientes");
}

// =========================================================================
// ESCENARIO 13: Actualización parcial sin afectar otras secciones ni navegación manual
// =========================================================================
{
  const h = createTestHarness();

  // Simular que el usuario desplazó y acercó el mapa manualmente
  h.mapa.setView([-31.4, -64.18], 14);
  const viewHistoryCountBefore = h.mapa._viewHistory.length;

  // Enviar actualización parcial que solo cambia el título
  const res = await h.LiveUpdater.applyConfiguration(
    {
      preferences: {
        title: "Solo Cambio de Título",
      },
    },
    { partial: true }
  );

  assert.equal(res.success, true);
  assert.equal(res.isPartial, true);
  assert.deepEqual([...res.appliedSections], ["preferences.title"]);
  // El centro y zoom actual del usuario NO deben haberse reseteado a (-40, -59, zoom 4)
  assert.deepEqual(h.mapa.getCenter(), { lat: -31.4, lng: -64.18 });
  assert.equal(h.mapa.getZoom(), 14);
  assert.equal(h.mapa._viewHistory.length, viewHistoryCountBefore);
  assert.equal(h.fetchCalls.length, 0);
  console.log("  [OK] Escenario 13: Actualizacion parcial preserva navegacion del usuario y otras secciones");
}

// =========================================================================
// ESCENARIO 14: Actualización completa sin recrear el mapa
// =========================================================================
{
  const h = createTestHarness();
  const mapInstanceBefore = h.mapa;
  const leafletIdBefore = h.mapa._leaflet_id;

  const fullNewConfig = {
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
              host: "https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris/{z}/{x}/{-y}.png",
              selected: true,
              zoom: { min: 3, max: 21 },
            },
          ],
        },
        {
          type: "wmslayer",
          nombre: "Hidrografia Nacional",
          seccion: "hidrografia",
          host: "https://wms.ign.gob.ar/geoserver/hidrografia/wms",
          servicio: "wms",
          version: "1.3.0",
          peso: 15,
        },
      ],
    },
    preferences: {
      title: "Configuración Completa Nueva",
      website: "https://hidrografia.ign.gob.ar",
      mapConfig: {
        center: { latitude: -38.0, longitude: -62.0 },
        zoom: { initial: 7, min: 4, max: 19 },
      },
      theme: {
        headerBackground: "#003366",
        menuBackground: "#004488",
      },
    },
  };

  const res = await h.LiveUpdater.applyConfiguration(fullNewConfig, { partial: false });

  assert.equal(res.success, true);
  assert.equal(res.isPartial, false);
  assert.equal(res.hasChanges, true);
  assert.equal(h.mapa, mapInstanceBefore);
  assert.equal(h.mapa._leaflet_id, leafletIdBefore);
  assert.deepEqual(h.mapa.getCenter(), { lat: -38.0, lng: -62.0 });
  assert.equal(h.mapa.getZoom(), 7);
  assert.equal(h.gestorMenu.items.limites, undefined);
  assert.ok(h.gestorMenu.items.hidrografia);
  assert.equal(h.getSelectedBasemap().nombre, "argenmap_gris");
  console.log("  [OK] Escenario 14: Actualizacion completa sin recrear la instancia L.Map");
}

// =========================================================================
// ESCENARIO 15: Manejo de error ante fallo de GetCapabilities (HTTP / Red / XML inválido)
// =========================================================================
{
  const h = createTestHarness(async (url) => {
    if (url.includes("servidor-caido")) {
      return {
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        async text() {
          return "Service Unavailable";
        },
      };
    }
    if (url.includes("xml-corrupto")) {
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        async text() {
          return "<html_no_es_capabilities><parsererror>Error</parsererror>";
        },
      };
    }
    throw new Error("Unexpected URL");
  });

  const brokenServicesPayload = {
    preferences: {
      title: "Título Aplicado Aunque Falle WMS",
    },
    data: {
      items: [
        h.initialConfig.data.items[0],
        h.initialConfig.data.items[1], // 'limites' intacto
        {
          type: "wmslayer",
          nombre: "Servicio Caido",
          seccion: "caido",
          host: "https://servidor-caido.gob.ar/geoserver/wms",
          servicio: "wms",
          version: "1.3.0",
        },
        {
          type: "wmslayer",
          nombre: "XML Corrupto",
          seccion: "corrupto",
          host: "https://xml-corrupto.gob.ar/geoserver/wms",
          servicio: "wms",
          version: "1.3.0",
        },
      ],
    },
  };

  const res = await h.LiveUpdater.applyConfiguration(brokenServicesPayload, {
    partial: true,
  });

  assert.equal(res.success, true, "Otras secciones válidas deben aplicarse sin abortar toda la operación");
  assert.equal(h.mockDocument.title, "Título Aplicado Aunque Falle WMS");
  assert.ok(res.warnings.some((w) => w.includes("503")));
  assert.ok(res.warnings.some((w) => w.includes("Invalid GetCapabilities XML")));
  // No deben haberse creado grupos corruptos en gestorMenu.items
  assert.equal(h.gestorMenu.items.caido, undefined);
  assert.equal(h.gestorMenu.items.corrupto, undefined);
  // La sección 'limites' existente permanece sana
  assert.ok(h.gestorMenu.items.limites);
  console.log("  [OK] Escenario 15: Manejo seguro de errores en GetCapabilities sin corromper estado");
}

// =========================================================================
// ESCENARIO 16: Prevención de sobrescritura por respuestas asíncronas fuera de orden
// =========================================================================
{
  let resolveSlowFetch;
  const h = createTestHarness(async (url, defaultXmlBuilder) => {
    if (url.includes("lento")) {
      return new Promise((resolve) => {
        resolveSlowFetch = () =>
          resolve({
            ok: true,
            status: 200,
            statusText: "OK",
            async text() {
              return defaultXmlBuilder(["ign:capa_obsoleta"], "Servicio Lento Obsoleto");
            },
          });
      });
    }
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      async text() {
        return defaultXmlBuilder(["ign:capa_reciente"], "Servicio Rapido Reciente");
      },
    };
  });

  // Lanzar Actualización 1 (lenta, quedará esperando red)
  const slowPromise = h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [
          h.initialConfig.data.items[0],
          {
            type: "wmslayer",
            nombre: "Lento",
            seccion: "dinamico",
            host: "https://lento.ign.gob.ar/geoserver/wms",
            servicio: "wms",
            version: "1.3.0",
          },
        ],
      },
    },
    { partial: true }
  );

  // Lanzar Actualización 2 (rápida, más reciente) antes de que termine la 1
  const fastResult = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [
          h.initialConfig.data.items[0],
          {
            type: "wmslayer",
            nombre: "Rapido",
            seccion: "dinamico",
            host: "https://rapido.ign.gob.ar/geoserver/wms",
            servicio: "wms",
            version: "1.3.0",
          },
        ],
      },
    },
    { partial: true }
  );

  assert.equal(fastResult.success, true);
  assert.ok(h.app.layers["ign:capa_reciente"], "La capa de la actualización reciente debe estar presente");

  // Ahora se resuelve tardíamente la respuesta de la Actualización 1
  resolveSlowFetch();
  const slowResult = await slowPromise;

  assert.ok(
    slowResult.warnings.some((w) => w.includes("desplazada")),
    "La actualización desplazada debe reportar advertencia de obsolescencia"
  );
  // La respuesta tardía NO debe haber sobreescrito la configuración reciente ni inyectado 'ign:capa_obsoleta'
  assert.equal(h.app.layers["ign:capa_obsoleta"], undefined);
  assert.ok(h.app.layers["ign:capa_reciente"]);
  console.log("  [OK] Escenario 16: Prevencion de sobrescritura por respuestas asincronas tardias");
}

// =========================================================================
// ESCENARIO 17: Verificación estricta de identidad de `mapa` (_leaflet_id) tras múltiples ciclos
// =========================================================================
{
  const h = createTestHarness();
  const originalMapaRef = h.mapa;
  const originalLeafletId = h.mapa._leaflet_id;

  for (let i = 1; i <= 5; i++) {
    const res = await h.LiveUpdater.applyConfiguration(
      {
        preferences: {
          title: `Iteración ${i}`,
          mapConfig: {
            center: { latitude: -30 - i, longitude: -60 - i },
            zoom: { initial: 5 + i },
          },
        },
      },
      { partial: true }
    );
    assert.equal(res.success, true);
    assert.strictEqual(h.mapa, originalMapaRef, `Iteración ${i}: la referencia a 'mapa' debe ser idéntica`);
    assert.strictEqual(
      h.mapa._leaflet_id,
      originalLeafletId,
      `Iteración ${i}: mapa._leaflet_id debe permanecer invariante`
    );
  }
  console.log("  [OK] Escenario 17: Identidad de instancia L.Map (_leaflet_id) 100% invariante tras multiples actualizaciones");
}

// =========================================================================
// ESCENARIOS ADICIONALES (Sección 7 y 3):
// - Cambio de solo metadatos WMS sin pedir GetCapabilities
// - Dos servicios WMS con el mismo host y distintas allowed_layers
// - Rechazo limpio de configuración inválida sin tocar mapa ni app
// =========================================================================
{
  const h = createTestHarness();

  // 1. Cambio de solo metadatos (nombre y peso) en 'limites' -> 0 llamadas a fetch
  const metadataOnlyWms = {
    ...h.initialConfig.data.items[1],
    nombre: "Límites Políticos Renovados",
    peso: 99,
  };
  const resMeta = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], metadataOnlyWms],
      },
    },
    { partial: true }
  );
  assert.equal(resMeta.success, true);
  assert.equal(h.fetchCalls.length, 0, "Cambio de metadatos WMS no debe disparar GetCapabilities");
  assert.equal(h.gestorMenu.items.limites.nombre, "Límites Políticos Renovados");
  assert.equal(h.gestorMenu.items.limites.peso, 99);

  // 2. Dos servicios con el mismo host y distintas allowed_layers
  const wmsSubsetA = {
    type: "wmslayer",
    nombre: "Subconjunto Provincias",
    seccion: "sub_prov",
    host: "https://wms.ign.gob.ar/geoserver/limites/wms",
    servicio: "wms",
    version: "1.3.0",
    allowed_layers: ["ign:provincia"],
  };
  const wmsSubsetB = {
    type: "wmslayer",
    nombre: "Subconjunto Departamentos",
    seccion: "sub_depto",
    host: "https://wms.ign.gob.ar/geoserver/limites/wms",
    servicio: "wms",
    version: "1.3.0",
    allowed_layers: ["ign:departamento"],
  };
  const resSubsets = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], wmsSubsetA, wmsSubsetB],
      },
    },
    { partial: true }
  );
  assert.equal(resSubsets.success, true);
  assert.ok(h.gestorMenu.items.sub_prov);
  assert.ok(h.gestorMenu.items.sub_depto);
  assert.equal(Object.keys(h.gestorMenu.items.sub_prov.itemsComposite).length, 1);
  assert.equal(Object.keys(h.gestorMenu.items.sub_depto.itemsComposite).length, 1);

  // 3. Configuración inválida es rechazada sin mutar el estado del visor
  const centerBeforeInvalid = h.mapa.getCenter();
  const resInvalid = await h.LiveUpdater.applyConfiguration(
    {
      preferences: {
        mapConfig: {
          center: { latitude: 999, longitude: -58 },
        },
      },
    },
    { partial: true }
  );
  assert.equal(resInvalid.success, false);
  assert.equal(resInvalid.hasChanges, false);
  assert.ok(resInvalid.errors.length > 0);
  assert.deepEqual(h.mapa.getCenter(), centerBeforeInvalid);
  console.log("  [OK] Escenarios Adicionales: Metadatos WMS sin fetch, mismo host con distintas allowed_layers y rechazo de configuracion invalida");
}

// =========================================================================
// ESCENARIO COMBOBOX: LiveUpdater conserva ImpresorGroupWMSSelector y Tab combobox
// =========================================================================
{
  const h = createTestHarness();
  class TabMock {
    constructor(tab) {
      this.id = tab?.id || "";
      this.content = tab?.content || "";
      this.listType = tab?.listType || tab?.list_type || "accordion";
    }
    getId() {
      return this.id;
    }
    getExtendedId() {
      return `main-menu-tab-${this.id}`;
    }
  }
  class ImpresorGrupoHTMLMock {
    imprimir(group) {
      return `<div id="${group.getId()}"></div>`;
    }
  }
  class ImpresorGroupWMSSelectorMock {
    imprimir(group) {
      return `<option value='${group.getId()}'>${group.nombre}</option>`;
    }
  }
  class ItemGroupMock {
    constructor(tab, nombre, seccion, peso, palabrasClave, description, resumen) {
      this.tab = tab;
      this.nombre = nombre;
      this.seccion = seccion;
      this.peso = peso;
      this.palabrasClave = palabrasClave;
      this.description = description;
      this.resumen = resumen;
      this.itemsComposite = {};
    }
    getId() {
      return `lista-${this.seccion}`;
    }
    setImpresor(impresor) {
      this.impresor = impresor;
    }
    setObjDom(dom) {
      this.objDOM = dom;
    }
    setItem(item) {
      this.itemsComposite[item.seccion] = item;
    }
    isBaseLayer() {
      return false;
    }
    muestraCantidadCapasVisibles() {}
    hideAllLayers() {}
  }

  h.context.Tab = TabMock;
  h.context.ImpresorGrupoHTML = ImpresorGrupoHTMLMock;
  h.context.ImpresorGroupWMSSelector = ImpresorGroupWMSSelectorMock;
  h.context.ItemGroup = ItemGroupMock;
  h.gestorMenu._tabs = {};
  h.gestorMenu.addTab = function (tab) {
    if (tab.getExtendedId() !== "main-menu-tab-") {
      this._tabs[tab.getId()] = tab;
    }
  };
  h.gestorMenu.getItemsGroupDOM = () => "#menu";
  h.gestorMenu.addItemGroup = function (group) {
    this.items[group.seccion] = group;
  };

  const comboWms = {
    type: "wmslayer",
    nombre: "Transporte",
    seccion: "transporte",
    host: "https://wms.ign.gob.ar/geoserver/transporte/wms",
    servicio: "wms",
    version: "1.3.0",
    peso: 50,
    tab: { id: "Datos2", content: "Datos2", list_type: "combobox" },
  };
  const resAddCombo = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], h.initialConfig.data.items[1], comboWms],
      },
    },
    { partial: true }
  );
  assert.equal(resAddCombo.success, true);
  assert.ok(
    h.gestorMenu.items.transporte.impresor instanceof ImpresorGroupWMSSelectorMock,
    "LiveUpdater asigna ImpresorGroupWMSSelector al registrar un servicio WMS en pestaña combobox"
  );
  assert.equal(h.gestorMenu._tabs.Datos2?.listType, "combobox");

  const accordionMetaUpdate = {
    ...comboWms,
    tab: { id: "Datos2", content: "Datos2", list_type: "accordion" },
  };
  const resSwitchToAcc = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], h.initialConfig.data.items[1], accordionMetaUpdate],
      },
    },
    { partial: true }
  );
  assert.equal(resSwitchToAcc.success, true);
  assert.ok(
    h.gestorMenu.items.transporte.impresor instanceof ImpresorGrupoHTMLMock,
    "LiveUpdater actualiza a ImpresorGrupoHTML al cambiar list_type a accordion"
  );
  assert.equal(h.gestorMenu._tabs.Datos2?.listType, "accordion");

  const resSwitchBackToCombo = await h.LiveUpdater.applyConfiguration(
    {
      data: {
        items: [h.initialConfig.data.items[0], h.initialConfig.data.items[1], comboWms],
      },
    },
    { partial: true }
  );
  assert.equal(resSwitchBackToCombo.success, true);
  assert.ok(
    h.gestorMenu.items.transporte.impresor instanceof ImpresorGroupWMSSelectorMock,
    "LiveUpdater restaura ImpresorGroupWMSSelector al cambiar list_type de vuelta a combobox"
  );
  assert.equal(h.gestorMenu._tabs.Datos2?.listType, "combobox");
  console.log("  [OK] Escenario Combobox: LiveUpdater conserva ImpresorGroupWMSSelector y Tab combobox");
}

console.log("\nTodos los escenarios de TASK-02 pasaron exitosamente!");
