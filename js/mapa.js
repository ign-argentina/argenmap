var atrib_ign = "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2' target='_blank'>Instituto Geográfico Nacional</a> + <a href='https://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;
var argenmap = "";
var mapa = "";

gestorMenu.addPlugin("leaflet", PLUGINS.leaflet, function() {
	for (const plugin in PLUGINS) {
		if (!app.hasOwnProperty('excluded_plugins') || !app.excluded_plugins.find(excluded_plugin => excluded_plugin === plugin)) {
			gestorMenu.addPlugin(plugin, PLUGINS[plugin]);
		}
	}
});

// Add plugins to map when (and if) avaiable
// Mapa base actual de ArgenMap (Geoserver)
var unordered = '';
var ordered = ['','','','','','','','',''];
var ordenZoomHome = 1; var ordenLocate = 2; var ordenFullScreen = 3; var ordenGraticula = 4; var ordenMeasure = 5; var ordenDraw = 6; var ordenBetterScale = 7; var ordenMinimap = 8; var ordenPrint = 9;
var visiblesActivar = true;
$("body").on("pluginLoad", function(event, plugin){
	unordered = '';
	visiblesActivar = true;
	switch(plugin.pluginName) {
		// Add ordered plugins in order
		case 'leaflet':
			unordered = plugin.pluginName;
			break;
        case 'menuPrinter':
			showMainMenu();
			break;
		case 'ZoomHome':
			ordered.splice(ordenZoomHome, 1, plugin.pluginName);
			break;
		case 'Measure':
			ordered.splice(ordenMeasure, 1, plugin.pluginName);
			break;
        case 'BrowserPrint':
			ordered.splice(ordenPrint, 1, plugin.pluginName);
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
	if(visiblesActivar && gestorMenu.pluginExists('BrowserPrint')) {
		if(gestorMenu.plugins['BrowserPrint'].getStatus() == 'ready' || gestorMenu.plugins['BrowserPrint'].getStatus() == 'fail'){
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
						maxZoom: 21,
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
					        maxZoom: 21,
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

					/* mapa.on('enterFullscreen', function(){
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
					}); */
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
				case 'BrowserPrint':
                    /*
					// Leaflet-Browser-Print plugin https://github.com/Igor-Vladyka/leaflet.browser.print
                    mapa.on("browser-pre-print", function(e){
                        // on print start we already have a print map and we can create new control and add it to the print map to be able to print custom information
                        //console.log(overlayMaps);
                        for (var xxx in overlayMaps) {
                            //overlayMaps[xxx].addTo(mapa);
                            L.Control.BrowserPrint.Utils.registerLayer(
                                overlayMaps[xxx],
                                xxx,
                                function(layer, utils) {
                                    // We need to clone options to properly handle multiple renderers.
                                    return L.tileLayer.wms(layer._url, utils.cloneOptions(layer.options));
                                }
                            );
                        }
                    });
					L.control.browserPrint({
                        title: 'Just print me!',
                        documentTitle: 'Map printed using leaflet.browser.print plugin',
                        printLayer: L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
                                        tms: true,
                                        maxZoom: 21,
                                        attribution: atrib_ign
                                    }),
                        closePopupsOnPrint: false,
                        printModes: [
                            L.control.browserPrint.mode.landscape(),
                            "Portrait",
                            L.control.browserPrint.mode.auto("Automatico", "B4"),
                            L.control.browserPrint.mode.custom("Séléctionnez la zone", "B5")
                        ],
                        manualMode: false
                    }).addTo(mapa);
                    */
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
			argenmap = L.tileLayer('https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{y}.png', {
		    tms: true,
		    maxZoom: DEFAULT_MAX_ZOOM_LEVEL,
		    attribution: atrib_ign
			});

			//Construye el mapa
            if (app.hasOwnProperty('mapConfig')) {
                mapa = L.map('mapa', {
                    center: [app.mapConfig.center.latitude, app.mapConfig.center.longitude],
                    zoom: app.mapConfig.zoom.initial,
                    layers: [argenmap],
                    zoomControl: false,
                    minZoom: app.mapConfig.zoom.min,
                    maxZoom: app.mapConfig.zoom.max
                });
            } else {
                mapa = L.map('mapa', {
                    center: [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
                    zoom: DEFAULT_ZOOM_LEVEL,
                    layers: [argenmap],
                    zoomControl: false,
                    minZoom: DEFAULT_MIN_ZOOM_LEVEL,
                    maxZoom: DEFAULT_MAX_ZOOM_LEVEL
                });
            }

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
            
			mapa.on('click', function(e) {
                setTimeout(function(){
                    popupInfo = new Array();
                }, 2000);
            });
            
            showMainMenuTpl();
            
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

function printFinished() {
    //Agregar tooltip resumen
    $("[data-toggle2='tooltip']").tooltip({
        placement: "right",
        trigger: "hover",
        container: "body"
    });
}

function showMainMenuTpl() {
    //Imprimir menú
    gestorMenu.setMenuDOM(".nav.nav-sidebar");
    gestorMenu.setLoadingDOM(".loading");
    gestorMenu.setPrintCallback(printFinished);
    gestorMenu.setLazyInitialization(true);
	gestorMenu.setShowSearcher(app.hasOwnProperty('showSearchBar') ? app.showSearchBar : false);
    gestorMenu.print();
}

/****** Misc functions ******/
function exportToCSV(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function exportToHTML(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            finalVal += innerValue;
        }
        return finalVal;
    };

    var htmlFile = '<table border="1">';
    for (var i = 0; i < rows.length; i++) {
        htmlFile += processRow(rows[i]);
    }
    htmlFile += '</table>';

    var blob = new Blob([htmlFile], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function getFeatureInfoAsCSV(info) {
    var lines = [];
    
    var lineAux = [];
    lineAux[0] = [];
    lineAux[1] = [];
    $( "#" + info + " li" ).each(function( index ) {
        let sAux = $( this ).text();
        if (sAux != '') {
            aAux = sAux.split(':');
            lineAux[0].push(aAux[0].trim());
            aAux.shift();
            lineAux[1].push(aAux.join(':').trim());
        }
    });
    lines.push(lineAux[0].join(','));
    lines.push(lineAux[1].join(','));
    
    exportToCSV('export.csv', lineAux);
}

function getFeatureInfoAsXLS(info) {
    var lines = [];
    
    var lineAux = [];
    lineAux[0] = [];
    lineAux[1] = [];
    lineAux[0].push('<tr>');
    lineAux[1].push('<tr>');
    $( "#" + info + " li" ).each(function( index ) {
        let sAux = $( this ).text();
        if (sAux != '') {
            aAux = sAux.split(':');
            lineAux[0].push('<td><b>' + aAux[0].trim() + '</b></td>');
            aAux.shift();
            lineAux[1].push('<td>' + aAux.join(':').trim() + '</td>');
        }
    });
    lineAux[0].push('</tr>');
    lineAux[1].push('</tr>');
    lines.push(lineAux[0].join(','));
    lines.push(lineAux[1].join(','));
    
    exportToHTML('export.xls', lineAux);
}

/****** Misc functions ******/
//Capture map click to clear popinfo array before fill it
$('#mapa').on( "click", function() {
  popupInfo = [];
});

/****** Enveloped functions ******/
var popupInfo = new Array(); //Declare popupInfo (this initialize in mapa.js)
var popupInfoToPaginate = new Array();
var popupInfoPage = 0;
var latlngTmp = '';

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

//function loadWmsTpl (wmsUrl, layer) {
function loadWmsTpl (objLayer) {
    wmsUrl = objLayer.capa.host;
    layer = objLayer.nombre;
	if (overlayMaps.hasOwnProperty(layer)) {
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];
    } else {
		//createWmsLayer(wmsUrl, layer);
		let service = objLayer.capa.servicio;
		if (service == "wms") {
			createWmsLayer(objLayer);
		} else if (service == "wmts"){
			createWmtsLayer(objLayer);
		}
		overlayMaps[layer].addTo(mapa);
	}
    
    function ucwords (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //Parse FeatureInfo to display into popup (if info is text/html)
    function parseFeatureInfoHTML(info, idTxt) {
        infoAux = info.search("<ul>"); // search if info has a list
        if (infoAux > 0) { // check if info has any content, if so shows popup
            $(info).find('li').each(function( index ) {
                var aux = $( this ).text().split(':');
                info = info.replace('<b>' + aux[0] + '</b>:', '<b>' + ucwords(aux[0].replace(/_/g, ' ')) + ':</b>');
            });
            
            info = info.replace('class="featureInfo"', 'class="featureInfo" id="featureInfoPopup' + idTxt + '"');
            
            return info;
        } else {
            infoAux = info.search("<table"); // search if info has a table
            if (infoAux > 0) { // check if info has any content, if so shows popup
                //info = info.replace('<table', '<table class="featureInfo" id="featureInfoPopup' + idTxt + '"');
                return '<div class="featureInfo" id="featureInfoPopup' + idTxt + '"><div class="featureGroup"><div style="padding:1em;overflow:scroll-x;overflow-y:hidden" class="individualFeature">' + info + '</div></div></div>';
            }
        }
        
        return '';
    }
    
    //Parse FeatureInfo to display into popup (if info is application/json)
    function parseFeatureInfoJSON(info, idTxt, title) {
        info = JSON.parse(info);
        if (info.features.length > 0) { // check if info has any content, if so shows popup
            
            var infoAux = '<div class="featureInfo" id="featureInfoPopup' + idTxt + '">';
            infoAux += '<div class="featureGroup">';
			infoAux += '<div style="padding:1em;" class="individualFeature">';
            //infoAux += '<div style="padding:1em;overflow-y:scroll;max-height:200px" class="individualFeature">';
            infoAux += '<h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">' + title + '</h4>';
            infoAux += '<ul id="featureInfoPopupUL' + idTxt + '">';
                        
            for (i in info.features) {
                Object.keys(info.features[i].properties).forEach(function(k){
                    if (k != 'bbox') { //Do not show bbox property
                        infoAux += '<li>';
                        infoAux += '<b>' + ucwords(k.replace(/_/g, ' ')) + ':</b>';
                        if (info.features[i].properties[k] != null) {
                            infoAux += ' ' + info.features[i].properties[k];
                        }
                        infoAux += '<li>';
                    }
                });
            }
                        
            infoAux += '</ul>';
            infoAux += '</div></div></div>';
            //infoAux += '</div></div>Descargar como: <a href="javascript:;" onclick="getFeatureInfoAsCSV(\'featureInfoPopupUL' + idTxt + '\')">csv</a> | <a href="javascript:;" onclick="getFeatureInfoAsXLS(\'featureInfoPopupUL' + idTxt + '\')">xls</a></div>';
            
            return infoAux;
        }
        
        return '';
    }
    
    //function createWmsLayer(wmsUrl, layer) {
    function createWmsLayer(objLayer) {
        //Extends WMS.Source to customize popup behavior
        var MySource = L.WMS.Source.extend({
            'showFeatureInfo': function(latlng, info) {
                if (!this._map) {
                    return;
                }
                if (this.options.INFO_FORMAT == 'text/html') {
                    var infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
                } else {
                    var infoParsed = parseFeatureInfoJSON(info, popupInfo.length, this.options.title);
                }
                if (infoParsed != '') { // check if info has any content, if so shows popup
                    var popupContent = $('.leaflet-popup').html();
                    popupInfo.push(infoParsed); //First info for popup
                }
                if (popupInfo.length > 0) {
                    popupInfoToPaginate = popupInfo.slice();
                    latlngTmp = latlng;
                    this._map.openPopup(paginateFeatureInfo(popupInfo, 0, false, true), latlng); //Show all info
                    popupInfoPage = 0;
                }
                return;
            }
        });
        //var wmsSource = new L.WMS.source(wmsUrl + "/wms?", {
        var wmsSource = new MySource(objLayer.capa.getHostWMS(), {
            transparent: true,
            tiled: true,
            maxZoom: 21,
            'title': objLayer.titulo,
            format: 'image/png',
            INFO_FORMAT: objLayer.capa.featureInfoFormat
        });
        overlayMaps[objLayer.nombre] = wmsSource.getLayer(objLayer.capa.nombre);
    }

    function createWmtsLayer(objLayer) {
		// tilematrix, style and format should be set by a method
		let _style = "", _tilematrixSet = "EPSG:3857", _format = "image/png";
		var wmtsSource = new L.TileLayer.WMTS(objLayer.capa.getHostWMS(),
			{
				layer: objLayer.capa.nombre,
				style: _style,
				tilematrixSet: _tilematrixSet,
				format: _format,
				attribution: objLayer.nombre
			}
		);
		overlayMaps[objLayer.nombre] = wmtsSource;
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
		if (baseLayers.hasOwnProperty(layer) && baseLayers[layer].hasOwnProperty('zoom')) {
			const { min, max } = baseLayers[layer].zoom;
			baseMaps[layer] = new L.tileLayer(tmsUrl, {
				attribution: attribution,
				minZoom: min,
				maxZoom: max,
			});
			return;
		}
        baseMaps[layer] = new L.tileLayer(tmsUrl, {
            attribution: attribution
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

//Paginate FeatureInfo into popup
function paginateFeatureInfo(infoArray, actualPage, hasPrev, hasNext) {
    var infoStr = infoArray.join('');
    if (infoArray.length > 1) {
        for (var i = 0; i < infoArray.length; i++) {
            if (i == actualPage) {
                var sAux = '';
                if (hasPrev == true) {
                    sAux += '<a href="javascript:;" onClick="changePopupPage(\'prev\')" id="popupPageSeekerPrev"><i class="fas fa-arrow-left"></i> capa ant.</a>';
                }
                if (hasNext == true) {
                    sAux += '<a href="javascript:;" onClick="changePopupPage(\'next\')" id="popupPageSeekerNext">capa sig.<i class="fas fa-arrow-right"></i></a>';
                }
                infoStr = infoStr.replace('<div class="featureInfo" id="featureInfoPopup' + i + '">', '<div id="popupPageSeeker">' + sAux + '</div><div class="featureInfo" id="featureInfoPopup' + i + '">');
            } else {
                infoStr = infoStr.replace('<div class="featureInfo" id="featureInfoPopup' + i + '">', '<div class="featureInfo" style="display:none" id="featureInfoPopup' + i + '">');
            }
        }
    }
    return infoStr;
}
    
function changePopupPage(changeType) {
    
    var hasNext = false;
    var hasPrev = false;
    if (changeType == 'next') {
        if (popupInfoToPaginate.length > (popupInfoPage + 1)) {
            popupInfoPage = popupInfoPage + 1;
        }
    } else {
        if ((popupInfoPage - 1) >= 0) {
            popupInfoPage = popupInfoPage - 1;
        }
    }
    
    if ((popupInfoPage - 1) >= 0) {
        hasPrev = true;
    }
    if (popupInfoToPaginate.length > (popupInfoPage + 1)) {
        hasNext = true;
    }
    
    mapa.openPopup(paginateFeatureInfo(popupInfoToPaginate, popupInfoPage, hasPrev, hasNext), latlngTmp); //Show all info
}
