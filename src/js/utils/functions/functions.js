// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");
var loadTableAsPopUp = false;
var tableFeatureCount = 20;
var loadCharts = false;
var loadSearchbar = false;
var loadLayerOptions = false;
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

function setSearchbar(cond) {
    loadSearchbar = cond;
 }

 function setLayerOptions(cond) {
    loadLayerOptions = cond;
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
    image.src = ERROR_IMG;
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

async function getWfsLayerFields(url, params) {
    let _params = { 
        typeName: params.typeName, 
        service: params.service, 
        version: params.version,
        request: 'DescribeFeatureType',
        outputFormat: params.outputFormat
    }, paramsStr = [], res, geom;

    Object.entries(_params).forEach( p => {
        paramsStr.push(p.join('='));
    });
    url += '/ows?' + paramsStr.join('&');
    
    let response = await fetch(url);

    if (response.ok) {
      res = await response.json();
      res.featureTypes[0].properties.forEach((field) => {
        // (geometry.isValidType(field.localType)) ? geom = field.name : console.error('Incorrect geometry field name. Check out the WFS capabilities document.');
        let lc = field.localType;
        if (lc === 'Geometry' || lc === 'Point' || lc === 'MultiPoint' || lc === 'Polygon' || lc === 'MultilineString' || lc === 'MultiPolygon') {
          geom = field.name;
        }
      });
    } else {
      alert("HTTP-Error: " + response.status);
    }

    return geom;

}

/**
 * Returns the projection type through a GetCapabilities request from the WFS service.
 * @param {String} api where to look for the CRS type
 * @returns only the number of the projection ex: 22183
 */
 function getCRSByWFSCapabilities(api){
    // TODO falta implementar reject para manejar el error
    return new Promise((resolve,reject)=>{
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var xmlDoc = this.responseXML;
                // Element: <DefaultCRS>
                xmlDoc.getElementsByTagName('DefaultCRS');
                let crs = xmlDoc.getElementsByTagName('DefaultCRS')[0].innerHTML;
                // The format of DefaultCRS is "urn:ogc:def:crs:EPSG::22183"
                // TODO mejora a través de definiciones -> proj4.defs('urn:x-ogc:def:crs:EPSG::4326', proj4.defs('EPSG:4326'));
                resolve(crs.split('::')[1]);
            }else if(this.readyState == 4 && this.status != 200){
                reject(null)
            }
        };
        xhttp.open("GET", api, true);
        xhttp.send();
    })
}

function getLayerDataByWFS(coords, type, layerData) {
    return new Promise((resolve) => {
        // Make the url to retrieve the request
        // If the host has the / wms parameter it is replaced by an empty string
        let fixHost = layerData.host.replace('/wms','');
        let capabilitiesUrl = `${fixHost}/${layerData.name}/ows?service=wfs&request=GetCapabilities`;        // Where to save the reprojection
        
        let reprojectedCoords = [];
        // Get the CRS
        getCRSByWFSCapabilities(capabilitiesUrl).then((crs)=>{
            if (crs != '84') {
                // const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";
                // // const epsg3857 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
                // const posgar94 = "+proj=tmerc +lat_0=-90 +lon_0=-66 +k=1 +x_0=3500000 +y_0=0 +ellps=WGS84 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
                
                // If the CRS is not 84, reproject the coords
                coords.forEach((coordsPair,i) => {
                    let result = proj4(proj4('WGS84'),proj4(PROJECTIONS[crs]),coordsPair);
                    // coords[i] = result;
                    reprojectedCoords[i] = result;
                });

                // Make the url to retrive WFS data
                let url = layerData.host, params = {
                    service: 'wfs',
                    request: 'GetFeature',
                    version: '',
                    outputFormat: 'application%2Fjson',
                    typeName: layerData.name,
                    cql_filter: ''
                }
                let paramsStr = [];
                getWfsLayerFields(url, params).then((geom) => {
                    if (type === 'polygon' || type === 'rectangle') {
                        const coordsFormatted = setCoordinatesFormat(reprojectedCoords);
                        params.version += '1.0.0', params.cql_filter += `INTERSECTS(${geom},POLYGON((${coordsFormatted})))`;
                    }
                    if (type === 'circle'){
                        params.version += '1.1.0', params.cql_filter += `DWITHIN(${geom},POINT(${reprojectedCoords.lat}%20${reprojectedCoords.lng}),${reprojectedCoords.r},meters)`;
                    }
                    if (type === 'marker'){
                        params.version += '1.1.0', params.cql_filter += `INTERSECTS(${geom},POINT(${reprojectedCoords.lat}%20${reprojectedCoords.lng}))`;
                    }
                    if(type === 'polyline'){
                        const coordsFormatted = setCoordinatesFormat(reprojectedCoords);
                        params.version += '1.0.0', params.cql_filter += `INTERSECTS(${geom},LINESTRING(${coordsFormatted}))`;
                    }

                    Object.entries(params).forEach( p => {
                        paramsStr.push(p.join('='));
                    });
                    url += '/ows?' + paramsStr.join('&');
                
                    fetch(url).then((response) => {
                        if (response.status !== 200)
                            resolve(null);
                         resolve(response.json());
                    });
                })
            }
        }).catch(()=>{
            console.info('The host does not provide capabilities for the WFS service');
            //Test
            // TODO Obtener el CRS a través del get capabilities del servicio WMS (gestorMenu.items[k].itemComposite.capa)
            // coords.forEach((coordsPair,i) => {
            //     let result = proj4(proj4('WGS84'),proj4(PROJECTIONS['22185']),coordsPair);
            //     // coords[i] = result;
            //     coords[i] = result;
            // });
            let url = layerData.host, params = { 
                service: 'wfs',
                request: 'GetFeature',
                version: '',
                outputFormat: 'application%2Fjson',
                typeName: layerData.name,
                cql_filter: ''
            }, paramsStr = [];

            getWfsLayerFields(url, params).then((geom)=> {
                if (type === 'polygon' || type === 'rectangle') {
                    const coordsFormatted = setCoordinatesFormat(coords);
                    params.version += '1.0.0', params.cql_filter += `INTERSECTS(${geom},POLYGON((${coordsFormatted})))`;
                }
                if (type === 'circle'){
                    params.version += '1.1.0', params.cql_filter += `DWITHIN(${geom},POINT(${coords.lat}%20${coords.lng}),${coords.r},meters)`;
                }
                if (type === 'marker'){
                    params.version += '1.1.0', params.cql_filter += `INTERSECTS(${geom},POINT(${coords.lat}%20${coords.lng}))`;
                }
                if(type === 'polyline'){
                    const coordsFormatted = setCoordinatesFormat(coords);
                    params.version += '1.0.0', params.cql_filter += `INTERSECTS(${geom},LINESTRING(${coordsFormatted}))`;
                }
            
                Object.entries(params).forEach( p => {
                    paramsStr.push(p.join('='));
                });
                url += '/ows?' + paramsStr.join('&');
            
                fetch(url).then((response) => {
                    if (response.status !== 200)
                        resolve(null);
                    resolve(response.json());
                })
            })
        })
    })
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

function adaptToImage(imgDiv) {
  
  let img = imgDiv.childNodes[0], item = imgDiv.closest("li");
  if (img.naturalHeight > 22) {
    let resize_img_icon = document.createElement("div");
    resize_img_icon.className = "resize-legend-combobox";
    resize_img_icon.style = "align-self: center;font-size: 14px";
    resize_img_icon.innerHTML = '<i class="fas fa-angle-down" aria-hidden="true"></i>';

    let container_expand_legend_grafic = document.createElement("div");
    container_expand_legend_grafic.className = "expand_legend_grafic";
    container_expand_legend_grafic.style = "overflow:hidden;";
    container_expand_legend_grafic.setAttribute("load", false);

    let max_url_img = img.src.replace("off", "on");
    container_expand_legend_grafic.innerHTML = `<img class='legend-img-max' loading='lazy'  src='${max_url_img}'></img>`;

    resize_img_icon.onclick = () => {
      if (container_expand_legend_grafic.getAttribute("load") === "true") {
        container_expand_legend_grafic.className = "hidden";
        container_expand_legend_grafic.setAttribute("load", false);
        resize_img_icon.innerHTML = '<i class="fas fa-angle-down" aria-hidden="true"></i>';
      } else {
        container_expand_legend_grafic.classList.remove("hidden");
        container_expand_legend_grafic.setAttribute("load", true);
        container_expand_legend_grafic.style = "background-color: white;";
        resize_img_icon.innerHTML = '<i class="fas fa-angle-up" aria-hidden="true"></i>';
        item.append(container_expand_legend_grafic);
      }
    };

    imgDiv.removeChild(img);
    imgDiv.append(resize_img_icon);
    imgDiv.title = "abrir leyenda";
  }
}

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

let normalize = (function() {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
        to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
        mapping = {};
   
    for(var i = 0, j = from.length; i < j; i++ )
        mapping[ from.charAt( i ) ] = to.charAt( i );
   
    return function( str ) {
        var ret = [];
        for( var i = 0, j = str.length; i < j; i++ ) {
            var c = str.charAt( i );
            if( mapping.hasOwnProperty( str.charAt( i ) ) )
                ret.push( mapping[ c ] );
            else
                ret.push( c );
        }      
        return ret.join( '' ).replace( /[^-A-Za-z0-9]+/g, '-' ).toLowerCase();
    }
   
  })();

  function clickGeometryLayer(layer){
    let aux = document.getElementById("li-"+layer)
  
    if(aux.className === "capa list-group-item active"){
      aux.className = "capa list-group-item" 
      mapa.hideGroupLayer(layer)
    }
    else{
      aux.className = "capa list-group-item active"
      mapa.showGroupLayer(layer)
    }
}

function deleteLayerGeometry(layer){
    mapa.removeGroup(layer, true);
    let id = "#li-"+layer
    let parent = $(id).parent()[0]
    
    if(parent && parent.childElementCount<=1){
        let index = parent.id.indexOf("-panel-body")
        let lista = "#lista-"+parent.id.substr(0,index)
        $(lista).remove();
    }else{
        $(id).remove();
    }

}

function controlSeccionGeom(){
	let aux = mapa.groupLayers
	for (n in aux){
		if(aux[n].length===0){
			deleteLayerGeometry(n)
		}
	}
}

function zoomEditableLayers(layername){
    let layer = mapa.groupLayers.hasOwnProperty(layername)
   //console.log(layer)
   if (layer.type === 'marker' || layer.type === 'circlemarker') {
    mapa.fitBounds(L.latLngBounds([layer.getLatLng()]));
    } else {
        mapa.fitBounds(layer.getBounds());
    }
}

  function bindZoomLayer(){

    let elements = document.getElementsByClassName("zoom-layer");
    let zoomLayer = async function() {
        let layer_name = this.getAttribute("layername")
        let bbox = app.layers[layer_name].capa
            //if (bbox.servicio === "wms" && typeof bbox.maxy == "null" || typeof bbox.maxy == "undefined") {
            if (bbox.servicio === "wms" && [bbox.minx,bbox.legendURL].some(el => el === null || 'undefined')) {
                await getWmsLyrParams(bbox); // gets layer atribtutes from WMS
            }

        if (bbox.maxy == "null" || typeof bbox.maxy == "undefined"){
            for (i = 0; i < this.childNodes.length; i++) {
                if (this.childNodes[i].className == "fas fa-search-plus") {
                  this.childNodes[i].classList.remove('fa-search-plus');
                  this.childNodes[i].classList.add('fa-exclamation-triangle');
                  //this.childNodes[i].setAttribute('style', 'color: orange');
                  this.childNodes[i].setAttribute('title', 'Invalid bbox in WMS response');
                  break;
                }        
            }
        }

        //si la capa no esta activa activar
        let activas = gestorMenu.activeLayers
        let active = false
        activas.forEach(function(key) {
            if(key===layer_name)
            active = true
          })
        if(!active)gestorMenu.muestraCapa(app.layers[layer_name].childid)
        let bounds = [[bbox.maxy, bbox.maxx], [bbox.miny, bbox.minx]];
        try {
            mapa.fitBounds(bounds);
        } catch (error) {
            console.error(error);
        }
    };
    
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', zoomLayer, false);
    }

  }

  function bindLayerOptions(){

    let elements = document.getElementsByClassName("layer-options-icon");
    let layerOptions = function() {
        let layername = this.getAttribute("layername")
        if(!app.layers[layername].display_options){
            menu_ui.addLayerOptions(layername)
        }else{
            menu_ui.closeLayerOptions(layername)
        }
    };
    
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', layerOptions, false);
    }

  }


  //add funcion with setTimeout 
  //fix bug--->  line 553 entities.js 
  //no funciona para todos los templates
     window.onload = function() {
        setTimeout(function(){ 
            bindZoomLayer()
            bindLayerOptions()
         }, 2000);
      };


      function bindLayerOptionsIdera(){
          setTimeout(function(){ 
            bindZoomLayer()
            bindLayerOptions()
         }, 1000);
      }


function zoomLayer(id_dom) {
  let nlayer = app.layerNameByDomId[id_dom];
  let bbox = app.layers[nlayer].capa;
  //solo sii la capa no esta activa activar
  let activas = gestorMenu.activeLayers;
  let active = false;
  activas.forEach(function (key) {
    if (key === nlayer) active = true;
  });
  if (!active) gestorMenu.muestraCapa(app.layers[nlayer].childid);

  let bounds = [
    [bbox.maxy, bbox.maxx],
    [bbox.miny, bbox.minx],
  ];
  try {
    mapa.fitBounds(bounds);
  } catch (error) {
    //console.log(bounds);
  }
}

async function getWmsLyrParams(lyr) {
  //let url = `${lyr.host}/${lyr.nombre}/ows?service=${lyr.servicio}&version=${lyr.version}&request=GetCapabilities`,
  let url = `${lyr.host}?service=${lyr.servicio}&version=${lyr.version}&request=GetCapabilities`,
    sys = lyr.version === "1.3.0" ? "CRS" : "SRS";
  await fetch(url)
    .then((res) => res.text())
    .then((str) => {
      parseXml(str, lyr, sys);
    })
    .catch((err) => {
      console.error(err);
    });
}

function parseXml(str, lyr, sys) {
    let xmlLyr, parser = new DOMParser(), xmlDoc, xmlNodes;
    try {
        xmlDoc = parser.parseFromString(str, "text/xml");
    } catch (error) { }
    xmlDoc.documentElement.nodeName == "parsererror"
        ? console.error("error while parsing")
        : (xmlNodes = xmlDoc.getElementsByTagName("Name"));

    if (xmlNodes) {
        for (i = 0; i < xmlNodes.length; i++) {
            if (xmlNodes[i].childNodes[0].nodeValue === lyr.nombre) {
                xmlLyr = xmlNodes[i].parentNode;
            }
        }

        let bboxNodes = xmlLyr.getElementsByTagName("BoundingBox");
        lyr.legendURL =
            xmlLyr.getElementsByTagName("OnlineResource")[0].attributes["xlink:href"].value;

        for (i = 0; i < bboxNodes.length; i++) {
            if (lyr.minx === null || typeof lyr.minx === "undefined") {
                let srs = bboxNodes[i].attributes[sys];
                if (srs.value === sys + ":4326" ||
                    srs.value === sys + ":84") {
                    lyr.minx = bboxNodes[i].attributes["minx"].value;
                    lyr.miny = bboxNodes[i].attributes["miny"].value;
                    lyr.maxx = bboxNodes[i].attributes["maxx"].value;
                    lyr.maxy = bboxNodes[i].attributes["maxy"].value;
                    lyr.srs = srs.value;
                } else {
                    console.info(
                        `Layer SRS is ${srs.value}, not supported for zoom to layer yet.`
                    );
                }
            }
        }
    }
}
