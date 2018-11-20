var gestorMenu = new GestorMenu();

const impresorItem = new ImpresorItemHTML();

var getGeoserverCounter = 11;
var keywordFilter = 'dato-basico-y-fundamental';

$.getJSON("./js/menu.json", function (data) {
  $.each(data, function (key, val) {
	//data.items.forEach(imprimirItem, data.items);
	for (var key in data.items) {
	
	  if (data.items[key].type == "basemap") {
	
		  groupAux = new ItemGroup(data.items[key].nombre, data.items[key].seccion, data.items[key].peso, "", "", null);
		  for (var key2 in data.items[key].capas) {
			var capa = new Capa(data.items[key].capas[key2].nombre, data.items[key].capas[key2].titulo, null, data.items[key].capas[key2].host, data.items[key].capas[key2].servicio, null, null, null, null, data.items[key].capas[key2].attribution);
			var item = new Item(capa.nombre, data.items[key].seccion+key2, "", "", capa.titulo, capa);
			item.setImpresor(impresorItem);
			groupAux.setItem(item);
		  }
		  gestorMenu.add(groupAux);
	  
	  } else if (data.items[key].type == "wmslayer") {
		
		var itemData = data.items[key];
		getGeoserver(itemData.host, itemData.servicio, itemData.seccion, data.items[key].peso, itemData.nombre, itemData.version);
		  
	  }
	  
	}
  });
});
