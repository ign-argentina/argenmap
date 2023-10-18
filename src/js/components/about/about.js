/**
 * Represents a utility class to get data from various sources.
 */
class DataGetter {
    constructor() {
    }

    /**
     * Loads the content of a Markdown file from the specified URL and selects the specified lines.
     * @param {string} url - The URL of the Markdown file.
     * @param {number} from - The index of the first line to select.
     * @param {number} to - The index of the last line to select.
     * @returns {Promise<string>} - A promise that resolves with the selected text from the Markdown file.
     */
    loadMD(url, from, to) {
        return fetch(url)
            .then(response => response.text())
            .then(markdown => {
                const html = marked(markdown);
                const lines = html.split('\n');
                const selectedLines = lines.slice(from, to);
                const selectedText = selectedLines.join('\n');
                return selectedText;
            })
            .catch(error => {
                console.error('Error loading the Markdown file:', error);
            });
    }

    /**
     * Fetches data from the specified source URL using the fetch API.
     * @param {string} source - The URL of the data source.
     * @returns {Promise<any>} - A promise that resolves with the fetched data or null if an error occurs.
     */
    async fetchData(source) {
        try {
            const response = await fetch(source);

            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Failed to fetch data from ${source}:`, error);
            return null;
        }
    }

}

/**
 * Represents the About Us section.
 */
class AboutUs {
    constructor() {
        this.imgInDisplay = -1;
        this.thereIsAImg = false;
        this.contributors = [];
        this.tabs = [
            {
                name: 'Acerca',
                id: 'load-readme',
            },
            {
                name: 'Funciones',
                id: 'load-functions',
            } /*,
            {
                name: 'Colaboradores',
                id: 'load-colaboradores',
            }*/
        ];
        this.dataGetter = new DataGetter();
        this.check();
    }

    /**
     * Creates the About Us modal and its content.
     */
    createModalAbout() {
        const principalContainer = new AboutUsModal();
        principalContainer.createElement(this.tabs);

        this.addReadmeContent();
        this.addFunctionsContent();
        //this.addContributorsContent();
    }

    /**
     * Adds the contributors content to the contributors container.
    
    addContributorsContent() {
        this.contributors.sort((a, b) => a.login.localeCompare(b.login));
        this.contributors.forEach((contributor, i) => {
            if (contributor.login.toLowerCase() === "dependabot[bot]") {
                return;
            }
            const card = document.createElement('div');
            card.className = "contributor-card";
            card.title = "Visitar GitHub";
            card.addEventListener('click', () => {
                this.goTo(contributor.html_url);
            });

            const presentImg = document.createElement('img');
            presentImg.src = contributor.avatar_url;

            const userName = document.createElement('p');
            userName.innerHTML = contributor.login;

            presentImg.className = "contributor-img";
            userName.className = "contributor-user";

            card.appendChild(presentImg);
            card.appendChild(userName);

            const contributorContainer = document.getElementById("contributors-container");
            contributorContainer.appendChild(card);
        });
    }
     */

    /**
     * Adds the functions content to the functions container.
     */
    addFunctionsContent() {
        this.dataGetter.loadMD("src/docs/features.md", 2, Infinity)
            .then(selectedText => {
                const lines = selectedText.split('\n');
                const lastIndex = lines.length - 4; // Index of the antepenultimate line

                lines.forEach((line, i) => {
                    if (i > lastIndex) {
                        localStorage.setItem('lastFunctionSeen', (i - 3));
                        return; // Ignore lines after the antepenultimate line
                    }

                    const divFuncion = document.createElement('div');
                    divFuncion.classList.add('all-function-div');

                    if (i % 2 == 0) {
                        divFuncion.classList.add('even-function');
                    }

                    if ((this.getExited != null) && (parseInt(this.getExited) < i)) {
                        divFuncion.innerHTML = `<strong>¡Nuevo! &nbsp;</strong> ${line}`;
                        divFuncion.classList.add('new-function');
                        this.waitForElementAndAddNoti('load-functions');
                    } else {
                        divFuncion.innerHTML = line;
                    }

                    const functionsContainer = document.getElementById("functions-container");
                    functionsContainer.prepend(divFuncion);
                });
            });
    }

    /**
     * Adds the readme content to the readme container.
     */
    addReadmeContent() {
        const innerReadmeText = document.createElement('div');
        innerReadmeText.style.margin = "10px";

        this.dataGetter.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md", 4, 7)
            .then(selectedText => {
                innerReadmeText.innerHTML = selectedText;
            });

        let readmeContainer = document.getElementById("readme-container");
        readmeContainer.prepend(innerReadmeText);

        let linkRepo = document.getElementById("link-to-repo");
        linkRepo.addEventListener('click', () => {
            this.goTo("https://github.com/ign-argentina/argenmap");
        });
    }

    /**
     * Navigates to the specified URL.
     * @param {string} url - The URL to navigate to.
     */
    goTo(url) {
        window.open(url, "_blank");
    }

    /**
     * Shows the specified tab.
     * @param {number} tabIndex - The index of the tab to show.
     */
    showTab(tabIndex) {
        const contentToDisplay = document.querySelectorAll('.content-about-tab');
        contentToDisplay.forEach(el => el.classList.add('content-about-deactivate'));
        contentToDisplay[tabIndex].classList.remove('content-about-deactivate');

        const tabsToDisplay = document.querySelectorAll('.tab');
        tabsToDisplay.forEach(el => el.classList.remove('tab-active'));
        tabsToDisplay[tabIndex].classList.add('tab-active');
    }

    /**
     * Toggles the visibility of the About Us modal.
     */
    toggleOpen() {
        if (!this.isVisible) {
            this.createModalAbout();
            this.showTab(0);
            this.isVisible = true;
        } else {
            const aboutPopup = document.getElementById("whole-about");
            if (aboutPopup) {
                aboutPopup.remove();
            }
            this.isVisible = false;
        }
    }

    /**
     * Adds a notification dot to the specified element.
     * @param {string} id - The ID of the element to add the notification dot to.
     */
    addNoti(id) {
        const temporaryNotification = document.createElement("div");
        temporaryNotification.classList.add('notification-dot');
        temporaryNotification.id = "notification-dot";

        const temporaryDivToChange = document.getElementById(id);
        if (temporaryDivToChange) {
            temporaryDivToChange.appendChild(temporaryNotification);
        } else {
            this.waitForElementAndAddNoti(id)
        }
    }

    /**
     * Waits for the specified element to appear and adds a notification dot to it.
     * @param {string} id - The ID of the element to wait for and add the notification dot to.
     */
    waitForElementAndAddNoti(id) {
        const targetNode = document.getElementById(id);
        if (targetNode) {
            this.addNoti(id);
        } else {
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (const addedNode of mutation.addedNodes) {
                            if (addedNode.id === id) {
                                this.addNoti(id);
                                observer.disconnect();
                                break;
                            }
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    /**
     * Checks if there are new functions and adds a notification dot if necessary.
     */
    check() {
        this.dataGetter.loadMD("src/docs/features.md", 2, Infinity)
            .then(selectedText => {
                const lines = selectedText.split('\n');
                const lastIndex = lines.length - 4; // Index of the antepenultimate line

                lines.forEach((line, i) => {
                    if (i > lastIndex) {
                        localStorage.setItem('lastFunctionSeen', (i - 3));
                        return; // Ignore lines after the antepenultimate line
                    }
                    this.getExited = localStorage.getItem('lastFunctionSeen'); //First time here or any change since last time?

                    if ((this.getExited != null) && (parseInt(this.getExited) < i)) {
                        this.addNoti('developerLogo');
                    }
                });
            });
    }
}

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

        //const mapItem = new BaseMapItem('IntentoMap!', batman_URL, 'map-item-button', options);

        /* const input = new Input("aynidid", "no-clase", "color")
        
        // Crear un elemento de tipo color picker
        const textInput = new InputText('textID', 'text-input-class', 'Placeholder     ');
        // Crear un elemento de tipo checkbox con etiqueta personalizada
        const checkbox = new Checkbox('checkboxInput', 'checkbox-input-class', 'Acepto los términos y condiciones');
        
        // Agregar los elementos al documento
        checkbox.addTo("readme-container");
        
        tabElement.addTo("readme-container")
        img.addTo("readme-container");
        textInput.addTo("readme-container")
        mapItem.addTo("readme-container");
        
        input.addTo("readme-container") */
        const button = new Button("button-number-one", "hello-kitty", null, "Click me", function () {
            console.log(colorInput.whatColor());
        })
        button.addTo("readme-container");

        const colorInput = new InputColor('colorInput', 'color-input-class');
        colorInput.addTo("readme-container");


        const buttoncolor = new Button("button-nuber-two", null, "hello-devil", "Change color to white", function () {
            colorInput.changeValue('#ffffff');
        })
        buttoncolor.removeStyle();
        buttoncolor.addTo("readme-container");

        const colorPicker = new ColorPicker("hello-petter", "outLinedos")
        colorPicker.addTo('readme-container')
        colorPicker.createModal();




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


const modalAboutUs = new AboutUs();
const dataGetter = new DataGetter();

/*
(async function initializeAboutUs() {
    const contributorsData = await dataGetter.fetchData('https://api.github.com/repos/ign-argentina/argenmap/contributors');
    modalAboutUs.contributors = contributorsData;
})();
*/


