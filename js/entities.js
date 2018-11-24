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
		
		return "<li id='" + childId + "' class='capa list-group-item' onClick='gestorMenu.muestraCapa(\"" + childId + "\")'><a nombre=" + itemComposite.nombre +
						" href='#' data-toggle2='tooltip' title='" + itemComposite.descripcion + "'>" + (itemComposite.titulo ? itemComposite.titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</a></li>";
			
	}
}

class ImpresorGrupoHTML extends Impresor {
	imprimir(itemComposite) {
		
		var listaId = itemComposite.getId();
		var itemClass = 'menu5';
		
		return "<div id='" + listaId + "' class='" + itemClass + " panel-heading' >" +
			"<div class='panel-title'>" +
			"<a data-toggle='collapse' data-toggle2='tooltip' title='" + itemComposite.descripcion + "' id='" + listaId + "-a' href='#" + itemComposite.seccion + "'>" + itemComposite.nombre + "</a></div>" +
			"<div id='" + itemComposite.seccion + "' class='panel-collapse collapse'><ul class='list-group nav-sidebar'>" + itemComposite.itemsStr + "</ul></div></div>";
		
	}
}

/******************************************
Composite para menu
******************************************/
class ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion) {
		this.nombre = nombre
		this.seccion = seccion
		this.palabrasClave = palabrasClave
		this.descripcion = descripcion
		this.impresor = null
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
}

class ItemGroup extends ItemComposite {
	constructor(nombre, seccion, peso, palabrasClave, descripcion, callback) {
		super(nombre, seccion, palabrasClave, descripcion);
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
	
	ordenaPorTitulo(a, b) {
		var aName = a.titulo.toLowerCase();
		var bName = b.titulo.toLowerCase(); 
		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}
	
	imprimir() {
		this.itemsStr = '';
		
		var itemsAux = new Array();
		for (var key in this.itemsComposite) {
			itemsAux.push(this.itemsComposite[key]);
		}
		
		itemsAux.sort(this.ordenaPorTitulo);
		
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
	
}

class Item extends ItemComposite {
	constructor(nombre, seccion, palabrasClave, descripcion, titulo, capa) {
		super(nombre, seccion, palabrasClave, descripcion);
		this.titulo = titulo;
		this.capa = capa;
		this.visible = false;
	}
	
	getId() {
		var childId = "child-" + this.seccion;
		return childId;
	}
	
	getVisible() {
		return this.visible;
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
Gestor de menu
******************************************/
class GestorMenu {
	constructor() {
		this.items = {};
	}
	
	add(itemGroup) {
		var itemAux;
		if (!this.items[itemGroup.seccion]) {
			itemAux = itemGroup;
		} else {
			itemAux = this.items[itemGroup.seccion];
		}
		for (var key in itemGroup.itemsComposite) {
			itemAux.setItem(itemGroup.itemsComposite[key]);
		}
		this.items[itemGroup.seccion] = itemAux;
	}
	
	ordenaPorPeso(a, b){
		var aName = a.peso;
		var bName = b.peso; 
		return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
	}
	
	imprimir(objDOM) {
		
		const impresorGroup = new ImpresorGrupoHTML();
		
		$(".nav.nav-sidebar").html("");
		
		var itemsAux = new Array();
		for (var key in this.items) {
			itemsAux.push(this.items[key]);
		}
		itemsAux.sort(this.ordenaPorPeso);
		
		for (var key in itemsAux) {
			
			var itemComposite = itemsAux[key];
			
			itemComposite.setImpresor(impresorGroup);
			if ($('#' + itemComposite.seccion).length != 0) {
				eliminarSubItem(itemComposite.seccion);
			}
			$(".nav.nav-sidebar").append(itemComposite.imprimir());
			
		}
		
	}
	
	muestraCapa(itemSeccion) {
		for (var key in this.items) {
			var itemComposite = this.items[key];
			for (var key2 in itemComposite.itemsComposite) {
				var item = itemComposite.itemsComposite[key2];
				if (item.getId() == itemSeccion) {
					item.showHide(itemComposite.callback);
					itemComposite.muestraCantidadCapasVisibles();
					break;
					break;
				}
			}
		}
	}
	
}
