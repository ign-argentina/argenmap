/**
 * @fileoverview Aplicación principal ArgenMap - Manejo de configuración, capas base y funcionalidades principales
 * @author IGN Argentina
 */

// ============================================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN INICIAL
// ============================================================================

/** @type {Object} Capas base disponibles en el mapa */
var baseLayers = {};

/** @type {Object} Información de las capas base */
var baseLayersInfo = {};

/** @type {string|null} Mapa base seleccionado actualmente */
var selectedBasemap = null;

/** @type {Menu_UI} Instancia del componente de interfaz de menú */
let menu_ui = new Menu_UI();

/** @type {Object|null} Gestor de geoprocesamiento */
var geoProcessingManager = null;

/** @type {URLInteraction} Manejo de interacciones con URL */
const urlInteraction = new URLInteraction();

/** @type {Geometry} Utilidades de geometría */
const geometry = new Geometry();

// ============================================================================
// OBJETO PRINCIPAL DE LA APLICACIÓN
// ============================================================================

/**
 * @namespace app
 * @description Objeto principal de la aplicación ArgenMap que maneja la inicialización,
 * configuración y gestión de capas, perfiles y funcionalidades del visor de mapas.
 */
const app = {
  /** @type {string} Perfil activo de la aplicación */
  profile: "default",

  /** @type {Object} Perfiles disponibles de configuración */
  profiles: {},

  /** @type {Object} Capas disponibles en la aplicación */
  layers: {},

  /** @type {Object} Dependencias cargadas dinámicamente */
  dependencies: {},

  /** @type {Object} Mapeo de nombres de capas por ID de DOM */
  layerNameByDomId: {},

  /** @type {string[]} Plantillas disponibles */
  templates: ["ign-geoportal-basic"],

  /**
   * @method init
   * @description Inicializa la aplicación con los datos de configuración proporcionados
   * @param {Object} data - Datos de configuración de la aplicación
   * @param {Object} data.profiles - Perfiles de configuración disponibles
   * @param {Object} data.strings - Cadenas de texto para internacionalización
   * @param {Array} data.items - Items/capas a cargar en la aplicación
   * @returns {Promise<void>}
   */
  init: async function (data) {
    // Fusionar datos de configuración con el objeto app
    Object.assign(app, data);
    Object.assign(STRINGS, data.strings);

    // Configurar perfil por defecto si no existe
    if (Object.keys(app.profiles).length === 0) {
      app.profiles = {
        default: { data: [], modules: [] },
      };
      app.profile = "default";
    }

    // Configurar información de capas base
    this._initializeBaseLayers();

    // Configurar funcionalidades opcionales
    this._initializeOptionalFeatures();

    // Iniciar módulos definidos en el perfil
    await this._startModules();
  },

  /**
   * @method _initializeBaseLayers
   * @description Inicializa la información y configuración de las capas base
   * @private
   */
  _initializeBaseLayers: function () {
    if (app.items && app.items[0] && app.items[0].capas) {
      setBaseLayersInfo(app.items[0].capas);
      setBaseLayersZoomLevels(app.items[0].capas);
      gestorMenu.setBaseMapDependencies(app.items[0].capas);
    }
  },

  /**
   * @method _initializeOptionalFeatures
   * @description Inicializa las funcionalidades opcionales basadas en la configuración
   * @private
   */
  _initializeOptionalFeatures: function () {
    // Configurar tabla si está activa
    if (app.hasOwnProperty("table")) {
      setTableAsPopUp(app.table.isActive);
      setTableFeatureCount(app.table.rowsLimit);
    }

    // Configurar funcionalidades del menú
    const features = ["charts", "searchbar", "login", "mainPopup", "layer_options"];
    features.forEach(feature => {
      if (app.hasOwnProperty(feature)) {
        const setterName = `set${feature.charAt(0).toUpperCase() + feature.slice(1)}`;
        if (typeof window[setterName] === "function") {
          window[setterName](app[feature].isActive);
        }
      }
    });

    // Configurar geoprocesamiento
    if (app.hasOwnProperty("geoprocessing")) {
      setGeoprocessing(app.geoprocessing.isActive);
      app.geoprocessing.availableProcesses.forEach((process) => {
        if (process.geoprocess === "elevationProfile") {
          setElevationProfile(true);
        }
      });
    }

    // Configurar herramientas (manteniendo compatibilidad con configuración antigua)
    this._initializeTools();

    // Configurar herramienta de configuración principal
    if (app.hasOwnProperty("configToolMain")) {
      setConfigToolMain(app.configToolMain.isActive);
    }
  },

  /**
   * @method _initializeTools
   * @description Inicializa las herramientas de la aplicación
   * @private
   */
  _initializeTools: function () {
    // Configuración temporal (mantener para compatibilidad)
    if (app.hasOwnProperty("addLayer")) {
      setAddLayer(app.addLayer.isActive);
    }
    if (app.hasOwnProperty("queryLayer")) {
      setQueryLayer(app.queryLayer.isActive);
    }

    // Configuración nueva bajo el objeto tools
    if (app.hasOwnProperty("tools")) {
      if (app.tools.hasOwnProperty("addLayer")) {
        setAddLayer(app.tools.addLayer.isActive);
      }
      if (app.tools.hasOwnProperty("queryLayer")) {
        setQueryLayer(app.tools.queryLayer.isActive);
      }
    }
  },

  /**
   * @method _startModules
   * @description Inicia los módulos definidos en el perfil activo
   * @returns {Promise<void>}
   * @private
   */
  _startModules: async function () {
    try {
      for (const module of app.profiles[app.profile].modules) {
        switch (module) {
          case "login":
            await login.load();
            break;
          // Inicializar aquí más módulos definidos en el perfil (JSON de configuración)
          default:
            break;
        }
      }
    } catch (error) {
      if (app.profiles == undefined) {
        console.warn(
          "El atributo 'profiles' no está definido en el archivo de configuración.",
        );
      } else {
        console.error(error);
      }
    }
  },

  /**
   * @method _loadScript
   * @description Carga dinámicamente un script en el documento
   * @param {string} scriptUrl - URL del script a cargar
   * @param {string} [type="application/javascript"] - Tipo MIME del script
   * @param {boolean} [inBody=true] - Si true, agrega el script al body; si false, al head
   * @private
   */
  _loadScript: function (
    scriptUrl,
    type = "application/javascript",
    inBody = true,
  ) {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.type = type;

    const target = inBody ? document.body : document.head;
    target.appendChild(script);
  },

  /**
   * @method loading
   * @description Controla la visibilidad del indicador de carga
   * @param {string} [placement=""] - Posición del indicador ("top", "bottom", o vacío para posición por defecto)
   */
  loading: function (placement = "") {
    const loading = document.getElementsByClassName("loader-line")[0];
    if (!loading) {
      console.warn("Elemento loader-line no encontrado");
      return;
    }

    loading.classList.toggle("visible");
    loading.classList.toggle("hidden");

    // Configurar posición del indicador de carga
    if (placement === "top") {
      loading.style.bottom = "";
      loading.style.top = "0";
    } else if (placement === "bottom") {
      loading.style.top = "";
      loading.style.bottom = "0";
    }
  },

  /**
   * @method _save
   * @description Guarda datos como archivo JSON descargable
   * @param {Object} data - Datos a guardar en formato JSON
   * @param {string} [fileName="config.json"] - Nombre del archivo a descargar
   * @private
   */
  _save: function (data, fileName = "config.json") {
    try {
      const fileToSave = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
        name: fileName,
      });

      const anchor = document.createElement("a");
      anchor.download = fileName;
      anchor.href = window.URL.createObjectURL(fileToSave);
      anchor.dataset.downloadurl = ["text/json", anchor.download, anchor.href].join(":");

      // Crear y disparar evento de click para descargar
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0,
        false, false, false, false, 0, null
      );

      anchor.dispatchEvent(clickEvent);

      // Limpiar URL del objeto creado
      setTimeout(() => window.URL.revokeObjectURL(anchor.href), 100);

    } catch (error) {
      console.error("Error al guardar el archivo:", error);
    }
  },

  /**
   * @method saveConfig
   * @description Guarda la configuración actual de la aplicación como archivo JSON
   */
  saveConfig: function () {
    this._save(app, "argenmap-config.json");
  },

  /**
   * @method addBasemaps
   * @description Agrega los mapas base configurados al gestor de menú
   */
  addBasemaps: function () {
    const basemapItems = app.items.filter(element => element.type === "basemap");

    basemapItems.forEach(item => {
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

    // Establecer el mapa base a cargar basado en parámetros URL
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

  /**
   * @method removeLayers
   * @description Elimina todas las capas excepto los mapas base del gestor de menú
   */
  removeLayers: function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      // Limpiar contenido del sidebar
      sidebar.querySelectorAll("*").forEach(node => node.remove());
    }

    // Remover todas las capas excepto mapas base
    Object.keys(gestorMenu.items).forEach(key => {
      if (key !== "mapasbase") {
        const item = gestorMenu.items[key];
        if (item && typeof item.hideAllLayers === "function") {
          item.hideAllLayers();
        }
        if (item && typeof item.muestraCantidadCapasVisibles === "function") {
          item.muestraCantidadCapasVisibles();
        }
        delete gestorMenu.items[key];
      }
    });

    // Limpiar lista de capas disponibles
    gestorMenu.availableLayers = [];
  },

  /**
   * @method addLayers
   * @description Agrega las capas configuradas (WMS, WMTS) al gestor de menú
   */
  addLayers: function () {
    const layerItems = app.items.filter(element => element.type !== "basemap");

    layerItems.forEach(item => {
      const tab = new Tab(item.tab);
      const listType = tab.listType || "default";
      const customizedLayers = item.customize_layers || "";
      const featureInfoFormat = item.feature_info_format || "application/json";

      // Configurar impresor por defecto
      let impresorGroupTemp = new ImpresorGrupoHTML();
      const impresorGroupWMSSelector = new ImpresorGroupWMSSelector();

      const profile = app.profiles[app.profile];
      const matchItemProfile = profile.data.length === 0 ?
        "" : profile.data.find(e => e === item.class);

      if (matchItemProfile !== undefined) {
        this._processLayerItem(item, tab, listType, customizedLayers,
          featureInfoFormat, impresorGroupTemp, impresorGroupWMSSelector);
      }
    });
  },

  /**
   * @method _processLayerItem
   * @description Procesa un item de capa individual según su tipo
   * @param {Object} item - Configuración del item
   * @param {Tab} tab - Pestaña asociada
   * @param {string} listType - Tipo de lista para renderizado
   * @param {string} customizedLayers - Capas personalizadas
   * @param {string} featureInfoFormat - Formato de información de características
   * @param {Object} impresorGroupTemp - Impresor temporal
   * @param {Object} impresorGroupWMSSelector - Impresor para selector WMS
   * @private
   */
  _processLayerItem: function (item, tab, listType, customizedLayers,
    featureInfoFormat, impresorGroupTemp, impresorGroupWMSSelector) {

    if (!item.tab) {
      item.tab = "";
    }

    // Normalizar tipos de capa
    if (item.type === "wmslayer" || item.type === "wmslayer_mapserver") {
      item.type = "wms";
    }

    if (listType === "combobox") {
      impresorGroupTemp = impresorGroupWMSSelector;
    }

    switch (item.type) {
      case "wms":
        this._addWMSLayer(item, tab, featureInfoFormat, customizedLayers, impresorGroupTemp);
        break;
      case "wmts":
        this._addWMTSLayer(item, tab, featureInfoFormat, customizedLayers, impresorGroupTemp);
        break;
      default:
        console.warn("El parámetro 'type' no está configurado para la fuente:", item.host);
    }
  },

  /**
   * @method _addWMSLayer
   * @description Agrega una capa WMS al gestor de menú
   * @param {Object} item - Configuración de la capa
   * @param {Tab} tab - Pestaña asociada
   * @param {string} featureInfoFormat - Formato de información
   * @param {string} customizedLayers - Capas personalizadas
   * @param {Object} impresorGroupTemp - Impresor para renderizado
   * @private
   */
  _addWMSLayer: function (item, tab, featureInfoFormat, customizedLayers, impresorGroupTemp) {
    getGeoserverCounter++;

    const wmsLayerInfo = new LayersInfoWMS(
      item.host, item.servicio, item.version, tab, item.seccion,
      item.peso, item.nombre, item.short_abstract, featureInfoFormat,
      item.type, item.icons, customizedLayers, impresorGroupTemp
    );

    this._configureLayerInfo(wmsLayerInfo, item);
    gestorMenu.addTab(tab);
    gestorMenu.addLayersInfo(wmsLayerInfo);

    if (item.folders) {
      gestorMenu.addFolders(item.seccion, item.folders);
    }
  },

  /**
   * @method _addWMTSLayer
   * @description Agrega una capa WMTS al gestor de menú
   * @param {Object} item - Configuración de la capa
   * @param {Tab} tab - Pestaña asociada
   * @param {string} featureInfoFormat - Formato de información
   * @param {string} customizedLayers - Capas personalizadas
   * @param {Object} impresorGroupTemp - Impresor para renderizado
   * @private
   */
  _addWMTSLayer: function (item, tab, featureInfoFormat, customizedLayers, impresorGroupTemp) {
    getGeoserverCounter++;

    const wmtsLayerInfo = new LayersInfoWMTS(
      item.host, item.servicio, item.version, tab, item.seccion,
      item.peso, item.nombre, item.short_abstract, featureInfoFormat,
      item.type, item.icons, customizedLayers, impresorGroupTemp
    );

    this._configureLayerInfo(wmtsLayerInfo, item);
    gestorMenu.addTab(tab);
    gestorMenu.addLayersInfo(wmtsLayerInfo);

    if (item.folders) {
      gestorMenu.addFolders(item.seccion, item.folders);
    }
  },

  /**
   * @method _configureLayerInfo
   * @description Configura las capas permitidas y personalizadas para un LayerInfo
   * @param {Object} layerInfo - Información de la capa a configurar
   * @param {Object} item - Configuración del item
   * @private
   */
  _configureLayerInfo: function (layerInfo, item) {
    if (item.allowed_layers) {
      layerInfo.setAllowebLayers(item.allowed_layers);
    }
    if (item.customize_layers) {
      layerInfo.setCustomizedLayers(item.customize_layers);
    }
  },

  /**
   * @method changeProfile
   * @description Cambia el perfil activo de la aplicación y recarga las capas
   * @param {string} profile - Nombre del perfil a activar
   * @returns {Error|undefined} Error si el cambio falla, undefined si es exitoso
   */
  changeProfile: function (profile) {
    if (profile === app.profile) {
      console.info(`El perfil ${profile} ya está en uso.`);
      return;
    }

    if (!profile || !app.profiles[profile]) {
      const availableProfiles = Object.keys(app.profiles);
      const message = `Perfil '${profile}' faltante o no presente en la propiedad profiles. Perfiles disponibles: ${availableProfiles}`;
      console.warn(message);
      return new Error(message);
    }

    try {
      app.profile = profile;
      gestorMenu.cleanAllLayers();
      app.removeLayers();
      app.addLayers();
      gestorMenu.printMenu();
      console.info(`Perfil cambiado a ${profile}.`);
    } catch (error) {
      console.error("Error al cambiar perfil:", error);
      return error;
    }
  },

  /**
   * @method setLayer
   * @description Establece una capa en el registro de capas de la aplicación
   * @param {Object} layer - Objeto capa a registrar
   * @param {Object} layer.capa - Información de la capa
   * @param {string} layer.capa.nombre - Nombre identificador de la capa
   */
  setLayer: function (layer) {
    if (layer && layer.capa && layer.capa.nombre) {
      this.layers[layer.capa.nombre] = layer;
    } else {
      console.warn("Capa inválida proporcionada a setLayer:", layer);
    }
  },

  /**
   * @method getLayers
   * @description Obtiene todas las capas registradas en la aplicación
   * @returns {Object} Objeto con todas las capas registradas
   */
  getLayers: function () {
    return this.layers;
  },

  /**
   * @method getSections
   * @description Obtiene todas las secciones del gestor de menú
   * @returns {Object} Objeto con todas las secciones/items del menú
   */
  getSections: function () {
    return gestorMenu.items;
  },

  /**
   * @method getActiveLayers
   * @description Obtiene las capas actualmente activas en el mapa
   * @returns {Object} Capas overlay activas
   */
  getActiveLayers: function () {
    return overlayMaps;
  },

  /**
   * @method getBaseMapPane
   * @description Obtiene el panel del mapa base
   * @returns {HTMLElement} Primer hijo del panel de tiles
   */
  getBaseMapPane: function () {
    return mapa.getPane("tilePane").firstChild;
  },

  /**
   * @method addMenuSection
   * @description Agrega una sección al menú de la interfaz
   * @param {string} name_section - Nombre de la sección a agregar
   */
  addMenuSection: function (name_section) {
    menu_ui.addSection(name_section);
  },

  /**
   * @method addParentSection
   * @description Agrega una sección padre al menú
   * @param {string} parent_name - Nombre de la sección padre
   * @param {string} section_name - Nombre de la sección hija
   */
  addParentSection: function (parent_name, section_name) {
    menu_ui.addParentSection(parent_name, section_name);
  },

  /**
   * @method addLayerBtn
   * @description Agrega un botón de capa al menú
   * @param {string} name_section - Nombre de la sección
   * @param {string} name_layer - Nombre de la capa
   */
  addLayerBtn: function (name_section, name_layer) {
    menu_ui.addLayer(name_section, name_layer);
  },

  /**
   * @method showLayer
   * @description Muestra una capa específica en el mapa
   * @param {string} layer_name - Nombre de la capa a mostrar
   */
  showLayer: function (layer_name) {
    if (app.layers[layer_name] && app.layers[layer_name].childid) {
      gestorMenu.muestraCapa(app.layers[layer_name].childid);
    } else {
      console.warn(`Capa '${layer_name}' no encontrada o sin childid`);
    }
  },

  /**
   * @method argenmapDarkMode
   * @description Activa el modo oscuro de ArgenMap
   */
  argenmapDarkMode: function () {
    this.showLayer("argenmap");
    const baseMapPane = mapa.getPane("tilePane").firstChild;
    if (baseMapPane) {
      baseMapPane.style.filter = "invert(1) brightness(1.5) hue-rotate(180deg)";
    }

    const stylesui = new StylesUI();
    stylesui.createdarktheme();

    // Limpiar estilos anteriores si existen
    const oldStyle = document.getElementById("main-style-ui");
    if (oldStyle) {
      oldStyle.innerHTML = "";
    }
  },
};

// ============================================================================
// CLASES AUXILIARES
// ============================================================================

/**
 * @class Module
 * @description Representa un módulo que puede ser cargado dinámicamente
 */
class Module {
  /**
   * @constructor
   * @param {string} scriptUrl - URL del script del módulo
   * @param {string} type - Tipo MIME del script
   * @param {string} target - Destino donde cargar el script (body/head)
   */
  constructor(scriptUrl, type, target) {
    this.scriptUrl = scriptUrl;
    this.type = type;
    this.target = target;
  }
}

// ============================================================================
// VARIABLES GLOBALES DE CONFIGURACIÓN
// ============================================================================

/** @type {number} Contador global de servicios Geoserver */
let getGeoserverCounter = 0;

/** @type {string} Filtro de palabras clave para capas */
let keywordFilter = "dato-basico-y-fundamental";

/** @type {string} Plantilla actual en uso */
let template = "";

/** @type {string[]} Campos excluidos de la información de características */
let templateFeatureInfoFieldException = [];

/** @type {GestorMenu} Instancia principal del gestor de menú */
let gestorMenu = new GestorMenu();

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

/**
 * @function isURL
 * @description Verifica si una cadena es una URL válida
 * @param {string} urlString - Cadena a verificar
 * @returns {boolean} true si es una URL válida, false en caso contrario
 */
function isURL(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * @function checkFileType
 * @description Verifica el tipo de archivo basado en su extensión
 * @param {string} filePath - Ruta del archivo
 * @param {string} extension - Extensión esperada
 * @returns {boolean} true si coincide la extensión
 * @todo Implementar la lógica de verificación usando regex
 */
function checkFileType(filePath, extension) {
  // TODO: Implementar verificación de extensión de archivo usando regex
  const regex = new RegExp(`\\.${extension}$`, 'i');
  return regex.test(filePath);
}

// ============================================================================
// FUNCIONES DE CONFIGURACIÓN Y CARGA DE DATOS
// ============================================================================

/**
 * @function getJson
 * @description Obtiene y parsea un archivo JSON desde una URL
 * @param {string} url - URL del archivo JSON a obtener
 * @returns {Promise<Object|string>} Objeto JSON parseado o mensaje de error
 */
async function getJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorMsg = `${response.url.split("/").at(-1)} ${response.statusText.toLowerCase()}`;
      new UserMessage(errorMsg, true, "warning");
      return null;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error al obtener JSON:", error);
    return error.message;
  }
}

/**
 * @function getPreferences
 * @description Obtiene la configuración de preferencias
 * @param {string|Object} preferencesURL - URL del archivo de preferencias o objeto de configuración
 * @param {boolean} [load=false] - Si debe cargar la plantilla inmediatamente
 * @returns {Promise<Object>} Objeto de preferencias
 */
async function getPreferences(preferencesURL, load = false) {
  let preferences = null;

  // Verificar si ya es un objeto válido de preferencias
  if (typeof preferencesURL === "object" && preferencesURL.hasOwnProperty("title")) {
    preferences = preferencesURL;
  } else {
    preferences = await getJson(preferencesURL);
  }

  // Usar configuración por defecto si falla la carga
  if (typeof preferences !== "object" || preferences === null) {
    console.warn("Usando configuración de preferencias por defecto");
    preferences = await getJson("src/config/default/preferences.json");
  }

  if (load) {
    loadTemplate(preferences);
  }

  return preferences;
}

/**
 * @function getData
 * @description Obtiene la configuración de datos
 * @param {string|Object} dataURL - URL del archivo de datos o objeto de configuración
 * @param {boolean} [load=false] - Si debe cargar la plantilla inmediatamente
 * @returns {Promise<Object>} Objeto de datos
 */
async function getData(dataURL, load = false) {
  let data = null;

  // Verificar si ya es un objeto válido de datos
  if (typeof dataURL === "object" && dataURL.hasOwnProperty("items")) {
    data = dataURL;
  } else {
    data = await getJson(dataURL);
  }

  // Usar configuración por defecto si falla la carga
  if (typeof data !== "object" || data === null) {
    console.warn("Usando configuración de datos por defecto");
    data = await getJson("src/config/default/data.json");
  }

  if (load) {
    loadTemplate(data);
  }

  return data;
}

/**
 * @function getConfig
 * @description Lee la configuración de preferencias y datos al iniciar la aplicación
 * @param {string} preferencesURL - URL del archivo de preferencias
 * @param {string} dataURL - URL del archivo de datos
 */
async function getConfig(preferencesURL, dataURL) {
  try {
    const [preferences, data] = await Promise.all([
      getPreferences(preferencesURL),
      getData(dataURL)
    ]);

    const mergedConfig = { ...data, ...preferences };
    await loadTemplate(mergedConfig, false);
    gestorMenu.setLegendImgPath("src/config/styles/images/legends/");
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================

/**
 * Iniciar la carga de configuración de la aplicación
 */
getConfig("./src/config/preferences.json", "./src/config/data.json");

/**
 * @function loadTemplate
 * @description Carga y configura la plantilla de la aplicación con los datos proporcionados
 * @param {Object} data - Datos de configuración
 * @param {boolean} isDefaultTemplate - Indica si es la plantilla por defecto
 */
async function loadTemplate(data, isDefaultTemplate) {
  $(document).ready(async function () {
    try {
      await app.init(data);

      // Configurar plantilla
      template = app.template;

      // Crear estilos de UI
      const stylesui = new StylesUI();
      stylesui.createstyles();
      loadTemplateStyleConfig(template, isDefaultTemplate);

      // Limpiar propiedades temporales de configuración
      delete app["template"];

      // Configurar excepciones de campos de información de características
      if (app.template_feature_info_exception) {
        templateFeatureInfoFieldException = app.template_feature_info_exception;
        delete app["template_feature_info_exception"];
      }

      // Configurar uniones de capas
      if (app.layers_joins) {
        gestorMenu.setLayersJoin(app.layers_joins);
        delete app["layers_joins"];
      }

      // Configurar carpetas
      if (app.folders) {
        gestorMenu.setFolders(app.folders);
        delete app["folders"];
      }

      // Agregar analytics si está configurado
      if (app.analytics_ids && typeof addAnalytics === "function") {
        addAnalytics(app.analytics_ids);
      }

      // Agregar mapas base y capas
      app.addBasemaps();
      app.addLayers();

      // Cargar dependencias opcionales
      await loadOptionalDependencies();

      // Configurar plantilla y mapa
      await initializeMapAndTemplate();

    } catch (error) {
      console.error("Error al cargar plantilla:", error);
    }
  });

  // Cargar dependencias con delay para asegurar que el DOM esté listo
  setTimeout(loadDelayedDependencies, 1500);
}

/**
 * @function loadOptionalDependencies
 * @description Carga dependencias opcionales basadas en la configuración
 * @private
 */
async function loadOptionalDependencies() {
  // Cargar charts si está activo
  if (loadCharts && !app.dependencies.d3) {
    await Promise.all([
      $.getScript("https://d3js.org/d3.v5.min.js"),
      $.getScript("src/js/components/charts/charts.js")
    ]);
    $("head").append(
      '<link rel="stylesheet" type="text/css" href="src/js/components/charts/charts.css">'
    );
    app.dependencies.d3 = true;
  }

  // Cargar searchbar si está activo
  if (loadSearchbar && !app.dependencies.searchbar) {
    await $.getScript("src/js/components/searchbar/searchbar.js");
    const searchBar_ui = new Searchbar_UI();
    searchBar_ui.create_sarchbar();
    $("head").append(
      '<link rel="stylesheet" type="text/css" href="src/js/components/searchbar/searchbar.css">'
    );
    app.dependencies.searchbar = true;
  }
}

/**
 * @function initializeMapAndTemplate
 * @description Inicializa el mapa y la plantilla
 * @private
 */
async function initializeMapAndTemplate() {
  // Cargar mapa dinámicamente
  app.template_id = template;
  if (!app.dependencies.map) {
    await $.getScript(`src/js/map/map.js`);
    app.dependencies.map = true;
  }

  template = "templates/" + template + "/main.html";

  // Esperar hasta que el objeto global 'mapa' esté disponible
  const intervalID = setInterval(() => {
    if (mapa && mapa.hasOwnProperty("_leaflet_id")) {
      window.clearInterval(intervalID);
      setupMapEventHandlers();
      initializeUIComponents();
    }
  }, 100);
}

/**
 * @function setupMapEventHandlers
 * @description Configura los manejadores de eventos del mapa
 * @private
 */
function setupMapEventHandlers() {
  // Configurar vista inicial del mapa si hay parámetros en URL
  if (urlInteraction.areParamsInUrl) {
    mapa.setView(
      L.latLng(urlInteraction.center.latitude, urlInteraction.center.longitude),
      urlInteraction.zoom
    );
  }

  // Configurar eventos de zoom
  urlInteraction.zoom = mapa.getZoom();
  mapa.on("zoom", () => {
    if (Number.isInteger(mapa.getZoom())) {
      urlInteraction.zoom = mapa.getZoom();
      if (geoProcessingManager) {
        geoProcessingManager.svgZoomStyle(mapa.getZoom());
      }
    }
  });

  // Configurar eventos de movimiento
  urlInteraction.center = mapa.getCenter();
  mapa.on("moveend", () => {
    urlInteraction.center = mapa.getCenter();
  });

  // Agregar marcadores desde URL si existen
  if (urlInteraction.markers.length > 0) {
    urlInteraction.markers.forEach(marker => {
      L.marker([marker.latitude, marker.longitude]).addTo(mapa);
    });
  }

  // Cargar capas iniciales
  gestorMenu.loadInitialLayers(urlInteraction);
}

/**
 * @function initializeUIComponents
 * @description Inicializa los componentes de la interfaz de usuario
 * @private
 */
function initializeUIComponents() {
  // Valores por defecto para la interfaz
  const showToolbar = app?.onInit?.showToolbar ?? true;
  const showLayerMenu = app?.onInit?.showLayerMenu ?? true;
  const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

  // Inicializar toggler de toolbar
  if (!app.dependencies.toolbarToggler) {
    const toolbarVisibilityToggler = new ToolbarVisibilityToggler();
    toolbarVisibilityToggler.createComponent(showToolbar);
    app.dependencies.toolbarToggler = true;
  }

  // Mostrar menú de capas si está habilitado y no es móvil
  if (showLayerMenu && !isMobile) {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.style.display = "block";
    }
  }

  // Inicializar etiqueta editable
  if (!app.dependencies.editableLabel) {
    const editableLabel = new EditableLabel();
    editableLabel.addTo(mapa);
    app.dependencies.editableLabel = true;
  }
}

/**
 * @function loadDelayedDependencies
 * @description Carga dependencias con delay para asegurar el orden de carga
 * @private
 */
function loadDelayedDependencies() {
  // Cargar sistema de login
  if (loadLogin) {
    $("head").append(
      '<link rel="stylesheet" type="text/css" href="src/js/components/login/loginatic.css">'
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

  // Cargar popup principal
  if (mainPopup) {
    $("head").append(
      '<link rel="stylesheet" type="text/css" href="src/js/components/main-popup/mainPopup.css">'
    );
    $.getScript("src/js/components/main-popup/mainPopup.js").done(function () {
      mainPopup = new mainPopup();
      mainPopup.check();
      mainPopup._addPopupWrapper();
    });
  }

  // Cargar perfil de elevación
  loadElevationProfileDependencies();
}

/**
 * @function loadElevationProfileDependencies
 * @description Carga las dependencias para el perfil de elevación
 * @private
 */
function loadElevationProfileDependencies() {
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

    // TODO: reemplazar cargas de script por arquitectura de módulos ES
    $.getScript("src/js/components/elevation-profile/elevation-profile.js");
  }
}

// ============================================================================
// MANEJADORES DE EVENTOS Y CONFIGURACIONES GLOBALES
// ============================================================================

/**
 * Verificación periódica para forzar la carga de capas CONAE
 * TODO: Refactorizar para usar un sistema de eventos más robusto
 */
let conaeCheck = setInterval(() => {
  const conaeLayers = gestorMenu.items.conae;
  if (conaeLayers) {
    if (Object.entries(gestorMenu.items.conae.itemsComposite).length === 12) {
      gestorMenu.printMenu();
      clearInterval(conaeCheck);
    }
  }
}, 1000);

/**
 * Manejador global del menú contextual
 * Previene el menú contextual por defecto excepto en contenedores de Leaflet
 * y campos de entrada específicos
 */
document.addEventListener("contextmenu", (e) => {
  const allowedInputs = ["text", "search", "number"];
  if (
    !e.target.classList.contains("leaflet-container") &&
    !allowedInputs.includes(e.target.type)
  ) {
    e.preventDefault();
  }
});
