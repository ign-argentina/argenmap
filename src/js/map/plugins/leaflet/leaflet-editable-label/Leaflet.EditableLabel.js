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
        .addListener(controlDiv, "click", function () {});

      const icon = document.createElement("i");
      icon.classList = "fa-solid fa-pen";

      controlUI.title = this.options.title;
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

  addText = ({ lat, lng }) => {
    let name = "label_";

    if (mapa.editableLayers["label"].length === 0) {
      name += "1";
    } else {
      const lastLayerName =
        mapa.editableLayers["label"][mapa.editableLayers["label"].length - 1].name;
      name += parseInt(lastLayerName.split("_")[1]) + 1;
    }

    var textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.autocomplete = "off";
    textarea.placeholder = "Escribe algo aquí...";
    textarea.className = "map-label";
    //textarea.autofocus = true;
    textarea.style.resize = "none";
    textarea.maxlength = "255";
    textarea.onkeyup = function () {
      this.style.height = "20px";
      this.style.height = this.scrollHeight + 4 + "px";
    };

    var geojsonDivIcon = {
      type: "Feature",
      properties: {
        Text: {
          className: 'my-div-icon',
          iconSize: null,
          html: textarea,
        },
        type: "label",
      },
      geometry: { type: "Point", coordinates: [lng, lat] },
    };
    mapa.addGeoJsonLayerToDrawedLayers(
      geojsonDivIcon,
      "divIcon_" + name,
      true
    );
    this.deactivate();
  };

  updateContent(content) {}

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
    controlIcon.classList.toggle("fa-edit");
    controlIcon.classList.toggle("fa-times");
    controlIcon.classList.toggle("redIcon");
    if (controlIcon.classList.contains("redIcon")) {
      control.title = "Desactivar";
    } else {
      control.title = this.title;
    }
  }
}

const editableLabel = new EditableLabel();
editableLabel.addTo(mapa);
