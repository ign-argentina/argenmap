/**
 * Clase para el control de pantalla completa en el visor Leaflet.
 * Incorpora accesibilidad, manejo de errores y limpieza de recursos.
 * Sincroniza automáticamente con cambios de fullscreen del navegador.
 */
class Fullscreen {
  /**
   * Inicializa el componente de pantalla completa.
   */
  constructor() {
    /**
     * HTML del componente de pantalla completa.
     * @type {string}
     */
    this.component = `
      <a id="iconFS-container" title="Pantalla Completa" role="button" tabindex="0" aria-pressed="false" aria-label="Pantalla completa">
        <i id="iconFS" class="fas fa-expand" aria-hidden="true"></i>
      </a>
    `;
    /**
     * Referencia al elemento del control en el DOM.
     * @type {HTMLElement|null}
     */
    this.elem = null;
    /**
     * Referencia bound del handler de fullscreen change.
     * @type {Function|null}
     */
    this.boundFullscreenChangeHandler = null;
    /**
     * Referencia bound del handler de click.
     * @type {Function|null}
     */
    this.boundClickHandler = null;
    /**
     * Referencia bound del handler de teclado.
     * @type {Function|null}
     */
    this.boundKeyDownHandler = null;
  }

  /**
   * Verifica si el navegador soporta la API de Fullscreen.
   * @returns {boolean}
   * @private
   */
  #isFullscreenSupported() {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }

  /**
   * Crea y agrega el componente al mapa.
   */
  createComponent() {
    try {
      // Verificar soporte de Fullscreen API
      if (!this.#isFullscreenSupported()) {
        console.warn("Fullscreen API no soportada en este navegador");
        return;
      }

      const elem = document.createElement("div");
      elem.className = "leaflet-bar leaflet-control";
      elem.id = "fullscreen";
      elem.innerHTML = this.component;

      // Crear referencias bound para poder removerlas después
      this.boundClickHandler = this.toggleFullScreen.bind(this);
      this.boundKeyDownHandler = this.#onKeyDown.bind(this);
      this.boundFullscreenChangeHandler = this.#onFullscreenChange.bind(this);

      // Accesibilidad: soporte de teclado
      const icon = elem.querySelector("#iconFS-container");
      if (icon) {
        icon.addEventListener("keydown", this.boundKeyDownHandler);
      }
      
      elem.addEventListener("click", this.boundClickHandler);

      // Listener para detectar cambios de fullscreen desde el navegador
      document.addEventListener("fullscreenchange", this.boundFullscreenChangeHandler);
      document.addEventListener("webkitfullscreenchange", this.boundFullscreenChangeHandler);
      document.addEventListener("mozfullscreenchange", this.boundFullscreenChangeHandler);
      document.addEventListener("MSFullscreenChange", this.boundFullscreenChangeHandler);

      const container = document.querySelector(".leaflet-top.leaflet-left");
      if (container) container.append(elem);
      this.elem = elem;

      // Sincronizar estado inicial
      this.#updateUI();
    } catch (e) {
      console.error("Error creando el componente Fullscreen:", e);
    }
  }

  /**
   * Maneja eventos de teclado para accesibilidad.
   * @param {KeyboardEvent} e
   * @private
   */
  #onKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggleFullScreen();
    }
  }

  /**
   * Maneja el evento de cambio de fullscreen del navegador.
   * Sincroniza la UI con el estado real del fullscreen.
   * @private
   */
  #onFullscreenChange() {
    this.#updateUI();
  }

  /**
   * Actualiza la UI según el estado actual de fullscreen.
   * @private
   */
  #updateUI() {
    try {
      const icon = document.querySelector("#iconFS");
      const container = document.getElementById("iconFS-container");
      if (!icon || !container) return;

      // Obtener el estado real del fullscreen (compatible con todos los navegadores)
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (isFullscreen) {
        icon.classList.remove("fa-expand");
        icon.classList.add("fa-compress");
        container.title = "Salir de pantalla completa";
        container.setAttribute("aria-pressed", "true");
        container.setAttribute("aria-label", "Salir de pantalla completa");
      } else {
        icon.classList.remove("fa-compress");
        icon.classList.add("fa-expand");
        container.title = "Pantalla completa";
        container.setAttribute("aria-pressed", "false");
        container.setAttribute("aria-label", "Pantalla completa");
      }
    } catch (e) {
      console.error("Error al actualizar UI de fullscreen:", e);
    }
  }

  /**
   * Alterna el modo de pantalla completa.
   * La UI se actualizará automáticamente mediante el evento fullscreenchange.
   */
  toggleFullScreen() {
    try {
      // Obtener el estado real del fullscreen
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isFullscreen) {
        // Intentar entrar en fullscreen con compatibilidad cross-browser
        const docElm = document.documentElement;
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
        } else if (docElm.webkitRequestFullscreen) {
          docElm.webkitRequestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen();
        }
      } else {
        // Intentar salir de fullscreen con compatibilidad cross-browser
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      // No actualizamos la UI aquí, se hará automáticamente con el evento fullscreenchange
    } catch (e) {
      console.error("Error al alternar pantalla completa:", e);
    }
  }

  /**
   * Limpia los event listeners y recursos del componente.
   * Debe llamarse antes de destruir el componente.
   */
  destroy() {
    try {
      // Remover event listeners
      if (this.elem) {
        const icon = this.elem.querySelector("#iconFS-container");
        if (icon && this.boundKeyDownHandler) {
          icon.removeEventListener("keydown", this.boundKeyDownHandler);
        }
        if (this.boundClickHandler) {
          this.elem.removeEventListener("click", this.boundClickHandler);
        }
      }

      // Remover listeners de fullscreen change
      if (this.boundFullscreenChangeHandler) {
        document.removeEventListener("fullscreenchange", this.boundFullscreenChangeHandler);
        document.removeEventListener("webkitfullscreenchange", this.boundFullscreenChangeHandler);
        document.removeEventListener("mozfullscreenchange", this.boundFullscreenChangeHandler);
        document.removeEventListener("MSFullscreenChange", this.boundFullscreenChangeHandler);
      }

      // Remover elemento del DOM
      if (this.elem && this.elem.parentNode) {
        this.elem.parentNode.removeChild(this.elem);
      }

      // Limpiar referencias
      this.elem = null;
      this.boundFullscreenChangeHandler = null;
      this.boundClickHandler = null;
      this.boundKeyDownHandler = null;
    } catch (e) {
      console.error("Error al destruir el componente Fullscreen:", e);
    }
  }
}
