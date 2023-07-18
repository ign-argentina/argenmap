/**
 * Represents the About Us section.
 */
class AboutUs {
    constructor() {
        this.imgInDisplay = -1;
        this.thereIsAImg = false;
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

        // https://api.github.com/repos/ign-argentina/argenmap/contributors
        this.contributors = [
            {
                name: 'afcirillo96',
                profilePicture: 'https://avatars.githubusercontent.com/u/87725395?v=4',
                url: 'https://github.com/afcirillo96'
            },
            {
                name: 'Zalitoar',
                profilePicture: 'https://avatars.githubusercontent.com/u/3695043?v=4',
                url: 'https://github.com/Zalitoar'
            },

            {
                name: 'daf111',
                profilePicture: 'https://avatars.githubusercontent.com/u/3924657?v=4',
                url: 'https://github.com/daf111'
            },
            {
                name: 'damianlopez',
                profilePicture: 'https://avatars.githubusercontent.com/u/49733149?v=4',
                url: 'https://github.com/damianlopez95'
            },
            {
                name: 'andreazomoza',
                profilePicture: 'https://avatars.githubusercontent.com/u/61470409?v=4',
                url: 'https://github.com/andreazomoza'
            },
            {
                name: 'GSC996',
                profilePicture: 'https://avatars.githubusercontent.com/u/95931791?v=4',
                url: 'https://github.com/GSC996'
            },
            {
                name: 'gvarela1981',
                profilePicture: 'https://avatars.githubusercontent.com/u/9384999?v=4',
                url: 'https://github.com/gvarela1981'
            },
            {
                name: 'yamilvernet',
                profilePicture: 'https://avatars.githubusercontent.com/u/16062027?v=4',
                url: 'https://github.com/yamilvernet'
            },
            {
                name: 'lucasvallejo',
                profilePicture: 'https://avatars.githubusercontent.com/u/47434650?v=4',
                url: 'https://github.com/lucasvallejo'
            },
            {
                name: 'kant',
                profilePicture: 'https://avatars.githubusercontent.com/u/32717?v=4',
                url: 'https://github.com/kant'
            },
            {
                name: 'hcastellaro',
                profilePicture: 'https://avatars.githubusercontent.com/u/39769968?v=4',
                url: 'https://github.com/hcastellaro'
            },
            {
                name: 'InMunken',
                profilePicture: 'https://avatars.githubusercontent.com/u/69722315?v=4',
                url: 'https://github.com/InMunken'
            }
        ];

        this.functionsDemostration = [
            {
                name: "Agregar capas desde servicios WMS y WMTS",
                imgSurce: "src/styles/images/demostrations/Agregar_capas_desde_servicios_WMS.gif",
            },
            {
                name: "Agregar mapas base desde servicios TMS y XYZ",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "Dibujar y descargar geometrías",
                imgSurce: "src/styles/images/demostrations/Dibujar_y_descargar_geometrías.gif",
            },
            {
                name: "Modificar estilo de las geometrías dibujadas",
                imgSurce: "src/styles/images/demostrations/editar_capas_de_geometria.gif",
            },
            {
                name: "Consultar datos de las capas activas con click o usando una geometría como filtro",
                imgSurce: "src/styles/images/demostrations/consultar_datos_de_capa.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/demostrations/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },
            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },

            {
                name: "falalalalala",
                imgSurce: "src/styles/images/gif_500.gif",
            },


        ]
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
                this.goTo(contributor.url);
            });

            const presentImg = document.createElement('img');
            presentImg.src = contributor.profilePicture;

            const userName = document.createElement('p');
            userName.innerHTML = contributor.name;

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

                    /* const ImagenDescripcion = document.createElement('img');
                    ImagenDescripcion.src = this.functionsDemostration[i].imgSurce;
                    ImagenDescripcion.classList.add('explanation', 'explanation-hidden'); */

                    if (i % 2 == 0) {
                        divFuncion.classList.add('even-function');
                    }

                    /* const bottonn = document.createElement('div');
                    bottonn.innerHTML = "i";
                    bottonn.className = 'bottton';
                    bottonn.addEventListener('click', function () {
                        modalAboutUs.showImg(i);
                    }) */

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
     * Shows or hides the specified image.
     * @param {number} imgIndex - The index of the image to show or hide.
     */
    showImg(imgIndex) {
        console.log(this.imgInDisplay, this.thereIsAImg);

        if ((imgIndex != this.imgInDisplay) || (this.thereIsAImg === false)) {
            const imgToDisplay = document.querySelectorAll('.explanation');
            imgToDisplay.forEach(el => el.classList.add('explanation-hidden'));
            imgToDisplay[imgIndex].classList.remove('explanation-hidden');
            this.imgInDisplay = imgIndex;
            this.thereIsAImg = true;
        } else {
            const imgToDisplay = document.querySelectorAll('.explanation');
            imgToDisplay.forEach(el => el.classList.add('explanation-hidden'));
            this.thereIsAImg = false;
        }

        console.log(this, this.thereIsAImg);
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