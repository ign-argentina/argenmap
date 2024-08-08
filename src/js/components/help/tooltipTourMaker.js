"use strict";
class TooltipTourMaker {
  cont = 0;
  constructor() {
    this.data = {
      welcomeText: "Do you want to take the tour of the page?",
      confirmText: "Yes",
      cancelText: "No",
      backdropColor: "#1b1b1b8e",
      tooltipsBtns: {
        prevBtn: "Previous",
        nextBtn: "Next",
        closeBtn: "Close",
        endBtn: "Finish",
      },
      sequence: [
        {
          element: "#help",
          description: {
            title: "Title",
            text: "Description",
          },
          placement: "left",
        },
      ],
    };
    this.boundArrowsKeyShortcuts = this.arrowsKeyShortcuts.bind(this);
  }

  /**
   * Closes the tooltip helper and performs cleanup actions.
   */
  closeHelp() {
    document.querySelector("body").classList.remove("stop-scroll"); // Remove the "stop-scroll" class from the body element

    document.removeEventListener("keydown", this.boundArrowsKeyShortcuts); // Removes the EventListener for the "keydown" event with the handler function "this.arrowsKeyShortcuts"

    const backdrop = document.getElementById("tooltip-helper-backdrop"); // Find the backdrop element by its ID

    backdrop.remove(); // Remove the backdrop element from the DOM

    this.cont = 0; // Reset the counter

    this.data = {}; // Reset data
  }

  /**
   * Moves to the next or previous tooltip in the sequence based on the given offset.
   * @param {number} secuncyPos - The offset to move in the sequence. Positive for next, negative for previous.
   */
  secuncyPos(secuncyPos) {
    const { sequence } = this.data;
    const currentElement = this.data.sequence[this.cont];

    this.cont += secuncyPos; // Update the counter by adding the offset

    if (currentElement.needClickToOpen) {
      document.querySelector(currentElement.needClickToOpen).click();
    }

    // Check if the counter is within the valid sequence range
    if (this.cont >= 0 && this.cont <= sequence.length - 1) {
      let tour = new Tooltip(this.data, this.cont);
      tour.createTooltip(); // Create the tooltip for the current step in the sequence
    } else {
      document
        .querySelector(sequence[this.cont - 1 * secuncyPos].element)
        .classList.remove("tooltip-helper-active-element"); // Remove the "tooltip-helper-active-element" class from the previous element

      document
        .getElementById("tooltip-helper-backdrop")
        .removeEventListener("click", this.handleBackdropClick); // Remove the event listener for backdrop click

      this.closeHelp(); // Close the tooltip helper
    }
  }

  /**
   * Initializes the tour with the given options.
   * @param {Object} options - The options for the tour.
   */
  initTour(options) {
    this.data = { ...this.data, ...options };

    new Modal(
      this.data.welcomeTitle,
      this.data.welcomeText,
      this.data.confirmText,
      this.data.cancelText,
    );

    // Event listener for cancel button click
    /*     const cancelButton = document.getElementById("initModalBtnCancel");
        cancelButton.addEventListener("click", () => {
          document.getElementById("initModal").remove();
          this.closeHelp();
        }); */

    // Event listener for confirm button click
    const confirmButton = document.getElementById("initModalBtnConfirm");
    confirmButton.addEventListener("click", () => {
      // document.getElementById("initModal").remove();
      const tooltipBackdrop = document.createElement("div");
      tooltipBackdrop.id = "tooltip-helper-backdrop";
      tooltipBackdrop.classList.add("tooltip-helper-backdrop");
      document.querySelector("body").appendChild(tooltipBackdrop);
      this.createSequence(options, this.cont);
    });
  }

  /**
   * Creates the sequence for the tour with the given options.
   * @param {Object} options - The options and elements for the sequence.
   */
  createSequence(options) {
    this.data = { ...this.data, ...options };

    // Add event listener to the tooltip backdrop for click events
    document
      .getElementById("tooltip-helper-backdrop")
      .addEventListener("click", (e) => {
        switch (e.target.id) {
          case "tooltip-helper-next-sequence":
            return this.secuncyPos(1);
          case "tooltip-helper-prev-sequence":
            return this.secuncyPos(-1);
          case "tooltip-helper-end-sequence":
            return this.closeHelp();
          case "tooltip-helper-active":
          case "tooltip-helper-backdrop":
          default:
            return;
        }
      });

    // Add event listeners to handle keyboard arrow keys
    document.addEventListener("keydown", this.boundArrowsKeyShortcuts);

    // Create the tooltip
    let tour = new Tooltip(this.data, this.cont);
    tour.createTooltip();
  }

  /**
   * Handles the keyboard shortcuts for arrow keys.
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  arrowsKeyShortcuts(event) {
    const prevSequence = document.getElementById(
      "tooltip-helper-prev-sequence",
    );

    if (event.key === "ArrowLeft" && !prevSequence.disabled) {
      // Left arrow key
      this.secuncyPos(-1);
    } else if (event.key === "ArrowRight") {
      // Right arrow key
      this.secuncyPos(1);
    }
  }
}

class Modal {
  constructor(title, question, confirmText, cancelText) {
    // Create initialization modal
    const helpTourMenu = document.getElementById("help-tour");
    const initModal = document.createElement("div");
    initModal.id = "initModal";
    initModal.classList.add("initModal");
    initModal.innerHTML = `
            <h3>${title}</h3>
            
            <p>${question}</p>
            <div class="initModalBtn">
                <button id="initModalBtnConfirm" class="ag-btn ag-btn-confirm">${confirmText}</button>
            </div>
            `; //<button id="initModalBtnCancel" class="ag-btn ag-btn-primary">${cancelText}</button>
    helpTourMenu.appendChild(initModal);
  }
}

class Tooltip {
  constructor(data, cont) {
    this.data = data;
    this.cont = cont;
  }

  /**
   * Creates a tooltip based on the current sequence item.
   */
  createTooltip() {
    const { sequence } = this.data; // Get the sequence array
    const element = sequence[this.cont]; // Get the current sequence item
    const { element: elemId, description } = element; // Get the element id and description

    const tooltipContainer = document.getElementById("tooltip-helper-backdrop"); // Get the tooltip container element

    let divPos = { x: 0, y: 0 };
    let arrowPos = { x: 0, y: 0 };
    let getArrowPos = element.placement || "bottom"; // Get the arrow position, default to "bottom"

    // Adjust arrow position for small screens if it's "left" or "right"
    /* if (window.innerWidth <= 400 && (getArrowPos === "left" || getArrowPos === "right")) {
        getArrowPos = "bottom";
    } */

    if (element.needClickToOpen) {
      let elementClick = document.querySelector(element.element);
      let itemClick = document.querySelector(element.needClickToOpen);
      if (elementClick && elementClick.style.display != "block")
        itemClick.click();

      //document.querySelector(element.needClickToOpen).click()
    }

    const item = document.querySelector(elemId); // Get the target element

    document.querySelector("body").classList.add("stop-scroll");
    item.scrollIntoView({ behavior: "smooth", block: "center" });

    const style = getComputedStyle(item); // Get the computed styles of the element
    const itemSize = item.getBoundingClientRect();

    const highlightItem = this.highlightItem(tooltipContainer, itemSize, style);

    const tooltipDiv = this.createTooltipDiv(tooltipContainer, description);

    const helperArrow = this.getHelperArrow(tooltipContainer);

    divPos = this.calculateTooltipPosition(item, tooltipDiv, getArrowPos);

    let divSize = tooltipDiv.getBoundingClientRect();

    // Adjust tooltip position if it exceeds the viewport width
    if (divPos.x + divSize.width >= window.innerWidth) {
      divPos.x = Math.round(window.innerWidth - divSize.width - 10);
    } else if (divPos.x <= 0) {
      divPos.x = 10;
      if (divSize.width >= window.innerWidth) {
        tooltipDiv.style.width = `${window.innerWidth - 2 * divPos.x}px`;
      }
    }

    // Adjust tooltip position if it exceeds the viewport height
    if (divPos.y + divSize.height >= window.innerHeight) {
      divPos.y = Math.round(itemSize.top - divSize.height + 15);
    } else if (divPos.y <= 0) {
      divPos.y = Math.round(itemSize.y - 15);
      if (divSize.height >= window.innerHeight) {
        tooltipDiv.style.height = `${window.innerHeight - 2 * divPos.y}px`;
      }
    }

    tooltipDiv.style.transform = `translate3d(${divPos.x}px, ${divPos.y}px, 0px)`;

    arrowPos = this.getArrowPosition(
      helperArrow,
      getArrowPos,
      divPos,
      highlightItem,
      tooltipDiv,
    );

    helperArrow.style.transform = `translate3d(${arrowPos.x}px, ${arrowPos.y}px, 0px)`;

    if (sequence.events?.on) {
      sequence.events.on(sequence);
    }
  }

  /**
   * Calculates the position for the helper arrow based on arrow position, element positions, and sizes.
   * @param {HTMLElement} helperArrow - The helper arrow element.
   * @param {string} arrowPos - The arrow position ("top", "right", "bottom", "left").
   * @param {DOMRect} divPos - The position and size of the tooltipDiv element.
   * @param {HTMLElement} highlightItem - The highlight item element.
   * @param {HTMLElement} tooltipDiv - The tooltipDiv element.
   * @returns {Object} The position for the helper arrow.
   */
  getArrowPosition(helperArrow, arrowPos, divPos, highlightItem, tooltipDiv) {
    let pos = { x: 0, y: 0 };
    const highlightItemSize = highlightItem.getBoundingClientRect();
    const tooltipDivSize = tooltipDiv.getBoundingClientRect();

    // Set arrow classes and calculate the x and y coordinates for the corrected position
    switch (arrowPos) {
      case "top":
        helperArrow.removeAttribute("class");
        helperArrow.classList.add(
          "tooltip-helper-arrow",
          "tooltip-helper-arrow-down",
        );
        pos.x = Math.round(
          highlightItemSize.x + highlightItemSize.width / 2 - 20,
        );
        pos.y = Math.round(divPos.y + tooltipDivSize.height - 10);
        break;
      case "right":
        helperArrow.removeAttribute("class");
        helperArrow.classList.add(
          "tooltip-helper-arrow",
          "tooltip-helper-arrow-left",
        );
        pos.x = Math.round(divPos.x - 10);
        pos.y = Math.round(
          highlightItemSize.y + highlightItemSize.height / 2 - 20,
        );
        break;
      case "bottom":
        helperArrow.removeAttribute("class");
        helperArrow.classList.add(
          "tooltip-helper-arrow",
          "tooltip-helper-arrow-up",
        );
        pos.x = Math.round(
          highlightItemSize.x + highlightItemSize.width / 2 - 20,
        );
        pos.y = Math.round(divPos.y - 10);
        break;
      case "left":
        helperArrow.removeAttribute("class");
        helperArrow.classList.add(
          "tooltip-helper-arrow",
          "tooltip-helper-arrow-right",
        );
        pos.x = Math.round(divPos.x + tooltipDivSize.width - 10);
        pos.y = Math.round(
          highlightItemSize.y + highlightItemSize.height / 2 - 20,
        );
        break;
      default:
        helperArrow.removeAttribute("class");
        helperArrow.classList.add(
          "tooltip-helper-arrow",
          "tooltip-helper-arrow-up",
        );
        pos.x = Math.round(
          highlightItemSize.x + highlightItemSize.width / 2 - 20,
        );
        pos.y = Math.round(divPos.y - 10);
    }
    return pos;
  }

  /**
   * Creates or retrieves the helper arrow element.
   * @param {HTMLElement} tooltipContainer - The tooltip container element.
   * @returns {HTMLElement} The helper arrow element.
   */
  getHelperArrow(tooltipContainer) {
    let helperArrow = document.querySelector(
      "#tooltip-helper-backdrop #tooltip-helper-arrow",
    );

    // If the helper arrow element does not exist, create it
    if (!helperArrow) {
      helperArrow = document.createElement("div");
      helperArrow.setAttribute("id", "tooltip-helper-arrow");
      tooltipContainer.append(helperArrow);
    }
    return helperArrow;
  }

  /**
   * Creates or retrieves the tooltip div element with the provided description.
   * @param {HTMLElement} tooltipContainer - The tooltip container element.
   * @param {string} description - The description text for the tooltip.
   * @returns {HTMLElement} The tooltip div element.
   */
  createTooltipDiv(tooltipContainer, description) {
    const { sequence } = this.data;
    let descriptionDiv = document.querySelector(
      "#tooltip-helper-backdrop .tooltip-helper-active-description",
    );

    // If the tooltip div element does not exist, create it
    if (!descriptionDiv) {
      descriptionDiv = document.createElement("div");
      descriptionDiv.style.willChange = "transform";
      descriptionDiv.classList.add("tooltip-helper-active-description");
      descriptionDiv.innerHTML = `
            <p id="tooltip-helper-active-description-text"></p>
            <div class="tooltip-helper-footer">
              <button id="tooltip-helper-end-sequence" class="ag-btn ag-btn-primary">${this.data.tooltipsBtns.closeBtn}</button>
              <div>
                <button id="tooltip-helper-prev-sequence" class="ag-btn ag-btn-primary">${this.data.tooltipsBtns.prevBtn}</button>
                <button id="tooltip-helper-next-sequence" class="ag-btn ag-btn-primary ml-2">${this.data.tooltipsBtns.nextBtn}</button>
              </div>
            </div>
          `;
      tooltipContainer.append(descriptionDiv);
    }

    const prevSequence = document.getElementById(
      "tooltip-helper-prev-sequence",
    );
    const nextSequence = document.getElementById(
      "tooltip-helper-next-sequence",
    );

    // Update the previous and next buttons based on the current state
    if (this.cont === 0) {
      prevSequence.setAttribute("disabled", true);
      prevSequence.classList.add("ag-btn-disabled");
      nextSequence.innerText =
        sequence.length === 1
          ? this.data.tooltipsBtns.endBtn
          : this.data.tooltipsBtns.nextBtn;
    } else {
      prevSequence.removeAttribute("disabled", true);
      prevSequence.classList.remove("ag-btn-disabled");
      nextSequence.innerText =
        this.cont === sequence.length - 1
          ? this.data.tooltipsBtns.endBtn
          : this.data.tooltipsBtns.nextBtn;
    }

    document.getElementById(
      "tooltip-helper-active-description-text",
    ).innerHTML =
      `<div><h3>${description.title}</h3><span>${this.cont + 1}/${sequence.length}</span></div><div>${description.text}</div>`; // Set the description text

    return descriptionDiv;
  }

  /**
   * Calculates the position for the tooltip div based on the item, tooltip div, and arrow position.
   * @param {HTMLElement} item - The item element.
   * @param {HTMLElement} tooltipDiv - The tooltip div element.
   * @param {string} arrowPos - The arrow position ("top", "right", "bottom", "left").
   * @returns {Object} The position {x, y} for the tooltip div.
   */
  calculateTooltipPosition(item, tooltipDiv, arrowPos) {
    const itemSize = item.getBoundingClientRect();
    const tooltipDivSize = tooltipDiv.getBoundingClientRect();
    const pos = { x: 0, y: 0 };
    const sizeDifference = tooltipDivSize.width > itemSize.width ? -1 : 1;
    const width = Math.round(
      itemSize.x +
        (sizeDifference * Math.abs(itemSize.width - tooltipDivSize.width)) / 2,
    );

    switch (arrowPos) {
      case "top":
        pos.x = width;
        pos.y = Math.round(itemSize.y - tooltipDivSize.height - 15);
        break;
      case "right":
        pos.x = Math.round(itemSize.x + itemSize.width + 15);
        pos.y = Math.round(
          itemSize.y + itemSize.height / 2 - tooltipDivSize.height / 2,
        );
        break;
      case "bottom":
        pos.x = width;
        pos.y = Math.round(itemSize.y + itemSize.height + 15);
        break;
      case "left":
        pos.x = Math.round(itemSize.x - tooltipDivSize.width - 15);
        pos.y = Math.round(
          itemSize.y + itemSize.height / 2 - tooltipDivSize.height / 2,
        );
        break;
      default:
        pos.x = width;
        pos.y = Math.round(itemSize.y - tooltipDivSize.height - 15);
    }
    return pos;
  }

  /**
   * Creates and highlights an active tooltip item.
   * @param {HTMLElement} tooltipContainer - The tooltip container element.
   * @param {DOMRect} itemSize - The size of the item.
   * @param {CSSStyleDeclaration} style - The computed styles of the item.
   * @returns {HTMLElement} The created and highlighted tooltip item.
   */
  highlightItem(tooltipContainer, itemSize, style) {
    const { backdropColor } = this.data;
    let tooltipActive = document.querySelector(
      "#tooltip-helper-backdrop .tooltip-helper-active",
    ); // Check if an active tooltip item already exists

    // If no active tooltip item exists, create a new one
    if (!tooltipActive) {
      tooltipActive = document.createElement("div");
      tooltipActive.setAttribute("id", "tooltip-helper-active");
      tooltipActive.classList.add("tooltip-helper-active");
      tooltipContainer.append(tooltipActive);
    }

    // Set the position, size, border radius, and box shadow of the tooltip item
    tooltipActive.style.top = Math.round(itemSize.top) + "px";
    tooltipActive.style.left = Math.round(itemSize.left) + "px";
    tooltipActive.style.height = itemSize.height + "px";
    tooltipActive.style.width = itemSize.width + "px";
    tooltipActive.style.borderRadius = style.borderRadius;
    tooltipActive.style.boxShadow = `0 0 0 9999px ${backdropColor}`;

    return tooltipActive;
  }
}
