var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;

// Mapa base actual de ArgenMap (Geoserver)
var argenmap = L.tileLayer('http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
    tms: true,
    maxZoom: 17,
    attribution: atrib_ign
});

//Construye el mapa
var mapa = L.map('mapa', {
    center: [-40, -59],
    zoom: 4,
    layers: [argenmap],
	zoomControl: true,
	minZoom: 3,
    maxZoom: 17
});