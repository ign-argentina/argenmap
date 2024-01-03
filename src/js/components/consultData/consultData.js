let consultDataBtnClose = true;
let map = document.getElementById("mapa");
class ConsultData {
    constructor() {
        this.component = `
        <div id="iconCD-container" class="leaflet-disabled" title="Consultar Datos">
            <a id="iconCD" aria-hidden="true">
                <img src="src/styles/images/cursorQuery.png" width="60%">
            </a>

        </div>
        `;
    }

//     <i id="dropdownCD" class="dropdown-contentCD hidden">
//     <a href="#" id="cdOption1" class="fa fa-message" title="Consulta Singular"></a>
// </i>

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "consultData";
        elem.innerHTML = this.component;
        elem.onclick = (e) => { activateDataConsult(), e.stopPropagation()};
        //elem.onmouseover = showConsultList;
        //elem.onmouseout = hideConsultList;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
        //document.getElementById("cdOption1").onclick = activateDataConsult;
    }
}

function showConsultList() {
    document.getElementById("dropdownCD").classList.toggle("hidden");
}
function hideConsultList() {
    document.getElementById("dropdownCD").classList.add("hidden");
}

function activateDataConsult() {
    if (consultDataBtnClose) {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === false) {
                    layer.activeData = true;
                }
            });
        });
        let control = document.getElementById("iconCD");
        map.classList.toggle("leaflet-grab");
        map.classList.toggle("leaflet-grabbing");
        map.classList.toggle("queryLayer");
        control.style.backgroundColor = "#33b560";
        control.querySelector("img").style.filter = "invert()";
        //document.getElementById("dropdownCD").classList.add("hidden");
        consultDataBtnClose = false;
        getPopupForWMS(true);
    } else {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === true) {
                    layer.activeData = false;
                }
            });                                                                 
        });
        
        let control = document.getElementById("iconCD");
        map.classList.toggle("queryLayer");
        map.classList.toggle("leaflet-grab");
        map.classList.toggle("leaflet-grabbing");
        control.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        control.querySelector("img").style.removeProperty("filter");
        //document.getElementById("dropdownCD").classList.add("hidden");
        consultDataBtnClose = true;
        getPopupForWMS(false);
    }
}

function getPopupForWMS(isActive) {
    let itemNames = [], itemCapa = [];

    gestorMenu.getActiveLayersWithoutBasemap().forEach(lyr => {
        if (!itemNames.includes(lyr.name)) itemNames.push(lyr.name);
    })
    itemNames.forEach(activeLayerName => {
       Object.values(gestorMenu.items).forEach(item => {   
        Object.values(item.itemsComposite).forEach(itemComposite => {

            if (activeLayerName == itemComposite.nombre) {
                if (!itemCapa.includes(itemComposite)) itemCapa.push(itemComposite);
            }
        });
    }); 
    })

    //Menu WMS & WMTS
    itemCapa.forEach(item => {
        if (gestorMenu.layerIsWmts(item.nombre)) {  //is WMTS
            chooseLyrType(item, isActive,"lyrJoin");

        } else {    //is WMS
            if (item.capas[1]) {    //is double WMS
                chooseLyrType(item, isActive,"lyrJoin");
            } else {                //is single WMS
                chooseLyrType(item, isActive,"singleLyr");
            }
        }
    });

    //Import WMS
    let importedWMS;
    addedLayers.forEach(lyr => {
        if (lyr.type === "WMS" && lyr.isActive === true) {
            importedWMS = lyr.layer;
            overlayMaps[importedWMS.name].removeFrom(mapa);
            delete overlayMaps[importedWMS.name];

            createImportWmsLayer(importedWMS);
            overlayMaps[importedWMS.name]._source.options.identify = isActive;
            overlayMaps[importedWMS.name].addTo(mapa);
        }
    });

}

function chooseLyrType(item, isActive, lyrType) {
    if (lyrType === "lyrJoin") {
        let capaWMS = item.capas[1].nombre
        if (overlayMaps[capaWMS]) {
            overlayMaps[capaWMS].removeFrom(mapa);
            delete overlayMaps[capaWMS];
        }
        createWmsLayer(item.capas[1]);
        overlayMaps[capaWMS]._source.options.identify = isActive;
        overlayMaps[capaWMS].addTo(mapa);
    } else {
        layer = item.capa.nombre;
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];

        createWmsLayer(item);
        overlayMaps[layer]._source.options.identify = isActive;
        overlayMaps[layer].addTo(mapa);  
    }
}

function createImportWmsLayer(layer) {
    var MySource = L.WMS.Source.extend({
        showFeatureInfo: function (latlng, info) {
          let layername = layer.name;
          if (!this._map) {
            return;
          }

          if (!loadTableAsPopUp) {
            if (this.options.INFO_FORMAT == "text/html") {
              var infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
            } else {              
                var infoParsed = parseFeatureInfoJSON(
                info,
                popupInfo.length,
                this.options.title
              ); 
            }
            if (infoParsed === "LayerNotQueryable") {//if layer is not queryable
              return 0
            }
            if (infoParsed != "") {
              // check if info has any content, if so shows popup
              var popupContent = $(".leaflet-popup").html();
              popupInfo.push(infoParsed); //First info for popup
            }
            if (popupInfo.length > 0) {
              popupInfoToPaginate = popupInfo.slice();
              latlngTmp = latlng;
              this._map.openPopup(
                paginateFeatureInfo(popupInfo, 0, false, true),
                latlng
              ); //Show all info
              popupInfoPage = 0;
            }
          } else {
            let tableD = new Datatable(JSON.parse(info), latlng);
            createTabulator(tableD, layername);
          }
          return;
        },
      });
  
      var layerPopUp = new MySource(layer.host, {
        transparent: true,
        tiled: true,
        maxZoom: 21,
        title: layer.title,
        format: "image/png",
        INFO_FORMAT: "application/json"
      });
      overlayMaps[layer.name] = layerPopUp.getLayer(layer.name);
}
