/**
 * @class Accessibility
 * @description Class to manage accessibility features for a webpage.
 */
class Accessibility {
  constructor() {
    // Define initial states for accessibility features
    this.fontSizeState = 1; // Tracks the current font size state (0: Default, 1: 18px, 2: 20px)
    this.fontFamilyState = 1; // Tracks the current font family state (0: Default, 1: Dyslexic, 2: Tiresias, 3: Readable)
    this.saturationState = 1; // Tracks the current saturation state (0: Default, 1: Low, 2: High)
    this.contrastState = 1; // Tracks the current contrast state (0: Default, 1: DarkBackground, 2: LightBackground)

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
      .basemap-title,
      .initModal p, 
      .form-element, 
      .accessibility-btn h4,
      .name-layer, 
      .individualFeatureTitle,
      #child-mapasbase1 > div > div > div.base-layer-item-info > div > p,
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
    this.contrast = this.contrast.bind(this);
    this.resetContrast = this.resetContrast.bind(this);
    this.toUpperCase = this.toUpperCase.bind(this);

    this.resetAllAccessibility = this.resetAllAccessibility.bind(this);
    this.toggleResetButtonVisibility = this.toggleResetButtonVisibility.bind(this);

  }

  /**
   * @function createComponent
   * @description Initializes the accessibility panel and appends it to the DOM.
   */
  createComponent() {
    // Create the main accessibility panel container
    const accessibilityPanel = this.createElement("div", "accessibilityPanel", "accessibility-panel");
    const accessibilityHeader = this.createElement("div", "accessibilityHeader", "accessibility-header");

    // Create and append the title
    const accessibilityTitle = this.createElement("h3", "accessibilityTitle", "accessibility-title", "Accesibilidad");

    // Create and append the reset button
    const resetButton = this.createAccessibilityButton("Restaurar", "resetAccessibility", "fa-solid fa-undo", this.resetAllAccessibility);
    resetButton.classList.remove('accessibility-btn', 'ag-btn-secondary');
    resetButton.classList.add('reset-btn', 'ag-btn-danger');
    resetButton.setAttribute('title', 'Restaurar configuración de accesibilidad');
    resetButton.setAttribute('aria-label', 'Restaurar configuración de accesibilidad');
    resetButton.addEventListener('click', () => this.toggleResetButtonVisibility(resetButton));

    // Append the title and reset button to the header
    accessibilityHeader.appendChild(accessibilityTitle);
    accessibilityHeader.appendChild(resetButton);
    accessibilityPanel.appendChild(accessibilityHeader);

    // Create the container for accessibility buttons
    const accessibilityMain = this.createElement("div", "accessibilityMain", "accessibility-main");

    // Define accessibility features with titles, IDs, icons, and actions
    const accessibilityFeatures = [
      { title: "Tamaño de fuente", id: "fontSize", icon: "fa-solid fa-text-height", action: this.changeFontSize },
      { title: "Invertir colores", id: "invertColors", icon: "fa-solid fa-circle-half-stroke", action: this.invertColors },
      { title: "Escala de grises", id: "grey", icon: "fa-solid fa-barcode", action: this.greyColors },
      { title: "Saturación", id: "saturation", icon: "fa-solid fa-palette", action: this.saturationColors },
      { title: "Seleccionar fuente", id: "readableFont", icon: "fa-solid fa-font", action: this.readableFont },
      { title: "Contraste", id: "contrast", icon: "fa-solid fa-lightbulb", action: this.contrast },
      { title: "Mayúsculas", id: "toUpperCase", icon: "fa-solid fa-font", action: this.toUpperCase },
      { title: "Espacio horizontal", id: "horizontalSpace", icon: "fa-solid fa-arrows-alt-h", action: this.horizontalSpace }
    ];

    // Create and append buttons based on accessibility features
    accessibilityFeatures.forEach(feature => {
      const button = this.createAccessibilityButton(feature.title, feature.id, feature.icon, feature.action);

      // Add event listener to each button to check if any button is active
      button.addEventListener('click', () => {
        this.toggleResetButtonVisibility(resetButton);
      });

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
   * @function toggleResetButtonVisibility
   * @description Shows or hides the reset button depending on whether any button has the 'ag-btn-confirm' class.
   * @param {HTMLElement} resetButton - The reset button element.
   */
  toggleResetButtonVisibility(resetButton) {
    const buttons = document.querySelectorAll('.accessibility-btn');
    let hasActiveButton = false;

    // Check if any button has the 'ag-btn-confirm' class
    buttons.forEach(button => {
      if (button.classList.contains('ag-btn-confirm')) {
        hasActiveButton = true;
      }
    });

    // Show the reset button if any button is active, otherwise hide it
    if (hasActiveButton) {
      resetButton.style.display = 'flex';
    } else {
      resetButton.style.display = 'none';
    }
  }

  /**
   * @function createElement
   * @description Utility method to create an HTML element with specified classes and content.
   * @param {string} tag - The tag name of the element (e.g., 'div', 'h2').
   * @param {string} id - The ID to assign to the element.
   * @param {string} classList - Optional class names to add to the element.
   * @param {string} textContent - Optional inner HTML content for the element.
   * @returns {HTMLElement} - The created HTML element.
   */
  createElement(tag, id = "", classList = "", textContent = "") {
    const element = document.createElement(tag);
    if (id) element.id = id;
    if (classList) element.className = classList;
    if (textContent) element.textContent = textContent;
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
      { class: '', title: "Tamaño de fuente", btnClass: 'ag-btn-secondary' },
      { class: 'font-size18', title: "Tamaño de fuente 18", btnClass: 'ag-btn-confirm' },
      { class: 'font-size20', title: "Tamaño de fuente 20", btnClass: 'ag-btn-confirm' }
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
    fontSizeTitle.textContent = "Tamaño de fuente";
    fontSizeButton.setAttribute('aria-label', "Tamaño de fuente");
    this.fontSizeState = 1;
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
      this.saturationState = 1;
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
      this.saturationState = 1;
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
      { class: '', title: "Saturación", btnClass: 'ag-btn-secondary' },
      { class: 'saturation-colors-low', title: "Saturación Baja", btnClass: 'ag-btn-confirm' },
      { class: 'saturation-colors-high', title: "Saturación Alta", btnClass: 'ag-btn-confirm' }
    ];

    // Determine the current saturation option based on the state
    const { class: classToAdd, title: saturationText, btnClass } = saturationOptions[this.saturationState];
    body.classList.remove('saturation-colors-low', 'saturation-colors-high');

    // Apply the new saturation class if not resetting to normal
    if (classToAdd) {
      body.classList.add(classToAdd);
    }

    // Update UI elements for saturation
    saturationTitle.textContent = saturationText;
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
    this.saturationState = 1;
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
    btnTitle.textContent = buttonText;
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
    btnTitle.textContent = "Seleccionar fuente";
    readableFontBtn.setAttribute('aria-label', "Seleccionar fuente");
    this.fontFamilyState = 1;
  }

  /**
   * @function contrast
   * @description Toggles between different contrast styles by updating CSS variables for primary and secondary colors directly.
   */
  contrast() {
    const contrastButton = document.getElementById("contrast-btn");
    const contrastTitle = document.getElementById("contrast-title");

    // Define the different contrast styles as objects
    const contrastStyles = [
      // Default contrast (no changes)
      {
        '--primary-color': '',
        '--secondary-color': '',
        '--btn-hover-color': '',
        '--text-color': '',
        '--lyr-menu-panel-head-text-color': '',
        '--danger-color': '',
        '--btn-confirm-color': '',
        '--active-bg-color': '',
        '--lyr-menu-bg-color': '',
        '--menu-text-color': '',
        '--menu-text-color-hover': '',
        '--menu-section-hover-color': '',
        '--modal-bg-color': '',
        '--hoverSelect-bg-color': ''
      },
      // Dark contrast
      {
        '--primary-color': '#000000',
        '--secondary-color': '#222222',
        '--btn-hover-color': '#FFFF00',
        '--text-color': '#FFFF00',
        '--lyr-menu-panel-head-text-color': '#FFFF00',
        '--danger-color': '#c62828',
        '--btn-confirm-color': '#006400',
        '--active-bg-color': '#228B22',
        '--lyr-menu-bg-color': '#222222',
        '--menu-text-color': '#FFFF66',
        '--menu-text-color-hover': '#FFFF00',
        '--menu-section-hover-color': '#333333',
        '--modal-bg-color': '#666666ee',
        '--hoverSelect-bg-color': '#333333'
      },
      // Light contrast
      {
        '--primary-color': '#bbbbbb',
        '--secondary-color': '#cccccc',
        '--btn-hover-color': '#000000',
        '--text-color': '#000000',
        '--lyr-menu-panel-head-text-color': '#000000',
        '--danger-color': '#FA8072',
        '--btn-confirm-color': '#3CB371',
        '--active-bg-color': '#33B560',
        '--lyr-menu-bg-color': '#cccccc',
        '--menu-text-color': '#151515',
        '--menu-text-color-hover': '#000000',
        '--menu-section-hover-color': '#f0f0f0',
        '--modal-bg-color': '#aaaaaaee',
        '--hoverSelect-bg-color': '#f0f0f0'
      }
    ];

    // Define the text to display in the button based on the current contrast style
    const contrastTexts = ["Contraste", "Fondo oscuro", "Fondo claro"];

    // Get the :root element to modify CSS variables
    const root = document.documentElement;

    // Update the CSS variables with the selected contrast style
    const selectedStyle = contrastStyles[this.contrastState];
    Object.keys(selectedStyle).forEach(variable => {
      root.style.setProperty(variable, selectedStyle[variable]);
    });

    // Update UI elements for contrast
    const contrastText = contrastTexts[this.contrastState];
    contrastTitle.textContent = contrastText;
    contrastButton.setAttribute('aria-label', contrastText);

    // Update button classes based on the contrast state
    contrastButton.classList.toggle('ag-btn-secondary', this.contrastState === 0);
    contrastButton.classList.toggle('ag-btn-confirm', this.contrastState > 0);

    // Cycle through the contrast styles
    this.contrastState = (this.contrastState + 1) % contrastStyles.length;
  }

  /**
   * @function resetContrast
   * @description Resets all custom CSS variables related to contrast back to their default values.
   */
  resetContrast() {
    const contrastButton = document.getElementById("contrast-btn");
    const contrastTitle = document.getElementById("contrast-title");

    // Get the :root element to reset CSS variables
    const root = document.documentElement;

    // List of all custom CSS variables to reset
    const contrastVariables = [
      '--primary-color',
      '--secondary-color',
      '--btn-hover-color',
      '--text-color',
      '--lyr-menu-panel-head-text-color',
      '--danger-color',
      '--btn-confirm-color',
      '--active-bg-color',
      '--lyr-menu-bg-color',
      '--menu-text-color',
      '--menu-text-color-hover',
      '--menu-section-hover-color',
      '--modal-bg-color',
      '--hoverSelect-bg-color'
    ];

    // Remove each CSS variable from the root element
    contrastVariables.forEach(variable => root.style.removeProperty(variable));

    // Update UI elements for contrast
    contrastTitle.textContent = "Contraste";
    contrastButton.setAttribute('aria-label', "Contraste");

    // Toggle button classes to reflect default contrast state
    contrastButton.classList.remove('ag-btn-confirm');
    contrastButton.classList.add('ag-btn-secondary');

    // Reset the internal contrast state to default (0)
    this.contrastState = 1;
  }

  /**
   * @function toUpperCase
   * @description Toggles between uppercase and normal text for all elements by adding/removing a CSS class on the body.
   */
  toUpperCase() {
    const body = document.body;
    const toUpperCaseButton = document.getElementById("toUpperCase-btn");

    // Check if the body element exists
    if (!body) {
      console.warn("Body element not found. Could not apply uppercase text.");
      return;
    }

    // Toggle the 'uppercase-text' class on the body to apply uppercase styling
    body.classList.toggle('uppercase-text');

    // Update the button's visual state to indicate the text transformation state
    toUpperCaseButton.classList.toggle('ag-btn-confirm');
  }

  /**
   * @function resetToUpperCase
   * @description Resets the text transformation to normal (non-uppercase) by removing the 'uppercase-text' class.
   */
  resetToUpperCase() {
    const body = document.body;
    const toUpperCaseButton = document.getElementById("toUpperCase-btn");

    // Check if the body element exists
    if (!body) {
      console.warn("Body element not found. Could not reset uppercase text.");
      return;
    }

    // Remove the 'uppercase-text' class from the body to reset text to normal
    body.classList.remove('uppercase-text');

    // Update the button's visual state to indicate the reset
    toUpperCaseButton.classList.remove('ag-btn-confirm');
  }

  /**
   * @function horizontalSpace
   * @description Toggles horizontal spacing on the body element by adding/removing a CSS class. 
   */
  horizontalSpace() {
    const body = document.body;
    const horizontalSpaceButton = document.getElementById("horizontalSpace-btn");

    // Check if the body element exists
    if (!body) {
      console.warn("Body element not found. Could not apply horizontal space.");
      return;
    }

    // Check if the button exists
    if (!horizontalSpaceButton) {
      console.warn("Horizontal space button not found.");
      return;
    }

    // Toggle the 'horizontal-space' class on the body to apply horizontal space
    body.classList.toggle('horizontal-space');

    // Update the button's visual state to indicate the state of horizontal space
    horizontalSpaceButton.classList.toggle('ag-btn-confirm');
  }

  /**
   * @function resetHorizontalSpace
   * @description Resets the horizontal spacing by removing the 'horizontal-space' class from the body element. 
   */
  resetHorizontalSpace() {
    const body = document.body;
    const horizontalSpaceButton = document.getElementById("horizontalSpace-btn");

    // Check if the body element exists
    if (!body) {
      console.warn("Body element not found. Could not reset horizontal space.");
      return;
    }

    // Check if the button exists
    if (!horizontalSpaceButton) {
      console.warn("Horizontal space button not found.");
      return;
    }

    // Remove the 'horizontal-space' class from the body to reset horizontal spacing
    body.classList.remove('horizontal-space');

    // Update the button's visual state to indicate the reset
    horizontalSpaceButton.classList.remove('ag-btn-confirm');
  }


  /**
   * @function resetAllAccessibility
   * @description Resets all accessibility-related settings to their default values.
   */
  resetAllAccessibility() {
    this.resetFontSize();            // Resets font size to default
    this.resetInvertColors();        // Resets color inversion to default
    this.resetGreyColors();          // Resets grayscale mode to default
    this.resetSaturationColors();    // Resets color saturation to default
    this.resetReadableFont();        // Resets readable font settings to default
    this.resetContrast();            // Resets contrast settings to default
    this.resetToUpperCase();         // Resets text transformation to default
    this.resetHorizontalSpace();     // Resets horizontal space to default
  }

}
