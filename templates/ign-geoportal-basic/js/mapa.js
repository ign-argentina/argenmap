var atrib_ign = "<a href='http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/datosdelmapa.html' target='_blank'>Instituto Geográfico Nacional</a> + <a href='http://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;
var argenmap = "";
var mapa = "";

// get all lybraries
gestorMenu.addPlugin("leaflet","https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.4.0/leaflet.js", function() {
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
	gestorMenu.addPlugin("Draw","https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js")
	// <!-- Leaflet SimpleGraticule -->
	gestorMenu.addPlugin("graticula","templates/ign-geoportal-basic/js/leaflet-simplegraticule/L.SimpleGraticule.js");
});

// Add plugins to map when (and if) avaiable
// Mapa base actual de ArgenMap (Geoserver)
var unordered = '';
var ordered = ['','','','','','','','',''];
var ordenZoomHome = 1; var ordenLocate = 2; var ordenFullScreen = 3; var ordenGraticula = 4; var ordenMeasure = 5; var ordenDraw = 6; var ordenBetterScale = 7; var ordenMinimap = 8;
var visiblesActivar = true;
$("body").on("pluginLoad", function(event, plugin){
	unordered = '';
	visiblesActivar = true;
	switch(plugin.pluginName) {
		// Add ordered plugins in order
		case 'leaflet':
			unordered = plugin.pluginName;
			break;
		case 'ZoomHome':
			ordered.splice(ordenZoomHome, 1, plugin.pluginName);
			break;
		case 'Measure':
			ordered.splice(ordenMeasure, 1, plugin.pluginName);
			break;
		case 'graticula':
			ordered.splice(ordenGraticula, 1, plugin.pluginName);
			break;
		case 'minimap':
			ordered.splice(ordenMinimap, 1, plugin.pluginName);
			break;
		case 'betterScale':
			ordered.splice(ordenBetterScale, 1, plugin.pluginName);
			break;
		case 'Draw':
			ordered.splice(ordenDraw, 1, plugin.pluginName);
			break;
		case 'locate':
			ordered.splice(ordenLocate, 1, plugin.pluginName);
			break;
		case 'FullScreen':
			ordered.splice(ordenFullScreen, 1, plugin.pluginName);
			break;
		default :
			// Add unordered plugins
			unordered = plugin.pluginName;
			break;
	}
	// oredered plugins status chek
	if(visiblesActivar && gestorMenu.pluginExists('leaflet')) {
		if(gestorMenu.plugins['leaflet'].getStatus() != 'visible') {
			visiblesActivar = false;
		}
	}
	if(visiblesActivar && gestorMenu.pluginExists('ZoomHome')) {
		if(gestorMenu.plugins['ZoomHome'].getStatus() == 'ready' || gestorMenu.plugins['ZoomHome'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('locate')){
		if(gestorMenu.plugins['locate'].getStatus() == 'ready' || gestorMenu.plugins['locate'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('FullScreen')) {
		if(gestorMenu.plugins['FullScreen'].getStatus() == 'ready' || gestorMenu.plugins['FullScreen'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('graticula')) {
		if(gestorMenu.plugins['graticula'].getStatus() == 'ready' || gestorMenu.plugins['graticula'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('Measure')) {
		if(gestorMenu.plugins['Measure'].getStatus() == 'ready' || gestorMenu.plugins['Measure'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('Draw')) {
		if(gestorMenu.plugins['Draw'].getStatus() == 'ready' || gestorMenu.plugins['Draw'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('betterScale')) {
		if(gestorMenu.plugins['betterScale'].getStatus() == 'ready' || gestorMenu.plugins['betterScale'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar && gestorMenu.pluginExists('minimap')) {
		if(gestorMenu.plugins['minimap'].getStatus() == 'ready' || gestorMenu.plugins['minimap'].getStatus() == 'fail'){
		} else { visiblesActivar = false; }
	}
	if(visiblesActivar){
		ordered.forEach(function(e){
			switch (e) {
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
					gestorMenu.plugins['betterScale'].setStatus('visible');
					break;
				case 'minimap':
					// Leaflet-MiniMap plugin https://github.com/Norkart/Leaflet-MiniMap
					var miniArgenmap = new L.TileLayer(argenmap._url, {
						minZoom: 0,
						maxZoom: 20,
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
					gestorMenu.plugins['minimap'].setStatus('visible');
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
					        maxZoom: 20,
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
				    var drawnItems = L.featureGroup().addTo(mapa);
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
				default:
					break;
			}
		});
	}
	switch(unordered) {
		case 'leaflet':
			argenmap = L.tileLayer('http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
		    tms: true,
		    maxZoom: 20,
		    attribution: atrib_ign
			});

			//Construye el mapa
			mapa = L.map('mapa', {
			    center: [-40, -59],
			    zoom: 4,
			    layers: [argenmap],
				zoomControl: false,
				minZoom: 3,
			    maxZoom: 20
			});
			gestorMenu.plugins['leaflet'].setStatus('visible');

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

			// Complete the basemap selector
            $.getJSON("./js/menu.json", function (data) {
			    $.each(data, function (key, val) {
			        if(key != 'template') {
			            for (var key in data.items) {
			                if (data.items[key].type == "basemap") {
                                
			                    groupAux = new ItemGroupBaseMap(data.items[key].nombre, data.items[key].seccion, data.items[key].peso, "", "", data.items[key].short_abstract, null);
			                    groupAux.setImpresor(impresorBaseMap);
			                    groupAux.setObjDom($(".basemap-selector"));
			                    for (var key2 in data.items[key].capas) {
			                        var capa = new Capa(data.items[key].capas[key2].nombre, data.items[key].capas[key2].titulo, null, data.items[key].capas[key2].host, data.items[key].capas[key2].servicio, data.items[key].capas[key2].version, data.items[key].capas[key2].key, null, null, null, null, data.items[key].capas[key2].attribution);
			                        var item = new Item(capa.nombre, data.items[key].seccion+key2, "", data.items[key].capas[key2].attribution, capa.titulo, capa);
			                        item.setImpresor(impresorItemCapaBase);
			                        //console.log(data.items[key].capas.legendImg);
			                        item.setLegendImg(data.items[key].capas[key2].legendImg);
			                        groupAux.setItem(item);
			                    }
			                    gestorMenu.items.mapasbase.setImpresor(impresorBaseMap);
			                    gestorMenu.items.mapasbase.setObjDom($(".basemap-selector"));
			                    gestorMenu.add(groupAux);
                                
			                }
			            }
                        gestorMenu.imprimir($(".basemap-selector"));
			        }
			    });
			});
            
            mapa.on('click', function(e) {
                setTimeout(function(){
                    popupInfo = new Array();
                }, 2000);
            });

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
		case 'BingLayer':
			if(gestorMenu.pluginExists('BingLayer') && gestorMenu.plugins['leaflet'].getStatus() == 'visible' && gestorMenu.plugins['BingLayer'].getStatus() == 'ready' ){	
				
		        gestorMenu.plugins['BingLayer'].setStatus('visible');
			}
		default:
			break;
	}
});

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
