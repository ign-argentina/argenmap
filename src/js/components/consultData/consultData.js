let consultDataBtnClose = true;

class ConsultData {
    constructor() {
        this.component = `
        <a id="iconCD-container" class="leaflet-disabled" title="Consultar Datos">
              <i id="iconCD" class="fa-regular fa-object-group" aria-hidden="true"></i>
        </a>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "consultData";
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
        document.getElementById("iconCD-container").style.backgroundColor = "#00ff04";
        consultDataBtnClose = false;
    } else {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === true) {
                    layer.activeData = false;
                }
            });
        });
        document.getElementById("iconCD-container").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        consultDataBtnClose = true;
    }
}