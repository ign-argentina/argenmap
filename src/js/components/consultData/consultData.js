let consultDataBtnClose = true;

class ConsultData {
    constructor() {
        this.component = `
        <div id="iconCD-container" class="leaflet-disabled" title="Consultar Datos">
            <a id="iconCD" class="fa fa-circle-question" aria-hidden="true"></a>
            <i id="dropdownCD" class="dropdown-contentCD hidden">
                <a href="#" id="cdOption1" class="fas fa-question " title="Consulta Singular"></a>
            </i>
        </div>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "consultData";
        elem.innerHTML = this.component;
        elem.onclick = showConsultList;
        //elem.onmouseover = showConsultList;
        //elem.onmouseout = hideConsultList;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
        document.getElementById("cdOption1").onclick = activateDataConsult;
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
        document.getElementById("cdOption1").style.backgroundColor = "#00ff04";
        document.getElementById("dropdownCD").classList.add("hidden");
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
        document.getElementById("cdOption1").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        document.getElementById("dropdownCD").classList.add("hidden");
        consultDataBtnClose = true;
        getPopupForWMS(false);
    }
}

function getPopupForWMS(isActive) {
    let itemNames = [], itemCapa = [];

    Object.values(overlayMaps).forEach(lyr => {
        if (!itemNames.includes(lyr._name)) itemNames.push(lyr._name);
    });
    Object.values(gestorMenu.items).forEach(item => {
        Object.values(item.itemsComposite).forEach(itemComposite => {
            if (itemNames.includes(itemComposite.nombre)) {
                if (!itemCapa.includes(itemComposite)) itemCapa.push(itemComposite);
            }
        });
    });

    //Menu WMS
    itemCapa.forEach(item => {
        layer = item.capa.nombre;
        overlayMaps[layer].removeFrom(mapa);
        delete overlayMaps[layer];

        createWmsLayer(item);
        overlayMaps[layer]._source.options.identify = isActive;
        overlayMaps[layer].addTo(mapa);   
    });

    //Import WMS
    let importedWMS;
    addedLayers.forEach(lyr => {
        if (lyr.type === "WMS") {
            importedWMS = lyr.layer;
            overlayMaps[importedWMS.name].removeFrom(mapa);
            delete overlayMaps[importedWMS.name];

            createImportWmsLayer(importedWMS);
            //overlayMaps[importedWMS.name]._source.options.identify = isActive;
            overlayMaps[importedWMS.name].addTo(mapa);
        }
    });

}

function createImportWmsLayer(importedWMS) {
    var MySource = L.WMS.Source.extend({
        showFeatureInfo: function (latlng, info) {
          let layername = importedWMS.title;
    
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
  
      var testing = new MySource(importedWMS.host, {
        transparent: true,
        tiled: true,
        maxZoom: 21,
        title: importedWMS.title,
        format: "image/png",
        INFO_FORMAT: "application/json"
      });
      overlayMaps[importedWMS.name] = testing.getLayer(importedWMS.name);
}
