class AppDependencyLoader {
  constructor(groups = {}) {
    this.groups = groups;
    this.groupPromises = new Map();
    this.scriptPromises = new Map();
    this.stylePromises = new Map();
  }

  load(groupName) {
    if (this.groupPromises.has(groupName)) {
      return this.groupPromises.get(groupName);
    }

    const group = this.groups[groupName];
    if (!group) {
      return Promise.reject(
        new Error(`Dependency group "${groupName}" is not registered.`),
      );
    }

    const promise = this._loadGroup(group).catch((error) => {
      this.groupPromises.delete(groupName);
      throw error;
    });
    this.groupPromises.set(groupName, promise);
    return promise;
  }

  async _loadGroup(group) {
    await Promise.all(
      (group.styles || []).map((asset) =>
        typeof asset === "string"
          ? this.loadStyle(asset)
          : this.loadStyle(asset.url, asset),
      ),
    );

    for (const asset of group.scripts || []) {
      if (typeof asset === "string") {
        await this.loadScript(asset);
      } else {
        await this.loadScript(asset.url, asset);
      }
    }
  }

  loadScript(url, options = {}) {
    const normalizedUrl = new URL(url, document.baseURI).href;
    if (this.scriptPromises.has(normalizedUrl)) {
      return this.scriptPromises.get(normalizedUrl);
    }

    const existingScript = Array.from(document.scripts).find(
      (script) => script.src === normalizedUrl,
    );
    if (existingScript) {
      const promise = Promise.resolve(existingScript);
      this.scriptPromises.set(normalizedUrl, promise);
      return promise;
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.type = options.type || "application/javascript";
      if (options.integrity) {
        script.integrity = options.integrity;
      }
      if (options.crossOrigin) {
        script.crossOrigin = options.crossOrigin;
      }
      script.dataset.argenmapDependency = "true";
      script.onload = () => resolve(script);
      script.onerror = () => {
        script.remove();
        reject(new Error(`Unable to load script "${url}".`));
      };

      const target =
        options.target === "body" && document.body
          ? document.body
          : document.head;
      target.appendChild(script);
    }).catch((error) => {
      this.scriptPromises.delete(normalizedUrl);
      throw error;
    });

    this.scriptPromises.set(normalizedUrl, promise);
    return promise;
  }

  loadStyle(url, options = {}) {
    const normalizedUrl = new URL(url, document.baseURI).href;
    if (this.stylePromises.has(normalizedUrl)) {
      return this.stylePromises.get(normalizedUrl);
    }

    const promise = new Promise((resolve, reject) => {
      const existingStyle = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      ).find((link) => link.href === normalizedUrl);

      if (existingStyle) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.dataset.argenmapDependency = "true";
      if (options.custom) {
        link.dataset.argenmapCustomStyle = "true";
      }
      if (options.integrity) {
        link.integrity = options.integrity;
      }
      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
      }
      if (options.media) {
        link.media = options.media;
      }
      link.onload = resolve;
      link.onerror = () =>
        reject(new Error(`Unable to load stylesheet "${url}".`));
      const firstCustomStyle = document.head.querySelector(
        'link[data-argenmap-custom-style="true"]',
      );
      if (!options.custom && firstCustomStyle) {
        document.head.insertBefore(link, firstCustomStyle);
      } else {
        document.head.appendChild(link);
      }
    }).catch((error) => {
      this.stylePromises.delete(normalizedUrl);
      throw error;
    });

    this.stylePromises.set(normalizedUrl, promise);
    return promise;
  }
}

function onDomReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }
  callback();
}

const appDependencies = new AppDependencyLoader({
  analytics: {
    scripts: ["src/js/utils/analytics/analytics.js"],
  },
  proj4: {
    scripts: [
      {
        url: "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.7.5/proj4.js",
        integrity:
          "sha384-Zg0HdUmZ2bCzgG1aXkCKAM1eMsRebKIhcsT+PUUYheMfD9zI1W2y1crkhDmuG5MA",
        crossOrigin: "anonymous",
      },
    ],
  },
  marked: {
    scripts: [
      "https://cdnjs.cloudflare.com/ajax/libs/marked/2.0.0/marked.min.js",
    ],
  },
  helpTourFeature: {
    styles: [
      "src/js/components/help/helpTour.css",
      "src/js/components/help/tooltipTourMaker.css",
    ],
    scripts: [
      "src/js/components/help/tooltipTourMaker.js",
      "src/js/components/help/helpTour.js",
    ],
  },
  accessibilityFeature: {
    styles: ["src/js/components/accessibility/accessibility.css"],
    scripts: ["src/js/components/accessibility/accessibility.js"],
  },
  loadLayerFeature: {
    styles: [
      "src/js/components/openfiles/openfiles.css",
      "src/js/components/loadServices/loadServices.css",
      "src/js/components/loadLayersModal/loadLayersModal.css",
    ],
    scripts: [
      "src/js/components/openfiles/openfiles.js",
      "src/js/components/loadServices/loadServices.js",
      "src/js/components/loadLayersModal/loadLayersModal.js",
    ],
  },
  mapControls: {
    styles: [
      "src/js/map/plugins/leaflet/leaflet-editable-label/Leaflet.EditableLabel.css",
    ],
    scripts: [
      "src/js/components/toolbar/toolbar.js",
      "src/js/map/plugins/leaflet/leaflet-editable-label/Leaflet.EditableLabel.js",
    ],
  },
  configWindow: {
    styles: ["src/js/components/config-tool/configTool.css"],
    scripts: ["src/js/components/config-tool/configWindow.js"],
  },
  table: {
    styles: [
      "src/js/plugins/tabulator/tabulator.min.css",
      "src/js/components/table/table.css",
    ],
    scripts: [
      "src/js/plugins/tabulator/tabulator.min.js",
      "src/js/components/table/Datatable.js",
      "src/js/components/table/UI.js",
      "src/js/components/table/table.js",
    ],
  },
  charts: {
    styles: ["src/js/components/charts/charts.css"],
    scripts: [
      "https://d3js.org/d3.v5.min.js",
      "src/js/components/charts/charts.js",
    ],
  },
  fileLayer: {
    scripts: [
      "src/js/plugins/FileLayer/omnivore/omnivore.min.js",
      "src/js/plugins/FileLayer/shapefile/shp.min.js",
      "src/js/plugins/FileLayer/FileLayer.js",
    ],
  },
  serviceLayers: {
    scripts: [
      "src/js/plugins/ServiceLayers/wms-capabilities.min.js",
      "src/js/plugins/ServiceLayers/ServiceLayers.js",
    ],
  },
  geoJsonMapLayer: {
    styles: [
      {
        url: "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.css",
        integrity:
          "sha384-AEGVifziKVWa9A1esNIKiYnrgmTqMcwVgTpjGTOm4i0uieet1Kc9jbOn/RCAc/zv",
        crossOrigin: "anonymous",
      },
    ],
    scripts: [
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet-ajax/2.1.0/leaflet.ajax.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.1/leaflet.awesome-markers.min.js",
    ],
  },
  wmsMapLayer: {
    scripts: [
      "src/js/map/plugins/leaflet/leaflet-wms/leaflet.wms.js",
      "src/js/components/consultData/consultData.js",
    ],
  },
  wmtsMapLayer: {
    scripts: [
      "src/js/map/plugins/leaflet/leaflet-wmts/leaflet-tilelayer-wmts.js",
    ],
  },
  bingMapLayer: {
    scripts: [
      "src/js/map/plugins/leaflet/leaflet-bing-layer-gh-pages/leaflet-bing-layer.js",
    ],
  },
  html2canvas: {
    scripts: ["src/js/plugins/html2canvas/html2canvas.min.js"],
  },
  pdfExport: {
    scripts: [
      "https://unpkg.com/leaflet-image@0.4.0/leaflet-image.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js",
      "src/js/plugins/html2canvas/html2canvas.min.js",
    ],
  },
  turf: {
    scripts: ["src/js/plugins/turf/turf.min.js"],
  },
  vectorLabels: {
    scripts: [
      "src/js/map/plugins/leaflet/leaflet-textpath/leaflet-textpath.js",
    ],
  },
  geoprocessingRuntime: {
    styles: [
      "src/js/components/geoprocessing/geoprocessing.css",
      "src/js/components/form-builder/form-builder.css",
    ],
    scripts: [
      "src/js/map/plugins/leaflet/leaflet-textpath/leaflet-textpath.js",
      "src/js/plugins/turf/turf.min.js",
      "src/js/plugins/geoprocess-executor/geoprocess-executor.js",
      "src/js/components/form-builder/form-builder.js",
      "src/js/components/geoprocessing/IHeight.js",
      "src/js/components/elevation-profile/elevation-profile.js",
    ],
  },
  highcharts: {
    scripts: [
      "https://cdn.jsdelivr.net/npm/highcharts@13.0.0/highcharts.js",
      "https://cdn.jsdelivr.net/npm/highcharts@13.0.0/modules/exporting.js",
      "src/js/plugins/highcharts.theme.js",
    ],
  },
});

function enableNativeInteractions(
  selector,
  { draggable = null, resizable = null } = {},
) {
  const element = document.querySelector(selector);
  if (!element) return;

  if (draggable !== null && !element.dataset.nativeDraggable) {
    element.dataset.nativeDraggable = "true";
    element.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(
        draggable.cancel || "input, textarea, select, button, a, .ag-btn",
      )) return;

      const startRect = element.getBoundingClientRect();
      const containment = draggable.containment
        ? document.querySelector(draggable.containment)
        : null;
      const bounds = containment?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
      const startX = event.clientX;
      const startY = event.clientY;
      element.setPointerCapture(event.pointerId);

      const move = (moveEvent) => {
        const left = Math.min(
          Math.max(bounds.left, startRect.left + moveEvent.clientX - startX),
          bounds.right - startRect.width,
        );
        const top = Math.min(
          Math.max(bounds.top, startRect.top + moveEvent.clientY - startY),
          bounds.bottom - startRect.height,
        );
        element.style.position = "fixed";
        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
        element.style.right = "auto";
        element.style.bottom = "auto";
      };
      const stop = () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", stop);
        element.removeEventListener("pointercancel", stop);
      };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", stop);
      element.addEventListener("pointercancel", stop);
    });
  }

  if (resizable !== null && !element.dataset.nativeResizable) {
    element.dataset.nativeResizable = "true";
    if (getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }
    const directions = (resizable.handles || "e, s, se")
      .split(",")
      .map((direction) => direction.trim());
    directions.forEach((direction) => {
      const handle = document.createElement("span");
      handle.className = `argenmap-resize-handle argenmap-resize-${direction}`;
      handle.dataset.direction = direction;
      element.appendChild(handle);
      handle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const startRect = element.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const containment = resizable.containment
          ? document.querySelector(resizable.containment)
          : null;
        const bounds = containment?.getBoundingClientRect();
        handle.setPointerCapture(event.pointerId);
        const move = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          let width = startRect.width;
          let height = startRect.height;
          if (direction.includes("e")) width += deltaX;
          if (direction.includes("w")) width -= deltaX;
          if (direction.includes("s")) height += deltaY;
          width = Math.max(resizable.minWidth || 0, width);
          height = Math.max(resizable.minHeight || 0, height);
          if (resizable.maxWidth) width = Math.min(resizable.maxWidth, width);
          if (resizable.maxHeight) height = Math.min(resizable.maxHeight, height);
          if (bounds) {
            if (direction.includes("e")) {
              width = Math.min(width, bounds.right - startRect.left);
            }
            if (direction.includes("w")) {
              width = Math.min(width, startRect.right - bounds.left);
            }
            if (direction.includes("s")) {
              height = Math.min(height, bounds.bottom - startRect.top);
            }
          }
          element.style.width = `${width}px`;
          element.style.height = `${height}px`;
          if (direction.includes("w")) {
            element.style.left = `${startRect.right - width}px`;
          }
        };
        const stop = () => {
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", stop);
          handle.removeEventListener("pointercancel", stop);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);
      });
    });
  }
}
