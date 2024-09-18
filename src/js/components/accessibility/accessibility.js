/**
 * @class Accessibility
 * @description Class to manage accessibility features for a webpage.
 */
class Accessibility {
  constructor() {
    this.fontSizeState = 1; // Track the current font size state
    this.fontFamilyState = 1; // Track the current font family state
    this.fontElements = 'body, .featureInfo, .leaflet-container, .list-group-item, .leaflet-popup-content, .leaflet-draw-actions a, .item-group-short-desc span, .item-group-title, .nav-tabs>li>a, .base-layer-item-info>div, #argenmap-tooltip span, .tabs_upload, .upload p, .initModal p, .form-element, label, .accessibility-btn h4, .name-layer, .individualFeatureTitle'; // Elements to apply font classes to 
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
    /*     const constrastButton = this.createAccessibilityButton("Contraste", "fa-solid fa-adjust", this.contrast);
        const bigCursorButton = this.createAccessibilityButton("Cursor grande", "fa-solid fa-mouse-pointer", this.bigCursor);
        const toUpperCaseButton = this.createAccessibilityButton("Mayúsculas", "fa-solid fa-font", this.toUpperCase); */


    // Append elements to the panel
    accessibilityMain.appendChild(fontSizeButton);
    accessibilityMain.appendChild(invertColorsButton);
    accessibilityMain.appendChild(greyButton);
    accessibilityMain.appendChild(saturationButton);
    accessibilityMain.appendChild(readableFontButton);
    /*     accessibilityMain.appendChild(constrastButton);
        accessibilityMain.appendChild(bigCursorButton);
        accessibilityMain.appendChild(toUpperCaseButton); */

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
    button.setAttribute("aria-label", title);

    const iconElement = this.createElement("i", id + "-icon", icon + " accessibility-icon");

    iconElement.setAttribute("aria-hidden", "true");

    const titleElement = this.createElement("h4", id + "-title", "", title);

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
    const fontSizeElements = document.querySelectorAll(this.fontElements);
    const fontSizeButton = document.getElementById("fontSize-btn");
    const fontSizeTitle = document.getElementById("fontSize-title");

    // Define font sizes to alternate between
    const fontSizes = ["", "18px", "20px"];

    // Get the current font size based on the state
    const newSize = fontSizes[this.fontSizeState];
    const defaultTitle = "Tamaño de fuente";

    // Set title and aria-label
    fontSizeTitle.title = newSize ? `${defaultTitle}: ${newSize}` : defaultTitle;
    fontSizeTitle.innerHTML = newSize ? `${defaultTitle}: ${newSize}` : defaultTitle;
    fontSizeButton.setAttribute('aria-label', fontSizeTitle.title);

    // Toggle button classes based on font size
    fontSizeButton.classList.toggle('ag-btn-secondary', !newSize);
    fontSizeButton.classList.toggle('ag-btn-confirm', !!newSize);

    // Apply the new font size to each element
    fontSizeElements.forEach((element) => {
      element.style.setProperty('font-size', newSize, 'important');
    });

    // Update the font size state to alternate between 0, 1, and 2
    this.fontSizeState = (this.fontSizeState + 1) % fontSizes.length;
  }

  /**
   * @function invertColors
   * @description Toggles a CSS class on the body element to invert the colors of the page for accessibility.
   */
  invertColors() {
    const body = document.querySelector('body');
    const invertButton = document.getElementById("invertColors-btn");

    if (!body) {
      console.warn("Body element not found. Could not apply color inversion.");
      return;
    }

    // Remove other color-related classes and toggle the 'invert-colors' class
    this.resetGreyColors();
    this.resetSaturationColors();
    body.classList.toggle('invert-colors');

    // Toggle button classes for visual indication
    invertButton.classList.toggle('ag-btn-secondary');
    invertButton.classList.toggle('ag-btn-confirm');
  }

  resetInvertColors() {
    const body = document.querySelector('body');
    const invertButton = document.getElementById("invertColors-btn");
    body.classList.remove('invert-colors');
    invertButton.classList.remove('ag-btn-confirm');
    invertButton.classList.add('ag-btn-secondary');
  }

  /**
   * @function greyColors
   * @description Toggles a CSS class on the body element to apply grayscale colors for accessibility.
   */
  greyColors() {
    const body = document.querySelector('body');
    const greyButton = document.getElementById("grey-btn");

    if (!body) {
      console.warn("Body element not found. Could not apply color inversion.");
      return;
    }

    this.resetInvertColors();
    this.resetSaturationColors();
    body.classList.toggle('grey-colors');

    // Toggle button classes for visual indication
    greyButton.classList.toggle('ag-btn-secondary');
    greyButton.classList.toggle('ag-btn-confirm');
  }

  resetGreyColors() {
    const body = document.querySelector('body');
    const greyButton = document.getElementById("grey-btn");
    body.classList.remove('grey-colors');
    greyButton.classList.remove('ag-btn-confirm');
    greyButton.classList.add('ag-btn-secondary');
  }

  /**
   * @function saturationColors
   * @description Toggles between three saturation levels (low, high, and normal).
   */
  saturationColors() {
    const body = document.querySelector('body');
    const saturationButton = document.getElementById("saturation-btn");
    const saturationTitle = document.getElementById("saturation-title");

    if (!body) {
      console.warn("Body element not found. Could not toggle saturation classes.");
      return;
    }

    // Remove conflicting classes
    this.resetInvertColors();
    this.resetGreyColors();

    // Toggle between saturation levels
    if (body.classList.contains('saturation-colors-low')) {
      body.classList.replace('saturation-colors-low', 'saturation-colors-high');
      this.updateSaturationUI(saturationTitle, saturationButton, "Saturación Alta");
      saturationButton.classList.remove('ag-btn-secondary');
      saturationButton.classList.add('ag-btn-confirm');
    } else if (body.classList.contains('saturation-colors-high')) {
      body.classList.remove('saturation-colors-high'); // Reset to normal (no class)
      this.updateSaturationUI(saturationTitle, saturationButton, "Saturación");
      saturationButton.classList.remove('ag-btn-confirm');
      saturationButton.classList.add('ag-btn-secondary');
    } else {
      body.classList.add('saturation-colors-low'); // Default to low saturation
      this.updateSaturationUI(saturationTitle, saturationButton, "Saturación Baja");
      saturationButton.classList.remove('ag-btn-secondary');
      saturationButton.classList.add('ag-btn-confirm');
    }
  }

  /**
   * @function updateSaturationUI
   * @description Updates the UI elements for saturation button and title.
   * @param {HTMLElement} titleElement - The element to update the inner HTML of.
   * @param {HTMLElement} buttonElement - The button element to update the classes of.
   * @param {string} labelText - The text to set for title and aria-label.
   */
  updateSaturationUI(titleElement, buttonElement, labelText) {
    titleElement.innerHTML = labelText;
    buttonElement.setAttribute('aria-label', labelText);
  }

  resetSaturationColors() {
    const body = document.querySelector('body');
    const saturationButton = document.getElementById("saturation-btn");
    const saturationTitle = document.getElementById("saturation-title");

    body.classList.remove('saturation-colors-low', 'saturation-colors-high');
    this.updateSaturationUI(saturationTitle, saturationButton, "Saturación");
    saturationButton.classList.remove('ag-btn-confirm');
    saturationButton.classList.add('ag-btn-secondary');
  }

  /**
   * @function readableFont
   * @description Toggles between four font classes ('readable-font', 'dyslexic-font', 'tiresias-font')
   * on the specified elements to enhance readability.
   */
  readableFont() {
    const fontElements = document.querySelectorAll(this.fontElements);
    const readableFontBtn = document.getElementById("readableFont-btn");
    const btnTitle = document.querySelector('#readableFont-title');

    // Define font classes and button titles
    const fontOptions = [
      { class: '', title: 'Seleccionar fuente', btnClass: 'ag-btn-secondary' },
      { class: 'dyslexic-font', title: 'Fuente dislexia', btnClass: 'ag-btn-confirm' },
      { class: 'tiresias-font', title: 'Fuente baja visión', btnClass: 'ag-btn-confirm' },
      { class: 'readable-font', title: 'Fuente legible', btnClass: 'ag-btn-confirm' }
    ];

    // Get the current font option based on the state
    const { class: classToAdd, title: buttonText } = fontOptions[this.fontFamilyState];

    // Update the font classes
    fontElements.forEach((element) => {
      element.classList.remove('readable-font', 'dyslexic-font', 'tiresias-font');
      if (classToAdd) {
        element.classList.add(classToAdd);
      }
    });

    // Update the button title
    btnTitle.innerHTML = buttonText;
    readableFontBtn.setAttribute('aria-label', buttonText);
    readableFontBtn.classList.remove('ag-btn-secondary', 'ag-btn-confirm');
    readableFontBtn.classList.add(fontOptions[this.fontFamilyState].btnClass);

    // Update the font size state to alternate between 0, 1, 2, and 3
    this.fontFamilyState = (this.fontFamilyState + 1) % fontOptions.length;
  }




}
