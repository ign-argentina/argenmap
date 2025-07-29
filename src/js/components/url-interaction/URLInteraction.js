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
      const decodedKey = decodeURIComponent(key);
      const decodedValue = decodeURIComponent(value);

      // Manejar parámetros repetidos (como múltiples markers)
      if (params[decodedKey]) {
        if (Array.isArray(params[decodedKey])) {
          params[decodedKey].push(decodedValue);
        } else {
          params[decodedKey] = [params[decodedKey], decodedValue];
        }
      } else {
        params[decodedKey] = decodedValue;
      }
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
 * Valida si unas coordenadas están dentro de límites razonables
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {boolean} True si las coordenadas son válidas
 */
function isValidCoordinate(lat, lng) {
  return !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180;
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
    this._markers = []; // Nuevo: array de marcadores
    this._areParamsInUrl = false;

    // Parsear parámetros iniciales de la URL
    this._parseInitialParams();

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

      // Procesar marcadores
      this._parseMarkers(params[MARKER]);
    }
  }

  /**
   * Parsea y valida los marcadores desde los parámetros
   * @private
   * @param {string|string[]} markerParam - Parámetro(s) de marcador
   */
  _parseMarkers(markerParam) {
    if (!markerParam) return;

    // Normalizar a array para manejar un solo marker o múltiples
    const markers = Array.isArray(markerParam) ? markerParam : [markerParam];

    for (const marker of markers) {
      const coords = marker.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);

        // Validar coordenadas
        if (isValidCoordinate(lat, lng)) {
          this._markers.push({
            latitude: lat,
            longitude: lng
          });
        }
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

  /**
   * Devuelve los marcadores
   * @returns {Array<{latitude: number, longitude: number}>} Lista de marcadores
   */
  get markers() {
    return [...this._markers]; // Devolver copia para evitar modificaciones externas
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
   * No incluye markers ya que no se modifican programáticamente
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

    // Agregar marcadores si existen
    if (this._markers.length > 0) {
      const markers = this._markers.map(marker => `${marker.latitude},${marker.longitude}`).join('&');
      url += `&${MARKER}=${markers}`;
    }

    // Actualizar la URL sin recargar la página
    window.history.replaceState(null, null, url);
  }
}