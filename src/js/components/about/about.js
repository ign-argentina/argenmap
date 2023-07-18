/**
 * Represents the About Us section.
 */
class AboutUs {
    constructor() {
        this.imgInDisplay = -1;
        this.thereIsAImg = false;
        this.contributors;
        this.tabs = [
            {
                name: 'Acerca',
                id: 'load-readme',
            },
            {
                name: 'Funciones',
                id: 'load-functions',
            },
            {
                name: 'Colaboradores',
                id: 'load-colaboradores',
            }
        ];
    }

    /**
     * Creates the About Us modal and its content.
     */
    createModalAbout() {
        const principalContainer = new AboutUsModal();
        principalContainer.createElement(this.tabs);

        this.addReadmeContent();
        this.addFunctionsContent();
        this.addContributorsContent();
    }

    /**
     * Adds the contributors content to the contributors container.
     */
    addContributorsContent() {
        this.contributors.forEach((contributor, i) => {
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

    /**
     * Adds the functions content to the functions container.
     */
    addFunctionsContent() {
        this.loadMD("src/docs/features.md", 2, Infinity)
            .then(selectedText => {
                const lines = selectedText.split('\n');
                const lastIndex = lines.length - 4; // Index of the antepenultimate line

                lines.forEach((line, i) => {
                    if (i > lastIndex) {
                        localStorage.setItem('lastFunctionSeen', (i - 3));
                        return; // Ignore lines after the antepenultimate line
                    }

                    const divFuncion = document.createElement('div');
                    divFuncion.innerHTML = line;
                    divFuncion.classList.add('all-function-div');

                    if (i % 2 == 0) {
                        divFuncion.classList.add('even-function');
                    }

                    const getExited = localStorage.getItem('lastFunctionSeen'); //First time here or any change since last time?

                    if ((getExited != null) && (parseInt(getExited) < i)) {
                        divFuncion.classList.add('new-function');
                        this.notificationAdder('load-functions');
                    }

                    const functionsContainer = document.getElementById("functions-container");
                    functionsContainer.appendChild(divFuncion);
                });
            });
    }

    /**
     * Adds the readme content to the readme container.
     */
    addReadmeContent() {
        const innerReadmeText = document.createElement('div');
        innerReadmeText.style.margin = "10px";

        this.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md", 4, 7)
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
    * Fetches the contributors data from the GitHub API.
    * @returns {Promise<Array<Object>>} - A promise that resolves with the contributors data as an array of objects,or null if an error occurs.
    */
    async fetchContributorsData() {
        try {
            const response = await fetch('https://api.github.com/repos/ign-argentina/argenmap/contributors');
            if (!response.ok) {
                throw new Error(`An error has occurred: ${ response.status }`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch GitHub contributors data:', error);
            return null;
        }
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
     * Loads the Markdown file from the specified URL and selects the specified lines.
     * @param {string} url - The URL of the Markdown file.
     * @param {number} from - The index of the first line to select.
     * @param {number} to - The index of the last line to select.
     * @returns {Promise<string>} - A promise that resolves with the selected text.
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
                console.error('Error al cargar el archivo Markdown:', error);
            });
    }

    /**
     * Adds a notification dot to the specified element.
     * @param {string} id - The ID of the element to add the notification dot to.
     */
    notificationAdder(id) {
        const temporaryNotification = document.createElement("div");
        temporaryNotification.classList.add('notification-dot');

        const temporaryDivToChange = document.getElementById(id);
        temporaryDivToChange.appendChild(temporaryNotification);
    }
}

const modalAboutUs = new AboutUs();

(async function initializeAboutUs() {
    const contributorsData = await modalAboutUs.fetchContributorsData();
    modalAboutUs.contributors = contributorsData;
})();

/* modalAboutUs.loadMD("src/docs/features.md", 2, Infinity)
    .then(selectedText => {

    }) */