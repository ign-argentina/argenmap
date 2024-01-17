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
    btnElement.classList = "ag-btn ag-btn-secondary menu-section-btn";
    btnElement.id = 'nav-help-btn';
    btnElement.title = 'Ayuda';

    btnElement.innerHTML =
      `<i class="fa-solid fa-question"></i> `;
    btnElement.setAttribute('aria-hidden', 'true');

    btnElement.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const tooltipTour = new TooltipTourMaker();
      tooltipTour.initTour(data);
    });

    document.querySelector('#botonera').append(btnElement);
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