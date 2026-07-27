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
    await Promise.all((group.styles || []).map((url) => this.loadStyle(url)));

    for (const url of group.scripts || []) {
      await (group.useScriptTags
        ? this.loadScriptTag(url)
        : this.loadScript(url));
    }
  }

  loadScript(url) {
    if (this.scriptPromises.has(url)) {
      return this.scriptPromises.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      $.getScript(url)
        .done(resolve)
        .fail((_request, _settings, error) => {
          reject(new Error(`Unable to load script "${url}": ${error}`));
        });
    }).catch((error) => {
      this.scriptPromises.delete(url);
      throw error;
    });

    this.scriptPromises.set(url, promise);
    return promise;
  }

  loadScriptTag(url) {
    if (this.scriptPromises.has(url)) {
      return this.scriptPromises.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Unable to load script "${url}".`));
      document.head.appendChild(script);
    }).catch((error) => {
      this.scriptPromises.delete(url);
      throw error;
    });

    this.scriptPromises.set(url, promise);
    return promise;
  }

  loadStyle(url) {
    if (this.stylePromises.has(url)) {
      return this.stylePromises.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      const existingStyle = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
      ).find((link) => link.getAttribute("href") === url);

      if (existingStyle) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.onload = resolve;
      link.onerror = () =>
        reject(new Error(`Unable to load stylesheet "${url}".`));
      document.head.appendChild(link);
    }).catch((error) => {
      this.stylePromises.delete(url);
      throw error;
    });

    this.stylePromises.set(url, promise);
    return promise;
  }
}

const appDependencies = new AppDependencyLoader({
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
      "src/js/components/table/TouchPunch.js",
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
    useScriptTags: true,
    scripts: [
      "https://cdn.jsdelivr.net/npm/highcharts@13.0.0/highcharts.js",
      "https://cdn.jsdelivr.net/npm/highcharts@13.0.0/modules/exporting.js",
      "src/js/plugins/highcharts.theme.js",
    ],
  },
});
