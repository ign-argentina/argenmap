var gestorMenu = new GestorMenu();

const impresorItemCapaBase = new ImpresorItemCapaBaseHTML();
const impresorBaseMap = new ImpresorCapasBaseHTML();

var getGeoserverCounter = 0;
var keywordFilter = 'dato-basico-y-fundamental';
var template = "";

$.getJSON("./js/menu.json", function (data) {
  $.each(data, function (key, val) {
	//data.items.forEach(imprimirItem, data.items);
	// define wich template to use
	// when reading template name from menu.json update template name, otherwise keep the template name
	template = key == 'template' ? val : template;
	if(key != 'template') {
		for (var key in data.items) {
		
		  if (data.items[key].type == "basemap") {
		
			  groupAux = new ItemGroupBaseMap(data.items[key].nombre, data.items[key].seccion, data.items[key].peso, "", "", data.items[key].short_abstract, null);
			  groupAux.setImpresor(impresorBaseMap);
			  //groupAux.setObjDom($("#basemap-selector"));
			  groupAux.setObjDom($(".basemap-selector"));
			  for (var key2 in data.items[key].capas) {
				var capa = new Capa(data.items[key].capas[key2].nombre, data.items[key].capas[key2].titulo, null, data.items[key].capas[key2].host, data.items[key].capas[key2].servicio, data.items[key].capas[key2].version, data.items[key].capas[key2].key, null, null, null, null, data.items[key].capas[key2].attribution);
				var item = new Item(capa.nombre, data.items[key].seccion+key2, "", data.items[key].capas[key2].attribution, capa.titulo, capa);
				item.setImpresor(impresorItemCapaBase);
				//console.log(data.items[key].capas.legendImg);
				item.setLegendImg(data.items[key].capas[key2].legendImg);
				groupAux.setItem(item);
			  }
			  gestorMenu.add(groupAux);
		  
		  } else if (data.items[key].type == "wmslayer") {
			
			  getGeoserverCounter++;
			  var itemData = data.items[key];
			  getGeoserver(itemData.host, itemData.servicio, itemData.seccion, data.items[key].peso, itemData.nombre, itemData.version, data.items[key].short_abstract);
			  
		  }
		}
	}
  });
  template = 'templates/' + template + '/main.html';
  $('#template').load(template);
});