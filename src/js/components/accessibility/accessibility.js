/**
 * @class Accessibility
 * @description Class to manage accessibility features for a webpage.
 */
class Accessibility {
  constructor() {
    // Define initial states for accessibility features
    this.fontSizeState = 0; // Tracks the current font size state (0: Default, 1: 18px, 2: 20px)
    this.fontFamilyState = 1; // Tracks the current font family state (0: Default, 1: Dyslexic, 2: Tiresias, 3: Readable)
    this.saturationState = 0; // Tracks the current saturation state (0: Low, 1: High, 2: Normal)

    // CSS selectors for elements to apply font classes
    this.fontElements = `
      body, 
      label,
      a:hover,
      .ag-btn
      .featureInfo, 
      .leaflet-container, 
      .list-group-item, 
      .leaflet-popup-content, 
      .leaflet-draw-actions a, 
      .item-group-short-desc span, 
      .item-group-title, 
      .nav-tabs>li>a, 
      .base-layer-item-info>div, 
      .tabs_upload, 
      .upload p, 
      .initModal p, 
      .form-element, 
      .accessibility-btn h4, 
      .name-layer, 
      .individualFeatureTitle,
      #argenmap-tooltip span,
      #msgRectangle
    `;

    // Bind methods to ensure correct 'this' context
    this.changeFontSize = this.changeFontSize.bind(this);
    this.resetFontSize = this.resetFontSize.bind(this);
    this.invertColors = this.invertColors.bind(this);
    this.resetInvertColors = this.resetInvertColors.bind(this);
    this.greyColors = this.greyColors.bind(this);
    this.resetGreyColors = this.resetGreyColors.bind(this);
    this.saturationColors = this.saturationColors.bind(this);
    this.resetSaturationColors = this.resetSaturationColors.bind(this);
    this.readableFont = this.readableFont.bind(this);
    this.resetReadableFont = this.resetReadableFont.bind(this);
  }

  /**
   * @function createComponent
   * @description Initializes the accessibility panel and appends it to the DOM.
   */
  createComponent() {
    // Create the main accessibility panel container
    const accessibilityPanel = this.createElement("div", "accessibilityPanel", "accessibility-panel");

    // Create and append the title
    const accessibilityTitle = this.createElement("h2", "accessibilityTitle", "accessibility-title", "Accesibilidad");
    accessibilityPanel.appendChild(accessibilityTitle);

    // Create the container for accessibility buttons
    const accessibilityMain = this.createElement("div", "accessibilityMain", "accessibility-main");

    // Define accessibility features with titles, IDs, icons, and actions
    const accessibilityFeatures = [
      { title: "Tamaño de fuente", id: "fontSize", icon: "fa-solid fa-text-height", action: this.changeFontSize },
      { title: "Invertir colores", id: "invertColors", icon: "fa-solid fa-circle-half-stroke", action: this.invertColors },
      { title: "Escala de grises", id: "grey", icon: "fa-solid fa-barcode", action: this.greyColors },
      { title: "Saturación", id: "saturation", icon: "fa-solid fa-palette", action: this.saturationColors },
      { title: "Seleccionar fuente", id: "readableFont", icon: "fa-solid fa-font", action: this.readableFont },
      { title: "Contraste", id: "contrast", icon: "fa-solid fa-adjust", action: this.contrast },
      /* { title: "Cursor grande", id: "bigCursor", icon: "fa-solid fa-mouse-pointer", action: this.bigCursor }, */
      { title: "Mayúsculas", id: "toUpperCase", icon: "fa-solid fa-font", action: this.toUpperCase }
    ];

    // Create and append buttons based on accessibility features
    accessibilityFeatures.forEach(feature => {
      const button = this.createAccessibilityButton(feature.title, feature.id, feature.icon, feature.action);
      accessibilityMain.appendChild(button);
    });

    // Append the buttons container to the main panel
    accessibilityPanel.appendChild(accessibilityMain);

    // Append the accessibility panel to the designated container in the DOM
    const accessibilityContainer = document.getElementById("accessibility");
    if (accessibilityContainer) {
      accessibilityContainer.appendChild(accessibilityPanel);
    } else {
      console.warn("Accessibility container not found in the DOM.");
    }
  }

  /**
   * @function createElement
   * @description Utility method to create an HTML element with specified classes and content.
   * @param {string} tag - The tag name of the element (e.g., 'div', 'h2').
   * @param {string} id - The ID to assign to the element.
   * @param {string} classList - Optional class names to add to the element.
   * @param {string} innerHTML - Optional inner HTML content for the element.
   * @returns {HTMLElement} - The created HTML element.
   */
  createElement(tag, id = "", classList = "", innerHTML = "") {
    const element = document.createElement(tag);
    if (id) element.id = id;
    if (classList) element.className = classList;
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
    // Create the button container
    const button = this.createElement("div", `${id}-btn`, "ag-btn ag-btn-secondary accessibility-btn");
    button.setAttribute("title", title);
    button.setAttribute("aria-label", title);

    // Create and append the icon element
    const iconElement = this.createElement("i", `${id}-icon`, `${icon} accessibility-icon`);
    iconElement.setAttribute("aria-hidden", "true");
    button.appendChild(iconElement);

    // Create and append the title element
    const titleElement = this.createElement("h4", `${id}-title`, "", title);
    button.appendChild(titleElement);

    // Attach the click event listener
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

    if (!fontSizeButton || !fontSizeTitle) {
      console.warn("Font size button or title element not found.");
      return;
    }

    // Define font sizes to alternate between
    const fontSizeOptions = [
      { class: 'font-size18', title: "Tamaño de fuente 18", btnClass: 'ag-btn-confirm' },
      { class: 'font-size20', title: "Tamaño de fuente 20", btnClass: 'ag-btn-confirm' },
      { class: '', title: "Tamaño de fuente", btnClass: 'ag-btn-secondary' }
    ];

    // Determine the font size state and corresponding class, title, and button class
    const { class: classToAdd, title: fontSizeText, btnClass } = fontSizeOptions[this.fontSizeState];

    // Remove all font size classes from the elements
    fontSizeElements.forEach(element => {
      element.classList.remove('font-size18', 'font-size20');
    });

    // Apply the new font size class if not resetting to the default size
    if (classToAdd) {
      fontSizeElements.forEach(element => {
        element.classList.add(classToAdd);
      });
    }

    // Update the font size title and button aria-label
    fontSizeTitle.textContent = fontSizeText;
    fontSizeButton.setAttribute('aria-label', fontSizeText);

    // Update button appearance based on the current font size state
    fontSizeButton.classList.toggle('ag-btn-secondary', btnClass === 'ag-btn-secondary');
    fontSizeButton.classList.toggle('ag-btn-confirm', btnClass === 'ag-btn-confirm');

    // Cycle the font size state to the next option
    this.fontSizeState = (this.fontSizeState + 1) % fontSizeOptions.length;
  }

  /**
   * @function resetFontSize
   * @description Resets the font size on the specified elements and updates the font family state.
   */
  resetFontSize() {
    const fontSizeElements = document.querySelectorAll(this.fontElements);
    const fontSizeButton = document.getElementById("fontSize-btn");
    const fontSizeTitle = document.getElementById("fontSize-title");

    fontSizeElements.forEach((element) => {
      element.style.setProperty('font-size', "");
    });

    fontSizeButton.classList.remove('ag-btn-confirm');
    fontSizeButton.classList.add('ag-btn-secondary');
    fontSizeTitle.title = "Tamaño de fuente";
    fontSizeTitle.innerHTML = "Tamaño de fuente";
    fontSizeButton.setAttribute('aria-label', "Tamaño de fuente");
    this.fontSizeState = 0;
  }

  /**
   * @function invertColors
   * @description Toggles a CSS class on the body element to invert the colors of the page for accessibility.
   */
  invertColors() {
    const body = document.body;
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

  /**
   * @function resetInvertColors
   * @description Resets the inverted color scheme on the page and updates the saturation state.
   * @param {boolean} [resetSaturationState=true] - Indicates whether to reset the saturation state to 0.
   */
  resetInvertColors(resetSaturationState = true) {
    const body = document.body;
    const invertButton = document.getElementById("invertColors-btn");

    // Remove 'invert-colors' class from the body element
    body.classList.remove('invert-colors');

    // Update the button's classes to reflect the non-active state
    invertButton.classList.replace('ag-btn-confirm', 'ag-btn-secondary');

    // Reset saturation state if specified
    if (resetSaturationState) {
      this.saturationState = 0;
    }
  }

  /**
   * @function greyColors
   * @description Toggles a CSS class on the body element to apply grayscale colors for accessibility.
   */
  greyColors() {
    const body = document.body;
    const greyButton = document.getElementById("grey-btn");

    if (!body) {
      console.warn("Body element not found. Could not apply grayscale colors.");
      return;
    }

    this.resetInvertColors();
    this.resetSaturationColors();
    body.classList.toggle('grey-colors');

    // Toggle button classes for visual indication
    greyButton.classList.toggle('ag-btn-secondary');
    greyButton.classList.toggle('ag-btn-confirm');
  }

  /**
   * @function resetGreyColors
   * @description Resets the grey color scheme on the page and updates the saturation state.
   * @param {boolean} [resetSaturationState=true] - Indicates whether to reset the saturation state to 0.
   */
  resetGreyColors(resetSaturationState = true) {
    const body = document.body;
    const greyButton = document.getElementById("grey-btn");

    // Remove 'grey-colors' class from the body element
    body.classList.remove('grey-colors');

    // Update the button's classes to reflect the non-active state
    greyButton.classList.replace('ag-btn-confirm', 'ag-btn-secondary');

    // Reset saturation state if specified
    if (resetSaturationState) {
      this.saturationState = 0;
    }
  }

  /**
   * @function saturationColors
   * @description Toggles between three saturation levels (low, high, and normal).
   */
  saturationColors() {
    const body = document.body;
    const saturationButton = document.getElementById("saturation-btn");
    const saturationTitle = document.getElementById("saturation-title");

    if (!body) {
      console.warn("Body element not found. Could not toggle saturation classes.");
      return;
    }

    // Remove conflicting classes
    this.resetInvertColors(false);
    this.resetGreyColors(false);

    // Define saturation options
    const saturationOptions = [
      { class: 'saturation-colors-low', title: "Saturación Baja", btnClass: 'ag-btn-confirm' },
      { class: 'saturation-colors-high', title: "Saturación Alta", btnClass: 'ag-btn-confirm' },
      { class: '', title: "Saturación", btnClass: 'ag-btn-secondary' }
    ];

    // Determine the current saturation option based on the state
    const { class: classToAdd, title: saturationText, btnClass } = saturationOptions[this.saturationState];
    body.classList.remove('saturation-colors-low', 'saturation-colors-high');

    // Apply the new saturation class if not resetting to normal
    if (classToAdd) {
      body.classList.add(classToAdd);
    }

    // Update UI elements for saturation
    saturationTitle.innerHTML = saturationText;
    saturationButton.setAttribute('aria-label', saturationText);

    // Toggle button classes based on the new saturation state
    saturationButton.classList.toggle('ag-btn-secondary', btnClass === 'ag-btn-secondary');
    saturationButton.classList.toggle('ag-btn-confirm', btnClass === 'ag-btn-confirm');

    // Update the saturation state to cycle through 0, 1, and 2
    this.saturationState = (this.saturationState + 1) % saturationOptions.length;
  }

  /**
   * @function resetSaturationColors
   * @description Resets the saturation colors to their default state.
   */
  resetSaturationColors() {
    const body = document.body;
    const saturationButton = document.getElementById("saturation-btn");
    const saturationTitle = document.getElementById("saturation-title");

    if (!saturationButton || !saturationTitle) {
      console.warn("Saturation button or title element not found.");
      return;
    }

    // Remove saturation-related classes from the body element
    body.classList.remove('saturation-colors-low', 'saturation-colors-high');

    // Reset the saturation title text and button attributes
    saturationTitle.textContent = "Saturación";
    saturationButton.setAttribute('aria-label', "Saturación");

    // Update button appearance to indicate it is inactive
    saturationButton.classList.remove('ag-btn-confirm');
    saturationButton.classList.add('ag-btn-secondary');

    // Reset the saturation state
    this.saturationState = 0;
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

    // Define font classes, titles, and button classes
    const fontOptions = [
      { class: '', title: 'Seleccionar fuente', btnClass: 'ag-btn-secondary' },
      { class: 'dyslexic-font', title: 'Fuente dislexia', btnClass: 'ag-btn-confirm' },
      { class: 'tiresias-font', title: 'Fuente baja visión', btnClass: 'ag-btn-confirm' },
      { class: 'readable-font', title: 'Fuente legible', btnClass: 'ag-btn-confirm' }
    ];

    // Get the current font option based on the state
    const { class: classToAdd, title: buttonText, btnClass } = fontOptions[this.fontFamilyState];

    // Update the font classes on target elements
    fontElements.forEach((element) => {
      element.classList.remove('readable-font', 'dyslexic-font', 'tiresias-font');
      if (classToAdd) {
        element.classList.add(classToAdd);
      }
    });

    // Update the button title and aria-label for accessibility
    btnTitle.innerHTML = buttonText;
    readableFontBtn.setAttribute('aria-label', buttonText);

    // Update button classes for visual indication
    readableFontBtn.classList.remove('ag-btn-secondary', 'ag-btn-confirm');
    readableFontBtn.classList.add(btnClass);

    // Update the font family state to cycle through 0, 1, 2, and 3
    this.fontFamilyState = (this.fontFamilyState + 1) % fontOptions.length;
  }

  /**
   * @function resetReadableFont
   * @description Resets the font classes on the specified elements and updates the font family state.
   */
  resetReadableFont() {
    const fontElements = document.querySelectorAll(this.fontElements);
    const readableFontBtn = document.getElementById("readableFont-btn");
    const btnTitle = document.querySelector('#readableFont-title');

    fontElements.forEach((element) => {
      element.classList.remove('readable-font', 'dyslexic-font', 'tiresias-font');
    });

    readableFontBtn.classList.remove('ag-btn-confirm');
    readableFontBtn.classList.add('ag-btn-secondary');
    btnTitle.innerHTML = "Seleccionar fuente";
    readableFontBtn.setAttribute('aria-label', "Seleccionar fuente");
    this.fontFamilyState = 0;
  }


}
