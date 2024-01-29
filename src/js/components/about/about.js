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
      }
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
  }

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

    this.dataGetter.loadMD(`${window.location.origin+window.location.pathname}/README.md`, 4, 7)
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

const modalAboutUs = new AboutUs();
const dataGetter = new DataGetter();
