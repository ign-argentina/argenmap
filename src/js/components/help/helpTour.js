'use strict';

/**
* HelpTour class for managing the help tour functionality.
*/
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
   * @param {Object} data - The help tour data object.
   */
  createComponent(data) {
    const btnElement = document.createElement('button');
    btnElement.classList = "ag-btn ag-btn-secondary";
    btnElement.id = 'nav-help-btn';
    btnElement.title = 'Ayuda';

    btnElement.innerHTML =
      //`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21 3h-7a2.98 2.98 0 0 0-2 .78A2.98 2.98 0 0 0 10 3H3a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h5.758c.526 0 1.042.214 1.414.586l1.121 1.121c.009.009.021.012.03.021.086.079.182.149.294.196h.002a.996.996 0 0 0 .762 0h.002c.112-.047.208-.117.294-.196.009-.009.021-.012.03-.021l1.121-1.121A2.015 2.015 0 0 1 15.242 20H21a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.758 18H4V5h6c.552 0 1 .449 1 1v12.689A4.032 4.032 0 0 0 8.758 18zM20 18h-4.758c-.799 0-1.584.246-2.242.689V6c0-.551.448-1 1-1h6v13z"></path></svg>`
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 4C9.243 4 7 6.243 7 9h2c0-1.654 1.346-3 3-3s3 1.346 3 3c0 1.069-.454 1.465-1.481 2.255-.382.294-.813.626-1.226 1.038C10.981 13.604 10.995 14.897 11 15v2h2v-2.009c0-.024.023-.601.707-1.284.32-.32.682-.598 1.031-.867C15.798 12.024 17 11.1 17 9c0-2.757-2.243-5-5-5zm-1 14h2v2h-2z"></path></svg>`;
    btnElement.setAttribute('aria-hidden', 'true');

    btnElement.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const tooltipTour = new TooltipTourMaker();
      tooltipTour.initTour(data);
    });

    document.querySelector('#logo-help').append(btnElement);
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
      const element = document.querySelector(step.needClickToOpen) || document.querySelector(step.element);

      if (!element) {
        // If the element is not found, remove the step from the sequence
        sequence.splice(i, 1);
        continue;
      }

      const elementRect = element.getBoundingClientRect();

      if (!(elementRect && elementRect.height > 0)) {
        // If the element does not have a positive height, remove the step from the sequence
        sequence.splice(i, 1);
      }
    }
  }


}