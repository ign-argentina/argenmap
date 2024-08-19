let consultDataBtnClose = true;
let map = document.getElementById("mapa");
class ConsultData {
  constructor() {
    // Initialize the HTML component for the control
    this.component = `
      <div id="iconCD-container" class="leaflet-disabled" title="Consultar Datos">
        <a id="iconCD" aria-hidden="true">
          <img src="src/styles/images/cursorQuery.png" width="60%">
        </a>
      </div>
    `;
  }

  /**
   * Creates and appends the Consult Data control to the Leaflet map.
   */
  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "consultData";
    elem.innerHTML = this.component;

    // Attach click event listener to the element
    elem.onclick = (e) => {
      e.stopPropagation(); // Prevent click event propagation
      activateDataConsult(); // Trigger the data consultation activation
    };

    // Only append the control if loadQueryLayer is true
    if (loadQueryLayer) {
      document.querySelector(".leaflet-top.leaflet-left").appendChild(elem);
    }
  }
}

/**
 * Toggles the visibility of the dropdown menu for consulting data.
 */
function toggleConsultList() {
  document.getElementById("dropdownCD").classList.toggle("hidden");
}

/**
 * Activates or deactivates the data consultation mode.
 * This function toggles the state of the map layers and updates the UI accordingly.
 */
function activateDataConsult() {
  const control = document.getElementById("iconCD");

  // Toggle the active state for all editable layers
  Object.values(mapa.editableLayers).forEach((editLayer) => {
    editLayer.forEach((layer) => {
      layer.activeData = !consultDataBtnClose;
    });
  });

  // Toggle map interaction modes and update control styles
  map.classList.toggle("queryLayer");
  map.classList.toggle("leaflet-grab");
  map.classList.toggle("leaflet-grabbing");

  if (consultDataBtnClose) {
    control.style.backgroundColor = "#33b560";
    control.querySelector("img").style.filter = "invert()";
    getPopupForWMS(true); // Enable WMS popups
  } else {
    control.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    control.querySelector("img").style.removeProperty("filter");
    getPopupForWMS(false); // Disable WMS popups
  }

  // Toggle the button close state
  consultDataBtnClose = !consultDataBtnClose;
}

/**
 * Toggles the WMS/WMTS layers' popup functionality based on the active state.
 * @param {boolean} isActive - Indicates whether to enable or disable the popup functionality.
 */
function getPopupForWMS(isActive) {
  const activeLayerNames = new Set();
  const activeLayers = [];

  // Get names of active layers excluding basemaps
  gestorMenu.getActiveLayersWithoutBasemap().forEach((lyr) => {
    activeLayerNames.add(lyr.name);
  });

  // Find the corresponding items in the menu for the active layers
  activeLayerNames.forEach((layerName) => {
    Object.values(gestorMenu.items).forEach((item) => {
      Object.values(item.itemsComposite).forEach((itemComposite) => {
        if (layerName === itemComposite.nombre && !activeLayers.includes(itemComposite)) {
          activeLayers.push(itemComposite);
        }
      });
    });
  });

  // Process each active layer based on its type (WMS or WMTS)
  activeLayers.forEach((item) => {
    if (gestorMenu.layerIsWmts(item.nombre)) {
      // Handle WMTS layers
      toggleLayerPopup(item, isActive, "lyrJoin");
    } else if (item.capas[1]) {
      // Handle double WMS layers
      toggleLayerPopup(item, isActive, "lyrJoin");
    } else {
      // Handle single WMS layers
      toggleLayerPopup(item, isActive, "singleLyr");
    }
  });

  // Handle imported WMS layers
  addedLayers.forEach((lyr) => {
    if (lyr.type === "WMS" && lyr.isActive) {
      const importedWMS = lyr.layer;
      overlayMaps[importedWMS.name].removeFrom(mapa);
      delete overlayMaps[importedWMS.name];

      createImportWmsLayer(importedWMS);
      overlayMaps[importedWMS.name]._source.options.identify = isActive;
      overlayMaps[importedWMS.name].addTo(mapa);
    }
  });
}

/**
 * Toggles the popup functionality for a given layer based on its type.
 * @param {Object} item - The layer item containing layer information.
 * @param {boolean} isActive - Indicates whether to enable or disable the popup functionality.
 * @param {string} lyrType - The type of layer (either "lyrJoin" or "singleLyr").
 */
function toggleLayerPopup(item, isActive, lyrType) {
  const layerName = lyrType === "lyrJoin" ? item.capas[1].nombre : item.capa.nombre;

  if (overlayMaps[layerName]) {
    overlayMaps[layerName].removeFrom(mapa);
    delete overlayMaps[layerName];
  }

  if (lyrType === "lyrJoin") {
    createWmsLayer(item.capas[1]);
  } else {
    createWmsLayer(item);
  }

  overlayMaps[layerName]._source.options.identify = isActive;
  overlayMaps[layerName].addTo(mapa);
}

function createImportWmsLayer(layer) {
  var MySource = L.WMS.Source.extend({
    showFeatureInfo: function (latlng, info) {
      let layername = layer.name;
      if (!this._map) {
        return;
      }

      if (!loadTableAsPopUp) {
        let infoParsed;
        switch (this.options.INFO_FORMAT) {
          case "application/json":
            if (info.trim().startsWith('{') || info.trim().startsWith('[')) {
              infoParsed = parseFeatureInfoJSON(info, popupInfo.length, this.options.title);
            } else if (info.trim().startsWith('<')) {
              infoParsed = parseFeatureInfoXML(info, popupInfo.length, this.options.title);
            } else {
              console.warn('Formato de datos no reconocido');
              infoParsed = '';
            }
            break;
          case "text/html":
            infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
            break;
          default:
            console.warn("Unsupported INFO_FORMAT: " + this.options.INFO_FORMAT);
            infoParsed = "";
        }
        if (infoParsed === "LayerNotQueryable") {
          //if layer is not queryable
          return 0;
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
            latlng,
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

  let layerPopUp = new MySource(layer.host, {
    transparent: true,
    version: layer.version,
    tiled: true,
    maxZoom: 21,
    title: layer.title,
    format: "image/png",
    INFO_FORMAT: layer.featureInfoFormat,
  });
  overlayMaps[layer.name] = layerPopUp.getLayer(layer.name);
}
