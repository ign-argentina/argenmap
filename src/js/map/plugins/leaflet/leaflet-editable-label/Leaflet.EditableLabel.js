/**
 * @class EditableLabel
 * @description Provides functionality to add editable text labels on a Leaflet map.
 */
class EditableLabel {
  constructor() {
    this._map = null;
    this.labelsLayer = null;
    this.activated = false;
    this.control = null;
    this.title = "Agregar etiqueta";
  }

  /**
   * @private
   * @function _initialize
   * @description Initializes the control and adds it to the map.
   */
  _initialize() {
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
  }

  /**
   * @class labelsControl
   * @description Custom Leaflet control for adding labels.
   */
  labelsControl = L.Control.extend({
    options: {
      position: "topright",
      title: "Editable Labels",
    },

    onAdd(map) {
      const controlDiv = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      const controlUI = L.DomUtil.create(
        "a",
        "leaflet-editable-label leaflet-editable-label-interior center-flex"
      );
      controlDiv.appendChild(controlUI);

      L.DomEvent.disableClickPropagation(controlDiv);

      const icon = document.createElement("span");
      icon.classList = "icon-text";
      controlUI.title = this.options.title;
      controlUI.id = "editableLabelBtn";
      controlUI.appendChild(icon);

      return controlDiv;
    },
  });

  /**
   * @private
   * @function _addLayerGroup
   * @description Adds a new layer group to the map for labels.
   */
  _addLayerGroup() {
    this.labelsLayer = L.layerGroup().addTo(this._map);
  }

  /**
   * @private
   * @function _removeLayerGroup
   * @description Removes the labels layer group from the map.
   */
  _removeLayerGroup() {
    if (this.labelsLayer) {
      this.labelsLayer.clearLayers();
      this._map.removeLayer(this.labelsLayer);
    }
  }

  /**
   * Add a new text marker to the map.
   * @param {L.LatLng} latlng - The latitude and longitude of the marker.
   */
  addText(latlng) {
    let name = this._generateLabelName();

    const textarea = this._createTextarea(name);
    const divIcon = L.divIcon({
      className: "div-icon",
      html: textarea,
    });

    const textLayer = L.marker(latlng, {
      icon: divIcon,
    });

    this._configureTextLayer(textLayer, name);

    this._addLayerToMap(textLayer);
    addLayerToDrawingsGroup(textLayer.name, textLayer, "Dibujos", "dibujos", "dibujos");
    textarea.focus();
    this.deactivate();
  }

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
  uploadLabel(
    coordinates,
    text,
    borderWidth,
    borderColor,
    backgroundColor,
    color,
    id
  ) {
    let name = this._generateLabelName();

    const textarea = this._createTextarea(name, text, {
      borderWidth,
      borderColor,
      backgroundColor,
      color,
    });

    const divIcon = L.divIcon({
      className: "div-icon",
      html: textarea,
    });

    const textLayer = L.marker(coordinates, {
      icon: divIcon,
    });

    this._configureTextLayer(textLayer, name, text, id);
    this._addLayerToMap(textLayer);
    textarea.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
  }

  /**
   * @private
   * @function _generateLabelName
   * @description Generates a unique name for a new label.
   * @returns {string} - The generated label name.
   */
  _generateLabelName() {
    let name = "label_";
    if (mapa.editableLayers["label"].length === 0) {
      name += "1";
    } else {
      const lastLayerName =
        mapa.editableLayers["label"][mapa.editableLayers["label"].length - 1]
          .name;
      name += parseInt(lastLayerName.split("_")[1]) + 1;
    }
    return name;
  }

  /**
   * @private
   * @function _createTextarea
   * @description Creates a textarea element for the label.
   * @param {string} name - The name attribute for the textarea.
   * @param {string} [text=''] - The text content of the textarea.
   * @param {Object} [styles={}] - The styles to apply to the textarea.
   * @returns {HTMLTextAreaElement} - The created textarea element.
   */
  _createTextarea(name, text = '', styles = {}) {
    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.autocomplete = "off";
    textarea.className = "map-label";
    textarea.style.resize = "none";
    textarea.maxLength = 255;
    textarea.placeholder = "Escribe algo aquí...";
    textarea.innerHTML = text;

    Object.assign(textarea.style, styles);

    // Resize the textarea as needed when the user types
    textarea.onkeydown = function () {
      this.style.height = "20px";
      this.style.height = this.scrollHeight + 4 + "px";
    };

    return textarea;
  }

  /**
   * @private
   * @function _configureTextLayer
   * @description Configures a text layer with properties and event handlers.
   * @param {L.Marker} textLayer - The text layer to configure.
   * @param {string} name - The name of the text layer.
   * @param {string} [text=''] - The initial text content.
   * @param {string} [id] - The ID of the layer group to which the label belongs.
   */
  _configureTextLayer(textLayer, name, text = '', id) {
    textLayer.name = name;
    textLayer.type = "label";
    textLayer.data = textLayer.toGeoJSON();

    // Ensure data and properties are initialized
    if (!textLayer.data.properties) {
      textLayer.data.properties = {};
    }

    textLayer.data.properties.text = text;
    textLayer.id = id;

    const textarea = textLayer.options.icon.options.html;

    textarea.onkeyup = () => {
      textLayer.data.geoJSON ? textLayer.data.geoJSON.properties.text = textarea.value : textLayer.data.properties.text = textarea.value;
      textLayer._icon.lastChild.textContent = textarea.value;
    };

    textLayer.getGeoJSON = () => {
      return mapa.getLayerGeoJSON(textLayer.name);
    };

    textLayer.downloadGeoJSON = () => {
      mapa.downloadLayerGeoJSON(
        mapa.editableLayers["label"].find((lyr) => lyr.name === textLayer.name)
      );
    };
  }


  /**
   * @private
   * @function _addLayerToMap
   * @description Adds a text layer to the map and editable layers array.
   * @param {L.Marker} textLayer - The text layer to add.
   */
  _addLayerToMap(textLayer) {
    mapa.editableLayers["label"].push(textLayer);
    mapa.addContextMenuToLayer(textLayer);
    drawnItems.addLayer(textLayer);
  }

  /**
   * Activates the label adding mode.
   */
  activate() {
    this._addLayerGroup();
    this._updateButton();
    this._map.on("click", (e) => {
      this.addText(e.latlng);
    });
  }

  /**
   * Deactivates the label adding mode.
   */
  deactivate() {
    this.activated = false;
    this._updateButton();
    this._removeLayerGroup();
    this._map.off("click");
  }

  /**
   * Adds the EditableLabel control to the specified map.
   * @param {L.Map} map - The Leaflet map instance.
   */
  addTo(map) {
    this._map = map;
    this._initialize();
  }

  /**
   * @private
   * @function _updateButton
   * @description Updates the control button UI.
   */
  _updateButton() {
    const control = this.control.getContainer().firstElementChild;
    const controlIcon = control.querySelector("span");

    if (controlIcon.classList.contains("icon-text")) {
      controlIcon.classList.remove("icon-text");
      controlIcon.classList.add("fa-solid", "fa-xmark", "redIcon");
    } else {
      controlIcon.classList.remove("fa-solid", "fa-xmark", "redIcon");
      controlIcon.classList.add("icon-text");
    }

    control.title = controlIcon.classList.contains("redIcon") ? "Desactivar" : this.title;
  }
}
