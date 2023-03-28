let counterGroupLayerSelector = 0;
let consultDataBtnClose = true;

class GroupLayerSelector {
    constructor() {
        this.component = `
        <a id="iconGS-container" class="leaflet-disabled" title="No hay capas para agrupar">
              <i id="iconGS" class="fa-regular fa-object-group" aria-hidden="true"></i>
        </a>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "groupLayerSelector";
        elem.innerHTML = this.component;
        elem.onclick = activateDataConsult;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
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
        console.log("Ver Datos Activado!")
        document.getElementById("iconGS-container").style.backgroundColor = "#00ff04";
        consultDataBtnClose = false;
    } else {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === true) {
                    layer.activeData = false;
                }
            });
        });
        console.log("Ver Datos Desctivado!")
        document.getElementById("iconGS-container").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        consultDataBtnClose = true;
    }
}