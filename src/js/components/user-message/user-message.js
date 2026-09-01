/**
 * Clase para mostrar mensajes de usuario en pantalla de forma accesible y visible.
 * El mensaje se muestra como un aviso compacto en la esquina inferior derecha
 * y puede ser temporal o persistente.
 *
 * @class UserMessage
 */
class UserMessage {
  static STACK_ID = "user-message-stack";

  static getStack() {
    let stack = document.getElementById(UserMessage.STACK_ID);
    if (!stack) {
      stack = document.createElement("div");
      stack.id = UserMessage.STACK_ID;
      stack.className = "user-message-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  static removeEmptyStack(stack) {
    if (
      stack?.id === UserMessage.STACK_ID &&
      stack.children.length === 0
    ) {
      stack.remove();
    }
  }

  static remove(id) {
    const message = document.getElementById(id);
    const stack = message?.parentNode;
    message?.remove();
    UserMessage.removeEmptyStack(stack);
  }

  /**
   * Crea y muestra un mensaje en pantalla.
   * @param {string} message - Texto del mensaje a mostrar.
   * @param {boolean} isTemporary - Si es true, el mensaje se cierra automáticamente tras un tiempo.
   * @param {string} type - Tipo de mensaje (debe existir en MESSAGE_PROPERTIES).
   * @param {object} options - Identificador, acción y opciones de cierre del aviso.
   * @throws {Error} Si los parámetros son inválidos o el documento aún no tiene body.
   */
  constructor(message, isTemporary = true, type = "information", options = {}) {
    // Validación de parámetros de entrada
    if (!message || typeof message !== "string") {
      throw new Error("El mensaje debe ser un string no vacío.");
    }
    if (!MESSAGE_PROPERTIES[type]) {
      throw new Error("Tipo de mensaje inválido.");
    }
    if (!document.body) {
      throw new Error("No se encontró el cuerpo del documento.");
    }
    const messageProperties = MESSAGE_PROPERTIES[type];
    const {
      id,
      actionLabel,
      onAction,
      dismissible = true,
      closeLabel = "Cerrar mensaje",
    } = options;

    if (id) {
      UserMessage.remove(id);
    }
    const messageStack = UserMessage.getStack();

    // Crear el contenedor principal del mensaje
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container";
    if (id) messageContainer.id = id;
    messageContainer.dataset.messageType = type;
    messageContainer.setAttribute(
      "role",
      type === "information" ? "status" : "alert",
    );
    messageContainer.setAttribute(
      "aria-live",
      type === "information" ? "polite" : "assertive",
    );
    messageContainer.style.setProperty(
      "--message-accent",
      messageProperties.accent,
    );

    // El icono y el borde comunican el tipo sin cambiar el cuerpo del aviso.
    const typeIcon = document.createElement("i");
    typeIcon.className = `fa-solid ${messageProperties.icon} message-type-icon`;
    typeIcon.setAttribute("aria-hidden", "true");
    messageContainer.appendChild(typeIcon);

    // Crear el texto del mensaje
    const messageText = document.createElement("p");
    messageText.className = "non-selectable-text message-text";
    messageText.textContent = message;
    messageContainer.appendChild(messageText);

    if (actionLabel && typeof onAction === "function") {
      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "message-action-btn";
      actionBtn.textContent = actionLabel;
      actionBtn.addEventListener("click", onAction, { once: true });
      messageContainer.appendChild(actionBtn);
    }

    this.remove = (event) => {
      event?.stopPropagation();
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
      const currentStack = messageContainer.parentNode;
      messageContainer.remove();
      UserMessage.removeEmptyStack(currentStack);
    };

    if (dismissible) {
      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "message-close-btn";
      closeBtn.setAttribute("aria-label", closeLabel);
      closeBtn.title = closeLabel;
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.onclick = this.remove;
      messageContainer.appendChild(closeBtn);
    }

    messageStack.appendChild(messageContainer);
    this.element = messageContainer;

    // Si es temporal, configurar temporizador para eliminarlo automáticamente
    if (isTemporary) {
      this._timeout = setTimeout(this.remove, messageProperties.time || 3500);
    }
  }
}
