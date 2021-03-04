// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");

var loadTableAsPopUp = false;
var tableFeatureCount = 20;
var loadCharts = false;

function setTableAsPopUp(cond) {
    loadTableAsPopUp = cond;
}

function setTableFeatureCount(value) {
    tableFeatureCount = value;
}

function setCharts(cond) {
   loadCharts = cond;
}

XMLHttpRequest.prototype.open = (function(open) {

    return function(method, url, async) {
        if (loadTableAsPopUp && url.includes("&request=GetFeatureInfo")){
            url += `&feature_count=${tableFeatureCount}`;
        }
        open.apply(this,arguments);
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
    switch(template) {
      case 'argenmap-leaflet-bahra-tpl': {
        $('head').append(`<link rel="shortcut icon" href="src/config/styles/images/favicon.ico" type="image/x-icon">`);
        $('head').append(`<link rel="icon" href="src/config/styles/images/favicon.ico" type="image/x-icon">`);

        //Change logotype
        $(document).prop('title', 'Base de Asentamientos Humanos de la República Argentina (BAHRA)');
        $('#top-left-logo-link').attr("href","//www.bahra.gob.ar/");
        $('#top-left-logo').attr("src","src/config/styles/images/logo.png");
        $('#top-left-logo').attr("alt","Base de Asentamientos Humanos de la República Argentina (BAHRA)");
        $('#top-left-logo').attr("title","Base de Asentamientos Humanos de la República Argentina (BAHRA)");
        $('#top-right-logo-link').attr("href","../descargas/mapa_ayuda.pdf");
        $('#top-right-logo').attr("src","src/config/styles/images/ayuda_de_pagina_blanco.svg");
        $('#top-right-logo').attr("alt","Ayuda");
        $('#top-right-logo').attr("title","Ayuda");
        $('#top-right-logo').css("width","35px");
        $('#top-right-logo').css("top","0px");
        //$('#top-right-logo-link').hide();
      }
      break;
      case 'argenmap-leaflet-idecom-tpl': {
        $('head').append(`<link rel="shortcut icon" href="https://www.ign.gob.ar/sites/default/files/favicon.png" type="image/x-icon" />`);
      
        //Change logotype
        $('#top-left-logo-link').attr("href","https://www.argentina.gob.ar/jefatura/innovacion-publica/ssetic");
        $('#top-left-logo').attr("src","src/config/styles/images/subseticlogo2.png");
        $('#top-left-logo').attr("alt","Logo Subsecretaría de Tecnologías de la Información y las Comunicaciones");
        $('#top-left-logo').attr("title","Subsecretaría de Tecnologías de la Información y las Comunicaciones");
        //$('#top-left-logo').css("width","100px");
        //$('#top-right-logo-link').attr("href","templates/argenmap-leaflet-ign-tpl/files/referencias.pdf");
        //$('#top-right-logo-link').attr("href","#");
        //$('#top-right-logo').attr("src","templates/argenmap-leaflet-ign-tpl/img/referencias_icono.png");
        //$('#top-right-logo').attr("alt","Referencias");
        //$('#top-right-logo').attr("title","Referencias");
        //$('#top-right-logo').css("width","35px");
        //$('#top-right-logo').css("top","0px");
        /* 
        $('#top-right-logo').on('click', function() {
        event.preventDefault();
        //$.fancybox.open( '<div class="message"><h2>Referencias</h2><p><img src="templates/argenmap-leaflet-ign-tpl/img/referencias.png" style="width:50%"></p></div>' );
        //$.fancybox.getInstance();
        //$(".fancybox").fancybox({"width":400,"height":300});
        $.fancybox.open({
            src : 'templates/argenmap-leaflet-ign-tpl/img/referencias.png',
            type : 'image',
            closeBtn: 'true'
        });
        }); */
      }
      break;
      case 'argenmap-leaflet-idera-tpl': {
        $('head').append(`<link rel="shortcut icon" href="https://www.ign.gob.ar/sites/default/files/favicon.png" type="image/x-icon" />`);
      
        //Change logotype
        $(document).prop('title', 'IDERA - Argenmap');
        $('#top-left-logo-link').attr("href","https://www.idera.gob.ar/");
        $('#top-left-logo').attr("src","src/config/styles/images/logo.png");
        $('#top-left-logo').attr("alt","Logo IDERA");
        $('#top-left-logo').attr("title","Infraestructura de Datos Espaciales de la República Argentina");
        /*
        $('#top-right-logo-link').attr("href","https://www.argentina.gob.ar/defensa");
        $('#top-right-logo').attr("src","templates/argenmap-leaflet-idera-tpl/img/logoMinDef.png");
        $('#top-right-logo').attr("alt","Logo Ministerio de Defensa");
        $('#top-right-logo').attr("title","Ministerio de Defensa");
        */
        $('#top-right-logo-link').hide();
      }
      break;
      case 'argenmap-leaflet-ign-tpl': {
        $('head').append(`<link rel="shortcut icon" href="https://www.ign.gob.ar/sites/default/files/favicon.png" type="image/x-icon" />`);

        //Change logotype
        $('#top-left-logo-link').attr("href","https://www.ign.gob.ar/");
        //$('#top-left-logo').attr("src","templates/argenmap-leaflet-ign-tpl/img/logo.png");
        $('#top-left-logo').attr("alt","Logo Instituto Geográfico Nacional");
        $('#top-left-logo').attr("title","Instituto Geográfico Nacional");
        //$('#top-left-logo').css("width","100px");
        //$('#top-right-logo-link').attr("href","templates/argenmap-leaflet-ign-tpl/files/referencias.pdf");
        $('#top-right-logo-link').attr("href","#");
        $('#top-right-logo').attr("src","src/styles/images/referencias_icono.png");
        $('#top-right-logo').attr("alt","Referencias");
        $('#top-right-logo').attr("title","Referencias");
        //$('#top-right-logo').css("width","35px");
        //$('#top-right-logo').css("top","0px");
        $('#top-right-logo').on('click', function() {
            event.preventDefault();
            //$.fancybox.open( '<div class="message"><h2>Referencias</h2><p><img src="templates/argenmap-leaflet-ign-tpl/img/referencias.png" style="width:50%"></p></div>' );
            //$.fancybox.getInstance();
            //$(".fancybox").fancybox({"width":400,"height":300});
            $.fancybox.open({
                src : 'src/styles/images/referencias.png',
                type : 'image',
                closeBtn: 'true'
            });
        });
      }
      break;
      case 'argenmap-leaflet-mindef-tpl': {
        $('head').append(`<link rel="shortcut icon" href="src/config/styles/images/favicon.ico" type="image/x-icon" />`);

        //Change logotype
        document.title = "Ministerio de Defensa";
        $('#top-left-logo-link').attr("href","https://www.argentina.gob.ar/defensa");
        /* $('#top-left-logo').attr("src","templates/argenmap-leaflet-mindef-tpl/img/logo.svg"); */
        $('#top-left-logo').attr("alt","Logo Ministerio de Defensa");
        $('#top-left-logo').attr("title","Ministerio de Defensa");
        /* Reemplazado por referencias */
        /*
        $('#top-right-logo-link').attr("href","https://www.argentina.gob.ar/");
        $('#top-right-logo').attr("src","templates/argenmap-leaflet-mindef-tpl/img/right_logo.svg");
        $('#top-right-logo').attr("alt","Argentina Unida");
        $('#top-right-logo').attr("title","Ministerio de Defensa");
        */
        $('#top-right-logo-link').attr("href","#");
        $('#top-right-logo').attr("src","src/styles/images/referencias_icono.png");
        $('#top-right-logo').attr("alt","Referencias");
        $('#top-right-logo').attr("title","Referencias");
        $('#top-right-logo').on('click', function() {
            event.preventDefault();
            //$.fancybox.open( '<div class="message"><h2>Referencias</h2><p><img src="templates/argenmap-leaflet-mindef-tpl/img/referencias.png" style="width:50%"></p></div>' );
            //$.fancybox.getInstance();
            //$(".fancybox").fancybox({"width":400,"height":300});
            $.fancybox.open({
                src : 'src/styles/images/referencias.png',
                type : 'image',
                closeBtn: 'true'
            });
        });
      }
      break;
      case 'argenmap-leaflet-muni-tpl': {
        $('head').append(`<link rel="shortcut icon" href="https://www.pehuajo.gob.ar/favicon.ico?m=1" type="image/x-icon" />`);

        const muni = "Municipalidad de Pehuajó";
        const munilink = "http://www.pehuajo.gob.ar/";
        document.title = muni;
        //Change logotype
        $('#top-left-logo-link').attr("href", munilink);
        $('#top-left-logo').attr("alt", muni);
        $('#top-left-logo').attr("title", muni);
        $('#top-right-logo-link').attr("href","#");
        $('#top-right-logo').attr("src","src/styles/images/referencias_icono.png");
        $('#top-right-logo').attr("alt","Referencias");
        $('#top-right-logo').attr("title","Referencias");
        $('#top-right-logo').on('click', function() {
            event.preventDefault();
            //$.fancybox.open( '<div class="message"><h2>Referencias</h2><p><img src="templates/argenmap-leaflet-muni-tpl/img/referencias.png" style="width:50%"></p></div>' );
            //$.fancybox.getInstance();
            //$(".fancybox").fancybox({"width":400,"height":300});
            $.fancybox.open({
                src : 'src/styles/images/referencias.png',
                type : 'image',
                closeBtn: 'true'
            });
        });
      }
      break;
      case 'ign-geoportal-basic': {
        $('head').append(`<link rel="shortcut icon" href="https://www.ign.gob.ar/sites/default/files/favicon.png" type="image/x-icon" />`);

        //Change logotype
        $('#top-left-logo-link').attr("href","https://www.ign.gob.ar/");
        $('#top-left-logo').attr("src","src/config/default/styles/images/logo.png");
        $('#top-left-logo').attr("alt","Logo Instituto Geográfico Nacional");
        $('#top-left-logo').attr("title","Instituto Geográfico Nacional");
        $('#top-right-logo-link').attr("href","https://www.argentina.gob.ar/defensa");
        $('#top-right-logo').attr("src","src/config/default/styles/images/logoMinDef.png");
        $('#top-right-logo').attr("alt","Logo Ministerio de Defensa");
        $('#top-right-logo').attr("title","Ministerio de Defensa");
      }
      break;
    }
};

function setBaseLayersZoomLevels(layers) {
    layers.forEach(layer => {
        if (layer.hasOwnProperty('zoom'))
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
