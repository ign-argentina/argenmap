//Param Values
const ZOOM_LEVEL = 'zoom';
const LATITUDE = 'lat';
const LONGITUDE = 'lng';
const LAYERS = 'layers';

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
    borderColor: '#008dc9',
    fillColor: '#fafafa'
};

const DEFAULT_ZOOM_INFO_ICON_COLOR = '#008dc9';

//Default Meta Tags Values
const METATAG_TITLE = 'Argenmap - Instituto Geográfico Nacional';
const METATAG_DESCRIPTION = 'Visualizador de mapas web';
const METATAG_IMAGE_URL = 'https://pbs.twimg.com/profile_images/1274694532421083137/TMc-ZIX4.jpg';

//Available Plugins
const PLUGINS = {
    "leaflet": "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/leaflet.js",
    "leafletAjax": "https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js",
    "betterScale": "https://daniellsu.github.io/leaflet-betterscale/L.Control.BetterScale.js",
    "AwesomeMarkers": "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js",
    "Draw": "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js",
    "ZoomHome": "./src/js/map/plugins/leaflet/leaflet-zoomhome/dist/leaflet.zoomhome.min.js",
    "BingLayer": "./src/js/map/plugins/leaflet/leaflet-bing-layer-gh-pages/leaflet-bing-layer.js",
    "minimap": "./src/js/map/plugins/leaflet/leaflet-minimap/Control.MiniMap.js",
    "locate": "./src/js/map/plugins/leaflet/leaflet-locate/L.Control.Locate.min.js",
    "MousePosition": "./src/js/map/plugins/leaflet/leaflet-mouseposition/src/L.Control.MousePosition.js",
    "Measure": "./src/js/map/plugins/leaflet/leaflet-measure/leaflet-measure.js",
    "BrowserPrint": "./src/js/map/plugins/leaflet/leaflet-browser-print/dist/leaflet.browser.print.min.js",
    "FullScreen": "./src/js/map/plugins/leaflet/leaflet-fullscreen/Control.FullScreen.js",
    "betterWMS": "./src/js/map/plugins/leaflet/leaflet-wms/leaflet.wms.js",
    "graticula": "./src/js/map/plugins/leaflet/leaflet-simplegraticule/L.SimpleGraticule.js",
    "WMTS": "./src/js/map/plugins/leaflet/leaflet-wmts/leaflet-tilelayer-wmts.js",
    "EasyPrint": "./src/js/map/plugins/leaflet/leaflet-easyPrint/bundle.js",
    "elevation": "./src/js/map/plugins/leaflet/leaflet-elevation/leaflet-elevation.js",
    "textpath": "./src/js/map/plugins/leaflet/leaflet-textpath/leaflet-textpath.js",
    "turf": "https://cdn.jsdelivr.net/npm/@turf/turf@6.5.0/turf.min.js"
};

const MESSAGE_TIME = 4000;
const MESSAGE_COLORS = {
    information: {
        background: 'rgba(0,141,201, 0.75)',
        text: 'white'
    },
    error: {
        background: 'rgba(255, 0, 0, 0.75)',
        text: 'white'
    },
    warning:{
        text: "#856404",
        background: "#f7e23a"
    }
};

const PROJECTIONS = {
    '22183':'+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    '3857':'+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
    '22185': '+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
}

const ERROR_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const APP_IMG = "data:image/png;base64,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"