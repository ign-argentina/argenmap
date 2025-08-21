// Matriz de corrección de color para distintos tipos de daltonismo

const colorBlindnessShaders3 = {
  deuteranomaly: ` 
  void main() {
    vec4 color = texture2D(uTexture0, vTextureCoords);
    mat4 colorMatrix = mat4(
      1.0,  0.0,   0.0,  0.0,  // R
      0.0,  0.65,  0.35, 0.0,  // G (más puro)
      0.0,  0.35,  0.65, 0.0,  // B (menos mezcla con verde)
      0.0,  0.0,   0.0,  1.0
    );
    gl_FragColor = colorMatrix * color;
  }
`,
  protanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
  0.80, 0.20, 0.00, 0.0,  // R: mezcla rojo con verde
  0.30, 0.70, 0.00, 0.0,  // G: leve compensación
  0.00, 0.10, 0.90, 0.0,  // B: casi intacto
  0.00, 0.00, 0.00, 1.0
  );
  gl_FragColor = colorMatrix * color;
}
`,
  tritanomaly: `
void main() {
  vec4 color = texture2D(uTexture0, vTextureCoords);
  mat4 colorMatrix = mat4(
    1.00,  0.00,  0.00, 0.0,  // R: sin cambios
    0.00,  1.05, -0.05, 0.0,  // G: refuerza verde, resta azul
    0.00, -0.10,  1.10, 0.0,  // B: refuerza azul, resta verde
    0.00,  0.00,  0.00, 1.0
  );
  gl_FragColor = colorMatrix * color;
}
`
};

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
    this.lineHeightState = 1; // Rastrea el estado actual del interlineado (0: Predeterminado, 1: 1.5, 2: 2)
    this.colorBlindnessState = 1; // Estado actual del filtro de daltonismo

    // Referencias al mapa y la capa base
    // Initialize the map if not already initialized
    if (!this.map) {
      this.map = mapa; // Replace 'map' with the actual ID of your map container
    }


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
    this.lineHeight = this.lineHeight.bind(this);
    this.resetLineHeight = this.resetLineHeight.bind(this);
    this.applyColorBlindnessFilter = this.applyColorBlindnessFilter.bind(this);
    this.removeColorBlindnessFilter = this.removeColorBlindnessFilter.bind(this);
    this.colorBlindness = this.colorBlindness.bind(this);
    this.resetColorBlindness = this.resetColorBlindness.bind(this);
    this.toggleBigCursor = this.toggleBigCursor.bind(this);
    this.resetBigCursor = this.resetBigCursor.bind(this);

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
      { title: "Alternar fuentes legibles", id: "readableFont", icon: "fa-solid fa-font", action: this.readableFont },
      { title: "Contraste", id: "contrast", icon: "fa-solid fa-lightbulb", action: this.contrast },
      { title: "Mayúsculas", id: "toUpperCase", icon: "fa-solid fa-m", action: this.toUpperCase },
      { title: "Espacio horizontal", id: "horizontalSpace", icon: "fa-solid fa-left-right", action: this.horizontalSpace },
      { title: "Espaciado de líneas", id: "lineHeight", icon: "fa-solid fa-up-down", action: this.lineHeight },
      { title: "Filtros para daltonismo", id: "colorBlindness", icon: "fa-solid fa-eye", action: this.colorBlindness },
      { title: "Cursor grande", id: "bigCursor", icon: "fa-solid fa-mouse-pointer", action: this.toggleBigCursor }
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
    resetButton.style.display = hasActiveButton ? 'flex' : 'none';
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
      element.classList.remove('font-size18', 'font-size20');
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
      { class: '', title: 'Alternar fuentes legibles', btnClass: 'ag-btn-secondary' },
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
        '--lyr-menu-bg-color': '#333333',
        '--menu-text-color': '#FFFF66',
        '--menu-text-color-hover': '#FFFF00',
        '--menu-section-hover-color': '#444444',
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
        '--lyr-menu-bg-color': '#f5f5f5',
        '--menu-text-color': '#151515',
        '--menu-text-color-hover': '#000000',
        '--menu-section-hover-color': '#eeeeee',
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
 * @function lineHeight
 * @description Changes the line height of the specified elements to improve readability.
 */
  lineHeight() {
    const lineHeightElements = document.querySelectorAll(this.fontElements);
    const lineHeightButton = document.getElementById("lineHeight-btn");
    const lineHeightTitle = document.getElementById("lineHeight-title");

    // Define the options for line height
    const lineHeightOptions = [
      { class: '', title: 'Espaciado de líneas', btnClass: 'ag-btn-secondary' },
      { class: 'line-height1-5', title: 'Interlineado 1.5', btnClass: 'ag-btn-confirm' },
      { class: 'line-height2', title: 'Interlineado 2', btnClass: 'ag-btn-confirm' }
    ];

    // Get the current line height option based on the state
    const { class: classToAdd, title: buttonText, btnClass } = lineHeightOptions[this.lineHeightState];

    // Update the line height classes on target elements
    lineHeightElements.forEach((element) => {
      element.classList.remove('line-height1-5', 'line-height2');
      if (classToAdd) {
        element.classList.add(classToAdd);
      }
    });

    // Update the line height title and button aria-label for accessibility
    lineHeightTitle.textContent = buttonText;
    lineHeightButton.setAttribute('aria-label', buttonText);

    // Update button classes for visual indication
    lineHeightButton.classList.remove('ag-btn-secondary', 'ag-btn-confirm');
    lineHeightButton.classList.add(btnClass);

    // Update the line height state to cycle through 0, 1, and 2
    this.lineHeightState = (this.lineHeightState + 1) % lineHeightOptions.length;
  }

  /**
 * @function resetLineHeight
 * @description Reset the line height to the default value.
 */
  resetLineHeight() {
    const lineHeightElements = document.querySelectorAll(this.fontElements);
    const lineHeightButton = document.getElementById("lineHeight-btn");
    const lineHeightTitle = document.getElementById("lineHeight-title");

    lineHeightElements.forEach((element) => {
      element.classList.remove('line-height1-5', 'line-height2');
    });

    lineHeightButton.classList.remove('ag-btn-confirm');
    lineHeightButton.classList.add('ag-btn-secondary');
    lineHeightTitle.textContent = 'Espaciado de líneas';
    lineHeightButton.setAttribute('aria-label', 'Espaciado de líneas');
    this.lineHeightState = 1;
  }

  /**
 * @function applyColorBlindnessFilter
 * @description Aplica un filtro de color para simular diferentes tipos de daltonismo en el mapa.
 * @param {string} type - El tipo de daltonismo ('deuteranomaly', 'protanomaly', 'tritanomaly').
 */
  applyColorBlindnessFilter(type) {
    // Si ya existe una capa de filtro, eliminarla
    if (this.colorFilterLayer) {
      this.map.removeLayer(this.colorFilterLayer);
    }

    // Obtener el shader correspondiente al tipo de daltonismo
    const fragmentShader = colorBlindnessShaders3[type];
    let baseLayerName = gestorMenu.getActiveBasemap();
    let selectedBasemap = baseLayersInfo[baseLayerName];

    // Crear una nueva capa con el shader aplicado
    this.colorFilterLayer = L.tileLayer.gl({
      fragmentShader: fragmentShader,
      tileUrls: [selectedBasemap.host]
    });

    // Ajustar opciones si es necesario
    const zIndex = selectedBasemap && selectedBasemap.options && selectedBasemap.options.zIndex
      ? selectedBasemap.options.zIndex
      : 1;

    this.colorFilterLayer.setZIndex(zIndex);

    // Agregar la capa al mapa
    this.colorFilterLayer.addTo(this.map);
  }

  /**
   * @function removeColorBlindnessFilter
   * @description Elimina el filtro de daltonismo aplicado al mapa.
   */
  removeColorBlindnessFilter() {
    if (this.colorFilterLayer) {
      this.map.removeLayer(this.colorFilterLayer);
      this.colorFilterLayer = null;
    }
  }

  /**
   * @function colorBlindness
   * @description Alterna entre filtros de color para distintos tipos de daltonismo.
   */
  colorBlindness() {
    const colorBlindnessButton = document.getElementById("colorBlindness-btn");
    const colorBlindnessTitle = document.getElementById("colorBlindness-title");

    // Definir los tipos de daltonismo y sus etiquetas
    const types = [
      { type: null, title: 'Filtros para daltonismo', btnClass: 'ag-btn-secondary' },
      { type: 'deuteranomaly', title: 'Deuteranomalía', btnClass: 'ag-btn-confirm' },
      { type: 'protanomaly', title: 'Protanomalía', btnClass: 'ag-btn-confirm' },
      { type: 'tritanomaly', title: 'Tritanomalía', btnClass: 'ag-btn-confirm' }
    ];

    // Obtener el tipo actual basado en el estado
    const { type, title, btnClass } = types[this.colorBlindnessState];

    // Aplicar o eliminar el filtro
    if (type) {
      this.applyColorBlindnessFilter(type);
    } else {
      this.removeColorBlindnessFilter();
    }

    // Actualizar el título y el aria-label
    colorBlindnessTitle.textContent = title;
    colorBlindnessButton.setAttribute('aria-label', title);

    // Actualizar las clases del botón
    colorBlindnessButton.classList.remove('ag-btn-secondary', 'ag-btn-confirm');
    colorBlindnessButton.classList.add(btnClass);

    // Actualizar el estado
    this.colorBlindnessState = (this.colorBlindnessState + 1) % types.length;
  }

  /**
   * @function resetColorBlindness
   * @description Restablece el filtro de daltonismo al valor predeterminado.
   */
  resetColorBlindness() {
    const colorBlindnessButton = document.getElementById("colorBlindness-btn");
    const colorBlindnessTitle = document.getElementById("colorBlindness-title");

    // Eliminar el filtro
    this.removeColorBlindnessFilter();

    // Restablecer el título y el aria-label
    colorBlindnessTitle.textContent = 'Filtros para daltonismo';
    colorBlindnessButton.setAttribute('aria-label', 'Filtros para daltonismo');

    // Restablecer las clases del botón
    colorBlindnessButton.classList.remove('ag-btn-confirm');
    colorBlindnessButton.classList.add('ag-btn-secondary');

    // Restablecer el estado
    this.colorBlindnessState = 1;
  }

  /**
   * @function toggleBigCursor
   * @description Alterna entre el cursor original y un cursor de tamaño doble para accesibilidad.
   */
  toggleBigCursor() {
    const body = document.body;
    const cursorButton = document.getElementById("bigCursor-btn");
    if (!body || !cursorButton) return;

    body.classList.toggle('big-cursor');
    cursorButton.classList.toggle('ag-btn-confirm');
  }

  /**
 * @function resetBigCursor
 * @description Restaura el cursor al tamaño original.
 */
  resetBigCursor() {
    const body = document.body;
    const cursorButton = document.getElementById("bigCursor-btn");
    if (!body || !cursorButton) return;
    body.classList.remove('big-cursor');
    cursorButton.classList.remove('ag-btn-confirm');
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
    this.resetLineHeight();          // Resets line height to default
    this.resetColorBlindness();    // Restablece el filtro de daltonismo
    this.resetBigCursor();        // Resets big cursor to default
  }

}

/*
 * @class GridLayer.GL
 * @inherits GridLayer
 *
 * This `GridLayer` runs some WebGL code on each grid cell, and puts an image
 * with the result back in place.
 *
 * The contents of each cell can be purely synthetic (based only on the cell
 * coordinates), or be based on some remote tiles (used as textures in the WebGL
 * shaders).
 *
 * The fragment shader is assumed to receive two `vec2` attributes, with the CRS
 * coordinates and the texture coordinates: `aCRSCoords` and `aTextureCoords`.
 * If textures are used, they are accesed through the uniforms `uTexture0` through `uTexture7`
 * There will always be four vertices forming two triangles (a quad).
 *
 */

L.TileLayer.GL = L.GridLayer.extend({
  options: {
    // @option tileUrls: Array
    // Array of tile URL templates (as in `L.TileLayer`), between zero and 8 elements. Each URL template will be converted into a plain `L.TileLayer` and pushed in the `tileLayers` option.
    tileUrls: [],

    // @option tileLayers: Array
    // Array of instances of `L.TileLayer` (or its subclasses, like `L.TileLayer.WMS`), between zero and 8 elements.
    tileLayers: [],

    // @option fragmentShader: String
    // A string representing the GLSL fragment shader to be run.
    // This must NOT include defining the variants, nor the texture uniforms,
    // nor user-defined uniforms.
    fragmentShader: "void main(void) {gl_FragColor = vec4(0.2,0.2,0.2,1.0);}",

    // @option uniforms: Object
    // A map of names and initial values for the user-defined uniforms.
    // Values must be `Number` or an `Array` of up to four `Number`s.
    // e.g. `{ uTarget: 2.0, uOffset: [0.0, 5.0] }`.
    uniforms: {},

    subdomains: ["a", "b", "c", "d"],
  },

  // On instantiating the layer, it will initialize all the GL context
  //   and upload the shaders to the GPU, along with the vertex buffer
  //   (the vertices will stay the same for all tiles).
  initialize: function (options) {
    options = L.setOptions(this, options);

    this._renderer = L.DomUtil.create("canvas");
    this._renderer.width = this._renderer.height = options.tileSize;
    this._glError = false;

    var gl = (this._gl =
      this._renderer.getContext("webgl", {
        premultipliedAlpha: false,
      }) ||
      this._renderer.getContext("experimental-webgl", {
        premultipliedAlpha: false,
      }));
    gl.viewportWidth = options.tileSize;
    gl.viewportHeight = options.tileSize;

    // Create `TileLayer`s from the tileUrls option.
    this._tileLayers = Array.from(options.tileLayers);
    for (var i = 0; i < options.tileUrls.length && i < 8; i++) {
      this._tileLayers.push(L.tileLayer(options.tileUrls[i]));
    }

    this._loadGLProgram();

    // Init textures
    this._textures = [];
    for (i = 0; i < this._tileLayers.length && i < 8; i++) {
      this._textures[i] = gl.createTexture();
      gl.uniform1i(gl.getUniformLocation(this._glProgram, "uTexture" + i), i);
    }
  },

  // @method getGlError(): String|undefined
  // If there was any error compiling/linking the shaders, returns a string
  // with information about that error. If there was no error, returns `undefined`.
  getGlError: function () {
    return this._glError;
  },

  _loadGLProgram: function () {
    var gl = this._gl;

    // Force using this vertex shader.
    // Just copy all attributes to predefined variants and set the vertex positions
    var vertexShaderCode =
      "attribute vec2 aVertexCoords;  " +
      "attribute vec2 aTextureCoords;  " +
      "attribute vec2 aCRSCoords;  " +
      "attribute vec2 aLatLngCoords;  " +
      "varying vec2 vTextureCoords;  " +
      "varying vec2 vCRSCoords;  " +
      "varying vec2 vLatLngCoords;  " +
      "void main(void) {  " +
      "	gl_Position = vec4(aVertexCoords , 1.0, 1.0);  " +
      "	vTextureCoords = aTextureCoords;  " +
      "	vCRSCoords = aCRSCoords;  " +
      "	vLatLngCoords = aLatLngCoords;  " +
      "}";

    // Force using this bit for the fragment shader. All fragment shaders
    // will use the same predefined variants, and
    var fragmentShaderHeader =
      "precision highp float;\n" +
      "uniform float uNow;\n" +
      "uniform vec3 uTileCoords;\n" +
      "varying vec2 vTextureCoords;\n" +
      "varying vec2 vCRSCoords;\n" +
      "varying vec2 vLatLngCoords;\n";

    for (var i = 0; i < this._tileLayers.length && i < 8; i++) {
      fragmentShaderHeader += "uniform sampler2D uTexture" + i + ";\n";
    }

    fragmentShaderHeader += this._getUniformSizes();

    var program = (this._glProgram = gl.createProgram());
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.shaderSource(fragmentShader, fragmentShaderHeader + this.options.fragmentShader);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // @event shaderError
    // Fired when there was an error creating the shaders.
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      this._glError = gl.getShaderInfoLog(vertexShader);
      console.error(this._glError);
      return null;
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      this._glError = gl.getShaderInfoLog(fragmentShader);
      console.error(this._glError);
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // There will be four vec2 vertex attributes per vertex:
    // aVertexCoords (always from -1 to +1), aTextureCoords (always from 0 to +1),
    // aLatLngCoords and aCRSCoords (both geographical and per-tile).
    this._aVertexPosition = gl.getAttribLocation(program, "aVertexCoords");
    this._aTexPosition = gl.getAttribLocation(program, "aTextureCoords");
    this._aCRSPosition = gl.getAttribLocation(program, "aCRSCoords");
    this._aLatLngPosition = gl.getAttribLocation(program, "aLatLngCoords");

    this._initUniforms(program);

    // If the shader is time-dependent (i.e. animated), or has custom uniforms,
    // init the texture cache
    if (this._isReRenderable) {
      this._fetchedTextures = {};
      this._2dContexts = {};
    }

    // 		console.log('Tex position: ', this._aTexPosition);
    // 		console.log('CRS position: ', this._aCRSPosition);
    // 		console.log("uNow position: ", this._uNowPosition);

    // Create three data buffer with 8 elements each - the (easting,northing)
    // CRS coords, the (s,t) texture coords and the viewport coords for each
    // of the 4 vertices
    // Data for the texel and viewport coords is totally static, and
    // needs to be declared only once.
    this._CRSBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._CRSBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(8), gl.STATIC_DRAW);
    if (this._aCRSPosition !== -1) {
      gl.enableVertexAttribArray(this._aCRSPosition);
      gl.vertexAttribPointer(this._aCRSPosition, 2, gl.FLOAT, false, 8, 0);
    }

    this._LatLngBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._LatLngBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(8), gl.STATIC_DRAW);
    if (this._aLatLngPosition !== -1) {
      gl.enableVertexAttribArray(this._aLatLngPosition);
      gl.vertexAttribPointer(this._aLatLngPosition, 2, gl.FLOAT, false, 8, 0);
    }

    this._TexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._TexCoordsBuffer);

    // prettier-ignore
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      1.0, 0.0,
      0.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ]), gl.STATIC_DRAW);
    if (this._aTexPosition !== -1) {
      gl.enableVertexAttribArray(this._aTexPosition);
      gl.vertexAttribPointer(this._aTexPosition, 2, gl.FLOAT, false, 8, 0);
    }

    this._VertexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._VertexCoordsBuffer);

    // prettier-ignore
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      1, 1,
      -1, 1,
      1, -1,
      -1, -1
    ]), gl.STATIC_DRAW);
    if (this._aVertexPosition !== -1) {
      gl.enableVertexAttribArray(this._aVertexPosition);
      gl.vertexAttribPointer(this._aVertexPosition, 2, gl.FLOAT, false, 8, 0);
    }
  },

  // Looks at the size of the default values given for the uniforms.
  // Returns a string valid for defining the uniforms in the shader header.
  _getUniformSizes() {
    var defs = "";
    this._uniformSizes = {};
    for (var uniformName in this.options.uniforms) {
      var defaultValue = this.options.uniforms[uniformName];
      if (typeof defaultValue === "number") {
        this._uniformSizes[uniformName] = 0;
        defs += "uniform float " + uniformName + ";\n";
      } else if (defaultValue instanceof Array) {
        if (defaultValue.length > 4) {
          throw new Error("Max size for uniform value is 4 elements");
        }
        this._uniformSizes[uniformName] = defaultValue.length;
        if (defaultValue.length === 1) {
          defs += "uniform float " + uniformName + ";\n";
        } else {
          defs += "uniform vec" + defaultValue.length + " " + uniformName + ";\n";
        }
      } else {
        throw new Error(
          "Default value for uniforms must be either number or array of numbers"
        );
      }
    }
    return defs;
  },

  // Inits the uNow uniform, and the user-provided uniforms, given the current GL program.
  // Sets the _isReRenderable property if there are any set uniforms.
  _initUniforms(program) {
    var gl = this._gl;
    this._uTileCoordsPosition = gl.getUniformLocation(program, "uTileCoords");
    this._uNowPosition = gl.getUniformLocation(program, "uNow");
    this._isReRenderable = false;

    if (this._uNowPosition) {
      gl.uniform1f(this._uNowPosition, performance.now());
      this._isReRenderable = true;
    }

    this._uniformLocations = {};
    for (var uniformName in this.options.uniforms) {
      this._uniformLocations[uniformName] = gl.getUniformLocation(program, uniformName);
      this.setUniform(uniformName, this.options.uniforms[uniformName]);
      this._isReRenderable = true;
    }
  },

  // This is called once per tile - uses the layer's GL context to
  //   render a tile, passing the complex space coordinates to the
  //   GPU, and asking to render the vertexes (as triangles) again.
  // Every pixel will be opaque, so there is no need to clear the scene.
  _render: function (coords) {
    var gl = this._gl;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.5, 0.5, 0.5, 0);
    gl.enable(gl.BLEND);

    var tileBounds = this._tileCoordsToBounds(coords);
    var west = tileBounds.getWest(),
      east = tileBounds.getEast(),
      north = tileBounds.getNorth(),
      south = tileBounds.getSouth();

    // Create data array for LatLng buffer
    // prettier-ignore
    var latLngData = [
      // Vertex 0
      east, north,

      // Vertex 1
      west, north,

      // Vertex 2
      east, south,

      // Vertex 3
      west, south,
    ];

    // ...upload them to the GPU...
    gl.bindBuffer(gl.ARRAY_BUFFER, this._LatLngBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(latLngData), gl.STATIC_DRAW);

    // ...also create data array for CRS buffer...
    // Kinda inefficient, but doesn't look performance-critical
    var crs = this._map.options.crs,
      min = crs.project(L.latLng(south, west)),
      max = crs.project(L.latLng(north, east));

    // prettier-ignore
    var crsData = [
      // Vertex 0
      max.x, max.y,

      // Vertex 1
      min.x, max.y,

      // Vertex 2
      max.x, min.y,

      // Vertex 3
      min.x, min.y,
    ];

    // ...and also upload that to the GPU...
    gl.bindBuffer(gl.ARRAY_BUFFER, this._CRSBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(crsData), gl.STATIC_DRAW);

    // ...and also set the uTileCoords uniform for this tile
    gl.uniform3f(this._uTileCoordsPosition, coords.x, coords.y, coords.z);

    // ... and then the magic happens.
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  },

  _bindTexture: function (index, imageData) {
    // Helper function. Binds a ImageData (HTMLImageElement, HTMLCanvasElement or
    // ImageBitmap) to a texture, given its index (0 to 7).
    // The image data is assumed to be in RGBA format.
    var gl = this._gl;

    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, this._textures[index]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
  },

  // Gets called by L.GridLayer before createTile(), just before coord wrapping happens.
  // Needed to store the context of each <canvas> tile when the tile coords is wrapping.
  _addTile(coords, container) {
    // This is quite an ugly hack, but WTF.
    this._unwrappedKey = this._tileCoordsToKey(coords);
    L.GridLayer.prototype._addTile.call(this, coords, container);
  },

  createTile: function (coords, done) {
    var tile = L.DomUtil.create("canvas", "leaflet-tile");
    tile.width = tile.height = this.options.tileSize;
    tile.onselectstart = tile.onmousemove = L.Util.falseFn;

    var ctx = tile.getContext("2d");
    var unwrappedKey = this._unwrappedKey;
    var texFetches = [];
    for (var i = 0; i < this._tileLayers.length && i < 8; i++) {
      // 				this.options.tileUrls[i]
      texFetches.push(this._getNthTile(i, coords));
    }

    Promise.all(texFetches).then(
      function (textureImages) {
        if (!this._map) {
          return;
        }
        // If the shader is time-dependent (i.e. animated),
        // save the textures for later access
        if (this._isReRenderable) {
          var key = this._tileCoordsToKey(coords);
          this._fetchedTextures[key] = textureImages;
          this._2dContexts[unwrappedKey] = ctx;
        }

        var gl = this._gl;
        for (var i = 0; i < this._tileLayers.length && i < 8; i++) {
          this._bindTexture(i, textureImages[i]);
        }

        this._render(coords);
        ctx.drawImage(this._renderer, 0, 0);
        done();
      }.bind(this),
      function (err) {
        L.TileLayer.prototype._tileOnError.call(this, done, tile, err);
      }.bind(this)
    );

    return tile;
  },

  _removeTile: function (key) {
    if (this._isReRenderable) {
      delete this._fetchedTextures[key];
      delete this._2dContexts[key];
    }
    L.TileLayer.prototype._removeTile.call(this, key);
  },

  onAdd: function () {
    // If the shader is time-dependent (i.e. animated), start an animation loop.
    if (this._uNowPosition) {
      L.Util.cancelAnimFrame(this._animFrame);
      this._animFrame = L.Util.requestAnimFrame(this._onFrame, this);
    }
    L.TileLayer.prototype.onAdd.call(this);
  },

  onRemove: function (map) {
    // Stop the animation loop, if any.
    L.Util.cancelAnimFrame(this._animFrame);
    L.TileLayer.prototype.onRemove.call(this, map);
  },

  _onFrame: function () {
    if (this._uNowPosition && this._map) {
      this.reRender();
      this._animFrame = L.Util.requestAnimFrame(this._onFrame, this, false);
    }
  },

  // Runs the shader (again) on all tiles
  reRender: function () {
    if (!this._isReRenderable) { return; }
    var gl = this._gl;

    gl.uniform1f(this._uNowPosition, performance.now());

    for (var key in this._tiles) {
      var tile = this._tiles[key];
      var coords = this._keyToTileCoords(key);
      var wrappedKey = this._tileCoordsToKey(this._wrapCoords(coords));

      if (!tile.current || !tile.loaded || !this._fetchedTextures[wrappedKey]) {
        continue;
      }

      for (var i = 0; i < this._tileLayers.length && i < 8; i++) {
        this._bindTexture(i, this._fetchedTextures[wrappedKey][i]);
      }
      this._render(coords);

      this._2dContexts[key].drawImage(this._renderer, 0, 0);
    }
  },

  // Sets the value(s) for a uniform.
  setUniform(name, value) {
    switch (this._uniformSizes[name]) {
      case 0:
        this._gl.uniform1f(this._uniformLocations[name], value);
        break;
      case 1:
        this._gl.uniform1fv(this._uniformLocations[name], value);
        break;
      case 2:
        this._gl.uniform2fv(this._uniformLocations[name], value);
        break;
      case 3:
        this._gl.uniform3fv(this._uniformLocations[name], value);
        break;
      case 4:
        this._gl.uniform4fv(this._uniformLocations[name], value);
        break;
    }
  },

  // Gets the tile for the Nth `TileLayer` in `this._tileLayers`,
  // for the given tile coords, returns a promise to the tile.
  _getNthTile: function (n, coords) {
    var layer = this._tileLayers[n];
    // Monkey-patch a few things, both for TileLayer and TileLayer.WMS
    layer._tileZoom = this._tileZoom;
    layer._map = this._map;
    layer._crs = this._map.options.crs;
    layer._globalTileRange = this._globalTileRange;
    return new Promise(
      function (resolve, reject) {
        var tile = document.createElement("img");
        tile.crossOrigin = "";
        tile.src = layer.getTileUrl(coords);
        L.DomEvent.on(tile, "load", resolve.bind(this, tile));
        L.DomEvent.on(tile, "error", reject.bind(this, tile));
      }.bind(this)
    );
  },
});

L.tileLayer.gl = function (opts) {
  return new L.TileLayer.GL(opts);
};