/**
 * Represents a utility class to get data from various sources.
 */
class DataGetter {
  constructor() {}

  /**
   * Loads the content of a Markdown file from the specified URL and selects the specified lines.
   * @param {string} url - The URL of the Markdown file.
   * @param {number} from - The index of the first line to select.
   * @param {number} to - The index of the last line to select.
   * @returns {Promise<string>} - A promise that resolves with the selected text from the Markdown file.
   */
  async loadMD(url, from, to) {
    const markdown = await this.loadText(url);

    try {
      await appDependencies.load("marked");
      const markedApi = window.marked;
      const parseMarkdown =
        typeof markedApi === "function" ? markedApi : markedApi?.parse;
      if (typeof parseMarkdown !== "function") {
        throw new Error("The Markdown parser is unavailable.");
      }

      const html = parseMarkdown(markdown);
      return html.split("\n").slice(from, to).join("\n");
    } catch (error) {
      console.warn(
        "Unable to load the Markdown parser; using plain content:",
        error,
      );
      return this.renderBasicMarkdown(markdown, to - from);
    }
  }

  renderBasicMarkdown(markdown, limit = Infinity) {
    const escapeHtml = (value) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return markdown
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(
        (block) =>
          block &&
          !/^\[[^\]]+\]:\s+\S+/u.test(block) &&
          !block.startsWith("<img") &&
          !block.startsWith("---") &&
          !block.startsWith("#") &&
          !block.startsWith("[English"),
      )
      .slice(0, limit)
      .map((block) =>
        block
          .replace(/\[([^\]]+)\]\[\]/g, "$1")
          .replace(/\[([^\]]+)\]\[[^\]]+\]/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
      )
      .map((block) => `<p>${escapeHtml(block.replace(/\n/g, " "))}</p>`)
      .join("\n");
  }

  /**
   * Loads a text file without requiring the Markdown parser.
   * @param {string} url - The URL of the text file.
   * @returns {Promise<string>} - A promise that resolves with its raw content.
   */
  async loadText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unable to load "${url}": HTTP ${response.status}.`);
    }
    return response.text();
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
        name: "Acerca",
        id: "load-readme",
      },
      {
        name: "Funciones",
        id: "load-functions",
      } /* ,
      {
        name: 'Colaboradores',
        id: 'load-colaboradores',
      } */,
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

  /* *
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
    this.dataGetter
      .loadText("src/docs/features.md")
      .then((markdown) => {
        const lines = markdown
          .split("\n")
          .map((line) => line.match(/^\s*-\s+(.+)/u)?.[1])
          .filter(Boolean);
        const functionsContainer = document.getElementById(
          "functions-container",
        );
        if (!functionsContainer) return;

        lines.forEach((line, i) => {
          const divFuncion = document.createElement("div");
          divFuncion.classList.add("all-function-div");

          if (i % 2 == 0) {
            divFuncion.classList.add("even-function");
          }

          if (this.getExited != null && parseInt(this.getExited) < i) {
            const indicator = document.createElement("strong");
            indicator.innerHTML = "¡Nuevo! &nbsp;";
            divFuncion.append(indicator, line);
            divFuncion.classList.add("new-function");
            this.waitForElementAndAddNoti("load-functions");
          } else {
            divFuncion.textContent = line;
          }

          functionsContainer.prepend(divFuncion);
        });
        localStorage.setItem("lastFunctionSeen", lines.length - 1);
      })
      .catch((error) => {
        console.error("Error loading the functions list:", error);
      });
  }

  /**
   * Adds the readme content to the readme container.
   */
  addReadmeContent() {
    const innerReadmeText = document.createElement("div");
    innerReadmeText.style.margin = "10px";

    this.dataGetter
      .loadMD(new URL("README.md", document.baseURI).href, 4, 7)
      .then((selectedText) => {
        innerReadmeText.innerHTML = selectedText;
      })
      .catch((error) => {
        console.error("Error loading the About text:", error);
        innerReadmeText.textContent =
          "No se pudo cargar la descripción de Argenmap.";
      });

    let readmeContainer = document.getElementById("readme-container");
    readmeContainer.prepend(innerReadmeText);

    let linkRepo = document.getElementById("link-to-repo");
    linkRepo.addEventListener("click", () => {
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
    const contentToDisplay = document.querySelectorAll(".content-about-tab");
    contentToDisplay.forEach((el) =>
      el.classList.add("content-about-deactivate"),
    );
    contentToDisplay[tabIndex].classList.remove("content-about-deactivate");

    const tabsToDisplay = document.querySelectorAll(".tab");
    tabsToDisplay.forEach((el) => el.classList.remove("tab-active"));
    tabsToDisplay[tabIndex].classList.add("tab-active");
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
   * Añade un punto de notificación al elemento especificado solo si no se mostró antes.
   * @param {string} id - El ID del elemento al que se le agrega el punto de notificación.
   */
  addNoti(id) {
    if (document.getElementById("notification-dot")) return;
    localStorage.setItem("notificationDotShown", "true");
    const target = document.getElementById(id);
    if (target) {
      const dot = document.createElement("div");
      dot.className = "notification-dot";
      dot.id = "notification-dot";
      target.appendChild(dot);
    } else {
      this.waitForElementAndAddNoti(id);
    }
  }

  /**
   * Espera a que el elemento esté en el DOM y luego agrega el punto de notificación.
   * @param {string} id - El ID del elemento objetivo.
   */
  waitForElementAndAddNoti(id) {
    const targetNode = document.getElementById(id);
    if (targetNode) {
      this.addNoti(id);
      return;
    }
    const observer = new MutationObserver((mutations, obs) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.id === id) {
            this.addNoti(id);
            obs.disconnect();
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Verifica si hay funciones nuevas y muestra el dot solo la primera vez que hay un cambio.
   * El dot debe mostrarse si:
   * - No hay lastFunctionSeen en localStorage
   * - O si hay una línea nueva respecto al valor guardado
   */
  check() {
    this.dataGetter
      .loadText("src/docs/features.md")
      .then((markdown) => {
        const featureCount = markdown
          .split("\n")
          .filter((line) => /^\s*-\s+\S/u.test(line)).length;
        const lastFunctionSeen = localStorage.getItem("lastFunctionSeen");
        const notificationDotShown =
          localStorage.getItem("notificationDotShown") === "true";
        const newFunctionIndex = featureCount - 1;
        // Si nunca se guardó lastFunctionSeen o hay una línea nueva
        if (
          lastFunctionSeen === null ||
          parseInt(lastFunctionSeen, 10) < newFunctionIndex
        ) {
          // Solo mostrar el dot si no se mostró para este índice
          if (
            !notificationDotShown ||
            parseInt(lastFunctionSeen, 10) < newFunctionIndex
          ) {
            this.addNoti("developerLogo");
            localStorage.setItem("lastFunctionSeen", newFunctionIndex);
            localStorage.setItem("notificationDotShown", "true");
          }
        }
      })
      .catch((error) => {
        console.error("Error checking the functions list:", error);
      });
  }
}

const modalAboutUs = new AboutUs();
const dataGetter = new DataGetter();

/*
(async function initializeAboutUs() {
    const contributorsData = await dataGetter.fetchData('https://api.github.com/repos/ign-argentina/argenmap/contributors');
    modalAboutUs.contributors = contributorsData;
})();
*/
