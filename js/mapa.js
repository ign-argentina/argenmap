var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;

// Mapa base actual de ArgenMap (Geoserver)
var argenmap = L.tileLayer('http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
    tms: true,
    maxZoom: 15,
    attribution: atrib_ign
});

//Construye el mapa
var mapa = L.map('mapa', {
    center: [-40, -59],
    zoom: 4,
    layers: [argenmap]
});

L.control.betterscale({ metric: true, imperial: false }).addTo(mapa);

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
        layer.bindPopup(datos.toString().replace(",", ""));
    }
}

// Leaflet-MousePosition plugin https://github.com/ardhi/Leaflet.MousePosition
L.control.mousePosition({ position: 'bottomright', }).addTo(mapa);

// Leaflet-MiniMap plugin https://github.com/Norkart/Leaflet-MiniMap
var miniArgenmap = new L.TileLayer(argenmap._url, { minZoom: 0, maxZoom: 13, attribution: atrib_ign, tms: true });
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

// Leaflet-easyPrint plugin https://github.com/rowanwins/leaflet-easyPrint
var printerPlugin = L.easyPrint({
	title: 'Descargado desde IGN',
	position: 'bottomleft',
	sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
	filename: 'myMap',
	exportOnly: true,
	hideControlContainer: true
}).addTo(mapa);

function style(geoJsonFeature) {
    return [
        { 'color': 'red' }
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

        overlayMaps[layer] = new L.GeoJSON.AJAX(url, {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });
        overlayMaps[layer].addTo(mapa);

    }

}

function getGeoserver(host, servicio, seccion, peso, nombre, version) {
	const impresorItem = new ImpresorItemHTML();
	
    if (!$('#temp-menu').hasClass('temp')) { $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>'); }
    // Load geoserver Capabilities, if success Create menu and append to DOM
    $('#temp-menu').load(host + '/ows?service=' + servicio + '&version=' + version + '&request=GetCapabilities', function () {
        var capability = $('#temp-menu').find("capability");
        var keywordHtml = $('#temp-menu').find("Keyword");
        var abstractHtml = $('#temp-menu').find("Abstract");
        var keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
        var abstract = abstractHtml[0].innerText; // reads wms 1st abstract
        var capas_layer = $('layer', capability);
        var capas_info = $('layer', capas_layer);
		
		var items = new Array();
		
        // create an object with all layer info for each layer
        capas_info.each(function (index, b) {
            var i = $(this); var iName = $('name', i).html(); var iTitle = $('title', i).html(); var iBoundingBox = $('boundingbox', i);  var iAbstract = $('abstract', i).html();
            if (iBoundingBox[0].attributes.srs) {
                var iSrs = iBoundingBox[0].attributes.srs;
            } else {
                var iSrs = iBoundingBox[0].attributes.crs;
            }
            var iMaxY = iBoundingBox[0].attributes.maxy;
            var iMinY = iBoundingBox[0].attributes.miny;
            var iMinX = iBoundingBox[0].attributes.minx;
            var iMaxX = iBoundingBox[0].attributes.maxx;
            
			var capa = new Capa(iName, iTitle, iSrs.nodeValue, host, servicio, version, iMinX.nodeValue, iMaxX.nodeValue, iMinY.nodeValue, iMaxY.nodeValue);
			var item = new Item(capa.nombre, seccion+index, "", iAbstract, capa.titulo, capa);
			item.setImpresor(impresorItem);
			items.push(item);
        });
		
		var groupAux;
		try {
			var groupAux = new ItemGroup(nombre, seccion, peso, keyword, abstract, loadWms);
			for (var i = 0; i < items.length; i++) {
				groupAux.setItem(items[i]);
			}
		}
		catch (err) {
			if (err.name == "ReferenceError") {
				var groupAux = new ItemGroup(nombre, seccion, peso, "", "", null);
				for (var i = 0; i < items.length; i++) {
					groupAux.setItem(items[i]);
				}
			}
		}

		gestorMenu.add(groupAux);
		
		getGeoserverCounter--;
		if (getGeoserverCounter == 0) { //Si ya cargó todas las capas solicitadas
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
		
		return;
    });
}
function loadWms(wmsUrl, layer) {
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
            format: 'image/png',
            INFO_FORMAT: 'text/html'
        });
        overlayMaps[layer] = wmsSource.getLayer(layer);
    }
}

function loadMapaBase(tmsUrl, layer, attribution) {
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
