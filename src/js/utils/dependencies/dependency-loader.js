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
      if (options.integrity) {
        link.integrity = options.integrity;
      }
      if (options.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
      }
      link.onload = resolve;
      link.onerror = () =>
        reject(new Error(`Unable to load stylesheet "${url}".`));
      document.head.appendChild(link);
    }).catch((error) => {
      this.stylePromises.delete(normalizedUrl);
      throw error;
    });

    this.stylePromises.set(normalizedUrl, promise);
    return promise;
  }
}

const appDependencies = new AppDependencyLoader({
  fancybox: {
    styles: [
      {
        url: "https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css",
        integrity:
          "sha384-Q8BgkilbsFGYNNiDqJm69hvDS7NCJWOodvfK/cwTyQD4VQA0qKzuPpvqNER1UC0F",
        crossOrigin: "anonymous",
      },
    ],
    scripts: [
      {
        url: "https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js",
        integrity:
          "sha384-Zm+UU4tdcfAm29vg+MTbfu//q5B/lInMbMCr4T8c9rQFyOv6PlfQYpB5wItcXWe7",
        crossOrigin: "anonymous",
      },
    ],
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
  jqueryUi: {
    styles: ["src/js/plugins/jquery/ui/jquery-ui.min.css"],
    scripts: ["src/js/plugins/jquery/ui/jquery-ui.min.js"],
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
  geoprocessingRuntime: {
    styles: [
      "src/js/components/geoprocessing/geoprocessing.css",
      "src/js/components/form-builder/form-builder.css",
    ],
    scripts: [
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

function ensureJqueryUi() {
  if (
    typeof jQuery !== "undefined" &&
    jQuery.ui &&
    typeof jQuery.fn.draggable === "function"
  ) {
    return Promise.resolve();
  }
  return appDependencies.load("jqueryUi");
}

function enableJqueryUiInteractions(
  selector,
  { draggable = null, resizable = null } = {},
) {
  return ensureJqueryUi()
    .then(() => {
      const element = jQuery(selector);
      if (element.length === 0) {
        return;
      }
      if (draggable !== null) {
        element.draggable(draggable);
      }
      if (resizable !== null) {
        element.resizable(resizable);
      }
    })
    .catch((error) => {
      console.error("Unable to enable UI interactions:", error);
    });
}
