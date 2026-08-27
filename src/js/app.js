var baseLayers = {};
var baseLayersInfo = {};
var selectedBasemap = null;
let menu_ui = new Menu_UI();
var geoProcessingManager = null;

const urlInteraction = new URLInteraction();
const geometry = new Geometry();

const app = {
  profile: "default",
  profiles: {},
  layers: {},
  dependencies: {},
  layerNameByDomId: {},
  templates: ["ign-geoportal-basic"],

  init: async function (data) {
    Object.assign(app, data);
    Object.assign(STRINGS, data.strings);

    if (Object.keys(app.profiles).length === 0) {
      app["profiles"] = {
        default: { data: [], modules: [] },
      };
      app["profile"] = "default";
    }

    setBaseLayersInfo(app.items[0].capas);
    setBaseLayersZoomLevels(app.items[0].capas);
    gestorMenu.setBaseMapDependencies(app.items[0].capas);

    //Load table if is active
    if (app.hasOwnProperty("table")) {
      setTableAsPopUp(app.table.isActive);
      setTableFeatureCount(app.table.rowsLimit);
    }

    if (app.hasOwnProperty("charts")) {
      setCharts(app.charts.isActive);
    }

    if (app.table?.isActive) {
      await ensureTableDependencies();
    }

    const geocoderEnabled =
      app?.geocoder?.enabled ??
      app?.geocoder?.isActive ??
      app?.searchbar?.isActive ??
      false;
    setGeocoder(geocoderEnabled);

    if (app.hasOwnProperty("login")) {
      setLogin(app.login.isActive);
    }

    if (app.hasOwnProperty("mainPopup")) {
      setMainPopup(app.mainPopup.isActive);
    }

    if (app.hasOwnProperty("layer_options")) {
      setLayerOptions(app.layer_options.isActive);
    }

    if (app.hasOwnProperty("geoprocessing")) {
      setGeoprocessing(app.geoprocessing.isActive);
      app.geoprocessing.availableProcesses.forEach((availableProcesses) => {
        if (availableProcesses.geoprocess === "elevationProfile") {
          setElevationProfile(true);
        }
      });
    }

    //Temporal
    if (app.hasOwnProperty("addLayer")) {
      setAddLayer(app.addLayer.isActive);
    }
    if (app.hasOwnProperty("queryLayer")) {
      setQueryLayer(app.queryLayer.isActive);
    }
    //Temporal

    if (app.hasOwnProperty("tools")) {
      if (app.tools.hasOwnProperty("addLayer")) {
        setAddLayer(app.tools.addLayer.isActive);
      }
      if (app.tools.hasOwnProperty("queryLayer")) {
        setQueryLayer(app.tools.queryLayer.isActive);
      }
    }

    if (app.hasOwnProperty("configToolMain")) {
      setConfigToolMain(app.configToolMain.isActive);
    }

    await this._startModules();
  },

  _startModules: async function () {
    try {
      for (const module of app.profiles[app.profile].modules) {
        switch (module) {
          case "login":
            await login.load();
            break;
          // Intialize here more modules defined in profile (config JSON)
          default:
            break;
        }
      }
    } catch (error) {
      if (app.profiles == undefined) {
        console.warn("Profiles attribute isn't defined in configuration file.");
      } else {
        console.error(error);
      }
    }
  },

  _loadScript: function (
    scriptUrl,
    type = "application/javascript",
    inBody = true,
  ) {
    return appDependencies.loadScript(scriptUrl, {
      type,
      target: inBody ? "body" : "head",
    });
  },

  loading: function (placement = "") {
    const loading = document.getElementsByClassName("loader-line")[0];
    loading.classList.toggle("visible");
    loading.classList.toggle("hidden");
    if (placement === "top") {
      loading.style.bottom = "";
      loading.style.top = "0";
    }
    if (placement === "bottom") {
      loading.style.top = "";
      loading.style.bottom = "0";
    }
  },

  _save: function (d) {
    let fileName = "config.json",
      e = document.createEvent("MouseEvents"),
      a = document.createElement("a"),
      fileToSave = new Blob([JSON.stringify(d)], {
        type: "application/json",
        name: fileName,
      });

    a.download = fileName;
    a.href = window.URL.createObjectURL(fileToSave);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    a.dispatchEvent(e);
  },

  saveConfig: function () {
    this._save(app);
  },

  addBasemaps: function () {
    app.items
      .filter((element) => element.type === "basemap")
      .forEach((item) => {
        const tab = new Tab(item.tab);
        const groupAux = this.createBaseMapGroup(item, tab);

        item.capas.forEach((layer, index) => {
          gestorMenu.setAvailableBaseLayer(layer.nombre);
          const capa = this.createCapa(layer);
          const basemap = this.createBasemapItem(
            capa,
            item.seccion + index,
            layer,
          );

          this.setBasemapProperties(basemap, layer);
          groupAux.setItem(basemap);
        });

        gestorMenu.addTab(tab);
        gestorMenu.addItemGroup(groupAux);
      });

    selectedBasemap = setBasemapToLoad(
      urlInteraction.layers,
      gestorMenu.availableBaseLayers,
    );
  },

  /**
   * Registers presentation groups independently from their data sources.
   * Registry pattern: every source resolves the same LayerGroup instance by id.
   */
  addLayerGroups: function () {
    (app.layerGroups || []).forEach((definition) => {
      if (!definition?.id || gestorMenu.items[definition.id]) return;
      const group = LayerGroupFactory.create(
        definition,
        gestorMenu.getItemsGroupDOM(),
      );
      gestorMenu.addTab(group.getTab());
      gestorMenu.registerLayerGroup(group);
    });
  },

  /**
   * @function createBaseMapGroup
   * @description Crea un nuevo grupo de capas base.
   * @param {Object} item - El objeto de configuración del mapa base.
   * @param {Tab} tab - La pestaña asociada al mapa base.
   * @returns {ItemGroupBaseMap} - El grupo de capas base creado.
   */
  createBaseMapGroup: function (item, tab) {
    const groupAux = new ItemGroupBaseMap(
      tab,
      item.nombre,
      item.seccion,
      item.peso,
      "",
      "",
      item.short_abstract,
      null,
    );

    // Object for menu DOM elements creation
    const impresorBaseMap = new ImpresorCapasBaseHTML();

    groupAux.setImpresor(impresorBaseMap);
    groupAux.setObjDom("#basemap-selector");
    return groupAux;
  },

  /**
   * @function createCapa
   * @description Crea un objeto `Capa` basado en la configuración del mapa base.
   * @param {Object} layer - La capa del mapa base.
   * @returns {Capa} - La capa creada.
   */
  createCapa: function (layer) {
    return new Capa(
      layer.nombre,
      layer.titulo,
      null,
      layer.host,
      layer.servicio,
      layer.version,
      null,
      layer.key,
      null,
      null,
      null,
      null,
      layer.attribution,
    );
  },

  /**
   * @function createBasemapItem
   * @description Crea un objeto `Item` basado en una capa de mapa base.
   * @param {Capa} capa - El objeto `Capa` correspondiente a la capa del mapa base.
   * @param {string} itemId - El identificador del item en el grupo.
   * @param {Object} layer - La configuración de la capa.
   * @returns {Item} - El objeto `Item` creado para el mapa base.
   */
  createBasemapItem: function (capa, itemId, layer) {
    const basemap = new Item(
      capa.nombre,
      itemId,
      "",
      capa.attribution,
      capa.titulo,
      capa,
      null,
    );
    basemap.setLegendImg(layer.legendImg); // Thumbnail del mapa base
    return basemap;
  },

  /**
   * @function setBasemapProperties
   * @description Establece propiedades adicionales para un mapa base, como la leyenda, peso, y selección.
   * @param {Item} basemap - El objeto `Item` del mapa base.
   * @param {Object} layer - La configuración de la capa de mapa base.
   */
  setBasemapProperties: function (basemap, layer) {
    if (layer.legend) {
      basemap.setLegend(layer.legend);
    } else {
      basemap.setLegend(null);
    }

    if (layer.peso) {
      basemap.setPeso(layer.peso);
    }

    if (layer.selected) {
      gestorMenu.setBasemapSelected(basemap.id);
    }

    // Sets the 'printer', which creates its menu button
    const impresorItemCapaBase = new ImpresorItemCapaBaseHTML();

    basemap.setImpresor(impresorItemCapaBase);
  },

  removeLayers: function () {
    let sidebar = document.getElementById("sidebar");
    sidebar.querySelectorAll("*").forEach((n) => n.remove());
    Object.keys(gestorMenu.items).forEach((key) => {
      if (key != "mapasbase") {
        gestorMenu.items[key].hideAllLayers();
        gestorMenu.items[key].muestraCantidadCapasVisibles();
        delete gestorMenu.items[key];
      }
    });
    gestorMenu.availableLayers = [];
  },

  normalizeConfiguredFileLayer: function (item) {
    if (item.enabled === false) {
      return null;
    }

    const source = item.source || item.file || item.layer || null;
    const type = item.type || source?.type || "";
    if (type !== "file" && type !== "file-layer") {
      return null;
    }

    const url = source?.url || source?.host || source?.path || source?.href || item.host || null;
    if (!url) {
      return null;
    }

    const defaultActive =
      item.isActive ??
      item.activeByDefault ??
      item.active ??
      item.visible ??
      item.defaultVisible ??
      item.defaultActive ??
      false;

    const configuredId = item.id || source?.id || null;
    const fallbackIdParts = [
      item.title || item.titulo || source?.title || item.nombre,
      source?.url || item.host || url,
    ].filter(Boolean);
    const configuredPopupFormat =
      item.popupFormat ??
      item.popup?.format ??
      source?.popupFormat ??
      source?.popup?.format ??
      null;
    const popupFormat =
      typeof configuredPopupFormat === "string"
        ? configuredPopupFormat.trim().toLowerCase()
        : null;

    return {
      id:
        clearSpecialChars(configuredId || fallbackIdParts.join("-")) ||
        "capa-desde-archivo",
      url,
      format: (source?.format || source?.type || item.format || "").toLowerCase(),
      title:
        item.title ||
        item.titulo ||
        source?.title ||
        item.nombre ||
        "Capa desde archivo",
      description:
        item.description ||
        item.descripcion ||
        source?.description ||
        item.short_abstract ||
        "",
      icon: item.icon || item.legendImg || source?.icon || null,
      style: item.style || source?.style || null,
      activeButtonColor:
        item.activeButtonColor ||
        item.style?.activeButtonColor ||
        source?.activeButtonColor ||
        source?.style?.activeButtonColor ||
        null,
      fileName: source?.fileName || source?.name || null,
      allowedOptions: item.allowedOptions || source?.allowedOptions || null,
      editable: Boolean(item.editable ?? source?.editable ?? true),
      zoomOnActivate: Boolean(
        item.zoomOnActivate ?? source?.zoomOnActivate ?? false,
      ),
      queryable: Boolean(item.queryable ?? source?.queryable ?? true),
      queryActive: Boolean(
        (item.queryable ?? source?.queryable ?? true) &&
          (item.queryActive ?? source?.queryActive ?? false),
      ),
      popupFormat: ["table", "text", "html"].includes(popupFormat)
        ? popupFormat
        : null,
      isActive: Boolean(defaultActive),
    };
  },

  getConfiguredLayerDefaultStyle: function (geometryType) {
    const defaults = {
      point: {
        radius: 6,
        color: "#3388ff",
        weight: 2,
        opacity: 1,
        fillColor: "#3388ff",
        fillOpacity: 0.6,
      },
      line: { color: "#3388ff", weight: 3, opacity: 1 },
      polygon: {
        color: "#3388ff",
        weight: 3,
        opacity: 1,
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      },
      marker: {
        iconUrl: "src/styles/images/logo-64x64.webp",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      },
    };
    return { ...(defaults[geometryType] || {}) };
  },

  applyConfiguredLayerStyle: function (geoJSON, style = {}) {
    if (!geoJSON || typeof geoJSON !== "object") {
      return geoJSON;
    }
    style = style || {};

    if (geoJSON.type === "FeatureCollection") {
      geoJSON.features.forEach((feature) => {
        this.applyConfiguredLayerStyle(feature, style || {});
      });
      return geoJSON;
    }

    if (!geoJSON.geometry) return geoJSON;

    if (!geoJSON.properties) {
      geoJSON.properties = {};
    }
    if (!geoJSON._configuredFileProperties) {
      geoJSON._configuredFileProperties = { ...geoJSON.properties };
    }

    const geometryType = String(geoJSON.geometry.type || "").toLowerCase();
    const isPoint = geometryType === "point" || geometryType === "multipoint";
    const isLine = geometryType === "linestring" || geometryType === "multilinestring";
    const isPolygon = geometryType === "polygon" || geometryType === "multipolygon";
    const featureStyle =
      geoJSON.properties.styles &&
      typeof geoJSON.properties.styles === "object" &&
      !Array.isArray(geoJSON.properties.styles)
        ? geoJSON.properties.styles
        : {};
    const hasGeometryStyles = ["point", "line", "polygon", "marker"].some(
      (key) => style && typeof style[key] === "object",
    );
    const { activeButtonColor: _activeButtonColor, ...legacyGeometryStyle } =
      style;
    const legacyStyle = hasGeometryStyles ? {} : legacyGeometryStyle;
    let styleType;

    if (isPoint) {
      const featureType = String(geoJSON.properties.type || "").toLowerCase();
      const renderAsPoint =
        featureType === "circle" ||
        featureType === "circlemarker" ||
        (!featureType && style.point && !style.marker);
      styleType = featureType === "label" ? null : renderAsPoint ? "point" : "marker";
      if (!featureType) {
        geoJSON.properties.type = renderAsPoint ? "circlemarker" : "marker";
      }
    } else if (isLine) {
      styleType = "line";
    } else if (isPolygon) {
      styleType = "polygon";
    }

    const configuredStyle = styleType ? style?.[styleType] || legacyStyle : legacyStyle;
    geoJSON.properties.styles = {
      ...this.getConfiguredLayerDefaultStyle(styleType),
      ...(configuredStyle || {}),
      ...(style?.label && typeof style.label === "object"
        ? { label: { ...style.label } }
        : {}),
      // Styles saved by the application's vector style editor belong to the
      // individual feature and therefore override layer-wide defaults.
      ...featureStyle,
    };
    return geoJSON;
  },

  loadConfiguredFileLayer: async function (item, retryCount = 0) {
    const layerConfig = this.normalizeConfiguredFileLayer(item);
    if (!layerConfig) {
      return;
    }

    const leafletReady = typeof window !== "undefined" && typeof window.L !== "undefined";
    const mapReady = typeof mapa !== "undefined" && typeof mapa.createLayerFromGeoJSON === "function";

    if (!leafletReady || !mapReady) {
      if (retryCount < 20) {
        window.setTimeout(() => {
          this.loadConfiguredFileLayer(item, retryCount + 1);
        }, 250);
        return;
      }

      console.error(
        "Error loading configured file layer",
        "Leaflet o el mapa no están listos aún.",
      );
      return;
    }

    try {
      await appDependencies.load("fileLayer");
      const fileLayer = new FileLayer();
      await fileLayer.handleUrl(
        layerConfig.url,
        layerConfig.fileName || layerConfig.title,
        layerConfig.format || null,
      );

      const geoJSON = fileLayer.getGeoJSON();
      if (!geoJSON) {
        throw new Error("No se pudo generar el GeoJSON desde la configuración.");
      }

      this.applyConfiguredLayerStyle(geoJSON, layerConfig.style);

      // Section identity is resolved independently from layer metadata. In the
      // separated schema `sectionName` comes exclusively from `sections`.
      const layerGroupTitle =
        item.sectionName || item.nombre || item.seccion || "Archivos";
      const layerGroupId =
        item.seccion || clearSpecialChars(item.sectionName || item.nombre || "Archivos");
      const baseLayerId = layerConfig.id || clearSpecialChars(layerConfig.title || fileLayer.getFileName() || "capa-desde-archivo");
      const existingLayerIds = new Set([
        ...addedLayers.map((layer) => layer.id),
        ...configuredFileLayerRegistry.map((entry) => entry.id),
      ]);
      let layerId = baseLayerId;
      let suffix = 2;
      while (existingLayerIds.has(layerId)) {
        layerId = `${baseLayerId}-${suffix}`;
        suffix += 1;
      }
      const shouldBeActiveByDefault = Boolean(layerConfig.isActive);
      const createdLayers = mapa.createLayerFromGeoJSON(geoJSON, layerId);
      const configuredLeafletLayers = Array.isArray(createdLayers)
        ? createdLayers
        : [createdLayers];
      configuredLeafletLayers.forEach((layer) => {
        layer.queryable = layerConfig.queryable;
        layer.activeData = layerConfig.queryActive;
        layer.popupFormat = layerConfig.popupFormat;
        layer._uneditable = !layerConfig.editable;
        layer._styleEditable = layerConfig.editable;
        layer._configuredFileLayerId = layerId;
      });
      addLayerToAllGroups(createdLayers, layerId, shouldBeActiveByDefault);

      addedLayers.push({
        id: layerId,
        layer: geoJSON,
        name: layerConfig.title,
        file_name: fileLayer.getFileName() || layerConfig.fileName || layerConfig.url,
        kb: fileLayer.getFileSize("kb") || 0,
        isActive: shouldBeActiveByDefault,
        type: "file",
        zoomOnActivate: layerConfig.zoomOnActivate,
        queryable: layerConfig.queryable,
        queryActive: layerConfig.queryActive,
        editable: layerConfig.editable,
        popupFormat: layerConfig.popupFormat,
        // store the visible label as section
        section: layerGroupTitle,
      });

      if (shouldBeActiveByDefault && layerConfig.zoomOnActivate) {
        mapa.centerLayer(geoJSON);
      }

      registerFileLayerMenuEntry({
        id: layerId,
        layerGroupId,
        layerGroupTitle,
        groupWeight: item.groupWeight ?? item.weight ?? item.peso ?? 0,
        weight: item.weight ?? item.peso ?? 0,
        layerType: "file",
        textName: layerConfig.title,
        fileName: fileLayer.getFileName() || layerConfig.fileName || layerConfig.url,
        isActive: shouldBeActiveByDefault,
        icon: layerConfig.icon,
        description: layerConfig.description,
        allowedOptions: layerConfig.allowedOptions,
        editable: layerConfig.editable,
        activeButtonColor: layerConfig.activeButtonColor,
        fromConfig: true,
      });
      menu_ui.rebuildConfiguredFileLayers();
      updateNumberofLayers(layerGroupTitle);
      showTotalNumberofLayers();
    } catch (error) {
      console.error("Error loading configured file layer", error);
      new UserMessage(
        error.message || "No se pudo cargar la capa configurada.",
        true,
        "warning",
      );
    }
  },

  addLayers: function () {
    app.items.forEach((element) => {
      if (element.type === "file" || element.type === "file-layer") {
        app.loadConfiguredFileLayer(element);
        return;
      }

      if (element.type !== "basemap") {
        const item = element;
        const tab = new Tab(item.tab);

        // Definir un valor predeterminado para listType si no está definido
        const listType = tab.listType || "default";

        const customizedLayers = item.customize_layers || "";
        const featureInfoFormat =
          item.feature_info_format || "application/json";

        // Mantener impresorGroupTemp inicializado como ImpresorGrupoHTML
        let impresorGroupTemp = new ImpresorGrupoHTML();

        const profile = app.profiles[app.profile];
        const matchItemProfile =
          profile.data.length === 0
            ? ""
            : app.profiles[app.profile].data.find((e) => e === item.class);

        if (matchItemProfile !== undefined) {
          if (!item.tab) {
            item.tab = "";
          }

          if (item.type === "wmslayer" || item.type === "wmslayer_mapserver") {
            item.type = "wms";
          }

          const impresorGroupWMSSelector = new ImpresorGroupWMSSelector();

          switch (item.type) {
            case "wms":
              getGeoserverCounter++;
              if (listType === "combobox") {
                impresorGroupTemp = impresorGroupWMSSelector;
              }
              const wmsLayerInfo = new LayersInfoWMS(
                item.host,
                item.servicio,
                item.version,
                tab,
                item.seccion,
                item.peso,
                item.nombre,
                item.short_abstract,
                featureInfoFormat,
                item.type,
                item.icons,
                customizedLayers,
                impresorGroupTemp,
              );

              if (item.allowed_layers) {
                wmsLayerInfo.setAllowebLayers(item.allowed_layers);
              }
              if (item.customize_layers) {
                wmsLayerInfo.setCustomizedLayers(item.customize_layers);
              }

              gestorMenu.addTab(tab);
              gestorMenu.addLayersInfo(wmsLayerInfo);
              if (item.folders) {
                gestorMenu.addFolders(item.seccion, item.folders);
              }
              break;

            case "wmts":
              getGeoserverCounter++;
              if (listType === "combobox") {
                impresorGroupTemp = impresorGroupWMSSelector;
              }
              const wmtsLayerInfo = new LayersInfoWMTS(
                item.host,
                item.servicio,
                item.version,
                tab,
                item.seccion,
                item.peso,
                item.nombre,
                item.short_abstract,
                featureInfoFormat,
                item.type,
                item.icons,
                customizedLayers,
                impresorGroupTemp,
              );

              if (item.allowed_layers) {
                wmtsLayerInfo.setAllowebLayers(item.allowed_layers);
              }
              if (item.customize_layers) {
                wmtsLayerInfo.setCustomizedLayers(item.customize_layers);
              }

              gestorMenu.addTab(tab);
              gestorMenu.addLayersInfo(wmtsLayerInfo);
              if (item.folders) {
                gestorMenu.addFolders(item.seccion, item.folders);
              }
              break;

            default:
              console.warn(
                "El parámetro 'type' no está configurado para la fuente:",
                item.host,
              );
          }
        }
      }
    });
  },

  changeProfile: function (profile) {
    if (profile != app.profile) {
      if (profile != undefined && app.profiles[profile] != undefined) {
        try {
          app.profile = profile;
          gestorMenu.cleanAllLayers();
          app.removeLayers();
          app.addLayers();
          gestorMenu.printMenu();
          console.info(`Profile changed to ${profile}.`);
        } catch (error) {
          return error;
        }
      } else {
        let message = `Profile '${profile}' missing or not present in profiles property. Available profiles: ${Object.keys(
          app.profiles,
        )}`;
        console.warn(message);
      }
    } else {
      console.info(`Profile ${profile} is already in use.`);
    }
  },

  setLayer: function (layer) {
    this.layers[layer.capa.nombre] = layer;
  },

  getLayers: function () {
    return this.layers;
  },

  getSections: function () {
    return gestorMenu.items;
  },

  getActiveLayers: function () {
    return overlayMaps;
  },

  getBaseMapPane: function () {
    return mapa.getPane("tilePane").firstChild;
  },

  addMenuSection: function (name_section) {
    menu_ui.addSection(name_section);
  },

  addParentSection: function (parent_name, section_name) {
    menu_ui.addParentSection(parent_name, section_name);
  },

  addLayerBtn: function (name_section, name_layer) {
    menu_ui.addLayer(name_section, name_layer);
  },

  showLayer: function (layer_name) {
    gestorMenu.muestraCapa(app.layers[layer_name].childid);
  },

  argenmapDarkMode: function () {
    this.showLayer("argenmap");
    mapa.getPane("tilePane").firstChild.style =
      "filter:  invert(1) brightness(1.5) hue-rotate(180deg);";
    let stylesui = new StylesUI();
    stylesui.createdarktheme();
    let oldstyle = document.getElementById("main-style-ui");
    //oldstyle.innerHTML=""
  },
};

class Module {
  constructor(scriptUrl, type, target) {
    ((this.scriptUrl = scriptUrl), (this.type = type), (this.target = target));
  }
}

let getGeoserverCounter = 0,
  keywordFilter = "dato-basico-y-fundamental",
  template = "",
  templateFeatureInfoFieldException = [],
  gestorMenu = new GestorMenu();

/**
 * Utils functions
 */

function isURL(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

function checkFileType(filePath, extension) {
  // check file extension using regex
}

const CURRENT_CONFIG_SCHEMA_VERSION = "2.0.0";

/**
 * Anti-corruption layer / Adapter pattern.
 *
 * Configuration is canonicalized at the application boundary. The rest of
 * the migration can therefore use English schema-v2 names while unchanged
 * legacy collaborators receive a temporary projection of the same model.
 */
class ConfigurationAdapter {
  static adaptLayerGroup(group) {
    const tab = group.tab && typeof group.tab === "object"
      ? {
          ...group.tab,
          searchable: group.tab.searchable ?? group.tab.searcheable ?? false,
          listType: group.tab.listType ?? group.tab.list_type ?? "accordion",
        }
      : group.tab ?? "";
    return {
      id: group.id || group.seccion,
      title: group.title || group.nombre || group.id || group.seccion,
      weight: Number(group.weight ?? group.peso ?? 0),
      tab,
      description:
        group.description ?? group.shortDescription ?? group.short_abstract ?? "",
      shortDescription:
        group.shortDescription ?? group.short_abstract ?? group.description ?? "",
      expanded: group.expanded === true,
      style: group.style ?? group.section_style ?? null,
      cssClass: group.cssClass ?? group.class ?? "",
    };
  }

  static projectBaseMapGroup(group) {
    const layers = group.layers || group.capas || [];
    return {
      type: "basemap",
      tab: group.tab ?? "",
      seccion: group.id || group.seccion,
      nombre: group.title || group.nombre,
      peso: Number(group.weight ?? group.peso ?? 0),
      short_abstract: group.shortDescription ?? group.short_abstract ?? "",
      class: group.cssClass ?? group.class ?? "",
      capas: layers.map((layer) => ({
        ...layer,
        titulo: layer.title ?? layer.titulo,
        nombre: layer.name ?? layer.nombre,
        servicio: layer.service ?? layer.servicio,
        host: layer.url ?? layer.host,
        peso: Number(layer.weight ?? layer.peso ?? 0),
        legendImg: layer.thumbnail ?? layer.legendImg,
      })),
    };
  }

  static projectDataSource(source, groups, layers) {
    const layer = layers.find((candidate) => candidate.sourceId === source.id);
    const groupId = source.layerGroupId || layer?.layerGroupId;
    const group = groups.find((candidate) => candidate.id === groupId);
    if (!group) {
      console.warn(`Layer group not found for data source '${source.id || source.url}'.`);
      return null;
    }

    const common = {
      ...source,
      ...(layer || {}),
      type: source.type,
      seccion: group.id,
      sectionName: group.title,
      nombre: group.title,
      groupWeight: group.weight,
      weight: layer?.weight ?? 0,
      peso: group.weight,
      tab: group.tab,
      short_abstract: group.shortDescription,
      class: group.cssClass,
      section_style: group.style,
      host: source.url ?? source.host,
      servicio: source.service ?? source.type,
      version: source.serviceVersion ?? source.version,
      feature_info_format: source.featureInfoFormat ?? source.feature_info_format,
      allowed_layers: source.allowedLayers ?? source.allowed_layers,
      customize_layers: source.customizedLayers ?? source.customize_layers,
    };

    if (source.type === "file") {
      common.source = {
        url: source.url,
        format: source.format,
        fileName: source.fileName,
      };
    }
    return common;
  }

  static projectCompositeLayer(compositeLayer) {
    const projectMember = (member) => ({
      seccion: member.layerGroupId ?? member.seccion,
      host: member.sourceUrl ?? member.host,
      layer: member.layerName ?? member.layer,
    });
    return {
      ...projectMember(compositeLayer),
      icon: compositeLayer.icon,
      joins: (compositeLayer.layers || compositeLayer.joins || []).map(projectMember),
    };
  }

  static adaptVersion2(data) {
    const groups = (data.layerGroups || []).map(this.adaptLayerGroup);
    const layers = data.layers || [];
    const { layers: _configuredLayers, ...runtimeData } = data;
    const baseMapGroups = (data.baseMapGroups || []).map(this.projectBaseMapGroup);
    const sourceItems = (data.dataSources || [])
      .map((source) => this.projectDataSource(source, groups, layers))
      .filter(Boolean);

    return {
      ...runtimeData,
      schemaVersion: CURRENT_CONFIG_SCHEMA_VERSION,
      layerGroups: groups,
      items: [...baseMapGroups, ...sourceItems],
      configLayers: layers,
      layers_joins: (data.compositeLayers || []).map(this.projectCompositeLayer),
      template_feature_info_exception:
        data.featureInfoExcludedFields ?? data.template_feature_info_exception,
    };
  }

  static adaptLegacy(data) {
    const legacyGroups = Array.isArray(data.sections)
      ? data.sections
      : (data.items || []).filter((item) => item.type !== "basemap");
    const groups = [
      ...new Map(
        legacyGroups
          .map(this.adaptLayerGroup)
          .filter((group) => group.id)
          .map((group) => [group.id, group]),
      ).values(),
    ];

    if (!Array.isArray(data.sections) || !Array.isArray(data.layers)) {
      return { ...data, layerGroups: groups };
    }

    const normalizedItems = [
      ...(data.items || []).filter((item) => item.type === "basemap"),
      ...data.layers
        .map((source) => {
          const group = groups.find(
            (candidate) => candidate.id === (source.section || source.seccion || source.sectionId),
          );
          if (!group) return null;
          return {
            ...source,
            seccion: group.id,
            sectionName: group.title,
            nombre: group.title,
            groupWeight: group.weight,
            weight: source.weight ?? source.peso ?? 0,
            peso: group.weight,
            tab: group.tab,
            short_abstract: group.shortDescription,
            class: group.cssClass,
            section_style: group.style,
          };
        })
        .filter(Boolean),
    ];
    const { layers: _configuredLayers, ...runtimeData } = data;
    return {
      ...runtimeData,
      layerGroups: groups,
      items: normalizedItems,
      configLayers: data.layers,
    };
  }

  static adaptData(data) {
    if (!data || typeof data !== "object") return data;
    return String(data.schemaVersion || "").startsWith("2.")
      ? this.adaptVersion2(data)
      : this.adaptLegacy(data);
  }

  static adaptPreferences(preferences) {
    if (!preferences || typeof preferences !== "object") return preferences;
    return { ...preferences, schemaVersion: preferences.schemaVersion || "1.0.0" };
  }
}

function normalizeConfigSectionsAndLayers(data) {
  const normalized = ConfigurationAdapter.adaptData(data);
  app.sectionStyles = {};
  app.sectionExpanded = {};
  (normalized.layerGroups || []).forEach((group) => {
    app.sectionStyles[group.id] = group.style;
    app.sectionExpanded[group.id] = group.expanded;
  });
  return normalized;
}

/**
 * This reads the configuration from two JSON files (app parameters and data references).
 * These files could be customized, if not the function parses and loads
 * default configuration files which are referenced in constats for such usage.
 */

async function getJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorMsg = `${response.url.split("/").at(-1)} ${response.statusText.toLowerCase()}`;
      new UserMessage(errorMsg, true, "warning");
      // throw new Error(`Response status: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    return error.message;
  }
}

async function getPreferences(preferencesURL, load = false) {
  /**
   * TODO
   * check file type, URL and JSON syntax
   * throw error message in UI if configuration parsing fails
   * process each object with specialized methods
   */
  let preferences = null;
  if (
    typeof preferencesURL === "object" &&
    preferencesURL.hasOwnProperty("title")
  ) {
    preferences = preferencesURL;
  } else {
    preferences = await getJson(preferencesURL);
  }
  if (typeof preferences !== "object") {
    preferences = await getJson("src/config/default/preferences.json");
  }
  if (load) {
    loadTemplate(preferences);
  }
  return ConfigurationAdapter.adaptPreferences(preferences);
  // loadTemplate(preferences);
}

async function getData(dataURL, load = false) {
  // getData("./src/config/ign.data.json", true);
  /**
   * TODO
   * check file type, URL and JSON syntax
   * throw error message in UI if configuration parsing fails
   * process each object with specialized methods
   */
  let data = null;
  if (typeof dataURL === "object" && dataURL !== null) {
    data = dataURL;
  } else {
    data = await getJson(dataURL);
  }
  if (typeof data !== "object") {
    data = await getJson("src/config/default/data.json");
  }
  data = normalizeConfigSectionsAndLayers(data);
  if (load) {
    loadTemplate(data); // moved into getConfig()
  }
  return data;
}

/**
 * Read preferences and data configuration at application start.
 */
async function getConfig(preferencesURL, dataURL) {
  try {
    const [preferences, data] = await Promise.all([
      getPreferences(preferencesURL),
      getData(dataURL),
    ]);
    await loadTemplate({ ...data, ...preferences }, false);
    gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
  } catch (error) {
    console.log(error);
  }
}

getConfig("./src/config/preferences.json", "./src/config/data.json");

function whenMapIsReady() {
  if (
    typeof mapa !== "undefined" &&
    mapa &&
    mapa.hasOwnProperty("_leaflet_id")
  ) {
    return Promise.resolve(mapa);
  }

  return new Promise((resolve) => {
    window.addEventListener(
      ARGENMAP_EVENTS.MAP_READY,
      (event) => resolve(event.detail.map),
      { once: true },
    );
  });
}

async function loadTemplate(data, isDefaultTemplate) {
  onDomReady(async function () {
    await app.init(data);

    //Template
    template = app.template; // define wich template to use

    let stylesui = new StylesUI();
    stylesui.createstyles();
    //Load template config
    await loadTemplateStyleConfig(app.customStyles);

    delete app["template"]; // delete template item from data

    //templateFeatureInfoFieldException
    if (app.template_feature_info_exception) {
      templateFeatureInfoFieldException = app.template_feature_info_exception; // define not showing fields in feature info popup
      delete app["template_feature_info_exception"]; // delete template item from data
    }

    //Layers Joins (join several layers into one item)
    if (app.layers_joins) {
      gestorMenu.setLayersJoin(app.layers_joins);
      delete app["layers_joins"]; // delete template item from data
    }

    //Folders (generate folders items into main menu to generate logical groups of layers)
    if (app.folders) {
      gestorMenu.setFolders(app.folders);
      delete app["folders"]; // delete folders item from data
    }

    //Add Analytics
    if (app.analytics_ids?.length) {
      // Analytics loads asynchronously and must not block application startup.
      void appDependencies
        .load("analytics")
        .then(() => addAnalytics(app.analytics_ids))
        .catch((error) => console.warn(error));
    }

    app.addBasemaps();
    app.addLayerGroups();
    app.addLayers();

    //if geocoder is active in menu.json
    if (loadGeocoder && !app.dependencies.geocoder) {
      appDependencies
        .loadScript("src/js/components/searchbar/searchbar.js")
        .then(() => {
          var searchBar_ui = new Searchbar_UI();
          if (typeof searchBar_ui.create_sarchbar === "function") {
            searchBar_ui.create_sarchbar();
          } else if (typeof searchBar_ui.create_searchbar === "function") {
            searchBar_ui.create_searchbar();
          } else {
            console.warn("No se encontró método de creación para Searchbar_UI");
          }
        })
        .catch((error) => console.error(error));
      appDependencies
        .loadStyle("src/js/components/searchbar/searchbar.css")
        .catch((error) => console.error(error));
      app.dependencies.geocoder = true;
    }

    //Load dynamic mapa.js
    app.template_id = template;
    const mapReadyPromise = whenMapIsReady();
    if (!app.dependencies.map) {
      try {
        await appDependencies.loadScript("src/js/map/map.js");
        app.dependencies.map = true;
      } catch (error) {
        console.error(error);
        return;
      }
    }

    template = "templates/" + template + "/main.html";

    await mapReadyPromise;

    if (urlInteraction.areParamsInUrl) {
      mapa.setView(
        L.latLng(
          urlInteraction.center.latitude,
          urlInteraction.center.longitude,
        ),
        urlInteraction.zoom,
      );
    }

    urlInteraction.zoom = mapa.getZoom();
    mapa.on("zoom", () => {
      if (Number.isInteger(mapa.getZoom())) {
        urlInteraction.zoom = mapa.getZoom();
        if (geoProcessingManager) {
          geoProcessingManager.svgZoomStyle(mapa.getZoom());
        }
      }
    });

    urlInteraction.center = mapa.getCenter();
    mapa.on("moveend", () => {
      urlInteraction.center = mapa.getCenter();
    });

    if (urlInteraction.markers.length > 0) {
      urlInteraction.markers.forEach((marker) => {
        L.marker([marker.latitude, marker.longitude]).addTo(mapa);
      });
    }
    void gestorMenu
      .loadInitialLayers(urlInteraction)
      .catch((error) => console.error(error));

    let showToolbar = true;
    let showLayerMenu = true;

    if (app?.onInit) {
      showToolbar = app.onInit.showToolbar ?? true;
      showLayerMenu = app.onInit.showLayerMenu ?? true;
    }

    appDependencies
      .load("mapControls")
      .then(() => {
        if (!app.dependencies.toolbarToggler) {
          const toolbarVisibilityToggler = new ToolbarVisibilityToggler();
          toolbarVisibilityToggler.createComponent(showToolbar);
          app.dependencies.toolbarToggler = true;
        }

        if (!app.dependencies.editableLabel) {
          const editableLabel = new EditableLabel();
          editableLabel.addTo(mapa);
          app.dependencies.editableLabel = true;
        }

        normalizeLeafletControlOrder();
      })
      .catch((error) => console.error(error));

    const isMobile = window.matchMedia(
      "only screen and (max-width: 760px)",
    ).matches;

    if (showLayerMenu && !isMobile) {
      document.getElementById("sidebar").style.display = "block";
    }
  });

  setTimeout(async function () {
    //load loginatic
    if (loadLogin) {
      appDependencies
        .loadStyle("src/js/components/login/loginatic.css")
        .catch((error) => console.error(error));
      appDependencies
        .loadScript("src/js/components/cookies/cookies.js")
        .then(() =>
          appDependencies.loadScript("src/js/components/login/loginatic.js"),
        )
        .then(() => {
          loginatic = new loginatic();
          loginatic._addLoginWrapper();
          loginatic.init();
          loginatic.check();
        })
        .catch((error) => console.error(error));
    }

    if (mainPopup) {
      const mainPopupOpensHelpTour = app.mainPopup?.text?.includes(
        "nav-help-btn",
      );
      if (
        mainPopupOpensHelpTour &&
        typeof window.ensureHelpTourFeature === "function"
      ) {
        try {
          await window.ensureHelpTourFeature();
        } catch (error) {
          console.error("Unable to prepare the help tour:", error);
        }
      }
      appDependencies
        .loadStyle("src/js/components/main-popup/mainPopup.css")
        .catch((error) => console.error(error));
      appDependencies
        .loadScript("src/js/components/main-popup/mainPopup.js")
        .then(() => {
          mainPopup = new mainPopup();
          mainPopup.check();
          mainPopup._addPopupWrapper();
        })
        .catch((error) => console.error(error));
    }

  }, 1500);
}

document.addEventListener("contextmenu", (e) => {
  let allowedInputs = ["text", "search", "number"];
  if (
    !e.target.classList.contains("leaflet-container") &&
    !allowedInputs.includes(e.target.type)
  ) {
    e.preventDefault();
  }
  //ui_component.getContextMenu(e.target.classList);
});
