'use strict';

class HelpTour {
    constructor() {
        this.component = `
            <a id="iconHelp-container" title="Ayuda">
                  <i id="iconHelp" class="fa-solid fa-question" aria-hidden="true"></i>
            </a>
        `;
    }

    /**
     * Fetches the help tour data from a JSON file.
     * @returns {Object|null} The help tour data object, or null if an error occurs.
     */
    async fetchHelpTourData() {
        try {
            const response = await fetch('src/js/components/help/helpTourData.json');
            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }
            const options = await response.json();
            return options;
        } catch (error) {
            console.error('Failed to fetch help tour data:', error);
            return null;
        }
    }

    /**
     * Creates the Help Tour component and attaches event listeners.
     */
    async createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "help";
        elem.innerHTML = this.component;
        elem.addEventListener("click", async (event) => {
            event.preventDefault();
            const helpTourData = await this.fetchHelpTourData();
            if (helpTourData) {
                this.removeElementNotInApp(helpTourData);
                new TooltipTourMaker(helpTourData);
            }
        });
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }

    /**
     * Removes elements not present in the app from the provided JSON.
     * @param {Object} json - The JSON object to modify.
     */
    removeElementNotInApp(json) {
        if (!json || !Array.isArray(json.sequence)) {
            return;
        }
        const sequence = json.sequence;
        for (let i = sequence.length - 1; i >= 0; i--) {
            const step = sequence[i];
            const element = document.querySelector(step.element) || document.querySelector(step.needClickToOpen);
            if (!element) {
                sequence.splice(i, 1);
            }
        }
    }
}
