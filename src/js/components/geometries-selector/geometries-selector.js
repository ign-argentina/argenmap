class GeoSelector {
    constructor() {
        this.component = `
        <a id="iconFS-container" title="Seleccionar geometrias" onclick="agrupar()">
              <i id="iconFS" class="fa-regular fa-object-group" aria-hidden="true"></i>
        </a>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        //elem.id = "geoSelector";
        elem.innerHTML = this.component;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}

function agrupar() {
    let drawingRectangle = new L.Draw.Rectangle(mapa, { shapeOptions: { color: 'black', opacity: 0.8, fill: false, weight: 2, dashArray: 6 } });
    drawingRectangle.enable();




    //let coords = getGeometryCoords(drawnRectangle);

/*     mapa.eachLayer(function (layer) {

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
    }); */
    /* mapa.on('draw:created', function (geometry) {
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
}); */

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
}