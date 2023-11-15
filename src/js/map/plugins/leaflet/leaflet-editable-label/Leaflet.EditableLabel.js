class EditableLabel {
  constructor() {
    this._map = null;
    this.labelsLayer = null;
    this.activated = false;
    this.control = null;
    this.title = "Agregar etiqueta";
  }

  _initialize = () => {
    this.control = new this.labelsControl({
      title: this.title,
      click: this.addLabel,
    });
    this._map.addControl(this.control);

    this.control.getContainer().addEventListener("click", () => {
      if (this.activated) {
        return this.deactivate();
      }
      this.activated = true;
      return this.activate();
    });

    this.labelsLayer = new L.LayerGroup();
  };

  labelsControl = L.Control.extend({
    options: {
      position: "topright",
      title: "Editable Labels",
    },

    onAdd: function (map) {
      let controlDiv = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control"
      );
      let controlUI = L.DomUtil.create(
        "a",
        "leaflet-editable-label leaflet-editable-label-interior"
      );
      controlDiv.appendChild(controlUI);

      L.DomEvent.addListener(controlDiv, "click", L.DomEvent.stopPropagation)
        .addListener(controlDiv, "click", L.DomEvent.preventDefault)
        .addListener(controlDiv, "click", function () { });

      const icon = document.createElement("i");
      icon.classList = "bx bx-text";

      controlUI.title = this.options.title;
      controlUI.id = "editableLabelBtn";
      controlUI.appendChild(icon);
      return controlDiv;
    },
  });

  _addLayerGroup = () => {
    this.labelsLayer = L.layerGroup().addTo(this._map);
    /* addedLayers.push({
      id: "labels",
      layer: this.labelsLayer,
      name: "Etiquetas",
      file_name: "labels",
    });
    menu_ui.addFileLayer("Etiquetas", "Etiquetas", "labels", "labels") */
  };

  _removeLayerGroup = () => {
    this.labelsLayer.remove();
  };

  /**
   * Add a new text marker to the map.
   * @param {Object} options - The options for the new marker.
   * @param {number} options.lat - The latitude of the marker.
   * @param {number} options.lng - The longitude of the marker.
   */
  addText = ({ lat, lng }) => {
    let name = "label_";// Set the default name of the marker.

    // If there are existing markers, use the last one's name to generate a new name.
    if (mapa.editableLayers["label"].length === 0) {
      name += "1";
    } else {
      const lastLayerName =
        mapa.editableLayers["label"][mapa.editableLayers["label"].length - 1].name;
      name += parseInt(lastLayerName.split("_")[1]) + 1;
    }

    // Create a new textarea element for the marker's label.
    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.autocomplete = "off";
    textarea.placeholder = "Escribe algo aquí...";
    textarea.className = "map-label";
    textarea.style.resize = "none";
    textarea.maxlength = "255";

    // Resize the textarea as the user types.
    textarea.onkeydown = function () {
      this.style.height = "20px";
      this.style.height = this.scrollHeight + 4 + "px";
    };

    // Create a new div icon for the marker's label.
    const divIcon = L.divIcon({
      className: "div-icon",
      html: textarea
    });

    // Create a new marker for the label.
    const textLayer = L.marker([lat, lng], {
      icon: divIcon
    });

    // Set the name and type of the marker, and store its geoJSON data.
    textLayer.name = name;
    textLayer.type = "label";
    textLayer.data = textLayer.toGeoJSON();
    textLayer.data.properties.text = "";

    // Update the marker's geoJSON data as the user types.
    textarea.onkeyup = function () {
      textLayer.data.geoJSON.properties.text = textLayer.options.icon.options.html.value;
      textLayer._icon.lastChild.textContent = textLayer.options.icon.options.html.value;
    };

    // Add custom functions to the marker.
    textLayer.getGeoJSON = () => {
      return mapa.getLayerGeoJSON(textLayer.name);
    }
    textLayer.downloadGeoJSON = () => {
      mapa.downloadLayerGeoJSON(mapa.editableLayers["label"].find(lyr => lyr.name === textLayer.name));
    }

    // Add the new marker to the map and to the list of editable layers.
    mapa.editableLayers["label"].push(textLayer);
    addLayerToDrawingsGroup(name, textLayer, "Dibujos", "dibujos", "dibujos");
    mapa.addContextMenuToLayer(textLayer);
    drawnItems.addLayer(textLayer);

    // Set focus on the new textarea and deactivate the drawing mode.
    textarea.focus();
    this.deactivate();
  };

  /**
 * Creates and uploads a label to the map at the given coordinates.
 *
 * @param {number[]} coordinates - Array of latitude and longitude coordinates.
 * @param {string} text - The label's text content.
 * @param {string} borderWidth - The width of the label's border.
 * @param {string} borderColor - The color of the label's border.
 * @param {string} backgroundColor - The background color of the label.
 * @param {string} color - The text color of the label.
 * @param {string} id - The ID of the layer group to which the label belongs.
 */
  uploadLabel = (coordinates, text, borderWidth, borderColor, backgroundColor, color, id) => {
    // Create a unique name for the label layer
    let name = "label_";
    if (mapa.editableLayers["label"].length === 0) {
      name += "1";
    } else {
      const lastLayerName = mapa.editableLayers["label"][mapa.editableLayers["label"].length - 1].name;
      name += parseInt(lastLayerName.split("_")[1]) + 1;
    }

    // Create the textarea element for the label
    var textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.autocomplete = "off";
    textarea.innerHTML = text;
    textarea.className = "map-label";
    textarea.style.resize = "none";
    textarea.style.borderWidth = borderWidth;
    textarea.style.borderColor = borderColor;
    textarea.style.backgroundColor = backgroundColor;
    textarea.style.color = color;
    textarea.maxlength = "255";

    // Resize the textarea as needed when the user types
    textarea.onkeydown = function () {
      this.style.height = "20px";
      this.style.height = this.scrollHeight + 4 + "px";
    };

    // Create the divIcon with the textarea element
    var divIcon = L.divIcon({
      className: "div-icon",
      html: textarea
    });

    // Create the textLayer marker with the divIcon
    var textLayer = L.marker(coordinates, {
      icon: divIcon
    });

    // Set properties for the textLayer marker
    textLayer.name = name;
    textLayer.type = "label";
    textLayer.data = textLayer.toGeoJSON();
    textLayer.data.properties.text = text;
    textLayer.id = id;

    // Update the label's text content when the user types
    textarea.onkeyup = function () {
      textLayer.data.geoJSON.properties.text = textLayer.options.icon.options.html.value;
      textLayer._icon.lastChild.textContent = textLayer.options.icon.options.html.value;
    };

    // Add custom functions to the textLayer marker
    textLayer.getGeoJSON = () => {
      return mapa.getLayerGeoJSON(textLayer.name);
    }
    textLayer.downloadGeoJSON = () => {
      mapa.downloadLayerGeoJSON(mapa.editableLayers["label"].find(lyr => lyr.name === textLayer.name));
    }

    // Add the label layer to the specified layer group and the map
    mapa.groupLayers[id].push(name);
    mapa.editableLayers["label"].push(textLayer);
    mapa.addContextMenuToLayer(textLayer);
    drawnItems.addLayer(textLayer);

    // Adjust the height of textarea if there is more than one line
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: 'Tab' }));
  };

  activate = () => {
    this._addLayerGroup();
    this._updateButton();
    this._map.on("click", (e) => {
      this.addText(e.latlng);
    });
  };

  deactivate = () => {
    this.activated = false;
    this._updateButton();
    this.labelsLayer.clearLayers();
    this._map.off("click");
  };

  addTo = (map) => {
    this._map = map;
    this._initialize();
  };

  _updateButton() {
    let control = this.control.getContainer().firstElementChild;
    let controlIcon = control.querySelectorAll("i")[0];

    if (controlIcon.classList.contains("bx-text")) {
      controlIcon.classList.remove("bx", "bx-text");
      controlIcon.classList.add("fa-solid", "fa-xmark", "redIcon");
    } else {
      controlIcon.classList.remove("fa-solid", "fa-xmark", "redIcon");
      controlIcon.classList.add("bx", "bx-text");
    }

    if (controlIcon.classList.contains("redIcon")) {
      control.title = "Desactivar";
    } else {
      control.title = this.title;
    }
  }

}

const editableLabel = new EditableLabel();
editableLabel.addTo(mapa);
