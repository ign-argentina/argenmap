/**
 * @class Accessibility
 * @description Class to manage accessibility features for a webpage.
 */
class Accessibility {
  constructor() {
  }

  /**
   * @function createComponent
   * @description Initializes the accessibility panel and appends it to the DOM.
   */
  createComponent() {
    const accessibilityPanel = this.createElement("div", "accessibility-panel");
    const accessibilityTitle = this.createElement("h2", "", "Accesibilidad");
    const accessibilityMain = this.createElement("div", "accessibility-main");

    // Create buttons with relevant actions
    const fontSizeButton = this.createAccessibilityButton("Tamaño de fuente", "fa-solid fa-text-height", this.changeFontSize);
    const increaseButton = this.createAccessibilityButton("Aumentar algo", "fa-solid fa-underline", this.increaseSomething);

    // Append elements to the panel
    accessibilityMain.appendChild(fontSizeButton);
    accessibilityMain.appendChild(increaseButton);
    accessibilityPanel.appendChild(accessibilityTitle);
    accessibilityPanel.appendChild(accessibilityMain);

    document.getElementById("accessibility").appendChild(accessibilityPanel);
  }

  /**
   * @function createElement
   * @description Utility method to create an HTML element with specified classes and content.
   * @param {string} tag - The tag name of the element (e.g., 'div', 'h2').
   * @param {string} classList - Class names to add to the element.
   * @param {string} [innerHTML] - Optional inner HTML content for the element.
   * @returns {HTMLElement} - The created HTML element.
   */
  createElement(tag, classList, innerHTML = "") {
    const element = document.createElement(tag);
    element.className = classList;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  /**
   * @function createAccessibilityButton
   * @description Creates a button element for the accessibility panel with an associated action.
   * @param {string} title - The button title and tooltip text.
   * @param {string} icon - Font Awesome icon class.
   * @param {function} action - The function to be executed when the button is clicked.
   * @returns {HTMLElement} - The created button element.
   */
  createAccessibilityButton(title, icon, action) {
    const button = this.createElement("div", "ag-btn ag-btn-secondary accessibility-btn");
    button.setAttribute("title", title);

    const iconElement = this.createElement("i", icon + " accessibility-icon");

    iconElement.setAttribute("aria-hidden", "true");

    const titleElement = this.createElement("h5", "", title);

    button.appendChild(iconElement);
    button.appendChild(titleElement);

    button.addEventListener("click", action);
    return button;
  }

  /**
   * @function changeFontSize
   * @description Changes the font size for accessibility purposes.
   */
  changeFontSize() {
    const fontSize = document.querySelectorAll(".item-group-short-desc span, .item-group-title, .nav-tabs>li>a, .base-layer-item-info>div, #argenmap-tooltip span, .tabs_upload, .upload p, .initModal p, .form-element, label");
    fontSize.forEach((element) => {
      element.style.fontSize = "18px";
    });
  }

  /**
   * @function increaseSomething
   * @description Increases a specific setting for accessibility purposes.
   */
  increaseSomething() {
    console.log("Increasing something...");
    // Functionality to increase a specific setting goes here
  }
}
