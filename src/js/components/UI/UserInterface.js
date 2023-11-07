/**
 * @todo Evaluate using customElements.
 */

class UIComponent extends HTMLElement {
    constructor(options) {
        super();
        const { target, help } = options;
        this.shadow = this.attachShadow({ mode: "open" });
        this._target = target;
        this._help = help;
    }
    /* render() {
        this.shadow.innerHTML = `
        `;
    } */
    /* get help() {
        return { content: "This is a help object" };
    } */

}

class Menu extends UIComponent {
    // returns an empty list with methods for sorting, filter, etc
    constructor() {
        super();
        this._items = items;
        this._groups = groups;
        this._selectedItems = selectedItems;
    }

    addItem(itemOptions) {}

    sortBy(value) {}
    
    onEach(action) {}

    disableAll() {}

    activateAll() {}

    reset() {}

    group(items) {}

}

class BaseLayerMenu extends Menu {
    constructor() {
        super();
    }
    
    addItem(itemOptions) {}
}

class LayerMenu extends Menu {
    constructor() {
        super();
    }

    addItem(itemOptions) {}

    addToSelection(item) {}

    removeFromSelection(item) {}

    removeSelected() { /* this.selectedItems */}

    countItems() {}

    reset() {}

    addGroup() {}

}

class Group extends Menu {
    // returns a item group that is in escence a sub menu 
    // with a label and adding functionality
    constructor() {
        super();
        this._items = items;
        this._label = label;
    }

    set label(text) {}

    get label() { return this._label }

    rename(text) { label = text }

}

class UIItem extends UIComponent {
    // returns a menu item with a label, icon and options button
    constructor() {
        super();
        this._label = label;
        this._icon = icon;
        this._callback = callback;
    }

    // add callback using addEventListener after rendering the instance
}

class Image extends UIComponent {
    // returns an image
    constructor() {
        super();
    }
}
class Label extends UIComponent {
    // returns a label
    constructor() {
        super();
    }
}
class Dialog extends UIComponent {
    // returns an empty dialog with close and custom buttons
    constructor() {
        super();
    }
}
class UITab extends UIComponent {
    // returns a single empty tab with custom text
    constructor() {
        super();
    }
}
class Button extends UIComponent {
    // returns a button with custom text and action triggered by click event
    constructor() {
        super();
    }
}
class Input extends UIComponent {
    // blueprint for input elements
    constructor() {
        super();
    }
}
class InputText extends Input {
    // returns a text input element with custom placeholder and value restrictions if needed
    constructor() {
        super();
    }
}
class InputColor extends Input {
    // returns a color picker element
    constructor() {
        super();
    }
}
class Checkbox extends Input {
    // returns a check input element with custom value and label
    constructor() {
        super();
    }
}

/**
 * Represents the About Us modal in the user interface.
 * @extends UIComponent
 */
class AboutUsModal extends UIComponent {
    constructor() {
        super();
    }

    /**
     * Creates the About Us modal element and appends it to the document body.
     * @param {Array} tabs - The array of tab objects.
     */
    createElement(tabs) {
        const principalContainer = document.createElement("div");
        principalContainer.id = "whole-about";

        const aboutHeader = document.createElement("div");
        aboutHeader.className = "about-header";

        const aboutLogo = document.createElement("img");
        aboutLogo.src = "src/styles/images/argenmap-banner.webp";
        aboutLogo.className = "about-logo";

        const aboutExitBtn = document.createElement("a");
        aboutExitBtn.id = "aboutExitBtn";
        aboutExitBtn.classList = "about-exit";
        aboutExitBtn.innerHTML = '<i class="fa fa-times"></i>';
        aboutExitBtn.onclick = () => {
            const notiDots = document.querySelectorAll(".notification-dot");
            notiDots.forEach((dot) => { dot.remove() });
            principalContainer.remove();
            this.isVisible = false;
        };

        const aboutMainSection = document.createElement("div");
        aboutMainSection.className = "about-main-section";

        const aboutTabsContainer = document.createElement("div");
        aboutTabsContainer.className = "about-tabs-bar";

        aboutHeader.appendChild(aboutLogo);
        aboutHeader.appendChild(aboutExitBtn);

        principalContainer.appendChild(aboutHeader);
        aboutMainSection.appendChild(aboutTabsContainer);
        principalContainer.appendChild(aboutMainSection);

        document.body.appendChild(principalContainer);

        tabs.forEach((tab, i) => {
            const tabItem = new AboutUsTab();
            tabItem.createElement(tab, i);
        });

        const tabContent = new AboutUsTab();

        const readmeContainer = tabContent.createReadmeContainer();
        const functionContainer = tabContent.createFunctionsContainer();
        //const contributorContainer = tabContent.createContributorsContainer();

        aboutMainSection.appendChild(readmeContainer);
        aboutMainSection.appendChild(functionContainer);
        //aboutMainSection.appendChild(contributorContainer);
    }
}

/**
 * Represents the About Us tab in the user interface.
 * @extends UIComponent
 */
class AboutUsTab extends UIComponent {
    constructor() {
        super();
    }

    /**
     * Creates and appends a tab element to the about-tabs-bar container.
     * @param {Object} tab - The tab object containing name and id properties.
     * @param {number} i - The index of the tab.
     */
    createElement(tab, i) {
        const tabElement = document.createElement('div');
        tabElement.classList.add('tab');

        if (tab.name) {
            tabElement.innerHTML = tab.name;
            tabElement.id = tab.id;
        } else {
            tabElement.innerHTML = "TODPN"; // Te Olvidaste De Ponerle Nombre
        }

        tabElement.addEventListener('click', () => {
            modalAboutUs.showTab(i);
        });

        document.querySelector(".about-tabs-bar").appendChild(tabElement);
    }

    /**
     * Creates the readme container element.
     * @returns {HTMLElement} - The created readme container element.
     */
    createReadmeContainer() {
        const readmeContainer = document.createElement('div');
        readmeContainer.classList.add('content-about-tab', 'content-about-deactivate', 'readme-container');
        readmeContainer.id = "readme-container";

        const repoIndication = document.createElement("p");
        repoIndication.textContent = "Repositorio en GitHub";
        repoIndication.style.margin = "0";

        const gitHubMark = document.createElement("img");
        gitHubMark.src = "src/styles/images/github-mark-white.png";
        gitHubMark.alt = "GitHub Logo";
        gitHubMark.style.width = "24px";
        gitHubMark.style.margin = "0 5px";

        const repoDiv = document.createElement("div");
        repoDiv.appendChild(gitHubMark);
        repoDiv.appendChild(repoIndication);
        repoDiv.style.textAlign = "center";
        repoDiv.id = "link-to-repo";

        readmeContainer.appendChild(repoDiv);
        return readmeContainer;
    }

    /**
     * Creates the functions container element.
     * @returns {HTMLElement} - The created functions container element.
     */
    createFunctionsContainer() {
        const functionsContainer = document.createElement('div');
        functionsContainer.classList.add('content-about-tab', 'content-about-deactivate');
        functionsContainer.style.overflow = "auto";
        functionsContainer.id = "functions-container";
        return functionsContainer;
    }

    /**
     * Creates the contributors container element.
     * @returns {HTMLElement} - The created contributors container element.
     
    createContributorsContainer() {
        const contributorContainer = document.createElement('div');
        contributorContainer.classList.add('content-about-tab', 'contributor-container', 'content-about-deactivate');
        contributorContainer.id = "contributors-container";

        return contributorContainer;
    }*/
}
