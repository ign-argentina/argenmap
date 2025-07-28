'use strict';

/**
 * Utilidad para parsear parámetros de URL
 * @param {string} search - Cadena de búsqueda de la URL
 * @returns {Object} Objeto con parámetros parseados
 */
function parseUrlParams(search) {
  if (!search) return {};

  const params = {};
  const pairs = search.substring(1).split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  return params;
}

/**
 * Redondea un número a una cantidad específica de decimales
 * @param {number} num - Número a redondear
 * @param {number} decimals - Cantidad de decimales
 * @returns {number} Número redondeado
 */
function roundToDecimal(num, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clase que gestiona la interacción entre los parámetros de la URL y el estado del mapa
 * Mantiene sincronizados el zoom, centro y capas con la URL del navegador
 */
class URLInteraction {
  /**
   * Inicializa la interacción con la URL
   * Lee los parámetros iniciales y configura el estado interno
   */
  constructor() {
    // Estado interno del mapa
    this._zoom = DEFAULT_ZOOM_LEVEL;
    this._latitude = DEFAULT_LATITUDE;
    this._longitude = DEFAULT_LONGITUDE;
    this._layers = [];
    this._areParamsInUrl = false;

    // Parsear parámetros iniciales de la URL
    this._parseInitialParams();

    // Actualizar URL con el estado inicial
    this.updateURL();
  }

  /**
   * Parsea los parámetros iniciales de la URL y los asigna al estado interno
   * @private
   */
  _parseInitialParams() {
    const params = parseUrlParams(window.location.search);

    if (Object.keys(params).length > 0) {
      this._areParamsInUrl = true;

      // Procesar zoom
      const zoom = parseFloat(params[ZOOM_LEVEL]);
      if (!isNaN(zoom)) {
        if (zoom < DEFAULT_MIN_ZOOM_LEVEL) {
          this._zoom = DEFAULT_MIN_ZOOM_LEVEL;
        } else if (zoom > DEFAULT_MAX_ZOOM_LEVEL) {
          this._zoom = DEFAULT_MAX_ZOOM_LEVEL;
        } else {
          this._zoom = zoom;
        }
      }

      // Procesar latitud
      const lat = parseFloat(params[LATITUDE]);
      if (!isNaN(lat)) {
        this._latitude = lat;
      }

      // Procesar longitud
      const lng = parseFloat(params[LONGITUDE]);
      if (!isNaN(lng)) {
        this._longitude = lng;
      }

      // Procesar capas
      if (params[LAYERS]) {
        const layers = params[LAYERS].split(',').filter(layer => layer.trim() !== '');
        this._layers = [...new Set(layers)]; // Eliminar duplicados
      }
    }
  }

  // Getters

  /**
   * Devuelve la URL actual completa
   * @returns {string} URL actual
   */
  get url() {
    return window.location.href.toString();
  }

  /**
   * Devuelve el centro del mapa
   * @returns {{latitude: number, longitude: number}} Coordenadas del centro
   */
  get center() {
    return {
      latitude: this._latitude,
      longitude: this._longitude
    };
  }

  /**
   * Devuelve el nivel de zoom actual
   * @returns {number} Zoom
   */
  get zoom() {
    return this._zoom;
  }

  /**
   * Indica si hubo parámetros en la URL inicial
   * @returns {boolean} True si había parámetros
   */
  get areParamsInUrl() {
    return this._areParamsInUrl;
  }

  /**
   * Devuelve las capas activas
   * @returns {string[]} Lista de capas
   */
  get layers() {
    return this._layers;
  }

  // Setters

  /**
   * Establece el centro del mapa
   * @param {{lat: number, lng: number}} coords - Coordenadas
   */
  set center(coords) {
    this._latitude = coords.lat;
    this._longitude = coords.lng;
    this.updateURL();
  }

  /**
   * Establece el nivel de zoom
   * @param {number} zoom - Nuevo zoom
   */
  set zoom(zoom) {
    this._zoom = zoom;
    this.updateURL();
  }

  /**
   * Establece las capas activas
   * @param {string[]} layers - Nuevas capas
   */
  set layers(layers) {
    this._layers = [...new Set(layers)]; // Eliminar duplicados
    this.updateURL();
  }

  /**
   * Actualiza la URL con los valores actuales del estado
   * @public
   */
  updateURL() {
    // Construir parámetros de la URL
    const zoom = `${ZOOM_LEVEL}=${this._zoom}`;
    const lat = `${LATITUDE}=${roundToDecimal(this._latitude, 4)}`;
    const lng = `${LONGITUDE}=${roundToDecimal(this._longitude, 4)}`;

    // Construir URL base
    let url = `?${zoom}&${lat}&${lng}`;

    // Agregar capas si existen
    if (this._layers.length > 0) {
      const layers = this._layers.join(',');
      url += `&${LAYERS}=${layers}`;
    }

    // Actualizar la URL sin recargar la página
    window.history.replaceState(null, null, url);
  }
}