'use strict';

const EmptyTab = 'main-menu-tab-'; 

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
		return this.host + "/wms?";
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
		
        var legendImg = (itemComposite.getLegendImg() == null)? "" : "<div class='legend-layer'><img src='" + itemComposite.getLegendImg() + "' onerror='showImageOnError(this);'></div>";
        
		return "<li id='" + childId + "' class='capa list-group-item' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'>" + 
					"<div class='capa-title'>" +
						"<a nombre=" + itemComposite.nombre + " href='#'>" +
							"<span data-toggle2='tooltip' title='" + itemComposite.descripcion + "'>" + (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</span>" + 
							 legendImg +
						"</a>" +						
					"</div>" +
				"</li>";
			
	}
}

class ImpresorItemCapaBaseHTML extends Impresor {
	imprimir(itemComposite) {
		
		var childId = itemComposite.getId();
		var titulo = (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre");
		
		return "<li id='" + childId + "' class='list-group-item' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'>" + 
					"<div style='vertical-align:top'>" +
						"<a nombre=" + itemComposite.nombre + " href='#'>" +
							"<img src='" + itemComposite.getLegendImg() + "' onerror='showImageOnError(this);' alt='" + titulo + "' class='img-rounded'>" +
							"<span>" + titulo + "</span>" + 
						"</a>" +						
					"</div>" +
				"</li>";
			
	}
}

class ImpresorGrupoHTML extends Impresor {
	imprimir(itemComposite) {
		
		var listaId = itemComposite.getId();
		var itemClass = 'menu5';
		
		return "<div id='" + listaId + "' class='" + itemClass + " panel-heading' >" +
			"<div class='panel-title'>" +
			"<a data-toggle='collapse' id='" + listaId + "-a' href='#" + itemComposite.seccion + "' class='item-group-title'>" + itemComposite.nombre + "</a>" +
			"<div class='item-group-short-desc'><a data-toggle='collapse' data-toggle2='tooltip' title='" + itemComposite.descripcion + "' href='#" + itemComposite.seccion + "'>" + itemComposite.shortDesc + "</a></div>" +
			"</div>" +
			"<div id='" + itemComposite.seccion + "' class='panel-collapse collapse'><ul class='list-group nav-sidebar'>" + itemComposite.itemsStr + "</ul></div></div>";
		
	}
}

class ImpresorCapasBaseHTML extends Impresor {
	imprimir(itemComposite) {
		
		var listaId = itemComposite.getId();
		// Only one basemap-selector
		if($( ".basemap-selector a[data-toggle='collapse']" ).length == 0) {
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
    
    constructor(host, service, version, tab, section, weight, name, short_abstract, feature_info_format, type) {
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
        
        this._executed = false;
    }
    
	get(_gestorMenu) {
        if (this._executed == false) {
           this._executed = true;
           this._parseRequest(_gestorMenu);
        }
	}
    
    generateGroups(_gestorMenu) {
        const impresorGroup = new ImpresorGrupoHTML();
        const impresorItem = new ImpresorItemHTML();
        
        var thisObj = this;
        
        //Instance an empty ItemGroup (without items)
        var groupAux = new ItemGroup(thisObj.tab, thisObj.name, thisObj.section, thisObj.weight, "", "", thisObj.short_abstract);
        groupAux.setImpresor(impresorGroup);
        groupAux.setObjDom(gestorMenu.getItemsGroupDOM());
        _gestorMenu.addItemGroup(groupAux);
    }
    
    _parseRequest(_gestorMenu) {
        const impresorGroup = new ImpresorGrupoHTML();
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
                    $.each( keywordsHTMLList, function( i, el ) {
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
                    var item = new Item(capa.nombre, thisObj.section+index, keywords, iAbstract, capa.titulo, capa, thisObj.getCallback());
                    item.setLegendImgPreformatted(_gestorMenu.getLegendImgPath());
                    item.setImpresor(impresorItem);
                    items.push(item);
                    
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
                _gestorMenu.removeLazyInitLayerInfoCounter(thisObj.section);
                if (_gestorMenu.finishLazyInitLayerInfo(thisObj.section)) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printOnlySection(thisObj.section);
                }
            } else {
                _gestorMenu.addLayerInfoCounter();
                if (_gestorMenu.finishLayerInfo()) { //Si ya cargó todas las capas solicitadas
                    _gestorMenu.printMenu();
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
        /*
        if (this.type == 'wmslayer_mapserver') {
            onClickHandler = 'loadWmsMapServer';
        }
        */
        return onClickHandler;
    }
}


/******************************************
Composite para menu
******************************************/
class ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion) {
		this.nombre = nombre
		this.seccion = seccion
		this.peso = null;
		this.palabrasClave = palabrasClave
		this.descripcion = descripcion
		this.impresor = null
		this.objDOM = null
		this.querySearch = ''
		
		this.searchOrderIntoKeywords();
	}
        
    getQuerySearch() {
        return this.querySearch;
    }
    
    setQuerySearch(q) {
        this.querySearch = q;
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
		return "lista-" + this.seccion;
	}
    
    getTab() {
        return this.tab;
    }
	
	ordenaItems(a, b) {
		var aOrden1 = a.peso;
		var bOrden1 = b.peso;
		var aOrden2 = a.titulo.toLowerCase();
		var bOrden2 = b.titulo.toLowerCase(); 
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
	
	imprimir() {
		this.itemsStr = '';
		
		var itemsAux = new Array();
		for (var key in this.itemsComposite) {
            this.itemsComposite[key].setQuerySearch((this.tab.getId() == "") ? this.querySearch : this.tab.getSearchQuery());
            if (this.itemsComposite[key].match() == true) { //Returns true on item match with querySearch string
                itemsAux.push(this.itemsComposite[key]);
            }
		}
		
        if (itemsAux.length > 0) {
            itemsAux.sort(this.ordenaItems);
            
            for (var key in itemsAux) {
                this.itemsStr += itemsAux[key].imprimir();
            }
            return this.impresor.imprimir(this);
        }
        
        return '';
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
	
	hideAllLayersExceptOne(item) {}
    
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

class Item extends ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion, titulo, capa, callback) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.titulo = titulo;
		this.capa = capa;
		this.visible = false;
		//this.legendImg = "templates/" + template + "/img/legends/" + this.titulo.replace(':', '').replace('/', '') + ".svg";
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
	
	showHide() {
		$('#' + this.getId()).toggleClass('active');
        
        if (typeof this.callback == 'string') {
            this.callback = eval(this.callback);
        }
        
		if (typeof this.callback === "function") {
			//loadWms(this.callback, this.capa.host, this.nombre);
            loadWms(this.callback, this);
		} else if (this.capa.servicio === "tms") {
			loadMapaBase(this.capa.host, this.capa.nombre, this.capa.attribution);
		} else if (this.capa.servicio === "bing") {
			loadMapaBaseBing(this.capa.key, this.capa.nombre, this.capa.attribution);
		} else {
			loadGeojson(this.capa.host, this.nombre);
		}
		this.visible = !this.visible;
	}
	
	getLegendURL() {
		return this.capa.getLegendURL();
	}
    
    getAvailableTags() {
        return [this.capa.titulo];
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

	getStatus(){
		return this.status;
	}

	setStatus(status){
		switch (status){
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
	triggerLoad(){
		$("body").trigger("pluginLoad", { pluginName: this.name });
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
        
        this._existsIndexes = new Array(); //Identificador para evitar repetir ID de los items cuando provinen de distintas fuentes
        this._getLayersInfoCounter = 0;
        this._getLazyInitLayersInfoCounter = {};
        this._tabs = {};
        this._selectedTab = null;
        this._lazyInitialization = false;
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
    
    /*
    setItemsGroupDOM(itemsGroupDOM) {
        this.itemsGroupDOM = itemsGroupDOM;
    }
    */
    
    getItemsGroupDOM() {
        //return this.itemsGroupDOM;
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
    
    getQuerySearch() {
        return this.querySearch;
    }
    
    setQuerySearch(q) {
        this.querySearch = q;
        this.setSelectedTabSearchQuery(q);
    }
    
    addLazyInitLayerInfoCounter(sectionId) {
        if (this._getLazyInitLayersInfoCounter[sectionId] == undefined) {
            this._getLazyInitLayersInfoCounter[sectionId] = 1;
        } else {
            this._getLazyInitLayersInfoCounter[sectionId]++;
        }
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
        //if (tab.getExtendedId() != EmptyTab && this._tabs.includes(tab.getExtendedId()) === false) this._tabs.push(tab.getExtendedId());
        if (tab.getExtendedId() != EmptyTab) this._tabs[tab.getId()] = tab;
    }
    
    setSelectedTab(tabId) {
        this._selectedTab = this._tabs[tabId];
    }
    
    setSelectedTabSearchQuery(q) {
        if (this._selectedTab != null) {
            this._selectedTab.setSearchQuery(q);
        }
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
			if(typeof callback === 'function'){
			// Create plugin with callback if need to
				pluginAux = new Plugin(pluginName, url, callback);
				this.plugins[pluginAux.name] = pluginAux;
				this.pluginsCount ++;
				this.pluginsLoading ++;
				$.getScript(url, function( data, textStatus, jqxhr ) {
					if(textStatus == "success") {
						pluginAux.setStatus("ready");
						gestorMenu.pluginsLoading --;
						pluginAux.triggerLoad();
						pluginAux.callback();
					}
				}).fail(function( jqxhr, settings, exception ) {
					pluginAux.setStatus("fail");
					console.log("Error: " + jqxhr.status);
					gestorMenu.pluginsCount --;
					gestorMenu.pluginsLoading --;
				});
			}
			else {
			// Create a plugin with no callback
				pluginAux = new Plugin(pluginName, url, null);
				this.plugins[pluginAux.name] = pluginAux;
				this.pluginsCount ++;
				this.pluginsLoading ++;
				$.getScript(url, function( data, textStatus, jqxhr ) {
					if(textStatus == "success") {
						pluginAux.setStatus("ready");
						gestorMenu.pluginsLoading --;
						pluginAux.triggerLoad();
					}
				}).fail(function( jqxhr, settings, exception ) {
					pluginAux.setStatus("fail");
					console.log("Error: " + jqxhr.status);
					gestorMenu.pluginsCount --;
					gestorMenu.pluginsLoading --;
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
	
	ordenaPorPeso(a, b){
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
            $(function() {
                $(".collapse").on('show.bs.collapse', function(e) {
                    if ($(this).is(e.target)) {
                        var showingId = this.id;
                        if ($('#' + showingId + ' > ul').html() == '') {
                            $('#' + showingId + ' > ul').html('<div class="loading"><img src="img/loading.gif" style="width:35px"></div>');
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
	
    print() {
        this.executeLayersInfo();
    }
    
    _printSearcher() {
        return "<div style='background-color:#008dc9'><form class='form-inline' id='searchForm' onSubmit='mainMenuSearch(event)'><div class='form-group ui-widget'><input type='search' class='form-control input-sm' id='q' name='q' value='" + this.getQuerySearch() + "' placeholder='buscar...'></div><button class='btn btn-default input-sm' type='submit'><i class='fas fa-search'></i></button></form></div>";
    }
    
    getAvailableTags() {
        var availableTags = [];
        for (var key in this.items) {
            var itemComposite = this.items[key];
            if (this._hasMoreTabsThanOne() == false || itemComposite.getTab().getId() == this._selectedTab.getId()) { //If not use tabs get all tags or just get available tags from item in selected tab
                availableTags = availableTags.concat(itemComposite.getAvailableTags());
            }
        }
        return availableTags;
    }
    
    _printWithTabs() {
        
        var aSections = {};
        
        for (var key in this._tabs) {
            if (this._selectedTab == null) {
                this.setSelectedTab(this._tabs[key].id);
                var sClassAux = 'active';
            } else if (this._selectedTab.getId() == this._tabs[key].id) {
                var sClassAux = 'active';
            }
            aSections[this._tabs[key].getExtendedId()] = [];
            aSections[this._tabs[key].getExtendedId()].push("<div role='tabpanel' class='tab-pane " + sClassAux + "' id='" + this._tabs[key].getExtendedId() + "'>");
            sClassAux = '';
        }
        
        //this.getMenuDOM().html("");
        this.getMenuDOM().html(sInitialHTML);
		
		var itemsAux = new Array();
		for (var key in this.items) {
			itemsAux.push(this.items[key]);
		}
		itemsAux.sort(this.ordenaPorPeso);

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
    
	printMenu() {
		
        if (this._hasMoreTabsThanOne()) {
            
            this._printWithTabs();
            
        } else {
            
            this.getMenuDOM().html(this._printSearcher());
		
            var itemsAux = new Array();
            for (var key in this.items) {
                itemsAux.push(this.items[key]);
            }
            itemsAux.sort(this.ordenaPorPeso);
            
            for (var key in itemsAux) {
                
                var itemComposite = itemsAux[key];
                itemComposite.setQuerySearch(this.getQuerySearch()); //Set query search for filtering items
                
                if ($('#' + itemComposite.seccion).length != 0) {
                    itemComposite.getObjDom().html('');
                }
                itemComposite.getObjDom().append(itemComposite.imprimir());
                
            }
            
        }
        
        this.getLoadingDOM().hide();
		
        if (this.printCallback != null) {
            this.printCallback();
        }
        
        //Tabs
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
          var target = $(e.target).attr("href") // activated tab
          gestorMenu.setSelectedTab(target.replace('#main-menu-tab-', ''));
          $('#q').val(gestorMenu._selectedTab.getSearchQuery());
        });
        
        //Searcher
        $("#searchclear").click(function(){
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
        var normalize = function( term ) {
          var ret = "";
          for ( var i = 0; i < term.length; i++ ) {
            ret += accentMap[ term.charAt(i) ] || term.charAt(i);
          }
          return ret;
        };
        
        $( "#q" ).autocomplete({
          source: function( request, response ) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
            response( $.grep( gestorMenu.getAvailableTags(), function( value ) {
              value = value.label || value.value || value;
              return matcher.test( value ) || matcher.test( normalize( value ) );
            }) );
          },
          select: function(event, ui) {
            $("#q").val(ui.item.label);
            $("#searchForm").submit();
          }
        });
        //Jquery autocomplete (end)
         
	}
    
    //Prints only one section (works on lazy initialization only)
    printOnlySection(sectionId) {
        var itemGroup = this.items[sectionId];
        itemGroup.imprimir();
        $('#' + sectionId + ' > ul').html(itemGroup.itemsStr);
    }
	
	muestraCapa(itemSeccion) {
		for (var key in this.items) {
			var itemComposite = this.items[key];
			for (var key2 in itemComposite.itemsComposite) {
				var item = itemComposite.itemsComposite[key2];
				if (item.getId() == itemSeccion) {
					itemComposite.hideAllLayersExceptOne(item);
					item.showHide();
					itemComposite.muestraCantidadCapasVisibles();
					break;
					break;
				}
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
        if (tab != undefined && tab != "") {
            this.id = tab.id;
            if (this.isSearcheable != undefined) {
                this.isSearcheable = tab.searcheable;
            }
            if (this.content != undefined) {
                this.content = tab.content;
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
}