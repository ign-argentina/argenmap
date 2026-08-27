import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const appSource = fs.readFileSync("src/js/app.js", "utf8");
const entitiesSource = fs.readFileSync("src/js/entities.js", "utf8");
const adapterStart = appSource.indexOf("const CURRENT_CONFIG_SCHEMA_VERSION");
const adapterEnd = appSource.indexOf("function normalizeConfigSectionsAndLayers");
assert.ok(adapterStart >= 0 && adapterEnd > adapterStart, "configuration adapter exists");

const context = vm.createContext({ console });
vm.runInContext(
  `${appSource.slice(adapterStart, adapterEnd)}\nglobalThis.adapter = ConfigurationAdapter;`,
  context,
);
const adapter = context.adapter;

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
