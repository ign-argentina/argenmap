var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;
var argenmap = "";
var mapa = "";

// get all lybraries
gestorMenu.addPlugin("leaflet","https://npmcdn.com/leaflet@1.0.0-rc.2/dist/leaflet.js", function() {
	gestorMenu.addPlugin("leafletAjax",'https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js');
	gestorMenu.addPlugin("betterScale",'https://daniellsu.github.io/leaflet-betterscale/L.Control.BetterScale.js');
	// Awesome Markers
	gestorMenu.addPlugin("AwesomeMarkers","https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js");
	// Leaflet Zoomhome plugin
	gestorMenu.addPlugin("ZoomHome","templates/ign-geoportal-basic/js/leaflet-zoomhome/dist/leaflet.zoomhome.min.js");
	// Leaflet Bing Layer
	gestorMenu.addPlugin("BingLayer","templates/ign-geoportal-basic/js/leaflet-bing-layer-gh-pages/leaflet-bing-layer.js");
	// <!-- Leaflet Minimap plugin -->
	gestorMenu.addPlugin("minimap","templates/ign-geoportal-basic/js/leaflet-minimap/Control.MiniMap.js");
	// <!-- Leaflet Locate plugin -->
	gestorMenu.addPlugin("locate","templates/ign-geoportal-basic/js/leaflet-locate/L.Control.Locate.min.js");
	// <!-- Leaflet Mouse Position plugin -->
	gestorMenu.addPlugin("MousePosition","templates/ign-geoportal-basic/js/leaflet-mouseposition/src/L.Control.MousePosition.js");
	// <!-- Leaflet Measure plugin --> 
	gestorMenu.addPlugin("Measure","templates/ign-geoportal-basic/js/leaflet-measure/leaflet-measure.js");
	// <!-- Leaflet EasyPrint plugin -->
	gestorMenu.addPlugin("EasyPrint","templates/ign-geoportal-basic/js/leaflet-easyPrint/bundle.js");
	// <!-- Leaflet Control.FullScreen plugin -->
	gestorMenu.addPlugin("FullScreen","templates/ign-geoportal-basic/js/leaflet-fullscreen/Control.FullScreen.js");
	// <!-- Leaflet BetterWMS -->
	gestorMenu.addPlugin("betterWMS","templates/ign-geoportal-basic/js/leaflet-wms/leaflet.wms.js");
	// <!-- Leaflet Draw -->  
	//gestorMenu.addPlugin("Draw","templates/ign-geoportal-basic/js/leaflet-draw/src/Leaflet.draw.js", function(){
		//console.log("puedo cargar GeometryUtil, LatLngUtil, LineUtil, polygon.intersect, lineutil.intersect, Polyline.intersect, touchevents, draw.events");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/GeometryUtil.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/LatLngUtil.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/LineUtil.Intersect.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/Polygon.Intersect.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/Polyline.Intersect.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/ext/TouchEvents.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/Leaflet.Draw.Event.js");
		//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/Control.Draw.js", function(){
		  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/DrawToolbar.js");        
		  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/EditToolbar.js", function(){
		    //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/EditToolbar.Edit.js");
		    //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/EditToolbar.Delete.js");
		    //});
		  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/Toolbar.js", function(){
		  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/Tooltip.js");
		  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Feature.js",function(){
		    //console.log("puedo cargar draw.marker");
		    //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Marker.js", function(){
		      /*
		      console.log("puedo cargar draw.circlemarker, draw.Polyline, draw.polygon");
		      $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.CircleMarker.js");
		      $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Polyline.js",function(){
		        $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Polygon.js");
		      });
		      */
		    //});
		//});
	//}); 
	//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.SimpleShape.js", function(){
	  //console.log("puedo cargar Draw rectangle y draw.circle");
	  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Rectangle.js");
	  //$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/draw/handler/Draw.Circle.js");
	//});
	//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.Poly.js");
	/*
	$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.SimpleShape.js", function(){
	  console.log("puedo cargar Edit.rectangle y edit.circlemarker");
	  $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.Rectangle.js");
	  $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.CircleMarker.js",function(){
	    console.log("puedo cargar edit.circle");
	    $.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.Circle.js");
	  });
	});
	*/
	//$.getScript("templates/ign-geoportal-basic/js/leaflet-draw/src/edit/handler/Edit.Marker.js");
	//});

	// <!-- Leaflet SimpleGraticule -->
	gestorMenu.addPlugin("graticula","templates/ign-geoportal-basic/js/leaflet-simplegraticule/L.SimpleGraticule.js");
});

// Add plugins to map when (and if) avaiable
// Mapa base actual de ArgenMap (Geoserver)
$("body").on("pluginLoad", function(event, plugin){
	switch(plugin.pluginName) {
		case 'leaflet':
			argenmap = L.tileLayer('http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
		    tms: true,
		    maxZoom: 17,
		    attribution: atrib_ign
			});

			//Construye el mapa
			mapa = L.map('mapa', {
			    center: [-40, -59],
			    zoom: 4,
			    layers: [argenmap],
				zoomControl: false,
				minZoom: 3,
			    maxZoom: 17
			});
			gestorMenu.plugins['leaflet'].setStatus('visible');
			break;
		case 'ZoomHome':
			// Leaflet Zoomhome plugin https://github.com/torfsen/leaflet.zoomhome
			var zoomHome = L.Control.zoomHome({
				zoomHomeTitle: 'Inicio',
				zoomInTitle: 'Acercarse',
				zoomOutTitle: 'Alejarse'
			});
			zoomHome.addTo(mapa);
			gestorMenu.plugins['ZoomHome'].setStatus('visible');
			break;
		case 'MousePosition':
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
			gestorMenu.plugins['MousePosition'].setStatus('visible');
			break;
		case 'locate':
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
			gestorMenu.plugins['locate'].setStatus('visible');
			break;
		case 'FullScreen':
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
			gestorMenu.plugins['FullScreen'].setStatus('visible');
			break;
		case 'graticula':
			// Leaflet-SimpleGraticule plugin https://github.com/turban/Leaflet.Graticule
			var customGraticule = null;
			L.Control.CustomGraticule = L.Control.extend({
			  onAdd: function (map) {
				var container = L.DomUtil.create('div', 'leaflet-control leaflet-control-customgraticule');
				container.title = 'Cuadrícula';
				
				container.onclick = function() {
					if (customGraticule == null) {
						//drawGrid(mapa.getZoom());
						var options = {
							interval: 10,
							showshowOriginLabel: true,
							labelsFormat: 'dms',
							zoomIntervals: [
								{start: 2, end: 3, interval: 20},
								{start: 4, end: 5, interval: 5},
								{start: 6, end: 6, interval: 3},
								{start: 7, end: 8, interval: 0.8},
								{start: 9, end: 9, interval: 0.5},
								{start: 10, end: 10, interval: 0.2},
								{start: 11, end: 12, interval: 0.08},
								{start: 13, end: 13, interval: 0.02},
								{start: 14, end: 14, interval: 0.01},
								{start: 15, end: 15, interval: 0.008},
								{start: 16, end: 16, interval: 0.004},
								{start: 17, end: 20, interval: 0.001}
							],
							redraw: 'move'
						};
						customGraticule = L.simpleGraticule(options).addTo(mapa);
					} else {
						mapa.removeControl(customGraticule);
						customGraticule = null;
					}
				}
				return container;
			  }
			});
			L.control.customgraticule = function(opts) {
			    return new L.Control.CustomGraticule(opts);
			}
			L.control.customgraticule({ position: 'topleft' }).addTo(mapa);
			gestorMenu.plugins['graticula'].setStatus('visible');
			break;	
		case 'Measure':
			// Leaflet-Measure plugin https://github.com/ljagis/leaflet-measure
			var measureControl = new L.Control.Measure({ position: 'topleft', primaryLengthUnit: 'meters', secondaryLengthUnit: 'kilometers', primaryAreaUnit: 'sqmeters', secondaryAreaUnit: 'hectares' });
			measureControl.addTo(mapa);
			gestorMenu.plugins['Measure'].setStatus('visible');
			break;
		case 'Draw':
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
			gestorMenu.plugins['Draw'].setStatus('visible');
			break;
		case 'minimap':
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
			gestorMenu.plugins['minimap'].setStatus('minimap');
			break;
		case 'betterScale':
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
			gestorMenu.plugins['leaflet'].setStatus('betterScale');
			break;
	}

});
function buildMap(){
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
}

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

function miniMap_Minimize() {
  miniMap._minimize();
}

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
