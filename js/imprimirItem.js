// define global object to control Menu at RunTime
var menu = new Array();
var oMenu = new Object();

function imprimirItem(item, callback) {
	//return;
	var listaId = "lista-" + item.seccion;
	var abstractText = '';
	if (item.keyword === keywordFilter) {
		// adds to section an abstract by a given keyword in WMS Capabilities
		abstractText = item.abstract;
	}
	if (!item.class) { item.class = "menu5"; }
	// refresh or create item whith this seccion 
	if ($('#' + item.seccion).length != 0) {
		//eliminarSubItem(item.seccion);
		//$('#' + listaId).first().children().first().children().first().html(item.nombre);
	} else {
		$(".nav.nav-sidebar").append(
			"<div id='" + listaId + "' class='" + item.class + " panel-heading' title='" + abstractText + "' >" +
			"<div class='panel-title'>" +
			"<a data-toggle='collapse' href='#" + item.seccion + "'>" + item.nombre + "</a></div>" +
			"<div id='" + item.seccion + "' class='panel-collapse collapse'><ul class='list-group nav-sidebar'></ul></div></div>");
	}

	// Add this seccion and the items inside it to the menu Array
	menu.push(item);

	// Add subItems to DOM
	for (var key in item.capas) {
		// add Items inside #seccion
		// if no nombre suplied ask for one
		childId = "child-" + item.seccion + "-" + key;
		$("#" + item.seccion).children().append(
			"<li id='" + childId + "' class='capa list-group-item'><a nombre=" + item.capas[key].nombre +
			" href='#'>" + (item.capas[key].titulo ? item.capas[key].titulo.replace(/_/g, " ") : "por favor ingrese un nombre") + "</a></li>"); // Replace all "_" with a " "

		// Bind actions to subItem if Callback is a valid function and if it is loaded
		if (typeof callback === "function") {
			// Bind events to items of seccion
			$("#" + childId).on('click tap', function () {
				$(this).toggleClass('active').children().attr("nombre", function (i, nombre) {
					callback(item.capas[key].host, nombre);
				});
			});
		} else {
			if (item.capas[key].servicio === "tms") {
				$("#" + childId).on('click tap', function () {
					//$(this).parent().children().removeClass('active');
					$(this).toggleClass('active').children().attr("nombre", function (i, nombre) {
						var attrib = item.capas[key].attribution;
						loadMapaBase(item.capas[key].host, item.capas[key].nombre, attrib);
					});
				});
			} else {
				// Bind without callback
				// Bind events to items of seccion
				$("#" + childId).on('click tap', function () {
					$(this).toggleClass('active').children().attr("nombre", function (i, nombre) {
						loadGeojson(item.capas[key].host, nombre);
					});
				});
			}
		}
	}
}

function nuevoItem(nombre, seccion, capas, keyword, abstract, callback) {
	obj = new Object({ nombre: nombre, seccion: seccion, keyword: keyword, abstract: abstract });
	obj.capas = capas;
	return obj;
}

function eliminarItem(seccion) {
	$('#lista-' + seccion).remove();
	// eliminate the item seccion from meny Array if exists 
	// this.splice() references the array menu and splice (eliminate) it 
	// 1 object from the desired object's index
	eliminarSubItem(seccion);
}

function eliminarSubItem(seccion) {
	menu.forEach(function (a, index) { if (a.seccion == seccion) this.splice(index, 1) }, menu);
	$("#" + seccion).children().first().children().remove();
}