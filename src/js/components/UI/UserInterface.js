class UserInterface {
    constructor() {

    }

    createElement() {

    }

    remove() {

    }

}

class AboutUsModal extends UserInterface {
    constructor() {
        super()
    }

    createElement() {
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

        aboutHeader.appendChild(aboutLogo);
        aboutHeader.appendChild(aboutExitBtn);

        principalContainer.appendChild(aboutHeader)

        aboutMainSection.appendChild(aboutTabsContainer)

        principalContainer.appendChild(aboutMainSection)

        /* aboutMainSection.appendChild(readmeContainer);
        aboutMainSection.appendChild(functionsContainer);
        aboutMainSection.appendChild(contributorContainer); */

        document.body.appendChild(principalContainer);
    }

}

class AboutUsTab extends UserInterface {
    constructor() {
        super()
    }

    createElement(tab, i) {
        const tabElemt = document.createElement('div');
        if (tab.name) {
            tabElemt.innerHTML = tab.name;
            tabElemt.id = tab.id;

        } else { tabElemt.innerHTML = "TODPN" } //Te Olvidaste De Ponerle Nombre

        tabElemt.classList.add('tab')

        tabElemt.addEventListener('click', function () {
            modalAboutUs.showTab(i);
        })
        document.querySelector(".about-tabs-bar").appendChild(tabElemt);
    }

}

class NotificationPoint extends UserInterface {
    constructor() {

    }
}
