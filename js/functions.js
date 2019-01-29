// -- Plugins Control
var plugins = new Array("loadGeojson", "loadWms");

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

//Paginate FeatureInfo into popup
function paginateFeatureInfo(infoArray, actualPage, hasPrev, hasNext) {
    var infoStr = infoArray.join('');
    //console.log(infoStr);
    if (infoArray.length > 1) {
        for (var i = 0; i < infoArray.length; i++) {
            if (i == actualPage) {
                var sAux = '';
                if (hasPrev == true) {
                    sAux += '<a href="javascript:;" onClick="changePopupPage(\'prev\')" id="popupPageSeekerPrev"><i class="fas fa-arrow-left"></i></a>';
                }
                if (hasNext == true) {
                    sAux += '<a href="javascript:;" onClick="changePopupPage(\'next\')" id="popupPageSeekerNext"><i class="fas fa-arrow-right"></i></a>';
                }
                infoStr = infoStr.replace('<div class="featureInfo" id="featureInfoPopup' + i + '">', '<div id="popupPageSeeker">' + sAux + '</div><div class="featureInfo" id="featureInfoPopup' + i + '">');
            } else {
                infoStr = infoStr.replace('<div class="featureInfo" id="featureInfoPopup' + i + '">', '<div class="featureInfo" style="display:none" id="featureInfoPopup' + i + '">');
            }
        }
    }
    return infoStr;
}
    
var popupInfo = new Array(); //Declare popupInfo (this initialize in mapa.js)
var popupInfoToPaginate = new Array();
var popupInfoPage = 0;
var latlngTmp = '';
function loadWms(wmsUrl, layer) {
    if (overlayMaps.hasOwnProperty(layer)) {
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];
    } else {
        createWmsLayer(wmsUrl, layer);
        overlayMaps[layer].addTo(mapa);
    }
    
    function ucwords (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //Parse FeatureInfo to display into popup
    function parseFeatureInfo(info, idTxt) {
        $(info).find('li').each(function( index ) {
            //console.log( index + ": " + $( this ).text() );
            var aux = $( this ).text().split(':');
            info = info.replace('<b>' + aux[0] + '</b>:', '<b>' + ucwords(aux[0].replace(/_/g, ' ')) + ':</b>');
        });
        
        info = info.replace('class="featureInfo"', 'class="featureInfo" id="featureInfoPopup' + idTxt + '"');
        
        return info;
    }
    
    function createWmsLayer(wmsUrl, layer) {
        //Extends WMS.Source to customize popup behavior
        var MySource = L.WMS.Source.extend({
            'showFeatureInfo': function(latlng, info) {
                if (!this._map) {
                    return;
                }
                //console.log(info);
                infoAux = info.search("<ul>"); // search if info has a list
                if (infoAux > 0) { // check if info has any content, if so shows popup
                    var popupContent = $('.leaflet-popup').html();
                    if (popupContent == undefined || popupContent == '' || popupInfo == '') {
                        popupInfo.push(parseFeatureInfo(info, popupInfo.length)); //First info for popup
                    } else {
                        popupInfo.push(parseFeatureInfo(info, popupInfo.length)); //More info for popup
                    }
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
        var wmsSource = new MySource(wmsUrl + "/wms?", {
            transparent: true,
            tiled: true,
            format: 'image/png',
            INFO_FORMAT: 'text/html'
        });
        overlayMaps[layer] = wmsSource.getLayer(layer);
    }
}

function changePopupPage(changeType) {
    
    //$('#featureInfoPopup' + popupInfoPage).hide();
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
    //$('#featureInfoPopup' + popupInfoPage).show();
    
    //var sAux = '';
    if ((popupInfoPage - 1) >= 0) {
        //sAux += '<a href="javascript:;" onClick="changePopupPage(\'prev\')" id="popupPageSeekerPrev"><i class="fas fa-arrow-left"></i></a>';
        hasPrev = true;
    }
    if (popupInfoToPaginate.length > (popupInfoPage + 1)) {
        //sAux += '<a href="javascript:;" onClick="changePopupPage(\'next\')" id="popupPageSeekerNext"><i class="fas fa-arrow-right"></i></a>';
        hasNext = true;
    }
    //$('#popupPageSeeker').html(sAux);
    
    mapa.openPopup(paginateFeatureInfo(popupInfoToPaginate, popupInfoPage, hasPrev, hasNext), latlngTmp); //Show all info
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

function deg_to_dms (deg) {
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
    image.src = "img/noimage.gif";
    return true;
}
