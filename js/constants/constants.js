//Param Values
const ZOOM_LEVEL = 'zoom';
const LATITUDE = 'lat';
const LONGITUDE = 'lng';
const LAYERS = 'layers';

//Default Map Values
const DEFAULT_MIN_ZOOM_LEVEL = 3;
const DEFAULT_MAX_ZOOM_LEVEL = 21;
const DEFAULT_ZOOM_LEVEL = 4;
const DEFAULT_LATITUDE = -40;
const DEFAULT_LONGITUDE = -59;

//Default Meta Tags Values
const METATAG_TITLE = 'Argenmap - Instituto Geográfico Nacional';
const METATAG_DESCRIPTION = 'Visualizador de mapas web';
const METATAG_IMAGE_URL = 'https://pbs.twimg.com/profile_images/1274694532421083137/TMc-ZIX4.jpg';

//Available Plugins
const PLUGINS = {
    "leaflet": "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js",
    "leafletAjax": "https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js",
    "betterScale": "https://daniellsu.github.io/leaflet-betterscale/L.Control.BetterScale.js",
    "AwesomeMarkers": "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js",
    "Draw": "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js",
    "ZoomHome": "plugins/leaflet-zoomhome/dist/leaflet.zoomhome.min.js",
    "BingLayer": "plugins/leaflet-bing-layer-gh-pages/leaflet-bing-layer.js",
    "minimap": "plugins/leaflet-minimap/Control.MiniMap.js",
    "locate": "plugins/leaflet-locate/L.Control.Locate.min.js",
    "MousePosition": "plugins/leaflet-mouseposition/src/L.Control.MousePosition.js",
    "Measure": "plugins/leaflet-measure/leaflet-measure.js",
    "BrowserPrint": "plugins/leaflet-browser-print/dist/leaflet.browser.print.min.js",
    "FullScreen": "plugins/leaflet-fullscreen/Control.FullScreen.js",
    "betterWMS": "plugins/leaflet-wms/leaflet.wms.js",
    "graticula": "plugins/leaflet-simplegraticule/L.SimpleGraticule.js",
    "WMTS": "plugins/leaflet-wmts/leaflet-tilelayer-wmts.js",
    "EasyPrint": "plugins/leaflet-easyPrint/bundle.js"
};
