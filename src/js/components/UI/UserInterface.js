/**
 * @todo Evaluate using customElements.
 */
let batman_URL = "https://media.tenor.com/GvhT-DxYb1IAAAAC/batman-superhero.gif";

class UIComponent{
    constructor() {
        this.element = null;
    }

    createElement(elementType, id, className) {
        const element = document.createElement(elementType);
        if (id) element.id = id;
        if (className) element.className = className;
        return element;
    }

    addTo(id) {
        if (this.element) {
            document.getElementById(id).appendChild(this.element);
        } else {
            console.error('No se ha creado un elemento para agregar.');
        }
    }

    addClass(className) {
        if (this.element) {
            this.element.classList.add(className);
        } else {
            console.error('No se ha creado un elemento al que agregar la clase.');
        }
    }
}


class Menu extends UIComponent {
    // returns an empty list with methods for sorting, filter, etc
    constructor() {
        super();
        this._items = items;
        this._groups = groups;
        this._selectedItems = selectedItems;
    }

    addItem(itemOptions) { }

    sortBy(value) { }

    onEach(action) { }

    disableAll() { }

    activateAll() { }

    reset() { }

    group(items) { }

}

class TabElement extends UIComponent {
    //creates a tab to display a certain part of a modal
    constructor(name, id, className, event) {
        super()
        const tab = document.createElement("div")
        tab.innerHTML = name
        tab.id = id
        tab.className = className

        //There is probably a better way to handle this part, for now it will be the same as the existing one
        if (event && typeof event === 'function') {
            tab.addEventListener('click', event);
        }

        this.element = tab;
    }

}

class Imagen extends UIComponent {

    // returns an image
    constructor(id, src, altTxt, className, title) {
        super();
        const img = document.createElement("img");
        img.id = id;
        img.src = src;
        img.alt = altTxt;
        img.title = title;
        img.classList.add(className);

        this.element = img;
    }
    getRotatedB() {
        this.element.style.transition = "200ms"
        this.element.style.transform = "rotate(180deg)"
    }

}
class Label extends UIComponent {
    // returns a label
    constructor() {
        super();
    }
}
//Probably it will be a better idea to hace an abstract class to handle base map items, because we have the one inside the library and the one in the first "menu" 
class BaseMapItem_1 extends UIComponent{
    //This BaseMapItem builds itself with a large constructor taking all the paremeters needed
    constructor(name, imgSrc, buttonClass, itemOptions){
        super();

        // Create container
        const container = this.createElement('div', null, 'justAnIdea');

        // Create image
        const image = this.createElement('img', null, "imagenClaseSinImaginacion");
        image.src = imgSrc;

        // Create text
        const innerText = this.createElement('span');
        innerText.innerHTML = name;
        innerText.style.width =  "40px"

        // Create button
        const button = this.createElement('button', null, buttonClass);

        // Create options list
        const optionsList = this.createElement('ul'); //mmm ul has sense¿¿
        optionsList.style.listStyleType = 'none';

        this.isVisible = false;
        
        // Toggle options visibility
        button.innerHTML = "!!!"
        button.addEventListener('click', () => {
            this.toggleOptionsVisibility(optionsList);
        });


        itemOptions.forEach((option) => {  //the idea is than for every option it creates a new clikeable "thing"
            const li = this.createElement('li');
            const div = this.createElement('div');

            div.innerHTML = option.label;

            if (option.action && typeof option.action === 'function') {
                div.addEventListener('click', option.action);
            }

            li.appendChild(div);
            optionsList.appendChild(li);
        });

        container.appendChild(image)
        container.appendChild(innerText)
        container.appendChild(button)
        container.appendChild(optionsList)

        this.element = container;
    }

    toggleOptionsVisibility(optionsList) {
        if (this.isVisible) {
            optionsList.style.display = 'none';
            this.isVisible = false;
        } else {
            optionsList.style.display = 'block';
            this.isVisible = true;
        }
    }

}

class BaseMapItem_2 extends UIComponent{
    //This BaseMapItem builds itself with the items already handle by other classes
    constructor(){

    }




}


class Dialog extends UIComponent {
    // returns an empty dialog with close and custom buttons
    constructor() {
        super();
    }
}
class Button extends UIComponent {
    // returns a button with custom text and action triggered by click event
    constructor(id, classList, innerText, clickHandler) {
        super();
        const button = this.createElement("button", id, classList);
        button.innerHTML = innerText;
        button.style.color = "#a380d7";

        if (clickHandler && typeof clickHandler === 'function') {
            button.onclick = clickHandler;
        }

        this.element = button;
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

        const img = new Imagen("hello", batman_URL, "texto alternativo", "especificamenteparaesto", "batman besto hero ever")

        const button = new Button("button-number-one", "hello-kity", "Click me", function () {
            img.getRotatedB();
        })

        const tabElement = new TabElement("TabDePrueba", "idtab", "tab", function () {
            modalAboutUs.showTab(1);
        });

        const options = [
            {
                label: 'Option 1',
                action: () => {
                    console.log('JEJE');
                },
            },
            {
                label: 'Option 2',
                action: () => {
                    console.log('JAJA');
                },
            },
        ];
        
        const mapItem = new BaseMapItem_1('IntentoMap!', batman_URL, 'map-item-button', options);
        
        
        
        tabElement.addTo("readme-container")
        button.addTo("readme-container");
        img.addTo("readme-container")
        
        mapItem.addTo("readme-container");
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
