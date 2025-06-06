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

    if (app.hasOwnProperty("searchbar")) {
      setSearchbar(app.searchbar.isActive);
    }

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
        console.warn(
          "Profiles attribute isn't defined in configuration file.",
        );
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
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.type = type;
    let target = null;
    inBody ? (target = "body") : (target = "head");
    document[target].appendChild(script);
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
          const basemap = this.createBasemapItem(capa, item.seccion + index, layer);

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

  addLayers: function () {
    app.items.forEach((element) => {
      if (element.type !== "basemap") {
        const item = element;
        const tab = new Tab(item.tab);

        // Definir un valor predeterminado para listType si no está definido
        const listType = tab.listType || "default";

        const customizedLayers = item.customize_layers || "";
        const featureInfoFormat = item.feature_info_format || "application/json";

        // Mantener impresorGroupTemp inicializado como ImpresorGrupoHTML
        let impresorGroupTemp = new ImpresorGrupoHTML();

        const profile = app.profiles[app.profile];
        const matchItemProfile = profile.data.length === 0 ? "" : app.profiles[app.profile].data.find(e => e === item.class);

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
              console.warn("El parámetro 'type' no está configurado para la fuente:", item.host);
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
    (this.scriptUrl = scriptUrl), (this.type = type), (this.target = target);
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

/**
 * This reads the configuration from two JSON files (app parameters and data references).
 * These files could be customized, if not the function parses and loads
 * default configuration files which are referenced in constats for such usage.
 */

async function getJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorMsg = `${response.url.split("/").at(-1)} ${response.statusText.toLowerCase()}`
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
  if (typeof preferencesURL === "object" && preferencesURL.hasOwnProperty("title")) {
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
  return preferences;
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
  if (typeof dataURL === "object" && dataURL.hasOwnProperty("items")) {
    data = dataURL;
  } else {
    data = await getJson(dataURL);
  }
  if (typeof data !== "object") {
    data = await getJson("src/config/default/data.json");
  }
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
    const preferences = await getPreferences(preferencesURL);
    const data = await getData(dataURL);
    await loadTemplate({ ...data, ...preferences }, false);
    gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
  } catch (error) {
    console.log(error);
  }
}

getConfig("./src/config/preferences.json", "./src/config/data.json");

async function loadTemplate(data, isDefaultTemplate) {
  $(document).ready(async function () {
    await app.init(data);

    //Template
    template = app.template; // define wich template to use

    let stylesui = new StylesUI();
    stylesui.createstyles();
    //Load template config
    loadTemplateStyleConfig(template, isDefaultTemplate);

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
    if (app.analytics_ids) {
      // Check to fix a bug with ad blockers
      if (typeof addAnalytics === "function") {
        addAnalytics(app.analytics_ids);
      }
    }

    app.addBasemaps();
    app.addLayers();

    //if charts is active in menu.json
    if (loadCharts && !app.dependencies.d3) {
      $.getScript("https://d3js.org/d3.v5.min.js");
      $.getScript("src/js/components/charts/charts.js");
      $("head").append(
        '<link rel="stylesheet" type="text/css" href="src/js/components/charts/charts.css">',
      );
      app.dependencies.d3 = true;
    }

    //if searchbar is active in menu.json
    if (loadSearchbar && !app.dependencies.searchbar) {
      $.getScript("src/js/components/searchbar/searchbar.js").done(function () {
        var searchBar_ui = new Searchbar_UI();
        searchBar_ui.create_sarchbar();
      });
      $("head").append(
        '<link rel="stylesheet" type="text/css" href="src/js/components/searchbar/searchbar.css">',
      );
      app.dependencies.searchbar = true;
    }

    //Load dynamic mapa.js
    app.template_id = template;
    if (!app.dependencies.map) {
      $.getScript(`src/js/map/map.js`, (res) => { });
      app.dependencies.map = true;
    }

    template = "templates/" + template + "/main.html";

    //Wait until global 'mapa' object is available.
    const intervalID = setInterval(() => {
      if (mapa && mapa.hasOwnProperty("_leaflet_id")) {
        window.clearInterval(intervalID);

        if (urlInteraction.areParamsInUrl) {
          mapa.setView(
            L.latLng(
              urlInteraction.center.latitude,
              urlInteraction.center.longitude,
            ),
            urlInteraction.zoom,
          );
        }

        //const zoomLevel = new ZoomLevel(mapa.getZoom());

        urlInteraction.zoom = mapa.getZoom();
        mapa.on("zoom", () => {
          if (Number.isInteger(mapa.getZoom())) {
            urlInteraction.zoom = mapa.getZoom();
            //zoomLevel.zoom = mapa.getZoom();
            if (geoProcessingManager) {
              geoProcessingManager.svgZoomStyle(mapa.getZoom());
            }
          }
        });

        urlInteraction.center = mapa.getCenter();
        mapa.on("moveend", () => {
          urlInteraction.center = mapa.getCenter();
        });

        gestorMenu.loadInitialLayers(urlInteraction);

        // Default values for showToolbar and showLayerMenu
        let showToolbar = true;
        let showLayerMenu = true;

        // Check if app.onInit exists and assign values accordingly
        if (app?.onInit) {
          showToolbar = app.onInit.showToolbar ?? true;
          showLayerMenu = app.onInit.showLayerMenu ?? true;
        }

        if (!app.dependencies.toolbarToggler) {
          // Initialize toolbar visibility toggler and create components
          const toolbarVisibilityToggler = new ToolbarVisibilityToggler();
          toolbarVisibilityToggler.createComponent(showToolbar);
          app.dependencies.toolbarToggler = true;
        }

        //consultar si el navegador es mobile
        const isMobile = window.matchMedia(
          "only screen and (max-width: 760px)",
        ).matches;

        // Show layer menu if showLayerMenu is true
        if (showLayerMenu && !isMobile) {
          document.getElementById("sidebar").style.display = "block";
        }

        if (!app.dependencies.editableLabel) {
          const editableLabel = new EditableLabel();
          editableLabel.addTo(mapa);
          app.dependencies.editableLabel = true;
        }
      }
    }, 100);
  });

  setTimeout(function () {
    //load loginatic
    if (loadLogin) {
      $("head").append(
        '<link rel="stylesheet" type="text/css" href="src/js/components/login/loginatic.css">',
      );
      $.getScript("src/js/components/cookies/cookies.js").done(() => {
        $.getScript("src/js/components/login/loginatic.js").done(function () {
          loginatic = new loginatic();
          loginatic._addLoginWrapper();
          loginatic.init();
          loginatic.check();
        });
      });
    }

    if (mainPopup) {
      $("head").append(
        '<link rel="stylesheet" type="text/css" href="src/js/components/main-popup/mainPopup.css">',
      );
      $.getScript("src/js/components/main-popup/mainPopup.js").done(
        function () {
          mainPopup = new mainPopup();
          mainPopup.check();
          mainPopup._addPopupWrapper();
        },
      );
    }

    //load elevationProfile
    if (loadElevationProfile && !app.dependencies.highcharts) {
      $.getScript("https://code.highcharts.com/highcharts.js").done(() => {
        $.getScript("https://code.highcharts.com/highcharts-more.js");
        $.getScript("https://code.highcharts.com/modules/windbarb.js");
        $.getScript("https://code.highcharts.com/modules/funnel.js");
        $.getScript("https://code.highcharts.com/modules/exporting.js");
        $.getScript("https://code.highcharts.com/modules/timeline.js");
        $.getScript("src/js/plugins/highcharts.theme.js");
      });
      app.dependencies.highcharts = true;

      // TODO: replace script loads by ES modules architecture
      $.getScript("src/js/components/elevation-profile/elevation-profile.js");
    }
  }, 1500);
}

let conaeCheck = setInterval(() => {
  // patch to force conae layers into menu
  let conaeLayers = gestorMenu.items.conae;
  if (conaeLayers) {
    if (Object.entries(gestorMenu.items.conae.itemsComposite).length === 12) {
      gestorMenu.printMenu();
      //document.getElementById("temp-menu").remove();
      clearInterval(conaeCheck);
    }
  }
}, 1000);

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
