'use strict';

class HelpTour {
    constructor() { }

    /**
         * Fetches the help tour data from a JSON file.
         * @returns {Promise<Object|null>} A promise that resolves to the help tour data object, or null if an error occurs.
         */
    async fetchHelpTourData() {
        try {
            const response = await fetch('src/js/components/help/helpTourData.json');
            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }
            const data = await response.json();
            this.removeElementsNotInApp(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch help tour data:', error);
            return null;
        }
    }

    /**
     * Creates the Help Tour component and attaches event listeners.
     */
    createComponent(data) {
        // Create the <a> element for help icon
        const aElement = document.createElement('a');
        aElement.id = 'iconHelp-container';
        aElement.title = 'Ayuda';

        // Create the <i> element for the help icon
        const iElement = document.createElement('i');
        iElement.id = 'iconHelp';
        iElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M12 6a3.939 3.939 0 0 0-3.934 3.934h2C10.066 8.867 10.934 8 12 8s1.934.867 1.934 1.934c0 .598-.481 1.032-1.216 1.626a9.208 9.208 0 0 0-.691.599c-.998.997-1.027 2.056-1.027 2.174V15h2l-.001-.633c.001-.016.033-.386.441-.793.15-.15.339-.3.535-.458.779-.631 1.958-1.584 1.958-3.182A3.937 3.937 0 0 0 12 6zm-1 10h2v2h-2z"></path><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></svg>`;
        iElement.setAttribute('aria-hidden', 'true');

        // Create the <div> element for the Help Tour item
        const elem = document.createElement("div");
        elem.className = "";
        elem.id = "nav-help-btn";

        // Append the <i> element to the <a> element
        aElement.appendChild(iElement);

        // Append the <a> element to the <div> element
        elem.appendChild(aElement);

        // Add a click event listener to the <div> element
        elem.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            let tooltipTour = new TooltipTourMaker();
            tooltipTour.initTour(data);
        });

        // Append the <div> element to the leaflet top right container
        document.querySelector("#logo-help").append(elem);
    }

    /**
     * Removes elements not present in the app from the provided JSON object.
     * @param {Object} json - The JSON object to modify.
     */
    removeElementsNotInApp(json) {
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