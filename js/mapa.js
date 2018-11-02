var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {"Argenmap": argenmap},
    overlayMaps = new Object(),
    layerName,
    layerData;

// Mapa base actual de ArgenMap (Geoserver)
var argenmap = L.tileLayer('http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
    tms: true,
    maxZoom: 15,
    attribution: atrib_ign
});

var argenmap_old = L.tileLayer('https://ide.ign.gob.ar/geoservicios/rest/services/Mapas_IGN/mapa_topografico/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 15,
    attribution: atrib_ign
});

//Construye el mapa
var mapa = L.map('mapa', {
    center: [-40, -59],
    zoom: 4,
    layers:[argenmap]
});

L.control.betterscale({metric:true,imperial:false}).addTo(mapa);

// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");
// -- Plugins
function onEachFeature(feature, layer) {
    if (feature.properties) {
        var datos = new Array();
        $.each(feature.properties, function (index, value) {
            if (value) {
                datos.push(index + ": " + value + "<br>");
            }
        });
        layer.bindPopup(datos.toString().replace(",",""));
    }
}

// Leaflet-MousePosition plugin https://github.com/ardhi/Leaflet.MousePosition
L.control.mousePosition( { position: 'bottomright',  } ).addTo(mapa);

// Leaflet-MiniMap plugin https://github.com/Norkart/Leaflet-MiniMap
var miniArgenmap = new L.TileLayer(argenmap._url, {minZoom: 0, maxZoom: 13, attribution: atrib_ign, tms: true });
var miniMap = new L.Control.MiniMap(miniArgenmap, { toggleDisplay: true, minimized: true, position: 'bottomright', collapsedWidth: 30, collapsedHeight: 30 }).addTo(mapa);

// Leaflet-Measure plugin https://github.com/ljagis/leaflet-measure
var measureControl = new L.Control.Measure({ position: 'bottomleft', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters', secondaryAreaUnit: 'hectares' });
measureControl.addTo(mapa);

// Leaflet-Location plugin https://github.com/herrhelms/meteor-leaflet-locatecontrol
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: true,
  strings: {
    title: "Mi posición",
    popup: "Ustes se encuentra a {distance} {unit} desde este punto",
    outsideMapBoundsMsg: "Se encuentra situado fuera de los límites del mapa"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(mapa);

function style(geoJsonFeature) {
    return [
        {'color': 'red'}
    ]
}

function pointToLayer(feature, latlng) {
    // Creates a red marker with the coffee icon
    var markerIcon = L.AwesomeMarkers.icon({
        icon: feature.properties.icon || 'star',
        prefix: 'fa',
        markerColor: feature.properties.iconColor || 'red'
    });

    return L.marker(latlng, {
        icon: markerIcon
    })
}

function loadGeojson(url, layer) {
    
    if (overlayMaps.hasOwnProperty(layer)) {
        
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];

    } else {

        overlayMaps[layer] = new L.GeoJSON.AJAX( url, {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });
        overlayMaps[layer].addTo(mapa);

    }

}

function getGeoserver(host, servicio, seccion, nombre, version){
    if(!$('#temp-menu').hasClass('temp')){ $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>');}
    // Load geoserver Capabilities, if success Create menu and append to DOM
    $('#temp-menu').load(host + '/ows?service=' + servicio + '&version=' + version + '&request=GetCapabilities', function(){
        var capability = $('#temp-menu').find("capability");
        var capas_layer = $('layer', capability);
        var capas_info = $('layer', capas_layer);        
        var capas = [];

        // create an object with all layer info for each layer
        capas_info.each(function(index, b){
            var i = $(this); var iName = $('name', i).html(); var iTitle = $('title', i).html(); var iBoundingBox = $('boundingbox', i); 
            if (iBoundingBox[0].attributes.srs) {
                var iSrs=iBoundingBox[0].attributes.srs;   
            } else {
                var iSrs=iBoundingBox[0].attributes.crs;                
            }
            var iMaxY=iBoundingBox[0].attributes.maxy;
            var iMinY=iBoundingBox[0].attributes.miny;
            var iMinX=iBoundingBox[0].attributes.minx;
            var iMaxX=iBoundingBox[0].attributes.maxx;
            var obj={};
            obj.nombre = iName; obj.titulo = iTitle; obj.srs = iSrs.nodeValue; obj.host = host; obj.servicio = servicio; obj.minx = iMinX.nodeValue; obj.maxx = iMaxX.nodeValue; obj.miny = iMinY.nodeValue; obj.maxy = iMaxY.nodeValue;
            capas.push(obj);
        });

        // Add layers DOM
        try {
            imprimirItem(nuevoItem(nombre, seccion, capas), loadWms);
        }
        catch(err) {
            if(err.name == "ReferenceError"){
                imprimirItem(nuevoItem(nombre, seccion, capas),null);
            }
        }
    });
}
function loadWms(wmsUrl, layer){
    if (overlayMaps.hasOwnProperty(layer)) {
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];
    } else {
        createWmsLayer(wmsUrl, layer);
        overlayMaps[layer].addTo(mapa);
    }

    function createWmsLayer(wmsUrl, layer) {
        overlayMaps[layer] = new L.tileLayer.wms(wmsUrl + "/geoserver/wms?", {
            layers: layer,
            tiled: true,
            format: 'image/png',
            // attribution: "Weather data © 2012 IEM Nexrad",
            transparent: true
        });
    }
}