//Load WMS and other stuff functions
mapa.on('click', function(e) {
    setTimeout(function(){
        popupInfo = new Array();
    }, 2000);
});
            
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
