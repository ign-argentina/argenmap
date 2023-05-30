'use strict';

let options;

/*
Fetches the help tour data from a JSON file asynchronously and assigns it to the options variable.
*/
(async () => {
    try {
        const response = await fetch('src/js/components/help/helpTourData.json');

        if (!response.ok) {
            throw new Error(`An error has occurred: ${response.status}`);
        }

        options = await response.json();
    } catch (error) {
        console.error('Failed to fetch help tour data:', error);
    }
})();

function removeElementsNotInArray(json) {
    if (!json || !Array.isArray(json.sequence)) {
        return;
    }
    const sequence = json.sequence;

    for (let i = sequence.length - 1; i >= 0; i--) {
        const id = sequence[i];
        const element = document.querySelector(id.element);

        if (!element) {
            sequence.splice(i, 1);
        }
    }
};

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
            event.preventDefault();
            removeElementsNotInArray(app.helpTourData ?? options);
            new TooltipTourMaker(app.helpTourData ?? options);
        });
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}