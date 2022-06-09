var atrib_ign = "<a href='https://www.ign.gob.ar/AreaServicios/Argenmap/IntroduccionV2' target='_blank'>Instituto Geográfico Nacional</a> + <a href='https://www.osm.org/copyright' target='_blank'>OpenStreetMap</a>",
    baseMaps = {},
    overlayMaps = new Object(),
    layerName,
    layerData;
var argenmap = "";
var mapa = "";

let currentBaseMap = null;

let countour_styles = false;

gestorMenu.addPlugin("leaflet", PLUGINS.leaflet, function() {
	for (const plugin in PLUGINS) {
		if (!app.hasOwnProperty('excluded_plugins') || !app.excluded_plugins.find(excluded_plugin => excluded_plugin === plugin)) {
			gestorMenu.addPlugin(plugin, PLUGINS[plugin]);
		}
	}
});

const onClickAllActiveLayers = () => {
	const inputs = Array.from(document.getElementById('activeLayers').getElementsByTagName('input'));
	inputs[0].checked = !inputs[0].checked;
	if (inputs.length > 1) {
		inputs.slice(1, inputs.length).forEach(input => {
			input.checked = inputs[0].checked;
		});
	}
};

const onClickActiveLayer = (activeLayer) => {
	const inputElement = document.getElementById(activeLayer);
	inputElement.checked = !inputElement.checked;
};

const changeMarkerStyles = (layer, borderWidth, borderColor, fillColor) => {
	mapa.setIconToMarker(layer, borderColor, fillColor, borderWidth);
	layer.options.borderWidth = borderWidth;
	layer.options.borderColor = borderColor;
	layer.options.fillColor = fillColor;
};

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
						zoomOutTitle: 'Alejarse',
						homeCoordinates: [app.mapConfig.center.latitude, app.mapConfig.center.longitude],
						homeZoom: app.mapConfig.zoom.initial
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
               		break;
				case 'Draw':

					/* calcular limites de area */

				    var orgReadbleDistance = L.GeometryUtil.readableArea;
					
					L.GeometryUtil.readableArea = function (area, isMetric, precision) {
						if (L.GeometryUtil.formattedNumber(area / 100000, 2)>100) {
							console.log('%cSUPERASTE LOS 100 KM2', 'color: white; background: red; font-size: 30px');
						}else{
							console.log('%cKM2 CORRECTO!', 'color: white; background: green; font-size: 30px');
						}
						return L.GeometryUtil.formattedNumber(area / 100000, 2) + ' Km2';
						
					};

					

					L.GeometryUtil.readableDistance = function (distance, isMetric, precision) {

					
					  distance *= 1.09361;
					  console.log(distance)
					    if (distance > 1760) {
					        return L.GeometryUtil.formattedNumber(distance / 1760, 2) + ' millas';
					    } else {
					        return L.GeometryUtil.formattedNumber(distance * 3, 0) + ' ft';
					    }
					};
	

					/* calcular limites de area */

				    drawnItems = L.featureGroup().addTo(mapa);

					mapa.editableLayers = {
						marker: [],
						circle: [],
						circlemarker: [],
						rectangle: [],
						polygon: [],
						polyline: []
					};
					
					mapa.groupLayers = {};


				
				

					var drawControl = new L.Control.Draw({
						edit: {
							featureGroup: drawnItems,
							poly: {
								allowIntersection: true
							}
						},
						draw: {
							polygon: {metric: false,feet: true},
							circlemarker: {metric: false,feet: true},
					        polyline: {metric: false,feet: true},
					        circle:{metric: false,feet: true},
					        rectangle: {metric: true,feet: true}
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


				

					mapa.on('draw:drawstart', (e) => {

					currentlyDrawing = true;

					});
					
					mapa.on('draw:editstart', (e) => {
						currentlyDrawing = true;
						
					});

					 
				

					mapa.on('draw:created', (e) => {
						const layer = e.layer;
						const type = e.layerType;

						

						
						let name = type + '_';
						if (mapa.editableLayers[type].length === 0) {
							name += '1';
						} else {
							const lastLayerName = mapa.editableLayers[type][mapa.editableLayers[type].length - 1].name;
							name += parseInt(lastLayerName.split('_')[1]) + 1;
						}
						
						layer.name = name;
						layer.type = type;
						layer.data = {};
						layer.options.fillColor = !layer.options.fillColor ? layer.options.color : layer.options.fillColor;

						layer.getGeoJSON = () => {
							return mapa.getLayerGeoJSON(layer.name);
						}

						layer.downloadGeoJSON = () => {
							mapa.downloadLayerGeoJSON(layer);
						}

						mapa.editableLayers[type].push(layer);



						drawnItems.addLayer(layer);

						mapa.methodsEvents['add-layer'].forEach(method => method(mapa.editableLayers));
						
						if (layer.type === 'marker') {
							//Default marker styles
							layer.options.borderWidth = DEFAULT_MARKER_STYLES.borderWidth;
							layer.options.borderColor = DEFAULT_MARKER_STYLES.borderColor;
							layer.options.fillColor = DEFAULT_MARKER_STYLES.fillColor;
						}

						if (layer.type !== 'marker' && layer.type !== 'circlemarker' && layer.type !== 'polyline') {
							mapa.addSelectionLayersMenuToLayer(layer);
						}
						mapa.addContextMenuToLayer(layer);
					});

					mapa.on('draw:edited', (e) => {



						var layers = e.layers;
						//Each layer recently edited..
						layers.eachLayer(function (layer) {
							//mapa.checkLayersInDrawedGeometry(layer, type);
						});
					});

					mapa.on('draw:deleted', function (e) {
						var layers = e.layers;
						Object.values(layers._layers).forEach(deletedLayer => {
							const lyrIdx = mapa.editableLayers[deletedLayer.type].findIndex(lyr => lyr.name = deletedLayer.name);
							if (lyrIdx >= 0)
								mapa.editableLayers[deletedLayer.type].splice(lyrIdx, 1);
								deleteLayerFromMenu(deletedLayer);
							// //Delete from groups
							// for (const group in mapa.groupLayers) {
							// 	const lyrInGrpIdx = mapa.groupLayers[group].findIndex(lyr => lyr = deletedLayer.name);
							// 	if (lyrInGrpIdx >= 0) {
							// 		mapa.groupLayers[group].splice(lyrInGrpIdx, 1);
							// 		deleteLayerFromMenu(deletedLayer);
							// 		console.log("t2")

							// 		if (mapa.groupLayers[group].length === 0)
							// 			delete mapa.groupLayers[group];
							// 			console.log("t3")
							// 	}
							// }
						})
						mapa.methodsEvents['delete-layer'].forEach(method => method(mapa.editableLayers));
					});

					deleteLayerFromMenu = (deletedLayer) => {// Delete layers entries from menu if exists
						Object.entries(mapa.groupLayers).forEach(([k, v]) => {
							v.forEach(e => {
								if(e === deletedLayer.name) {
									deleteLayerGeometry(k,true)
								}
							});
						});
					}

					mapa.on('draw:drawstop', (e) => {
						setTimeout(() => {
							currentlyDrawing = false;
						}, 300);
					});

					mapa.on('draw:editstop', (e) => {
						currentlyDrawing = false;
					});

					
					mapa.on('zoomend', (e) => {
						let contextPopup = null;
						const contextMenu = new ContextMenu();
						mapa.closePopup(contextPopup);
						$(".context-quehay").slideUp();
					});

					mapa.on('dragend', (e) => {
						let contextPopup = null;
						const contextMenu = new ContextMenu();
						mapa.closePopup(contextPopup);
						$(".context-quehay").slideUp();
					});


					

					mapa.on('contextmenu', (e) => {
						
						var capa = "";
						$.each(mapa._layers, function (ml) {
							$.each(mapa._layers[ml], function (v) {
								if (mapa._layers[ml]._url!=undefined) {
									capa = mapa._layers[ml]._url;
								}
								 
						   	})
						 })
						

						var zoom = e.target._zoom;
						var count = 0;
						
						var imagen = ""
						$.each(e.target._zoomBoundLayers,function(clave,valor){
							$.each(valor._tiles,function(key,value){
								if (count==0) {
									
									imagen = value.el.currentSrc;
								}
								count++;
							});
						});


						let contextPopup = null;
						const contextMenu = new ContextMenu();

						const lng = e.latlng.lng.toFixed(5);
						const lat = e.latlng.lat.toFixed(5);

						

						contextMenu.createOption({
							isDisabled: false,
							text: `<div title="Copiar" style="cursor: default"><span><b id="copycoords" class="non-selectable-text">${lat}, ${lng}</b></span> <i class="far fa-copy" aria-hidden="true"></i></div>`,
							onclick: (option) => {
								mapa.closePopup(contextPopup);
								copytoClipboard(`${lat}, ${lng}`);
							}
						});

						contextMenu.createOption({
							isDisabled: false,
							text: 'Mas información',
							onclick: (option) => {
								mapa.closePopup(contextPopup);	
									
									 $("#search_bar").val(lat+","+lng).focus();


									   
																              
							}
						});
						
						contextMenu.createOption({
							isDisabled: false,
							text: 'Agregar marcador',
							onclick: (option) => {
								let geojsonMarker = {
									type: "Feature",
									properties: {
									},
									geometry: { type: "Point", coordinates: [lng,lat]},
								}
								mapa.addGeoJsonLayerToDrawedLayers(geojsonMarker , "geojsonMarker", false)
								mapa.closePopup(contextPopup);
							}
						});

							if (gestorMenu.getActiveBasemap() === "esri_imagery") {
								contextMenu.createOption({
									isDisabled: false,
									text: 'Datos de imagen satelital',
									onclick: (option) => {
										mapa.closePopup(contextPopup);
										let imagenDato = '<div><span style="cursor: pointer;font-size: 20px;right: 20px;position: absolute;top: 10px;" onclick="$(\'.context-imagen\').slideUp()"><i class="fa fa-window-close" aria-hidden="true"></i></span>No existen datos a este nivel de zoom</div>',
										imgData = new Fechaimagen(lat,lng,zoom).area;
										if (imgData!="") {
											//let mdTable = `Fecha: ${imgData.date}<br>Resolución espacial: ${imgData.resolution} m<br>Exactitud: ${imgData.accuracy} m<br>Sensor: ${imgData.sensor}<br>Proveedor: ${imgData.provider}<br>Producto: ${imgData.product}`;
											let mdTable = `<table id="md-table" style="width: 300px;text-align:left;" align="left"><tr><td>Fecha</td><td>${imgData.date}</td></tr><tr><td title="Relación de metros por lado de pixel">Resolución espacial</td><td>${imgData.resolution} m</td></tr><tr><td>Exactitud</td><td>${imgData.accuracy} m</td></tr><tr><td title="Misión aérea o constelación satelital">Sensor</td><td>${imgData.sensor}</td></tr><tr><td>Proveedor</td><td>${imgData.provider}</td></tr><tr><td>Producto</td><td>${imgData.product}</td></tr><tr><td>Zoom mínimo</td><td>${imgData.minZoom}</td></tr><tr><td>Zoom máximo</td><td>${imgData.maxZoom}</td></tr></table>`;
											imagenDato = `<div><a onclick="copytoClipboard(\'Imagen satelital tomada el ${imgData.date}. Una resolución espacial de ${imgData.resolution} m. La Exactitud es de ${imgData.accuracy} m y el sensor es ${imgData.sensor_texto}. El proveedor es ${imgData.provider_texto} y el producto ${imgData.product} \');" href="#" style="position: absolute;top: 18px;left: 22px;"><i class="far fa-copy" aria-hidden="true"></i> Copiar datos</a><span style="cursor: pointer;font-size: 20px;right: 20px;position: absolute;top: 10px;" onclick="$(\'.context-imagen\').slideUp()"><i class="fa fa-window-close" aria-hidden="true"></i></span><!--<center><b>Metadatos del fondo</b></center><br>-->${mdTable}<hr></div>`;
										}

										$(".context-imagen").slideDown();
										$(".context-imagen").html(imagenDato);
										
										
									}
								});
							}

						contextPopup = L.popup({ closeButton: false, className: 'context-popup' })
						.setLatLng(e.latlng)
						.setContent(contextMenu.menu);
						mapa.openPopup(contextPopup);
					});

					mapa.addMethodToEvent = (method, event) => {
						mapa.methodsEvents[event].push(method);
					};

					mapa.addSelectionLayersMenuToLayer = (layer,file) => {
						if (file==undefined || !file) {
							const popUpDiv = mapa.createPopUp(layer);
							layer.bindPopup(popUpDiv);
	
							layer.on('click', (e) => {
								const layer = e.target;
								const popUpDiv = mapa.createPopUp(mapa.editableLayers[layer.type].find(lyr => lyr.name === layer.name));
								layer.bindPopup(popUpDiv);
							});
						}else {
							const popUpDiv = mapa.createPopUp(layer);
							layer.bindPopup(popUpDiv);
	
							layer.on('click', (e) => {
								const layer = e.target;
								const popUpDiv = mapa.createPopUp(mapa.editableLayers[layer.type].find(lyr => lyr.name === layer.name));
								layer.bindPopup(popUpDiv);
							});

						}
					}

					mapa.centerLayer = (layer) => {
						if (!layer) {
							return new UserMessage('La capa ya no se encuentra disponible.', true, 'error');;
						}
						//console.log(layer)
						let bbox = turf.bbox(layer);
						mapa.fitBounds([[bbox[1],bbox[0]],[bbox[3],bbox[2]]]);
					

						// if (layer.type === 'marker' || layer.type === 'circlemarker') {
						// 	mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
						// } else {
						// 	mapa.fitBounds(layer.getBounds());
						// }
					}

					mapa.addContextMenuToLayer = (layer) => {
						let contextPopup = null;

						const editStylePopup = L.popup({ closeButton: false, className: 'edit-style-popup' });
						const editStylePopupContent = mapa.createEditStylePopup(layer, editStylePopup);

						const contextMenu = new ContextMenu();

						contextMenu.createOption({
							isDisabled: true,
							text: 'Ver información',
							onclick: (option) => {
								if (!option.disabled) {
									mapa.closePopup(contextPopup);
								}
							}
						});

						contextMenu.createOption({
							isDisabled: false,
							text: 'Editar estilos',
							onclick: (option) => {
								mapa.closePopup(contextPopup);
								editStylePopup.setContent(editStylePopupContent)
								.setLatLng(layer.type !== 'marker' && layer.type !== 'circlemarker' ? layer.getBounds().getCenter() : layer.getLatLng())
								mapa.openPopup(editStylePopup);
								//
								const parent = editStylePopupContent.parentElement;
								parent.className = 'leaflet-popup-content popup-parent';
							}
						});
						
						contextMenu.createOption({
							isDisabled: false,
							text: 'Acercar',
							onclick: (option) => {
								mapa.closePopup(contextPopup);
								if (layer.type === 'marker' || layer.type === 'circlemarker') {
									mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
								} else {
									mapa.fitBounds(layer.getBounds());
								}
							}
						});

						contextMenu.createOption({
							isDisabled: true,
							text: 'Ocultar geometría',
							onclick: (option) => {
								if (!option.disabled) {
									mapa.closePopup(contextPopup);
									mapa.hideLayer(layer.name);
								}
							}
						});
						
						contextMenu.createOption({
							isDisabled: false,
							text: 'Descargar geometría',
							onclick: (option) => {
								mapa.closePopup(contextPopup);
								layer.downloadGeoJSON();
							}
						});
						
						contextMenu.createOption({
							isDisabled: false,
							text: 'Eliminar geometría',
							onclick: (option) => {
								mapa.closePopup(contextPopup);
								mapa.deleteLayer(layer.name);
							}
						});

						layer.on('contextmenu', (e) => {
							contextPopup = L.popup({ closeButton: false, className: 'context-popup' })
							.setLatLng(e.latlng)
							.setContent(contextMenu.menu);
							mapa.openPopup(contextPopup);
							L.DomEvent.stopPropagation(e);
						});

						L.DomEvent.on(contextMenu, 'click', function (e) {
							L.DomEvent.stopPropagation(e);
						});

						L.DomEvent.on(editStylePopup, 'click', function (e) {
							L.DomEvent.stopPropagation(e);
						});
					}

					mapa.createEditStylePopup = (layer, popup) => {
						const container = document.createElement('div');
						container.className = 'edit-style-popup-container';

						const closeBtn = document.createElement('a');
						closeBtn.innerHTML = '<a class="leaflet-popup-close-button" href="#" style="outline: none;">×</a>';
						closeBtn.onclick = () => {
							mapa.closePopup(popup);
						};
						container.appendChild(closeBtn);

						//-Lines
						const lineSection = document.createElement('div');
						lineSection.className = 'section-popup';

						//Title
						const title = document.createElement('p');
						title.className = 'section-title non-selectable-text';
						title.textContent = 'Línea';
						lineSection.appendChild(title);

						//Opacity
						const opacityInputDiv1 = document.createElement('div');
						opacityInputDiv1.className = 'section-item';
						const opacityInput1 = document.createElement('input');
						opacityInput1.className = 'section-item-input';
						opacityInput1.id = 'opacity-input-1';
						opacityInput1.type = 'range';
						opacityInput1.min = 0;
						opacityInput1.max = 1;
						opacityInput1.step = 0.01;
						opacityInput1.value = layer.options.opacity;
						opacityInput1.addEventListener("change", (e) => {
							layer.setStyle({ opacity: opacityInput1.value });
						});
						opacityInput1.addEventListener("input", (e) => {
							layer.setStyle({ opacity: opacityInput1.value });
						});
						const opacityLabel1 = document.createElement('label');
						opacityLabel1.setAttribute('for', 'opacity-input-1');
						opacityLabel1.className = 'non-selectable-text';
						opacityLabel1.innerHTML = 'Opacidad';
						opacityInputDiv1.appendChild(opacityLabel1);
						opacityInputDiv1.appendChild(opacityInput1);
						lineSection.appendChild(opacityInputDiv1);

						//Weight
						const weightInputDiv = document.createElement('div');
						weightInputDiv.className = 'section-item';
						const weightInput = document.createElement('input');
						weightInput.className = 'section-item-input';
						weightInput.id = 'weight-input';
						weightInput.type = 'range';
						weightInput.min = 0;
						weightInput.max = 10;
						weightInput.step = 1;
						weightInput.value = layer.options.weight;
						weightInput.addEventListener("change", (e) => {
							layer.setStyle({
								weight: weightInput.value,
								opacity: opacityInput1.value,
								fillOpacity: opacityInput2.value
							});
						});
						weightInput.addEventListener("input", (e) => {
							layer.setStyle({
								weight: weightInput.value,
								opacity: opacityInput1.value,
								fillOpacity: opacityInput2.value
							});
						});
						const weightLabel = document.createElement('label');
						weightLabel.setAttribute('for', 'weight-input');
						weightLabel.className = 'non-selectable-text';
						weightLabel.innerHTML = 'Grosor';
						weightInputDiv.appendChild(weightLabel);
						weightInputDiv.appendChild(weightInput);
						lineSection.appendChild(weightInputDiv);

						//Dash
						const dashArrayInputDiv = document.createElement('div');
						dashArrayInputDiv.className = 'section-item';
						const dashArrayInput = document.createElement('input');
						dashArrayInput.className = 'section-item-input';
						dashArrayInput.id = 'dash-input';
						dashArrayInput.type = 'range';
						dashArrayInput.min = 0;
						dashArrayInput.max = 50;
						dashArrayInput.step = 1;
						dashArrayInput.value = layer.options.dashArray ? layer.options.dashArray : 0;
						dashArrayInput.addEventListener("change", (e) => {
							layer.setStyle({
								dashArray: dashArrayInput.value
							});
						});
						dashArrayInput.addEventListener("input", (e) => {
							layer.setStyle({
								dashArray: dashArrayInput.value
							});
						});
						const dashLabel = document.createElement('label');
						dashLabel.setAttribute('for', 'dash-input');
						dashLabel.innerHTML = 'Discontinuidad';
						dashArrayInputDiv.appendChild(dashLabel);
						dashArrayInputDiv.appendChild(dashArrayInput);
						lineSection.appendChild(dashArrayInputDiv);

						//Join
						const joinSelectDiv = document.createElement('div');
						joinSelectDiv.className = 'section-item';
						const joinSelect = document.createElement('select');
						joinSelect.className = 'section-item-input';
						joinSelect.id = "join-select";
						const joinOptions = ['round', 'bevel', 'miter', 'miter-clip'];
						joinOptions.forEach(optionName => {
							const option = document.createElement("option");
							option.value = optionName;
							option.text = optionName;
							option.selected = layer.lineJoin === optionName;
							joinSelect.appendChild(option);
						});
						joinSelect.addEventListener("change", (e) => {
							layer.setStyle({
								lineJoin: joinSelect.value
							});
						});
						const joinLabel = document.createElement('label');
						joinLabel.setAttribute('for', 'join-select');
						joinLabel.innerHTML = 'Unión';
						joinSelectDiv.appendChild(joinLabel);
						joinSelectDiv.appendChild(joinSelect);
						//Should be visible if geometry only is rectangle, polygon or polyline
						if (layer.type === 'rectangle' || layer.type === 'polygon' || layer.type === 'polyline') {
							lineSection.appendChild(joinSelectDiv);
						}

						//Cap
						const capSelectDiv = document.createElement('div');
						capSelectDiv.className = 'section-item';
						const capSelect = document.createElement('select');
						capSelect.className = 'section-item-input';
						capSelect.id = "cap-select";
						const capOptions = ['round', 'butt', 'square'];
						capOptions.forEach(optionName => {
							const option = document.createElement("option");
							option.value = optionName;
							option.text = optionName;
							option.selected = layer.lineCap === optionName;
							capSelect.appendChild(option);
						});
						capSelect.addEventListener("change", (e) => {
							layer.setStyle({
								lineCap: capSelect.value
							});
						});
						const capLabel = document.createElement('label');
						capLabel.setAttribute('for', 'cap-select');
						capLabel.innerHTML = 'Terminación';
						capSelectDiv.appendChild(capLabel);
						capSelectDiv.appendChild(capSelect);
						//Should be visible if geometry only is polyline
						if (layer.type === 'polyline')
							lineSection.appendChild(capSelectDiv);

						//Color
						const colorInputDiv1 = document.createElement('div');
						colorInputDiv1.className = 'section-item';
						const colorInput1 = document.createElement('input');
						colorInput1.className = 'section-item-input';
						colorInput1.id = 'color-input-1';
						colorInput1.type = 'color';
						colorInput1.value = layer.options.color;
						colorInput1.addEventListener("change", (e) => {
							layer.setStyle({ color: colorInput1.value });
						});
						colorInput1.addEventListener("input", (e) => {
							layer.setStyle({ color: colorInput1.value });
						});
						const colorLabel1 = document.createElement('label');
						colorLabel1.setAttribute('for', 'color-input-1');
						colorLabel1.innerHTML = 'Color';
						colorInputDiv1.appendChild(colorLabel1);
						colorInputDiv1.appendChild(colorInput1);
						lineSection.appendChild(colorInputDiv1);

						//-Fill
						const fillSection = document.createElement('div');
						fillSection.className = 'section-popup';

						//Title
						const title2 = document.createElement('p');
						title2.className = 'section-title';
						title2.textContent = 'Relleno';
						fillSection.appendChild(title2);

						//Color
						const colorInputDiv2 = document.createElement('div');
						colorInputDiv2.className = 'section-item';
						const colorInput2 = document.createElement('input');
						colorInput2.className = 'section-item-input';
						colorInput2.id = 'color-input-2';
						colorInput2.type = 'color';
						colorInput2.value = layer.options.fillColor ? layer.options.fillColor : layer.options.color;
						colorInput2.addEventListener("change", (e) => {
							layer.setStyle({ fillColor: colorInput2.value });
						});
						colorInput2.addEventListener("input", (e) => {
							layer.setStyle({ fillColor: colorInput2.value });
						});
						const colorLabel2 = document.createElement('label');
						colorLabel2.setAttribute('for', 'color-input-2');
						colorLabel2.innerHTML = 'Color';
						colorInputDiv2.appendChild(colorLabel2);
						colorInputDiv2.appendChild(colorInput2);
						fillSection.appendChild(colorInputDiv2);

						//Opacity
						const opacityInputDiv2 = document.createElement('div');
						opacityInputDiv2.className = 'section-item';
						const opacityInput2 = document.createElement('input');
						opacityInput2.className = 'section-item-input';
						opacityInput2.id = 'opacity-input-2';
						opacityInput2.type = 'range';
						opacityInput2.min = 0;
						opacityInput2.max = 1;
						opacityInput2.step = 0.01;
						opacityInput2.value = layer.options.fillOpacity;
						opacityInput2.addEventListener("change", (e) => {
							layer.setStyle({ fillOpacity: opacityInput2.value });
						});
						opacityInput2.addEventListener("input", (e) => {
							layer.setStyle({ fillOpacity: opacityInput2.value });
						});
						const opacityLabel2 = document.createElement('label');
						opacityLabel2.setAttribute('for', 'opacity-input-2');
						opacityLabel2.innerHTML = 'Opacidad';
						opacityInputDiv2.appendChild(opacityLabel2);
						opacityInputDiv2.appendChild(opacityInput2);
						fillSection.appendChild(opacityInputDiv2);

						//-Circle
						const circleSection = document.createElement('div');
						circleSection.className = 'section-popup';

						//Title
						const title3 = document.createElement('p');
						title3.className = 'section-title';
						title3.textContent = 'Círculo';
						circleSection.appendChild(title3);

						const radiusInputDiv = document.createElement('div');
						radiusInputDiv.className = 'section-item';
						const radiusInput = document.createElement('input');
						radiusInput.className = 'section-item-input';
						radiusInput.id = 'radius-input';
						radiusInput.type = 'range';
						radiusInput.min = 1;
						radiusInput.max = 1250000;
						radiusInput.step = 0.1;
						radiusInput.value = layer.options.radius;
						radiusInput.addEventListener("change", (e) => {
							layer.setRadius(radiusInput.value);
						});
						radiusInput.addEventListener("input", (e) => {
							layer.setRadius(radiusInput.value);
						});
						const radiusLabel = document.createElement('label');
						radiusLabel.setAttribute('for', 'radius-input');
						radiusLabel.innerHTML = 'Radio';
						radiusInputDiv.appendChild(radiusLabel);
						radiusInputDiv.appendChild(radiusInput);
						circleSection.appendChild(radiusInputDiv);

						//-Marker
						const markerSection = document.createElement('div');
						markerSection.className = 'section-popup';
						
						if (layer.type === 'marker') {

							//Title
							const title4 = document.createElement('p');
							title4.className = 'section-title';
							title4.textContent = 'Marcador';
							markerSection.appendChild(title4);

							//Enable
							const enableMarkerInputDiv = document.createElement('div');
							enableMarkerInputDiv.className = 'section-item';
							const enableMarkerInput = document.createElement('input');
							enableMarkerInput.className = 'section-item-input';
							enableMarkerInput.id = 'enable-marker-input';
							enableMarkerInput.type = 'checkbox';
							enableMarkerInput.checked = layer.options.hasOwnProperty('customMarker');
							enableMarkerInput.addEventListener("change", (e) => {
								weightInput2.disabled = !enableMarkerInput.checked;
								colorInput3.disabled = !enableMarkerInput.checked;
								colorInput4.disabled = !enableMarkerInput.checked;
								downloadBtn1.classList.add(enableMarkerInput.checked ? 'download-btn-active' : 'download-btn-disable');
								downloadBtn1.classList.remove(enableMarkerInput.checked ? 'download-btn-disable' : 'download-btn-active');
								downloadBtn2.classList.add(enableMarkerInput.checked ? 'download-btn-active' : 'download-btn-disable');
								downloadBtn2.classList.remove(enableMarkerInput.checked ? 'download-btn-disable' : 'download-btn-active');
								if (!enableMarkerInput.checked) {
									layer.setIcon(new L.Icon.Default);
								} else {
									const weight = weightInput2.value;
									const borderColor = colorInput3.value;
									const fillColor = colorInput4.value;
									mapa.setIconToMarker(layer, borderColor, fillColor, weight);
								}
							});
							const enableMarkerLabel = document.createElement('label');
							enableMarkerLabel.setAttribute('for', 'enable-marker-input');
							enableMarkerLabel.innerHTML = 'Personalizado';
							enableMarkerInputDiv.appendChild(enableMarkerLabel);
							enableMarkerInputDiv.appendChild(enableMarkerInput);
							markerSection.appendChild(enableMarkerInputDiv);

							//Opacity
							const opacityInputDiv3 = document.createElement('div');
							opacityInputDiv3.className = 'section-item';
							const opacityInput3 = document.createElement('input');
							opacityInput3.className = 'section-item-input';
							opacityInput3.id = 'opacity-input-3';
							opacityInput3.type = 'range';
							opacityInput3.min = 0;
							opacityInput3.max = 1;
							opacityInput3.step = 0.01;
							opacityInput3.value = layer.options.opacity;
							opacityInput3.addEventListener("change", (e) => {
								layer.setOpacity(opacityInput3.value);
							});
							opacityInput3.addEventListener("input", (e) => {
								layer.setOpacity(opacityInput3.value);
							});
							const opacityLabel3 = document.createElement('label');
							opacityLabel3.setAttribute('for', 'opacity-input-3');
							opacityLabel3.innerHTML = 'Opacidad';
							opacityInputDiv3.appendChild(opacityLabel3);
							opacityInputDiv3.appendChild(opacityInput3);
							markerSection.appendChild(opacityInputDiv3);

							//Weight
							const weightInputDiv2 = document.createElement('div');
							weightInputDiv2.className = 'section-item';
							const weightInput2 = document.createElement('input');
							weightInput2.className = 'section-item-input';
							weightInput2.id = 'weight-input-2';
							weightInput2.type = 'range';
							weightInput2.min = 0;
							weightInput2.max = 3.2;
							weightInput2.step = 0.1;
							weightInput2.value = layer.options.borderWidth;
							weightInput2.disabled = !enableMarkerInput.checked;
							weightInput2.addEventListener("change", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							weightInput2.addEventListener("input", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							const weightLabel2 = document.createElement('label');
							weightLabel2.setAttribute('for', 'weight-input-2');
							weightLabel2.className = 'non-selectable-text';
							weightLabel2.innerHTML = 'Anchura del borde';
							weightInputDiv2.appendChild(weightLabel2);
							weightInputDiv2.appendChild(weightInput2);
							markerSection.appendChild(weightInputDiv2);

							//Color
							const colorInputDiv3 = document.createElement('div');
							colorInputDiv3.className = 'section-item';
							const colorInput3 = document.createElement('input');
							colorInput3.className = 'section-item-input';
							colorInput3.id = 'color-input-3';
							colorInput3.type = 'color';
							colorInput3.value = layer.options.borderColor;
							colorInput3.disabled = !enableMarkerInput.checked;
							colorInput3.addEventListener("change", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							colorInput3.addEventListener("input", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							const colorLabel3 = document.createElement('label');
							colorLabel3.setAttribute('for', 'color-input-3');
							colorLabel3.innerHTML = 'Color del borde';
							colorInputDiv3.appendChild(colorLabel3);
							colorInputDiv3.appendChild(colorInput3);
							markerSection.appendChild(colorInputDiv3);

							//Color
							const colorInputDiv4 = document.createElement('div');
							colorInputDiv4.className = 'section-item';
							const colorInput4 = document.createElement('input');
							colorInput4.className = 'section-item-input';
							colorInput4.id = 'color-input-4';
							colorInput4.type = 'color';
							colorInput4.value = layer.options.fillColor;
							colorInput4.disabled = !enableMarkerInput.checked;
							colorInput4.addEventListener("change", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							colorInput4.addEventListener("input", (e) => {
								const weight = weightInput2.value;
								const borderColor = colorInput3.value;
								const fillColor = colorInput4.value;
								changeMarkerStyles(layer, weight, borderColor, fillColor);
							});
							const colorLabel4 = document.createElement('label');
							colorLabel4.setAttribute('for', 'color-input-4');
							colorLabel4.innerHTML = 'Color del relleno';
							colorInputDiv4.appendChild(colorLabel4);
							colorInputDiv4.appendChild(colorInput4);
							markerSection.appendChild(colorInputDiv4);

							//Download
							const downloadDiv = document.createElement('div');
							downloadDiv.className = 'section-item';
							
							const downloadTitle = document.createElement('label');
							downloadTitle.className = '';
							downloadTitle.innerHTML = 'Descargar como';

							const downloadBtnsDiv = document.createElement('div');
							downloadBtnsDiv.className = 'download-item';

							const downloadBtn1 = document.createElement('div');
							downloadBtn1.className = 'popup-btn download-btn';
							downloadBtn1.innerHTML = '<p class="non-selectable-text" style="font-weight: bold; margin: 0;">SVG</p>';
							downloadBtn1.onclick = () => {
								if (enableMarkerInput.checked) {
									const weight = weightInput2.value;
									const borderColor = colorInput3.value;
									const fillColor = colorInput4.value;
									mapa.downloadMarker('svg', borderColor, fillColor, weight);
								}
							};
							downloadBtnsDiv.appendChild(downloadBtn1);

							const downloadBtn2 = document.createElement('div');
							downloadBtn2.className = 'popup-btn download-btn';
							downloadBtn2.innerHTML = '<p class="non-selectable-text" style="font-weight: bold; margin: 0;">PNG</p>';
							downloadBtn2.onclick = () => {
								if (enableMarkerInput.checked) {
									const weight = weightInput2.value;
									const borderColor = colorInput3.value;
									const fillColor = colorInput4.value;
									mapa.downloadMarker('png', borderColor, fillColor, weight);
								}
							};
							downloadBtnsDiv.appendChild(downloadBtn2);

							downloadBtn1.classList.add(enableMarkerInput.checked ? 'download-btn-active' : 'download-btn-disable');
							downloadBtn1.classList.remove(enableMarkerInput.checked ? 'download-btn-disable' : 'download-btn-active');
							downloadBtn2.classList.add(enableMarkerInput.checked ? 'download-btn-active' : 'download-btn-disable');
							downloadBtn2.classList.remove(enableMarkerInput.checked ? 'download-btn-disable' : 'download-btn-active');

							downloadDiv.appendChild(downloadTitle);
							downloadDiv.appendChild(downloadBtnsDiv);
							markerSection.appendChild(downloadDiv);
						}
						

						switch (layer.type) {
							case 'marker': {
								container.appendChild(markerSection);
								container.style.height = '240px';
							}
							break;
							case 'circlemarker': {
								container.appendChild(lineSection);
								container.appendChild(fillSection);
								container.style.height = '270px';
							}
							break;
							case 'circle': {
								container.appendChild(lineSection);
								container.appendChild(fillSection);
								container.appendChild(circleSection);
								container.style.height = '370px';
							}
							break;
							case 'polyline': {
								container.appendChild(lineSection);
								container.style.height = '240px';
							}
							break;
							case 'polygon': {
								container.appendChild(lineSection);
								container.appendChild(fillSection);
								container.style.height = '330px';
							}
							break;
							case 'rectangle': {
								container.appendChild(lineSection);
								container.appendChild(fillSection);
								container.style.height = '330px';
							}
							break;
						}
						return container;
					};

					mapa.addLayerToPopUp = (container, activeLayer) => {
						const inputDiv = document.createElement('div');
						inputDiv.className = 'active-layer';
						inputDiv.id = 'container_' + activeLayer;
						inputDiv.style.display = 'flex';
						inputDiv.style.flexDirection = 'row';
						inputDiv.style.justifyContent = 'flex-start';
						inputDiv.style.alignItems = 'center';
						inputDiv.style.marginBottom = '2px';
						inputDiv.style.padding = '4px';
						inputDiv.style.borderRadius = '3px';
						inputDiv.style.transition = '0.2s';
						inputDiv.onclick = () => {
							onClickActiveLayer(activeLayer);
						};

						const input = document.createElement('input');
						input.type = 'checkbox';
						input.id = activeLayer;
						input.name = activeLayer;
						input.value = activeLayer;
						input.style.margin = '0px 3px 0px 0px';
						input.onclick = () => {
							onClickActiveLayer(activeLayer);
						};

						const label = document.createElement('label');
						label.innerHTML = activeLayer;
						label.className = 'active-layer-label';
						label.setAttribute("for", activeLayer);
						label.style.marginBottom = '0px';
						label.style.overflow = 'hidden';
						label.style.textOverflow = 'ellipsis';
						label.onclick = () => {
							onClickActiveLayer(activeLayer);
						};

						inputDiv.appendChild(input);
						inputDiv.appendChild(label);
						container.appendChild(inputDiv);
					}

					mapa.activeLayerHasChanged = (layer, addToList) => {
						const activeLayersDiv = document.getElementById('activeLayers');
						if (!activeLayersDiv)
							return;
					
						const activeLayersDivChilds = Array.from(activeLayersDiv.childNodes);
						const containerIdx = activeLayersDivChilds.findIndex(layerDiv => layerDiv.id.split('container_')[1] === layer);
						if (containerIdx >= 0 && !addToList) {
							activeLayersDiv.removeChild(activeLayersDivChilds[containerIdx]);
						} else if (containerIdx === -1 && addToList) {
							mapa.addLayerToPopUp(activeLayersDiv, layer);	
						}
					
						const showInfoBtn = document.getElementById('btn-show-info');
						if (gestorMenu.getActiveLayersWithoutBasemap().length > 0) {
							showInfoBtn.classList.remove("btn-disabled");
							showInfoBtn.classList.add("btn-active");
						} else {
							showInfoBtn.classList.remove("btn-active");
							showInfoBtn.classList.add("btn-disabled");
						}
					}

					mapa.createPopUp = (layer) => {
						const popUpDiv = document.createElement('div');
						popUpDiv.style.alignItems = 'center';
						popUpDiv.style.alignContent = 'center';

						const title = document.createElement('p');
						title.className = 'active-layer-label';
						title.innerHTML = 'Capas Activas';
						title.style.fontSize = 14;
						title.style.fontWeight = 'bold';
						title.style.margin = '0px 0px 5px 3px';
						popUpDiv.appendChild(title);

						const selectedLayersDiv = document.createElement('div');
						selectedLayersDiv.id = 'activeLayers';
						selectedLayersDiv.style.padding = '3px';
						selectedLayersDiv.style.overflowY = 'auto';
						selectedLayersDiv.style.maxHeight = '250px';

						const inputDiv = document.createElement('div');
						inputDiv.className = 'active-layer';
						inputDiv.style.display = 'flex';
						inputDiv.style.flexDirection = 'row';
						inputDiv.style.justifyContent = 'flex-start';
						inputDiv.style.alignItems = 'center';
						inputDiv.style.marginBottom = '2px';
						inputDiv.style.padding = '4px';
						inputDiv.style.borderRadius = '3px';
						inputDiv.style.transition = '0.2s';
						inputDiv.onclick = () => {
							onClickAllActiveLayers();
						}

						const input = document.createElement('input');
						input.type = 'checkbox';
						input.id = 'seleccionar_capas';
						input.name = 'Seleccionar Capas';
						input.value = 'Seleccionar Capas';
						input.style.margin = '0px 3px 0px 0px';
						input.onclick = () => {
							onClickAllActiveLayers();
						}

						const label = document.createElement('label');
						label.className = 'active-layer-label';
						label.innerHTML = 'Seleccionar Todas';
						label.setAttribute("for", 'seleccionar_capas');
						label.style.marginBottom = '0px';
						label.style.overflow = 'hidden';
						label.style.textOverflow = 'ellipsis';
						label.onclick = () => {
							onClickAllActiveLayers();
						}

						inputDiv.appendChild(input);
						inputDiv.appendChild(label);
						selectedLayersDiv.appendChild(inputDiv);

						gestorMenu.getActiveLayersWithoutBasemap().forEach(activeLayer => {
							mapa.addLayerToPopUp(selectedLayersDiv, activeLayer.name);
						});

						const popUpBtn = document.createElement('div');
						popUpBtn.className = 'popup-btn';
						popUpBtn.setAttribute('id', 'btn-show-info');
						popUpBtn.onclick = () => {
							if (gestorMenu.getActiveLayersWithoutBasemap().length > 0)
								mapa.showInfoLayer(layer.name, false);
						};
						popUpBtn.innerHTML = '<p class="popup-btn-text">Consultar capas seleccionadas en área</p>';
						popUpBtn.classList.add(gestorMenu.getActiveLayersWithoutBasemap().length === 0 ? 'btn-disabled' : 'btn-active');

						popUpDiv.appendChild(selectedLayersDiv);
						popUpDiv.appendChild(popUpBtn);

						const popUpBtn2 = document.createElement('div');
						popUpBtn2.className = 'popup-btn';
						popUpBtn2.setAttribute('id', 'btn-show-prev-info');
						popUpBtn2.onclick = () => {
							if (Object.keys(layer.data).length > 0)
								mapa.showInfoLayer(layer.name, true);
						};
						popUpBtn2.innerHTML = '<p class="popup-btn-text">Ver última consulta</p>';
						popUpBtn2.classList.add(Object.keys(layer.data).length === 0 ? 'btn-disabled' : 'btn-active');

						popUpDiv.appendChild(popUpBtn2);

						return popUpDiv;
					}

					mapa.showInfoLayer = (layerName, showLastSearch) => {

						const type = layerName.split('_')[0];
						const layer = mapa.editableLayers[type].find(lyr => lyr.name === layerName);

						if (showLastSearch) {
							for (const dataName in layer.data) {
								let table = new Datatable(layer.data[dataName], layer.coords);
								createTabulator(table, dataName);
							}
							layer.closePopup();
							return;
						}

						const selectedLayersInputs = Array.from(document.getElementById('activeLayers').getElementsByTagName('input'));
						const selectedLayers = [];
						selectedLayersInputs.forEach(selectedLayer => {
							if (selectedLayer.checked)
								selectedLayers.push(selectedLayer.id);
						});
						
						layer.closePopup();

						if (Object.keys(layer.data).length === 0) {
							//Download
							mapa.checkLayersInDrawedGeometry(layer, selectedLayers);
						} else {
							//Load data in table
							//.. its more complicated if active layers is different to each search.

							//Load data in table
							//let tableD = new Datatable (data, coords);
							//createTabulator(tableD, activeLayer.name);

							mapa.checkLayersInDrawedGeometry(layer, selectedLayers);
						}
					}

					mapa.getEditableLayers = (type) => {
						return mapa.editableLayers.hasOwnProperty(type) ? mapa.editableLayers[type] : mapa.editableLayers;
					}

					mapa.getEditableLayer = (name,file) => {
						const type = name.split('_')[0];

						if (file==undefined || !file) {
							return mapa.editableLayers.hasOwnProperty(type) ? mapa.editableLayers[type].find(lyr => lyr.name === name) : null;
						}else {
							return mapa.editableLayers.hasOwnProperty(type) ? mapa.editableLayers[type].find(lyr => lyr.name === name) : null;
							
						}					
						
					}

					mapa.checkLayersInDrawedGeometry = (layer, selectedLayers) => {
						const filteredActiveLayers = gestorMenu.getActiveLayersWithoutBasemap().filter(activeLayer => {
							return selectedLayers.find(selectedLayer => selectedLayer === activeLayer.name) ? true : false;
						});

						let coords = null;

						if (layer.type === 'polygon' || layer.type === 'rectangle') {
							coords = layer._latlngs[0].map((coords) => [coords.lng, coords.lat]);
							layer.coords = coords;
						} else if (layer.type === 'circle') {
							coords = {
								lat: layer._latlng.lat,
								lng: layer._latlng.lng,
								r: layer._mRadius
							};
						} else if (layer.type === 'marker') {
							coords = {
								lat: layer._latlng.lat,
								lng: layer._latlng.lng,
							};
						} else if (layer.type === 'polyline') {
							coords = layer._latlngs.map((coords) => [coords.lng, coords.lat]);
							layer.coords = coords;
						}

						//Clear all old data
						layer.data = {};

						if (filteredActiveLayers.length > 0) {
							filteredActiveLayers.forEach(activeLayer => {
								getLayerDataByWFS(coords, layer.type, activeLayer)
								.then(data => {

									if (!data) {
										throw new Error('Error fetching to server');
									};

									layer.data[activeLayer.name] = data;
									layer.coords = coords;

									//Load data in table
									const table = new Datatable(data, coords);
									//console.clear()
									createTabulator(table, activeLayer.name);

									//we can style the figure in case it can receive some information
									/* if (layer.type !== 'marker')
										layer.setStyle({
											color: '#33b560'
										}); */
								})
								.catch(error => {
									console.log(error);
									/* if (layer.type !== 'marker')
										layer.setStyle({
											color: 'red'
										}); */
								});
							});
						}
					}
					
					mapa.getLayerGeoJSON = (layer,file) => {
						const type = layer.split('_')[0];
						if (file==undefined || !file) {
							return mapa.editableLayers.hasOwnProperty(type) ? mapa.editableLayers[type].find(lyr => lyr.name === layer).toGeoJSON() : null;
							
						}else {
							return mapa.editableLayers.hasOwnProperty(type) ? mapa.editableLayers[type].find(lyr => lyr.name === layer).toGeoJSON() : null;

						}
					}
					

					mapa.showLayer = (layer,file) => {
						const type = layer.split('_')[0];
						if (file==undefined || !file) {
							if (mapa.editableLayers.hasOwnProperty(type)) {
								const lyr = mapa.editableLayers[type].find(lyr => lyr.name === layer);
								if (lyr)
									drawnItems.addLayer(lyr);
							}
						}else {
							if (mapa.editableLayers.hasOwnProperty(type)) {
								const lyr = mapa.editableLayers[type].find(lyr => lyr.name === layer);
								if (lyr)
									drawnItems.addLayer(lyr);
							}
						}
					}

					mapa.hideLayer = (layer,file) => {
						if (file==undefined || !file) {
							Object.values(drawnItems._layers).forEach(lyr => {
								if (layer === lyr.name) {
									drawnItems.removeLayer(lyr);
									return;
								}
							});
						}else {
							Object.values(drawnItems._layers).forEach(lyr => {
								if (layer === lyr.name) {
									drawnItems.removeLayer(lyr);
									return;
								}
							});
						}
					}

					
					mapa.showGroupLayer = (group,file) => {
						if (file==undefined || !file) {
							if (mapa.groupLayers.hasOwnProperty(group)){
								mapa.groupLayers[group].forEach(layer => {
									mapa.showLayer(layer);
								});
							}
						}else {
							if (mapa.groupLayers.hasOwnProperty(group)){
								mapa.groupLayers[group].forEach(layer => {
									mapa.showLayer(layer, true);
								});
							}
						}
					}

					mapa.hideGroupLayer = (group,file) => {
						if (file==undefined || !file) {
							if (mapa.groupLayers.hasOwnProperty(group))
								mapa.groupLayers[group].forEach(layer => {
									mapa.hideLayer(layer);
							});
						}else{
							if (mapa.groupLayers.hasOwnProperty(group))
								mapa.groupLayers[group].forEach(layer => {
									mapa.hideLayer(layer,true);
							});
						}
					}

					mapa.deleteLayer = (layer, file) => {
						const type = layer.split('_')[0];
						if (file==undefined || !file) {
							const lyrIdx = mapa.editableLayers[type].findIndex(lyr => lyr.name === layer);
							if (lyrIdx >= 0) {
								drawnItems.removeLayer(mapa.editableLayers[type][lyrIdx]);
								mapa.editableLayers[type].splice(lyrIdx, 1);
							}
	
							//Delete from groups
							for (const group in mapa.groupLayers) {
								const lyrInGrpIdx = mapa.groupLayers[group].findIndex(lyr => lyr === layer);
								if (lyrInGrpIdx >= 0)
									mapa.groupLayers[group].splice(lyrInGrpIdx, 1);
							}
						}else {
							const lyrIdx = mapa.editableLayers[type].findIndex(lyr => lyr.name === layer);
							if (lyrIdx >= 0) {
								drawnItems.removeLayer(mapa.editableLayers[type][lyrIdx]);
								mapa.editableLayers[type].splice(lyrIdx, 1);
							}
	
							//Delete from groups
							for (const group in mapa.groupLayers) {
								const lyrInGrpIdx = mapa.groupLayers[group].findIndex(lyr => lyr === layer);
								if (lyrInGrpIdx >= 0)
									mapa.groupLayers[group].splice(lyrInGrpIdx, 1);
							}
						}
						mapa.methodsEvents['delete-layer'].forEach(method => method(mapa.editableLayers))
						controlSeccionGeom()
					}

					mapa.removeGroup = (group, deleteLayers,file) => {
						// console.log('file',file);
						if (file==undefined || !file) {
							if (mapa.groupLayers.hasOwnProperty(group)) {
								if (deleteLayers) {
									const layersArr = [...mapa.groupLayers[group]];
									layersArr.forEach(layer => {
										mapa.deleteLayer(layer);
									});
								}
								delete mapa.groupLayers[group];
							}
						}else {
							if (mapa.groupLayers.hasOwnProperty(group)) {
								if (deleteLayers) {
									const layersArr = [...mapa.groupLayers[group]];
									layersArr.forEach(layer => {
										mapa.deleteLayer(layer,true);
									});
								}
								delete mapa.groupLayers[group];
							}
						}
					}

					mapa.addLayerToGroup = (layer, group, file) => {
						if (file==undefined || !file) {
							if (mapa.groupLayers.hasOwnProperty(group) && !mapa.groupLayers[group].find(layerName => layerName === layer)) {
								mapa.groupLayers[group].push(layer);
							}
						}else {
							if (mapa.groupLayers.hasOwnProperty(group) && !mapa.groupLayers[group].find(layerName => layerName === layer)) {
								mapa.groupLayers[group].push(layer);
							}
						}
					}

					mapa.removeLayerFromGroup = (layer, group, file) => {
						if (file==undefined || !file) {
							if (mapa.groupLayers.hasOwnProperty(group)) {
								const layerIdx = mapa.groupLayers[group].findIndex(layerName => layerName === layer);
								if (layerIdx >= 0)
									mapa.groupLayers[group].splice(layerIdx, 1);
							}
						}else {
							if (mapa.groupLayers.hasOwnProperty(group)) {
								const layerIdx = mapa.groupLayers[group].findIndex(layerName => layerName === layer);
								if (layerIdx >= 0)
									mapa.groupLayers[group].splice(layerIdx, 1);
							}
						}
					}

					mapa.downloadLayerGeoJSON = (layer) => {
						const geoJSON = {
							type: "FeatureCollection",
							features: [layer.toGeoJSON()]
						};
						const styleOptions = { ...layer.options };
						geoJSON.features[0].properties.styles = { ...styleOptions };
						geoJSON.features[0].properties.type = layer.type;
						if (layer.type === 'marker') {
							if (geoJSON.features[0].properties.styles.hasOwnProperty('icon')) {
								delete geoJSON.features[0].properties.styles.icon;
							}
						}
						const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geoJSON));
						const downloadANode = document.createElement('a');
						downloadANode.setAttribute("href", dataStr);
						downloadANode.setAttribute("download", layer.name + ".geojson");
						document.body.appendChild(downloadANode);
						downloadANode.click();
						downloadANode.remove();
					}
					
					mapa.downloadMultiLayerGeoJSON = (groupLayer,file) => {
						const jsonToDownload = {
							type: "FeatureCollection",
							features: []
						};
						if (file==undefined || !file){
							mapa.groupLayers[groupLayer].forEach(layerName => {
								const layer = mapa.getEditableLayer(layerName);
								const geoJSON = layer.toGeoJSON();
								const styleOptions = { ...layer.options };
								geoJSON.properties.styles = styleOptions;
								geoJSON.properties.type = layer.type;
								jsonToDownload.features.push(geoJSON);
							});
						}else{
							mapa.groupLayers[groupLayer].forEach(layerName => {
								const layer = mapa.getEditableLayer(layerName,true);
								const geoJSON = layer.toGeoJSON();
								const styleOptions = { ...layer.options };
								geoJSON.properties.styles = styleOptions;
								geoJSON.properties.type = layer.type;
								// TODO: include all properties fields to GeoJSON
								(layer.value) ? geoJSON.properties.value = layer.value : 0;
								jsonToDownload.features.push(geoJSON);
							});
						}

						const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonToDownload));
						const downloadANode = document.createElement('a');
						downloadANode.setAttribute("href", dataStr);
						downloadANode.setAttribute("download", groupLayer + ".geojson");
						document.body.appendChild(downloadANode);
						downloadANode.click();
						downloadANode.remove();
					}

					mapa.createMarker = (color1, color2, borderWidth) => {
						const svgNS = 'http://www.w3.org/2000/svg';

						const marker = document.createElementNS(svgNS, "svg");
						marker.setAttribute('width', 54);
						marker.setAttribute('height', 82);
						marker.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
						marker.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

						const defs = document.createElementNS(svgNS, "defs");
						marker.appendChild(defs);

						const borderGradient = document.createElementNS(svgNS, 'linearGradient');
						borderGradient.setAttribute('id', 'strokeGradient');
						borderGradient.setAttribute('x1', '0');
						borderGradient.setAttribute('x2', '0');
						borderGradient.setAttribute('y1', '0');
						borderGradient.setAttribute('y2', '1');
				
						const stop1 = document.createElementNS(svgNS, 'stop');
						stop1.setAttribute('offset', '0');
						stop1.setAttribute('stop-color', color1);
						borderGradient.appendChild(stop1);
						
						const stop2 = document.createElementNS(svgNS, 'stop');
						stop2.setAttribute('offset', '1');
						stop2.setAttribute('stop-color', getDarkerColorTone(color1, -0.3));
						borderGradient.appendChild(stop2);
				
						const fillGradient = document.createElementNS(svgNS, 'linearGradient');
						fillGradient.setAttribute('id', 'fillGradient');
						fillGradient.setAttribute('x1', '0');
						fillGradient.setAttribute('x2', '0');
						fillGradient.setAttribute('y1', '0');
						fillGradient.setAttribute('y2', '1');
				
						const stop3 = document.createElementNS(svgNS, 'stop');
						stop3.setAttribute('offset', '0');
						stop3.setAttribute('stop-color', color2);
						fillGradient.appendChild(stop3);
						
						const stop4 = document.createElementNS(svgNS, 'stop');
						stop4.setAttribute('offset', '1');
						stop4.setAttribute('stop-color', getDarkerColorTone(color2, -0.3));
						fillGradient.appendChild(stop4);
				
						defs.appendChild(borderGradient);
						defs.appendChild(fillGradient);

						const g = document.createElementNS(svgNS, "g");
						marker.appendChild(g);
						
						const path = document.createElementNS(svgNS, "path");
						path.setAttribute('d', 'm27.3 3.1c-13.694 0-25.092 11.382-25.092 23.732 0 5.556 3.258 12.616 5.613 17.492l19.388 35.744 19.296-35.744c2.354-4.876 5.704-11.582 5.704-17.492 0-12.35-11.215-23.732-24.908-23.732zm0 14.31c5.383.034 9.748 4.244 9.748 9.42s-4.365 9.326-9.748 9.358c-5.383-.034-9.748-4.18-9.748-9.358 0-5.176 4.365-9.386 9.748-9.42z');
						path.setAttribute('stroke', `url(#strokeGradient)`);
						path.setAttribute('fill', `url(#fillGradient)`);
						path.setAttribute('stroke-linecap', 'round');
						path.setAttribute('stroke-width', borderWidth);
						g.appendChild(path);

						return marker;
					}

					mapa.convertMarkerToPng = async (markerSvg) => {
						let svgString = new XMLSerializer().serializeToString(markerSvg);
						let canvas = document.createElement('canvas');
						canvas.width = 54;
						canvas.height = 82;
						let ctx = canvas.getContext("2d");
						let DOMURL = self.URL || self.webkitURL || self;
						let img = new Image();
						let svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
						let url = DOMURL.createObjectURL(svg);
						return new Promise((resolve, reject) => {
							img.onload = function() {
								ctx.drawImage(img, 0, 0);
								let png = canvas.toDataURL("image/png", 1);
								markerSvg.innerHTML = '<img src="'+png+'"/>';
								DOMURL.revokeObjectURL(png);
								resolve(png);
							};
							img.src = url;
						});
					}

					mapa.downloadMarker = async (format, color1, color2, borderWidth) => {
						const markerSVG = mapa.createMarker(color1, color2, borderWidth);
						let downloadLink = document.createElement("a");
						switch (format) {
							case 'svg': {
								let svgData = markerSVG.outerHTML;
								let svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
								let svgUrl = URL.createObjectURL(svgBlob);
								downloadLink.href = svgUrl;
								downloadLink.download = "marker.svg";
							}
							break;
							case 'png': {
								const markerPNG = await mapa.convertMarkerToPng(markerSVG);
								downloadLink.href = markerPNG;
								downloadLink.download = "marker.png";
							}
							break;
						}
						document.body.appendChild(downloadLink);
						downloadLink.click();
						document.body.removeChild(downloadLink);
					}

					mapa.setIconToMarker = async (layer, color1, color2, borderWidth) => {
						const markerSVG = mapa.createMarker(color1, color2, borderWidth);
						const markerPNG = await mapa.convertMarkerToPng(markerSVG);
						const icon = L.icon({
							iconUrl: markerPNG,
							shadowUrl: 'src/styles/images/marker-shadow.png',
							popupAnchor:  [1, -33]
						});
						layer.setIcon(icon);
					};

					mapa.addGeoJsonLayerToDrawedLayers = (geoJSON, groupName, groupIsCreated, file) => {
						if (file==undefined || !file && mapa.groupLayers[groupName] === undefined){
							mapa.groupLayers[groupName] = [];
						}else{
							if(mapa.groupLayers[groupName] == undefined){
								mapa.groupLayers[groupName] = [];
							}
						}
						
						if (geoJSON.type === 'FeatureCollection') {
							geoJSON.features.forEach(feature => {
								if(file==undefined || !file){
									mapa.addGeoJsonLayerToDrawedLayers(feature, groupName, true, false);
								}else {
									mapa.addGeoJsonLayerToDrawedLayers(feature, groupName, true, true);
								}
							});
							return;
						}

						let type = geoJSON.geometry.type.toLowerCase();
						let layer = null;

						let options = {};
						if (geoJSON.properties.hasOwnProperty('styles')) {
							options = { ...geoJSON.properties.styles };
						}

						switch (type) {
							case 'point': {
								const invertedCoords = [geoJSON.geometry.coordinates[1], geoJSON.geometry.coordinates[0]];

								//Check if it is circle, circlemarker or marker
								if (geoJSON.properties.hasOwnProperty('type')) {
									switch (geoJSON.properties.type.toLowerCase()) {
										case 'circle': {
											layer = L.circle(invertedCoords, options);
											type = 'circle';
										}
										break;
										case 'circlemarker': {
											layer = L.circlemarker(invertedCoords, options);
											type = 'circlemarker';
										};
										break;
										case 'marker': {
											layer = L.marker(invertedCoords);
											type = 'marker';
										};
										break;
										default: {
											layer = L.marker(invertedCoords);
											type = 'marker';
										}
									}
								} else {
									layer = L.marker(invertedCoords);
									type = 'marker';
								}
							}
							break;
							case 'linestring': {
								const invertedCoords = geoJSON.geometry.coordinates.map(coords => [coords[1], coords[0]]);
								if (geoJSON.hasOwnProperty('properties') && geoJSON.properties.hasOwnProperty('value')) {
									let n = geoJSON.properties.value
									let value = geoJSON.properties.value + ' m'
									
									if(!countour_styles) countour_styles = getStyleContour()
									

									if (n % countour_styles.d_line_m === 0) {
										let colord = ""
										if(countour_styles.d_line_color === "multi"){
											colord = getMulticolorContour(n)
										}
										else{colord = countour_styles.d_line_color}

										options = {
											color: colord,
											weight: countour_styles.d_weigth,
											smoothFactor: countour_styles.smoothFactor,
											'font-weight': 'bold'
												}
									}else{
										let colorc = ""
										if(countour_styles.line_color === "multi"){
											colorc = getMulticolorContour(n)
										} else{ colorc = countour_styles.line_color}


										options = { color: colorc,
													weight: countour_styles.line_weight,
													smoothFactor: countour_styles.smoothFactor,
													'font-weight': 'regular'
												}
									}
									//if (n % 100 === 0 ||n % 50 === 0) 

									layer = L.polyline(invertedCoords, options);
									type = 'polyline';
									layer.value = geoJSON.properties.value
									if (n % 100 === 0 ||n % 50 === 0) {
										// textPath
										layer.setText(value, {
											repeat: false,
											offset: -3,
											center: true,
											attributes: {
												/* textLength: 10, */
												fill: 'Maroon',
												'font-weight': options['font-weight'],
												'font-family': 'sans-serif',
												stroke: 'white',
												'stroke-opacity': '1',
												'stroke-width': '0.5'
												/* 'font-size': '24px' */
											}
										});
									}
									layer.on('mouseover', function (e) {
										let elevation = geoJSON.properties.value.toString() + " m";
										let tooltipStyle = {
											direction: 'right',
											permanent: false,
											sticky: true,
											offset: [10, 0],
											opacity: 0.75,
											className: 'map-tooltip'
										};
										layer.bindTooltip(`<div><b>${elevation}</b></div>`,
										 tooltipStyle);
									});
								} else {
									layer = L.polyline(invertedCoords, options);
									type = 'polyline';
								}
								
							}
							break;
							case 'polygon': {
								const invertedCoords = geoJSON.geometry.coordinates[0].map(coords => [coords[1], coords[0]]);
								if (geoJSON.properties.hasOwnProperty('type') && geoJSON.properties.type.toLowerCase() === 'rectangle') {
									layer = L.rectangle(invertedCoords, options);
									type = 'rectangle';
								} else {
									layer = L.polygon(invertedCoords, options);
									type = 'polygon';
								}
							}
							break;
							case 'multipoint': {
								geoJSON.geometry.coordinates.forEach(coords => {
									const point = {
										type: "Feature",
										geometry: {
											type: "Point",
											coordinates: coords
										},
										properties: geoJSON.properties
									};
									if(file==undefined || !file){
										mapa.addGeoJsonLayerToDrawedLayers(point, groupName, true, false);
									}else {
										mapa.addGeoJsonLayerToDrawedLayers(point, groupName, true, true);
									}
								});
								return;
							}
							case 'multilinestring': {
								geoJSON.geometry.coordinates.forEach(coords => {
									const lineString = {
										type: "Feature",
										geometry: {
											type: "LineString",
											coordinates: coords
										},
										properties: geoJSON.properties
									};
									if(file==undefined || !file){
										mapa.addGeoJsonLayerToDrawedLayers(lineString, groupName, true, false);
									}else {
										mapa.addGeoJsonLayerToDrawedLayers(lineString, groupName, true, true);
									}
								});
								return;
							}
							case 'multipolygon': {
								const reversedCoords = reverseMultipleCoords(geoJSON.geometry.coordinates[0]);
								layer = L.polygon(reversedCoords);
								type = 'polygon';
							}
							break;
						}

						let name = type + '_';
						
						if(file==undefined || !file){
							if (mapa.editableLayers[type].length === 0) {
								name += '1';
							} else {
								const lastLayerName = mapa.editableLayers[type][mapa.editableLayers[type].length - 1].name;
								name += parseInt(lastLayerName.split('_')[1]) + 1;
							}
						}else {
							if (mapa.editableLayers[type].length === 0) {
								name += '1';
							} else {
								const lastLayerName = mapa.editableLayers[type][mapa.editableLayers[type].length - 1].name;
								name += parseInt(lastLayerName.split('_')[1]) + 1;
							}
						}

						layer.name = name;
						layer.type = type;
						layer.data = {};

						if(file==undefined || !file){
							mapa.groupLayers[groupName].push(name);
						}else {
							mapa.groupLayers[groupName].push(name);
						}

						layer.getGeoJSON = () => {
							return mapa.getLayerGeoJSON(layer.name, file);
						}
						
						layer.downloadGeoJSON = () => {
							if(file==undefined || !file){
								mapa.downloadLayerGeoJSON(mapa.editableLayers[type].find(lyr => lyr.name === layer.name));
							}else {
								mapa.downloadLayerGeoJSON(mapa.editableLayers[type].find(lyr => lyr.name === layer.name));
							}
						}

						if(file==undefined || !file){
							mapa.editableLayers[type].push(layer);
						}else {
							mapa.editableLayers[type].push(layer);
						}
						
						if (layer.type === 'marker') {
							//Default marker styles
							layer.options.borderWidth = DEFAULT_MARKER_STYLES.borderWidth;
							layer.options.borderColor = DEFAULT_MARKER_STYLES.borderColor;
							layer.options.fillColor = DEFAULT_MARKER_STYLES.fillColor;

							if (geoJSON.properties.hasOwnProperty('styles') && geoJSON.properties.styles.hasOwnProperty('borderWidth')) {
								const borderWidth = geoJSON.properties.styles.borderWidth;
								const borderColor = geoJSON.properties.styles.borderColor;
								const fillColor = geoJSON.properties.styles.fillColor;

								layer.options.borderWidth = borderWidth;
								layer.options.borderColor = borderColor;
								layer.options.fillColor = fillColor;
								layer.options.customMarker = true;

								mapa.setIconToMarker(layer, borderColor, fillColor, borderWidth);
							}
						}

						//Left-click
						if (layer.type !== 'marker' && layer.type !== 'circlemarker' && layer.type !== 'polyline') {
							mapa.addSelectionLayersMenuToLayer(layer, file);
						}
						//Right-click
						mapa.addContextMenuToLayer(layer, file);
						
						if(file==undefined || !file){
							drawnItems.addLayer(layer);
						}else {
							drawnItems.addLayer(layer);
						}

						/* if (type !== 'marker' && type !== 'circlemarker') {
							mapa.fitBounds(layer.getBounds());
						} else {
							mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
						} */
					}

					gestorMenu.plugins['Draw'].setStatus('visible');
					break;
				default:
					break;
			}
		});
	}
	switch(unordered) {
		case 'leaflet':
			if (selectedBasemap.hasOwnProperty('key')) {
				const interval = setInterval(() => {
					if (L.tileLayer.bing) {
						window.clearInterval(interval);
						currentBaseMap = L.tileLayer.bing({ 
							bingMapsKey: selectedBasemap.key,
							culture: 'es_AR',
							minZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.min : DEFAULT_MIN_ZOOM_LEVEL,
							maxZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.max : DEFAULT_MAX_ZOOM_LEVEL,
							minNativeZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.nativeMin : DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
							maxNativeZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.nativeMax : DEFAULT_MAX_NATIVE_ZOOM_LEVEL,
							attribution: selectedBasemap.attribution
						}).addTo(mapa);
					}
				}, 100);
			} else {
				currentBaseMap = L.tileLayer(selectedBasemap.host, {
					minZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.min : DEFAULT_MIN_ZOOM_LEVEL,
					maxZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.max : DEFAULT_MAX_ZOOM_LEVEL,
					minNativeZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.nativeMin : DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
					maxNativeZoom: selectedBasemap.hasOwnProperty('zoom') ? selectedBasemap.zoom.nativeMax : DEFAULT_MAX_NATIVE_ZOOM_LEVEL,
					attribution: selectedBasemap.attribution
				});
			};

			mapa = L.map('mapa', {
				center: app.hasOwnProperty('mapConfig') ? [app.mapConfig.center.latitude, app.mapConfig.center.longitude] : [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
				zoom: app.hasOwnProperty('mapConfig') ? app.mapConfig.zoom.initial : DEFAULT_ZOOM_LEVEL,
				layers: currentBaseMap ? [currentBaseMap] : undefined,
				zoomControl: false,
				minZoom: app.hasOwnProperty('mapConfig') ? app.mapConfig.zoom.min : DEFAULT_MIN_ZOOM_LEVEL,
				maxZoom: app.hasOwnProperty('mapConfig') ? app.mapConfig.zoom.max: DEFAULT_MAX_ZOOM_LEVEL,
				/* renderer: L.svg() */
			});
			

			//Available events
			mapa.methodsEvents = {
				'add-layer': [],
				'delete-layer': []
			};

			setValidZoomLevel(selectedBasemap.nombre);

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
		let wmts_maxZoom = app.hasOwnProperty('service') ? app.service.wmts.maxZoom : DEFAULT_WMTS_MAX_ZOOM_LEVEL
		let _style = "", _tilematrixSet = "EPSG:3857", _format = "image/png";
		var wmtsSource = new L.TileLayer.WMTS(objLayer.capa.getHostWMS(),
			{
				layer: objLayer.capa.nombre,
				style: _style,
				tilematrixSet: _tilematrixSet,
				format: _format,
				attribution: objLayer.nombre,
				maxZoom: wmts_maxZoom
			}
		);
		overlayMaps[objLayer.nombre] = wmtsSource;
	}
}

function createTmsLayer(tmsUrl, layer, attribution) {
	if (baseLayers.hasOwnProperty(layer) && baseLayers[layer].hasOwnProperty('zoom')) {
		const { min, max, nativeMin, nativeMax } = baseLayers[layer].zoom;
		currentBaseMap = new L.tileLayer(tmsUrl, {
			attribution: attribution,
			minZoom: min,
			maxZoom: max,
			minNativeZoom: nativeMin,
			maxNativeZoom: nativeMax
		});
		return;
	}
	currentBaseMap = new L.tileLayer(tmsUrl, {
		attribution: attribution,
		minZoom: DEFAULT_MIN_ZOOM_LEVEL,
		maxZoom: DEFAULT_MAX_ZOOM_LEVEL,
		minNativeZoom: DEFAULT_MIN_NATIVE_ZOOM_LEVEL,
		maxNativeZoom: DEFAULT_MAX_NATIVE_ZOOM_LEVEL
	});
}

function createBingLayer(bingKey, layer, attribution) {
    currentBaseMap = L.tileLayer.bing({ 
		bingMapsKey: bingKey,
		culture: 'es_AR',
		attribution: attribution
	}).addTo(mapa);
}

function loadMapaBaseTpl(tmsUrl, layer, attribution) {
	mapa.removeLayer(currentBaseMap);
	createTmsLayer(tmsUrl, layer, attribution);
	currentBaseMap.addTo(mapa);
}

function loadMapaBaseBingTpl (bingKey, layer, attribution) {
	mapa.removeLayer(currentBaseMap);
	createBingLayer(bingKey, layer, attribution);
	currentBaseMap.addTo(mapa);
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

function copytoClipboard(coords){
	var aux = document.createElement("input");
	aux.setAttribute("value", coords);
	document.body.appendChild(aux);
	aux.select();
	document.execCommand("copy");
	document.body.removeChild(aux);
	new UserMessage('Las coordenadas se copiaron al portapapeles', true, 'information');
}




