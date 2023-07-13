class modalAbout {

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
        ]

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
        ]

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

    createModalAbout() {

        /*       const principalContainer = new GeneralWindow;
              principalContainer.render(); */

        const principalContainer = document.createElement("div");
        principalContainer.id = "whole-about"

        const aboutHeader = document.createElement("div");
        aboutHeader.className = "about-header"

        const aboutLogo = document.createElement("img")
        aboutLogo.src = "src/styles/images/argenmap-banner.webp"
        aboutLogo.className = "about-logo"

        const aboutExitBtn = document.createElement("a");
        aboutExitBtn.id = "aboutExitBtn";
        aboutExitBtn.classList = "about-exit";
        aboutExitBtn.innerHTML = '<i class="fa fa-times"></i>';
        aboutExitBtn.onclick = () => {
            principalContainer.remove();
            this.isVisible = false;
        };

        const aboutMainSection = document.createElement("div")
        aboutMainSection.className = "about-main-section"

        const aboutTabsContainer = document.createElement("div");
        aboutTabsContainer.className = "about-tabs-bar"

        
        this.tabs.forEach((tabs, i) => {

            /* const tab = new AboutUsTab;
            tab.add(tabs.name, tab.id) */
            
            const tab = document.createElement('div');

            if (tabs.name) {
                tab.innerHTML = tabs.name;
                tab.id = tabs.id;

            } else { tab.innerHTML = "TODPN" /*Te Olvidaste De Ponerle Nombre*/ }

            tab.classList.add('tab')

            tab.addEventListener('click', function () {
                modalAboutUs.showTab(i);
            })
            aboutTabsContainer.appendChild(tab);
        })

        const readmeContainer = document.createElement('div');
        readmeContainer.classList.add('content-about-tab', 'content-about-deactivate', 'readme-conteiner');
        const innerReadmeText = document.createElement('div');
        innerReadmeText.style.margin = "10px"
        this.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md", 4, 7)
            .then(selectedText => {
                innerReadmeText.innerHTML = selectedText;
            });
        readmeContainer.appendChild(innerReadmeText)


        let repoIndication = document.createElement("p");
        repoIndication.textContent = "Repositorio en GitHub";
        repoIndication.style.margin = "0px";

        let gitHubMark = document.createElement("img");
        gitHubMark.src = "src/styles/images/github-mark-white.png"
        gitHubMark.alt = "GitHub Logo";
        gitHubMark.style = "width: 24px; margin: 0 5px;";

        let repoDiv = document.createElement("div");
        repoDiv.appendChild(gitHubMark);
        repoDiv.appendChild(repoIndication);
        repoDiv.style.textAlign = "center";
        repoDiv.id = "link-to-repo"
        repoDiv.addEventListener('click', function () {
            modalAboutUs.goTo("https://github.com/ign-argentina/argenmap");
        })

        readmeContainer.appendChild(repoDiv);

        const functionsContainer = document.createElement('div');
        functionsContainer.classList.add('content-about-tab', 'content-about-deactivate');
        functionsContainer.style.overflow = "auto";

        this.loadMD("src/docs/features.md", 2, Infinity)
            .then(selectedText => {
                const lines = selectedText.split('\n');
                const lastIndex = lines.length - 4; // Índice de la antepenúltima línea


                lines.forEach((line, i) => {
                    if (i > lastIndex) {
                        localStorage.setItem('lastFunctionSeen', (i - 3));
                        console.log('hola')
                        return; // Ignorar las líneas después de la antepenúltima

                    }
                    const divFuncion = document.createElement('div');
                    divFuncion.innerHTML = line;
                    divFuncion.classList.add('all-function-div')

                    const ImagenDescripcion = document.createElement('img');
                    ImagenDescripcion.src = this.functionsDemostration[i].imgSurce;
                    ImagenDescripcion.classList.add('explanation', 'explanation-hidden');

                    if (i % 2 == 0) {
                        divFuncion.classList.add('even-function')
                    }


                    const bottonn = document.createElement('div');

                    bottonn.innerHTML = "i";
                    bottonn.className = 'bottton';

                    bottonn.addEventListener('click', function () {

                        modalAboutUs.showImg(i);


                    })


                    //primera vez aquí o algún cambio desde la última vez?
                    const getExited = localStorage.getItem('lastFunctionSeen');

                    if ((getExited != null) && (parseInt(getExited) < i)) {

                        divFuncion.classList.add('new-function');

                        modalAboutUs.notificationAdder('load-functions');


                    }


                    functionsContainer.appendChild(divFuncion);
                    functionsContainer.appendChild(ImagenDescripcion);
                });
            });



        const contributorContainer = document.createElement('div');
        contributorContainer.classList.add('content-about-tab', 'contributor-container', 'content-about-deactivate');

        this.contributors.forEach((contributor, i) => {
            const card = document.createElement('div');
            card.className = "contributor-card"
            card.title = "visitar GitHub"
            card.addEventListener('click', function () {
                modalAboutUs.goTo(contributor.url);
            })

            const presentImg = document.createElement('img');
            presentImg.src = contributor.profilePicture;

            const userName = document.createElement('p');
            userName.innerHTML = contributor.name;


            presentImg.className = "contributor-img"
            userName.className = "contributor-user"



            card.appendChild(presentImg);
            card.appendChild(userName);
            contributorContainer.appendChild(card)
        })

        aboutHeader.appendChild(aboutLogo);
        aboutHeader.appendChild(aboutExitBtn);

        principalContainer.appendChild(aboutHeader)

        aboutMainSection.appendChild(aboutTabsContainer)

        principalContainer.appendChild(aboutMainSection)

        aboutMainSection.appendChild(readmeContainer);
        aboutMainSection.appendChild(functionsContainer);
        aboutMainSection.appendChild(contributorContainer);

        document.body.appendChild(principalContainer);
    }

    goTo(urlIndex) {
        window.open(urlIndex, "_blank");
    }

    showTab(tabIndex) {
        const contentToDisplay = document.querySelectorAll('.content-about-tab');
        contentToDisplay.forEach(el => el.classList.add('content-about-deactivate'));
        contentToDisplay[tabIndex].classList.remove('content-about-deactivate');

        const tabsToDisplay = document.querySelectorAll('.tab');
        tabsToDisplay.forEach(el => el.classList.remove('tab-active'));
        tabsToDisplay[tabIndex].classList.add('tab-active');
    }

    showImg(imgIndex) {
        console.log(this.imgInDisplay, this.thereIsAImg);

        if ((imgIndex != this.imgInDisplay) || (this.thereIsAImg == false)) {
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

    loadMD(url, desde, hasta) {
        return fetch(url)
            .then(response => response.text())
            .then(markdown => {
                const html = marked(markdown);
                const lines = html.split('\n');
                const selectedLines = lines.slice(desde, hasta);
                const selectedText = selectedLines.join('\n');

                return selectedText;
            })
            .catch(error => {
                console.error('Error al cargar el archivo Markdown:', error);
            });
    }

    notificationAdder(id) { //toggeler?

        const temporalyNotification = document.createElement("div");
        temporalyNotification.classList.add('notification-dot')

        const termporalyDivToChange = document.getElementById(id)
        termporalyDivToChange.appendChild(temporalyNotification);


    }

}
const modalAboutUs = new modalAbout();