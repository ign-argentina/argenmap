(function initializePwaSupport() {
  "use strict";

  const buildMetadata = document.querySelector('meta[name="argenmap-build"]');
  if (buildMetadata?.content !== "production") {
    return;
  }

  const translations = {
    es: {
      updateAvailable: "Hay una nueva versión de Argenmap disponible.",
      updateAction: "Actualizar",
      dismissAction: "Cerrar",
      offline: "Sin conexión. Se muestra el contenido disponible sin conexión.",
      installAction: "Instalar Argenmap",
      iosInstallInstructions:
        "Para instalar Argenmap, abrí Compartir y elegí “Agregar a pantalla de inicio”.",
      browserInstallInstructions:
        "Para instalar Argenmap, abrí el menú del navegador y elegí “Instalar” o “Agregar a pantalla principal”.",
    },
    en: {
      updateAvailable: "A new version of Argenmap is available.",
      updateAction: "Update",
      dismissAction: "Dismiss",
      offline: "You are offline. Available offline content is being shown.",
      installAction: "Install Argenmap",
      iosInstallInstructions:
        "To install Argenmap, open Share and choose “Add to Home Screen”.",
      browserInstallInstructions:
        "To install Argenmap, open the browser menu and choose “Install” or “Add to Home Screen”.",
    },
  };
  const language = document.documentElement.lang?.toLowerCase().split("-")[0];
  const messages = translations[language] || translations.en;
  const serviceWorkerFallbackDelay = 15000;
  const serviceWorkerIdleTimeout = 3000;
  let reloadRequested = false;
  let deferredInstallPrompt = null;

  function isRunningStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIosDevice() {
    return (
      /iPad|iPhone|iPod/iu.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  function isMobileDevice() {
    return (
      navigator.userAgentData?.mobile === true ||
      /Android|iPad|iPhone|iPod/iu.test(navigator.userAgent)
    );
  }

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

  function createInstallButton() {
    const toolbar = document.getElementById("botonera");
    if (!toolbar || document.getElementById("install-pwa-btn")) {
      return document.getElementById("install-pwa-btn");
    }

    const button = document.createElement("button");
    button.id = "install-pwa-btn";
    button.type = "button";
    button.className = "ag-btn ag-btn-primary pwa-install-button";
    button.title = messages.installAction;
    button.setAttribute("aria-label", messages.installAction);
    button.hidden = true;

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    icon.classList.add("pwa-install-icon");

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("d", "M12 3v11m0 0 4-4m-4 4-4-4");
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("stroke-linecap", "round");
    arrow.setAttribute("stroke-linejoin", "round");

    const tray = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tray.setAttribute("d", "M5 17v3h14v-3");
    tray.setAttribute("fill", "none");
    tray.setAttribute("stroke", "currentColor");
    tray.setAttribute("stroke-width", "2");
    tray.setAttribute("stroke-linecap", "round");
    tray.setAttribute("stroke-linejoin", "round");

    icon.append(arrow, tray);
    button.appendChild(icon);
    toolbar.appendChild(button);
    return button;
  }

  const installButton = createInstallButton();

  function setInstallButtonVisible(isVisible) {
    if (installButton) {
      installButton.hidden = !isVisible || isRunningStandalone();
    }
  }

  function showManualInstallInstructions() {
    createNotice({
      id: "pwa-install-notice",
      message: isIosDevice()
        ? messages.iosInstallInstructions
        : messages.browserInstallInstructions,
      persistent: false,
    });
  }

  async function requestInstallation() {
    if (!deferredInstallPrompt) {
      showManualInstallInstructions();
      return;
    }

    const installPrompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    setInstallButtonVisible(false);

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (error) {
      console.warn("Unable to show the Argenmap install prompt:", error);
      showManualInstallInstructions();
    }
  }

  installButton?.addEventListener("click", requestInstallation);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    setInstallButtonVisible(true);
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    setInstallButtonVisible(false);
    removeNotice("pwa-install-notice");
  });

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

  function runWhenBrowserIsIdle(callback) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, {
        timeout: serviceWorkerIdleTimeout,
      });
      return;
    }
    window.setTimeout(callback, 0);
  }

  function scheduleServiceWorkerRegistration() {
    let registrationScheduled = false;
    let fallbackTimer = null;

    const registerWhenIdle = () => {
      if (registrationScheduled) {
        return;
      }
      registrationScheduled = true;
      if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
      }
      runWhenBrowserIsIdle(registerServiceWorker);
    };

    const startFallbackTimer = () => {
      if (!registrationScheduled) {
        fallbackTimer = window.setTimeout(
          registerWhenIdle,
          serviceWorkerFallbackDelay,
        );
      }
    };

    window.addEventListener(ARGENMAP_EVENTS.MAP_READY, registerWhenIdle, {
      once: true,
    });
    if (document.readyState === "complete") {
      startFallbackTimer();
    } else {
      window.addEventListener("load", startFallbackTimer, { once: true });
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadRequested) {
        window.location.reload();
      }
    });
    scheduleServiceWorkerRegistration();
  }
  window.addEventListener("online", updateNetworkNotice);
  window.addEventListener("offline", updateNetworkNotice);
  window.addEventListener(
    "load",
    () => {
      if (
        !isRunningStandalone() &&
        (isIosDevice() ||
          (isMobileDevice() && !("onbeforeinstallprompt" in window)))
      ) {
        setInstallButtonVisible(true);
      }
    },
    { once: true },
  );
  updateNetworkNotice();
})();
