/**
 * Represents the About Us modal in the user interface.
 * @extends UIComponent
 */
class AboutUsModal {
  constructor() {

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

    aboutMainSection.appendChild(readmeContainer);
    aboutMainSection.appendChild(functionContainer);
  }
}

/**
 * Represents the About Us tab in the user interface.
 * @extends UIComponent
 */
class AboutUsTab {
  constructor() {
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

    const gitHubMark = document.createElement("span");
    gitHubMark.className = "center-flex github-mark";
    gitHubMark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"></path></svg>';
    gitHubMark.alt = "GitHub Logo";

    const repoDiv = document.createElement("button");
    repoDiv.className = "ui-btn ui-btn-primary"
    repoDiv.appendChild(repoIndication);
    repoDiv.appendChild(gitHubMark);
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
}

class InputToggle {
  constructor(parent, type, _onclick, content) {
    this.container = document.getElementById(parent);
    this.render(type, _onclick, content);
  }

  render(type, _onclick, content) {
    const html = `
      <div class="input-group">
        <input id="txtPassword" type="${type}" class="form-control" onchange="this.togglePasswordButton">
        <span class="input-group-btn">
          <button id="show_password" class="btn btn-success" type="button" style="display: none;" onclick="${_onclick}"> 
            <span>${content}</span>
          </button>
        </span>
      </div>
    `;
    this.container.innerHTML = html;
  }


  togglePasswordVisibility() {
    const passwordInput = document.getElementById("txtPassword");
    const eyeIcon = document.getElementById("eye-icon");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    } else {
      passwordInput.type = "password";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    }
  }

  togglePasswordButton() {
    const passwordInput = document.getElementById("txtPassword");
    const showPasswordButton = document.getElementById("show_password");
    console.log("algo");
    if (passwordInput.value.length > 0) {
      showPasswordButton.style.display = "inline-block";
    } else {
      showPasswordButton.style.display = "none";
    }
  }
}
