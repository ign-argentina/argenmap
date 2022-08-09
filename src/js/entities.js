'use strict';

const EmptyTab = 'main-menu-tab-';
const ItemGroupPrefix = 'lista-';

/******************************************
Class Capa
******************************************/
class Capa {
    constructor(nombre, titulo, srs, host, servicio, version, featureInfoFormat, key, minx, maxx, miny, maxy,attribution,legendURL) {
        this.nombre = nombre
        this.titulo = titulo
        this.srs = srs
        this.host = host
        this.servicio = servicio
        this.version = version
        this.featureInfoFormat = featureInfoFormat
        this.key = key
        this.minx = minx
        this.maxx = maxx
        this.miny = miny
        this.maxy = maxy
        this.attribution = attribution
        this.legendURL = legendURL
    }

    getLegendURL() {
        if (this.host == null) {
            return '';
        }
        return this.host +
            '/ows?service=' + this.servicio + '&version=' + this.version + '&request=GetLegendGraphic&' +
            'format=image/png&layer=' + this.nombre;
    }

    getHostWMS() {
        if (this.host == null) {
            return '';
        }
        let owsHost = this.host;
        /* isMapserver = this.host.includes('cgi-bin');
        
        if (!isMapserver) {   
            if (this.servicio === "wms") { owsHost += "/wms?"};
            //if (this.servicio === "mapserver") { owsHost };
        } */
        if (this.servicio === "wms" && owsHost.includes("/geoserver") && !owsHost.endsWith("/wms")) { 
            owsHost += "/wms";
         };
        if (this.servicio === "wmts") { owsHost += "/gwc/service/wmts" };

        return owsHost;
    }
}

class CapaMapserver extends Capa {
    getHostWMS() {
        if (this.host == null) {
            return '';
        }
        return this.host + "?";
    }
}

/******************************************
Strategy para imprimir
******************************************/
class Impresor {
    imprimir(itemComposite) {
        return '';
    }
}


class ImpresorItemHTML extends Impresor {
    imprimir(item) {
        var childId = item.getId();
        let lyr = item.capa,
        legend,
        legendParams = '&Transparent=True&scale=1&LEGEND_OPTIONS=forceTitles:off;forceLabels:off;fontAntiAliasing:true;hideEmptyRules:true;dpi:111',
        aux = {
            ...item,
            'childid': childId,
            'display_options': false,
            'type': lyr.servicio,
        }; 
        app.setLayer(aux)
        app.layerNameByDomId[childId] = item.nombre;

        if ( lyr.legendURL === null || typeof lyr.legendURL === "undefined" || lyr.legendURL === "" ){
            if (lyr.servicio === 'wms') {
                lyr.legendURL = lyr.host + '?service=WMS&request=GetLegendGraphic&format=image%2Fpng&version=1.1.1&layer=' + lyr.nombre;
            } else {
                lyr.legendURL = item.legendImg || ERROR_IMG;
            }
        }
        legend = lyr.legendURL.includes('GetLegendGraphic') ? lyr.legendURL + legendParams : lyr.legendURL ;
        
        // following line adds layer when click is made
        //let legendImg = `<div class='legend-layer' onClick='gestorMenu.muestraCapa(\"${childId}\")'><img class='legend-img' style='width:20px;height:20px' loading='lazy' src='${legend}' onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'></div>`;
        let legendImg = `<div class='legend-layer'><img class='legend-img' style='width:20px;height:20px' loading='lazy' src='${legend}' onerror='showImageOnError(this);' onload='adaptToImage(this.parentNode)'></div>`;
        let activated = item.visible == true ? " active " : "", btnhtml = "";

        //if tab = combobox, img source from 
        /* if(item.listType === "combobox"){
            //let url_img = lyr.legendURL + legendParams; 
            legendImg = "<div class='legend-layer' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'><img class='legend-img' style='width:20px;height:20px' loading='lazy' src='" + legend + "' onerror='showImageOnError(this);'></div>";
        } */

        if (loadLayerOptions){
            btnhtml =  "<li id='" + childId + "' class='capa list-group-item" + activated + "' style='padding: 10px 1px 1px 1px;' >" + "<div class='capa-title'>" + legendImg + "<div class='name-layer' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'><a nombre=" + item.nombre + " href='#'>" + "<span data-toggle2='tooltip' title='" + item.descripcion + "'>" + (item.titulo ? item.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</span></div>" + "</a>" +"<div class='zoom-layer' layername="+item.nombre+"><i class='fas fa-search-plus' title='Zoom a capa'></i></div><div class='layer-options-icon' layername="+item.nombre+" title='Opciones'><i class='fas fa-angle-down'></i></div>"+
            "</div><div class='display-none' id=layer-options-"+item.nombre+"></div>" + "</li>"
        }
        else{
            btnhtml = "<li id='" + childId + "' class='capa list-group-item" + activated + "' style='padding: 10px 1px 10px 1px;' >" + "<div class='capa-title'>" + legendImg + "<div class='name-layer' style='align-self: center;' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'><a nombre=" + item.nombre + " href='#'>" +
            "<span data-toggle2='tooltip' title='" + item.descripcion + "'>" + (item.titulo ? item.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</span></div>" + "</a>" +"<div class='zoom-layer'  style='align-self: center;' layername="+item.nombre+"><i class='fas fa-search-plus' title='Zoom a capa'></i></div>" + "</div><div class='display-none' id=layer-options-"+item.nombre+"></div>" + "</li>"
        }
 
        return btnhtml;

    }
}


class ImpresorItemWMSSelector extends Impresor {
    imprimir(itemComposite) {

        var childId = itemComposite.getId();

        return "<option value='" + childId + "'>" +
            (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") +
            "</option>";

    }
}

class ImpresorItemCapaBaseHTML extends Impresor {
    imprimir(itemComposite) {
        
        var childId = itemComposite.getId();
        let aux = {
            ...itemComposite,
            'childid': childId,
            'display_options': false,
            'type': itemComposite.capa.servicio,
        }
        app.setLayer(aux)
        app.layerNameByDomId[childId] = itemComposite.nombre

        var titulo = (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre");

        let hillshadeSwitch = "";
        if (app.hillshade) {   
            let enableHillshade = app.hillshade.addTo.find(el => el === itemComposite.capa.nombre);
            if (enableHillshade) {
                hillshadeSwitch = `<div onclick="event.stopPropagation()"><input type="checkbox" id="switch" title="${itemComposite.capa.nombre}" onclick="switchHillShade(this.title)"/><label for="switch"><span class="tooltiptext">${app.hillshade.switchLabel}</span></label></div>`
            }
        }
            
        const iconSvg = `
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 92 92" enable-background="new 0 0 92 92" xml:space="preserve">
                <path fill="${DEFAULT_ZOOM_INFO_ICON_COLOR}" id="XMLID_89_" d="M43.3,73.8c-0.8,0-1.6-0.3-2.2-0.8c-1-0.8-1.5-2.1-1.2-3.4l4.9-25l-2.7,1.5c-1.7,0.9-3.8,0.4-4.8-1.3
                    c-0.9-1.7-0.4-3.8,1.3-4.8l9.3-5.3c1.2-0.7,2.7-0.6,3.8,0.2c1.1,0.8,1.6,2.2,1.4,3.5L48,64.4l4.2-1.8c1.8-0.8,3.8,0,4.6,1.8
                    c0.8,1.8,0,3.8-1.8,4.6l-10.3,4.5C44.3,73.7,43.8,73.8,43.3,73.8z M53.2,26c0.9-0.9,1.5-2.2,1.5-3.5c0-1.3-0.5-2.6-1.5-3.5
                    c-0.9-0.9-2.2-1.5-3.5-1.5c-1.3,0-2.6,0.5-3.5,1.5c-0.9,0.9-1.5,2.2-1.5,3.5c0,1.3,0.5,2.6,1.5,3.5c0.9,0.9,2.2,1.5,3.5,1.5
                    C51,27.5,52.3,27,53.2,26z M92,46C92,20.6,71.4,0,46,0S0,20.6,0,46s20.6,46,46,46S92,71.4,92,46z M84,46c0,21-17,38-38,38S8,67,8,46
                    S25,8,46,8S84,25,84,46z"
                />
            </svg>
        `;

        let minZoom = DEFAULT_MIN_ZOOM_LEVEL;
        let maxZoom = DEFAULT_MAX_ZOOM_LEVEL;
        const layer = baseLayers[gestorMenu.getLayerNameById(childId)];
        if (layer && layer.hasOwnProperty('zoom')) {
            minZoom = layer.zoom.min;
            maxZoom = layer.zoom.max;
        }

        return "<li id='" + childId + "' class='list-group-item' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'>" +
            "<div style='vertical-align:top'>" +
                "<div class='base-layer-item' nombre=" + itemComposite.nombre + " href='#'>" +
                    "<div class='base-layer-item-info'>" +
                        "<img loading='lazy' src='" + itemComposite.getLegendImg() + "' onerror='showImageOnError(this);' alt='" + titulo + "' class='img-rounded'>" +
                        "<div class='non-selectable-text'><p style='margin: 0px;'>" + titulo + "</p></div>" +
                    "</div>" + hillshadeSwitch +
                    "<div class='zoom-info-icon'>" + 
                        iconSvg + 
                        "<span class='tooltiptext'>" + "Zoom mínimo de " + "<b>" + minZoom + "</b>" + " y máximo de " + "<b>" + maxZoom + "</b>" + "</span>" +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</li>";
    }
}

class ImpresorGrupoHTML extends Impresor {
    imprimir(itemComposite) {
        
        var listaId = itemComposite.getId();
        var itemClass = 'menu5';
        let seccion = itemComposite.seccion;

        var active = (itemComposite.getActive() == true) ? ' in ' : '';

		return '<div id="' + listaId + '" class="' + itemClass + ' panel-default">' + 
					'<div class="panel-heading">' +
						'<h4 class="panel-title">' +
							'<a id="' + listaId + '-a" data-toggle="collapse" data-parent="#accordion1" href="#' + itemComposite.seccion + '" class="item-group-title">' + itemComposite.nombre + '</a>' +
							"<div class='item-group-short-desc'><a data-toggle='collapse' data-toggle2='tooltip' title='" + itemComposite.descripcion + "' href='#" + itemComposite.seccion + "'>" + itemComposite.shortDesc + "</a></div>" +
						'</h4>' +
					'</div>' +
					"<div id='" + itemComposite.seccion + "' class='panel-collapse collapse" + active + "'>" +
						'<div class="panel-body">' +
							itemComposite.itemsStr +
						'</div>' +
					'</div>' +
				'</div>';
    }
}

class ImpresorGroupWMSSelector extends Impresor {
    imprimir(itemComposite) {

        var listaId = itemComposite.getId();

        return "<option value='" + listaId + "'>" + itemComposite.nombre + "</option>";
    }
}

class ImpresorCapasBaseHTML extends Impresor {
    imprimir(itemComposite) {

        var listaId = itemComposite.getId();
        // Only one basemap-selector
        if ($(".basemap-selector a[data-toggle='collapse']").length == 0) {
            return '<a class="leaflet-control-layers-toggle pull-left" role="button" data-toggle="collapse" href="#collapseBaseMapLayers" aria-expanded="false" aria-controls="collapseExample" title="' + itemComposite.nombre + '"></a>' +
                '<div class="collapse pull-right" id="collapseBaseMapLayers">' +
                '<ul class="list-inline">' + itemComposite.itemsStr + '</ul>' +
                '</div>';
        }

    }
}


/******************************************
Strategy for get layers info
******************************************/
class LayersInfo {

    constructor() {
        this.allowed_layers = null;
        this.customized_layers = null;
    }

    setAllowebLayers(allowed) {
        this.allowed_layers = allowed;
    }

    setCustomizedLayers(customized_layers) {
        this.customized_layers = customized_layers;
    }

    isAllowebLayer(layer_name) {
        if (this.allowed_layers == null) {
            return true;
        }

        for (var i = 0; i < this.allowed_layers.length; i++) {
            if (this.allowed_layers[i] == layer_name) return true;
        }
        return false;
    }

    get(_gestorMenu) {
        //You must redefine this method to get layers from other sources
        return null;
    }

    formatLayerTitle(layer_name, layer_title) {
        if (this.customized_layers == null) {
            return layer_title;
        }
        if (this.customized_layers[layer_name] && this.customized_layers[layer_name]["new_title"]) {
            return this.customized_layers[layer_name]["new_title"];
        }
        return layer_title;
    }

    formatLayerAbstract(layer_name, layer_abstract) {
        if (this.customized_layers == null) {
            return layer_abstract;
        }
        if (this.customized_layers[layer_name] && this.customized_layers[layer_name]["new_abstract"]) {
            return this.customized_layers[layer_name]["new_abstract"];
        }
        return layer_abstract;
    }
}

class LayersInfoWMS extends LayersInfo {

    constructor(host, service, version, tab, section, weight, name, short_abstract, feature_info_format, type, icons, customizedLayers, itemGroupPrinter) {
        super();
        this.host = host;
        this.service = service;
        this.version = version;
        this.tab = tab;
        this.section = section;
        this.weight = weight;
        this.name = name;
        this.short_abstract = short_abstract;
        this.feature_info_format = feature_info_format;
        this.type = type;
        this.icons = icons || null;
        this.customizedLayers = (customizedLayers == "") ? null : customizedLayers;
        this.itemGroupPrinter = (itemGroupPrinter == "") ? new ImpresorGrupoHTML : itemGroupPrinter;

        this._executed = false;
    }

    
    get(_gestorMenu) {
        if (this._executed == false) {
            this._executed = true; //Indicates that getCapabilities executed

            //If lazyInit and have custimized layers, print layer after wms loaded (for searcher)
            if (_gestorMenu.getLazyInitialization() == true && this.customizedLayers != null) {
                const impresorItem = new ImpresorItemHTML();
                var itemGroup = _gestorMenu.getItemGroupById(ItemGroupPrefix + this.section);
                if (itemGroup != null) {
                    for (var key in this.customizedLayers) {
                        
                        let title = this.customizedLayers[key]["new_title"] || null, 
                            legend = this.customizedLayers[key]["legend"] || null,
                            keywords = this.customizedLayers[key]["new_keywords"] || null,
                            abstract = this.customizedLayers[key]["new_abstract"] || null;
                            
                        if (this.type == 'wmslayer_mapserver') {
                            var capa = new CapaMapserver(key, title, null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        } else {
                            var capa = new Capa(key,title,this.srs,this.host,this.service,this.version,this.feature_info_format,keywords,this.minx,this.maxx,this.miny,this.maxy,this.attribution,legend);
                            //var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY, null, ilegendURL);
                        }
                        //Generate keyword array
                        var keywordsAux = [];
                        if (keywords != null && keywords != '') {
                            keywordsAux = keywords.split(',');
                            for (var keykeywordsAux in keywordsAux) {
                                keywordsAux[keykeywordsAux] = keywordsAux[keykeywordsAux].trim();
                            }
                        }

                        var item = new Item(capa.nombre, this.section + clearString(capa.nombre), keywordsAux, abstract, capa.titulo, capa, this.getCallback(),null);
                        
                        gestorMenu.setAllLayersAreDeclaredInJson(true);
                        gestorMenu.setAvailableLayer(capa.nombre);
                        item.setImpresor(impresorItem);
                        if (itemGroup.getItemByName(this.section + capa.nombre) == null) {
                            itemGroup.setItem(item);
                        }
                    }
                }
                _gestorMenu.removeLazyInitLayerInfoCounter(ItemGroupPrefix + this.section);
                if (_gestorMenu.finishLazyInitLayerInfo(ItemGroupPrefix + this.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(this.section);
                }
            } else {
                this._parseRequest(_gestorMenu);
            }

        }
    }

    get_without_print(_gestorMenu) {
        this._parseRequest_without_print(_gestorMenu);
    }

    generateGroups(_gestorMenu) {
        const impresorGroup = this.itemGroupPrinter;
        const impresorItem = new ImpresorItemHTML();

        var thisObj = this;

        //Instance an empty ItemGroup (without items)
        var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
        groupAux.setImpresor(impresorGroup);
        groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
        _gestorMenu.addItemGroup(groupAux);
    }

    _parseRequest(_gestorMenu) {
        const impresorGroup = this.itemGroupPrinter;
        const impresorItem = new ImpresorItemHTML();

        var thisObj = this;

        var ilistType = null
        if(this.tab.listType){
            ilistType = this.tab.listType
        }

        if (!$('#temp-menu').hasClass('temp')) { $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>'); }

        // Load geoserver Capabilities, if success Create menu and append to DOM
        $('#temp-menu').load(thisObj.getHostOWS() + '?service=' + thisObj.service + '&version=' + thisObj.version + '&request=GetCapabilities', function () {
            var capability = $('#temp-menu').find("capability");
            var keywordHtml = $('#temp-menu').find("Keyword");
            var keyword = '';
            if (keywordHtml.length > 0) {
                keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
            }
            var abstractHtml = $('#temp-menu').find("Abstract");
            var abstract = '';
            if (abstractHtml.length > 0) {
                abstract = abstractHtml[0].innerText; // reads wms 1st abstract
            }
            var capas_layer = $('layer', capability);
            var capas_info = $('layer', capas_layer);

            var items = new Array();

            // create an object with all layer info for each layer
            capas_info.each(function (index, b) {
                var i = $(this);
                var iName = $('name', i).html();
                if (thisObj.isAllowebLayer(iName)) {

                    var iTitle = $('title', i).html();
                    iTitle = thisObj.formatLayerTitle(iName, iTitle);
                    var iAbstract = $('abstract', i).html();
                    iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
                    var keywordsHTMLList = $('keywordlist', i).find("keyword");
                    var keywords = [];
                    $.each(keywordsHTMLList, function (i, el) {
                        keywords.push(el.innerText);
                    });
                    var iBoundingBox = $('boundingbox', i);
                    var iSrs = null;
                    var iMaxY = null;
                    var iMinY = null;
                    var iMinX = null;
                    var iMaxX = null;
                    var ilegendURLaux= $('Style', i).html()
                    let divi =  document.createElement("div")
                    let aux = null
                    divi.innerHTML= ilegendURLaux;
                    var ilegendURL;
                    if (thisObj.icons) {
                        ilegendURL = thisObj.icons[iName];
                    } else {
                        if(divi.getElementsByTagName("onlineresource")){
                        aux = divi.getElementsByTagName("onlineresource")[0].getAttribute('xlink:href')
                        }
                        ilegendURL = aux
                    }
                    
                    if (iBoundingBox.length > 0) {
                        if (iBoundingBox[0].attributes.srs) {
                            var iSrs = iBoundingBox[0].attributes.srs.nodeValue;
                        } else {
                            var iSrs = iBoundingBox[0].attributes.crs.nodeValue;
                        }
                        var iMaxY = iBoundingBox[0].attributes.maxy.nodeValue;
                        var iMinY = iBoundingBox[0].attributes.miny.nodeValue;
                        var iMinX = iBoundingBox[0].attributes.minx.nodeValue;
                        var iMaxX = iBoundingBox[0].attributes.maxx.nodeValue;
                    }


                    if (thisObj.type == 'wmslayer_mapserver') {
                        var capa = new CapaMapserver(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY);
                    } else {
                        var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY, null, ilegendURL);
                        gestorMenu.layersDataForWfs[capa.nombre] = {
                            name: capa.nombre,
                            section: capa.titulo,
                            host: capa.host
                        }
                    }
                    var item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback(), ilistType);
                    item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
                    item.setImpresor(impresorItem);
                    items.push(item);
                    gestorMenu.setAvailableLayer(iName);
                }
            });

            var groupAux;
            try {
                var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, keyword, abstract, thisObj.short_abstract);
                groupAux.setImpresor(impresorGroup);
                groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                for (var i = 0; i < items.length; i++) {
                    groupAux.setItem(items[i]);
                }
            }
            catch (err) {
                if (err.name == "ReferenceError") {
                    var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
                    groupAux.setImpresor(impresorGroup);
                    groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                    for (var i = 0; i < items.length; i++) {
                        groupAux.setItem(items[i]);
                    }
                }
            }

            _gestorMenu.addItemGroup(groupAux);

            if (_gestorMenu.getLazyInitialization() == true) {
                _gestorMenu.removeLazyInitLayerInfoCounter(ItemGroupPrefix + thisObj.section);
                if (_gestorMenu.finishLazyInitLayerInfo(ItemGroupPrefix + thisObj.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(thisObj.section);

                    //
                    gestorMenu.allLayersAreLoaded = true;
                }
            } else {
                _gestorMenu.addLayerInfoCounter();
                if (_gestorMenu.finishLayerInfo()) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printMenu();
                
                    gestorMenu.allLayersAreLoaded = true;
                }
            }
            
            return;
        });
    }

    _parseRequest_without_print(_gestorMenu) {
        const impresorGroup = this.itemGroupPrinter;
        const impresorItem = new ImpresorItemHTML();
        const nuevo_impresor = new Menu_UI

        var thisObj = this;

        var ilistType = null
        if(this.tab.listType){
            ilistType = this.tab.listType
        }

        if (!$('#temp-menu').hasClass('temp')) { $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>'); }

        // Load geoserver Capabilities, if success Create menu and append to DOM
        $('#temp-menu').load(thisObj.getHostOWS() + '?service=' + thisObj.service + '&version=' + thisObj.version + '&request=GetCapabilities', function () {
            var capability = $('#temp-menu').find("capability");
            var keywordHtml = $('#temp-menu').find("Keyword");
            var keyword = '';
            if (keywordHtml.length > 0) {
                keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
            }
            var abstractHtml = $('#temp-menu').find("Abstract");
            var abstract = '';
            if (abstractHtml.length > 0) {
                abstract = abstractHtml[0].innerText; // reads wms 1st abstract
            }
            var capas_layer = $('layer', capability);
            var capas_info = $('layer', capas_layer);

            var items = new Array();

            // create an object with all layer info for each layer
            capas_info.each(function (index, b) {
                var i = $(this);
                var iName = $('name', i).html();
                if (thisObj.isAllowebLayer(iName)) {

                    var iTitle = $('title', i).html();
                    iTitle = thisObj.formatLayerTitle(iName, iTitle);
                    var iAbstract = $('abstract', i).html();
                    iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
                    var keywordsHTMLList = $('keywordlist', i).find("keyword");
                    var keywords = [];
                    $.each(keywordsHTMLList, function (i, el) {
                        keywords.push(el.innerText);
                    });
                    var iBoundingBox = $('boundingbox', i);
                    var iSrs = null;
                    var iMaxY = null;
                    var iMinY = null;
                    var iMinX = null;
                    var iMaxX = null;
                    var ilegendURLaux= $('Style', i).html()
                    let divi =  document.createElement("div")
                    let aux = null
                    divi.innerHTML= ilegendURLaux
                    /* if (divi.getElementsByTagName("onlineresource")) { // makes an error in some services
                      aux = divi.getElementsByTagName("onlineresource")[0].getAttribute("xlink:href");
                    } */
                    var ilegendURL = aux
                    
                    if (iBoundingBox.length > 0) {
                        if (iBoundingBox[0].attributes.srs) {
                            var iSrs = iBoundingBox[0].attributes.srs.nodeValue;
                        } else {
                            var iSrs = iBoundingBox[0].attributes.crs.nodeValue;
                        }
                        var iMaxY = iBoundingBox[0].attributes.maxy.nodeValue;
                        var iMinY = iBoundingBox[0].attributes.miny.nodeValue;
                        var iMinX = iBoundingBox[0].attributes.minx.nodeValue;
                        var iMaxX = iBoundingBox[0].attributes.maxx.nodeValue;
                    }


                    if (thisObj.type == 'wmslayer_mapserver') {
                        var capa = new CapaMapserver(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY);
                    } else {
                        var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY, null, ilegendURL);
                        gestorMenu.layersDataForWfs[capa.nombre] = {
                            name: capa.nombre,
                            section: capa.titulo,
                            host: capa.host
                        }
                    }
                    var item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback(), ilistType);
                    item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
                    item.setImpresor(impresorItem);
                    items.push(item);
                    gestorMenu.setAvailableLayer(iName);
                }
            });

            var groupAux;
            try {
                var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, keyword, abstract, thisObj.short_abstract);
                groupAux.setImpresor(impresorGroup);
                groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                for (var i = 0; i < items.length; i++) {
                    groupAux.setItem(items[i]);
                }
            }
            catch (err) {
                if (err.name == "ReferenceError") {
                    var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
                    groupAux.setImpresor(impresorGroup);
                    groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                    for (var i = 0; i < items.length; i++) {
                        groupAux.setItem(items[i]);
                    }
                }
            }

            _gestorMenu.addItemGroup(groupAux);

            if (_gestorMenu.getLazyInitialization() == true) {
                _gestorMenu.removeLazyInitLayerInfoCounter(ItemGroupPrefix + thisObj.section);
                if (_gestorMenu.finishLazyInitLayerInfo(ItemGroupPrefix + thisObj.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(thisObj.section);

                    //
                    gestorMenu.allLayersAreLoaded = true;
                }
            } else {
                _gestorMenu.addLayerInfoCounter();
                if (_gestorMenu.finishLayerInfo()) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printMenu();
                    
                    gestorMenu.allLayersAreLoaded = true;
                }
            }

            //console.log(`${thisObj.section} printed`);
            //prueba
             nuevo_impresor.addLayers_combobox(groupAux)
            return;
        });
    }

    getHostOWS() {
        //Define GetCapabilities host endpoint
        /* var host = this.host + '/ows';
        if (this.type == 'wmslayer_mapserver') {
            host = this.host;
        } */
        let host = this.host;
        if (this.service === "wms" && host.includes("/geoserver") && !host.endsWith("/wms")) { 
            host += "/wms";
         };
        return host;
    }

    getCallback() {
        //Define wich function handle onClick event
        var onClickHandler = 'loadWmsTpl';
        return onClickHandler;
    }
}

class LayersInfoWMTS extends LayersInfoWMS {
    constructor(host, service, version, tab, section, weight, name, short_abstract, feature_info_format, type, customizedLayers, itemGroupPrinter) {
        super();
        this.host = host;
        this.service = service;
        this.version = version;
        this.tab = tab;
        this.section = section;
        this.weight = weight;
        this.name = name;
        this.short_abstract = short_abstract;
        this.feature_info_format = feature_info_format;
        this.type = type;
        this.customizedLayers = (customizedLayers == "") ? null : customizedLayers;
        this.itemGroupPrinter = (itemGroupPrinter == "") ? new ImpresorGrupoHTML : itemGroupPrinter;
        this._executed = false;
    }

    get(_gestorMenu) {
        if (this._executed == false) {
            this._executed = true; //Indicates that getCapabilities executed

            //If lazyInit and have custimized layers, print layer after wms loaded (for searcher)
            if (_gestorMenu.getLazyInitialization() == true && this.customizedLayers != null) {
                const impresorItem = new ImpresorItemHTML();
                var itemGroup = _gestorMenu.getItemGroupById(ItemGroupPrefix + this.section);
                if (itemGroup != null) {
                    for (var key in this.customizedLayers) {

                        let title = this.customizedLayers[key]["new_title"] || this.title, 
                            legend = this.customizedLayers[key]["legend"] || null, 
                            keywords = this.customizedLayers[key]["new_keywords"], 
                            abstract = this.customizedLayers[key]["new_abstract"];

                        if (this.type == 'wmslayer_mapserver') {
                            var capa = new CapaMapserver(key, title, null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        } else {
                            var capa = new Capa(key,title,this.srs,this.host,this.service,this.version,this.feature_info_format,null,this.minx,this.maxx,this.miny,this.maxy,this.attribution,legend);
                        }

                        //Generate keyword array
                        var keywordsAux = [];
                        if (keywords != null && keywords != '') {
                            keywordsAux = keywords.split(',');
                            for (var keykeywordsAux in keywordsAux) {
                                keywordsAux[keykeywordsAux] = keywordsAux[keykeywordsAux].trim();
                            }
                        }

                        var item = new Item(capa.nombre, this.section + clearString(capa.nombre), keywordsAux, abstract, capa.titulo, capa, this.getCallback(), null);
                        
                        gestorMenu.setAllLayersAreDeclaredInJson(true);
                        gestorMenu.setAvailableLayer(capa.nombre);
                        gestorMenu.setAvailableWmtsLayer(capa.nombre);
                        
                        item.setImpresor(impresorItem);
                        if (itemGroup.getItemByName(this.section + capa.nombre) == null) {
                            itemGroup.setItem(item);
                        }
                    }
                }
                _gestorMenu.removeLazyInitLayerInfoCounter(ItemGroupPrefix + this.section);
                if (_gestorMenu.finishLazyInitLayerInfo(ItemGroupPrefix + this.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(this.section);
                }
            } else {
                this._parseRequest(_gestorMenu);
                
            }
            
        }
        //console.log("//termina de imprimir el menu")
        bindZoomLayer()
        bindLayerOptions()
    }

    generateGroups(_gestorMenu) {
        const impresorGroup = this.itemGroupPrinter;
        const impresorItem = new ImpresorItemHTML();

        var thisObj = this;

        var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
        groupAux.setImpresor(impresorGroup);
        groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
        _gestorMenu.addItemGroup(groupAux);
    }

    _parseRequest(_gestorMenu) {
        const impresorGroup = this.itemGroupPrinter;
        const impresorItem = new ImpresorItemHTML();
        
        var thisObj = this;
        
        if (!$('#temp-menu').hasClass('temp')) { $('body').append('<div id="temp-menu" class="temp" style="display:none"></div>'); }

        // Load geoserver Capabilities, if success Create menu and append to DOM
        $('#temp-menu').load(thisObj.getHost() + '?service=' + thisObj.service + '&version=' + thisObj.version + '&request=GetCapabilities', function () {
            var content = $('#temp-menu').find("contents");
            var keywordHtml = $('#temp-menu').find("Keyword");
            var keyword = '';
            if (keywordHtml.length > 0) {
                keyword = keywordHtml[0].innerText; // reads 1st keyword for filtering sections if needed
            }
            var abstractHtml = $('#temp-menu').find("Abstract");
            var abstract = '';
            if (abstractHtml.length > 0) {
                abstract = abstractHtml[0].innerText; // reads wms 1st abstract
            }
            var capas_layer = $('layer', content);
            var items = new Array();
            
            capas_layer.each(function (index, b) {
                var i = $(this);

                
                var iName = $('ows\\:identifier', i).html();
                if (thisObj.isAllowebLayer(iName)) {
                    var iTitle = $('ows\\:title', i).html();
                    iTitle = thisObj.formatLayerTitle(iName, iTitle);
                    var iAbstract = $('ows\\:abstract', i).html();
                    iAbstract = thisObj.formatLayerAbstract(iName, iAbstract);
                    var keywordsHTMLList = $('keywordlist', i).find("keyword");
                    var keywords = [];
                    $.each(keywordsHTMLList, function (i, el) {
                        keywords.push(el.innerText);
                    });
                    let iBoundingBox = $('ows\\:wgs84boundingbox', i), 
                        iSrs = null, 
                        lowerCorner = iBoundingBox[0].firstElementChild.innerText.split(' '),
                        upperCorner = iBoundingBox[0].lastElementChild.innerText.split(' '),
                        iMaxY = lowerCorner[1],
                        iMaxX = lowerCorner[0],
                        iMinY = upperCorner[1],
                        iMinX = upperCorner[0];

                    if (thisObj.type == 'wmslayer_mapserver') {
                        var capa = new CapaMapserver(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY);
                    } else {
                        var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, keywords, iMinX, iMaxX, iMinY, iMaxY);
                    }
                    var item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback(),null);
                    item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
                    item.setImpresor(impresorItem);
                    items.push(item);
                    gestorMenu.setAvailableLayer(iName);
                    gestorMenu.setAvailableWmtsLayer(iName);
                }

            });

            var groupAux;
            try {
                var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, keyword, abstract, thisObj.short_abstract);
                groupAux.setImpresor(impresorGroup);
                groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                for (var i = 0; i < items.length; i++) {
                    groupAux.setItem(items[i]);
                }
            }
            catch (err) {
                if (err.name == "ReferenceError") {
                    var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
                    groupAux.setImpresor(impresorGroup);
                    groupAux.setObjDom(_gestorMenu.getItemsGroupDOM());
                    for (var i = 0; i < items.length; i++) {
                        groupAux.setItem(items[i]);
                    }
                }
            }

            _gestorMenu.addItemGroup(groupAux);

            if (_gestorMenu.getLazyInitialization() == true) {
                _gestorMenu.removeLazyInitLayerInfoCounter(ItemGroupPrefix + thisObj.section);
                if (_gestorMenu.finishLazyInitLayerInfo(ItemGroupPrefix + thisObj.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(thisObj.section);

                    //
                    gestorMenu.allLayersAreLoaded = true;
                }
            } else {
                _gestorMenu.addLayerInfoCounter();
                if (_gestorMenu.finishLayerInfo()) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printMenu();

                    //
                    gestorMenu.allLayersAreLoaded = true;
                }
            }

            return;
        });
    }

    getHost() {
        /* //Define GetCapabilities host endpoint
        var host = this.host + '/gwc/service/wmts'; */
        let host = this.host;
        if (host.includes("/geoserver") && !host.endsWith("/wmts")) { 
            host += '/gwc/service/wmts';
         };
        return host;
    }


    getCallback() {
        //Define wich function handle onClick event
        var onClickHandler = 'loadWmsTpl';
        return onClickHandler;
    }

}


/******************************************
Composite para menu
******************************************/
class ItemComposite {
    constructor(nombre, seccion, palabrasClave, descripcion) {
        this.nombre = nombre
        this.seccion = clearSpecialChars(seccion)
        this.peso = null;
        this.palabrasClave = (palabrasClave == null || palabrasClave == '') ? [] : palabrasClave
        this.descripcion = descripcion
        this.impresor = null
        this.objDOM = null
        this.querySearch = ''
        this._active = false;

        this.searchOrderIntoKeywords();
    }

    getQuerySearch() {
        return this.querySearch;
    }

    setQuerySearch(q) {
        this.querySearch = q;
    }

    getActive() {
        return this._active;
    }

    setActive(active) {
        this._active = active;
    }

    getPeso() {
        return this.peso;
    }

    setPeso(peso) {
        this.peso = peso;
    }

    searchOrderIntoKeywords() {
        //Recorrer palabrasClave para ver si viene el orden
        if (this.palabrasClave != undefined && this.palabrasClave != "") {
            for (var key in this.palabrasClave) {
                if (this.palabrasClave[key].indexOf("orden:") == 0) {
                    this.peso = (this.palabrasClave[key].replace("orden:", "").trim() * 1);
                    this.palabrasClave.splice(key, 1);
                }
            }
        }
    }

    setPalabrasClave(palabrasClave) {
        this.palabrasClave = palabrasClave
    }

    setDescripcion(descripcion) {
        this.descripcion = descripcion
    }

    setImpresor(impresor) {
        this.impresor = impresor
    }

    imprimir() {
        return this.impresor.imprimir(this);
    }

    getLegendURL() {
        return '';
    }

    setObjDom(dom) {
        this.objDOM = dom;
    }

    getObjDom() {
        return $(this.objDOM);
    }

    isBaseLayer() {
        return false;
    }

    match() {
        if (this.querySearch == "" || this.capa == undefined) {
            return true;
        }
        if (this.capa.titulo.toLowerCase().indexOf(this.querySearch.toLowerCase()) >= 0) {
            return true;
        }
        for (var key in this.palabrasClave) {
            if (this.palabrasClave[key].toLowerCase().indexOf(this.querySearch.toLowerCase()) >= 0) {
                return true;
            }
        }
        return false;
    }

    getAvailableTags() {
        return [];
    }
}

class ItemGroup extends ItemComposite {
    constructor(tab, nombre, seccion, peso, palabrasClave, descripcion, shortDesc) {
        super(nombre, seccion, palabrasClave, descripcion);
        this.shortDesc = shortDesc;
        this.peso = peso;
        this.itemsComposite = {};
        this.tab = tab;
    }

    setItem(itemComposite) {
        this.itemsComposite[itemComposite.seccion] = itemComposite;
    }

    getId() {
        return ItemGroupPrefix + this.seccion;
    }

    getTab() {
        return this.tab;
    }

    getItemByName(name) {
        for (var key in this.itemsComposite) {
            if (this.itemsComposite[key].nombre == name) {
                return this.itemsComposite[key];
            }
        }

        return null;
    }

    ordenaItems(a, b) {
        var aOrden1 = a.peso;
        var bOrden1 = b.peso;
        var aOrden2 = (a.titulo) ? a.titulo.toLowerCase() : 0;
        var bOrden2 = (b.titulo) ? b.titulo.toLowerCase() : 0;
        if (aOrden1 < bOrden1) {
            return -1
        } else if (aOrden1 > bOrden1) {
            return 1;
        } else if (aOrden2 < bOrden2) {
            return -1;
        } else if (aOrden2 > bOrden2) {
            return 1;
        }

        return 0;
    }

    getItemsSearched() {
        var itemsAux = new Array();
        for (var key in this.itemsComposite) {
            this.itemsComposite[key].setQuerySearch((this.tab.getId() == "") ? this.querySearch : this.tab.getSearchQuery());
            if (this.itemsComposite[key].match() == true) { //Returns true on item match with querySearch string
                itemsAux.push(this.itemsComposite[key]);
            }
        }

        return itemsAux;
    }

    imprimir() {
        this.itemsStr = '';

        var itemsAux = this.getItemsSearched();
        itemsAux.sort(this.ordenaItems);

        for (var key in itemsAux) {
            this.itemsStr += itemsAux[key].imprimir();
        }
        return this.impresor.imprimir(this);

    }

    getCantidadCapasVisibles() {
        var iCapasVisibles = 0;
        for (var key in this.itemsComposite) {
            if (this.itemsComposite[key].getVisible() == true) {
                iCapasVisibles++;
            }
        }
        return iCapasVisibles;
    }

    muestraCantidadCapasVisibles() {
        var iCapasVisibles = this.getCantidadCapasVisibles();
        if (iCapasVisibles > 0) {
            $("#" + this.getId() + "-a").html(this.nombre + " <span class='active-layers-counter'>" + iCapasVisibles + "</span>")
        } else {
            $("#" + this.getId() + "-a").html(this.nombre)
        }
    }

    hideAllLayers() { 
        for (var key2 in this.itemsComposite) {
            var item = this.itemsComposite[key2];
			if (item.getVisible() == true) {
				item.showHide();
			}
		}
    }
	
    hideAllLayersExceptOne(item) { }

    getAvailableTags() {
        var availableTags = [];
        for (var key in this.itemsComposite) {
            availableTags = availableTags.concat(this.itemsComposite[key].getAvailableTags());
        }
        return availableTags;
    }
}

class ItemGroupBaseMap extends ItemGroup {

    isBaseLayer() {
        return true;
    }
	
	hideAllLayers() {
		for (var key2 in this.itemsComposite) {
            var item = this.itemsComposite[key2];
			if (item.getVisible() == true) {
				item.showHide();
			}
		}
	}

    hideAllLayersExceptOne(item) {
        for (var key in this.itemsComposite) {
			if (this.itemsComposite[key].getVisible() == true && item !== this.itemsComposite[key]) {
                this.itemsComposite[key].showHide();
            }
        }
    }

    getAvailableTags() {
        return [];
    }
}

//Auxilary class for ItemGroupWMSSelector
class wmsSelector {
    constructor(id, name, title, source, service, version, featureInfoFormat, type) {
        if (type == 'wmslayer_mapserver') {
            this.capa = new CapaMapserver(name, title, null, source, service, version, null, null, null, null, null, null);
        } else {
            this.capa = new Capa(name, title, null, source, service, version, null, null, null, null, null, null);
        }
        this.id = id;
        this.featureInfoFormat = featureInfoFormat;
        this.type = type;
    }

    getId() {
        return this.id;
    }

    getTitle() {
        return this.capa.titulo;
    }
}

class ItemGroupWMSSelector extends ItemGroup {
    constructor(tab, name, section, keyWords, description) {
        super(tab, name, section, 0, keyWords, description, '');
        this.wmsSelectorList = {};
    }

    addWMS(id, title, source, service, version, featureInfoFormat, type) {
        this.wmsSelectorList[id] = new wmsSelector(id, title, source, service, version, featureInfoFormat, type);
    }
}

class Item extends ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion, titulo, capa, callback, legendImg, listType) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.titulo = titulo;
		this.capa = capa;
		this.capas = [capa];
		this.visible = false;
        this.legendImg = legendImg;
        this.callback = callback;
        this.listType = null;
    }

    getId() {
        var childId = "child-" + this.seccion;
        return childId;
    }

    getSVGFilenameForLegendImg() {
        return this.titulo.replace(':', '').replace('/', '') + ".svg";
    }

    getVisible() {
        return this.visible;
    }

    setLegendImgPreformatted(dir) {
        this.legendImg = dir + this.getSVGFilenameForLegendImg();
    }

    setLegendImg(img) {
        this.legendImg = img;
    }

    getLegendImg() {
        return this.legendImg;
    }

    loadLayer(capa, key) {
        var tmp = Object.assign({}, capa); //Clonar el item para simular que solo tiene una unica capa
        tmp.nombre = capa.nombre;
        tmp.capa = capa.capas[key];
        switch (tmp.capa.servicio) {
            case "wms":
                loadWms(tmp.callback, tmp);
                break;
            case "wmts":
                loadWmts(tmp.callback, tmp);                
                break;
            case "tms":
                loadMapaBase(tmp.capa.host, tmp.capa.nombre, tmp.capa.attribution);            
                break;
            case "bing":
                loadMapaBaseBing(tmp.capa.key, tmp.capa.nombre, tmp.capa.attribution);
                break;
            case "geojson":
                loadGeojson(tmp.capa.host, tmp.nombre);
                break;
            default:
                break;
        }
    }

    showHide() {
        $('#' + this.getId()).toggleClass('active');

        if (typeof this.callback == 'string') {
            this.callback = eval(this.callback);
        }
        
        this.visible = !this.visible;
        this.capas[0].visible = this.visible;
        this.loadLayer(this, 0);
		
        //Recorrer todas las capas del item
		if (this.capas.length > 1) {
            const secondaryLayers = this.capas.slice(1, this.capas.length);
            for (var key in secondaryLayers) {
                if (this.capas[+key + 1].hasOwnProperty('visible')) {
                    if (this.capas[+key + 1].visible !== this.visible) {
                        this.capas[+key + 1].visible = this.visible;
                    }
                    this.loadLayer(this, +key + 1);
                } else {
                    this.capas[+key + 1].visible = this.visible;
                    if (this.visible)
                        this.loadLayer(this, +key + 1);
                }
            }
        }
	}
	
	getLegendURL() {
		return this.capa.getLegendURL();
	}
    
    getAvailableTags() {
        var tagsAux = [this.capa.titulo];
        return tagsAux.concat(this.palabrasClave);
    }
}

/******************************************
Clase plugin
******************************************/
class Plugin {
    constructor(name, url, callback) {
        this.name = name;
        this.url = url;
        this.status = 'loading';
        this.callback = callback;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status) {
        switch (status) {
            case "loading":
                this.status = status;
                break;
            case "ready":
                this.status = status;
                break;
            case "fail":
                this.status = status;
                break;
            case "visible":
                this.status = status;
                break;
            default:
                return false;
        }
    }
    triggerLoad() {
        $("body").trigger("pluginLoad", { pluginName: this.name });
    }
}

/******************************************
ItemsGetter
******************************************/
class ItemsGetter {
    get(gestorMenu) {
        return gestorMenu.items;
    }
}

class ItemsGetterSearcher extends ItemsGetter {
    get(gestorMenu) {

        const impresorGroup = new ImpresorGrupoHTML();
        const impresorItem = new ImpresorItemHTML();

        //Instance an empty ItemGroup for no-tabs classes
        var groupAux = new ItemGroup(new Tab(''), 'Resultado búsqueda', 'searcher-', 0, "", "", gestorMenu.getQuerySearch());
        groupAux.setImpresor(impresorGroup);
        groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
        groupAux.setActive(true);

        //Iterate all items in gestorMenu
        var itemsToReturn = {};
        for (var key in gestorMenu.items) {
            var itemComposite = gestorMenu.items[key];
            if (gestorMenu.getQuerySearch() != "") {
                itemComposite.setQuerySearch(gestorMenu.getQuerySearch()); //Set query search for filtering items
                var itemsAux = itemComposite.getItemsSearched();
                for (var key2 in itemsAux) {
                    groupAux.setItem(itemsAux[key2]);
                }
                itemsToReturn[groupAux.seccion] = groupAux;
            } else {
                itemsToReturn[itemComposite.seccion] = itemComposite;
            }
        }

        return itemsToReturn;
    }
}


class ItemsGetterSearcherWithTabs extends ItemsGetter {
    get(gestorMenu) {

        const impresorGroup = new ImpresorGrupoHTML();
        const impresorItem = new ImpresorItemHTML();

        //Instance an empty ItemGroup per tab (without items)
        var itemsGroups = {};
        for (var key in gestorMenu._tabs) {
            var groupAux = new ItemGroup(gestorMenu._tabs[key], 'Resultado búsqueda', 'searcher-' + gestorMenu._tabs[key].getId(), 0, "", "", gestorMenu._tabs[key].getSearchQuery());
            groupAux.setImpresor(impresorGroup);
            groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
            groupAux.setActive(true);
            itemsGroups[groupAux.seccion] = groupAux;
        }

        //Instance an empty ItemGroup for no-tabs classes
        var groupAux = new ItemGroup(new Tab(''), 'Resultado búsqueda', 'searcher-', 0, "", "", gestorMenu.getQuerySearch());
        groupAux.setImpresor(impresorGroup);
        groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
        groupAux.setActive(true);
        itemsGroups[groupAux.seccion] = groupAux;

        //Iterate all items in gestorMenu
        var itemsToReturn = {};
        for (var key in gestorMenu.items) {
            var itemComposite = gestorMenu.items[key];
            var tabAux = gestorMenu._tabs[itemComposite.getTab().getId()];
            if (tabAux != undefined && tabAux.getSearchQuery() != "") {
                itemComposite.setQuerySearch(tabAux.getSearchQuery()); //Set query search for filtering items
                var itemsAux = itemComposite.getItemsSearched();
                for (var key2 in itemsAux) {
                    itemsGroups['searcher-' + tabAux.getId()].setItem(itemsAux[key2]);
                }
                itemsToReturn[itemsGroups['searcher-' + tabAux.getId()].seccion] = itemsGroups['searcher-' + tabAux.getId()];
            } else {
                itemsToReturn[itemComposite.seccion] = itemComposite;
            }
        }

        return itemsToReturn;
    }
}

/******************************************
Gestor de menu
******************************************/
class GestorMenu {
    constructor() {
        this.items = {};
        this.plugins = {};
        this.pluginsCount = 0;
        this.pluginsLoading = 0;
        this.menuDOM = '';
        this.loadingDOM = '';
        this.layersInfo = new Array();
        this.legendImgPath = '';
        this.itemsGroupDOM = '';
        this.printCallback = null;
        this.querySearch = '';
        this.showSearcher = false;
        this.basemapSelected = null;
        this.baseMapDependencies = {};

        this.allLayersAreLoaded = false;
        this.availableWmtsLayers = [];
        this.availableLayers = [];
        this.availableBaseLayers = [];
        this.activeLayers = [];
        this.layersDataForWfs = {};
        this.allLayersAreDeclaredInJson = false;

        this._existsIndexes = new Array(); //Identificador para evitar repetir ID de los items cuando provinen de distintas fuentes
        this._getLayersInfoCounter = 0;
        this._getLazyInitLayersInfoCounter = {};
        this._tabs = {};
        this._selectedTab = null;
        this._lazyInitialization = false;
        this._itemsGetter = new ItemsGetter();
		this._layersJoin = null;
		this._folders = {};
	}

    setBaseMapDependencies(baseLayers) {
        const baseMapDependencies = {};
        baseLayers.forEach(bLayer => {
            baseMapDependencies[bLayer.nombre] = bLayer.hasOwnProperty('isOpenWith') ? bLayer.isOpenWith : null;
        });
        this.baseMapDependencies = baseMapDependencies;
    }
    
    setAvailableLayer(layer_id) {
        this.availableLayers.push(layer_id);
    }
    
    setAvailableWmtsLayer(layer_id) {
        this.availableWmtsLayers.push(layer_id);
    }

    setAvailableBaseLayer(layer_id) {
        this.availableBaseLayers.push(layer_id);
    }

    setAllLayersAreDeclaredInJson(value) {
        this.allLayersAreDeclaredInJson = value;
    }

    getAvailableLayers() {
        return this.availableLayers;
    }

    setLayersDataForWfs() {
        for (const item in this.items) {
            if (item !== 'mapasbase') {
                Object.values(this.items[item].itemsComposite).forEach(iC => {
                    iC.capas.forEach(capa => {
                        this.layersDataForWfs[capa.nombre] = {
                            name: capa.nombre,
                            section: this.items[item].seccion,
                            host: capa.host
                        }
                    })
                })
            }
        }
    }

    getActiveLayersWithoutBasemap() {
        const activeLayers = this.activeLayers.filter(layer => {
            return this.availableBaseLayers.find(baseLayer => baseLayer === layer) ? false : true;
        });
        return Object.keys(this.layersDataForWfs).length === 0 ? [] : activeLayers.map(activeLayer => {
            if (this.layersDataForWfs.hasOwnProperty(activeLayer) && this.layersDataForWfs[activeLayer]) {
                return this.layersDataForWfs[activeLayer];
            }
        });
    }

    addActiveLayer(layer_id) {
        const idx = this.activeLayers.findIndex(layer => layer === layer_id);
        if (idx === -1)
            this.activeLayers.push(layer_id);
    }

    removeActiveLayer(layer_id) {
        const idx = this.activeLayers.findIndex(layer => layer === layer_id);
        if (idx > -1)
            this.activeLayers.splice(idx, 1);
    }

    layerIsActive(layer_id) {
        return this.activeLayers.findIndex(layer => layer === layer_id) > -1;
    }

    layerIsWmts(layer_id) {
        return this.availableWmtsLayers.findIndex(layer => layer === layer_id) > -1;
    }

    layerIsValid(layer_id) {
        const idx1 = this.availableLayers.findIndex(layer => layer === layer_id) > -1;
        const idx2 = this.availableBaseLayers.findIndex(layer => layer === layer_id) > -1;
        return idx1 || idx2;
    }

    getActiveLayers() {
        return this.activeLayers;
    }

    getLayerIdByName(layerName) {
        for (const section in this.items) {
            if (this.items[section].hasOwnProperty('itemsComposite')) {
                if (this.items[section].getItemByName(layerName)) 
                    return this.items[section].getItemByName(layerName).getId();
            }
        }
    }
    
    getLayerNameById(layerId) {
		for (var key in this.items) {
			var itemComposite = this.items[key];
			for (var key2 in itemComposite.itemsComposite) {
				var item = itemComposite.itemsComposite[key2];
                if (item.getId() === layerId) {
					return item.nombre;
				}
			}
		}
    }

    baseMapIsInUrl(layers) {
        for (const layer of layers) {
            if (this.availableBaseLayers.findIndex(lyr => lyr === layer) > -1) {
                return true;
            }
        }
        return false;
    }

    loadInitialLayers(urlInteraction) {
        $('#' + this.basemapSelected).toggleClass('active');

        if (this.allLayersAreDeclaredInJson) {
            urlInteraction.layers.forEach(layer => {
                if (this.layerIsValid(layer)) {
                    this.muestraCapa(this.getLayerIdByName(layer));
                }
            });
            urlInteraction.layers = this.getActiveLayers();
            this.activeLayersHasBeenUpdated = () => {
                urlInteraction.layers = this.getActiveLayers();
            }
            this.setLayersDataForWfs();
            return;
        }

        const initialInterval = setInterval(() => {
            if (this.allLayersAreLoaded) {
                window.clearInterval(initialInterval);

                let validLayersLoaded = 0;
                let validLayers = [];
                let rejectedLayers = [];
                urlInteraction.layers.forEach(layer => {
                    if (this.layerIsValid(layer)) {
                        validLayers.push(layer);
                    } else {
                        rejectedLayers.push(layer);
                    }
                });

                validLayers.forEach(layer => {
                    const interval = setInterval(() => {
                        if (this.layerIsActive(layer)) {
                            window.clearInterval(interval);
                            validLayersLoaded++;
                        } else {
                            window.clearInterval(interval);
                            validLayersLoaded++;
                            this.muestraCapa(this.getLayerIdByName(layer));
                        }
                    }, 200)
                });

                const lastInterval = setInterval(() => {
                    if (validLayersLoaded === validLayers.length) {
                        urlInteraction.layers = this.getActiveLayers();
                        this.activeLayersHasBeenUpdated = () => {
                            urlInteraction.layers = this.getActiveLayers();
                        }
                        this.setLayersDataForWfs();
                        window.clearInterval(lastInterval);

                        this.printMenu();

                        //last chances to load layers
                        if (rejectedLayers.length > 0) {
                            let tryNumber = 0;
                            const intervalId = setInterval(() => {
                                if (rejectedLayers.length === 0 || tryNumber === 15) {
                                    window.clearInterval(intervalId);
                                    console.log('Rejected layers: ', rejectedLayers);
                                } else {
                                    tryNumber++;
                                    const validLayers = [];
                                    for (let i = 0; i < rejectedLayers.length; i++) {
                                        if (this.layerIsValid(rejectedLayers[i])) {
                                            validLayers.unshift(i);
                                            this.muestraCapa(this.getLayerIdByName(rejectedLayers[i]));
                                        }
                                    }
                                    validLayers.forEach(vL => {
                                        rejectedLayers.splice(vL, 1);
                                    });
                                }
                                this.printMenu();
                            }, 1000);
                        }
                    }
                }, 100)
            }
        }, 500)
    }

    cleanAllLayers() {//Desactiva TODOS los layers activos.
        this.toggleLayers(Object.keys(overlayMaps))
    }

    toggleLayers(layers) {
        layers.forEach(layer => {
            if (this.layerIsValid(layer))
                this.muestraCapa(this.getLayerIdByName(layer));
        })
    }

    setMenuDOM(menuDOM) {
        this.menuDOM = menuDOM;
    }

    getMenuDOM() {
        return $(this.menuDOM);
    }

    setLoadingDOM(loadingDOM) {
        this.loadingDOM = loadingDOM;
    }

    getLoadingDOM() {
        return $(this.loadingDOM);
    }

    setLegendImgPath(legendImgPath) {
        this.legendImgPath = legendImgPath;
    }

    getLegendImgPath() {
        return this.legendImgPath;
    }

    getItemsGroupDOM() {
        return this.menuDOM;
    }

    setPrintCallback(printCallback) {
        this.printCallback = printCallback;
    }

    getLazyInitialization() {
        return this._lazyInitialization;
    }

    setLazyInitialization(lazyInit) {
        this._lazyInitialization = lazyInit;
    }

    addLayerInfoCounter() {
        this._getLayersInfoCounter++;
    }

    setShowSearcher(show_searcher) {
        this.showSearcher = show_searcher;
    }

    getShowSearcher() {
        return this.showSearcher;
    }

    getQuerySearch() {
        return this.querySearch;
    }

    setQuerySearch(q) {
        this.querySearch = q;
        this.setSelectedTabSearchQuery(q);

        //Select wich ItemsGetter strategy need
        if (q == "") {
            this._itemsGetter = new ItemsGetter();
        } else if (this._hasMoreTabsThanOne() == true) {
            this._itemsGetter = new ItemsGetterSearcherWithTabs();
        } else {
            this._itemsGetter = new ItemsGetterSearcher();
        }
    }
	
    setLayersJoin(layersJoin) {
        this._layersJoin = layersJoin;
    }
    
    addLazyInitLayerInfoCounter(sectionId) {
        if (this._getLazyInitLayersInfoCounter[sectionId] == undefined) {
            this._getLazyInitLayersInfoCounter[sectionId] = 1;
        } else {
            this._getLazyInitLayersInfoCounter[sectionId]++;
        }
    }
	
	setFolders(folders) {
		this._folders = folders;
	}

    /* 
    getBasemapSelected() {
        return this.basemapSelected;
    } 
    */
    getActiveBasemap() {
        let activeBasemap; 
        Object.keys(baseLayers).forEach( bl => {
            if(gestorMenu.getActiveLayers().includes(bl)) {
                activeBasemap = bl;
            }
        });
        return activeBasemap;
    }

    setBasemapSelected(basemapSelected) {
        this.basemapSelected = basemapSelected;
    }

    setLastBaseMapSelected(lastBaseMapSelected) {
        this.lastBaseMapSelected = lastBaseMapSelected;
    }

    removeLazyInitLayerInfoCounter(sectionId) {
        this._getLazyInitLayersInfoCounter[sectionId]--;
    }

    finishLayerInfo() {
        return (this._getLayersInfoCounter == this.layersInfo.length);
    }

    finishLazyInitLayerInfo(sectionId) {
        return (this._getLazyInitLayersInfoCounter[sectionId] == 0);
    }

    addLayersInfo(layersInfo) {
        this.layersInfo.push(layersInfo);
    }

    addTab(tab) {
        if (tab.getExtendedId() != EmptyTab) this._tabs[tab.getId()] = tab;
    }

    setSelectedTab(tabId) {
        this._selectedTab = this._tabs[tabId];
    }

    setSelectedTabSearchQuery(q) {
        if (this._selectedTab != null) {
            this._selectedTab.setSearchQuery(q);
            this._selectedTab.itemsGetter = this._itemsGetter;
        }
    }

    getItemGroupById(id) {
        for (var key in this.items) {
            if (this.items[key].getId() == id) {
                return this.items[key];
            }
        }

        return null;
    }

    addItemGroup(itemGroup) {
        var itemAux;
        if (!this.items[itemGroup.seccion] || itemGroup.isBaseLayer()) { //itemGroup.isBaseLayer() avoid to repeat base layer into selector
            itemAux = itemGroup;
            this._existsIndexes[itemGroup.seccion] = 0;
        } else {
            itemAux = this.items[itemGroup.seccion];
            this._existsIndexes[itemGroup.seccion] = Object.keys(itemAux.itemsComposite).length + 1; //Si ya existe el itemGroup pero se agregan datos de otras fuentes, esto evita que se repitan los ID
        }
        for (var key in itemGroup.itemsComposite) {
            if (this._existsIndexes[itemGroup.seccion] > 0) { //Para modificar item.seccion para no duplicar el contenido
                itemGroup.itemsComposite[key].seccion += this._existsIndexes[itemGroup.seccion];
                
            }
            itemAux.setItem(itemGroup.itemsComposite[key]);
        }
        this.items[itemGroup.seccion] = itemAux;
        
    }

    addPlugin(pluginName, url, callback) {
        var pluginAux;
        if (!this.pluginExists(pluginName)) {
            if (typeof callback === 'function') {
                // Create plugin with callback if need to
                pluginAux = new Plugin(pluginName, url, callback);
                this.plugins[pluginAux.name] = pluginAux;
                this.pluginsCount++;
                this.pluginsLoading++;
                $.getScript(url, function (data, textStatus, jqxhr) {
                    if (textStatus == "success") {
                        pluginAux.setStatus("ready");
                        gestorMenu.pluginsLoading--;
                        pluginAux.triggerLoad();
                        pluginAux.callback();
                    }
                }).fail(function (jqxhr, settings, exception) {
                    pluginAux.setStatus("fail");
                    console.log("Error: " + jqxhr.status);
                    gestorMenu.pluginsCount--;
                    gestorMenu.pluginsLoading--;
                });
            }
            else {
                // Create a plugin with no callback
                pluginAux = new Plugin(pluginName, url, null);
                this.plugins[pluginAux.name] = pluginAux;
                this.pluginsCount++;
                this.pluginsLoading++;
                $.getScript(url, function (data, textStatus, jqxhr) {
                    if (textStatus == "success") {
                        pluginAux.setStatus("ready");
                        gestorMenu.pluginsLoading--;
                        pluginAux.triggerLoad();
                    }
                }).fail(function (jqxhr, settings, exception) {
                    pluginAux.setStatus("fail");
                    console.log("Error: " + jqxhr.status);
                    gestorMenu.pluginsCount--;
                    gestorMenu.pluginsLoading--;
                });
            }
        } else {
            return false;
        }
    }

    deletePlugin(pluginName) {
        if (this.pluginExists(pluginName)) {
            delete this.plugins[pluginName];
            return true;
        } else { return false; }
    }

    pluginExists(pluginName) {
        if (this.plugins[pluginName]) {
            return true;
        } else {
            return false;
        }
    }

    ordenaPorPeso(a, b) {
        var aName = a.peso;
        var bName = b.peso;
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    executeLayersInfo() {
        if (this.getLazyInitialization() == true) {
            for (var key in this.layersInfo) {
                this.layersInfo[key].generateGroups(this);
            }
            this.printMenu();

            var thisObj = this;

            //Capture show.bs.collapse menu event
            $(function () {
                $(".collapse").on('show.bs.collapse', function (e) {
                    if ($(this).is(e.target)) {
                        var showingId = this.id;
                        if ($('#' + showingId + ' > div').html() == '') {
                            $('#' + showingId + ' > div').html('<div class="loading"><img src="src/styles/images/loading.svg" style="width:35px"></div>');
                        }
                        for (var key in thisObj.layersInfo) {
                            if (thisObj.layersInfo[key].section == showingId) {
                                thisObj.addLazyInitLayerInfoCounter(showingId);
                                thisObj.layersInfo[key].get(thisObj);
                            }
                        }
                    }
                })
            });

        } else {
            for (var key in this.layersInfo) {
                this.layersInfo[key].get(this);
            }
        }
    }

    _countTabs() {
        //return this._tabs.length;
        return Object.keys(this._tabs).length;
    }

    _hasMoreTabsThanOne() {
        return (this._countTabs() > 1);
    }

    _formatTabName(tab) {
        return (tab.replace(EmptyTab, ''));
    }
	
	processLayersJoin() {
		if (this._layersJoin != null) {
			
			//Buscar el item al cual incluirle capas
			for (var keyJoin in this._layersJoin) {
				var item = this.items[this._layersJoin[keyJoin].seccion];
				if (item) {
					for (var keyItem in item.itemsComposite) {
						if (item.itemsComposite[keyItem].capa.host == this._layersJoin[keyJoin].host && item.itemsComposite[keyItem].capa.nombre == this._layersJoin[keyJoin].layer) {
							
							//Busca las capas a incluir
							for (var keyJoinInt in this._layersJoin[keyJoin].joins) {
								var itemInt = this.items[this._layersJoin[keyJoin].joins[keyJoinInt].seccion];
								if (itemInt) {
									for (var keyItemInt in itemInt.itemsComposite) {
										if (itemInt.itemsComposite[keyItemInt].capa.host == this._layersJoin[keyJoin].joins[keyJoinInt].host && itemInt.itemsComposite[keyItemInt].capa.nombre == this._layersJoin[keyJoin].joins[keyJoinInt].layer) {
                                            item.itemsComposite[keyItem].capas = item.itemsComposite[keyItem].capas.concat(itemInt.itemsComposite[keyItemInt].capas);
											delete itemInt.itemsComposite[keyItemInt];
                                            if (item.itemsComposite[keyItem].visible) {
                                                if (!isNaN(keyItemInt)) {
                                                    item.itemsComposite[keyItem].capas[keyItemInt].visible = true;
                                                    item.itemsComposite[keyItem].loadLayer(item.itemsComposite[keyItem], keyItemInt);
                                                }
                                            }
										}
									}
								}
							}
							
						}
					}
				}
			}
		}
	}
	
    print() {
        this.executeLayersInfo();
    }

    _printSearcher() {
        if (this.getShowSearcher() == true) {
            return "<form id='searchForm' onSubmit='mainMenuSearch(event)'>" +
                    "<div style='display: flex;'>" +
                        "<div class='has-feedback has-clear'><input type='text' class='form-control' id='q' name='q' value='" + this.getQuerySearch() + "' placeholder='Buscar capas...'>" +
                            "<span class='form-control-clear glyphicon glyphicon-remove-circle form-control-feedback hidden'></span>"+
                        "</div>" +
                        "<div><button class='btn btn-search' type='submit'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></button></div>" +
                        "<div onClick='gestorMenu.cleanAllLayers()'><button class='btn btn-capa' id='cleanTrash'><span class='glyphicon glyphicon-trash' title='Desactivar Capas' ></span></button></div>" +
                    "</div>" +
                    "</form>";
        }

        return '';
    }

    getAvailableTags() {
        var availableTags = [];
        for (var key in this.items) {
            var itemComposite = this.items[key];
            if (this._hasMoreTabsThanOne() == false || itemComposite.getTab().getId() == this._selectedTab.getId()) { //If not use tabs get all tags or just get available tags from item in selected tab
                availableTags = availableTags.concat(itemComposite.getAvailableTags());
            }
        }
        let uniqueTags = [...new Set(availableTags)]; //Remove Duplicates from Tags array
        return uniqueTags;
    }

    _printWithTabs() {

        var aSections = {};

        //Set initial html printing for all tabs
        for (var key in this._tabs) {
            if (this._selectedTab == null) {
                this.setSelectedTab(this._tabs[key].id);
                var sClassAux = 'active';
            } else if (this._selectedTab.getId() == this._tabs[key].id) {
                var sClassAux = 'active';
            }
            aSections[this._tabs[key].getExtendedId()] = [];
            aSections[this._tabs[key].getExtendedId()].push("<div role='tabpanel' class='tab-pane " + sClassAux + "' id='" + this._tabs[key].getExtendedId() + "'>");
            aSections[this._tabs[key].getExtendedId()].push(this._tabs[key].getInitialPrint());
            sClassAux = '';
        }

        this.getMenuDOM().html(sInitialHTML);

        var itemsAux = new Array();
        var itemsIterator = this._itemsGetter.get(this);
        for (var key in itemsIterator) {
            itemsAux.push(itemsIterator[key]);
        }
        itemsAux.sort(this.ordenaPorPeso);

        //Set items html printing for all tabs
        for (var key in itemsAux) {
            var itemComposite = itemsAux[key];
            if (itemComposite.getTab().getExtendedId() != EmptyTab) {
                itemComposite.getTab().setSearchQuery(this._tabs[itemComposite.getTab().getId()].getSearchQuery()); //Set query search for filtering items
                aSections[itemComposite.getTab().getExtendedId()].push(itemComposite.imprimir());
            } else {
                if ($('#' + itemComposite.seccion).length != 0) {
                    itemComposite.getObjDom().html('');
                }
                itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items
                itemComposite.getObjDom().append(itemComposite.imprimir());
            }
        }

        //Set end html printing for all tabs
        for (var key in this._tabs) {
            aSections[this._tabs[key].getExtendedId()].push(this._tabs[key].getEndPrint());
        }

        var sInitialHTML = "<ul class='nav nav-tabs' role='tablist'>";
        for (var key in this._tabs) {
            if (this._selectedTab == null) {
                this.setSelectedTab(this._tabs[key].id);
                var sClassAux = 'active';
            } else if (this._selectedTab.getId() == this._tabs[key].id) {
                var sClassAux = 'active';
            }
            sInitialHTML += "<li role='presentation' class='" + sClassAux + "'><a href='#" + this._tabs[key].getExtendedId() + "' aria-controls='" + this._tabs[key].getExtendedId() + "' role='tab' data-toggle='tab'>" + this._tabs[key].getContent() + "</a></li>";
            sClassAux = '';
        }
        sInitialHTML += "</ul>";

        sInitialHTML += this._printSearcher();

        sInitialHTML += "<div class='tab-content'>";

        for (var key in aSections) {
            sInitialHTML += aSections[key].join('') + "</div>";
        }

        sInitialHTML += "</div>";

        this.getMenuDOM().html(sInitialHTML);

    }
	
	generateSubFolders(itemsToFolders, folders) {
		var itemsToPrint = new Array();
		
		for (var itemIndex in itemsToFolders) { //real items loop
			var itemComposite = itemsToFolders[itemIndex];
			var encontro = false;
			for (var folderIndex in folders) { //folders loop
				var folder = folders[folderIndex];
				if (folder.items) {
					if (folder.items.indexOf(itemComposite.seccion) != -1) {
						encontro = true;
						if (!itemsToPrint[folderIndex]) {
							itemsToPrint[folderIndex] = new ItemGroup(itemComposite.tab, folder.nombre, itemComposite.seccion + 'f' + folderIndex, itemComposite.peso, itemComposite.palabrasClave, folder.resumen, folder.resumen);
							itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
							itemsToPrint[folderIndex].itemsComposite = {};
							itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
						}
						itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] = itemComposite;
					}
				}
				if (folder.folders) {
					ret = this.generateSubFolders(itemsToFolders, folder.folders);
					if (ret != null && ret.length > 0) {
						itemComposite = ret[0];
						encontro = true;
						if (!itemsToPrint[folderIndex]) {
							itemsToPrint[folderIndex] = new ItemGroup(itemComposite.tab, folder.nombre, itemComposite.seccion + 'f' + folderIndex, itemComposite.peso, itemComposite.palabrasClave, folder.resumen, folder.resumen);
							itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
							itemsToPrint[folderIndex].itemsComposite = {};
							itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
						}
						for (var j = 0; j < ret.length; j++) {
							itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] = ret[j];
						}
					}
				}
			}
		}
		
		return itemsToPrint;
	}
	
	isItemInSubFolders(itemComposite, folders) {
		for (var folderIndex in folders) { //folders loop
			var folder = folders[folderIndex];
			if (folder.items) {
				if (folder.items.indexOf(itemComposite.seccion) != -1) {
					return true;
				}
			}
			if (folder.folders) {
				return this.isItemInSubFolders(itemComposite, folder.folders);
			}
		}
		
		return false;
	}
	
	generateFolders(itemsToFolders) {
		var itemsToPrint = new Array();
		var i = 100;
		
		for (var itemIndex in itemsToFolders) { //real items loop
			var itemComposite = itemsToFolders[itemIndex];
			var encontro = false;
			for (var folderIndex in this._folders) { //folders loop
				var folder = this._folders[folderIndex];
				if (folder.items) {
					if (folder.items.indexOf(itemComposite.seccion) != -1) {
						encontro = true;
						if (!itemsToPrint[folderIndex]) {
							itemsToPrint[folderIndex] = new ItemGroup(itemComposite.tab, folder.nombre, itemComposite.seccion + 'f' + folderIndex, itemComposite.peso, itemComposite.palabrasClave, folder.resumen, folder.resumen);
							itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
							itemsToPrint[folderIndex].itemsComposite = {};
							itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
						}
						itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] = itemComposite;
					}
				}
				if (encontro == false && folder.folders) {
					encontro = this.isItemInSubFolders(itemComposite, folder.folders);
				}
			}
			if (!encontro){
				itemsToPrint[i++] = itemComposite;
			}
		}
		
		for (var folderIndex in this._folders) { //folders loop
			var folder = this._folders[folderIndex];
			if (folder.folders) {
				var ret = this.generateSubFolders(itemsToFolders, folder.folders);
				if (ret != null && ret.length > 0) {
					itemComposite = ret[0];
					if (!itemsToPrint[folderIndex]) {
						itemsToPrint[folderIndex] = new ItemGroup(itemComposite.tab, folder.nombre, itemComposite.seccion + 'f' + folderIndex, itemComposite.peso, itemComposite.palabrasClave, folder.resumen, folder.resumen);
						itemsToPrint[folderIndex].setImpresor(new ImpresorGrupoHTML());
						itemsToPrint[folderIndex].itemsComposite = {};
						itemsToPrint[folderIndex].setObjDom(itemComposite.objDOM);
					}
					for (var j = 0; j < ret.length; j++) {
						itemsToPrint[folderIndex].itemsComposite[itemComposite.seccion] = ret[j];
					}
				}
			}
		}
		
		itemsToPrint.sort(this.ordenaPorPeso);
		for (var key in itemsToPrint) {
			itemsToPrint[key].getObjDom().append(itemsToPrint[key].imprimir());
		}
	}
    
	printMenu() {
		
		this.processLayersJoin();
		
		if (this._hasMoreTabsThanOne()) {
            
            this._printWithTabs();

        } else {

            this.getMenuDOM().html(this._printSearcher());

            var itemsAux = new Array();
            var itemsIterator = this._itemsGetter.get(this);
            for (var key in itemsIterator) {
                itemsAux.push(itemsIterator[key]);
            }
            itemsAux.sort(this.ordenaPorPeso);
			
			var itemsAuxToFolders = new Array(); //Array with items and folders
            for (var key in itemsAux) {

                var itemComposite = itemsAux[key];
                itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items

                if ($('#' + itemComposite.seccion).length != 0) {
                    itemComposite.getObjDom().html('');
                }
				
				itemsAuxToFolders.push(itemComposite);
            }
			
			//Generate logical folders
			this.generateFolders(itemsAuxToFolders);
			
        }

        this.getLoadingDOM().hide();

        //To print all items in background
        for (var key in this.layersInfo) {
            if (this.layersInfo[key].tab.listType != "combobox") {
                this.addLazyInitLayerInfoCounter(ItemGroupPrefix + this.layersInfo[key].section);
                this.layersInfo[key].get(this);
            }
        }

        //Call callback after print (if exists)
        if (this.printCallback != null) {
            this.printCallback();
        }

        //Show visible layers count in class (to save state after refresh menu)
        for (var key in this.items) {
            this.items[key].muestraCantidadCapasVisibles();
        }

        //Tabs
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href") // activated tab object
            var activeTabId = target.replace('#main-menu-tab-', ''); // activated tab id
            gestorMenu.setSelectedTab(activeTabId);
            if (gestorMenu._selectedTab.isSearcheable == true) {
                $('#searchForm').show();
                $('#q').val(gestorMenu._selectedTab.getSearchQuery());
                if (gestorMenu._selectedTab.getSearchQuery() == "") {
                    $('#q').trigger('propertychange');
                }
                $('#q').trigger('propertychange');
            } else {
                $('#searchForm').hide();
            }
        });
        if (this._hasMoreTabsThanOne() == true && this._selectedTab.isSearcheable == false) { //Check if first active tab is searcheable
            $('#searchForm').hide();
        }

        //Searcher
        $('.has-clear input[type="text"]').on('input propertychange', function () {
            var $this = $(this);
            var visible = Boolean($this.val());
            $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
        }).trigger('propertychange');
        $('.form-control-clear').click(function () {
            $(this).siblings('input[type="text"]').val('')
                .trigger('propertychange').focus();
            $("#searchForm").submit();
        });
        $("#searchclear").click(function () {
            $("#q").val('');
            $("#searchForm").submit();
        });

        //Jquery autocomplete (begin)
        var accentMap = {
            "á": "a",
            "é": "e",
            "í": "i",
            "ó": "o",
            "ú": "u",
            "ñ": "n",
        };
        var normalize = function (term) {
            var ret = "";
            for (var i = 0; i < term.length; i++) {
                ret += accentMap[term.charAt(i)] || term.charAt(i);
            }
            return ret;
        };

        $("#q").autocomplete({
            source: function (request, response) {
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
                response($.grep(gestorMenu.getAvailableTags(), function (value) {
                    value = value.label || value.value || value;
                    return matcher.test(value) || matcher.test(normalize(value));
                }));
            },
            select: function (event, ui) {
                $("#q").val(ui.item.label);
                $("#searchForm").submit();
            }
        });
        //Jquery autocomplete (end)         
	}
    
    //Prints only one section (works on lazy initialization only)
    printOnlySection(sectionId) {
        var itemGroup = this.items[sectionId];
        if (itemGroup.tab.listType == "combobox") { //Si es combobox
            itemGroup.imprimir();
            $('#wms-combo-list').html(itemGroup.itemsStr);
        } else { //Si no es es combobox
            itemGroup.imprimir();
            $('#' + sectionId + ' > div').html(itemGroup.itemsStr);
        }
    }

    muestraCapa(itemSeccion) {
        if (!mapa.hasOwnProperty('activeLayerHasChanged')) {
            const intervalId = setInterval(() => {
                if (mapa.hasOwnProperty('activeLayerHasChanged')) {
                    window.clearInterval(intervalId);
                    gestorMenu.muestraCapa(itemSeccion);
                }
            }, 500);
            return;
        }
        
        const wmtsLayers = [];
        
		//Hide all if itemComposite selected is Base Map
        var isBaseLayer = false;
        let baseLayerName = '';
        
		for (var key in this.items) {
            var itemComposite = this.items[key];
			for (var key2 in itemComposite.itemsComposite) {
                var item = itemComposite.itemsComposite[key2];
                if (item.getId() == itemSeccion) {
                    isBaseLayer = itemComposite.isBaseLayer();
                    baseLayerName = item.nombre;
					break;
				}
			}
		}

        if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
            if (this.baseMapDependencies[this.lastBaseMapSelected])
                this.baseMapDependencies[this.lastBaseMapSelected].forEach(layer => {
                    if (this.activeLayers.find(lyr => lyr === layer))
                        this.muestraCapa(this.getLayerIdByName(layer));
                });
        }

		//Show or hide selected item
        for (var key in this.items) {
            var itemComposite = this.items[key];
			if (isBaseLayer && itemComposite.isBaseLayer()) {
                this.availableBaseLayers.forEach(baseLayer => {
                    this.removeActiveLayer(baseLayer);
                });
				itemComposite.hideAllLayers();
            }

            for (var key2 in itemComposite.itemsComposite) {
                var item = itemComposite.itemsComposite[key2];

                const layerIsActive = this.layerIsActive(item.nombre);
                const layerIsWmts = this.layerIsWmts(item.nombre);
                
                if (isBaseLayer && layerIsActive && layerIsWmts) {
                    wmtsLayers.push(item);
                } else {
                    if (item.getId() == itemSeccion) {
                        if ($(`#${item.getId()}`).hasClass('active')) {
                            this.removeActiveLayer(item.nombre);
                            if (!isBaseLayer)
                                mapa.activeLayerHasChanged(item.nombre, false);
                        } else {
                            this.addActiveLayer(item.nombre);
                            if (!isBaseLayer)
                                mapa.activeLayerHasChanged(item.nombre, true);
                        }
                        /*
                        let bbox = item.capa;
                        let bounds = [[bbox.maxy, bbox.maxx], [bbox.miny, bbox.minx]];
                        //console.log(bounds);
                        try {
                            mapa.fitBounds(bounds);
                        } catch (error) {
                            //console.log(bounds);
                        }*/
                        item.showHide();
                        itemComposite.muestraCantidadCapasVisibles();
                        break;
                    }
                }
            }
        }

        if (isBaseLayer && this.lastBaseMapSelected !== baseLayerName) {
            this.setLastBaseMapSelected(baseLayerName);

            setValidZoomLevel(baseLayerName);

            if (this.baseMapDependencies[baseLayerName])
                this.baseMapDependencies[baseLayerName].forEach(layer => {
                    if (!this.activeLayers.find(lyr => lyr === layer))
                        this.muestraCapa(this.getLayerIdByName(layer));
                });

            wmtsLayers.forEach(wmtsLayer => {
                wmtsLayer.showHide();
                wmtsLayer.showHide();
            });

            for (let i = 0; i < this.availableBaseLayers.length; i++) {
                const id = 'child-mapasbase' + i;
                if (itemSeccion !== id && $('#' + id).hasClass('active')) {
                    $('#' + id).removeClass('active');
                }
            }
        }
        
        if (this.activeLayersHasBeenUpdated)
            this.activeLayersHasBeenUpdated();
    }

    showWMSLayerCombobox(itemSeccion) {
        let nuevo_impresor = new Menu_UI
        nuevo_impresor.addLoadingAnimation("NEW-wms-combo-list")
        //Realiza el GET de las capas

        var itemSeccionAux = itemSeccion.replace(ItemGroupPrefix, '');
        for (var key in this.layersInfo) {
            
            if (this.layersInfo[key].section == itemSeccionAux) {
                this.addLazyInitLayerInfoCounter(itemSeccion);
                //nueva opcion crea un objeto para cada btn 
                this.layersInfo[key].get_without_print(this);
                //this.layersInfo[key].get(this)

             
            }
        }

        bindLayerOptionsIdera();

    }

    getLayerData(layerName, sectionName) {
        
        let sectionLayers, sections, layersArr = [], layerData = {};
        
        sectionName ? (
            sectionLayers = gestorMenu.items[sectionName].itemsComposite,
            layersArr.push(...Object.values(sectionLayers))
        ) : (
            sections = gestorMenu.items,
            Object.values(sections).forEach( section => { 
                section.seccion !== 'mapasbase' ? 
                layersArr.push(...Object.values(section.itemsComposite))
                : '' ;
            })
        )

        layersArr.forEach(layer => {
            let lyr = layer.capa;
            lyr.nombre === layerName ?
            layerData = {
                name: lyr.nombre,
                title: lyr.titulo,
                url: lyr.host.substring(0, lyr.host.lastIndexOf('/')),
                keywords: lyr.keywords ?? [],
                icon: lyr.legendURL,
                bbox: {
                    sw: { 
                        lng: lyr.minx, 
                        lat: lyr.miny 
                    },
                    ne: {
                        lng: lyr.maxx, 
                        lat: lyr.maxy
                    }
                }
            }
            : '' ;
        });
        return layerData ?? {} ;
    }

}

/******************************************
Tabs menu class
******************************************/
class Tab {
    constructor(tab) {
        this.id = "";
        this.content = "";
        this.isSearcheable = false;
        this.searchQuery = "";
        this.listType = "accordion";
        this.itemsGetter = new ItemsGetter();
        if (tab != undefined && tab != "") {
            this.id = tab.id;
            if (tab.searcheable != undefined) {
                this.isSearcheable = tab.searcheable;
            }
            if (tab.content != undefined) {
                this.content = tab.content;
            }
            if (tab.list_type != undefined) {
                this.listType = tab.list_type;
            }
        }
    }

    getId() {
        return this.id;
    }

    getExtendedId() {
        return EmptyTab + this.id;
    }

    getContent() {
        return (this.content != undefined && this.content != "") ? this.content : this.getId();
    }

    getSearchQuery() {
        return this.searchQuery;
    }

    setSearchQuery(q) {
        this.searchQuery = q;
    }

    getInitialPrint() {
        if (this.listType == "combobox") {
            return '<select id="wms-combobox-selector-' + this.id + '" onChange="gestorMenu.showWMSLayerCombobox(this.value)" class="wms-combobox-selector"><option value="">Seleccione un servicio</option>';
        }
        return '';
    }

    getEndPrint() {
        if (this.listType == "combobox") {
            return '</select><div id="wms-combo-list"></div><div id="NEW-wms-combo-list"></div>';
        }
        return '';
    }
}

var serviceItems = [];
/******************************************
Menu_UI
******************************************/
class Menu_UI{

    constructor() {
        this.layer_active_options = null
        this.available_options = ["download","filter","trash"]
    }

    addSection(name){
        let groupnamev= clearSpecialChars(name);
        let itemnew = document.createElement("div")
        itemnew.innerHTML =`
        <div id="lista-${groupnamev}" class="menu5 panel-default">
        <div class="panel-heading">
            <h4 class="panel-title">
                <a id="${groupnamev}-a" data-toggle="collapse" data-parent="#accordion1" href="#${groupnamev}-content" class="item-group-title">${name}</a>
            </h4>
        </div>
        <div id='${groupnamev}-content' class="panel-collapse collapse">
            <div class="panel-body" id ="${groupnamev}-panel-body"></div>
        </div>
        </div>`

        //add before first child of: div .menu5
        $('#sidebar div.menu5').first().prepend(itemnew)
    }

    addFileLayer(groupname, textName, id, fileName){
        let groupnamev= clearSpecialChars(groupname);
        let main = document.getElementById("lista-"+groupnamev)

        let div = ` 
        <div style="display:flex; flex-direction:row;">
        <div style="cursor: pointer; width: 70%" onclick="clickGeometryLayer('${id}')"><span style="user-select: none;">${id}</span></div>
        <div class="icon-layer-geo" onclick="mapa.downloadMultiLayerGeoJSON('${id}')"><i class="fas fa-download" title="descargar"></i></div>
        <div class="icon-layer-geo" onclick="deleteLayerGeometry('${id}')"><i class="far fa-trash-alt" title="eliminar"></i></div>
        </div>
        `
        //si no existe contenedor
        let id_options_container = "opt-c-"+id
        if(!main){this.addSection(groupnamev)}
        let content = document.getElementById(groupnamev+"-panel-body")
             let layer_container = document.createElement("div")
             layer_container.id = "fl-" +id
             layer_container.className = "file-layer-container"

             let layer_item = document.createElement("div")
             layer_item.id = "flc-" +id
             layer_item.className = "file-layer active"
              
             let img_icon =document.createElement("div")
             img_icon.className = "file-img"
             img_icon.innerHTML = `<img loading="lazy" src="src/js/components/openfiles/icon_file.svg">`
             img_icon.onclick = function(){
                clickGeometryLayer(id, true)
             }

            let layer_name = document.createElement("div")
            layer_name.className = "file-layername"
            layer_name.innerHTML= "<a>"+textName+"</a>"
            layer_name.title = fileName
            layer_name.onclick = function(){
                clickGeometryLayer(id, true)
            }
            
            let options = document.createElement("div")
            options.style = "width:10$;padding-right:5px;cursor:pointer;"
            options.className = "btn-group"
            options.role ="group"
            options.id = id_options_container

            let fdiv = document.createElement("div")
            fdiv.style = "border: 0px;"
            fdiv.className = "dropdown-toggle"
            fdiv.setAttribute('data-toggle', 'dropdown')
            fdiv.setAttribute('aria-haspopup', 'true')
            fdiv.setAttribute('aria-expanded', 'false')
            fdiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/> </svg>'
            // fdiv.innerHTML = '<span class="caret"></span>'

            let mainul = document.createElement("ul")
            mainul.className = "dropdown-menu"
            mainul.style = "right:0px !important;left:auto !important;"
            mainul.id = "opt-c-"+id

            let delete_opt = document.createElement("li")
            delete_opt.innerHTML = `<a style="color:#474b4e;" href="#"><i  class="fa fa-trash" aria-hidden="true" style="width:20px;"></i>Eliminar Capa</a>`
            delete_opt.onclick = function(){
                let menu = new Menu_UI
                menu.modalEliminar(id)
                //deleteLayerGeometry(layer)
            }

            let download_opt = document.createElement("li")
            download_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fa fa-download" aria-hidden="true" style="width:20px;"></i>Descargar .geojson</a>`
            download_opt.onclick = function(){
                let index_file = getIndexFileLayerbyID(id)
                let d_file_name = addedLayers[index_file].name
                mapa.downloadMultiLayerGeoJSON(id,addedLayers[index_file].name,true)
            }

            let edit_name_opt = document.createElement("li")
            edit_name_opt.innerHTML =`<a style="color:#474b4e;" href="#"><i class="fa fa-edit" aria-hidden="true" style="width:20px;"></i>Editar Nombre</a>`
            edit_name_opt.onclick = function(){
                menu_ui.editFileLayerName(id)
            }
            
            mainul.append(edit_name_opt)
            mainul.append(download_opt)
            mainul.append(delete_opt)
            
            options.append(fdiv)
            options.append(mainul)
                      
            layer_item.append(img_icon)
            layer_item.append(layer_name)
            layer_item.append(options)
            layer_container.append(layer_item)
            content.appendChild(layer_container)
    }

    addLayerOptions(layer){
        //display options true
        app.layers[layer].display_options = true
        this.layer_active_options = layer

        let id = "layer-options-" + layer
        let el = document.getElementById(id)


            el.setAttribute('class', 'layer-options-active')
            let options_container = document.createElement("div")
            options_container.className = "options-container"

            let options_tabs = document.createElement("div")
            options_tabs.className = "options-tabs"
            options_tabs.innerHTML=`
            <div class="option-tab-icon-active" title="descargar capa"><i class="fa fa-download" aria-hidden="true"></i></div>
            <div class="option-tab-icon" title="filtros"><i class="fa fa-filter" aria-hidden="true"></i></div>
            <div class="option-tab-icon" title="borrar capa"><i class="fa fa-trash" aria-hidden="true"></i></div>
            `

            let options_panel = document.createElement("div")
            options_panel.className = "options-panel"
            options_panel.innerHTML=`
            <div class="panel-download"></div>
            <div class="panel-filter"></div>
            <div class="panel-trash"></div>
            `
            options_container.append(options_tabs)
            options_container.append(options_panel)
            el.append(options_container)

    }

    closeLayerOptions(layer){
        let el = document.getElementById("layer-options-"+layer)
        app.layers[layer].display_options = false
        if(el){
            el.setAttribute('class', 'display-none')
            el.innerHTML = ""
        }
    }

    addLoadingAnimation(id_dom){
        let contenedor = document.getElementById(id_dom)
        contenedor.innerHTML= ""
        contenedor.innerHTML = '<div class="loading"><img src="src/styles/images/loading.svg"></div>'
    }

    async addLayers_combobox(items){
        let contenedor = document.getElementById("NEW-wms-combo-list")
        let list = document.createElement("div")
        let layers = items.itemsComposite
        for (const property in layers) {
            let id_dom = "child-"+layers[property].seccion
            let title = layers[property].capa.titulo
            let url_img = layers[property].capa.legendURL
            let descripcion = layers[property].capa.descripcion
            //add_btn_Layer_combobox(id_dom,title,url_img,descripcion,options)
            let li_layer = this.add_btn_Layer_combobox(id_dom,title,url_img,descripcion, false)
            list.append(li_layer)
            //console.log("layers[property]");
          }
          contenedor.innerHTML = ""
          contenedor.append(list)

    }

    add_btn_Layer_combobox(id_dom,title,url_img,descripcion,options){
        // reemplazar =title 
        let min_url_img = url_img+'&scale=1&&LEGEND_OPTIONS=forceTitles:off;forceLabels:off'
        let max_url_img = url_img+'&scale=1&&LEGEND_OPTIONS=forceTitles:on;forceLabels:on'
        let li = document.createElement("li")
        li.id= id_dom
        li.className = "capa list-group-item"
        li.style = "padding: 10px 1px 10px 1px;"

        if(options){
            //pendiente crear objeto 
            options_layer = "<div class='display-none' id=layer-options-"+title+"></div>"
        }

        let capa_info = document.createElement("div")
        capa_info.className = "capa-info"

        let container_expand_legend_grafic = document.createElement("div")
        container_expand_legend_grafic.className="expand_legend_grafic"
        container_expand_legend_grafic.style = "overflow:hidden;"
        container_expand_legend_grafic.setAttribute('load', false);

        let capa_legend_div = document.createElement("div")
        capa_legend_div.className = "legend-layer"

        let img_legend = document.createElement("img")
        img_legend.className="legend-img"
        img_legend.style = "width:22px;height:22px"
        img_legend.loading="lazy"
        img_legend.src=min_url_img
        img_legend.onerror = showImageOnError(this);
        capa_legend_div.append(img_legend) 

        let resize_img_icon = document.createElement("div")
        resize_img_icon.className = "resize-legend-combobox"
        resize_img_icon.style = "align-self: center;font-size: 14px"
        resize_img_icon.innerHTML = '<i class="fas fa-angle-down" aria-hidden="true"></i>'
        resize_img_icon.onclick = () => {
            if(container_expand_legend_grafic.getAttribute('load')==="true"){
                container_expand_legend_grafic.innerHTML=""
                container_expand_legend_grafic.setAttribute('load', false);
                resize_img_icon.innerHTML = '<i class="fas fa-angle-down" aria-hidden="true"></i>'
            }
            else{
                container_expand_legend_grafic.innerHTML="<img class='legend-img-max' loading='lazy'  src='" + max_url_img+ "' onerror='showImageOnError(this);'></img>"
                container_expand_legend_grafic.setAttribute('load', true);
                resize_img_icon.innerHTML = '<i class="fas fa-angle-up" aria-hidden="true"></i>'
            }
            
        }

        img_legend.addEventListener("load", event => {
            if(img_legend.naturalHeight>22){
                capa_legend_div.removeChild(img_legend);
                capa_legend_div.append(resize_img_icon)
                capa_legend_div.title="abrir leyenda"
                img_legend.src=""
            }

          });

        capa_legend_div.onclick = () => {
            /*
            if(li.className === "capa list-group-item active"){
                li.className = "capa list-group-item"
            }else{li.className = "capa list-group-item active"}
            gestorMenu.muestraCapa(id_dom)*/
        };
        
        let capa_title_div = document.createElement("div")
        capa_title_div.className = "name-layer"
        capa_title_div.style="align-self: center;"
        capa_title_div.onclick = function () {
            
            if(li.className === "capa list-group-item active"){
                //clase btn desactivada
                li.className = "capa list-group-item"
                //desactivar capa en mapa
                gestorMenu.muestraCapa(id_dom)
                //si tiene opcion a expand legend grafic y esta abierta cerrar.
                if(li.getElementsByClassName("legend-img").length==0){
                    if(container_expand_legend_grafic.getAttribute('load')==="true")resize_img_icon.click()
                }

            }else{
                //activar capa
                li.className = "capa list-group-item active"
                gestorMenu.muestraCapa(id_dom)
                if(li.getElementsByClassName("legend-img").length==0){
                    resize_img_icon.click()
                }
            }

          };


        let capa_description_a = document.createElement("a")
        capa_description_a.nombre = title
        capa_description_a.href="#"
        capa_description_a.innerHTML = "<span data-toggle2='tooltip' title='" + descripcion + "'>" + title+ "</span>"
        capa_title_div.append(capa_description_a)

        let btn_zoom_layer = document.createElement("div")
        btn_zoom_layer.className = "zoom-layer-combobox"
        btn_zoom_layer.style = "align-self: center;"
        btn_zoom_layer.layername = title
        btn_zoom_layer.innerHTML = "<i class='fas fa-search-plus' title='Zoom a capa'></i>"
        btn_zoom_layer.addEventListener("click", function(){
            if(li.className === "capa list-group-item"){
                li.className = "capa list-group-item active"
            }
            if(li.getElementsByClassName("legend-img").length==0){
                if(container_expand_legend_grafic.getAttribute('load')==="false")resize_img_icon.click()
            }
            zoomLayer(id_dom)
        })

        capa_info.append(capa_legend_div)
        capa_info.append(capa_title_div)
        capa_info.append(btn_zoom_layer)
        li.append(capa_info)
        li.append(container_expand_legend_grafic)
        return li
    }
    
    modalEliminar(id){
        let index_file= getIndexFileLayerbyID(id)
        let textname = addedLayers[index_file].name
        let fileName = addedLayers[index_file].file_name
        $("#modal_layer_del").remove();
        let modal =  document.createElement("div")
        modal.id="modal_layer_del"
        modal.className = "modal-file-delete"

        let close_icon = document.createElement("div")
        close_icon.style= "display:flex;flex-direction: row;padding-top:5px"
        let c_empty = document.createElement("div")
        c_empty.style.width = "90%"
        let c_close = document.createElement("div")
        c_close.style = 'width:10%;text-align: center;cursor:pointer;'
        c_close.innerHTML ='<i style="color:grey;font-size:16px" class="fa fa-times" aria-hidden="true"></i>'
        c_close.onclick = function(){
            $("#modal_layer_del").remove();
        }
        close_icon.append(c_empty)
        close_icon.append(c_close)

        let modal_body = document.createElement("div")
        modal_body.className = "modal-file-delete-body"
        modal_body.innerHTML = `¿Eliminar Capa <strong>${textname}</strong>?`
        modal_body.title = `¿Eliminar ${fileName}?`

        let btn_container = document.createElement("div")
        btn_container.style =   'display: flex; flex-direction: row;  justify-content: space-between;margin:0px 20px 10px 20px;'
        
        let btn_si = document.createElement("button")
        btn_si.className = "btn btn-info"
        btn_si.innerHTML = "Eliminar"    
        btn_si.onclick = function(){
            delFileItembyID(id)
            deleteLayerGeometry(id,true)
            $("#modal_layer_del").remove();
        }

        let btn_no = document.createElement("button")
        btn_no.className = "btn btn-default"
        btn_no.style = 'border: 1px solid silver'
        btn_no.innerHTML = "Cancelar"
        btn_no.onclick = function(){
            $("#modal_layer_del").remove();
        }

        btn_container.append(btn_si)
        btn_container.append(btn_no)

        modal.append(close_icon)
        modal.append(modal_body)
        modal.append(btn_container)
        document.body.appendChild(modal)

        $( "#modal_layer_del" ).draggable({
            containment: "#mapa"})

    }

    editFileLayerName(id){
        let index = getIndexFileLayerbyID(id)       
        addedLayers[index].laodingname = false
        let id_i = "flc-"+id
        let container = document.getElementById(id_i)
        let element = container.getElementsByClassName("file-layername")[0]
        let name = element.innerText
        let nodo_hijo = container.getElementsByClassName("btn-group")[0]
        element.remove()

        let input_name = document.createElement("input")
        input_name.value = name
        input_name.type = element.innerText
        input_name.className = "input_newname form-control"
        input_name.style = "width: 75% !important;"
        input_name.id = "i-"+id
        
        input_name.autocomplete = "off"
        input_name.style = "height:22px!important;"
        input_name.onblur= function(e){
            if(!addedLayers[index].laodingname){
                $("#i-"+id).remove()
                let a_new = document.createElement("div")
                a_new.className = "file-layername"
                a_new.innerHTML = `<a>${name}</a>`
                container.insertBefore(a_new,nodo_hijo);
            }
        }

        input_name.onkeyup = function(e){
            if(e.key === 'Enter' || e.keyCode === 13){
                addedLayers[index].laodingname = true
                $("#i-"+id).remove()
                let a_new = document.createElement("div")
                a_new.className = "file-layername"
                a_new.title = this.value
                editDomNameofFileLayerbyID(id,this.value)
                a_new.innerHTML = `<a>${this.value}</a>`
                a_new.onclick = function(){
                    clickGeometryLayer(id,true)
                }
                container.insertBefore(a_new,nodo_hijo);
            }
        }

        container.insertBefore(input_name,nodo_hijo);
        $(`#i-${id}`).focus()
    }

    editGroupName(id,oldName,newName){
        clearSpecialChars(oldName);
        clearSpecialChars(newName);
        let el = document.getElementById(`${oldName}-a`);
        if(el) {
            el.innerText = newName;
            document.getElementById(`lista-${oldName}`).id = `lista-${newName}`;
            document.getElementById(oldName+"-panel-body").id = newName+"-panel-body";
        };
    }

    removeLayerFromGroup(groupname, textName, id, fileName,layer){
        if(serviceItems[id].layers[textName].L_layer != null){
            serviceItems[id].layers[textName].L_layer.remove();
        }

        document.getElementById("srvcLyr-"+id+textName).remove();
        serviceItems[id].layersInMenu--;
        
        for (let i in serviceItems[id].layers) {
            if (serviceItems[id].layers[i] === textName) {
                serviceItems[id].layers.splice(i,1);
                break;
            }
        }

        if(serviceItems[id].layersInMenu == 0 || serviceItems[id].layersInMenu == undefined){
            this.removeLayersGroup(groupname);
        }
    }
    
    removeLayersGroup(groupname){
        let el = document.getElementById(`lista-${clearSpecialChars(groupname)}`);
        if(el) el.remove();
    }

    addLayerToGroup(groupname, textName, id, fileName, layer){
        let newLayer = layer;
        newLayer.active = false;
        newLayer.L_layer = null;
        // let firstLayerAdded = false; // To simulate the click event
        if (serviceItems[id]!=undefined) {
            serviceItems[id].layers[textName] = newLayer;
            serviceItems[id].layersInMenu++;
        }else {
            serviceItems[id] = {
                layers:[],
                layersInMenu:0,
            }
            serviceItems[id].layers[textName] = newLayer;
            serviceItems[id].layersInMenu++;
            // firstLayerAdded = true; // Yes! First layer added
        }
        

        let groupnamev = clearSpecialChars(groupname);
        let main = document.getElementById("lista-"+groupnamev)
        let id_options_container = "opt-c-"+id
        if(!main){this.addSection(groupname)}

        let content = document.getElementById(groupnamev+"-panel-body")
        let layer_container = document.createElement("div")
        layer_container.id = "fl-" +id
        layer_container.className = "file-layer-container"

        let layer_item = document.createElement("div")
        layer_item.id = "srvcLyr-"+id+textName
        layer_item.className = "file-layer"
        
        let img_icon = document.createElement("div")
        img_icon.className = "loadservice-layer-img"
        img_icon.innerHTML = `<img loading="lazy" src="${layer.legend}&Transparent=True&scale=1&LEGEND_OPTIONS=forceTitles:off;forceLabels:off">`
        img_icon.onclick = function(){
            clickGeometryLayer(id, true)
        }

        let layer_name = document.createElement("div")
        layer_name.className = "file-layername"
        let capitalizedTitle = layer.title[0].toUpperCase() + layer.title.slice(1).toLowerCase();
        layer_name.innerHTML= "<a>"+capitalizedTitle+"</a>"
        layer_name.title = fileName;
        layer_name.onclick = function(){
            layer_item.classList.toggle('active');
            
            if (!layer.active) {
                layer.L_layer = L.tileLayer.wms(layer.host, {
                    layers: layer.name,
                    format: 'image/png',
                    transparent: true,
                }).addTo(mapa);
                layer.active = true;
                
                gestorMenu.layersDataForWfs[layer.name] = {
                    name: layer.name,
                    section: layer.title,
                    host: layer.host
                }
            }else {
                mapa.removeLayer(layer.L_layer);
                layer.active = false;
            }
        }        
        
        let zoom_button = document.createElement("div")
        zoom_button.className = "loadservice-layer-img"
        zoom_button.innerHTML = `<i class="fas fa-search-plus" title="Zoom a capa"></i>`
        zoom_button.onclick = function(){
            
            layer_item.classList.toggle('active');
            
            if (!layer.active) {
                let bounds = [[layer.maxy, layer.maxx], [layer.miny, layer.minx]];
                mapa.fitBounds(bounds);
                layer.L_layer = L.tileLayer.wms(layer.host, {
                    layers: layer.name,
                    format: 'image/png',
                    transparent: true,
                }).addTo(mapa);
                layer.active = true;
            }else {
                mapa.removeLayer(layer.L_layer);
                layer.active = false;
            }
        }


        layer_item.append(img_icon)
        layer_item.append(layer_name)
        layer_item.append(zoom_button)
        layer_container.append(layer_item)
        content.appendChild(layer_container)

        // Open the tab

        if(serviceItems[id].layersInMenu == 1) $(`#${groupnamev}-a`).click();
        
    }

}

class Geometry {
  constructor() {
    this._types = [
      "Geometry",
      "Point",
      "MultiPoint",
      "LineString",
      "MultilineString",
      "Polygon",
      'MultiPolygon'
    ];
  }

  isValidType(geom) {
    if(this._types.filter((type) => type === geom)) {
      return true;
    } else {
      return false;
    }
  }
}


/******************************************
CAPTURAR FECHA DE IMAGEN SATELITAL
******************************************/
class Fechaimagen {
  constructor(lat, long, zoom) {
    this.lat = lat;
    this.long = long;
    this.zoom = zoom;
  }

  get area() {
    return this.getFechaImagen();
  }

  getFechaImagen() {
    let picMdata = '',
      id = '',
      esriUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/',
      outFields = ['SRC_RES','SRC_ACC','SRC_DESC','MinMapLevel','MaxMapLevel','NICE_NAME','SRC_DATE2','NICE_DESC'], 
      // available outFields : OBJECTID,SRC_DATE,SRC_RES,SRC_ACC,SAMP_RES,SRC_DESC,MinMapLevel,MaxMapLevel,NICE_NAME,DrawOrder,SRC_DATE2,NICE_DESC,Shape_Length,Shape_Area
      x = (this.long * 20037508.34) / 180,
      y = Math.log(Math.tan(((90 + parseFloat(this.lat)) * Math.PI) / 360)) / (Math.PI / 180),
      metadataIndex = { 19: 9, 18: 10, 17: 11, 16: 12, 15: 13, 14: 14, 13: 15, 12: 16 },
      sensorData = {
          'WV01': { name: 'WorldView-1 (COSPAR: 2007-041A)', link: 'https://en.wikipedia.org/wiki/WorldView-1' },
          'WV02': { name: 'WorldView-2 (COSPAR: 2009-055A)', link: 'https://www.maxar.com/constellation' },
          'WV03': { name: 'WorldView-3 (COSPAR: 2014-048A)', link: 'http://worldview3.digitalglobe.com/' },
          'WV04': { name: 'WorldView-4 (COSPAR: 2016-067A)', link: 'https://resources.maxar.com/data-sheets/worldview-4/' },
          'GE01': { name: 'GeoEye-1 (COSPAR: 2008-042A)', link: 'https://en.wikipedia.org/wiki/GeoEye-1' },
          'PNOA': { name: 'Plan Nacional de Ortofotografía Aérea', link: 'https://pnoa.ign.es/'},
          'NYS ITS GIS Orthos': { name: 'Ortofotos del Estado de Nueva York', link: 'https://orthos.dhses.ny.gov/'},
          'Madrid Orthos': { name: 'Ortofoto rápida 2019 de Madrid', link: 'https://geoportal.madrid.es/IDEAM_WBGEOPORTAL/dataset.iam?id=f44997dd-a1a9-11ea-a9ae-ecb1d753f6e8'}
        },
      providerData = {
        'Maxar': { name: 'Maxar', link: 'https://www.maxar.com' },
        'Ayuntamiento de Madrid': { name: 'IDE Ayuntamiento de Madrid', link: 'https://www.comunidad.madrid/servicios/mapas/geoportal-comunidad-madrid' } 
        };
        
    y = (y * 20037508.34) / 180;
    id = metadataIndex[this.zoom];
    esriUrl += `${id}/query?f=json&returnGeometry=false&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A${x}%2C%22ymin%22%3A${y}%2C%22xmax%22%3A${x}%2C%22ymax%22%3A${y}%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%2C%22latestWkid%22%3A3857%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=${outFields}&outSR=102100`;

    $.get({
      url: esriUrl,
      async: false,
      success: function (data) {
          let md = ""; 
          if(data.features && data.features.length){
              md = data.features[0].attributes;
              picMdata = {
                  date: new Date(md.SRC_DATE2).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                  resolution: md.SRC_RES,
                  accuracy: md.SRC_ACC,
                  sensor: (sensorData[md.SRC_DESC]) ? `<a href="${sensorData[md.SRC_DESC].link}" target="_blank">${sensorData[md.SRC_DESC].name}</a>` : md.SRC_DESC,
                  provider: (providerData[md.NICE_DESC]) ? `<a href="${providerData[md.NICE_DESC].link}" target="_blank">${providerData[md.NICE_DESC].name}</a>` : md.NICE_DESC,
                  sensor_texto: sensorData[md.SRC_DESC].name,
                  provider_texto: providerData[md.NICE_DESC].name,
                  product: md.NICE_NAME,
                  minZoom: md.MinMapLevel,
                  maxZoom: md.MaxMapLevel,
                };
          };
      },
    });

    return picMdata;
  }
}