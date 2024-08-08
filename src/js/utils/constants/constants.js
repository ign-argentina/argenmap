//Param Values
const ZOOM_LEVEL = "zoom";
const LATITUDE = "lat";
const LONGITUDE = "lng";
const LAYERS = "layers";

//Default Map Values
const DEFAULT_MIN_ZOOM_LEVEL = 3;
const DEFAULT_MAX_ZOOM_LEVEL = 21;
const DEFAULT_MIN_NATIVE_ZOOM_LEVEL = 3;
const DEFAULT_MAX_NATIVE_ZOOM_LEVEL = 21;
const DEFAULT_ZOOM_LEVEL = 4;
const DEFAULT_LATITUDE = -40;
const DEFAULT_LONGITUDE = -59;

const ERROR_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const APP_IMG =
  "data:image/webp;base64,UklGRvIEAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSIoCAAABoLRtmyHJ3lCMsbNtY+Wtbdu2Z5a2bc8c2z4r224jq8vuingXFV/kF5kRMQGCv86Mi58VJmUu8te7JyfUEJ6f8TlcfjLdW0vDYIyt906Pf8FcOdgj+2Dxgifeg9Ufatn7GZbLG9r6EbZVRW07r8M4VlFeEQiUlxZVmAA/WNkI06CTgtQi+1+BCU5YaA3DlKOkMf6NGqAX39cGobh0q0LlBr+xjQTtZCRjsoTCOK6fqWBGsiYc6gemPiBTEUmqVFUoqQjpJAl05rlElStdLhwHgHQsp8Ov1DGeEBGpltpkHGQsrZHRIuJ/lhYgw0qTycKwOqPB7wTqc0yjEjIfURiHkCdLc8RIjgNEGJogXIY1KCR2cNwgAhqVcBNSmgLiCscrRFBpkm6iGlVEvMjxDhGQmqibIPJkCfE2x+tERJd2E1F5qpR4i+MeEVWapJu4BkXEE46DFPJk3E1MagqIUxxziOq4Jp01S2U0lSliFUdHAlUaGTZLSO2/IAdxiCzhQIOgSUpp8DclWB8TcDRSxRO6WEJJ7d8gP+IZRQWhkVJGUtl4OCxJ9T+1mEfECQQUIaVUksafoAXzHioVNjFUJWnqNJeQBMJJBuXEQNdhW00hFoQblMVBrxH8v1KoLksoE5UuyIH+VFhsbgDEHUcBSgFwCgIwzNS1IcaZAAhXBSqKi8oqsjAeIexuN+M9I2y/aet3Yb/KUiMPdLAzXnhxho0bwpsX+f4VXv2aralnakeZJgnvduW5Jby8kON/4e2nDC08JipczRBe7+LmofD+AbO48GOx0URfjDf5QvjzN4POPhlBPRF+/Ypo5JsBuqvCvx9qGvqoS95Z4eeXAdTxVUvgsPD3PSV83mizNVZQOCBCAgAAMA4AnQEqQABAAD6JOJdHpSOiITAUDvigEQlsAM0Dk0InqPmn2P+xbmkcjs0nAbYDzAecR6Fd4A9ADpZf7zk0MIMoHgBpAmaN2N+wCzE96v/D/5GZxUmkvuNcYy5QD5G9OknIb1JO335FOL5T9QtXB5wUqGsz//8cEQAA/vev//8MRzUNIynmVnYvWiqUXaOpmzNiypOlyWsf3HGlCRBuD/OZQb/RTg2qCnF2rdb3iWKznhzLdbWgpaOC3IrO3/6IcrHd4CgJSxrc7X9jmfRcULBAreuszrOf4MjhlvXJXZ1ACDLS282uM56HeCj3Jw9ijqxmfRQbf/uEf/+E5efFtDslAMuFZJHz1k9CLhYruSiKHGB0e0ybTfhaq3zLd3iFi/y/oSb1z87z9yKw8HAHILAB2ceLabuxktMk3XtQ4p6I67CyzEZIXvPMO+k/9o9ccINBsLOs0hdh21ygBm7QOSXQ/E32qSR8trhiH2Ub8L6S+Gfy6lAoCodleriu6MoCL9wvSh/iFOgsq9DxTEynKfnfjDjhwWz2VpoxHqsPQRaMOcRVPo2Xl2gwFzgbfDYgE4NfbDweVsQxFd6nTYXS4U105DTDX5sun137rT27gEpAzvC8bpnSWx2LakkAbbNXu3Wz04whgDvt206gjfvC2cc0NeruBiDOhrPx6UtLc/Ba+Q6nf4knYtRnvZnjbfVwgP2Mxxeo/M4ftFXwnLmL1BJV/z/SE9ix/HCrakidM1aB/J9yDMUjIfzIlkjMAt8AAAA=";

const LEGEND_ERROR = "src/styles/images/not-found.svg";

//GetLegendGraphic options
let _antialias = true,
  _dpi = "111",
  _font = "verdana",
  _hideEmpty = false,
  _labelMargin = "5";
const _LEGEND_OPTIONS = `&LEGEND_OPTIONS=fontAntiAliasing:${_antialias};dpi:${_dpi};fontName:${_font};hideEmptyRules:${_hideEmpty};labelMargin:${_labelMargin};`;
//GetLegendGraphic params
let _LEGEND_TRANSPARENT = true,
  _LEGEND_SCALE = 1;
const _LEGEND_PARAMS = `&transparent=${_LEGEND_TRANSPARENT}&scale=${_LEGEND_SCALE}`;

const STRINGS = {
  basemap_legend_button_text: "View basemap legend",
  basemap_max_zoom: " to max zoom ",
  basemap_min_zoom: "Min zoom ",
  delete_geometry: "Delete geometry",
  url_required: "URL parameter is required",
  no_bbox: "Invalid or empty bounding box",
  about: "Acerca de Argenmap",
};

//Default Services Values
const DEFAULT_WMTS_MAX_ZOOM_LEVEL = 21;

//Default Marker Styles
const DEFAULT_MARKER_STYLES = {
  borderWidth: 2.5,
  borderColor: "#008dc9",
  fillColor: "#fafafa",
};

const DEFAULT_ZOOM_INFO_ICON_COLOR = "#FFF";

//Default Meta Tags Values
const METATAG_TITLE = "Argenmap - Instituto Geográfico Nacional";
const METATAG_DESCRIPTION = "Visualizador de mapas web";
const METATAG_IMAGE_URL = "src/styles/images/argenmap_logo.svg";

//Available Plugins
const _PATH = "src/js/map/plugins/leaflet/";
const PLUGINS = {
  leaflet: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.js",
  leafletAjax:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js",
  betterScale:
    "https://daniellsu.github.io/leaflet-betterscale/L.Control.BetterScale.js",
  AwesomeMarkers:
    "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js",
  Draw: _PATH + "leaflet-draw/leaflet.draw.js",
  ZoomHome: _PATH + "leaflet-zoomhome/dist/leaflet.zoomhome.min.js",
  BingLayer: _PATH + "leaflet-bing-layer-gh-pages/leaflet-bing-layer.js",
  minimap: _PATH + "leaflet-minimap/Control.MiniMap.js",
  locate: _PATH + "leaflet-locate/L.Control.Locate.min.js",
  MousePosition: _PATH + "leaflet-mouseposition/src/L.Control.MousePosition.js",
  Measure: _PATH + "leaflet-measure/leaflet-measure.js",
  betterWMS: _PATH + "leaflet-wms/leaflet.wms.js",
  graticula: _PATH + "leaflet-simplegraticule/L.SimpleGraticule.js",
  WMTS: _PATH + "leaflet-wmts/leaflet-tilelayer-wmts.js",
  elevation: _PATH + "leaflet-elevation/leaflet-elevation.js",
  textpath: _PATH + "leaflet-textpath/leaflet-textpath.js",
  screenShoter:
    _PATH +
    "leaflet-simple-map-screenshoter/leaflet-simple-map-screenshoter.js",
  turf: "src/js/plugins/turf/turf.min.js",
  pdfPrinter: "src/js/components/pdfPrinter/pdfPrinter.js",
  FullScreen: "src/js/components/fullscreen/fullscreen.js",
  geoprocessing: "src/js/components/geoprocessing/geoprocessing.js",
  loadLayer: "src/js/components/loadLayersModal/loadLayersModal.js",
  consultData: "src/js/components/consultData/consultData.js",
  helpTour: "src/js/components/help/helpTour.js",
  configTool: "src/js/components/config-tool/configTool.js",
};

const MESSAGE_PROPERTIES = {
  information: {
    background: "rgba(0,141,201, 0.75)",
    text: "white",
    time: 2000,
  },
  error: {
    background: "rgba(255, 0, 0, 0.75)",
    text: "white",
    time: 10000,
  },
  warning: {
    text: "#856404",
    background: "rgba(247,226,58,0.75)",
    time: 5000,
  },
};

const USER_LOCALE =
  navigator.languages && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language;

const NUM_FORMAT = new Intl.NumberFormat().formatToParts(1000.1);

const THOUSANDS_SEPARATOR = NUM_FORMAT[1].value;
const DECIMAL_SEPARATOR = NUM_FORMAT[1].value;

const PROJECTIONS = {
  22183:
    "+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  3857: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
  22185:
    "+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};
