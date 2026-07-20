function addAnalytics(analyticsIds) {
  if (!Array.isArray(analyticsIds)) {
    console.warn("analytics_ids debe ser un arreglo de identificadores.");
    return Promise.resolve(false);
  }

  const validTagId = /^(G|GT|AW|DC)-[A-Z0-9]+$/i;
  const ids = [...new Set(
    analyticsIds
      .filter((id) => typeof id === "string")
      .map((id) => id.trim().toUpperCase())
      .filter(Boolean),
  )];
  const invalidIds = ids.filter((id) => !validTagId.test(id));

  if (invalidIds.length > 0) {
    console.warn(
      `Se ignoraron identificadores de Analytics inválidos: ${invalidIds.join(", ")}`,
    );
  }

  const configuredIds = ids.filter((id) => validTagId.test(id));
  if (configuredIds.length === 0) {
    return Promise.resolve(false);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window._argenmapAnalyticsIds = window._argenmapAnalyticsIds || new Set();

  if (window._argenmapAnalyticsIds.size === 0) {
    window.gtag("js", new Date());
  }
  configuredIds.forEach((id) => {
    if (!window._argenmapAnalyticsIds.has(id)) {
      window.gtag("config", id);
      window._argenmapAnalyticsIds.add(id);
    }
  });

  const existingScript = document.querySelector(
    'script[data-argenmap-analytics="true"]',
  );
  if (existingScript) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      configuredIds[0],
    )}`;
    script.dataset.argenmapAnalytics = "true";
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      console.warn(
        "No se pudo cargar Google Analytics. Puede estar bloqueado por el navegador, una extensión o la política de seguridad del sitio.",
      );
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
