const impresorItemCapaBase = new ImpresorItemCapaBaseHTML(),
  impresorBaseMap = new ImpresorCapasBaseHTML(),
  impresorGroup = new ImpresorGrupoHTML(),
  impresorGroupWMSSelector = new ImpresorGroupWMSSelector(),
  app = {
    profile: "default",
    profiles: null,
    templates: [
      "ign-geoportal-basic",
      "ign-geoportal-minimal"
    ],

    init: function (data) {
      Object.assign(app, data);
    },

    _save: function (d) {
      let fileName = 'config.json',
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a'),
        fileToSave = new Blob([JSON.stringify(d)], {
          type: 'application/json',
          name: fileName
        });

      a.download = fileName;
      a.href = window.URL.createObjectURL(fileToSave);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
    },

    saveConfig: function () {
      this._save(app)
    }

  }

let getGeoserverCounter = 0,
  keywordFilter = 'dato-basico-y-fundamental',
  template = "",
  templateFeatureInfoFieldException = [],
  gestorMenu = new GestorMenu();

$.getJSON("./js/menu.json", function (data) {

  app.init(data);

  //Template
  template = app.template; // define wich template to use
  gestorMenu.setLegendImgPath('templates/' + template + '/img/legends/');
  delete data['template']; // delete template item from data

  //templateFeatureInfoFieldException
  if (app.template_feature_info_exception) {
    templateFeatureInfoFieldException = app.template_feature_info_exception; // define not showing fields in feature info popup
    delete data['template_feature_info_exception']; // delete template item from data
  }

  //Layers Joins (join several layers into one item)
  if (app.layers_joins) {
    gestorMenu.setLayersJoin(app.layers_joins);
    delete data['layers_joins']; // delete template item from data
  }

  //Folders (generate folders items into main menu to generate logical groups of layers)
  if (app.folders) {
    gestorMenu.setFolders(app.folders);
    delete data['folders']; // delete folders item from data
  }

  $.each(data, function (key, val) {
    // replacing this data and previous for app object duplicates layers

    for (let key in app.items) {

      let item = app.items[key],
        tab = new Tab(item.tab),
        customizedLayers = (item.customize_layers == undefined) ? "" : item.customize_layers,
        featureInfoFormat = (item.feature_info_format == undefined) ? "application/json" : item.feature_info_format,
        impresorGroupTemp = impresorGroup;

      if (item.tab == undefined) {
        item.tab = "";
      }

      switch (item.type) {
        case "basemap":
          groupAux = new ItemGroupBaseMap(tab, item.nombre, item.seccion, item.peso, "", "", item.short_abstract, null);
          groupAux.setImpresor(impresorBaseMap);
          groupAux.setObjDom(".basemap-selector");
          for (let key2 in item.capas) {
            let capa = new Capa(
              item.capas[key2].nombre,
              item.capas[key2].titulo,
              null,
              item.capas[key2].host,
              item.capas[key2].servicio,
              item.capas[key2].version,
              null,
              item.capas[key2].key,
              null,
              null,
              null,
              null,
              item.capas[key2].attribution
            );
            let basemap = new Item(
              capa.nombre,
              item.seccion + key2,
              "",
              capa.attribution,
              capa.titulo,
              capa,
              null
            );
            basemap.setLegendImg('templates/' + template + '/' + item.capas[key2].legendImg);
            if (item.capas[key2].peso) {
              basemap.setPeso(item.capas[key2].peso);
            }
            if (item.capas[key2].selected && item.capas[key2].selected == true) {
              gestorMenu.setBasemapSelected(item.seccion + key2);
            }
            basemap.setImpresor(impresorItemCapaBase);
            groupAux.setItem(basemap);
          }
          gestorMenu.addTab(tab);
          gestorMenu.addItemGroup(groupAux);
          break;
        case "wmslayer":
          getGeoserverCounter++;
          if (tab.listType == "combobox") {
            impresorGroupTemp = impresorGroupWMSSelector;
          }
          let wmsLayerInfo = new LayersInfoWMS(item.host, item.servicio, item.version, tab, item.seccion, item.peso, item.nombre, item.short_abstract, featureInfoFormat, item.type, customizedLayers, impresorGroupTemp);
          if (item.allowed_layers) {
            wmsLayerInfo.setAllowebLayers(item.allowed_layers);
          }
          if (item.customize_layers) {
            wmsLayerInfo.setCustomizedLayers(item.customize_layers);
          }
          gestorMenu.addTab(tab);
          gestorMenu.addLayersInfo(wmsLayerInfo);
          if (item.folders) {
            gestorMenu.addFolders(item.seccion, item.folders);
          }
          break;
        case "wmts":
          getGeoserverCounter++;
          if (tab.listType == "combobox") {
            impresorGroupTemp = impresorGroupWMSSelector;
          }
          let wmtsLayerInfo = new LayersInfoWMTS(item.host, item.servicio, item.version, tab, item.seccion, item.peso, item.nombre, item.short_abstract, featureInfoFormat, item.type, customizedLayers, impresorGroupTemp);
          if (item.allowed_layers) {
            wmtsLayerInfo.setAllowebLayers(item.allowed_layers);
          }
          if (item.customize_layers) {
            wmtsLayerInfo.setCustomizedLayers(item.customize_layers);
          }
          gestorMenu.addTab(tab);
          gestorMenu.addLayersInfo(wmtsLayerInfo);
          if (item.folders) {
            gestorMenu.addFolders(item.seccion, item.folders);
          }
          break;
        default:
          let sourceTypeUndefined = "The 'type' parameter is not set for the source:" + item.host;
          console.log(sourceTypeUndefined);
      }
    }
  });
  template = 'templates/' + template + '/main.html';
  $('#template').load(template);
});
