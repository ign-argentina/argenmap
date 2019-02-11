'use strict';

/******************************************
Class Capa
******************************************/
class Capa {
	constructor(nombre, titulo, srs, host, servicio, version, key, minx, maxx, miny, maxy, attribution) {
		this.nombre = nombre
		this.titulo = titulo
		this.srs = srs
		this.host = host
		this.servicio = servicio
		this.version = version
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
		
		this.searchOrderIntoKeywords();
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
}

class ItemGroup extends ItemComposite {
	constructor(nombre, seccion, peso, palabrasClave, descripcion, shortDesc, callback) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.shortDesc = shortDesc;
		this.peso = peso;
		this.itemsComposite = {};
		this.callback = callback;
	}
	
	setItem(itemComposite) {
		this.itemsComposite[itemComposite.seccion] = itemComposite;
	}
	
	getId() {
		return "lista-" + this.seccion;
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
			itemsAux.push(this.itemsComposite[key]);
		}
		
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
	
	hideAllLayersExceptOne(item) {}
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
}

class Item extends ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion, titulo, capa) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.titulo = titulo;
		this.capa = capa;
		this.visible = false;
		//this.legendImg = "templates/" + template + "/img/legends/" + this.titulo.replace(':', '').replace('/', '') + ".svg";
        this.legendImg = null;
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
	
	showHide(callback) {
		$('#' + this.getId()).toggleClass('active');
		if (typeof callback === "function") {
			callback(this.capa.host, this.nombre);
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
        
        this._existsIndexes = new Array(); //Identificador para evitar repetir ID de los items cuando provinen de distintas fuentes
	}
	
	add(itemGroup) {
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
	
	imprimir(objDOMMenu) {
		
		objDOMMenu.html("");
		
		var itemsAux = new Array();
		for (var key in this.items) {
			itemsAux.push(this.items[key]);
		}
		itemsAux.sort(this.ordenaPorPeso);
		
		for (var key in itemsAux) {
			
			var itemComposite = itemsAux[key];
			
			if ($('#' + itemComposite.seccion).length != 0) {
				//eliminarSubItem(itemComposite.seccion);
                itemComposite.getObjDom().html('');
			}
			itemComposite.getObjDom().append(itemComposite.imprimir());
			
		}
		
	}
	
	muestraCapa(itemSeccion) {
		for (var key in this.items) {
			var itemComposite = this.items[key];
			for (var key2 in itemComposite.itemsComposite) {
				var item = itemComposite.itemsComposite[key2];
				if (item.getId() == itemSeccion) {
					itemComposite.hideAllLayersExceptOne(item);
					item.showHide(itemComposite.callback);
					itemComposite.muestraCantidadCapasVisibles();
					break;
					break;
				}
			}
		}
	}
	
}
