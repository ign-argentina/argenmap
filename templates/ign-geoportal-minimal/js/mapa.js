var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;
    
//Change logotype
$('#top-left-logo-link').attr("href","http://www.ign.gob.ar/");
$('#top-left-logo').attr("src","templates/ign-geoportal-basic/img/logo.png");
$('#top-left-logo').attr("alt","Logo Instituto Geográfico Nacional");
$('#top-left-logo').attr("title","Instituto Geográfico Nacional");
$('#top-right-logo-link').attr("href","https://www.argentina.gob.ar/defensa");
$('#top-right-logo').attr("src","templates/ign-geoportal-basic/img/logoMinDef.png");
$('#top-right-logo').attr("alt","Logo Ministerio de Defensa");
$('#top-right-logo').attr("title","Ministerio de Defensa");

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


/****** Enveloped functions ******/
function showMainMenuTpl() {
    //Ocultar loading
    $(".loading").hide();
    //Imprimir menú
    gestorMenu.imprimir($(".nav.nav-sidebar"));
    //Agregar tooltip resumen
    $("[data-toggle2='tooltip']").tooltip({
        placement: "right",
        trigger: "hover",
        container: "body"
    });
}

function loadGeojsonTpl (url, layer) {

    if (overlayMaps.hasOwnProperty(layer)) {

        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];

    } else {

        overlayMaps[layer] = new L.GeoJSON.AJAX(url, {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });
        overlayMaps[layer].addTo(mapa);

    }

}

function loadWmsTpl (wmsUrl, layer) {
    if (overlayMaps.hasOwnProperty(layer)) {
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];
    } else {
        createWmsLayer(wmsUrl, layer);
        overlayMaps[layer].addTo(mapa);
    }
    
    function createWmsLayer(wmsUrl, layer) {
        var wmsSource = new L.WMS.source(wmsUrl + "/wms?", {
            transparent: true,
            tiled: true,
            maxZoom: 21,
            format: 'image/png',
            INFO_FORMAT: 'text/html'
            //INFO_FORMAT: 'application/json'
        });
        overlayMaps[layer] = wmsSource.getLayer(layer);
    }
}

function loadMapaBaseTpl (tmsUrl, layer, attribution) {
    if (baseMaps.hasOwnProperty(layer)) {
        baseMaps[layer].removeFrom(mapa);
        delete baseMaps[layer];
    } else {
        createTmsLayer(tmsUrl, layer, attribution);
        baseMaps[layer].addTo(mapa);
    }

    function createTmsLayer(tmsUrl, layer, attribution) {
        baseMaps[layer] = new L.tileLayer(tmsUrl, {
            attribution: attribution,
        });
    }
}

function loadMapaBaseBingTpl (bingKey, layer, attribution) {
    if (baseMaps.hasOwnProperty(layer)) {
        baseMaps[layer].removeFrom(mapa);
        delete baseMaps[layer];
    } else {
        createBingLayer(bingKey, layer, attribution);
        baseMaps[layer].addTo(mapa);
    }

    function createBingLayer(bingKey, layer, attribution) {
    baseMaps[layer] = L.tileLayer.bing({bingMapsKey: bingKey, culture: 'es_AR'}).addTo(mapa);
    }
}
