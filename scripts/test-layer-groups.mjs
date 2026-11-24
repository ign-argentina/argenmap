import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const readNormalized = (filePath) =>
  fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

const appSource = readNormalized("src/js/app.js");
const entitiesSource = readNormalized("src/js/entities.js");
const functionsSource = readNormalized("src/js/utils/functions/functions.js");
const pwaSource = readNormalized("src/js/components/pwa/pwa.js");
const buildSource = readNormalized("scripts/build.mjs");
const performanceSource = readNormalized("scripts/measure-performance.mjs");
const packageConfiguration = JSON.parse(
  fs.readFileSync("package.json", "utf8"),
);
const indexSource = readNormalized("index.html");
const runtimeModuleSource = readNormalized("src/js/entries/runtime.js");
const dependencyLoaderSource = readNormalized(
  "src/js/utils/dependencies/dependency-loader.js",
);
const apacheConfig = readNormalized("deploy/apache/.htaccess");
const nginxConfig = readNormalized("deploy/nginx/argenmap.conf.example");
const adapterStart = appSource.indexOf("const CURRENT_CONFIG_SCHEMA_VERSION");
const adapterEnd = appSource.indexOf("function normalizeConfigSectionsAndLayers");
assert.ok(adapterStart >= 0 && adapterEnd > adapterStart, "configuration adapter exists");

const context = vm.createContext({ console });
vm.runInContext(
  `${appSource.slice(adapterStart, adapterEnd)}\nglobalThis.adapter = ConfigurationAdapter;`,
  context,
);
const adapter = context.adapter;

const defaultFileLayerIconSource = entitiesSource.match(
  /function getDefaultFileLayerIcon\(layerType\) \{[\s\S]*?\n\}/,
)?.[0];
assert.ok(defaultFileLayerIconSource, "default file-layer icon resolver exists");
vm.runInContext(
  `${defaultFileLayerIconSource}\nglobalThis.getDefaultFileLayerIcon = getDefaultFileLayerIcon;`,
  context,
);
assert.match(
  context.getDefaultFileLayerIcon("file").src,
  /icon_file_vector\.svg$/,
  "file layers use the vector icon by default",
);
assert.match(
  context.getDefaultFileLayerIcon("GeoTIFF").src,
  /icon_file_raster\.svg$/,
  "raster file types use the raster icon by default",
);

assert.match(
  pwaSource,
  /addEventListener\(ARGENMAP_EVENTS\.MAP_READY, registerWhenIdle/,
  "service worker registration waits until the map is ready",
);
assert.match(
  pwaSource,
  /requestIdleCallback\(callback/,
  "service worker registration yields until the browser is idle",
);
assert.match(
  pwaSource,
  /serviceWorkerFallbackDelay/,
  "service worker registration has a fallback when map startup fails",
);
assert.match(
  pwaSource,
  /dataset\.argenmapMapReady === "true"/,
  "a PWA module loaded after map startup registers without the fallback delay",
);
assert.match(
  pwaSource,
  /deferredPrecacheDelay/,
  "auxiliary PWA assets are delayed beyond service worker registration",
);
assert.match(
  pwaSource,
  /type: "CACHE_DEFERRED_ASSETS"/,
  "the application requests deferred precaching explicitly",
);
assert.match(
  pwaSource,
  /observeInstallingWorker\(registration\.installing\);[\s\S]*await registration\.update\(\);[\s\S]*observeInstallingWorker\(registration\.installing\);/,
  "PWA update detection observes workers before and after an explicit check",
);
assert.match(
  pwaSource,
  /showWaitingWorkerNotice\(\);[\s\S]*await registration\.update\(\);[\s\S]*showWaitingWorkerNotice\(\);/,
  "PWA update detection checks waiting workers on both sides of the race",
);
assert.match(
  buildSource,
  /cache\.addAll\(CRITICAL_PRECACHE_URLS\)/,
  "service worker installation only precaches the critical shell",
);
assert.match(
  buildSource,
  /event\.data\.type === "CACHE_DEFERRED_ASSETS"/,
  "the service worker handles deferred precaching separately",
);

const initialScriptsSource = buildSource.match(
  /const initialScripts = \[([\s\S]*?)\n\];/,
)?.[1];
const secondaryScriptsSource = buildSource.match(
  /const secondaryScripts = \[([\s\S]*?)\n\];/,
)?.[1];
assert.ok(initialScriptsSource, "initial build scripts are declared");
assert.ok(secondaryScriptsSource, "secondary build scripts are declared");
assert.match(
  buildSource,
  /name: "runtime",[\s\S]*name: "foundation",[\s\S]*name: "entities",[\s\S]*name: "application"/,
  "the critical JavaScript is split into stable ordered chunks",
);
assert.match(
  indexSource,
  /<script type="module" src="src\/js\/entries\/runtime\.js"><\/script>/,
  "development loads the runtime through an ES module entrypoint",
);
assert.match(
  dependencyLoaderSource,
  /export class AppDependencyLoader[\s\S]*export function onDomReady[\s\S]*export const appDependencies[\s\S]*export function enableNativeInteractions/,
  "the runtime dependencies expose an ES module API",
);
assert.match(
  runtimeModuleSource,
  /import \{[\s\S]*appDependencies[\s\S]*\} from "\.\.\/utils\/dependencies\/dependency-loader\.js";[\s\S]*Object\.assign\(globalThis/,
  "the ES module entrypoint has an explicit compatibility bridge",
);
assert.match(
  buildSource,
  /esbuildBuild\(\{[\s\S]*bundle: true,[\s\S]*format: "esm",[\s\S]*treeShaking: true,[\s\S]*minify: true/,
  "the runtime uses real ES module bundling, tree shaking, and minification",
);
assert.doesNotMatch(
  buildSource,
  /minifyIdentifiers: false/,
  "identifier minification is no longer disabled",
);
assert.match(
  buildSource,
  /javascript: javaScriptChunks/,
  "the build manifest exposes every critical JavaScript chunk",
);
assert.match(
  buildSource,
  /javascriptEntries: javaScriptEntries/,
  "the build manifest identifies module and classic entries",
);
assert.match(
  buildSource,
  /createCompressedAssets\(\[[\s\S]*\.\.\.javaScriptChunks,[\s\S]*cssBundle/,
  "the build precompresses hashed startup assets",
);
for (const [serverName, config] of [
  ["Apache", apacheConfig],
  ["Nginx", nginxConfig],
]) {
  assert.match(config, /immutable/, `${serverName} caches hashed assets immutably`);
  assert.match(config, /no-cache/, `${serverName} revalidates mutable entrypoints`);
}
assert.match(apacheConfig, /BROTLI_COMPRESS/, "Apache enables Brotli when available");
assert.match(nginxConfig, /gzip_static on/, "Nginx serves precompressed gzip assets");
for (const moduleName of ["login", "about", "pwa"]) {
  assert.doesNotMatch(
    initialScriptsSource,
    new RegExp(`/components/${moduleName}/${moduleName}\\.js`),
    `${moduleName} is excluded from the critical bundle`,
  );
  assert.match(
    secondaryScriptsSource,
    new RegExp(`/components/${moduleName}/${moduleName}\\.js`),
    `${moduleName} remains available as a secondary module`,
  );
}
assert.match(
  dependencyLoaderSource,
  /secondaryStartup:[\s\S]*about\/about\.js[\s\S]*pwa\/pwa\.js/,
  "About and PWA are grouped for post-map loading",
);
assert.match(
  appSource,
  /case "login":[\s\S]*loadScript\([\s\S]*login\/login\.js[\s\S]*await login\.load\(\)/,
  "login is loaded only when its profile module is enabled",
);
assert.match(
  appSource,
  /initializeApplicationWhenRuntimeIsReady[\s\S]*globalThis\.appDependencies[\s\S]*ARGENMAP_EVENTS\.RUNTIME_READY/,
  "classic application startup waits for the ES module compatibility bridge",
);
assert.equal(
  packageConfiguration.scripts["measure:performance"],
  "node scripts/measure-performance.mjs",
  "the reproducible performance command is exposed through npm",
);
assert.match(
  performanceSource,
  /Network\.clearBrowserCache[\s\S]*Storage\.clearDataForOrigin/,
  "cold runs clear both the HTTP cache and origin storage",
);
assert.match(
  performanceSource,
  /measureNavigation\(context, "cold"[\s\S]*measureNavigation\(context, "hot"/,
  "each benchmark run measures cold and warm cache scenarios",
);
assert.match(
  performanceSource,
  /PerformanceObserver[\s\S]*type: "longtask"/,
  "long tasks are collected through the browser performance API",
);
assert.match(
  performanceSource,
  /domContentLoadedEventEnd[\s\S]*mapReadyMs[\s\S]*transferredBytes/,
  "the report contains DOM ready, map ready, and transferred-byte metrics",
);
assert.match(
  performanceSource,
  /headers\["Content-Encoding"\] = contentEncoding/,
  "the local measurement server reproduces compressed delivery",
);
assert.match(
  performanceSource,
  /max-age=31536000, immutable/,
  "the local measurement server reproduces immutable caching",
);

const legacy = adapter.adaptData({
  sections: [{ id: "events", nombre: "Eventos", peso: 90 }],
  layers: [{ id: "event-file", type: "file", section: "events", source: { url: "events.geojson" } }],
  items: [{ type: "basemap", seccion: "base", nombre: "Base", capas: [] }],
});
assert.equal(legacy.layerGroups[0].title, "Eventos");
assert.equal(legacy.layerGroups[0].weight, 90);
assert.equal(legacy.items[1].seccion, "events");
assert.equal(legacy.items[1].peso, 90);

const version2 = adapter.adaptData({
  schemaVersion: "2.0.0",
  baseMapGroups: [{ id: "base", title: "Base", layers: [] }],
  layerGroups: [{ id: "events", title: "Events", weight: 90 }],
  dataSources: [{ id: "events-source", type: "file", url: "events.geojson", format: "geojson" }],
  layers: [{ id: "events-layer", sourceId: "events-source", layerGroupId: "events", title: "Events" }],
});
assert.equal(version2.items[1].id, "events-layer");
assert.equal(version2.items[1].source.url, "events.geojson");
assert.equal(version2.items[1].groupWeight, 90);
assert.equal(version2.layers, undefined, "configured layers do not overwrite runtime layers");

const setMenuDOMBody = entitiesSource.match(
  /setMenuDOM\(menuDOM\) \{([\s\S]*?)\n  \}\n\n  getMenuDOM\(\)/,
)?.[1];
assert.ok(setMenuDOMBody, "layer-menu target binding exists");
const bindMenuTarget = new Function(
  "menuDOM",
  `this.menuDOM = menuDOM;${setMenuDOMBody}`,
);
const sidebar = { id: "sidebar" };
const basemapMenu = { id: "basemap-selector" };
const layerGroup = {
  target: null,
  isBaseLayer: () => false,
  setObjDom(target) { this.target = target; },
};
const basemapGroup = {
  target: basemapMenu,
  isBaseLayer: () => true,
  setObjDom(target) { this.target = target; },
};
bindMenuTarget.call(
  {
    items: { layers: layerGroup, basemaps: basemapGroup },
    getItemsGroupDOM: () => sidebar,
  },
  sidebar,
);
assert.equal(layerGroup.target, sidebar, "layer groups bind to the sidebar");
assert.equal(
  basemapGroup.target,
  basemapMenu,
  "basemap groups preserve their dedicated menu target",
);

const removeLayersGroupSource = entitiesSource.match(
  /removeLayersGroup\(groupname\) \{[\s\S]*?\n  \}/,
)?.[0];
assert.ok(removeLayersGroupSource, "dynamic layer-group removal exists");
assert.match(
  removeLayersGroupSource,
  /\bel\.remove\(\)/,
  "removing the last WMS layer removes its group",
);
assert.doesNotMatch(
  removeLayersGroupSource,
  /parentElement\.remove\(\)/,
  "removing the last WMS layer preserves the sidebar",
);

const menuToggleSource = functionsSource.match(
  /const initializeDomState = \(\) => \{[\s\S]*?\n\};\ndocument\.addEventListener\("DOMContentLoaded", initializeDomState\);/,
)?.[0];
assert.ok(menuToggleSource, "main menu toggle initialization exists");
assert.match(
  menuToggleSource,
  /if \(!targetSection\) \{[\s\S]*?return;/,
  "menu buttons tolerate a missing target section",
);

// --- Combobox (<select> + showWMSLayerCombobox) regression checks ---
{
  const tabsExample = JSON.parse(
    fs.readFileSync("src/docs/ejemplos_data_json/tabs.json", "utf8"),
  );
  const adaptedTabs = adapter.adaptData(tabsExample);
  const comboGroupDef = adaptedTabs.layerGroups.find(
    (g) => g.id === "transporte",
  );
  assert.equal(
    comboGroupDef.tab.listType,
    "combobox",
    "ConfigurationAdapter preserves legacy tab.list_type='combobox'",
  );

  const adaptedV2Combo = adapter.adaptData({
    schemaVersion: "2.0.0",
    baseMapGroups: [{ id: "mapasbase", title: "Mapas base", layers: [] }],
    layerGroups: [
      {
        id: "transporte",
        title: "Transporte",
        weight: 50,
        tab: { id: "Datos2", content: "Datos2", list_type: "combobox" },
      },
    ],
    dataSources: [
      {
        id: "wms-transporte",
        type: "wms",
        layerGroupId: "transporte",
        url: "https://wms.ign.gob.ar/geoserver/transporte/wms",
        service: "wms",
        serviceVersion: "1.3.0",
      },
    ],
    layers: [],
  });
  assert.equal(
    adaptedV2Combo.layerGroups[0].tab.listType,
    "combobox",
    "ConfigurationAdapter preserves v2 layerGroup tab.listType='combobox'",
  );
  assert.equal(
    adaptedV2Combo.items[1].tab.listType,
    "combobox",
    "ConfigurationAdapter projects tab.listType='combobox' onto data source item",
  );

  const elementsById = new Map();
  const makeMockEl = (tagName = "div", id = "") => {
    const classes = new Set();
    const attrs = new Map();
    const el = {
      tagName: String(tagName).toUpperCase(),
      id,
      innerHTML: "",
      textContent: "",
      className: "",
      style: {},
      children: [],
      classList: {
        add: (...t) => t.forEach((x) => classes.add(x)),
        remove: (...t) => t.forEach((x) => classes.delete(x)),
        contains: (t) => classes.has(t),
        toggle: (t, force) =>
          force === undefined
            ? classes.has(t)
              ? (classes.delete(t), false)
              : (classes.add(t), true)
            : force
              ? (classes.add(t), true)
              : (classes.delete(t), false),
      },
      setAttribute(name, val) {
        attrs.set(name, String(val));
        if (name === "id") {
          this.id = String(val);
          elementsById.set(this.id, this);
        }
      },
      getAttribute(name) {
        return attrs.get(name) ?? null;
      },
      append(...nodes) {
        nodes.forEach((n) => this.appendChild(n));
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elementsById.set(node.id, node);
        return node;
      },
      removeChild(node) {
        const idx = this.children.indexOf(node);
        if (idx >= 0) this.children.splice(idx, 1);
      },
      insertBefore(node, ref) {
        const idx = this.children.indexOf(ref);
        if (idx >= 0) this.children.splice(idx, 0, node);
        else this.children.unshift(node);
        return node;
      },
      insertAdjacentHTML(_pos, html) {
        this.innerHTML += html;
      },
      addEventListener() {},
      getElementsByClassName() {
        return [];
      },
      remove() {
        if (this.id) elementsById.delete(this.id);
      },
    };
    if (id) elementsById.set(id, el);
    return el;
  };

  const sidebarEl = makeMockEl("div", "sidebar");
  const menuEl = makeMockEl("div", "menu");
  const wmsComboListEl = makeMockEl("div", "wms-combo-list");
  const newWmsComboListEl = makeMockEl("div", "NEW-wms-combo-list");
  sidebarEl.appendChild(menuEl);

  const mockDocument = {
    body: makeMockEl("body", "body"),
    createElement: (tag) => makeMockEl(tag),
    getElementById: (id) => elementsById.get(id) || null,
    querySelector: (sel) =>
      sel.startsWith("#") ? elementsById.get(sel.slice(1)) || null : null,
    querySelectorAll: () => [],
    addEventListener: () => {},
  };

  const fetchUrls = [];
  const sampleWmsXml = `<?xml version="1.0" encoding="UTF-8"?>
    <WMS_Capabilities version="1.3.0">
      <Service><Name>WMS</Name><Title>Transporte</Title><Abstract>Servicios</Abstract></Service>
      <Capability>
        <Layer>
          <Title>Transporte</Title>
          <Layer queryable="1"><Name>rutas</Name><Title>Rutas Nacionales</Title><Abstract>Rutas</Abstract></Layer>
        </Layer>
      </Capability>
    </WMS_Capabilities>`;

  const entitiesContext = vm.createContext({
    console,
    Promise,
    setTimeout,
    clearTimeout,
    URL,
    Node: class {},
    CSS: { escape: (v) => v },
    document: mockDocument,
    window: { addEventListener: () => {} },
    STRINGS: {
      basemap_legend_button_text: "Referencias",
      basemap_min_zoom: "Min ",
      basemap_max_zoom: " Max ",
    },
    _LEGEND_PARAMS: "&transparent=true&scale=1",
    _LEGEND_OPTIONS: "&legend_options=",
    clearSpecialChars: (s) => String(s || "").replace(/[^a-zA-Z0-9_-]/g, ""),
    bindZoomLayer: () => {},
    bindLayerOptions: () => {},
    bindLayerSearchAutocomplete: () => {},
    showTotalNumberofLayers: () => {},
    configuredFileLayerRegistry: [],
    app: {
      items: [],
      layers: {},
      layerNameByDomId: {},
      sectionStyles: {},
      sectionExpanded: {},
      setLayer(l) {
        this.layers[l.capa.nombre] = l;
      },
    },
    mapa: {},
    fetch: async (url) => {
      fetchUrls.push(url);
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        text: async () => sampleWmsXml,
      };
    },
    DOMParser: class {
      parseFromString(xmlStr) {
        const makeNode = (localName, textContent = "", children = []) => ({
          localName,
          nodeName: localName,
          textContent,
          children,
          innerHTML: "",
          attributes: [],
          getAttribute: () => null,
          getAttributeNS: () => null,
          getElementsByTagName: (tag) => {
            const all = [];
            const walk = (n) => {
              for (const c of n.children || []) {
                if (tag === "*" || c.localName.toLowerCase() === tag.toLowerCase()) {
                  all.push(c);
                }
                walk(c);
              }
            };
            walk({ children });
            return all;
          },
        });
        const nameNode = makeNode("Name", "rutas");
        const titleNode = makeNode("Title", "Rutas Nacionales");
        const absNode = makeNode("Abstract", "Rutas");
        const leafLayer = makeNode("Layer", "", [nameNode, titleNode, absNode]);
        const rootLayer = makeNode("Layer", "", [
          makeNode("Title", "Transporte"),
          leafLayer,
        ]);
        const capNode = makeNode("Capability", "", [rootLayer]);
        const svcNode = makeNode("Service", "", [
          makeNode("Name", "WMS"),
          makeNode("Title", "Transporte"),
          makeNode("Abstract", "Servicios"),
        ]);
        const docEl = makeNode("WMS_Capabilities", "", [svcNode, capNode]);
        return {
          documentElement: docEl,
          querySelector: () => null,
          getElementsByTagName: docEl.getElementsByTagName,
        };
      }
    },
  });

  vm.runInContext(
    `${entitiesSource}\nglobalThis.exports = { Tab, ImpresorGrupoHTML, ImpresorGroupWMSSelector, LayerGroupRenderer, LayerGroupFactory, LayerMenuManager, Menu_UI, LayersInfoWMS, LayersInfoWMTS, Item, Capa, ImpresorItemHTML };`,
    entitiesContext,
  );

  const {
    Tab,
    ImpresorGroupWMSSelector,
    LayerGroupRenderer,
    LayerGroupFactory,
    LayerMenuManager,
    Menu_UI,
    LayersInfoWMS,
  } = entitiesContext.exports;

  // 1. LayerGroupFactory chooses renderer based on tab.listType
  const comboGroup = LayerGroupFactory.create(
    {
      id: "transporte",
      title: "Transporte",
      weight: 50,
      tab: { id: "Datos2", content: "Datos2", list_type: "combobox" },
    },
    menuEl,
  );
  assert.ok(
    comboGroup.impresor instanceof ImpresorGroupWMSSelector,
    "LayerGroupFactory selects ImpresorGroupWMSSelector for combobox tabs",
  );

  const accGroup = LayerGroupFactory.create(
    {
      id: "industria",
      title: "Industria",
      weight: 10,
      tab: { id: "Datos1", content: "Datos1" },
    },
    menuEl,
  );
  assert.ok(
    accGroup.impresor instanceof LayerGroupRenderer,
    "LayerGroupFactory selects LayerGroupRenderer for accordion tabs",
  );

  // 2. Simulate app.addLayerGroups() followed by app.addLayers() + multi-tab printMenu()
  const gm = new LayerMenuManager();
  entitiesContext.gestorMenu = gm;
  entitiesContext.menu_ui = new Menu_UI();
  gm.setMenuDOM(menuEl);
  gm.setShowSearcher(true);
  gm.setLazyInitialization(true);

  gm.addTab(comboGroup.getTab());
  gm.registerLayerGroup(comboGroup);
  gm.addTab(accGroup.getTab());
  gm.registerLayerGroup(accGroup);

  const wmsInfo = new LayersInfoWMS(
    "https://wms.ign.gob.ar/geoserver/transporte",
    "wms",
    "1.3.0",
    new Tab({ id: "Datos2", content: "Datos2", list_type: "combobox" }),
    "transporte",
    50,
    "Transporte",
    "Servicios de transporte",
    "application/json",
    "wms",
    null,
    "",
    new ImpresorGroupWMSSelector(),
  );
  gm.addLayersInfo(wmsInfo);
  wmsInfo.generateGroups(gm);
  assert.ok(
    gm.items.transporte.impresor instanceof ImpresorGroupWMSSelector,
    "ensureLayerGroup preserves ImpresorGroupWMSSelector for pre-registered combobox group",
  );

  gm.printMenu();
  assert.match(
    menuEl.innerHTML,
    /<select id="wms-combobox-selector-Datos2" onChange="gestorMenu\.showWMSLayerCombobox\(this\.value\)" class="wms-combobox-selector"><option value="">Seleccione un servicio<\/option><option value='lista-transporte'>Transporte<\/option><\/select><div id="wms-combo-list"><\/div><div id="NEW-wms-combo-list"><\/div>/,
    "multi-tab menu renders <select> with <option value='lista-transporte'> (and no accordion <div> inside <select>)",
  );

  // 3. Single-tab combobox configuration also wraps <option> in <select>
  const singleGm = new LayerMenuManager();
  const singleMenuEl = makeMockEl("div", "single-menu");
  singleGm.setMenuDOM(singleMenuEl);
  singleGm.setShowSearcher(true);
  const singleComboGroup = LayerGroupFactory.create({
    id: "transporte",
    title: "Transporte",
    weight: 50,
    tab: { id: "SoloCombo", content: "SoloCombo", list_type: "combobox" },
  });
  singleGm.addTab(singleComboGroup.getTab());
  singleGm.registerLayerGroup(singleComboGroup);
  singleGm.printMenu();
  assert.match(
    singleMenuEl.innerHTML,
    /<select id="wms-combobox-selector-SoloCombo" onChange="gestorMenu\.showWMSLayerCombobox\(this\.value\)" class="wms-combobox-selector">[\s\S]*<option value='lista-transporte'>Transporte<\/option>[\s\S]*<\/select><div id="wms-combo-list"><\/div><div id="NEW-wms-combo-list"><\/div>/,
    "single-tab combobox menu wraps options in <select> with showWMSLayerCombobox handler",
  );

  // 4. showWMSLayerCombobox triggers get_without_print, populates #NEW-wms-combo-list, handles already-executed services and empty value
  gm.showWMSLayerCombobox("lista-transporte");
  await wmsInfo._loadPromise;
  assert.equal(fetchUrls.length, 1, "showWMSLayerCombobox fetches capabilities once");
  assert.match(
    fetchUrls[0],
    /\?service=WMS&version=1\.3\.0&request=GetCapabilities/,
    "combobox GetCapabilities request uppercases service parameter",
  );
  assert.equal(wmsInfo._executed, true, "get_without_print marks layersInfo._executed");
  assert.ok(
    newWmsComboListEl.children.length > 0 &&
      newWmsComboListEl.children[0].children.some((c) =>
        c.id.startsWith("child-transporte0"),
      ),
    "showWMSLayerCombobox populates #NEW-wms-combo-list with service layers",
  );

  // Re-selecting already-executed service must render from existing group without re-fetching
  newWmsComboListEl.innerHTML = "";
  newWmsComboListEl.children = [];
  gm.showWMSLayerCombobox("lista-transporte");
  assert.equal(fetchUrls.length, 1, "re-selecting executed service does not re-fetch capabilities");
  assert.ok(
    newWmsComboListEl.children.length > 0 &&
      newWmsComboListEl.children[0].children.some((c) =>
        c.id.startsWith("child-transporte0"),
      ),
    "re-selecting executed service renders layers into #NEW-wms-combo-list",
  );

  // Selecting empty option clears #NEW-wms-combo-list without leaving a loading spinner
  gm.showWMSLayerCombobox("");
  assert.equal(
    newWmsComboListEl.innerHTML,
    "",
    "selecting empty combobox option clears #NEW-wms-combo-list",
  );
  console.log("Combobox (<select> + showWMSLayerCombobox) checks passed.");
}

for (const path of ["src/config/default/data.json", "src/config/data.json"].filter(
  (candidate) => fs.existsSync(candidate),
)) {
  const config = JSON.parse(fs.readFileSync(path, "utf8"));
  assert.equal(config.schemaVersion, "2.0.0", `${path} uses schema v2`);
  const groupIds = new Set(config.layerGroups.map((group) => group.id));
  const sourceIds = new Set(config.dataSources.map((source) => source.id));
  config.dataSources
    .filter((source) => source.type !== "file")
    .forEach((source) => assert.ok(groupIds.has(source.layerGroupId)));
  config.layers.forEach((layer) => {
    assert.ok(groupIds.has(layer.layerGroupId));
    assert.ok(sourceIds.has(layer.sourceId));
  });
}

console.log("Layer-group schema and compatibility tests passed.");
