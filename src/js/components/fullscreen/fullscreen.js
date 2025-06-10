/**
 * Clase para el control de pantalla completa en el visor Leaflet.
 * Incorpora accesibilidad, manejo de errores y limpieza de recursos.
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
     * Referencia a los listeners para limpieza.
     * @type {Array<{el:HTMLElement,type:string,fn:Function}>}
     */
    this.handlers = [];
  }

  /**
   * Crea y agrega el componente al mapa.
   */
  createComponent() {
    try {
      const elem = document.createElement("div");
      elem.className = "leaflet-bar leaflet-control";
      elem.id = "fullscreen";
      elem.innerHTML = this.component;
      // Accesibilidad: soporte de teclado
      const icon = elem.querySelector('#iconFS-container');
      if (icon) {
        icon.addEventListener('keydown', this.#onKeyDown.bind(this));
        this.handlers.push({el: icon, type: 'keydown', fn: this.#onKeyDown.bind(this)});
      }
      elem.onclick = this.toggleFullScreen.bind(this);
      this.handlers.push({el: elem, type: 'click', fn: elem.onclick});
      const container = document.querySelector(".leaflet-top.leaflet-left");
      if (container) container.append(elem);
      this.elem = elem;
    } catch (e) {
      console.error('Error creando el componente Fullscreen:', e);
    }
  }

  /**
   * Maneja eventos de teclado para accesibilidad.
   * @param {KeyboardEvent} e
   * @private
   */
  #onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.toggleFullScreen();
    }
  }

  /**
   * Alterna el modo de pantalla completa.
   * Cambia el ícono y el título según el estado.
   */
  toggleFullScreen() {
    try {
      const icon = document.querySelector("#iconFS");
      const container = document.getElementById("iconFS-container");
      if (!icon || !container) return;
      if (!document.fullscreenElement) {
        icon.classList.remove("fas", "fa-expand");
        icon.classList.add("fas", "fa-compress");
        container.title = "Salir de pantalla completa";
        container.setAttribute('aria-pressed', 'true');
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        icon.classList.remove("fas", "fa-compress");
        icon.classList.add("fas", "fa-expand");
        container.title = "Pantalla completa";
        container.setAttribute('aria-pressed', 'false');
        document.exitFullscreen();
      }
    } catch (e) {
      console.error('Error al alternar pantalla completa:', e);
    }
  }
}
