let consultDataBtnClose = true;

class ConsultData {
    constructor() {
        this.component = `
        <div id="iconCD-container" class="leaflet-disabled" title="Consultar Datos">
            <a id="iconCD" class="fa fa-circle-question" aria-hidden="true"></a>
            <i id="dropdownCD" class="dropdown-contentCD hidden">
                <a href="#" id="cdOption1" class="fas fa-question " title="Consulta Singular"></a>
                <a href="#" id="cdOption2" class="fas fa-question " title="in development"></a>
            </i>
        </div>
        `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "consultData";
        elem.innerHTML = this.component;
        elem.onmouseover = showConsultList;
        elem.onmouseout = hideConsultList;
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
        document.getElementById("cdOption1").onclick = activateDataConsult;
    }
}

function showConsultList() {
    document.getElementById("dropdownCD").classList.remove("hidden");
}
function hideConsultList() {
    document.getElementById("dropdownCD").classList.add("hidden");
}

function activateDataConsult() {
    let itemNames = [], itemCapa = [];
    if (consultDataBtnClose) {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === false) {
                    layer.activeData = true;
                }
            });
        });
        document.getElementById("cdOption1").style.backgroundColor = "#00ff04";
        document.getElementById("dropdownCD").classList.add("hidden");
        consultDataBtnClose = false;

        Object.values(overlayMaps).forEach(lyr => {
            itemNames.push(lyr._name)
        });
        Object.values(gestorMenu.items).forEach(item => {
            Object.values(item.itemsComposite).forEach(itemComposite => {
                if (itemNames.includes(itemComposite.nombre)) {
                    itemCapa.push(itemComposite);
                }
            });
        });

        itemCapa.forEach(item => {
            layer = item.capa.nombre;
            overlayMaps[layer].removeFrom(mapa);
            delete overlayMaps[layer];

            createWmsLayer(item);
            overlayMaps[layer]._source.options.identify = true;
            overlayMaps[layer].addTo(mapa);   
        })

    } else {
        Object.values(mapa.editableLayers).forEach(editLayer => {
            editLayer.forEach(layer => {
                if (layer.activeData === true) {
                    layer.activeData = false;
                }
            });
        });
        document.getElementById("cdOption1").style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        document.getElementById("dropdownCD").classList.add("hidden");
        consultDataBtnClose = true;
    }
}
//deactivate btn if there is no drawn items
// function updateConsultBtn() {
// 	let control = document.getElementById('iconCD-container');
// 	if (Object.values(drawnItems._layers).length === 0) {
// 		control.title = "No Hay Capas Para Consultar";
// 		control.classList.add("leaflet-disabled");
// 	} else {
// 		control.title = "Consultar Datos";
// 		control.classList.remove("leaflet-disabled");
// 	}
// }