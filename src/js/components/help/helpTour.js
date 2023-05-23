'use strict';

let options;
async function fetchHelpTour() {
    const response = await fetch('src/js/components/help/helpTourData.json');

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        console.error(message)
    }

    const data = await response.json();
    options = data;
    return data;
}
fetchHelpTour()
class HelpTour {
    constructor() {
        this.component = `
            <a id="iconHelp-container" title="Ayuda">
                  <i id="iconHelp" class="fa-solid fa-question" aria-hidden="true"></i>
            </a>
            `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "help";
        elem.innerHTML = this.component;
        elem.addEventListener("click", function (event) {
            event.stopPropagation();
            event.preventDefault();
            const tooltipHelper = new TooltipTourMaker();
            tooltipHelper.initTour(options);
        });
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}

