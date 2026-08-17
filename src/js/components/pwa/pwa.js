(function initializePwaSupport() {
  "use strict";

  const buildMetadata = document.querySelector('meta[name="argenmap-build"]');
  if (
    buildMetadata?.content !== "production" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const translations = {
    es: {
      updateAvailable: "Hay una nueva versión de Argenmap disponible.",
      updateAction: "Actualizar",
      dismissAction: "Cerrar",
      offline: "Sin conexión. Se muestra el contenido disponible sin conexión.",
    },
    en: {
      updateAvailable: "A new version of Argenmap is available.",
      updateAction: "Update",
      dismissAction: "Dismiss",
      offline: "You are offline. Available offline content is being shown.",
    },
  };
  const language = document.documentElement.lang?.toLowerCase().split("-")[0];
  const messages = translations[language] || translations.en;
  let reloadRequested = false;

  function removeNotice(id) {
    document.getElementById(id)?.remove();
  }

  function createNotice({ id, message, actionLabel, onAction, persistent }) {
    removeNotice(id);

    const notice = document.createElement("div");
    notice.id = id;
    notice.className = "pwa-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");

    const text = document.createElement("span");
    text.textContent = message;
    notice.appendChild(text);

    if (actionLabel && onAction) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "pwa-notice-action";
      action.textContent = actionLabel;
      action.addEventListener("click", onAction, { once: true });
      notice.appendChild(action);
    }

    if (!persistent) {
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "pwa-notice-dismiss";
      dismiss.textContent = "×";
      dismiss.title = messages.dismissAction;
      dismiss.setAttribute("aria-label", messages.dismissAction);
      dismiss.addEventListener("click", () => notice.remove(), { once: true });
      notice.appendChild(dismiss);
    }

    document.body.appendChild(notice);
    return notice;
  }

  function showUpdateNotice(worker) {
    if (!worker || document.getElementById("pwa-update-notice")) {
      return;
    }

    createNotice({
      id: "pwa-update-notice",
      message: messages.updateAvailable,
      actionLabel: messages.updateAction,
      onAction: () => {
        reloadRequested = true;
        worker.postMessage({ type: "SKIP_WAITING" });
      },
      persistent: false,
    });
  }

  function updateNetworkNotice() {
    if (navigator.onLine) {
      removeNotice("pwa-network-notice");
      return;
    }

    createNotice({
      id: "pwa-network-notice",
      message: messages.offline,
      persistent: true,
    });
  }

  async function registerServiceWorker() {
    try {
      const serviceWorkerUrl = new URL("service-worker.js", document.baseURI);
      const scopeUrl = new URL("./", document.baseURI);
      const registration = await navigator.serviceWorker.register(
        serviceWorkerUrl,
        {
          scope: scopeUrl.href,
          updateViaCache: "none",
        },
      );

      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdateNotice(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) {
          return;
        }

        worker.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateNotice(worker);
          }
        });
      });
    } catch (error) {
      console.warn("Unable to register the Argenmap service worker:", error);
    }
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadRequested) {
      window.location.reload();
    }
  });
  window.addEventListener("online", updateNetworkNotice);
  window.addEventListener("offline", updateNetworkNotice);
  window.addEventListener("load", registerServiceWorker, { once: true });
  updateNetworkNotice();
})();
