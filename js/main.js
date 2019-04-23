var gestorMenu = new GestorMenu();
//gestorMenu.setItemsGroupDOM(".nav.nav-sidebar");

const impresorItemCapaBase = new ImpresorItemCapaBaseHTML();
const impresorBaseMap = new ImpresorCapasBaseHTML();
const impresorGroup = new ImpresorGrupoHTML();
const impresorGroupWMSSelector = new ImpresorGroupWMSSelector();

var getGeoserverCounter = 0;
var keywordFilter = 'dato-basico-y-fundamental';
var template = "";

$.getJSON("./js/menu.json", function (data) {
  template = data.template; // define wich template to use
  gestorMenu.setLegendImgPath('templates/' + template + '/img/legends/');
  delete data['template']; // delete template item from data
  $.each(data, function (key, val) {
	//data.items.forEach(imprimirItem, data.items);
    for (var key in data.items) {
      
      if (data.items[key].tab == undefined) {
          data.items[key].tab = "";
      }
      
      if (data.items[key].type == "basemap") { //If layers is basemap
          
          var tab = new Tab(data.items[key].tab);
          groupAux = new ItemGroupBaseMap(tab, data.items[key].nombre, data.items[key].seccion, data.items[key].peso, "", "", data.items[key].short_abstract, null);
          groupAux.setImpresor(impresorBaseMap);
          //groupAux.setObjDom($("#basemap-selector"));
          groupAux.setObjDom(".basemap-selector");
          for (var key2 in data.items[key].capas) {
            var capa = new Capa(data.items[key].capas[key2].nombre, data.items[key].capas[key2].titulo, null, data.items[key].capas[key2].host, data.items[key].capas[key2].servicio, data.items[key].capas[key2].version, data.items[key].capas[key2].key, null, null, null, null, data.items[key].capas[key2].attribution);
            var item = new Item(capa.nombre, data.items[key].seccion+key2, "", data.items[key].capas[key2].attribution, capa.titulo, capa);
            item.setLegendImg('templates/' + template + '/' + data.items[key].capas[key2].legendImg);
            item.setImpresor(impresorItemCapaBase);
            groupAux.setItem(item);
          }
          gestorMenu.addTab(tab);
          gestorMenu.addItemGroup(groupAux);
      
      } else { //If layers is not basemap (wmslayer for example)
        
          getGeoserverCounter++;
          var itemData = data.items[key];
          var tab = new Tab(itemData.tab);
		  var customizedLayers = (itemData.customize_layers == undefined) ? "" : itemData.customize_layers;
          var featureInfoFormat = (itemData.feature_info_format == undefined) ? "application/json" : itemData.feature_info_format;
		  var impresorGroupTemp = impresorGroup;
		  if (tab.listType == "combobox") {
			  impresorGroupTemp = impresorGroupWMSSelector;
		  }
          var wmsLayerInfo = new LayersInfoWMS(itemData.host, itemData.servicio, itemData.version, tab, itemData.seccion, data.items[key].peso, itemData.nombre, data.items[key].short_abstract, featureInfoFormat, data.items[key].type, customizedLayers, impresorGroupTemp);
          if (itemData.allowed_layers) {
              wmsLayerInfo.setAllowebLayers(itemData.allowed_layers);
          }
          if (itemData.customize_layers) {
              wmsLayerInfo.setCustomizedLayers(itemData.customize_layers);
          }
          gestorMenu.addTab(tab);
          gestorMenu.addLayersInfo(wmsLayerInfo);
          
      }
    }
  });
  template = 'templates/' + template + '/main.html';
  $('#template').load(template);
  
  //const impresorWMSSelectorList = new ImpresorWMSSelectorList();
  /*
  var tab = new Tab({ "id":"tabbb", "searcheable":false, "content":"Tabbb" });
  var wmsLayerInfo = new LayersInfoWMS('http://ramsac.ign.gob.ar/resource-proxy-1.1.2/PHP/proxy.php?https://sig.se.gob.ar/wmspubmap', 'wms', '1.3.0', tab, 'aaaaaaaa', 1, 'Secretaría de Energía', '', 'text/html', 'wmslayer_mapserver', '', impresorGroupWMSSelector);
  wmsLayerInfo.setCustomizedLayers(itemData.customize_layers);
  gestorMenu.addTab(tab);
  gestorMenu.addLayersInfo(wmsLayerInfo);
  */
  /*
  groupAux = new ItemGroupWMSSelector(tab, 'Industria y servicios', 'aaaaaaaa', '', '');
  groupAux.setImpresor(impresorWMSSelectorList);
  groupAux.addWMS('1', 'http://ramsac.ign.gob.ar/resource-proxy-1.1.2/PHP/proxy.php?https://sig.se.gob.ar/wmspubmap', 'Secretaría de Energía', 'wms', '1.3.0', 'text/html', 'wmslayer_mapserver');
  //console.log(groupAux.wmsSelectorList);
  gestorMenu.addTab(tab);
  gestorMenu.addItemGroup(groupAux);
  */

});
