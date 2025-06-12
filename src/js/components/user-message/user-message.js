/**
 * Clase para mostrar mensajes de usuario en pantalla de forma accesible y visible.
 * El mensaje se muestra centrado, un poco por debajo del centro, y puede ser temporal o persistente.
 *
 * @class UserMessage
 */
class UserMessage {
  /**
   * Crea y muestra un mensaje en pantalla.
   * @param {string} message - Texto del mensaje a mostrar.
   * @param {boolean} isTemporary - Si es true, el mensaje se cierra automáticamente tras un tiempo.
   * @param {string} type - Tipo de mensaje (debe existir en MESSAGE_PROPERTIES).
   * @throws {Error} Si los parámetros son inválidos o falta el contenedor principal.
   */
  constructor(message, isTemporary, type) {
    // Validación de parámetros de entrada
    if (!message || typeof message !== 'string') {
      throw new Error('El mensaje debe ser un string no vacío.');
    }
    if (!MESSAGE_PROPERTIES[type]) {
      throw new Error('Tipo de mensaje inválido.');
    }
    const mapa = document.getElementById('mapa');
    if (!mapa) {
      throw new Error('No se encontró el contenedor principal (mapa).');
    }
    // Elimina cualquier mensaje anterior para evitar superposiciones
    const oldMessages = document.getElementsByClassName('message-container');
    if (oldMessages.length > 0) {
      Array.from(oldMessages).forEach(msg => {
        msg.remove();
      });
    }
    // Crear el contenedor principal del mensaje
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    messageContainer.setAttribute('role', 'alert'); // Accesibilidad: rol de alerta
    messageContainer.setAttribute('aria-live', 'assertive'); // Accesibilidad: lectura inmediata
    messageContainer.style.background = MESSAGE_PROPERTIES[type].background;
    // Posicionamiento visual centrado y destacado
    messageContainer.style.position = 'fixed';
    messageContainer.style.left = '50%';
    messageContainer.style.top = '60%';
    messageContainer.style.transform = 'translate(-50%, -50%)';
    messageContainer.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
    messageContainer.style.padding = '1.5rem 2.5rem';
    messageContainer.style.zIndex = '10000';
    messageContainer.style.maxWidth = '90vw';
    // Crear el texto del mensaje
    const messageText = document.createElement('p');
    messageText.className = 'non-selectable-text message-text';
    messageText.textContent = message;
    messageText.style.color = MESSAGE_PROPERTIES[type].text;
    messageText.style.fontSize = '1.25em';
    messageText.style.textShadow = '0 1px 2px #0008';
    messageText.style.margin = '0 1.5rem 0 0';
    messageContainer.appendChild(messageText);
    // Crear botón de cierre accesible
    const closeBtn = document.createElement('div');
    closeBtn.className = 'message-close-btn';
    closeBtn.setAttribute('tabindex', '0'); // Permite foco con teclado
    closeBtn.setAttribute('aria-label', 'Cerrar mensaje');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    /**
     * Elimina el mensaje del DOM.
     * @param {Event} [e] - Evento opcional para detener propagación.
     */
    const removeMessage = (e) => {
      e && e.stopPropagation();
      messageContainer.remove();
    };
    closeBtn.onclick = removeMessage;
    // Permite cerrar con Enter o Espacio
    closeBtn.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') removeMessage(e);
    };
    messageContainer.appendChild(closeBtn);
    // Añadir el mensaje al DOM
    mapa.appendChild(messageContainer);
    // Si es temporal, configurar temporizador para eliminarlo automáticamente
    if (isTemporary) {
      this._timeout = setTimeout(() => {
        if (messageContainer && messageContainer.parentNode) {
          messageContainer.remove();
        }
      }, MESSAGE_PROPERTIES[type].time || 3500);
    }
  }
};
