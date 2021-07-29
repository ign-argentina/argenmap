// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");

var loadTableAsPopUp = false;
var tableFeatureCount = 20;
var loadCharts = false;

var currentlyDrawing = false;

function setTableAsPopUp(cond) {
    loadTableAsPopUp = cond;
}

function setTableFeatureCount(value) {
    tableFeatureCount = value;
}

function setCharts(cond) {
   loadCharts = cond;
}

const reverseCoords = (coords) => {
    return [coords[1], coords[0]];
}

const reverseMultipleCoords = (coords) => {
    let reversedCoords = [];
    coords.forEach(coord => {
        if (typeof coord[0] === 'object') {
            reversedCoords.push(reverseMultipleCoords(coord));
        } else {
            reversedCoords.push(reverseCoords(coord));
        }
    });
    return reversedCoords;
}

XMLHttpRequest.prototype.open = (function(open) {
    return function(method, url, async) {
        if (url.includes("&request=GetFeatureInfo")){
            if (currentlyDrawing)
                url += `&feature_count=0`;
            else if (loadTableAsPopUp) {
                url += `&feature_count=${tableFeatureCount}`;
            }
        }
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

function deg_to_dms(deg) {
   var d = Math.floor (deg);
   var minfloat = (deg-d)*60;
   var m = Math.floor(minfloat);
   var secfloat = (minfloat-m)*60;
   var s = Math.round(secfloat);
   // After rounding, the seconds might become 60. These two
   // if-tests are not necessary if no rounding is done.
   if (s==60) {
     m++;
     s=0;
   }
   if (m==60) {
     d++;
     m=0;
   }
   
   d += "";
   d = d.padStart(2, '0');
   m += "";
   m = m.padStart(2, '0');
   s += "";
   s = s.padStart(2, '0');
   return ("" + d + "° " + m + "' " + s + "''");
}

function getDarkerColorTone(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

function showImageOnError(image) {
	image.onerror = "";
    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    return true;
}

function mainMenuSearch(e) {
    e.preventDefault();
    gestorMenu.setQuerySearch($("#q").val());
    gestorMenu.printMenu();
}

function clearString(s) {
	return s.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
}


function sanatizeString(s) {
	return clearString(s).replace(/ /g, '_');
}

/****** Enveloped functions ******/
function loadGeojson(url, layer) {
    if (typeof loadGeojsonTpl === 'function') {
        return loadGeojsonTpl(wmsUrl, layer);
    } else {
        console.warn("Function loadGeojsonTpl() do not exists. Please, define it.");
    }
}

function loadWmsTplAux(objLayer, param) {
    wmsUrl = objLayer.capa.host;
		layer = objLayer.capa.nombre;
    if (overlayMaps.hasOwnProperty(layer)) {
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];
    } else {
        createWmsLayer(objLayer);
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
                info = info.replace('<table', '<table class="featureInfo" id="featureInfoPopup' + idTxt + '"');
                return info;
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
            infoAux += '<div style="padding:1em" class="individualFeature">';
            infoAux += '<h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">' + title + '</h4>';
            infoAux += '<ul>';
            
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
            
            return infoAux;
        }
        
        return '';
    }
    
    function createWmsLayer(objLayer) {
        //Extends WMS.Source to customize popup behavior
        var MySource = L.WMS.Source.extend({
            'showFeatureInfo': function(latlng, info) {
                let layername = objLayer.capa.titulo

                if (!this._map) {
                    return;
				}
                
                if (!loadTableAsPopUp) {
                    
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
                } else {
                                       
                    let tableD = new Datatable (JSON.parse(info), latlng);
                    createTabulator(tableD, layername);
                    
                }
                return;
            }
        });
        var wmsSource = new MySource(objLayer.capa.getHostWMS(), {
            transparent: true,
            tiled: true,
            maxZoom: 21,
            'title': objLayer.capa.titulo,
            format: 'image/png',
            INFO_FORMAT: objLayer.capa.featureInfoFormat
        });
        overlayMaps[objLayer.capa.nombre] = wmsSource.getLayer(objLayer.capa.nombre);
    }
}

function loadWms(callbackFunction, objLayer) {
    if (typeof callbackFunction === 'function') {
        return loadWmsTplAux(objLayer, null);
    } else {
        console.warn("Function " + callbackFunction + "() do not exists. Please, define it.");
    }
}

function loadWmts(callbackFunction, objLayer) {
    if (typeof callbackFunction === 'function') {
        return callbackFunction(objLayer);
    } else {
        console.warn("Function " + callbackFunction + "() do not exists. Please, define it.");
    }
}

function setCoordinatesFormat(coords) {
    let coordsFormatted = '';
    coords.forEach(coord => {
        //console.log(`${coord[0]}%20${coord[1]},`)
        coordsFormatted += `${coord[0]}%20${coord[1]},`;
    });
    //Add first point again
    coordsFormatted += `${coords[0][0]}%20${coords[0][1]}`;
    return coordsFormatted;
}

async function getLayerDataByWFS(coords, type, layerData) {
    let url = ''
    if (type === 'polygon' || type === 'rectangle') {
        const coordsFormatted = setCoordinatesFormat(coords);
        url = `${layerData.host}/ows?service=wfs&version=1.0.0&request=GetFeature&typeName=${layerData.section}:${layerData.name}&outputFormat=application%2Fjson&CQL_FILTER=INTERSECTS(geom,POLYGON((${coordsFormatted})))`;
    }else if (type === 'circle'){
        url = `${layerData.host}/ows?service=wfs&version=1.1.0&request=GetFeature&typeName=${layerData.section}:${layerData.name}&outputFormat=application%2Fjson&CQL_FILTER=DWITHIN(geom,POINT(${coords.lat}%20${coords.lng}),${coords.r},meters)`;
    }else if (type === 'marker'){
        url = `${layerData.host}/ows?service=wfs&version=1.1.0&request=GetFeature&typeName=${layerData.section}:${layerData.name}&outputFormat=application%2Fjson&CQL_FILTER=INTERSECTS(geom,POINT(${coords.lat}%20${coords.lng}))`;
    }else if(type === 'polyline'){
        const coordsFormatted = setCoordinatesFormat(coords);
        url = `${layerData.host}/ows?service=wfs&version=1.0.0&request=GetFeature&typeName=${layerData.section}:${layerData.name}&outputFormat=application%2Fjson&CQL_FILTER=INTERSECTS(geom,LINESTRING(${coordsFormatted}))`;
    }

    const response = await fetch(url);
    if (response.status !== 200)
        return null;
    return await response.json();
}

function loadMapaBase(tmsUrl, layer, attribution) {
    if (typeof loadMapaBaseTpl === 'function') {
        return loadMapaBaseTpl(tmsUrl, layer, attribution);
    } else {
        console.warn("Function loadMapaBaseTpl() do not exists. Please, define it.");
    }
}

function loadMapaBaseBing(bingKey, layer, attribution) {
    if (typeof loadMapaBaseBingTpl === 'function') {
        return loadMapaBaseBingTpl(bingKey, layer, attribution);
    } else {
        console.warn("Function loadMapaBaseBingTpl() do not exists. Please, define it.");
    }
}

function loadTemplateStyleConfig(template, isDefaultTemplate) {
    try {
    const STYLE_PATH = isDefaultTemplate ? 'src/config/default/styles/css/main.css' : 'src/config/styles/css/main.css';
      $('head').append(`<link rel="stylesheet" href=${STYLE_PATH}>`);
    } catch (error) {
      console.log(error);
    }
    
};

function setBaseLayersInfo(layers) {
    layers.forEach(layer => {
        baseLayersInfo[layer.nombre] = layer;
    });
}

function setBaseLayersZoomLevels(layers) {
    layers.forEach(layer => {
        baseLayers[layer.nombre] = layer.hasOwnProperty('zoom') ? { zoom: layer.zoom } : {};
    });
}

function setValidZoomLevel(baseLayer) {
    const zoom = mapa.getZoom();
    if (baseLayers.hasOwnProperty(baseLayer) && baseLayers[baseLayer].hasOwnProperty('zoom')) {
        const { min, max } = baseLayers[baseLayer].zoom;
        if (zoom < min || zoom > max) {
            mapa.setZoom(zoom < min ? min : max);
        }
        mapa.setMinZoom(min);
        mapa.setMaxZoom(max);
    } else {
        mapa.setMinZoom(DEFAULT_MIN_ZOOM_LEVEL);
        mapa.setMaxZoom(DEFAULT_MAX_ZOOM_LEVEL);
    }
};

function setSelectedBasemapAsActive(layerName, availableBasemaps) {
    const baseLayerId = 'child-mapasbase' + availableBasemaps.findIndex(basemap => basemap === layerName);
    gestorMenu.addActiveLayer(layerName);
    gestorMenu.setLastBaseMapSelected(layerName);
    gestorMenu.setBasemapSelected(baseLayerId);
};

//Orden de prioridad:
//1. Declarado en url.
//2. Marcado en json como selected: true.
//3. Si los casos anteriores no se dan, se elige el primer mapa base declarado en el json.
function setBasemapToLoad(urlLayers, availableBasemaps) {
    const basemap = availableBasemaps[0];
    for (let i = 0; i < urlLayers.length; i++) {
        if (availableBasemaps.find(availableBasemap => availableBasemap === urlLayers[i])) {
            const selected = urlLayers[i];
            setSelectedBasemapAsActive(selected, availableBasemaps);
            urlLayers.splice(i, 1);
            urlInteraction.layers = urlLayers;
            return baseLayersInfo[selected];
        }
    }
    for (const baseLayer of availableBasemaps) {
        if (baseLayersInfo[baseLayer].hasOwnProperty('selected') && baseLayersInfo[baseLayer].selected) {
            setSelectedBasemapAsActive(baseLayer, availableBasemaps);
            return baseLayersInfo[baseLayer];
        }
    }
    setSelectedBasemapAsActive(basemap, availableBasemaps);
    return baseLayersInfo[basemap];
};

function setProperStyleToCtrlBtns() {
    const zoomhomeCtrlBtn = document.getElementsByClassName('leaflet-control-zoomhome-home');
    const interval = setInterval(() => {
        if (zoomhomeCtrlBtn.length > 0) {
            window.clearInterval(interval);
            const width = zoomhomeCtrlBtn[0].offsetWidth;
            const btns = [];
            const layersToggleCtrlBtn= document.getElementsByClassName('leaflet-control-layers-toggle')[0];
            btns.push(layersToggleCtrlBtn);
            const customGraticuleCtrlBtn= document.getElementsByClassName('leaflet-control-customgraticule')[0];
            btns.push(customGraticuleCtrlBtn);
            const modalGeojsonCtrlBtn= document.getElementById('modalgeojson');
            btns.push(modalGeojsonCtrlBtn);
            const screenshotCtrlBtn= document.getElementById('screenshot');
            btns.push(screenshotCtrlBtn);
            btns.forEach(btn => {
                btn.style.width = width + 'px';
                btn.style.height = width + 'px';
                btn.style.border = 'none';
                btn.style.boxShadow = '0 1px 5px rgb(0 0 0 / 65%)';
            });
        }
    }, 100);
};
