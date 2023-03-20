class GeoSelector {
    constructor() {
        this.component = `
        <a id="iconGS-container" title="Agrupar geometrías">
              <i id="iconGS" class="fa-regular fa-object-group" aria-hidden="true"></i>
        </a>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "geoSelector";
        elem.innerHTML = this.component;
        elem.onclick = takeAllGeometries;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}

function takeAllGeometries() {
    /* if (mapa.groupLayers[groupName] === undefined) {
        mapa.groupLayers[groupName] = [];
    } */

    let allGeom = [];
    let name = "group_";

    /*      if (Object.keys(mapa.groupLayers).length === 0) {
          name += "1";
        } else {
          const lastLayerName =
            mapa.grouplayers[mapa.grouplayers.length - 1].name;
          name += parseInt(lastLayerName.split("_")[1]) + 1;
        }  */

    Object.values(drawnItems._layers).forEach(lyr => {
        console.log(lyr);
        allGeom.push(lyr);
        console.log(allGeom);
        lyr.remove(mapa);
        drawnItems.removeLayer(lyr);
    })

    /* addedLayers.push({
        id: name,
        layer: allGeom,
        name: name,
        //rectangle: selectedRectangle,
        type: "group",
        isActive: true,
        section: "Grupo"
      }); */

    var todas = L.layerGroup(allGeom).toGeoJSON();
    mapa.addGeoJsonLayerToDrawedLayers(todas, name);
    //mapa.downloadMultiLayerGeoJSON(name);
    //menu_ui.addFileLayer("Grupo", "group", name, name, name, true);
    //updateNumberofLayers("Grupo")

    /* let drawingRectangle = new L.Draw.Rectangle(mapa, { shapeOptions: { color: 'black', opacity: 0.8, fill: false, weight: 2, dashArray: 6 } });
    drawingRectangle.enable();

    let coords = getGeometryCoords(drawnRectangle);

    mapa.eachLayer(function (layer) {

        if (layer instanceof L.Path) {
            if (layer._layers) {
                for (var f in layer._layers) {
                    var feature = layer._layers[f];
                    console.log(feature);
                }
                let userPolygon = [];
                userPolygon.push(feature.toGeoJSON());
                console.log(userPolygon);
            }
        }
    });
    mapa.on('draw:created', function (geometry) {
        var layer = event.layer;
        console.log(layer);
        var markers = jsonToArray(layerGroup._layers);
        var contains = drawingRectangle.getBounds().contains(mapa.editableLayers.marker[0].getLatLng());
        var result = geometry.layer;
        console.log('result => ', result);
    }); */
}

/* L.Rectangle.include({
    contains: function (marker) {
        return this.getBounds().contains(marker.getLatLng());
    },
    contains: function (markers) {
        var markersContained = [];
        markers.forEach(marker => {
            markersContained.push(this.getBounds().contains(marker.getLatLng()));
        })
        return markersContained;
    }
});

function executeBuffer() {
    let drawnRectangle;
    mapa.editableLayers.rectangle.forEach((lyr) => {
        drawnRectangle = lyr;
    });
    console.log(drawnRectangle);
    let layerSelected;
    mapa.editableLayers.forEach((layer) => {
        console.log(layer);
    });

    let coords = getGeometryCoords(drawnRectangle);

    let geometies = getAllGeometries(coords, drawnRectangle.type, layerSelected)
        .then((data) => {
            if (!data) {
                throw new Error("Error fetching to server");
            }
            buffer = turf.buffer(data, distanceBuffer);
            this.displayResult(buffer);
        })
        .catch((error) => {
            console.error(error);
            new UserMessage(error.message, true, "error");
        });

    let lastRectangle = mapa.getEditableLayers().rectangle.length - 1;
    mapa.deleteLayer(mapa.getEditableLayers().rectangle[lastRectangle].name);
}  */