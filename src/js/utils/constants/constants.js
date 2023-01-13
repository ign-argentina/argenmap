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

//Default Services Values
const DEFAULT_WMTS_MAX_ZOOM_LEVEL = 21;

//Default Marker Styles
const DEFAULT_MARKER_STYLES = {
  borderWidth: 2.5,
  borderColor: "#008dc9",
  fillColor: "#fafafa",
};

const DEFAULT_ZOOM_INFO_ICON_COLOR = "#008dc9";

//Default Meta Tags Values
const METATAG_TITLE = "Argenmap - Instituto Geográfico Nacional";
const METATAG_DESCRIPTION = "Visualizador de mapas web";
const METATAG_IMAGE_URL = "src/styles/images/argenmap_logo.svg";

//Available Plugins
const _PATH = "src/js/map/plugins/leaflet/";
const PLUGINS = {
  leaflet: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.js",
  leafletAjax: "https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js",
  betterScale: "https://daniellsu.github.io/leaflet-betterscale/L.Control.BetterScale.js",
  AwesomeMarkers: "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js",
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
  screenShoter: _PATH + "leaflet-simple-map-screenshoter/leaflet-simple-map-screenshoter.js",
  turf: "src/js/plugins/turf/turf.min.js",
  editableLabel: _PATH + "leaflet-editable-label/Leaflet.EditableLabel.js",
  pdfPrinter: "src/js/components/pdfPrinter/pdfPrinter.js",
  FullScreen: "src/js/components/fullscreen/fullscreen.js",
  geoprocessing: "src/js/components/geoprocessing/geoprocessing.js",
  loadLayer: "src/js/components/loadLayersModal/loadLayersModal.js"
};

const MESSAGE_TIME = 4000;
const MESSAGE_COLORS = {
  information: {
    background: "rgba(0,141,201, 0.75)",
    text: "white",
  },
  error: {
    background: "rgba(255, 0, 0, 0.75)",
    text: "white",
  },
  warning: {
    text: "#856404",
    background: "#f7e23a",
  },
};

const PROJECTIONS = {
  22183:
    "+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  3857: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
  22185:
    "+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
};

const ERROR_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const APP_IMG = "data:image/png;base64,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";
