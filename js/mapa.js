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
	zoomControl: false,
	minZoom: 2,
    maxZoom: 17
});

// Base Map Control
L.Control.Watermark = L.Control.extend({

  onAdd: function (map) {
	var container = L.DomUtil.create('div', 'leaflet-control basemap-selector');
	return container;
  }
});
L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
}
L.control.watermark({ position: 'topleft' }).addTo(mapa);

// Leaflet Zoomhome plugin https://github.com/torfsen/leaflet.zoomhome
var zoomHome = L.Control.zoomHome({
	zoomHomeTitle: 'Inicio',
	zoomInTitle: 'Acercarse',
	zoomOutTitle: 'Alejarse'
});
zoomHome.addTo(mapa);

// Leaflet BetterScale plugin
/*
L.control.betterscale({
	metric: true,
	imperial: false
}).addTo(mapa);
*/
L.control.scale({
	metric: true,
	imperial: false
}).addTo(mapa);

// Leaflet-MiniMap plugin https://github.com/Norkart/Leaflet-MiniMap
var miniArgenmap = new L.TileLayer(argenmap._url, {
	minZoom: 0,
	maxZoom: 17,
	attribution: atrib_ign,
	tms: true
});
var miniMap = new L.Control.MiniMap(miniArgenmap, {
	toggleDisplay: false,
	minimized: false,
	position: 'bottomleft',
	//collapsedWidth: 32,
	//collapsedHeight: 32,
	width: 100,
	height: 100,
	strings: {
		hideText: 'Ocultar minimapa',
		showText: 'Mostrar minimapa'
	}
}).addTo(mapa);

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
L.control.mousePosition({
	position: 'bottomright', 
	lngFormatter: function(num) {
		var direction = (num < 0) ? 'O' : 'E';
		return deg_to_dms(Math.abs(num)) + direction; 
	},
	latFormatter: function(num) {
		var direction = (num < 0) ? 'S' : 'N';
		return deg_to_dms(Math.abs(num)) + direction; 
	},
	separator: '  ',
	emptyString: '&nbsp;'
}).addTo(mapa);

// Leaflet-Locate plugin https://github.com/domoritz/leaflet-locatecontrol
var locateControl = L.control.locate({
    position: "topleft",
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
    icon: "fa fa-crosshairs",
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

// Leaflet-Control.FullScreen plugin https://github.com/brunob/leaflet.fullscreen
L.control.fullscreen({
  position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
  title: 'Ver en pantalla completa', // change the title of the button, default Full Screen
  titleCancel: 'Salir de pantalla completa', // change the title of the button when fullscreen is on, default Exit Full Screen
  content: null, // change the content of the button, can be HTML, default null
  forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
  forcePseudoFullscreen: false, // force use of pseudo full screen even if full screen API is available, default false
  fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
}).addTo(mapa);

mapa.on('enterFullscreen', function(){
  if (miniMap._minimized) {
    miniMap._restore();
    window.setTimeout( miniMap_Minimize, 2000 );
  }
});

mapa.on('exitFullscreen', function(){
  if (miniMap._minimized) {
	miniMap._restore();
	window.setTimeout( miniMap_Minimize, 2000 );
  }
});

function miniMap_Minimize() {
  miniMap._minimize();
}

// Leaflet-easyPrint plugin https://github.com/rowanwins/leaflet-easyPrint
/*
var printerPlugin = L.easyPrint({
	title: 'Descargar mapa',
	position: 'topleft',
	sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
	defaultSizeTitles: {
							Current: 'Tamaño actual',
							A4Landscape: 'A4 Horizontal',
							A4Portrait: 'A4 Vertical'
						},
	filename: 'myMap',
	exportOnly: false,
	hideControlContainer: true
}).addTo(mapa);
*/

// Leaflet-Measure plugin https://github.com/ljagis/leaflet-measure
var measureControl = new L.Control.Measure({ position: 'topleft', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters', secondaryAreaUnit: 'hectares' });
measureControl.addTo(mapa);

// Leaflet-Draw plugin https://github.com/Leaflet/Leaflet.draw
var drawnItems = new L.FeatureGroup();
mapa.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
	edit: {
		featureGroup: drawnItems,
		poly: {
			allowIntersection: false
		}
	},
	draw: {
		polygon: {
			allowIntersection: false,
			showArea: true
		}
	},
	position: 'topright'
});
//Customizing language and text in Leaflet.draw
L.drawLocal.draw.toolbar.finish.title = 'Finalizar dibujo';
L.drawLocal.draw.toolbar.finish.text = 'Finalizar';
L.drawLocal.draw.toolbar.actions.title = 'Cancelar dibujo';
L.drawLocal.draw.toolbar.actions.text = 'Cancelar';
L.drawLocal.draw.toolbar.undo.title = 'Eliminar el último punto dibujado';
L.drawLocal.draw.toolbar.undo.text = 'Eliminar el último punto';
L.drawLocal.draw.toolbar.buttons.polyline = 'Dibujar una línea';
L.drawLocal.draw.toolbar.buttons.polygon = 'Dibujar un polígono';
L.drawLocal.draw.toolbar.buttons.rectangle = 'Dibujar un rectángulo';
L.drawLocal.draw.toolbar.buttons.circle = 'Dibujar un círculo';
L.drawLocal.draw.toolbar.buttons.marker = 'Dibujar un marcador';
L.drawLocal.draw.toolbar.buttons.circlemarker = 'Dibujar un marcador circular';
L.drawLocal.draw.handlers.circle.tooltip.start = 'Click y arrastra para dibujar un círculo';
L.drawLocal.draw.handlers.circle.radius = 'Radio';
L.drawLocal.draw.handlers.circlemarker.tooltip.start = 'Click sobre el mapa para posicionar el marcador circular';
L.drawLocal.draw.handlers.marker.tooltip.start = 'Click sobre el mapa para posicionar el marcador';
L.drawLocal.draw.handlers.polygon.tooltip.start = 'Click para comenzar a dibujar la forma';
L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Click para continuar dibujando la forma';
L.drawLocal.draw.handlers.polygon.tooltip.end = 'Click en el primer punto para cerrar la forma';
L.drawLocal.draw.handlers.polyline.error = '<strong>Error:</strong> los border de la forma no deben cruzarse';
L.drawLocal.draw.handlers.polyline.tooltip.start = 'Click para comenzar a dibujar la línea';
L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Click para continuar dibujando la línea';
L.drawLocal.draw.handlers.polyline.tooltip.start = 'Click en el último punto para finalizar la línea';
L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Click y arrastra para dibujar un rectángulo';
L.drawLocal.draw.handlers.simpleshape.tooltip.end = 'Soltar el mouse para finalizar el dibujo';
L.drawLocal.edit.toolbar.actions.save.title = 'Guardar cambios';
L.drawLocal.edit.toolbar.actions.save.text = 'Guardar';
L.drawLocal.edit.toolbar.actions.cancel.title = 'Cacelar edición, descartar todos los cambios';
L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';
L.drawLocal.edit.toolbar.actions.clearAll.title = 'Limpiar todas las capas';
L.drawLocal.edit.toolbar.actions.clearAll.text = 'Limpiar todo';
L.drawLocal.edit.toolbar.buttons.edit = 'Editar capas';
L.drawLocal.edit.toolbar.buttons.editDisabled = 'No hay capas para editar';
L.drawLocal.edit.toolbar.buttons.remove = 'Eliminar capas';
L.drawLocal.edit.toolbar.buttons.removeDisabled = 'No hay capas para eliminar';
L.drawLocal.edit.handlers.edit.tooltip.text = 'Arrastrar polígonos o marcadores para editar sus características';
L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click en cancelar para deshacer los cambios';
L.drawLocal.edit.handlers.remove.tooltip.text = 'Click sobre la característica a eliminar';
mapa.addControl(drawControl);
mapa.on(L.Draw.Event.CREATED, function (event) {
	var layer = event.layer;

	drawnItems.addLayer(layer);
});

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

function getGeoserver(host, servicio, seccion, peso, nombre, version, short_abstract) {
	const impresorGroup = new ImpresorGrupoHTML();
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
            var i = $(this);
			var iName = $('name', i).html();
			var iTitle = $('title', i).html();
			var iBoundingBox = $('boundingbox', i);
			var iAbstract = $('abstract', i).html();
			var keywordsHTMLList = $('keywordlist', i).find("keyword");
			var keywords = [];
			$.each( keywordsHTMLList, function( i, el ) {
				keywords.push(el.innerText);
			});
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
			var item = new Item(capa.nombre, seccion+index, keywords, iAbstract, capa.titulo, capa);
			item.setImpresor(impresorItem);
			items.push(item);
        });
		
		var groupAux;
		try {
			var groupAux = new ItemGroup(nombre, seccion, peso, keyword, abstract, short_abstract, loadWms);
			groupAux.setImpresor(impresorGroup);
			groupAux.setObjDom($(".nav.nav-sidebar"));
			for (var i = 0; i < items.length; i++) {
				groupAux.setItem(items[i]);
			}
		}
		catch (err) {
			if (err.name == "ReferenceError") {
				var groupAux = new ItemGroup(nombre, seccion, peso, "", "", short_abstract, null);
				groupAux.setImpresor(impresorGroup);
				groupAux.setObjDom($(".nav.nav-sidebar"));
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


function loadMapaBaseBing(bingKey, layer, attribution) {
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
