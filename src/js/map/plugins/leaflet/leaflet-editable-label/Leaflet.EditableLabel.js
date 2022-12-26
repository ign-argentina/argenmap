class EditableLabel {
  constructor() {
    this._map = null;
    this.labelsLayer = null;
    this.activated = false;
    this.control = null;
    this.title = "Agregar etiqueta";
    this.text = "Click aquí para escribir";
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
        "leaflet-editable-label leaflet-bar"
      );
      L.DomEvent.addListener(controlDiv, "click", L.DomEvent.stopPropagation)
        .addListener(controlDiv, "click", L.DomEvent.preventDefault)
        .addListener(controlDiv, "click", function () {});

      const icon = document.createElement("i");
      icon.classList = "fas fa-edit";

      let controlUI = L.DomUtil.create(
        "div",
        "leaflet-editable-label-interior",
        controlDiv
      );
      controlUI.title = this.options.title;
      controlUI.appendChild(icon);
      return controlDiv;
    },
  });

  _getTextDiv = () => {
    let textDiv = document.createElement("div");
    textDiv.innerHTML = this.text;
    textDiv.contentEditable = true;
    textDiv.focus();
    return textDiv;
  };

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
    let geojsonDivIcon = {
      type: "Feature",
      properties: {
        Text: {
          iconSize: null,
          html: `<input id="tag" autocomplete="off" placeholder="Escribe algo aquí.." class="map-label" onkeypress="this.style.width = ((this.value.length + 1) * 8) + 'px';"></input>`,
        },
        type: "tag",
      },
      geometry: { type: "Point", coordinates: [lng, lat] },
    };
    mapa.addGeoJsonLayerToDrawedLayers(geojsonDivIcon, "geojsonDivIcon", true);

    /*const textMarker = new L.Marker([lat, lng], { icon: icon });
    this._map.editableLayers.marker.push(textMarker);
    textMarker.addTo(this._map);
    this.labelsLayer.addLayer(textMarker);

    textMarker.on("dragend", function (e) {
      textMarker.openPopup();
    });*/

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
      control.title = "Eliminar etiquetas";
    } else {
      control.title = this.title;
    }
  }
}

const editableLabel = new EditableLabel();
editableLabel.addTo(mapa);
