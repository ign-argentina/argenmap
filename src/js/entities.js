'use strict';

const EmptyTab = 'main-menu-tab-';
const ItemGroupPrefix = 'lista-';

/******************************************
Class Capa
******************************************/
class Capa {
    constructor(nombre, titulo, srs, host, servicio, version, featureInfoFormat, key, minx, maxx, miny, maxy, attribution) {
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
        let owsHost = (this.servicio == "wms") ? this.host + "/wms?" : this.host + "/gwc/service/wmts";
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
    imprimir(itemComposite) {

        var childId = itemComposite.getId();

        var legendImg = (itemComposite.getLegendImg() == null) ? "" : "<div class='legend-layer'><img src='" + itemComposite.getLegendImg() + "' onerror='showImageOnError(this);'></div>";
        var activated = (itemComposite.visible == true) ? " active " : "";

        return "<li id='" + childId + "' class='capa list-group-item" + activated + "' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'>" +
            "<div class='capa-title'>" +
            "<a nombre=" + itemComposite.nombre + " href='#'>" +
            "<span data-toggle2='tooltip' title='" + itemComposite.descripcion + "'>" + (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</span>" +
            legendImg +
            "</a>" +
            "</div>" +
            "</li>";

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

        var titulo = (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre");

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
                        "<img src='" + itemComposite.getLegendImg() + "' onerror='showImageOnError(this);' alt='" + titulo + "' class='img-rounded'>" +
                        "<div class='non-selectable-text'><p style='margin: 0px;'>" + titulo + "</p></div>" +
                    "</div>" +
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
                        if (this.type == 'wmslayer_mapserver') {
                            var capa = new CapaMapserver(key, this.customizedLayers[key]["new_title"], null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        } else {
                            var capa = new Capa(key, this.customizedLayers[key]["new_title"], null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        }
                        //Generate keyword array
                        var keywordsAux = [];
                        if (this.customizedLayers[key]["new_keywords"] != null && this.customizedLayers[key]["new_keywords"] != '') {
                            keywordsAux = this.customizedLayers[key]["new_keywords"].split(',');
                            for (var keykeywordsAux in keywordsAux) {
                                keywordsAux[keykeywordsAux] = keywordsAux[keykeywordsAux].trim();
                            }
                        }

                        var item = new Item(capa.nombre, this.section + clearString(capa.nombre), keywordsAux, this.customizedLayers[key]["new_abstract"], capa.titulo, capa, this.getCallback());
                        
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
                        var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY);
                    }
                    var item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback());
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
                    
                    //
                    gestorMenu.allLayersAreLoaded = true;
                }
            }

            return;
        });
    }

    getHostOWS() {
        //Define GetCapabilities host endpoint
        var host = this.host + '/ows';
        if (this.type == 'wmslayer_mapserver') {
            host = this.host;
        }
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
                        if (this.type == 'wmslayer_mapserver') {
                            var capa = new CapaMapserver(key, this.customizedLayers[key]["new_title"], null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        } else {
                            var capa = new Capa(key, this.customizedLayers[key]["new_title"], null, this.host, this.service, this.version, this.feature_info_format, null, null, null, null);
                        }

                        //Generate keyword array
                        var keywordsAux = [];
                        if (this.customizedLayers[key]["new_keywords"] != null && this.customizedLayers[key]["new_keywords"] != '') {
                            keywordsAux = this.customizedLayers[key]["new_keywords"].split(',');
                            for (var keykeywordsAux in keywordsAux) {
                                keywordsAux[keykeywordsAux] = keywordsAux[keykeywordsAux].trim();
                            }
                        }

                        var item = new Item(capa.nombre, this.section + clearString(capa.nombre), keywordsAux, this.customizedLayers[key]["new_abstract"], capa.titulo, capa, this.getCallback());
                        
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
                    var iBoundingBox = $('ows:wgs84boundingbox', i);
                    var iSrs = null;
                    var iMaxY = null;
                    var iMinY = null;
                    var iMinX = null;
                    var iMaxX = null;
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
                        var capa = new Capa(iName, iTitle, iSrs, thisObj.host, thisObj.service, thisObj.version, thisObj.feature_info_format, iMinX, iMaxX, iMinY, iMaxY);
                    }
                    var item = new Item(capa.nombre, thisObj.section + index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback());
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
        //Define GetCapabilities host endpoint
        var host = this.host + '/gwc/service/wmts';
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
        this.seccion = sanatizeString(seccion)
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
	constructor(nombre, seccion, palabrasClave, descripcion, titulo, capa, callback) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.titulo = titulo;
		this.capa = capa;
		this.capas = [capa];
		this.visible = false;
        this.legendImg = null;
        this.callback = callback;
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

    getBasemapSelected() {
        return this.basemapSelected;
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
                "<div class='input-group'>" +
                "<div class='form-group has-feedback has-clear'>" +
                "<input type='text' class='form-control' id='q' name='q' value='" + this.getQuerySearch() + "' placeholder='buscar capas...'>" +
                "<span class='form-control-clear glyphicon glyphicon-remove-circle form-control-feedback hidden'></span>" +
                "</div>" +
                "<span class='input-group-btn'>" +
                "<button class='btn btn-default' type='submit'><span class='glyphicon glyphicon-search' aria-hidden='true'></span></button>" +
                "</span>" +
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
                        item.showHide();
                        itemComposite.muestraCantidadCapasVisibles();
                        break;
                    }
                }
            }
        }

        if (isBaseLayer) {
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


        //Loader gif
        $('#wms-combo-list').html('<div class="loading"><img src="src/styles/images/loading.svg"></div>');

        //Realiza el GET de las capas
        var itemSeccionAux = itemSeccion.replace(ItemGroupPrefix, '');
        for (var key in this.layersInfo) {
            if (this.layersInfo[key].section == itemSeccionAux) {
                this.addLazyInitLayerInfoCounter(itemSeccion);
                this.layersInfo[key].get(this);
            }
        }

        //Reimprime menu
        for (var key in this.items) {
            var itemComposite = this.items[key];
            if (itemComposite.getId() == itemSeccion && Object.keys(itemComposite.itemsComposite).length > 0) {
                itemComposite.imprimir();
                $('#wms-combo-list').html(itemComposite.itemsStr);
            }
        }

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
            return '</select><div id="wms-combo-list"></div>';
        }
        return '';
    }
}
