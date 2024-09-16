/**
 * @class Accessibility
 * @description Class to manage accessibility features for a webpage.
 */
class Accessibility {
  constructor() {
    this.fontSizeState = 1; // Track the current font size state
    this.fontFamilyState = 1; // Track the current font family state
    this.changeFontSize = this.changeFontSize.bind(this);
    this.invertColors = this.invertColors.bind(this);
    this.greyColors = this.greyColors.bind(this);
    this.saturationColors = this.saturationColors.bind(this);
    this.readableFont = this.readableFont.bind(this);

  }

  /**
   * @function createComponent
   * @description Initializes the accessibility panel and appends it to the DOM.
   */
  createComponent() {
    const accessibilityPanel = this.createElement("div", "accessibilityPanel", "accessibility-panel");
    const accessibilityTitle = this.createElement("h2", "accessibilityTitle", "", "Accesibilidad");
    const accessibilityMain = this.createElement("div", "accessibilityMain", "accessibility-main");

    // Create buttons with relevant actions
    const fontSizeButton = this.createAccessibilityButton("Tamaño de fuente", "fontSize", "fa-solid fa-text-height", this.changeFontSize);
    const invertColorsButton = this.createAccessibilityButton("Invertir colores", "invertColors", "fa-solid fa-circle-half-stroke", this.invertColors);
    const greyButton = this.createAccessibilityButton("Escala de grises", "grey", "fa-solid fa-barcode", this.greyColors);
    const saturationButton = this.createAccessibilityButton("Saturación", "saturation", "fa-solid fa-palette", this.saturationColors);
    const readableFontButton = this.createAccessibilityButton("Seleccionar fuente", "readableFont", "fa-solid fa-font", this.readableFont);
    const constrastButton = this.createAccessibilityButton("Contraste", "fa-solid fa-adjust", this.contrast);
    const bigCursorButton = this.createAccessibilityButton("Cursor grande", "fa-solid fa-mouse-pointer", this.bigCursor);
    const toUpperCaseButton = this.createAccessibilityButton("Mayúsculas", "fa-solid fa-font", this.toUpperCase);


    // Append elements to the panel
    accessibilityMain.appendChild(fontSizeButton);
    accessibilityMain.appendChild(invertColorsButton);
    accessibilityMain.appendChild(greyButton);
    accessibilityMain.appendChild(saturationButton);
    accessibilityMain.appendChild(readableFontButton);
    accessibilityMain.appendChild(constrastButton);
    accessibilityMain.appendChild(bigCursorButton);
    accessibilityMain.appendChild(toUpperCaseButton);

    accessibilityPanel.appendChild(accessibilityTitle);
    accessibilityPanel.appendChild(accessibilityMain);

    document.getElementById("accessibility").appendChild(accessibilityPanel);
  }

  /**
   * @function createElement
   * @description Utility method to create an HTML element with specified classes and content.
   * @param {string} tag - The tag name of the element (e.g., 'div', 'h2').
   * @param {string} id - The ID to assign to the element.
   * @param {string} classList - Class names to add to the element.
   * @param {string} [innerHTML] - Optional inner HTML content for the element.
   * @returns {HTMLElement} - The created HTML element.
   */
  createElement(tag, id, classList, innerHTML = "") {
    const element = document.createElement(tag);
    element.id = id;
    element.className = classList;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  /**
   * @function createAccessibilityButton
   * @description Creates a button element for the accessibility panel with an associated action.
   * @param {string} title - The button title and tooltip text.
   * @param {string} id - The ID to assign to the button element.
   * @param {string} icon - Font Awesome icon class.
   * @param {function} action - The function to be executed when the button is clicked.
   * @returns {HTMLElement} - The created button element.
   */
  createAccessibilityButton(title, id, icon, action) {
    const button = this.createElement("div", id + "-btn", "ag-btn ag-btn-secondary accessibility-btn", "");
    button.setAttribute("title", title);

    const iconElement = this.createElement("i", id + "-icon", icon + " accessibility-icon");

    iconElement.setAttribute("aria-hidden", "true");

    const titleElement = this.createElement("h5", id + "-title", "", title);

    button.appendChild(iconElement);
    button.appendChild(titleElement);

    button.addEventListener("click", action);
    return button;
  }

  /**
   * @function changeFontSize
   * @description Alternates between three font sizes for accessibility purposes.
   */
  changeFontSize() {
    const fontSizeElements = document.querySelectorAll(".item-group-short-desc span, .item-group-title, .nav-tabs>li>a, .base-layer-item-info>div, #argenmap-tooltip span, .tabs_upload, .upload p, .initModal p, .form-element, label, .accessibility-btn h5");

    fontSizeElements.forEach((element) => {
      switch (this.fontSizeState) {
        case 0:
          element.style.fontSize = ""; // Reset to the default size
          break;
        case 1:
          element.style.fontSize = "18px"; // Medium size
          break;
        case 2:
          element.style.fontSize = "20px"; // Large size
          break;
      }
    });

    // Update the font size state to alternate between 0, 1, and 2
    this.fontSizeState = (this.fontSizeState + 1) % 3;
  }

  /**
   * @function invertColors
   * @description Toggles a CSS class on the body element to invert the colors of the page for accessibility.
   */
  invertColors() {
    const body = document.querySelector('body');

    if (body) {
      body.classList.remove('grey-colors', 'saturation-colors-low', 'saturation-colors-high');
      body.classList.toggle('invert-colors');
    } else {
      console.warn("Body element not found. Could not apply color inversion.");
    }
  }

  /**
   * @function greyColors
   * @description Toggles a CSS class on the body element to apply grayscale colors for accessibility.
   */
  greyColors() {
    const body = document.querySelector('body');

    if (body) {
      body.classList.remove('invert-colors', 'saturation-colors-low', 'saturation-colors-high');
      body.classList.toggle('grey-colors');
    } else {
      console.warn("Body element not found. Could not apply grayscale colors.");
    }
  }

  /**
   * @function saturationColors
   * @description Toggles between three saturation levels (low, high, and normal).
   */
  saturationColors() {
    const body = document.querySelector('body');

    if (body) {
      body.classList.remove('invert-colors', 'grey-colors');
      // Toggle between saturation levels
      if (body.classList.contains('saturation-colors-low')) {
        body.classList.replace('saturation-colors-low', 'saturation-colors-high');
      } else if (body.classList.contains('saturation-colors-high')) {
        body.classList.remove('saturation-colors-high'); // Reset to normal (no class)
      } else {
        body.classList.add('saturation-colors-low'); // Default to low saturation
      }
    } else {
      console.warn("Body element not found. Could not toggle saturation classes.");
    }
  }

  /**
   * Toggles between three font classes ('readable-font', 'dyslexic-font', 'tiresias-font')
   * on the specified elements to enhance readability.
   */
  readableFont() {
    // Select all elements matching the specified selectors
    const fontElements = document.querySelectorAll('body, .featureInfo, .leaflet-container, .list-group-item, .leaflet-popup-content, .leaflet-draw-actions a');
    const btnTitle = document.querySelector('#readableFont-title');
    // Remove previously applied font classes
    fontElements.forEach((element) => {
      element.classList.remove('readable-font', 'dyslexic-font', 'tiresias-font');
    });

    // Apply the appropriate class based on the current state
    fontElements.forEach((element) => {
      switch (this.fontFamilyState) {
        case 0: element.classList.remove('readable-font', 'dyslexic-font', 'tiresias-font');
          btnTitle.innerHTML = "Seleccionar fuente";
          break;
        case 1:
          element.classList.add('dyslexic-font');
          btnTitle.innerHTML = "Fuente dislexia";
          break;
        case 2:
          element.classList.add('tiresias-font');
          btnTitle.innerHTML = "Fuente baja visión";
          break;
        case 3:
          element.classList.add('readable-font');
          btnTitle.innerHTML = "Fuente legible";
          break;
    }
    });

    // Update the font size state to alternate between 0, 1, 2, and 3
    this.fontFamilyState = (this.fontFamilyState + 1) % 4;
  }





}
