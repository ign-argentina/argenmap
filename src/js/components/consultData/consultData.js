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
  // Extend L.WMS.Source to create a custom behavior for WMS layers
  const MySource = L.WMS.Source.extend({
    showFeatureInfo: function (latlng, info) {
      const layerName = layer.name;

      // Return if map is not initialized
      if (!this._map) return;

      if (!loadTableAsPopUp) {
        let infoParsed;
        switch (this.options.INFO_FORMAT) {
          case "application/json":
            if (info.trim().startsWith('{') || info.trim().startsWith('[')) {
              infoParsed = parseFeatureInfoJSON(info, popupInfo.length, this.options.title);
            } else if (info.trim().startsWith('<')) {
              infoParsed = parseFeatureInfoXML(info, popupInfo.length, this.options.title);
            } else {
              console.warn('Unrecognized data format');
              infoParsed = '';
            }
            break;
          case "text/html":
            infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
            break;
          default:
            console.warn(`Unsupported INFO_FORMAT: ${this.options.INFO_FORMAT}`);
            infoParsed = '';
        }
        if (infoParsed === "LayerNotQueryable") {
          // If the layer is not queryable, exit function
          return;
        }
        if (infoParsed) {
          // Add parsed info to popup if not empty
          popupInfo.push(infoParsed);
        }
        if (popupInfo.length > 0) {
          popupInfoToPaginate = [...popupInfo]; // Clone array for pagination
          latlngTmp = latlng;
          this._map.openPopup(
            paginateFeatureInfo(popupInfo, 0, false, true),
            latlng
          ); // Display popup with paginated info
          popupInfoPage = 0;
        }
      } else {
        const tableData = new Datatable(JSON.parse(info), latlng);
        createTabulator(tableData, layerName);
      }
    },
  });

  // Create an instance of the custom WMS layer source
  const layerPopUp = new MySource(layer.host, {
    transparent: true,
    version: layer.version,
    tiled: true,
    maxZoom: 21,
    title: layer.title,
    format: "image/png",
    INFO_FORMAT: layer.featureInfoFormat,
  });

  // Add the layer to the overlay maps
  overlayMaps[layer.name] = layerPopUp.getLayer(layer.name);
}

function createWmsLayer(objLayer) {
  let layer, layerSelected, lyrHost;

  if (objLayer.capa) {
    // Determine if layer is WMTS or single WMS
    layer = objLayer.capa;

    if (gestorMenu.layerIsWmts(objLayer.nombre)) {
      layerSelected = objLayer.capas[1]; // WMTS layer
    } else {
      layerSelected = objLayer.capa; // Single WMS layer
    }
    lyrHost = layerSelected.getHostWMS();
  } else {
    // Handle double WMS layers
    layer = objLayer;
    layerSelected = objLayer;
    lyrHost = layerSelected.host;
  }

  // Extend L.WMS.Source to customize popup behavior
  const MySource = L.WMS.Source.extend({
    showFeatureInfo: function (latlng, info) {
      const layerName = layer.titulo;

      // Return if map is not initialized
      if (!this._map) return;

      if (!loadTableAsPopUp) {
        let infoParsed;
        switch (this.options.INFO_FORMAT) {
          case "application/json":
            if (info.trim().startsWith('{') || info.trim().startsWith('[')) {
              infoParsed = parseFeatureInfoJSON(info, popupInfo.length, this.options.title);
            } else if (info.trim().startsWith('<')) {
              infoParsed = parseFeatureInfoXML(info, popupInfo.length, this.options.title);
            } else {
              console.warn('Unrecognized data format');
              infoParsed = '';
            }
            break;
          case "text/html":
            infoParsed = parseFeatureInfoHTML(info, popupInfo.length);
            break;
          default:
            console.warn(`Unsupported INFO_FORMAT: ${this.options.INFO_FORMAT}`);
            infoParsed = '';
        }
        if (infoParsed === "LayerNotQueryable") {
          // If the layer is not queryable, exit function
          return;
        }
        if (infoParsed) {
          // Add parsed info to popup if not empty
          popupInfo.push(infoParsed);
        }
        if (popupInfo.length > 0) {
          popupInfoToPaginate = [...popupInfo]; // Clone array for pagination
          latlngTmp = latlng;
          this._map.openPopup(
            paginateFeatureInfo(popupInfo, 0, false, true),
            latlng
          ); // Display popup with paginated info
          popupInfoPage = 0;
        }
      } else {
        const tableData = new Datatable(JSON.parse(info), latlng);
        createTabulator(tableData, layerName);
      }
    },
  });

  // Create an instance of the custom WMS layer source
  const wmsSource = new MySource(lyrHost, {
    transparent: true,
    version: layerSelected.version,
    tiled: true,
    maxZoom: 21,
    title: layerSelected.titulo,
    format: "image/png",
    exceptions: "xml",
    INFO_FORMAT: layerSelected.featureInfoFormat,
  });

  // Add the layer to the overlay maps
  overlayMaps[layerSelected.nombre] = wmsSource.getLayer(layerSelected.nombre);
  overlayMaps[layerSelected.nombre]._source.options.identify = true;
}


/**
 * Parses the HTML feature info to display in a popup.
 * @param {string} info - The raw feature info in HTML format.
 * @param {number} idTxt - An identifier for the popup element.
 * @returns {string} Modified HTML string for the popup or an empty string if no content is found.
 */
function parseFeatureInfoHTML(info, idTxt) {
  // Search for a list in the HTML info
  let hasList = info.includes("<ul>");
  if (hasList) {
    // Process the list items
    info = $(info).find("li").each(function () {
      let [key, value] = $(this).text().split(":");
      info = info.replace(
        "<b>" + key + "</b>:",
        "<b>" + ucwords(key.replace(/_/g, " ")) + ":</b>"
      );
    });

    // Add an ID to the featureInfo class
    info = info.replace(
      'class="featureInfo"',
      'class="featureInfo" id="featureInfoPopup' + idTxt + '"'
    );

    return info;
  }

  // Search for a table in the HTML info
  let hasTable = info.includes("<table");
  if (hasTable) {
    // Add an ID to the table
    info = info.replace(
      "<table",
      '<table class="featureInfo" id="featureInfoPopup' + idTxt + '"'
    );
    return info;
  }

  return "";
}


/**
 * Parses the JSON feature info to display in a popup.
 * @param {string} info - The raw feature info in JSON format.
 * @param {number} idTxt - An identifier for the popup element.
 * @param {string} title - The title to display in the popup.
 * @returns {string} HTML string for the popup or a specific error message.
 */
function parseFeatureInfoJSON(info, idTxt, title) {
  // Check if the layer is not queryable or no layers were specified
  if (info.includes("Either no layer was queryable, or no layers were specified using QUERY_LAYERS")) {
    return "LayerNotQueryable";
  }

  // Parse JSON data
  info = JSON.parse(info);

  // Handle WMS exceptions
  if (info.exceptions) {
    if (info.exceptions[0].code === "LayerNotQueryable") {
      return info.exceptions[0].code;
    } else {
      new UserMessage("WMS error: " + info.exceptions[0].text, true, "error");
      return 0;
    }
  }

  // Check if there are features to display
  if (info.features.length > 0) {
    return createFeatureInfoHTML(info.features, idTxt, title);
  }

  return "";
}

/**
 * Creates HTML for the feature info popup from the feature array.
 * @param {Object[]} features - Array of feature objects.
 * @param {number} idTxt - An identifier for the popup element.
 * @param {string} title - The title to display in the popup.
 * @returns {string} HTML string for the popup.
 * @private
 */
function createFeatureInfoHTML(features, idTxt, title) {
  let infoAux = '<div class="featureInfo" id="featureInfoPopup' + idTxt + '">';
  infoAux += '<div class="featureGroup">';
  infoAux += '<div style="/*padding:1em*/" class="individualFeature">';
  infoAux += '<h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">' + title + '</h4>';
  infoAux += '<ul>';

  features.forEach(feature => {
    Object.keys(feature.properties).forEach(key => {
      if (key !== "bbox" && !templateFeatureInfoFieldException.includes(key)) {
        infoAux += '<li>';
        infoAux += '<b>' + ucwords(key.replace(/_/g, " ")) + ':</b>';
        if (feature.properties[key] != null) {
          infoAux += '<span>' + feature.properties[key] + '</span>';
        }
        infoAux += '</li>';
      }
    });
  });

  infoAux += '</ul>';
  infoAux += '</div></div></div>';

  return infoAux;
}


/**
 * Parses FeatureInfo XML and generates HTML to display in a popup.
 * 
 * @param {string} info - The XML string containing FeatureInfo.
 * @param {string} idTxt - The unique identifier for the popup element.
 * @param {string} title - The title to display in the popup.
 * @returns {string} - The generated HTML string for the popup.
 */
function parseFeatureInfoXML(info, idTxt, title) {
  const xmlDoc = new DOMParser().parseFromString(info, "text/xml");

  // Check if the root element is 'FeatureInfoResponse'
  if (xmlDoc.documentElement.nodeName !== "FeatureInfoResponse") {
    return "";
  }
  const fields = xmlDoc.getElementsByTagName("FIELDS");
  if (fields.length === 0) {
    return "";
  }

  // Initialize the HTML structure for the popup
  let infoAux = `
      <div class="featureInfo" id="featureInfoPopup${idTxt}">
          <div class="featureGroup">
              <div class="individualFeature">
                  <h4 style="border-top:1px solid gray;text-decoration:underline;margin:1em 0">${title}</h4>
                  <ul>
  `;

  // Iterate over each <FIELDS> element
  for (let i = 0; i < fields.length; i++) {
    const attributes = fields[i].attributes;

    // Iterate over each attribute in the <FIELDS> element
    for (let j = 0; j < attributes.length; j++) {
      const { name: attrName, value: attrValue } = attributes[j];

      // Format the attribute name (replace underscores with spaces and capitalize words)
      const formattedName = ucwords(attrName.replace(/_/g, " "));

      infoAux += `
              <li>
                  <b>${formattedName}:</b>
                  <span>${attrValue ?? ''}</span>
              </li>
          `;
    }
  }
  infoAux += `
                  </ul>
              </div>
          </div>
      </div>
  `;

  return infoAux;
}

/**
 * Capitalizes the first letter of the given string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
function ucwords(str) {
  // Check if the input is not empty and is a string
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Return as is if it's not a string or empty
  }

  // Capitalize the first letter and append the rest of the string
  return str.charAt(0).toUpperCase() + str.slice(1);
}