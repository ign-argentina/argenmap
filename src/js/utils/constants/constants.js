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
    "EasyPrint": "./src/js/map/plugins/leaflet/leaflet-easyPrint/bundle.js"
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
    }
};

const PROJECTIONS = {
    '22183':'+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    '3857':'+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
    '22185': '+proj=tmerc +lat_0=-90 +lon_0=-60 +k=1 +x_0=5500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
}

